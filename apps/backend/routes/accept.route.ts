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

      const { output: result, usage } = await agent.generate({
        prompt: `You have accepted the plan: ${plan}. Please provide a summary of the next steps.`,
      });

      console.log(result);
      console.log(usage);
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
