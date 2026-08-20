const mongoose = require("mongoose");

/**
 * DeptSubmission stores a complete snapshot of a dept_head's questionnaire answers
 * in a single JSON document, optimised for data analytics queries.
 *
 * Schema: one document per submission session (upserted on save).
 */
const deptSubmissionSchema = new mongoose.Schema(
  {
    employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyId:    { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    employeeName: { type: String },
    companyName:  { type: String },
    department:   { type: String }, // primary dept name (e.g. "Human Resources")

    /**
     * departments: array of dept IDs that this user filled (e.g. ["hr", "finance"])
     */
    departments: [String],

    /**
     * deptAnswers: nested JSON keyed by deptId → questionId → answer
     * e.g. { hr: { q1: "12%", q2: 4, q3: ["a","c"] }, finance: { q1: "30 days" } }
     */
    deptAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },

    /**
     * customAnswers: array of { questionId, questionText, answer }
     */
    customAnswers: { type: mongoose.Schema.Types.Mixed, default: [] },

    /**
     * problemDetails: { title, description, solution, impact }
     */
    problemDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

    /**
     * Analytics-friendly metadata
     */
    totalQuestions:  { type: Number, default: 0 },
    answeredCount:   { type: Number, default: 0 },
    completionPct:   { type: Number, default: 0 }, // 0-100
    submittedAt:     { type: Date },
    isSubmitted:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One document per employee — upsert replaces on save
deptSubmissionSchema.index({ employeeId: 1 }, { unique: true });

module.exports = mongoose.model("DeptSubmission", deptSubmissionSchema);
