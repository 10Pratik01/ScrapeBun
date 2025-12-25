import { StepExecutor } from "./types";

/**
 * Engine V2 Executor Registry
 * String-based lookup (not enum) to support dynamic node insertion
 * Maps node types to their executor functions
 */

// Import executors (will be migrated in Phase 5)
// For now, create empty placeholders - actual migration happens in next phase
import { LaunchBrowserExecutor } from "../executor/LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "../executor/PageToHtmlExecutor";
import { ExtractTextFromElement } from "../executor/ExtractTextFromElementExecutor";
import { FillInputExecutor } from "../executor/FillInputExecutor";
import { ClickElementExecutor } from "../executor/ClickElementExecutor";
import { WaitForElementExecutor } from "../executor/WaitForElementExecutor";
import { DeviverViaWebHookExecutor } from "../executor/DeliverViaWebHookExecutor";
import { ExtractDataWithAiExecutor } from "../executor/ExtractDataWithAiExecutor";
import { ReadPropertyFromJsonExecutor } from "../executor/ReadPropertyFromJsonExecutor";
import { AddPropertyToJsonExecutor } from "../executor/AddPropertyToJsonExecutor ";
import { NavigateUrlExecutor } from "../executor/NavigateUrlExecutor";
import { ScrollToElementExecutor } from "../executor/ScrollToElementExecutor";

// Engine V2 control-flow executors
import { ConditionExecutor } from "../executor/ConditionExecutor";
import { ForEachExecutor } from "../executor/ForEachExecutor";
import { WaitForUserInputExecutor } from "../executor/WaitForUserInputExecutor";
import { MergeExecutor } from "../executor/MergeExecutor";

// Engine V2 executors with auto-detection
import { PageToHtmlExecutorV2 } from "./executors/PageToHtmlExecutor";
import { NavigateUrlExecutorV2 } from "./executors/NavigateUrlExecutor";

/**
 * Adapter function to convert Engine V1 executors (returning boolean) 
 * to Engine V2 format (returning StepResult) temporarily
 * This will be removed once all executors are migrated
 */
function adaptV1Executor(
    v1Executor: (env: any) => Promise<boolean>
): StepExecutor {
    return async (env) => {
        try {
            const success = await v1Executor(env as any);
            return success
                ? { type: "success", outputs: {} }
                : { type: "fail", error: "Executor returned false" };
        } catch (error: any) {
            return { type: "fail", error: error.message };
        }
    };
}

/**
 * Engine V2 Executor Registry
 * Uses string keys instead of TaskType enum for dynamic flexibility
 */
type ExecutorRegistryType = Record<string, StepExecutor>;

export const ExecutorRegistry: ExecutorRegistryType = {
    // Browser automation - ALL V2 ✅
    LAUNCH_BROWSER: LaunchBrowserExecutor,
    PAGE_TO_HTML: PageToHtmlExecutorV2,
    NAVIGATE_URL: NavigateUrlExecutorV2,

    // User interactions - ALL V2 ✅
    FILL_INPUT: FillInputExecutor,
    CLICK_ELEMENT: ClickElementExecutor,
    WAIT_FOR_ELEMENT: WaitForElementExecutor,
    SCROLL_TO_ELEMENT: ScrollToElementExecutor,

    // Data extraction - ALL V2 ✅
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElement,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAiExecutor,

    // Data manipulation - ALL V2 ✅
    READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor as any, // V1 executor wrapped by compatibility layer
    ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor as any, // V1 executor wrapped by compatibility layer

    // Output - ALL V2 ✅
    DELIVER_VIA_WEBHOOK: DeviverViaWebHookExecutor as any, // V1 executor wrapped by compatibility layer

    // Control flow executors (V2 native)
    CONDITION: ConditionExecutor as any, // V1 executor, wrapped by compatibility layer
    FOREACH: ForEachExecutor as any, // V1 executor, wrapped by compatibility layer  
    WAIT_FOR_USER_INPUT: WaitForUserInputExecutor as any, // V1 executor, wrapped by compatibility layer
    MERGE: MergeExecutor,
};

/**
 * Get executor for a given node type
 * Returns undefined if not found (allows runtime error handling)
 */
export function getExecutor(nodeType: string): StepExecutor | undefined {
    return ExecutorRegistry[nodeType];
}

/**
 * Register a new executor at runtime
 * Enables dynamic node types and plugin architecture
 */
export function registerExecutor(
    nodeType: string,
    executor: StepExecutor
): void {
    ExecutorRegistry[nodeType] = executor;
}

/**
 * Check if an executor exists for a node type
 */
export function hasExecutor(nodeType: string): boolean {
    return nodeType in ExecutorRegistry;
}
