const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const ReadingHistorySchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    post: { type: ObjectId, ref: "Post", required: true },
    lastReadAt: { type: Date, default: Date.now, required: true },
    readCount: { type: Number, min: 1 },
  },
  { timestamps: true }
);

ReadingHistorySchema.index({ user: 1, post: 1 }, { unique: true });
ReadingHistorySchema.index({ user: 1, lastReadAt: -1 });

module.exports = {
  ReadingHistoryModel: mongoose.model("ReadingHistory", ReadingHistorySchema),
};
