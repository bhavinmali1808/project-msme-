const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getCompanies,
  getCompanyDetails,
  getParticipants,
  updateCompanyStatus,
  updateParticipantStatus,
  getMentorsAndEvaluators,
  getTeams,
  addPersonnel,
  getAssignments,
  assignTeam,
  getActiveEvent
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/companies", getCompanies);
router.get("/companies/:id/details", getCompanyDetails);
router.get("/participants", getParticipants);
router.get("/personnel", getMentorsAndEvaluators);
router.post("/personnel", addPersonnel);
router.get("/teams", getTeams);
router.get("/assignments", getAssignments);
router.post("/assignments", assignTeam);
router.get("/active-event", getActiveEvent);
router.put("/companies/:id/status", updateCompanyStatus);
router.put("/participants/:id/status", updateParticipantStatus);

module.exports = router;
