import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { UserProfile, ActivityLog, AvatarItem, UserDetail, RoleItem, PermissionItem, KeycloakConfig } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  toast = inject(ToastService);

  activeTab: 'profile' | 'avatar' | 'security' | 'logs' | 'users' | 'rbac' = 'profile';
  loading = signal(false);

  // Keycloak Config
  keycloakConfig = signal<KeycloakConfig | null>(null);

  // User profile
  profile = signal<UserProfile | null>(null);

  // Profile Edit Form
  profileForm = {
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE'
  };

  // Avatar Studio
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;
  avatarList = signal<AvatarItem[]>([]);

  // Change Password Form
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  showOldPass = false;
  showNewPass = false;
  showConfirmPass = false;

  // 2FA Management
  showEnable2faModal = signal(false);
  showDisable2faModal = signal(false);
  enable2faOtp = '';
  disable2faPassword = '';

  // Activity Logs
  activityLogs = signal<ActivityLog[]>([]);
  currentPage = 0;
  totalPages = 0;
  totalLogs = 0;

  // ==========================================
  // USER MANAGEMENT STATE
  // ==========================================
  userList = signal<UserDetail[]>([]);
  userKeyword = '';
  userPage = 0;
  userTotalPages = 0;
  userTotalElements = 0;

  showCreateUserModal = signal(false);
  showResetPassModal = signal(false);
  showAssignRolesModal = signal(false);
  showUserDetailModal = signal(false);
  selectedUserForAction: UserDetail | null = null;

  newUserForm = {
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    gender: 'MALE',
    selectedRole: 'ROLE_USER'
  };
  adminResetPassword = '';
  selectedRolesForUser: string[] = [];

  // ==========================================
  // RBAC STATE
  // ==========================================
  rbacSubTab: 'roles' | 'permissions' = 'roles';
  roleList = signal<RoleItem[]>([]);
  permissionList = signal<PermissionItem[]>([]);
  showCreateRoleModal = signal(false);
  showAssignPermsModal = signal(false);
  showCreatePermModal = signal(false);

  newRoleForm = {
    name: '',
    description: ''
  };

  newPermForm = {
    name: '',
    module: 'USER',
    description: ''
  };

  selectedRoleForPerms: RoleItem | null = null;
  selectedPermIds: number[] = [];

  // Helper check permissions
  hasUserManagementPermission(): boolean {
    const roles = this.profile()?.roles || [];
    return roles.includes('USER_MANAGER') || roles.includes('SYSTEM_ADMIN') || roles.includes('ROLE_ADMIN');
  }

  hasSystemAdminPermission(): boolean {
    const roles = this.profile()?.roles || [];
    return roles.includes('SYSTEM_ADMIN') || roles.includes('ROLE_ADMIN');
  }

  ngOnInit() {
    this.loadProfile();
    this.loadKeycloakConfig();
  }

  loadKeycloakConfig() {
    this.userService.getKeycloakConfig().subscribe({
      next: (res) => {
        if (res.data) {
          this.keycloakConfig.set(res.data);
        }
      },
      error: () => {}
    });
  }

  loadProfile() {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data) {
          this.profile.set(res.data);
          this.authService.updateCurrentUser(res.data);
          this.profileForm = {
            fullName: res.data.fullName || '',
            phoneNumber: res.data.phoneNumber || '',
            address: res.data.address || '',
            dateOfBirth: res.data.dateOfBirth || '',
            gender: res.data.gender || 'MALE'
          };
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onTabChange(tab: 'profile' | 'avatar' | 'security' | 'logs' | 'users' | 'rbac') {
    this.activeTab = tab;
    if (tab === 'avatar') {
      this.loadAvatars();
    } else if (tab === 'logs') {
      this.loadLogs(0);
    } else if (tab === 'users') {
      this.loadUsers(0);
    } else if (tab === 'rbac') {
      this.loadRoles();
      this.loadPermissions();
    }
  }

  // --- Profile Update ---
  onUpdateProfile() {
    this.loading.set(true);
    this.userService.updateProfile(this.profileForm).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data) {
          this.profile.set(res.data);
          this.authService.updateCurrentUser(res.data);
        }
        this.toast.success('Cập nhật thông tin cá nhân thành công! ✨');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Cập nhật thất bại!';
        this.toast.error(msg);
      }
    });
  }

  // --- Avatar Studio ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Kích thước ảnh tối đa 5MB!');
        return;
      }
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onUploadAvatar() {
    if (!this.selectedAvatarFile) {
      this.toast.warning('Vui lòng chọn một tệp ảnh để tải lên!');
      return;
    }

    this.loading.set(true);
    this.userService.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Cập nhật ảnh đại diện thành công! 📸');
        this.selectedAvatarFile = null;
        this.avatarPreviewUrl = null;
        this.loadProfile();
        this.loadAvatars();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Tải ảnh lên thất bại!';
        this.toast.error(msg);
      }
    });
  }

  loadAvatars() {
    this.userService.getUserAvatars().subscribe({
      next: (res) => {
        if (res.data) {
          this.avatarList.set(res.data);
        }
      }
    });
  }

  getAvatarSrc(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url}`;
  }

  // --- Password Management ---
  onChangePassword() {
    if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
      this.toast.warning('Vui lòng điền đầy đủ các thông tin mật khẩu!');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    this.loading.set(true);
    this.userService.changePassword(this.passwordForm).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.');
        this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Đổi mật khẩu thất bại!';
        this.toast.error(msg);
      }
    });
  }

  // --- 2FA Management ---
  onOpenEnable2fa() {
    this.loading.set(true);
    this.userService.requestEnable2fa().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.info('Mã OTP kích hoạt 2FA đã được gửi về email của bạn!');
        this.enable2faOtp = '';
        this.showEnable2faModal.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Yêu cầu kích hoạt 2FA thất bại!';
        this.toast.error(msg);
      }
    });
  }

  onConfirmEnable2fa() {
    if (!this.enable2faOtp || this.enable2faOtp.trim().length !== 6) {
      this.toast.warning('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    this.loading.set(true);
    this.userService.confirmEnable2fa(this.enable2faOtp.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Kích hoạt xác thực 2 bước (2FA) thành công! 🛡️');
        this.showEnable2faModal.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Xác thực OTP thất bại!';
        this.toast.error(msg);
      }
    });
  }

  onOpenDisable2fa() {
    this.disable2faPassword = '';
    this.showDisable2faModal.set(true);
  }

  onConfirmDisable2fa() {
    if (!this.disable2faPassword) {
      this.toast.warning('Vui lòng nhập mật khẩu xác nhận!');
      return;
    }

    this.loading.set(true);
    this.userService.disable2fa(this.disable2faPassword).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Đã tắt bảo vệ 2FA thành công.');
        this.showDisable2faModal.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Tắt 2FA thất bại!';
        this.toast.error(msg);
      }
    });
  }

  // --- Activity Logs ---
  loadLogs(page = 0) {
    this.userService.getActivityLogs(page, 10).subscribe({
      next: (res) => {
        if (res.data) {
          this.activityLogs.set(res.data.content);
          this.currentPage = res.data.number;
          this.totalPages = res.data.totalPages;
          this.totalLogs = res.data.totalElements;
        }
      }
    });
  }

  // ==========================================
  // USER MANAGEMENT METHODS (YÊU CẦU 2 & 6)
  // ==========================================

  loadUsers(page = 0) {
    this.loading.set(true);
    this.userService.getUsers(this.userKeyword, page, 10).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data) {
          this.userList.set(res.data.content);
          this.userPage = res.data.pageNumber;
          this.userTotalPages = res.data.totalPages;
          this.userTotalElements = res.data.totalElements;
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Không thể tải danh sách người dùng!');
      }
    });
  }

  onSearchUsers() {
    this.loadUsers(0);
  }

  openCreateUserModal() {
    this.newUserForm = {
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      address: '',
      gender: 'MALE',
      selectedRole: 'ROLE_USER'
    };
    this.showCreateUserModal.set(true);
  }

  onCreateUserSubmit() {
    if (!this.newUserForm.email || !this.newUserForm.password) {
      this.toast.warning('Email và mật khẩu không được để trống!');
      return;
    }

    const payload = {
      email: this.newUserForm.email,
      password: this.newUserForm.password,
      fullName: this.newUserForm.fullName,
      phoneNumber: this.newUserForm.phoneNumber,
      address: this.newUserForm.address,
      gender: this.newUserForm.gender,
      roles: [this.newUserForm.selectedRole]
    };

    this.loading.set(true);
    this.userService.createUser(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Tạo người dùng ${res.data?.email} thành công! Đồng bộ Keycloak OK! 🚀`);
        this.showCreateUserModal.set(false);
        this.loadUsers(0);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Tạo người dùng thất bại!');
      }
    });
  }

  onToggleUserStatus(user: UserDetail) {
    const newLockState = !user.isLocked;
    const actionName = newLockState ? 'Khóa' : 'Mở khóa';

    if (!confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản ${user.email}?`)) {
      return;
    }

    this.loading.set(true);
    this.userService.updateUserStatus(user.id, newLockState, !newLockState).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`${actionName} tài khoản ${user.email} thành công! (Đã sync Keycloak)`);
        this.loadUsers(this.userPage);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Cập nhật trạng thái thất bại!');
      }
    });
  }

  onDeleteUser(user: UserDetail) {
    if (!confirm(`Bạn có chắc chắn muốn XÓA MỀM người dùng ${user.email}? Dữ liệu sẽ được ẩn bằng cờ deleted=1.`)) {
      return;
    }

    this.loading.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Đã xóa mềm người dùng ${user.email} thành công! 🗑️`);
        this.loadUsers(this.userPage);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Xóa người dùng thất bại!');
      }
    });
  }

  openResetPassModal(user: UserDetail) {
    this.selectedUserForAction = user;
    this.adminResetPassword = '';
    this.showResetPassModal.set(true);
  }

  onAdminResetPassSubmit() {
    if (!this.selectedUserForAction || !this.adminResetPassword || this.adminResetPassword.length < 6) {
      this.toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    this.loading.set(true);
    this.userService.resetUserPassword(this.selectedUserForAction.id, this.adminResetPassword).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Đặt lại mật khẩu cho ${this.selectedUserForAction?.email} thành công! (Đã sync Keycloak)`);
        this.showResetPassModal.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Đặt lại mật khẩu thất bại!');
      }
    });
  }

  openAssignRolesModal(user: UserDetail) {
    this.selectedUserForAction = user;
    this.selectedRolesForUser = [...(user.roles || [])];
    this.showAssignRolesModal.set(true);
    if (this.roleList().length === 0) {
      this.loadRoles();
    }
  }

  toggleRoleSelection(roleName: string) {
    const idx = this.selectedRolesForUser.indexOf(roleName);
    if (idx >= 0) {
      this.selectedRolesForUser.splice(idx, 1);
    } else {
      this.selectedRolesForUser.push(roleName);
    }
  }

  onAssignRolesSubmit() {
    if (!this.selectedUserForAction || this.selectedRolesForUser.length === 0) {
      this.toast.warning('Vui lòng chọn ít nhất 1 vai trò!');
      return;
    }

    this.loading.set(true);
    this.userService.assignRoles(this.selectedUserForAction.id, this.selectedRolesForUser).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Cập nhật vai trò cho ${this.selectedUserForAction?.email} thành công!`);
        this.showAssignRolesModal.set(false);
        this.loadUsers(this.userPage);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Gán vai trò thất bại!');
      }
    });
  }

  openUserDetailModal(user: UserDetail) {
    this.selectedUserForAction = user;
    this.showUserDetailModal.set(true);
  }

  // ==========================================
  // RBAC METHODS (YÊU CẦU 3 & 6)
  // ==========================================

  loadRoles() {
    this.userService.getRoles(0, 50).subscribe({
      next: (res) => {
        if (res.data) {
          this.roleList.set(res.data.content);
        }
      }
    });
  }

  loadPermissions() {
    this.userService.getPermissions(0, 100).subscribe({
      next: (res) => {
        if (res.data) {
          this.permissionList.set(res.data.content);
        }
      }
    });
  }

  openCreateRoleModal() {
    this.newRoleForm = { name: '', description: '' };
    this.showCreateRoleModal.set(true);
  }

  onCreateRoleSubmit() {
    if (!this.newRoleForm.name) {
      this.toast.warning('Tên vai trò không được để trống!');
      return;
    }

    this.loading.set(true);
    this.userService.createRole(this.newRoleForm).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Tạo vai trò ${res.data?.name} thành công! 🛡️`);
        this.showCreateRoleModal.set(false);
        this.loadRoles();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Tạo vai trò thất bại!');
      }
    });
  }

  onDeleteRole(role: RoleItem) {
    if (!confirm(`Bạn có chắc chắn muốn xóa mềm vai trò ${role.name}?`)) return;

    this.loading.set(true);
    this.userService.deleteRole(role.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success(`Đã xóa mềm vai trò ${role.name}!`);
        this.loadRoles();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Xóa vai trò thất bại!');
      }
    });
  }

  openAssignPermsModal(role: RoleItem) {
    this.selectedRoleForPerms = role;
    this.selectedPermIds = (role.permissions || []).map(p => p.id);
    this.showAssignPermsModal.set(true);
  }

  togglePermSelection(permId: number) {
    const idx = this.selectedPermIds.indexOf(permId);
    if (idx >= 0) {
      this.selectedPermIds.splice(idx, 1);
    } else {
      this.selectedPermIds.push(permId);
    }
  }

  onSaveRolePermissions() {
    if (!this.selectedRoleForPerms) return;

    this.loading.set(true);
    this.userService.assignPermissionsToRole(this.selectedRoleForPerms.id, this.selectedPermIds).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Cập nhật danh sách quyền cho vai trò ${this.selectedRoleForPerms?.name} thành công!`);
        this.showAssignPermsModal.set(false);
        this.loadRoles();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Gán quyền thất bại!');
      }
    });
  }

  openCreatePermModal() {
    this.newPermForm = { name: '', module: 'USER', description: '' };
    this.showCreatePermModal.set(true);
  }

  onCreatePermSubmit() {
    if (!this.newPermForm.name || !this.newPermForm.module) {
      this.toast.warning('Tên quyền và Module không được để trống!');
      return;
    }

    this.loading.set(true);
    this.userService.createPermission(this.newPermForm).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Tạo quyền ${res.data?.name} thành công!`);
        this.showCreatePermModal.set(false);
        this.loadPermissions();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Tạo quyền thất bại!');
      }
    });
  }

  onDeletePermission(perm: PermissionItem) {
    if (!confirm(`Bạn có chắc chắn muốn xóa mềm quyền ${perm.name}?`)) return;

    this.loading.set(true);
    this.userService.deletePermission(perm.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success(`Đã xóa mềm quyền ${perm.name}!`);
        this.loadPermissions();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || 'Xóa quyền thất bại!');
      }
    });
  }

  // --- Logout ---
  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.toast.info('Đã đăng xuất khỏi phiên làm việc.');
      },
      error: () => {
        this.authService.clearSession();
      }
    });
  }
}
