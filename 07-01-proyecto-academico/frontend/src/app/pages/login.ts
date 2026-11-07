import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiError } from '../core/models';
import { toApiError } from '../core/api.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="wrap">
      <section class="card box">
        <div class="logo">🎓</div>
        <h1>Academia</h1>
        <p class="muted">Inicia sesión para gestionar estudiantes, cursos y matrículas.</p>
        <form [formGroup]="f" (ngSubmit)="submit()">
          <label>Usuario
            <input formControlName="username" autocomplete="username" />
            @if (f.controls.username.touched && f.controls.username.invalid) { <span class="field-err">es obligatorio</span> }
          </label>
          <label>Contraseña
            <span class="pw">
              <input formControlName="password" [type]="show() ? 'text' : 'password'" autocomplete="current-password" />
              <button type="button" class="btn icon" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Ocultar' : 'Mostrar'">{{ show() ? '🙈' : '👁' }}</button>
            </span>
            @if (f.controls.password.touched && f.controls.password.invalid) { <span class="field-err">es obligatorio</span> }
          </label>
          @if (error(); as e) { <div class="alert" role="alert">{{ e.status === 401 ? 'Usuario o contraseña incorrectos.' : e.message }}</div> }
          <button class="btn primary" [disabled]="loading()">{{ loading() ? 'Ingresando…' : 'Iniciar sesión' }}</button>
        </form>
        <div class="hint">
          <strong>Cuentas de práctica</strong>
          <button class="btn soft" type="button" (click)="fill('admin','admin123')"><span class="badge">ADMIN</span> admin / admin123</button>
          <button class="btn soft" type="button" (click)="fill('ana','ana123')"><span class="badge">USER</span> ana / ana123</button>
        </div>
      </section>
    </div>`,
  styles: `
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 16px; background: radial-gradient(circle at 20% 10%, var(--primary-soft), transparent 50%), var(--bg); }
    .box { width: min(420px, 100%); display: grid; gap: 14px; padding: 32px; }
    .logo { background: var(--primary); width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; font-size: 22px; }
    .pw { display: flex; gap: 6px; } .hint { display: grid; gap: 8px; border-top: 1px solid var(--border); padding-top: 14px; }
    .hint .btn { text-align: left; display: flex; gap: 8px; align-items: center; }`,
})
export class LoginPage {
  private auth = inject(AuthService); private router = inject(Router);
  f = inject(FormBuilder).nonNullable.group({ username: ['', Validators.required], password: ['', Validators.required] });
  show = signal(false); loading = signal(false); error = signal<ApiError | null>(null);

  constructor() { if (this.auth.isLoggedIn()) this.router.navigate(['/panel']); }
  fill(u: string, p: string) { this.f.setValue({ username: u, password: p }); }
  submit() {
    this.f.markAllAsTouched();
    if (this.f.invalid) return;
    this.loading.set(true); this.error.set(null);
    const { username, password } = this.f.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: e => { this.error.set(toApiError(e)); this.loading.set(false); },
    });
  }
}
