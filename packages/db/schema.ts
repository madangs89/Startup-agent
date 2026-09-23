import mongoose, { Schema, Document } from "mongoose";

const TargetCustomerSchema = new Schema(
  {
    segment: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    painPoints: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false },
);

const RevenueStreamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const BusinessModelSchema = new Schema(
  {
    model: {
      type: String,
      enum: [
        "SUBSCRIPTION",
        "FREEMIUM",
        "MARKETPLACE",
        "TRANSACTION_FEE",
        "ADVERTISING",
        "B2B_SAAS",
        "ONE_TIME_PURCHASE",
        "OTHER",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    revenueStreams: {
      type: [RevenueStreamSchema],
      required: true,
      default: [],
    },
  },
  { _id: false },
);

const MvpFeatureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      required: true,
    },
  },
  { _id: false },
);

const AssumptionSchema = new Schema(
  {
    assumption: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      required: true,
    },
  },
  { _id: false },
);

const FounderOutputSchema = new Schema(
  {
    simulationId: {
      type: String,
      required: true,
      unique: true,
    },
    problem: {
      type: String,
      //   required: true,
      default: "",
    },

    solution: {
      type: String,
      //   required: true,
        default: "",
    },

    targetCustomers: {
      type: [TargetCustomerSchema],
      //   required: true,
      default: [],
    },

    valueProposition: {
      type: String,
      //   required: true,
      default: "",
    },

    businessModel: {
      type: BusinessModelSchema,
      //   required: true,
    },

    mvpFeatures: {
      type: [MvpFeatureSchema],
      //   required: true,
      default: [],
    },

    assumptions: {
      type: [AssumptionSchema],
      //   required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const FounderOutput = mongoose.model(
  "FounderOutput",
  FounderOutputSchema,
);
