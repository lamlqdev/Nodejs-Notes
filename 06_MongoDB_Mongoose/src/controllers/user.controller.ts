import { Request, Response, NextFunction } from "express";
import { findUsers, findUserById, createUser as createUserService, updateUser as updateUserService, softDeleteUser as softDeleteUserService } from "../services/user.service";
import { CreateUserData, UpdateUserData } from "../types/user.types";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, page, limit, sort } = req.query;
    
    const filter: any = {};
    if (username) {
      filter.username = username as string;
    }
    if (email) {
      filter.email = email as string;
    }

    const pagination = page && limit ? {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: sort ? JSON.parse(sort as string) : { createdAt: -1 }
    } : undefined;

    const result = await findUsers(filter, pagination);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await findUserById(id as string);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email } = req.body;

    // Basic validation
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    const userData: CreateUserData = {
      username,
      email,
    };

    const user = await createUserService(userData);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updateData: UpdateUserData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;

    const user = await updateUserService(id as string, updateData);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await softDeleteUserService(id as string);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ 
      message: "User deleted successfully",
      data: user 
    });
  } catch (error) {
    next(error);
  }
}
