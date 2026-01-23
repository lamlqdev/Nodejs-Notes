import { User } from "../models/user.model";
import { UserFilter, PaginationOptions, PaginatedResult, CreateUserData, UpdateUserData } from "../types/user.types";
import { AppError } from "../middlewares/error.middleware";

export async function findUsers(
  filter: UserFilter = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<any>> {
  const query: Record<string, any> = { isActive: true };

  if (filter.username) {
    query.username = filter.username;
  }
  if (filter.email) {
    query.email = filter.email;
  }

  if (pagination) {
    const { page, limit, sort = { createdAt: -1 } } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  const users = await User.find(query).lean();
  return {
    data: users,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: users.length,
      itemsPerPage: users.length,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function findUserById(id: string) {
  return await User.findOne({ _id: id, isActive: true });
}

export async function createUser(data: CreateUserData) {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }
  return await User.create(data);
}

export async function updateUser(id: string, data: UpdateUserData) {
  return await User.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function softDeleteUser(id: string) {
  return await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}
