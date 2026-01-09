export interface User {
  id: string;
  email: string;
  password: string; // hashed password
  name?: string;
  createdAt: Date;
}

// In-memory storage (temporary)
export const users: User[] = [];
