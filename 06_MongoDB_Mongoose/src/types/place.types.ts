export interface PlaceFilter {
  city?: string;
  category?: 'restaurant' | 'hotel' | 'attraction' | 'museum' | 'park' | 'other';
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

export interface CreatePlaceData {
  name: string;
  city: string;
  description?: string;
  category?: 'restaurant' | 'hotel' | 'attraction' | 'museum' | 'park' | 'other';
  address?: string;
}

export interface UpdatePlaceData {
  name?: string;
  city?: string;
  description?: string;
  category?: 'restaurant' | 'hotel' | 'attraction' | 'museum' | 'park' | 'other';
  address?: string;
}
