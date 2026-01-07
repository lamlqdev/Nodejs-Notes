import { User, IUser } from "./models/User";

// Create a new user
export async function createUser(data: Pick<IUser, "name" | "email" | "age">) {
  const user = await User.create(data);
  return user;
}

// Find all users (you can pass a simple filter)
export async function findUsers(filter: Partial<Pick<IUser, "name" | "email">> = {}) {
  const users = await User.find(filter).lean();
  return users;
}

// Find a single user by email
export async function findUserByEmail(email: string) {
  const user = await User.findOne({ email }).lean();
  return user;
}

// Update user's age by email
export async function updateUserAge(email: string, age: number) {
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { age } },
    { new: true } // return the document after the update
  ).lean();

  return user;
}

// Delete user by email
export async function deleteUserByEmail(email: string) {
  const result = await User.deleteOne({ email });
  return result;
}
