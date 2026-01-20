import { User } from "../models/user.model";
import { UserFilter, UpdateUserData } from "../types/user.types";

export async function findByIdAndUpdateUser(
  id: string,
  update: UpdateUserData,
  options?: { new?: boolean; runValidators?: boolean }
) {
  return await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    ...options,
  });
}

export async function findOneAndUpdateUser(
  filter: UserFilter,
  update: UpdateUserData,
  options?: { new?: boolean; runValidators?: boolean }
) {
  const query: Record<string, any> = {};
  
  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }
  if (filter.avatar) {
    query.avatar = filter.avatar;
  }

  return await User.findOneAndUpdate(query, update, {
    new: true,
    runValidators: true,
    ...options,
  });
}

export async function findOneAndReplaceUser(
  filter: UserFilter,
  replacement: UpdateUserData & { email: string },
  options?: { new?: boolean }
) {
  const query: Record<string, any> = {};
  
  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }
  if (filter.avatar) {
    query.avatar = filter.avatar;
  }

  return await User.findOneAndReplace(query, replacement, {
    new: true,
    ...options,
  });
}

export async function updateManyUsers(
  filter: UserFilter,
  update: UpdateUserData,
  options?: { runValidators?: boolean }
) {
  const query: Record<string, any> = {};
  
  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }
  if (filter.avatar) {
    query.avatar = filter.avatar;
  }

  return await User.updateMany(query, update, {
    runValidators: true,
    ...options,
  });
}

export async function updateOneUser(
  filter: UserFilter,
  update: UpdateUserData,
  options?: { runValidators?: boolean }
) {
  const query: Record<string, any> = {};
  
  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }
  if (filter.avatar) {
    query.avatar = filter.avatar;
  }

  return await User.updateOne(query, update, {
    runValidators: true,
    ...options,
  });
}

export async function replaceOneUser(
  filter: UserFilter,
  replacement: UpdateUserData & { email: string },
  options?: any
) {
  const query: Record<string, any> = {};
  
  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }
  if (filter.avatar) {
    query.avatar = filter.avatar;
  }

  return await User.replaceOne(query, replacement, options);
}
