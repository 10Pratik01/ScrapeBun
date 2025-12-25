import { Browser, Page } from "puppeteer";
import { LogCollector } from "@/lib/types";

/**
 * Engine V2 Step Status
 * WAITING status enables pause/resume functionality
 */
export enum StepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  WAITING = "WAITING", // For approval gates and pause functionality
  SKIPPED = "SKIPPED", // For non-executed branches in conditional logic
}

/**
 * Pause reason for WAITING status
 */
export interface PauseReason {
  type: "APPROVAL_REQUIRED" | "MANUAL_INTERVENTION" | "EXTERNAL_DEPENDENCY";
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Configuration for dynamically spawned nodes
 */
export interface NodeSpawnConfig {
  nodeType: string;
  inputs: Record<string, string>;
  dependencies: string[]; // Node IDs that must complete first
  priority?: number; // Higher priority = execute sooner
}

/**
 * Step execution result
 * Replaces boolean return from Engine V1 executors
 */
export type StepResult =
  | {
      type: "success";
      outputs: Record<string, string>;
    }
  | {
      type: "pause";
      reason: PauseReason;
    }
  | {
      type: "fail";
      error: string;
    };

/**
 * Execution environment for step executors
 * No generics - enables runtime flexibility for dynamic nodes
 */
export interface ExecutionEnv {
  executionId: string;
  stepId: string;
  nodeId: string;
  userId: string;

  // Input/Output management
  getInput(name: string): string | undefined;
  setOutput(name: string, value: string): void;

  // Browser management
  getBrowser(): Browser | undefined;
  setBrowser(browser: Browser): void;
  getPage(): Page | undefined;
  setPage(page: Page): void;

  // Logging
  log: LogCollector;

  // Engine V2 features
  pause(reason: PauseReason): void;
  spawnNode(config: NodeSpawnConfig): Promise<void>;
}

/**
 * Step executor function signature
 * All executors must conform to this signature in Engine V2
 */
export type StepExecutor = (env: ExecutionEnv) => Promise<StepResult>;

/**
 * Runtime execution step
 * Represents a single node execution in the workflow
 */
export interface ExecutionStep {
  id: string;
  executionId: string;
  userId: string;
  nodeId: string;
  nodeType: string;
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  dependencies: string[]; // Node IDs this step depends on
  creditsReserved: number;
  creditsConsumed: number;
  pauseReason?: PauseReason;
  error?: string;
}

/**
 * Scrape snapshot for reuse across step executions
 * Prevents refetching during approval pauses
 */
export interface ScrapeSnapshot {
  id: string;
  executionId: string;
  nodeId: string;
  url: string;
  html: string;
  timestamp: Date;
}
