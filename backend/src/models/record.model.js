import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: { type: String, required: true, trim: true },
    date: { type: Date, default: () => new Date() },
    notes: { type: String, default: "", trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

recordSchema.index({ createdBy: 1, deletedAt: 1 });

export default mongoose.model("Record", recordSchema);