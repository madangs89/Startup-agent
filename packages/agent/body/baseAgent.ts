import { ToolLoopAgent, tool, Output } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { createFounderTools } from "../tools/founderTools";
type Provider = "openai" | "anthropic" | "gemini" | "ollama";

const AgentOutputSchema = z.object({
  success: z.boolean(),

  message: z.string(),

  reason: z.string().optional(),
});

const FOUNDER_INSTRUCTIONS = `
You are the Founder Agent in a multi-agent startup simulation system.

Your job is to complete the Founder Analysis for the startup idea provided
in the user prompt.

## WORK MODE

When execution type is WORK:

1. Analyze the startup idea.

2. The Founder Analysis must contain:
   - problem
   - solution
   - targetCustomers
   - valueProposition
   - businessModel
   - mvpFeatures
   - assumptions

3. You MUST use updateFounderOutput to save the analysis to the database.

4. After saving, you MUST call checkFounderOutput.

5. If checkFounderOutput reports missing fields:
   - create the missing information
   - call updateFounderOutput
   - call checkFounderOutput again

6. Continue until checkFounderOutput reports:
   complete: true

7. Once complete, stop.

Do not merely describe what should be done.
Actually perform the work using the available tools.

Do not decide the next workflow stage.
The Navigator is responsible for orchestration.

## APPROVAL MODE

When execution type is APPROVAL:

1. Review the provided work.
2. Determine whether it satisfies the required Founder Analysis.
3. Do NOT modify the database.
4. Do not perform revisions.
5. Return a short explanation of the review.

## IMPORTANT

Tools are the source of truth for database operations.

Do not claim that data was saved unless the updateFounderOutput
tool was actually called.

Do not claim the Founder Analysis is complete unless
checkFounderOutput returned complete: true.
`;

const finalResult = tool({
  description: `
    Report the final result of the current task.
    Call this only after all required work and verification are complete.
  `,

  inputSchema: AgentOutputSchema,
});

const t = createFounderTools("123456");
const tools = {
  ...t,
  finalResult,
};
type FounderTools = typeof tools;

export class AgentBody {
  private agent!: ToolLoopAgent<never, FounderTools>;

  public constructor(provider: Provider, apiKey?: string) {
    switch (provider) {
      case "ollama":
        this.agent = new ToolLoopAgent({
          model: ollama("qwen2.5:7b"),
          output: Output.object({
            schema: AgentOutputSchema,
            name: "AgentResult",

            description: `
      Return the result of the agent's current task.

      success=true means the requested task was completed successfully
      or the reviewed output was approved.

      success=false means the task failed or the reviewed output was
      rejected and requires revision.

      reason should explain why the task failed or why approval was rejected.
    `,
          }),
          tools,
          // toolChoice: "required",
          instructions: `
You are the Founder Agent in a multi-agent startup simulation system.

Your task depends on the current execution type provided in the runtime context.

## WORK

When the execution type is WORK:

1. Analyze the startup idea and determine the required Founder Analysis:
   - Problem
   - Solution
   - Target Customers
   - Value Proposition
   - Business Model
   - MVP Features
   - Assumptions

2. Use the available tools to persist the information in the database.
   Do not assume that generating information in your response saves it.

3. Only update information that needs to be created or changed.
   Do not repeatedly update unchanged information.

4. After completing the required updates, use the verification tool to check
   whether the Founder Analysis is complete.

5. If required information is missing, use the update tool to add it and
   verify again.

6. When the required work has been completed successfully, return:
   - type: "WORK"
   - success: true
   - a short completion message
   - an empty reason

Do not return the complete Founder Analysis unless explicitly requested.

## APPROVAL

When the execution type is APPROVAL:

1. Review the provided output or work against the expected requirements.
2. Determine whether the output is complete, consistent, and satisfies the
   requirements.
3. Do not modify the database.
4. Do not perform additional work or revisions.
5. If the output satisfies the requirements, return:
   - type: "APPROVAL"
   - success: true
   - a short approval message
   - an empty reason
6. If the output does not satisfy the requirements, return:
   - type: "APPROVAL"
   - success: false
   - a short rejection message
   - a clear reason explaining what needs to be corrected.

## IMPORTANT

The simulationId is provided through runtime context. Never invent or modify it.

Use tools whenever database changes or verification are required.

Do not make decisions about the next workflow stage, revision routing, or
overall orchestration. The Navigator is responsible for deciding what happens
after your result.

Always return the required structured output format.
`,
        });
        break;
      case "gemini":
        if (!apiKey) {
          throw new Error("API key is required for Gemini provider");
        }

        const google = createGoogleGenerativeAI({
          apiKey,
        });
        this.agent = new ToolLoopAgent({
          model: google("gemini-2.5-flash"),

          tools,
          instructions: FOUNDER_INSTRUCTIONS,
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  public getAgent() {
    return this.agent;
  }
}
