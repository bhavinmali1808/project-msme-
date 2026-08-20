const mongoose = require("mongoose");
require("dotenv").config();

async function approveUniversities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const University = require("./src/models/University");
    
    // Find all pending universities and approve them
    const updated = await University.updateMany(
      { approvalStatus: "pending" },
      { $set: { approvalStatus: "approved" } }
    );
    
    console.log(`Successfully approved ${updated.modifiedCount} universities.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

approveUniversities();
