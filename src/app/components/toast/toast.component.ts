import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type">
          <div class="toast-glow"></div>
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            } @else if (toast.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            } @else if (toast.type === 'warning') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 22px;
      right: 22px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }
    .toast-item {
      position: relative;
      overflow: hidden;
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 16px;
      background: rgba(18, 11, 38, 0.9);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      box-shadow: 0 14px 35px rgba(5, 2, 18, 0.65), 0 0 24px rgba(255, 107, 157, 0.18);
      animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      border: 1px solid rgba(255, 154, 196, 0.25);
    }
    .toast-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }
    .toast-success {
      border-color: rgba(52, 211, 153, 0.45);
      .toast-glow { background: #34d399; box-shadow: 0 0 12px #34d399; }
      .toast-icon { color: #34d399; }
    }
    .toast-error {
      border-color: rgba(251, 113, 133, 0.45);
      .toast-glow { background: #fb7185; box-shadow: 0 0 12px #fb7185; }
      .toast-icon { color: #fb7185; }
    }
    .toast-warning {
      border-color: rgba(251, 191, 36, 0.45);
      .toast-glow { background: #fbbf24; box-shadow: 0 0 12px #fbbf24; }
      .toast-icon { color: #fbbf24; }
    }
    .toast-info {
      border-color: rgba(34, 211, 238, 0.45);
      .toast-glow { background: #22d3ee; box-shadow: 0 0 12px #22d3ee; }
      .toast-icon { color: #22d3ee; }
    }
    .toast-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #fdfaff;
      margin-bottom: 2px;
      font-family: var(--font-display, sans-serif);
    }
    .toast-message {
      font-size: 0.82rem;
      color: #dcd6f7;
      line-height: 1.45;
    }
    .toast-close {
      background: none;
      border: none;
      color: #9f96c7;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: color 0.2s;
      &:hover { color: #ff6b9d; }
    }
    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
