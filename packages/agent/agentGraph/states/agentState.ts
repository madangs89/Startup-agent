import { StateSchema } from "@langchain/langgraph";

import { z } from "zod";

enum AgentName {
  Founder = "Founder",
  Engineer = "Engineer",
  Marketer = "Marketer",
}

const WorkflowStateSchema = z.object({
  currentAgent: z.nativeEnum(AgentName),
  currentMode: z.enum(["WORK", "APPROVAL", "REVISION", "COMPLETED"]),
  waitingFor: z.nativeEnum(AgentName).optional(),
  requestedBy: z.nativeEnum(AgentName).optional(),
});

type WorkflowState = z.infer<typeof WorkflowStateSchema>;

const State = new StateSchema({
  simulationId: z.string(),
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

  workFlow: WorkflowStateSchema,
  agentFlow: z.array(
    z.object({
      agentName: z.nativeEnum(AgentName),
      status: z.boolean().default(false),
      workMode: z
        .enum(["WORK", "APPROVAL", "REVISION", "COMPLETED"])
        .default("WORK"),
    }),
  ),
});

// {
//   "founder": {
//     "problem": "...",
//     "solution": "...",
//     "targetCustomers": [],
//     "valueProposition": "...",
//     "businessModel": "...",
//     "mvpFeatures": [],
//     "assumptions": []
//   }
// }

// {
//   "engineer": {
//     "architecture": {},
//     "techStack": [],
//     "database": {},
//     "apis": [],
//     "requirements": [],
//     "risks": [],
//     "implementationPlan": []
//   }
// }

// {
//   "marketing": {
//     "targetSegments": [],
//     "positioning": "...",
//     "competitors": [],
//     "differentiation": [],
//     "acquisitionStrategy": [],
//     "pricing": {},
//     "launchPlan": [],
//     "risks": []
//   }
// }

// {
//   "investor": {
//     "decision": "REQUEST_REVISION",

//     "funding": {
//       "amount": 500000,
//       "equity": 8
//     },

//     "strengths": [],
//     "concerns": [],
//     "questions": [],
//     "requiredChanges": []
//   }
// }
