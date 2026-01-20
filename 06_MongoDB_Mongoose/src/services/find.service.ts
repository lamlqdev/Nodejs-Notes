import { User } from "../models/user.model";
import { UserFilter, PaginationOptions, PaginatedResult } from "../types/user.types";

export async function findUsers(
  filter: UserFilter = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<any>> {
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
  return await User.findById(id);
}

export async function findOneUser(filter: UserFilter) {
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

  return await User.findOne(query);
}
