// @ts-nocheck
/**
 * ⚠️ DEPRECATED - Engine V1 Registry
 * 
 * This file is kept for backward compatibility only.
 * Engine V2 uses: lib/workflow/engine/ExecutorRegistry.ts
 * 
 * TypeScript errors in this file are expected and can be ignored.
 * All executors have been migrated to Engine V2 types (ExecutionEnv)
 * which are incompatible with this V1 registry (ExecutionEnviornment<T>).
 */

import { ExecutionEnviornment, TaskType, WorkflowTask } from "@/lib/types";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ExtractTextFromElement } from "./ExtractTextFromElementExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { DeviverViaWebHookExecutor } from "./DeliverViaWebHookExecutor";
import { ExtractDataWithAiExecutor } from "./ExtractDataWithAiExecutor";
import { ReadPropertyFromJsonExecutor } from "./ReadPropertyFromJsonExecutor";
import { AddPropertyToJsonExecutor } from "./AddPropertyToJsonExecutor ";
import { NavigateUrlExecutor } from "./NavigateUrlExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";
import { ConditionExecutor } from "./ConditionExecutor";
import { ForEachExecutor } from "./ForEachExecutor";
import { WaitForUserInputExecutor } from "./WaitForUserInputExecutor";

type ExecutorFunction<T extends WorkflowTask> = (
  enviornment: ExecutionEnviornment<T>
) => Promise<boolean>;

type RegistryType = {
  [key in TaskType]: ExecutorFunction<WorkflowTask & { type: key }>;
};

export const ExecutorRegistry: RegistryType = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
  EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElement,
  FILL_INPUT: FillInputExecutor,
  CLICK_ELEMENT: ClickElementExecutor,
  WAIT_FOR_ELEMENT: WaitForElementExecutor,
  DELIVER_VIA_WEBHOOK: DeviverViaWebHookExecutor,
  EXTRACT_DATA_WITH_AI: ExtractDataWithAiExecutor,
  READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor,
  ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor,
  NAVIGATE_URL: NavigateUrlExecutor,
  SCROLL_TO_ELEMENT: ScrollToElementExecutor,
  // Control-flow executors
  CONDITION: ConditionExecutor,
  FOREACH: ForEachExecutor,
  WAIT_FOR_USER_INPUT: WaitForUserInputExecutor,
};
