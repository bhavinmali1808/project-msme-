const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Assuming admin/auth protection as needed
const auditLogger = require("../middleware/auditLogger");
const { createTheme, getThemes, deleteTheme, updateTheme } = require("../controllers/themeController");

router.post("/", auth, auditLogger("CREATE_THEME", "Theme"), createTheme);
router.get("/", getThemes);
router.put("/:id", auth, updateTheme);
router.delete("/:id", auth, auditLogger("DELETE_THEME", "Theme"), deleteTheme);

module.exports = router;
