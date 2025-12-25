import prisma from "@/lib/prisma";
import {
    ExecutionEnv,
    ExecutionStep,
    NodeSpawnConfig,
    PauseReason,
    StepExecutor,
    StepResult,
    StepStatus,
} from "./types";
import { Browser, Page } from "puppeteer";
import { createLogCollector } from "@/lib/log";
import { LogCollector } from "@/lib/types";

/**
 * Engine V2 Runtime Scheduler
 * Replaces the static phase-based execution loop from Engine V1
 */

interface SchedulerContext {
    executionId: string;
    userId: string;
    browser?: Browser;
    page?: Page;
    stepOutputs: Map<string, Record<string, string>>; // nodeId -> outputs
    browserContexts: Map<string, { context: any; page: Page }>; // stepId -> isolated context
}

/**
 * Main scheduler entry point
 * Replaces the phase loop in executeWorkflow.ts
 */
export async function runScheduler(executionId: string): Promise<void> {
    const context: SchedulerContext = {
        executionId,
        userId: "",
        stepOutputs: new Map(),
        browserContexts: new Map(), // For isolated parallel execution
    };

    // Load execution and initialize
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: { workflow: true },
    });

    if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
    }

    context.userId = execution.userId;

    let executionFailed = false;
    let executionPaused = false;

    try {
        // Main scheduler loop
        while (!executionFailed && !executionPaused) {
            const runnableSteps = await findRunnableSteps(executionId);

            if (runnableSteps.length === 0) {
                // No more runnable steps - execution complete or blocked
                break;
            }

            // Execute runnable steps in parallel
            // Engine V2 supports parallel execution for independent branches
            const results = await Promise.all(
                runnableSteps.map((step) => executeStep(step, context))
            );

            // Check if any step failed or paused
            for (const result of results) {
                if (result === "FAILED") {
                    executionFailed = true;
                    break;
                } else if (result === "PAUSED") {
                    executionPaused = true;
                    break;
                }
            }
        }

        // Finalize execution
        await finalizeExecution(
            executionId,
            execution.workflowId,
            executionFailed,
            executionPaused,
            context
        );
    } catch (error: any) {
        console.error("Scheduler error:", error);
        await finalizeExecution(
            executionId,
            execution.workflowId,
            true,
            false,
            context
        );
    } finally {
        // Cleanup browser resources
        await cleanupContext(context);
    }
}

/**
 * Evaluate if an edge condition is satisfied
 * @param parentStep The parent step (e.g., CONDITION node)
 * @param edgeCondition The condition on the edge ('true'|'false'|null)
 * @returns true if the edge should be followed
 */
function evaluateEdgeCondition(
    parentStep: any,
    edgeCondition: "true" | "false" | null
): boolean {
    // If no edge condition, always follow (backwards compatibility)
    if (edgeCondition === null || edgeCondition === undefined) {
        return true;
    }

    // Get parent step's output
    const outputs = JSON.parse(parentStep.outputs || "{}");
    const parentResult = outputs.result;

    // For CONDITION nodes, check if result matches edge condition
    if (parentStep.nodeType === "CONDITION") {
        return parentResult === edgeCondition;
    }

    // For other node types, null edge condition means always follow
    return edgeCondition === null;
}

/**
 * Find steps that are ready to execute
 * A step is runnable if:
 * - Status is PENDING
 * - All dependencies are COMPLETED
 * - Edge conditions are satisfied (for CONDITION branching)
 */
async function findRunnableSteps(executionId: string): Promise<any[]> {
    const steps = await prisma.executionStep.findMany({
        where: { executionId },
    });

    const runnableSteps = [];

    for (const step of steps) {
        if (step.status !== StepStatus.PENDING) {
            continue;
        }

        // Check if all dependencies are completed
        const dependencies = JSON.parse(step.dependencies) as string[];
        const allDependenciesCompleted = dependencies.every((depNodeId) => {
            const depStep = steps.find((s) => s.nodeId === depNodeId);
            return depStep?.status === StepStatus.COMPLETED;
        });

        if (!allDependenciesCompleted) {
            continue;
        }

        // Check edge conditions for each dependency
        // Edge conditions are stored in step metadata
        let edgeConditionsSatisfied = true;

        // TODO: In full implementation, edge conditions will be stored per dependency
        // For now, we'll check if any parent is a CONDITION node and validate accordingly
        for (const depNodeId of dependencies) {
            const depStep = steps.find((s) => s.nodeId === depNodeId);
            if (depStep && depStep.nodeType === "CONDITION") {
                // Check if this step should run based on CONDITION result
                // Edge condition metadata would be stored in the step or workflow definition
                // For MVP, we assume edge condition is embedded in step metadata
                const stepMetadata = JSON.parse(
                    (step as any).metadata || "{}"
                );
                const edgeCondition = stepMetadata.edgeConditions?.[depNodeId];

                if (
                    edgeCondition &&
                    !evaluateEdgeCondition(depStep, edgeCondition)
                ) {
                    edgeConditionsSatisfied = false;

                    // Mark this step as SKIPPED since its edge condition failed
                    await prisma.executionStep.update({
                        where: { id: step.id },
                        data: {
                            status: StepStatus.SKIPPED,
                            completedAt: new Date(),
                        },
                    });
                    break;
                }
            }
        }

        if (edgeConditionsSatisfied) {
            runnableSteps.push(step);
        }
    }

    return runnableSteps;
}

/**
 * Execute a single step
 * Returns the execution outcome
 */
async function executeStep(
    step: any,
    context: SchedulerContext
): Promise<"SUCCESS" | "FAILED" | "PAUSED"> {
    const logCollector = createLogCollector();

    try {
        logCollector.info(`========== Starting Step Execution ==========`);
        logCollector.info(`Step ID: ${step.id}`);
        logCollector.info(`Node ID: ${step.nodeId}`);
        logCollector.info(`Node Type: ${step.nodeType}`);
        logCollector.info(`Raw Inputs: ${step.inputs}`);

        // Update step to RUNNING
        await prisma.executionStep.update({
            where: { id: step.id },
            data: {
                status: StepStatus.RUNNING,
                startedAt: new Date(),
            },
        });
        logCollector.info(`Step status updated to RUNNING`);


        // Get executor for this node type
        logCollector.info(`Looking up executor for type: ${step.nodeType}`);
        const { getExecutor } = await import("./ExecutorRegistry");
        const executor = getExecutor(step.nodeType);

        if (!executor) {
            logCollector.error(`❌ Executor not found for ${step.nodeType}`);
            await handleStepFailure(step, "Executor not found", context, logCollector);
            return "FAILED";
        }
        logCollector.info(`✅ Executor found for ${step.nodeType}`);


        // Reserve credits
        logCollector.info(`Reserving ${step.creditsReserved} credits...`);
        const creditsReserved = await reserveCredits(step, logCollector);
        if (!creditsReserved) {
            logCollector.error("❌ Insufficient credits");
            await handleStepFailure(step, "Insufficient credits", context, logCollector);
            return "FAILED";
        }
        logCollector.info(`✅ Credits reserved successfully`);


        // Prepare execution environment
        logCollector.info(`Creating execution environment...`);
        const env = await createExecutionEnv(step, context, logCollector);

        // Store resolved inputs back to the database for display in UI
        logCollector.info(`Resolving inputs for database storage...`);
        const resolvedInputsForStep = JSON.parse(step.inputs || "{}");
        const execution = await prisma.workflowExecution.findUnique({
            where: { id: context.executionId },
            select: { definition: true },
        });
        const flow = JSON.parse(execution?.definition || "{}");
        const edges = flow.edges || [];
        const incomingEdges = edges.filter((edge: any) => edge.target === step.nodeId);

        logCollector.info(`Found ${incomingEdges.length} incoming edges`);

        for (const edge of incomingEdges) {
            if (!resolvedInputsForStep[edge.targetHandle]) {
                const sourceOutputs = context.stepOutputs.get(edge.source);
                if (sourceOutputs && sourceOutputs[edge.sourceHandle]) {
                    resolvedInputsForStep[edge.targetHandle] = sourceOutputs[edge.sourceHandle];
                    logCollector.info(`Resolved ${edge.targetHandle} from ${edge.source}.${edge.sourceHandle}`);
                }
            }
        }

        const finalResolvedInputs = resolveInputParameters(resolvedInputsForStep, context);
        logCollector.info(`Final resolved inputs: ${JSON.stringify(finalResolvedInputs)}`);

        // Update step with resolved inputs
        await prisma.executionStep.update({
            where: { id: step.id },
            data: { inputs: JSON.stringify(finalResolvedInputs) },
        });
        logCollector.info(`Updated database with resolved inputs`);


        // Execute the step
        logCollector.info(`Executing step with executor...`);
        const result = await executor(env);
        logCollector.info(`Executor returned: ${result.type}`);

        // Handle result
        if (result.type === "success") {
            logCollector.info(`✅ Step completed successfully`);
            logCollector.info(`Outputs: ${JSON.stringify(result.outputs)}`);
            await handleStepSuccess(step, result, context, logCollector);
            return "SUCCESS";
        } else if (result.type === "pause") {
            logCollector.info(`⏸️ Step paused: ${result.reason.message}`);
            await handleStepPause(step, result, context, logCollector);
            return "PAUSED";
        } else {
            logCollector.error(`❌ Step failed: ${result.error}`);
            await handleStepFailure(step, result.error, context, logCollector);
            return "FAILED";
        }
    } catch (error: any) {
        logCollector.error(`❌ Step execution error: ${error.message}`);
        logCollector.error(`Stack trace: ${error.stack}`);
        await handleStepFailure(step, error.message, context, logCollector);
        return "FAILED";
    }
}

/**
 * Handle successful step execution
 */
async function handleStepSuccess(
    step: any,
    result: StepResult & { type: "success" },
    context: SchedulerContext,
    logCollector: LogCollector
): Promise<void> {
    // Store outputs for downstream steps
    context.stepOutputs.set(step.nodeId, result.outputs);

    // Update step in database
    await prisma.executionStep.update({
        where: { id: step.id },
        data: {
            status: StepStatus.COMPLETED,
            completedAt: new Date(),
            outputs: JSON.stringify(result.outputs),
            creditsConsumed: step.creditsReserved,
            logs: {
                createMany: {
                    data: logCollector.getAll().map((log) => ({
                        message: log.message,
                        timestamp: log.timeStamp,
                        level: log.level,
                    })),
                },
            },
        },
    });
}

/**
 * Handle step pause (approval gates, etc.)
 */
async function handleStepPause(
    step: any,
    result: StepResult & { type: "pause" },
    context: SchedulerContext,
    logCollector: LogCollector
): Promise<void> {
    await prisma.executionStep.update({
        where: { id: step.id },
        data: {
            status: StepStatus.WAITING,
            pauseReason: JSON.stringify(result.reason),
            logs: {
                createMany: {
                    data: logCollector.getAll().map((log) => ({
                        message: log.message,
                        timestamp: log.timeStamp,
                        level: log.level,
                    })),
                },
            },
        },
    });

    // Update execution to WAITING state
    await prisma.workflowExecution.update({
        where: { id: context.executionId },
        data: { status: "WAITING" },
    });
}

/**
 * Handle step failure
 */
async function handleStepFailure(
    step: any,
    error: string,
    context: SchedulerContext,
    logCollector?: LogCollector
): Promise<void> {
    // Refund reserved credits
    if (step.creditsReserved > 0) {
        await prisma.userBalance.upsert({
            where: { userId: context.userId },
            update: { credits: { increment: step.creditsReserved } },
            create: {
                userId: context.userId,
                credits: step.creditsReserved, // Start with refunded credits
            },
        });
    }


    await prisma.executionStep.update({
        where: { id: step.id },
        data: {
            status: StepStatus.FAILED,
            completedAt: new Date(),
            error,
            creditsConsumed: 0, // No charge for failed steps
            ...(logCollector && {
                logs: {
                    createMany: {
                        data: logCollector.getAll().map((log) => ({
                            message: log.message,
                            timestamp: log.timeStamp,
                            level: log.level,
                        })),
                    },
                },
            }),
        },
    });
}

/**
 * Reserve credits for step execution
 */
async function reserveCredits(
    step: any,
    logCollector: LogCollector
): Promise<boolean> {
    if (step.creditsReserved === 0) {
        return true; // No credits required
    }

    const userBalance = await prisma.userBalance.findUnique({
        where: { userId: step.userId },
    });

    if (!userBalance) {
        logCollector.error(
            `No UserBalance record found for user ${step.userId}. Creating one with 0 credits.`
        );

        // Create UserBalance with 0 credits if it doesn't exist
        await prisma.userBalance.create({
            data: {
                userId: step.userId,
                credits: 0,
            },
        });

        logCollector.error(
            `Insufficient credits: required ${step.creditsReserved}, available 0`
        );
        return false;
    }

    if (userBalance.credits < step.creditsReserved) {
        logCollector.error(
            `Insufficient credits: required ${step.creditsReserved}, available ${userBalance.credits}`
        );
        return false;
    }

    // Deduct credits immediately (reservation)
    await prisma.userBalance.update({
        where: { userId: step.userId },
        data: { credits: { decrement: step.creditsReserved } },
    });

    return true;
}


/**
 * Resolve parameter references in input values
 * Handles syntax like {NODE_ID.outputName}
 */
function resolveInputParameters(
    stepInputs: Record<string, string>,
    context: SchedulerContext
): Record<string, string> {
    const resolved: Record<string, string> = {};

    for (const [key, value] of Object.entries(stepInputs)) {
        if (!value) {
            resolved[key] = value;
            continue;
        }

        // Check if value contains parameter reference: {NODE_ID.outputName}
        const paramRegex = /\{([^.]+)\.([^}]+)\}/g;
        let resolvedValue = value;
        let match;

        while ((match = paramRegex.exec(value)) !== null) {
            const [fullMatch, nodeId, outputName] = match;
            const nodeOutputs = context.stepOutputs.get(nodeId);

            if (nodeOutputs && nodeOutputs[outputName]) {
                resolvedValue = resolvedValue.replace(
                    fullMatch,
                    nodeOutputs[outputName]
                );
            }
        }

        resolved[key] = resolvedValue;
    }

    return resolved;
}

/**
 * Get resolved inputs for a step
 * Combines manual inputs with edge-connected outputs
 */
async function getResolvedInputs(
    step: any,
    context: SchedulerContext
): Promise<Record<string, string>> {
    const stepInputs = JSON.parse(step.inputs || "{}");
    console.log(`[DEBUG] getResolvedInputs - Initial inputs:`, stepInputs);

    // Get edges from execution definition
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: context.executionId },
        select: { definition: true },
    });

    const flow = JSON.parse(execution?.definition || "{}");
    const edges = flow.edges || [];

    // Find edges targeting this node
    const incomingEdges = edges.filter((edge: any) => edge.target === step.nodeId);
    console.log(`[DEBUG] getResolvedInputs - Found ${incomingEdges.length} incoming edges`);

    const resolved = { ...stepInputs };

    // For each incoming edge, if the target input is empty, fill from source output
    for (const edge of incomingEdges) {
        const targetHandle = edge.targetHandle; // The input name
        const sourceHandle = edge.sourceHandle; // The output name
        const sourceNodeId = edge.source;

        console.log(`[DEBUG] getResolvedInputs - Checking edge: ${sourceNodeId}.${sourceHandle} -> ${targetHandle}`);

        // Only auto-fill if the input is empty
        if (!resolved[targetHandle]) {
            const sourceOutputs = context.stepOutputs.get(sourceNodeId);
            console.log(`[DEBUG] getResolvedInputs - Source outputs:`, sourceOutputs);

            if (sourceOutputs && sourceOutputs[sourceHandle]) {
                resolved[targetHandle] = sourceOutputs[sourceHandle];
                console.log(`[DEBUG] getResolvedInputs - Resolved ${targetHandle} = ${sourceOutputs[sourceHandle]}`);
            } else {
                console.log(`[DEBUG] getResolvedInputs - Could not resolve ${targetHandle} from ${sourceNodeId}.${sourceHandle}`);
            }
        } else {
            console.log(`[DEBUG] getResolvedInputs - ${targetHandle} already has value: ${resolved[targetHandle]}`);
        }
    }

    // Also resolve {NODE_ID.output} syntax in values
    const finalResolved = resolveInputParameters(resolved, context);
    console.log(`[DEBUG] getResolvedInputs - Final resolved:`, finalResolved);

    return finalResolved;
}

/**
 * Create execution environment for a step
 */
async function createExecutionEnv(
    step: any,
    context: SchedulerContext,
    logCollector: LogCollector
): Promise<ExecutionEnv> {
    // Resolve inputs from edges and parameter references
    const resolvedInputs = await getResolvedInputs(step, context);
    const outputs: Record<string, string> = {};

    // Log resolved inputs for debugging
    logCollector.info(`Resolved inputs: ${JSON.stringify(resolvedInputs)}`);

    return {
        executionId: context.executionId,
        stepId: step.id,
        nodeId: step.nodeId,
        userId: context.userId,

        getInput: (name: string) => resolvedInputs[name],
        setOutput: (name: string, value: string) => {
            outputs[name] = value;
        },

        getBrowser: () => context.browser,
        setBrowser: (browser: Browser) => {
            context.browser = browser;
        },
        getPage: () => context.page,
        setPage: (page: Page) => {
            context.page = page;
        },

        log: logCollector,

        pause: (reason: PauseReason) => {
            // This will be handled by the executor returning a pause result
            logCollector.info(
                `Pause requested: ${reason.type} - ${reason.message}`
            );
        },

        spawnNode: async (config: NodeSpawnConfig) => {
            await spawnNode(context.executionId, context.userId, config);
        },
    };
}

/**
 * Dynamically spawn a new node during execution
 */
async function spawnNode(
    executionId: string,
    userId: string,
    config: NodeSpawnConfig
): Promise<void> {
    const { TaskRegistry } = await import("../task/Registry");
    const taskConfig = TaskRegistry[config.nodeType as keyof typeof TaskRegistry];

    if (!taskConfig) {
        throw new Error(`Unknown node type: ${config.nodeType}`);
    }

    const newNodeId = `runtime_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await prisma.executionStep.create({
        data: {
            executionId,
            userId,
            nodeId: newNodeId,
            nodeType: config.nodeType,
            status: StepStatus.PENDING,
            inputs: JSON.stringify(config.inputs),
            outputs: "{}",
            dependencies: JSON.stringify(config.dependencies),
            creditsReserved: taskConfig.credits,
            creditsConsumed: 0,
        },
    });
}

/**
 * Finalize execution
 */
async function finalizeExecution(
    executionId: string,
    workflowId: string,
    failed: boolean,
    paused: boolean,
    context: SchedulerContext
): Promise<void> {
    let finalStatus: string;

    if (paused) {
        finalStatus = "WAITING";
    } else if (failed) {
        finalStatus = "FAILED";
    } else {
        finalStatus = "COMPLETED";
    }

    // Calculate total credits consumed
    const steps = await prisma.executionStep.findMany({
        where: { executionId },
    });

    const totalCreditsConsumed = steps.reduce(
        (sum, step) => sum + (step.creditsConsumed || 0),
        0
    );

    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
            status: finalStatus,
            completedAt: paused ? undefined : new Date(),
            creditsConsumed: totalCreditsConsumed,
        },
    });

    // Update workflow status
    if (!paused) {
        await prisma.workflow
            .update({
                where: {
                    id: workflowId,
                    lastRunId: executionId,
                },
                data: {
                    lastRunStatus: finalStatus,
                },
            })
            .catch(() => {
                // Ignore error - another execution may have started
            });
    }
}

/**
 * Cleanup browser and other resources
 */
async function cleanupContext(context: SchedulerContext): Promise<void> {
    if (context.browser) {
        await context.browser.close().catch((err) => {
            console.error("Cannot close browser:", err);
        });
    }
}

/**
 * Resume a paused execution
 * Called when user approves an approval gate
 */
export async function resumeExecution(executionId: string): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
    });

    if (!execution) {
        throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "WAITING") {
        throw new Error("Cannot resume execution not in WAITING state");
    }

    // Update waiting steps to pending
    await prisma.executionStep.updateMany({
        where: {
            executionId,
            status: StepStatus.WAITING,
        },
        data: {
            status: StepStatus.PENDING,
            pauseReason: null,
        },
    });

    // Update execution status to RUNNING
    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: "RUNNING" },
    });

    // Resume scheduler
    await runScheduler(executionId);
}
