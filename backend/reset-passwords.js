const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const MONGO_URI = "mongodb://localhost:27017/project-msme";

const reset = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const hash = await bcrypt.hash("password123", 10);
    
    // Set password123 for all universities and some participants
    const result = await User.updateMany(
      { email: { $in: ["test@nirma.com", "test@test.com", "st1@test.com", "st2@gmail.com", "bhavinx@gmail.com", "test.participant@example.com"] } },
      { $set: { password: hash } }
    );
    
    console.log(`Updated passwords for ${result.modifiedCount} users to 'password123'`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

reset();
