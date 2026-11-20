import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, UserProfile, ActivityLog, PageResponse, AvatarItem, UserDetail, RoleItem, PermissionItem, PaginatedResult, KeycloakConfig } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/users';
  private rolesUrl = 'http://localhost:8080/api/v1/roles';
  private permissionsUrl = 'http://localhost:8080/api/v1/permissions';
  private authUrl = 'http://localhost:8080/api/v1/auth';

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: any): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/change-password`, data);
  }

  uploadAvatar(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/avatar`, formData);
  }

  getUserAvatars(): Observable<ApiResponse<AvatarItem[]>> {
    return this.http.get<ApiResponse<AvatarItem[]>>(`${this.apiUrl}/avatars`);
  }

  requestEnable2fa(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/2fa/request-enable`, {});
  }

  confirmEnable2fa(otpCode: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/2fa/confirm-enable`, { otpCode });
  }

  disable2fa(password: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/2fa/disable`, { password });
  }

  getActivityLogs(page = 0, size = 10): Observable<ApiResponse<PageResponse<ActivityLog>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<ActivityLog>>>(`${this.apiUrl}/activity-logs`, { params });
  }

  // ==========================================
  // 1. QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)
  // ==========================================

  getUsers(keyword = '', page = 0, size = 10): Observable<ApiResponse<PaginatedResult<UserDetail>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }
    return this.http.get<ApiResponse<PaginatedResult<UserDetail>>>(this.apiUrl, { params });
  }

  createUser(data: any): Observable<ApiResponse<UserDetail>> {
    return this.http.post<ApiResponse<UserDetail>>(this.apiUrl, data);
  }

  getUserById(id: number): Observable<ApiResponse<UserDetail>> {
    return this.http.get<ApiResponse<UserDetail>>(`${this.apiUrl}/${id}`);
  }

  deleteUser(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }

  updateUserStatus(id: number, locked?: boolean, active?: boolean): Observable<ApiResponse<UserDetail>> {
    return this.http.put<ApiResponse<UserDetail>>(`${this.apiUrl}/${id}/status`, { locked, active });
  }

  resetUserPassword(id: number, newPassword: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  assignRoles(id: number, roles: string[]): Observable<ApiResponse<UserDetail>> {
    return this.http.put<ApiResponse<UserDetail>>(`${this.apiUrl}/${id}/roles`, { roles });
  }

  // ==========================================
  // 2. PHÂN QUYỀN RBAC (ROLES & PERMISSIONS)
  // ==========================================

  getRoles(page = 0, size = 10): Observable<ApiResponse<PaginatedResult<RoleItem>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PaginatedResult<RoleItem>>>(this.rolesUrl, { params });
  }

  createRole(data: any): Observable<ApiResponse<RoleItem>> {
    return this.http.post<ApiResponse<RoleItem>>(this.rolesUrl, data);
  }

  updateRole(id: number, data: any): Observable<ApiResponse<RoleItem>> {
    return this.http.put<ApiResponse<RoleItem>>(`${this.rolesUrl}/${id}`, data);
  }

  deleteRole(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.rolesUrl}/${id}`);
  }

  assignPermissionsToRole(roleId: number, permissionIds: number[]): Observable<ApiResponse<RoleItem>> {
    return this.http.put<ApiResponse<RoleItem>>(`${this.rolesUrl}/${roleId}/permissions`, permissionIds);
  }

  getPermissions(page = 0, size = 50): Observable<ApiResponse<PaginatedResult<PermissionItem>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PaginatedResult<PermissionItem>>>(this.permissionsUrl, { params });
  }

  createPermission(data: any): Observable<ApiResponse<PermissionItem>> {
    return this.http.post<ApiResponse<PermissionItem>>(this.permissionsUrl, data);
  }

  deletePermission(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.permissionsUrl}/${id}`);
  }

  // ==========================================
  // 3. KEYCLOAK IDENTITY PROVIDER CONFIG
  // ==========================================

  getKeycloakConfig(): Observable<ApiResponse<KeycloakConfig>> {
    return this.http.get<ApiResponse<KeycloakConfig>>(`${this.authUrl}/keycloak-config`);
  }
}
