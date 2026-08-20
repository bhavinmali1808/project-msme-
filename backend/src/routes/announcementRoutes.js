const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/announcementController");
const auth = require("../middleware/auth");

// Public — anyone can read published announcements
router.get("/", ctrl.getAnnouncements);

// Admin/content-writer only
router.get("/all", auth, ctrl.getAllAnnouncements);
router.post("/", auth, ctrl.createAnnouncement);
router.put("/:id", auth, ctrl.updateAnnouncement);
router.delete("/:id", auth, ctrl.deleteAnnouncement);

module.exports = router;
