import { User } from "../models/user.model";
import { UserFilter } from "../types/user.types";

export async function deleteManyUsers(filter: UserFilter = {}) {
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

  return await User.deleteMany(query);
}

export async function deleteOneUser(filter: UserFilter) {
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

  return await User.deleteOne(query);
}

export async function findByIdAndDeleteUser(id: string) {
  return await User.findByIdAndDelete(id);
}

export async function findByIdAndRemoveUser(id: string) {
  return await User.findByIdAndDelete(id);
}

export async function findOneAndDeleteUser(filter: UserFilter) {
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

  return await User.findOneAndDelete(query);
}
