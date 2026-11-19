const mongoose = require("mongoose");

const WritingActivitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    seconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

WritingActivitySchema.index({ user: 1, day: 1 }, { unique: true });

module.exports = {
  WritingActivityModel: mongoose.model("WritingActivity", WritingActivitySchema),
};
