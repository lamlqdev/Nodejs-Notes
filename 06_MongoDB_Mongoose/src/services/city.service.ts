import { City } from "../models/city.model";
import { CityFilter, PaginationOptions, PaginatedResult, CreateCityData, UpdateCityData } from "../types/city.types";

export async function findCities(
  filter: CityFilter = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<any>> {
  const query: Record<string, any> = { isActive: true };

  if (filter.country) {
    query.country = filter.country;
  }

  if (pagination) {
    const { page, limit, sort = { createdAt: -1 } } = pagination;
    const skip = (page - 1) * limit;

    const [cities, total] = await Promise.all([
      City.find(query).sort(sort).skip(skip).limit(limit).lean(),
      City.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: cities,
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

  const cities = await City.find(query).lean();
  return {
    data: cities,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: cities.length,
      itemsPerPage: cities.length,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function findCityById(id: string) {
  return await City.findOne({ _id: id, isActive: true });
}

export async function createCity(data: CreateCityData) {
  return await City.create(data);
}

export async function updateCity(id: string, data: UpdateCityData) {
  return await City.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function softDeleteCity(id: string) {
  return await City.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}
