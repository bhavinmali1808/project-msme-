const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    companyName: String,

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    contactPerson: String,

    email: {
      type: String,
      unique: true,
    },

    companyEmail: String,
    companyPhone: String,
    phone: String,

    password: String,

    street: String,
    city: String,
    state: String,
    country: String,
    pinCode: String,
    name: String, // individual's name (e.g. employee or company admin)

    role: {
      type: String,
      enum: ["company", "participant", "mentor", "evaluator", "admin", "superadmin", "dept_head", "university"],
      default: "participant",
    },

    // Dept head specific
    department: { type: String },
    departments: [{ type: String }],
    isHead: { type: Boolean, default: false },
    tempPassword: { type: String }, // Shown once after creation, cleared on first login

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    },

    category: {
      type: String,
    },

    teamRole: {
      type: String,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },

    college: String,
    linkedinUrl: String,
    resumeUrl: String,

    // University module fields
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University"
    },
    studentId: { type: String }, // enrollment/ID number for students
    employeeId: { type: String }, // employee ID for mentors added by university

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    language: {
      type: String,
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);