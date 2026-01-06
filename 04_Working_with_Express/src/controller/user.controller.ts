import { Request, Response } from "express";
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/user.service";

export function getUsersController(req: Request, res: Response) {
  const users = getUsers();
  res.json(users);
}

export function createUserController(req: Request, res: Response) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  const newUser = createUser(name, email);
  res.status(201).json(newUser);
}

export function getUserByIdController(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const user = getUserById(id);
  res.json(user);
}

export function updateUserController(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  const user = updateUser(id, name, email);
  res.json(user);
}

export function deleteUserController(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const user = deleteUser(id);
  res.json(user);
}
