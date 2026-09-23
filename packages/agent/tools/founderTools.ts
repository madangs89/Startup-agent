import { tool } from "ai";
import { FounderOutput } from "db";
import { z } from "zod";

const FounderUpdateSchema = z.object({
  problem: z.string().optional(),

  solution: z.string().optional(),

  targetCustomers: z
    .array(
      z.object({
        segment: z.string(),
        description: z.string(),
        painPoints: z.array(z.string()),
      }),
    )
    .optional(),

  valueProposition: z.string().optional(),

  businessModel: z
    .object({
      model: z.enum([
        "SUBSCRIPTION",
        "FREEMIUM",
        "MARKETPLACE",
        "TRANSACTION_FEE",
        "ADVERTISING",
        "B2B_SAAS",
        "ONE_TIME_PURCHASE",
        "OTHER",
      ]),
      description: z.string(),
      revenueStreams: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      ),
    })
    .optional(),

  mvpFeatures: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      }),
    )
    .optional(),

  assumptions: z
    .array(
      z.object({
        assumption: z.string(),
        reason: z.string(),
        riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
      }),
    )
    .optional(),
});
const FounderToolsContextSchema = z.object({
  simulationId: z.string(),
});

export const createFounderTools = (simulationId: string) => ({
  updateFounderOutput: tool({
    description: `
    Create or update the founder analysis for the current simulation.

    Only provide the fields that need to be created or updated.
    Do not provide fields that do not need to change.

    Array fields such as targetCustomers, mvpFeatures, and assumptions
    should be provided as complete arrays when they need to be updated.
  `,

    inputSchema: FounderUpdateSchema,

    execute: async (input) => {
      try {
        if (!simulationId) {
          throw new Error("Simulation ID is required");
        }
        console.log("Updating founder output with input:", input);
        const updateData = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value !== undefined),
        );

        if (Object.keys(updateData).length === 0) {
          throw new Error("No fields provided for update");
        }
        console.log("Filtered update data:", updateData);

        const result = await FounderOutput.findOneAndUpdate(
          { simulationId },
          {
            $set: updateData,
          },
          {
            upsert: true,
            new: true,
            runValidators: true,
          },
        );

        return {
          success: true,
          message: "Founder output updated successfully",
          data: result,
        };
      } catch (error) {
        console.error("Error updating founder output:", error);

        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to update founder output",
        );
      }
    },
  }),

  checkFounderOutput: tool({
    description: `
    Check whether the founder analysis contains all required information.

    Use this after updating the founder output.
    Do not modify the database.
    Return whether the founder output is complete and identify
    any missing required fields.
  `,

    inputSchema: z.object({}),

    execute: async () => {
      try {
        if (!simulationId) {
          throw new Error("Simulation ID is required");
        }
        console.log("Checking founder output for simulationId:", simulationId);
        const founderOutput = await FounderOutput.findOne({
          simulationId,
        }).lean();

        if (!founderOutput) {
          return {
            status: false,
            complete: false,
            missingFields: [
              "problem",
              "solution",
              "targetCustomers",
              "valueProposition",
              "businessModel",
              "mvpFeatures",
              "assumptions",
            ],
          };
        }

        const missingFields: string[] = [];

        if (!founderOutput.problem?.trim()) {
          missingFields.push("problem");
        }

        if (!founderOutput.solution?.trim()) {
          missingFields.push("solution");
        }

        if (
          !founderOutput.targetCustomers ||
          founderOutput.targetCustomers.length === 0
        ) {
          missingFields.push("targetCustomers");
        }

        if (!founderOutput.valueProposition?.trim()) {
          missingFields.push("valueProposition");
        }

        if (!founderOutput.businessModel) {
          missingFields.push("businessModel");
        }

        if (
          !founderOutput.mvpFeatures ||
          founderOutput.mvpFeatures.length === 0
        ) {
          missingFields.push("mvpFeatures");
        }

        if (
          !founderOutput.assumptions ||
          founderOutput.assumptions.length === 0
        ) {
          missingFields.push("assumptions");
        }

        return {
          status: true,
          complete: missingFields.length === 0,
          missingFields,
        };
      } catch (error) {
        console.error("Error checking founder output:", error);

        return {
          status: false,
          complete: false,
          missingFields: [],
          message:
            error instanceof Error
              ? error.message
              : "Failed to check founder output",
        };
      }
    },
  }),
});
