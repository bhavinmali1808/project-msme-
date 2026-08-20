const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["Important", "General", "Update", "Deadline"],
      default: "General",
    },
    audience: {
      type: String,
      enum: ["all", "students", "startups"],
      default: "all",
    },
    isPublished: { type: Boolean, default: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
