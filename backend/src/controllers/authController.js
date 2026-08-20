const User = require("../models/User");
const Company = require("../models/Company");
const University = require("../models/University");
const QuestionnaireResponse = require("../models/QuestionnaireResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}, "name");
    res.json(companies);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.registerWithQuestionnaire = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyId,
      newCompany,
      questionnaireAnswers
    } = req.body;

    // 1. Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Account name, email, password, and role are required."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    // 2. Handle Company linking or creation
    let targetCompanyId = companyId;
    let finalCompanyName = "";

    if (!targetCompanyId && newCompany && newCompany.name) {
      // Check if company already exists by name (case-insensitive)
      let company = await Company.findOne({
        name: { $regex: new RegExp("^" + newCompany.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      });

      if (!company) {
        company = await Company.create({
          name: newCompany.name,
          street: newCompany.street,
          city: newCompany.city,
          state: newCompany.state,
          country: newCompany.country,
          pinCode: newCompany.pinCode,
          contactPerson: newCompany.contactPerson || name,
          phone: newCompany.phone
        });
      }
      targetCompanyId = company._id;
      finalCompanyName = company.name;
    } else if (targetCompanyId) {
      const company = await Company.findById(targetCompanyId);
      if (!company) {
        return res.status(400).json({
          message: "Selected company does not exist."
        });
      }
      finalCompanyName = company.name;
    } else {
      return res.status(400).json({
        message: "Please select an existing company or register a new one."
      });
    }

    // 3. Create User
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || "company",
      companyId: targetCompanyId,
      companyName: finalCompanyName,
      contactPerson: name
    });

    // 4. Save Questionnaire Answers
    if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
      await QuestionnaireResponse.create({
        userId: user._id,
        companyId: targetCompanyId,
        answers: questionnaireAnswers
      });
    }

    // 5. Sign Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      companyEmail,
      companyPhone,
      street,
      city,
      state,
      country,
      pinCode,
      name,
      email,
      password
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      companyName,
      contactPerson,
      companyEmail,
      companyPhone,
      street,
      city,
      state,
      country,
      pinCode,
      name,
      email,
      password: hash,
      role: "company"
    });

    // Sign a token for immediate login
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, password, companyName, companyId, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      companyName,
      companyId: companyId || undefined,
      role: "participant"  // employees are always participants in the assessment system
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerParticipant = async (req, res) => {
  try {
    const { 
      name, email, phone, password, category,
      institutionName, // Legacy, ignore or save to college
      teamName, // Ignored, handled in Team model now
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hash,
      role: "participant",
      category,
      college: institutionName
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register a student (must provide valid, approved universityId)
exports.registerStudent = async (req, res) => {
  try {
    const {
      name, email, phone, password,
      universityId, studentId, department, year, gender, city, state, teamRole
    } = req.body;

    if (!name || !email || !password || !universityId) {
      return res.status(400).json({ message: "Name, email, password, and university are required" });
    }

    // Verify university exists and is approved
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(400).json({ message: "Selected university not found" });
    }
    if (university.approvalStatus !== "approved") {
      return res.status(400).json({ message: "Selected university is not yet approved for this hackathon" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, phone, password: hash,
      role: "participant",
      universityId,
      studentId,
      teamRole,
      college: university.name,
      department,
      category: "student",
      city, state,
      approvalStatus: "approved" // auto-approve students
    });

    // Increment university student count
    await University.findByIdAndUpdate(universityId, { $inc: { totalStudents: 1 } });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, universityId: user.universityId,
        college: user.college, category: user.category
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register a university admin account
exports.registerUniversity = async (req, res) => {
  try {
    const {
      universityName, city, state, websiteUrl,
      contactEmail, contactPhone,
      adminName, adminEmail, adminPassword
    } = req.body;

    if (!universityName || !contactEmail || !adminName || !adminEmail || !adminPassword || !city) {
      return res.status(400).json({ message: "University name, city, contact email, and admin details are required" });
    }

    // Check if university already registered
    const existingUni = await University.findOne({
      name: { $regex: new RegExp("^" + universityName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i") }
    });
    if (existingUni) {
      return res.status(400).json({ message: "This university is already registered in the system" });
    }

    // Check admin email
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email is already registered" });
    }

    // Check if it's a known university (for display purposes)
    const knownList = University.KNOWN_UNIVERSITIES || [];
    const isKnown = knownList.some(u => u.toLowerCase() === universityName.toLowerCase());

    // Create university record (pending admin approval)
    const university = await University.create({
      name: universityName,
      city,
      state: state || "Gujarat",
      websiteUrl,
      contactEmail,
      contactPhone,
      isKnownUniversity: isKnown,
      approvalStatus: isKnown ? "pending" : "pending" // all go through approval
    });

    // Create university admin user
    const hash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hash,
      role: "university",
      universityId: university._id,
      approvalStatus: "approved"
    });

    // Link admin to university
    await University.findByIdAndUpdate(university._id, { adminUserId: adminUser._id });

    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: adminUser._id, name: adminUser.name, email: adminUser.email,
        role: adminUser.role, universityId: adminUser.universityId
      },
      university: {
        _id: university._id, name: university.name,
        approvalStatus: university.approvalStatus, isKnownUniversity: university.isKnownUniversity
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};