"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon, AlertTriangleIcon, InfoIcon, CheckCircleIcon, CoinsIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { analyzeWorkflowOptimization, OptimizationSuggestion } from "@/lib/workflow/optimization";

function OptimizationButton() {
    const { getNodes, getEdges } = useReactFlow();
    const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleAnalyze = () => {
        const nodes = getNodes();
        const edges = getEdges();
        const analysis = analyzeWorkflowOptimization(nodes, edges);
        setSuggestions(analysis);
        setIsOpen(true);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "error":
                return <AlertTriangleIcon size={20} className="stroke-red-500" />;
            case "warning":
                return <AlertTriangleIcon size={20} className="stroke-yellow-500" />;
            case "info":
                return <InfoIcon size={20} className="stroke-blue-500" />;
            case "success":
                return <CheckCircleIcon size={20} className="stroke-green-500" />;
            default:
                return <LightbulbIcon size={20} />;
        }
    };

    const errorCount = suggestions.filter(s => s.type === "error").length;
    const warningCount = suggestions.filter(s => s.type === "warning").length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 relative"
                    onClick={handleAnalyze}
                >
                    <LightbulbIcon size={16} className="stroke-yellow-500" />
                    Optimize
                    {(errorCount > 0 || warningCount > 0) && (
                        <Badge
                            variant={errorCount > 0 ? "destructive" : "default"}
                            className="ml-1 px-1.5 py-0 h-5 text-xs"
                        >
                            {errorCount > 0 ? errorCount : warningCount}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LightbulbIcon size={24} className="stroke-yellow-500" />
                        Workflow Optimization Suggestions
                    </DialogTitle>
                    <DialogDescription>
                        Improve your workflow efficiency and reduce credit costs
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className={`p-4 rounded-lg border ${suggestion.type === "error"
                                    ? "border-red-500/50 bg-red-500/5"
                                    : suggestion.type === "warning"
                                        ? "border-yellow-500/50 bg-yellow-500/5"
                                        : suggestion.type === "success"
                                            ? "border-green-500/50 bg-green-500/5"
                                            : "border-blue-500/50 bg-blue-500/5"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon(suggestion.type)}</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm mb-1">
                                        {suggestion.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {suggestion.description}
                                    </p>
                                    {suggestion.potentialSavings && suggestion.potentialSavings > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                            <CoinsIcon size={12} />
                                            Potential savings: {suggestion.potentialSavings} credits
                                        </div>
                                    )}
                                    {suggestion.affectedNodes && suggestion.affectedNodes.length > 0 && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Affects {suggestion.affectedNodes.length} node(s)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default OptimizationButton;
