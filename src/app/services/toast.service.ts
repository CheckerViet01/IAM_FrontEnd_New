import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message };
    
    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, title = 'Thành công ✨') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Có lỗi xảy ra ⚠️') {
    this.show('error', message, title, 5000);
  }

  info(message: string, title = 'Thông báo ℹ️') {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Cảnh báo ⚡') {
    this.show('warning', message, title);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
