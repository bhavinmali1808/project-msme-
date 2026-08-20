/**
 * Project MSME - Backend API
 * Developed and Maintained by Bhavin
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// CORS and body parsing MUST come first
app.use(cors());
app.use(express.json());

connectDB();
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);
app.use(
  "/api/setup",
  require("./routes/setupRoutes")
);
app.use(
  "/api/admin",
  require("./routes/adminRoutes")
);
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/evaluations", require("./routes/evaluationRoutes"));
app.use("/api/mentors", require("./routes/mentorRoutes"));
app.use("/api/themes", require("./routes/themeRoutes"));
app.use("/api/problem-statements", require("./routes/problemStatementRoutes"));
app.use("/api/dept-heads", require("./routes/deptHeadRoutes"));
app.use("/api/custom-questions", require("./routes/customQuestionRoutes"));
app.use("/api/custom-answers", require("./routes/customAnswerRoutes"));
app.use("/api/answers", require("./routes/employeeAnswerRoutes"));
app.use("/api/assessments", require("./routes/assessmentRoutes"));
app.use("/api/universities", require("./routes/universityRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "XLRQ API Running"
  });
});
app.use(
  "/api/departments",
  require("./routes/departmentRoutes")
);

app.use(
  "/api/questions",
  require("./routes/questionRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});