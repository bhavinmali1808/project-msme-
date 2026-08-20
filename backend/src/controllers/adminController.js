// Endpoint: GET /api/admin/companies/:id/departments-answers
// Returns departments created by this company's dept_head users,
// with all employee answers under each department.

const Company = require("../models/Company");
const User = require("../models/User");
const QuestionnaireResponse = require("../models/QuestionnaireResponse");
const EmployeeAnswer = require("../models/EmployeeAnswer");
const Team = require("../models/Team");
const MentorAssignment = require("../models/MentorAssignment");
const jwt = require("jsonwebtoken");

// Simple hardcoded admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === "admin@msme.gov.in" && password === "admin123") {
      const token = jwt.sign(
        { id: "admin", role: "admin" },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1d" }
      );
      return res.json({ token, user: { email, role: "admin" } });
    }
    
    res.status(401).json({ message: "Invalid admin credentials" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all companies with their questionnaire responses and employees
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().lean();
    
    const responses = await QuestionnaireResponse.find().lean();
    const users = await User.find({ companyId: { $in: companies.map(c => c._id) } })
      .select("name email role approvalStatus")
      .lean();
    
    const companiesWithDetails = companies.map(company => {
      const companyResponses = responses.filter(r => String(r.companyId) === String(company._id));
      const employees = users.filter(u => String(u.companyId) === String(company._id));
      return { ...company, responses: companyResponses, employees };
    });

    res.json(companiesWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/companies/:id/details
// Returns dept_head users for the company, grouped with their submitted answers
exports.getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get company
    const company = await Company.findById(id).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Get dept_head users for this company
    const deptHeads = await User.find({ companyId: id, role: "dept_head" })
      .select("name email department departments isHead")
      .lean();

    // Get all employee answers for this company
    const answers = await EmployeeAnswer.find({ companyId: id, submitted: true })
      .populate("employeeId", "name email")
      .lean();

    // Get all employees for this company
    const employees = await User.find({ companyId: id, role: { $ne: "dept_head" } })
      .select("name email role approvalStatus department")
      .lean();

    // Group answers by departmentId
    const answersByDept = {};
    for (const ans of answers) {
      if (!answersByDept[ans.departmentId]) {
        answersByDept[ans.departmentId] = [];
      }
      answersByDept[ans.departmentId].push(ans);
    }

    // Build department map from deptHeads
    const departments = deptHeads.map(dh => {
      const deptIds = dh.departments || (dh.department ? [dh.department] : []);
      return {
        _id: dh._id,
        name: dh.name,
        email: dh.email,
        isHead: dh.isHead,
        departments: deptIds,
        answers: deptIds.flatMap(d => answersByDept[d] || []),
      };
    });

    // Also get questionnaire responses (old system)
    const responses = await QuestionnaireResponse.find({ companyId: id }).lean();

    res.json({ company, departments, employees, responses, answersByDept });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all participants
exports.getParticipants = async (req, res) => {
  try {
    const participants = await User.find({ role: "participant" }).lean();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company approval status
exports.updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    );
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update participant approval status
exports.updateParticipantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mentors and evaluators
exports.getMentorsAndEvaluators = async (req, res) => {
  try {
    const personnel = await User.find({ role: { $in: ["mentor", "evaluator"] } }).lean();
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leaderId", "name email")
      .populate("memberIds", "name email")
      .lean();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await MentorAssignment.find()
      .populate("mentorId", "name email role")
      .populate({
        path: "teamId",
        populate: [
          { path: "leaderId", select: "name email" },
          { path: "memberIds", select: "name email" }
        ]
      })
      .lean();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign team
exports.assignTeam = async (req, res) => {
  try {
    const { mentorId, teamId, round } = req.body;
    const existing = await MentorAssignment.findOne({ mentorId, teamId });
    if (existing) {
      return res.status(400).json({ message: "Assignment already exists" });
    }
    const assignment = await MentorAssignment.create({ mentorId, teamId, round });
    const populated = await MentorAssignment.findById(assignment._id)
      .populate("mentorId", "name email role")
      .populate("teamId", "teamName industry");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active event
exports.getActiveEvent = async (req, res) => {
  res.json({ event: { name: "MSME Hackathon 2026", status: "active" } });
};

// Add personnel (mentor/evaluator)
exports.addPersonnel = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash(password || "password123", 10);
    const user = await User.create({ name, email, password: hash, role, approvalStatus: "approved" });
    user.password = undefined;
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
