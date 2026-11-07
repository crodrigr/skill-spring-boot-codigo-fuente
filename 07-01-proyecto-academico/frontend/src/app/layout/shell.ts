import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside [class.open]="menu()">
      <div class="brand">
        <div class="logo">🎓</div>
        <div><strong>Academia</strong><small>SAAS ACADEMIC</small></div>
      </div>
      <nav (click)="menu.set(false)">
        <a routerLink="/panel" routerLinkActive="active">Panel</a>
        <a routerLink="/estudiantes" routerLinkActive="active">Estudiantes</a>
        <a routerLink="/cursos" routerLinkActive="active">Cursos</a>
        <a routerLink="/matriculas" routerLinkActive="active">Matrículas</a>
        @if (auth.isAdmin()) {
          <a routerLink="/administracion" routerLinkActive="active">Administración <span class="badge">ADMIN</span></a>
        }
      </nav>
      <div class="me card">
        <div class="avatar">{{ initials() }}</div>
        <div class="who"><strong>{{ auth.user()?.username }}</strong><span class="badge">{{ auth.user()?.role }}</span></div>
        <button class="btn icon" (click)="auth.logout()" aria-label="Cerrar sesión" title="Cerrar sesión">⎋</button>
      </div>
    </aside>

    <div class="main">
      <header>
        <button class="btn icon burger" (click)="menu.set(!menu())" aria-label="Menú">☰</button>
        <span class="badge ok mono">● SESIÓN ACTIVA</span>
        <span class="badge info mono" title="Tiempo restante del JWT">⏱ JWT: {{ remaining() }}</span>
        <span class="grow"></span>
        <button class="btn icon" (click)="toggleTheme()" aria-label="Cambiar tema">{{ dark() ? '☀' : '☾' }}</button>
      </header>
      <main><router-outlet /></main>
    </div>`,
  styles: `
    :host { display: grid; grid-template-columns: 244px 1fr; min-height: 100vh; }
    aside { background: var(--surface); border-right: 1px solid var(--border); padding: 20px 14px; display: flex; flex-direction: column; gap: 22px; position: sticky; top: 0; height: 100vh; }
    .brand { display: flex; gap: 10px; align-items: center; padding: 0 6px; }
    .brand small { display: block; font-size: 10px; letter-spacing: .1em; color: var(--muted); }
    .logo { background: var(--primary); width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
    nav { display: grid; gap: 4px; flex: 1; align-content: start; }
    nav a { padding: 11px 14px; border-radius: 12px; text-decoration: none; color: var(--muted); font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
    nav a:hover { background: var(--surface-2); color: var(--text); }
    nav a.active { background: var(--primary); color: var(--primary-ink); }
    nav a.active .badge { background: rgba(255,255,255,.25); color: inherit; }
    .me { display: flex; gap: 10px; align-items: center; padding: 10px; box-shadow: none; }
    .who { display: grid; flex: 1; min-width: 0; gap: 2px; justify-items: start; }
    header { display: flex; gap: 10px; align-items: center; padding: 14px 32px; position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(8px); z-index: 10; }
    .grow { flex: 1; }
    main { padding: 8px 32px 40px; max-width: 1280px; }
    .burger { display: none; }
    @media (max-width: 860px) {
      :host { grid-template-columns: 1fr; }
      aside { position: fixed; inset: 0 auto 0 0; width: 260px; z-index: 40; transform: translateX(-100%); transition: transform .2s; }
      aside.open { transform: none; box-shadow: var(--shadow); }
      .burger { display: inline-block; }
      header, main { padding-left: 16px; padding-right: 16px; }
    }`,
})
export class Shell {
  auth = inject(AuthService);
  menu = signal(false);
  dark = signal(document.documentElement.dataset['theme'] === 'dark');
  initials = computed(() => (this.auth.user()?.username ?? '?').slice(0, 2).toUpperCase());
  remaining = computed(() => {
    const s = this.auth.secondsLeft();
    return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
  });

  constructor() {
    try { const t = localStorage.getItem('academia.theme'); if (t) { document.documentElement.dataset['theme'] = t; this.dark.set(t === 'dark'); } } catch {}
  }
  toggleTheme() {
    const t = this.dark() ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = t; this.dark.set(t === 'dark');
    try { localStorage.setItem('academia.theme', t); } catch {}
  }
}
