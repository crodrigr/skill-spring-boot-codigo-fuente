import { Injectable, signal } from '@angular/core';
export interface Toast { id: number; kind: 'ok' | 'err' | 'warn'; text: string; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private n = 0;
  show(kind: Toast['kind'], text: string) {
    const id = ++this.n;
    this.toasts.update(t => [...t, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
  ok(t: string) { this.show('ok', t); }
  err(t: string) { this.show('err', t); }
  dismiss(id: number) { this.toasts.update(t => t.filter(x => x.id !== id)); }
}
