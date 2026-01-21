import { Request, Response, NextFunction } from "express";
import { findCities, findCityById, createCity as createCityService, updateCity as updateCityService, softDeleteCity as softDeleteCityService } from "../services/city.service";
import { CreateCityData, UpdateCityData } from "../types/city.types";

export async function getCities(req: Request, res: Response, next: NextFunction) {
  try {
    const { country, page, limit, sort } = req.query;

    const filter: any = {};
    if (country) {
      filter.country = country as string;
    }

    const pagination = page && limit ? {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: sort ? JSON.parse(sort as string) : { createdAt: -1 }
    } : undefined;

    const result = await findCities(filter, pagination);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCityById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "City ID is required" });
    }

    const city = await findCityById(id as string);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    res.status(200).json({ data: city });
  } catch (error) {
    next(error);
  }
}

export async function createCity(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, country, description } = req.body;

    // Basic validation
    if (!name || !country) {
      return res.status(400).json({ error: "Name and country are required" });
    }

    const cityData: CreateCityData = {
      name,
      country,
      description,
    };

    const city = await createCityService(cityData);
    res.status(201).json({ data: city });
  } catch (error) {
    next(error);
  }
}

export async function updateCity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, country, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: "City ID is required" });
    }

    const updateData: UpdateCityData = {};
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country;
    if (description !== undefined) updateData.description = description;

    const city = await updateCityService(id as string, updateData);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    res.status(200).json({ data: city });
  } catch (error) {
    next(error);
  }
}

export async function deleteCity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "City ID is required" });
    }

    const city = await softDeleteCityService(id as string);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    res.status(200).json({
      message: "City deleted successfully",
      data: city
    });
  } catch (error) {
    next(error);
  }
}
