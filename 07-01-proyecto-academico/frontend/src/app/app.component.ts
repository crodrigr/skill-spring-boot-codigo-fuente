import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="alert" [class.ok]="t.kind === 'ok'" (click)="toast.dismiss(t.id)" role="status">{{ t.text }}</div>
      }
    </div>`,
  styles: `.toasts { position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; z-index: 100; max-width: 360px; }
    .alert { box-shadow: 0 8px 24px rgba(0,0,0,.2); cursor: pointer; }`,
})
export class AppComponent { toast = inject(ToastService); }
