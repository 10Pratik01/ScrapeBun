import { TaskType } from "@/lib/types";
import { Node, Edge } from "@xyflow/react";

export interface OptimizationSuggestion {
    id: string;
    type: "warning" | "info" | "success" | "error";
    title: string;
    description: string;
    potentialSavings?: number;
    affectedNodes?: string[];
}

/**
 * Analyzes a workflow and provides optimization suggestions
 */
export function analyzeWorkflowOptimization(nodes: Node[], edges?: Edge[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const workflowEdges = edges || [];

    // 1. Check for disconnected/orphaned nodes (no incoming or outgoing edges)
    const disconnectedNodes = nodes.filter(node => {
        const hasIncoming = workflowEdges.some(e => e.target === node.id);
        const hasOutgoing = workflowEdges.some(e => e.source === node.id);
        const isLaunchBrowser = node.data?.type === TaskType.LAUNCH_BROWSER;

        // LAUNCH_BROWSER doesn't need incoming, but needs outgoing
        if (isLaunchBrowser) return !hasOutgoing;

        // Other nodes need at least one connection
        return !hasIncoming && !hasOutgoing;
    });

    if (disconnectedNodes.length > 0) {
        suggestions.push({
            id: "disconnected-nodes",
            type: "error",
            title: `${disconnectedNodes.length} disconnected node(s) detected!`,
            description: "These nodes are not connected to your workflow and will never execute. Remove them or connect them to save credits.",
            potentialSavings: disconnectedNodes.reduce((sum, node) => {
                const type = node.data?.type;
                if (type === TaskType.LAUNCH_BROWSER) return sum + 5;
                if (type === TaskType.EXTRACT_DATA_WITH_AI) return sum + 4;
                if (type === TaskType.PAGE_TO_HTML) return sum + 1;
                return sum + 1;
            }, 0),
            affectedNodes: disconnectedNodes.map(n => n.id),
        });
    }

    // 2. Check for nodes with no outgoing edges (dead ends, except terminal nodes)
    const terminalNodeTypes = [TaskType.DELIVER_VIA_WEBHOOK];
    const deadEndNodes = nodes.filter(node => {
        const hasOutgoing = workflowEdges.some(e => e.source === node.id);
        const isTerminal = terminalNodeTypes.includes(node.data?.type as TaskType);
        return !hasOutgoing && !isTerminal && node.data?.type !== TaskType.LAUNCH_BROWSER;
    });

    if (deadEndNodes.length > 0 && workflowEdges.length > 0) {
        suggestions.push({
            id: "dead-end-nodes",
            type: "warning",
            title: `${deadEndNodes.length} dead-end node(s) detected`,
            description: "These nodes have no outgoing connections. Add connections or use DELIVER_VIA_WEBHOOK to output results.",
            affectedNodes: deadEndNodes.map(n => n.id),
        });
    }

    // 3. Check for unreachable nodes (no path from LAUNCH_BROWSER)
    const launchBrowser = nodes.find(n => n.data?.type === TaskType.LAUNCH_BROWSER);
    if (launchBrowser && workflowEdges.length > 0) {
        const reachable = new Set<string>();
        const queue = [launchBrowser.id];

        while (queue.length > 0) {
            const current = queue.shift()!;
            reachable.add(current);

            const outgoing = workflowEdges.filter(e => e.source === current);
            outgoing.forEach(edge => {
                if (!reachable.has(edge.target)) {
                    queue.push(edge.target);
                }
            });
        }

        const unreachableNodes = nodes.filter(n => !reachable.has(n.id));
        if (unreachableNodes.length > 0) {
            suggestions.push({
                id: "unreachable-nodes",
                type: "error",
                title: `${unreachableNodes.length} unreachable node(s) detected`,
                description: "These nodes cannot be reached from LAUNCH_BROWSER. Connect them to your workflow or remove them.",
                potentialSavings: unreachableNodes.reduce((sum, node) => {
                    const type = node.data?.type;
                    if (type === TaskType.EXTRACT_DATA_WITH_AI) return sum + 4;
                    if (type === TaskType.PAGE_TO_HTML) return sum + 1;
                    return sum + 1;
                }, 0),
                affectedNodes: unreachableNodes.map(n => n.id),
            });
        }
    }

    // 4. Check for multiple PAGE_TO_HTML nodes (can use snapshots)
    const pageToHtmlNodes = nodes.filter(n => n.data?.type === TaskType.PAGE_TO_HTML);
    if (pageToHtmlNodes.length > 1) {
        suggestions.push({
            id: "multiple-page-to-html",
            type: "info",
            title: "Multiple PAGE_TO_HTML nodes detected",
            description: "Engine V2 automatically saves HTML snapshots. You can reuse the same HTML without fetching again, saving credits.",
            potentialSavings: pageToHtmlNodes.length - 1,
            affectedNodes: pageToHtmlNodes.map(n => n.id),
        });
    }

    // 5. Check for multiple EXTRACT_DATA_WITH_AI nodes (can be combined)
    const aiNodes = nodes.filter(n => n.data?.type === TaskType.EXTRACT_DATA_WITH_AI);
    if (aiNodes.length > 2) {
        suggestions.push({
            id: "multiple-ai-extractions",
            type: "warning",
            title: `${aiNodes.length} AI extraction nodes detected`,
            description: `Consider combining multiple AI extractions into a single call with a comprehensive prompt. Potential savings: ${(aiNodes.length - 1) * 4} credits.`,
            potentialSavings: (aiNodes.length - 1) * 4,
            affectedNodes: aiNodes.map(n => n.id),
        });
    }

    // 6. Check total workflow cost
    const totalCost = nodes.reduce((sum, node) => {
        const type = node.data?.type;
        if (type === TaskType.LAUNCH_BROWSER) return sum + 5;
        if (type === TaskType.PAGE_TO_HTML) return sum + 1;
        if (type === TaskType.EXTRACT_DATA_WITH_AI) return sum + 4;
        return sum + 1;
    }, 0);

    if (totalCost > 20) {
        suggestions.push({
            id: "high-cost-workflow",
            type: "warning",
            title: `High-cost workflow: ${totalCost} credits`,
            description: "Consider optimizing by reducing AI calls, reusing snapshots, or removing unnecessary nodes.",
            potentialSavings: Math.floor(totalCost * 0.3),
        });
    }

    // 7. Success message if workflow is well optimized
    if (suggestions.length === 0) {
        suggestions.push({
            id: "optimized",
            type: "success",
            title: "Workflow is well optimized! 🎉",
            description: "No issues detected. Your workflow follows best practices and is ready to execute.",
        });
    }

    return suggestions;
}
