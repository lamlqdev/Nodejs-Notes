import { User } from "../models/user";

let users: User[] = [];

export const getUsers = () => {
  return users;
};

export const createUser = (name: string, email: string) => {
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
  };

  users.push(newUser);
  return newUser;
};

export const getUserById = (id: string) => {
  return users.find((user) => user.id === id);
};

export const updateUser = (id: string, name: string, email: string) => {
  const user = getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  user.name = name;
  user.email = email;
  return user;
};

export const deleteUser = (id: string) => {
  const user = getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }
  users = users.filter((user) => user.id !== id);
  return user;
};
