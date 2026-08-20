const Theme = require("../models/Theme");

exports.createTheme = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const theme = await Theme.create({ name, color, description });
    res.status(201).json({ success: true, theme });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Theme with this name already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getThemes = async (req, res) => {
  try {
    const themes = await Theme.find().lean();
    res.json({ success: true, themes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTheme = async (req, res) => {
  try {
    await Theme.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      { name, color, description },
      { new: true }
    );
    if (!theme) return res.status(404).json({ message: "Theme not found" });
    res.json({ success: true, theme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

