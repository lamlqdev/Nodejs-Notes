import { connectDB, disconnectDB } from "./db";
import {
  createUser,
  findUsers,
  findUserByEmail,
  updateUserAge,
  deleteUserByEmail,
} from "./queries";

async function main() {
  console.log("👉 Starting MongoDB demo");

  await connectDB();

  try {
    console.log("👉 Starting demo for User queries");

    // 1. Create a new user
    const newUser = await createUser({
      name: "Lam",
      email: "lam@example.com",
      age: 25,
    } as any);
    console.log("✅ Created user:", newUser);

    // 2. Find all users
    const allUsers = await findUsers();
    console.log("📦 All users:", allUsers);

    // 3. Find user by email
    const foundUser = await findUserByEmail("lam@example.com");
    console.log("🔍 User by email:", foundUser);

    // 4. Update user's age
    const updatedUser = await updateUserAge("lam@example.com", 30);
    console.log("✏️ User after updating age:", updatedUser);

    // 5. Delete user by email
    const deleteResult = await deleteUserByEmail("lam@example.com");
    console.log("🗑 Delete user result:", deleteResult);
  } catch (error) {
    console.error("❌ Error while running demo:", error);
  } finally {
    await disconnectDB();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
