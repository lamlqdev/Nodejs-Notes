import { Request, Response, NextFunction } from "express";
import { findPlaces, findPlaceById, createPlace as createPlaceService, updatePlace as updatePlaceService, softDeletePlace as softDeletePlaceService } from "../services/place.service";
import { CreatePlaceData, UpdatePlaceData } from "../types/place.types";

export async function getPlaces(req: Request, res: Response, next: NextFunction) {
  try {
    const { city, category, page, limit, sort } = req.query;
    
    const filter: any = {};
    if (city) {
      filter.city = city as string;
    }
    if (category) {
      filter.category = category as string;
    }

    const pagination = page && limit ? {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: sort ? JSON.parse(sort as string) : { createdAt: -1 }
    } : undefined;

    const result = await findPlaces(filter, pagination);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPlaceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const place = await findPlaceById(id as string);
    
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json({ data: place });
  } catch (error) {
    next(error);
  }
}

export async function createPlace(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, city, description, category, address } = req.body;

    // Basic validation
    if (!name || !city) {
      return res.status(400).json({ error: "Name and city are required" });
    }

    const placeData: CreatePlaceData = {
      name,
      city,
      description,
      category,
      address,
    };

    const place = await createPlaceService(placeData);
    res.status(201).json({ data: place });
  } catch (error) {
    next(error);
  }
}

export async function updatePlace(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, city, description, category, address } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const updateData: UpdatePlaceData = {};
    if (name !== undefined) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (address !== undefined) updateData.address = address;

    const place = await updatePlaceService(id as string, updateData);
    
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json({ data: place });
  } catch (error) {
    next(error);
  }
}

export async function deletePlace(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const place = await softDeletePlaceService(id as string);
    
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }

    res.status(200).json({ 
      message: "Place deleted successfully",
      data: place 
    });
  } catch (error) {
    next(error);
  }
}
