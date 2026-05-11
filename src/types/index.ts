import { Role } from "@prisma/client";

export type UserRole = "SUPER_ADMIN" | "MANAGER" | "RESIDENT";

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
  managerId?: string;
  residentId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  managerId?: string;
  residentId?: string;
  iat?: number;
  exp?: number;
}

export interface PaginationParams {
  cursor?: string;
  take?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string | null;
  total?: number;
}
