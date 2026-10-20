// src/types/user.types.ts

export type UserRole = 'CLIENT' | 'ADMIN' | 'LIVREUR' | 'TECHNICIEN';

export interface User {
  id:     string;
  name:   string;
  email:  string;
  role:   UserRole;
  token:  string;
  avatar?: string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface RegisterDto {
  name:     string;
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:  User;
  token: string;
}