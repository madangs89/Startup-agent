import { AgentBody } from "agent";
import express, { type Request, type Response } from "express";

const acceptRouter = express.Router();

interface AcceptRequestBody {
  plan: string;
}

const agent = new AgentBody("ollama", "").getAgent();

acceptRouter.post(
  "/accept",
  async (req: Request<{}, {}, AcceptRequestBody>, res: Response) => {
    try {
      const { plan } = req.body;

      const {
        output: result,
        usage,
        steps,
      } = await agent.generate({
        prompt: `Execution type: WORK.

You have accepted the following startup plan:

${plan}

Execute the Founder Analysis now.

Actually perform the work using the available tools.
Do not just describe the next steps.`,
      });

      console.log(result);
      console.log(usage);
      for (const step of steps) {
        console.log("Tool calls:", step.toolCalls);
        console.log("Tool results:", step.toolResults);
      }
      return res
        .status(200)
        .json({ message: `Plan ${plan} accepted successfully` });
    } catch (error) {
      console.error("Error processing accept request:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default acceptRouter;
