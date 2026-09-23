import { StateSchema } from "@langchain/langgraph";

import { z } from "zod";

enum AgentName {
  Founder = "Founder",
  Engineer = "Engineer",
  Marketer = "Marketer",
}

const State = new StateSchema({
  totalSteps: z.number().default(0),
  iterationMap: z.array(
    z.object({
      agentName: z.nativeEnum(AgentName),
      step: z.number().default(0),
    }),
  ),
  eachAgentStepMap: z.record(
    z.nativeEnum(AgentName),
    z.object({
      step: z.number().default(0),
      agentResponseVersion: z.number().default(0),
    }),
  ),
  userRequestedIdea: z.string().default(""),
});
