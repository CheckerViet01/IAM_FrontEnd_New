export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  isActive: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  requires2fa: boolean;
  message?: string;
  user?: UserProfile;
}

export interface ActivityLog {
  id: number;
  action: string;
  status: 'SUCCESS' | 'FAILED' | string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PaginatedResult<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserDetail {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  isLocked: boolean;
  deleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  roles: string[];
  permissions: string[];
}

export interface PermissionItem {
  id: number;
  name: string;
  module: string;
  description?: string;
  deleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
}

export interface RoleItem {
  id: number;
  name: string;
  description?: string;
  deleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  permissions: PermissionItem[];
}

export interface KeycloakConfig {
  enabled: boolean;
  serverUrl: string;
  realm: string;
  clientId: string;
  loginUrl: string;
}

export interface AvatarItem {
  id: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  isCurrent: boolean;
  uploadedAt: string;
}
