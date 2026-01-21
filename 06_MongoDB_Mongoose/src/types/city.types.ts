export interface CityFilter {
  country?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateCityData {
  name: string;
  country: string;
  description?: string;
}

export interface UpdateCityData {
  name?: string;
  country?: string;
  description?: string;
}
