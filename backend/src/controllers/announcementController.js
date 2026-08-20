const Announcement = require("../models/Announcement");

// GET /api/announcements — Public (for students to read)
exports.getAnnouncements = async (req, res) => {
  try {
    const { audience } = req.query;
    const filter = { isPublished: true };
    if (audience && audience !== "all") {
      filter.audience = { $in: [audience, "all"] };
    }
    const announcements = await Announcement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/announcements/all — Admin: get all including unpublished
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ pinned: -1, createdAt: -1 })
      .limit(100);
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/announcements — Admin/Content-writer: create
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, type, audience, isPublished, pinned } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }
    const announcement = await Announcement.create({
      title, body,
      type: type || "General",
      audience: audience || "all",
      isPublished: isPublished !== undefined ? isPublished : true,
      pinned: pinned || false,
      authorId: req.user.id,
      authorName: req.user.name,
    });
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/announcements/:id — Admin/Content-writer: update
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, body, type, audience, isPublished, pinned } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, body, type, audience, isPublished, pinned },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/announcements/:id — Admin/Content-writer: delete
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    res.json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
