import { Component, inject, signal } from '@angular/core';
import { ApiService, toApiError } from '../core/api.service';
import { ApiError } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ErrorBanner } from './error-banner';

@Component({
  selector: 'app-admin',
  imports: [ErrorBanner],
  template: `
    <div class="page-head"><div><h1>Administración <span class="badge">ADMIN</span></h1><p class="muted">Operaciones internas del servicio.</p></div></div>
    <div class="grid two">
      <section class="card">
        <h2>Estado del servicio</h2><br>
        <p><span class="badge" [class.ok]="health() === 'UP'" [class.err]="health() !== 'UP'">{{ health() ?? '…' }}</span>
          <span class="mono muted"> GET /internal/health (público)</span></p><br>
        <button class="btn" (click)="check()">Comprobar de nuevo</button>
      </section>
      <section class="card">
        <h2>Cargar datos de ejemplo</h2>
        <p class="muted">Crea tres estudiantes (si sus correos no existen) y dos cursos (solo si no hay ninguno).</p><br>
        <button class="btn primary" (click)="confirm.set(true)" [disabled]="busy()">Cargar datos de ejemplo</button>
        <app-error [error]="error()" />
        @if (result(); as r) { <div class="alert ok" style="margin-top:12px">✔ Creados: {{ r.students }} estudiantes y {{ r.courses }} cursos.</div> }
      </section>
    </div>
    @if (confirm()) {
      <div class="modal-bg" (click)="confirm.set(false)"><div class="card modal" (click)="$event.stopPropagation()" role="dialog">
        <h2>¿Cargar datos de ejemplo?</h2><p class="muted">Se llamará a POST /internal/seed.</p><br>
        <div class="row spread"><button class="btn" (click)="confirm.set(false)">Cancelar</button><button class="btn primary" (click)="seed()">Confirmar</button></div>
      </div></div>
    }`,
  styles: `.two { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items: start; }`,
})
export class AdminPage {
  private api = inject(ApiService); private toast = inject(ToastService);
  health = signal<string | null>(null); busy = signal(false); confirm = signal(false);
  error = signal<ApiError | null>(null); result = signal<{ students: number; courses: number } | null>(null);
  constructor() { this.check(); }
  check() { this.health.set(null); this.api.health().subscribe({ next: h => this.health.set(h.status), error: () => this.health.set('DOWN') }); }
  seed() {
    this.confirm.set(false); this.busy.set(true); this.error.set(null);
    this.api.seed().subscribe({
      next: r => { this.busy.set(false); this.result.set(r); this.toast.ok('Datos de ejemplo cargados.'); },
      error: e => { this.busy.set(false); this.error.set(toApiError(e)); },
    });
  }
}
