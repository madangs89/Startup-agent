import { ToolLoopAgent, tool, Output } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
type Provider = "openai" | "anthropic" | "gemini" | "ollama";

export class AgentBody {
  private agent!: ToolLoopAgent;

  public constructor(provider: Provider, apiKey?: string) {
    switch (provider) {
      case "ollama":
        this.agent = new ToolLoopAgent({
          model: ollama("qwen2.5:7b"),
          output: Output.object({
            schema: z.object({
              plan: z.array(
                z.object({
                  step: z.string(),
                  description: z.string(),
                }),
              ),
              summary: z.string(),
              note: z.string().optional(),
            }),
            description:
              "The output is a structured object containing the plan, summary, and an optional note.",
            name: "StructuredOutput",
          }),
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
          output: Output.object({
            schema: z.object({
              plan: z.array(
                z.object({
                  step: z.string(),
                  description: z.string(),
                }),
              ),
              summary: z.string(),
              note: z.string().optional(),
            }),
            description:
              "The output is a structured object containing the plan, summary, and an optional note.",
            name: "StructuredOutput",
          }),
        });
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  public getAgent(): ToolLoopAgent {
    return this.agent;
  }
}
