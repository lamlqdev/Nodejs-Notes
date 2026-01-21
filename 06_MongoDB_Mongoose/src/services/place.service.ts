import { Place } from "../models/place.model";
import { PlaceFilter, PaginationOptions, PaginatedResult, CreatePlaceData, UpdatePlaceData } from "../types/place.types";
import mongoose from "mongoose";

export async function findPlaces(
  filter: PlaceFilter = {},
  pagination?: PaginationOptions
): Promise<PaginatedResult<any>> {
  const query: Record<string, any> = {};
  
  if (filter.city) {
    query.city = new mongoose.Types.ObjectId(filter.city);
  }
  
  if (filter.category) {
    query.category = filter.category;
  }

  if (pagination) {
    const { page, limit, sort = { createdAt: -1 } } = pagination;
    const skip = (page - 1) * limit;

    const [places, total] = await Promise.all([
      Place.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Place.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: places,
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

  const places = await Place.find(query).lean();
  return {
    data: places,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: places.length,
      itemsPerPage: places.length,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function findPlaceById(id: string) {
  return await Place.findById(id).populate('city', 'name country description');
}

export async function createPlace(data: CreatePlaceData) {
  return await Place.create({
    ...data,
    city: new mongoose.Types.ObjectId(data.city),
  });
}

export async function updatePlace(id: string, data: UpdatePlaceData) {
  const updateData: any = { ...data };
  if (data.city) {
    updateData.city = new mongoose.Types.ObjectId(data.city);
  }
  
  return await Place.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
}

export async function softDeletePlace(id: string) {
  return await Place.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
}
