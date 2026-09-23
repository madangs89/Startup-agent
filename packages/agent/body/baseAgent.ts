import { ToolLoopAgent, tool } from "ai";
import { ollama } from "ollama-ai-provider-v2";

type Provider = "openai" | "anthropic" | "gemini" | "ollama";

export class AgentBody {
  private agent!: ToolLoopAgent;

  public constructor(provider: Provider) {
    switch (provider) {
      case "ollama":
        this.agent = new ToolLoopAgent({
          model: ollama("qwen2.5:7b"),
        });
        break;
    }
  }

  public getAgent(): ToolLoopAgent {
    return this.agent;
  }
}
