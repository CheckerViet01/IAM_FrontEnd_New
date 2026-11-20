import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  authService = inject(AuthService);
  toast = inject(ToastService);

  activeTab: 'login' | 'register' = 'login';
  loading = signal(false);

  // Form Models
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  };

  // 2FA Modal
  show2faModal = signal(false);
  otpCode = '';
  pending2faEmail = '';

  // Forgot Password Modal
  showForgotModal = signal(false);
  forgotStep: 'email' | 'reset' = 'email';
  forgotEmail = '';
  resetData = {
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Password visibility
  showLoginPass = false;
  showRegPass = false;
  showRegConfirmPass = false;
  showResetPass = false;

  get passwordStrength(): { score: number; label: string; color: string } {
    const pass = this.registerData.password;
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 30, label: 'Mật khẩu yếu', color: '#f43f5e' };
    if (score <= 4) return { score: 70, label: 'Độ mạnh vừa đủ', color: '#fbbf24' };
    return { score: 100, label: 'Mật khẩu rất mạnh ✨', color: '#10b981' };
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.toast.warning('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data?.requires2fa) {
          this.pending2faEmail = this.loginData.email;
          this.show2faModal.set(true);
          this.toast.info('Tài khoản đã bật 2FA. Vui lòng nhập mã OTP gửi tới email của bạn!');
        } else {
          this.toast.success('Đăng nhập thành công! Chào mừng bạn trở lại ✨');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Email hoặc mật khẩu không chính xác';
        this.toast.error(msg);
      }
    });
  }

  onVerify2fa() {
    if (!this.otpCode || this.otpCode.length < 6) {
      this.toast.warning('Vui lòng nhập đúng 6 số mã OTP');
      return;
    }

    this.loading.set(true);
    this.authService.verify2fa(this.pending2faEmail, this.otpCode).subscribe({
      next: () => {
        this.loading.set(false);
        this.show2faModal.set(false);
        this.otpCode = '';
        this.toast.success('Xác thực 2FA thành công! Chào mừng bạn ✨');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Mã OTP không chính xác hoặc đã hết hạn!';
        this.toast.error(msg);
      }
    });
  }

  onRegister() {
    if (!this.registerData.email || !this.registerData.password) {
      this.toast.warning('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toast.error('Mật khẩu và xác nhận mật khẩu không khớp nhau!');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.toast.warning('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    this.loading.set(true);
    this.authService.register({
      email: this.registerData.email,
      password: this.registerData.password,
      fullName: this.registerData.fullName
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(res.message || 'Đăng ký thành công! Hãy đăng nhập ngay ✨');
        this.loginData.email = this.registerData.email;
        this.activeTab = 'login';
        this.registerData = { email: '', password: '', confirmPassword: '', fullName: '' };
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Đăng ký không thành công!';
        this.toast.error(msg);
      }
    });
  }

  openForgotPassword() {
    this.forgotStep = 'email';
    this.forgotEmail = this.loginData.email || '';
    this.resetData = { otpCode: '', newPassword: '', confirmPassword: '' };
    this.showForgotModal.set(true);
  }

  onSendForgotOtp() {
    if (!this.forgotEmail) {
      this.toast.warning('Vui lòng nhập Email để nhận mã đặt lại mật khẩu!');
      return;
    }

    this.loading.set(true);
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.forgotStep = 'reset';
        this.toast.success(res.message || 'Mã OTP đã được gửi đến email của bạn ✨');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Không tìm thấy tài khoản với email này!';
        this.toast.error(msg);
      }
    });
  }

  onResetPassword() {
    if (!this.resetData.otpCode || !this.resetData.newPassword) {
      this.toast.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      this.toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    this.loading.set(true);
    this.authService.resetPassword({
      email: this.forgotEmail,
      otpCode: this.resetData.otpCode,
      newPassword: this.resetData.newPassword,
      confirmPassword: this.resetData.confirmPassword
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.showForgotModal.set(false);
        this.toast.success(res.message || 'Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới ✨');
        this.loginData.email = this.forgotEmail;
        this.activeTab = 'login';
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Mã OTP không đúng hoặc đã hết hạn!';
        this.toast.error(msg);
      }
    });
  }
}
