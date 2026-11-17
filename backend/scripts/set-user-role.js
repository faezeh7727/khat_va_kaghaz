require("dotenv").config();
const mongoose = require("mongoose");
const { UserModel } = require("../app/models/user");

async function main() {
  const [email, role] = process.argv.slice(2);
  const allowedRoles = ["READER", "AUTHOR", "ADMIN"];
  if (!email || !allowedRoles.includes(role)) {
    throw new Error("Usage: node scripts/set-user-role.js <email> <READER|AUTHOR|ADMIN>");
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from the backend environment.");
  await mongoose.connect(process.env.MONGODB_URI, { authSource: "admin" });
  const user = await UserModel.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { role } },
    { new: true, runValidators: true, projection: { name: 1, email: 1, role: 1 } }
  );
  if (!user) throw new Error(`No user found for ${email}`);
  console.log(`${user.email} is now ${user.role}.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
