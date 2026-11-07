import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Course } from '../core/models';
import { RecentService } from '../core/recent.service';

interface Probe { path: string; label: string; status: number | null; ms: number | null; }

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="page-head">
      <div>
        <h1>¡Bienvenido de nuevo, {{ auth.user()?.username }}!</h1>
        <p class="muted">Monitoreo de operaciones académicas sobre la API REST.</p>
      </div>
      <div class="row">
        <a class="btn soft" routerLink="/estudiantes">Nuevo estudiante</a>
        <a class="btn soft" routerLink="/matriculas">Nueva matrícula</a>
        @if (auth.isAdmin()) { <a class="btn primary" routerLink="/cursos">Crear curso</a> }
      </div>
    </div>

    <div class="grid stats">
      <div class="card"><p class="muted label">ESTUDIANTES REGISTRADOS</p><p class="num">{{ loading() ? '…' : students() }}</p></div>
      <div class="card"><p class="muted label">CURSOS ACTIVOS</p><p class="num">{{ loading() ? '…' : courseTotal() }}</p>
        <p class="muted"><span class="badge" [class.err]="fullCount() > 0">{{ fullCount() }} llenos</span></p></div>
      <div class="card"><p class="muted label">MATRÍCULAS EN CURSOS</p><p class="num">{{ loading() ? '…' : totalEnrolled() }}</p>
        <p class="muted">Capacidad total: {{ capacity() }}</p></div>
      <div class="card"><p class="muted label">CUPOS LIBRES</p><p class="num">{{ loading() ? '…' : capacity() - totalEnrolled() }}</p>
        <p class="muted">{{ capacity() ? ((totalEnrolled() / capacity()) * 100).toFixed(1) : 0 }}% asignado</p></div>
    </div>

    <div class="grid cols">
      <section class="card">
        <div class="row spread"><div><h2>Ocupación de cursos</h2><p class="muted">Matriculados frente al cupo máximo.</p></div>
          <a class="btn" routerLink="/cursos">Ver todos →</a></div>
        <div class="list">
          @if (loading()) { <div class="skeleton"></div><div class="skeleton"></div> }
          @for (c of courses(); track c.id) {
            <div class="item">
              <div class="row spread"><strong>{{ c.name }}</strong><strong>{{ c.price | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</strong></div>
              <div class="bar" [class.full]="pct(c) >= 100" [class.high]="pct(c) >= 80 && pct(c) < 100"><i [style.width.%]="pct(c)"></i></div>
              <div class="row spread muted"><span>Matriculados: <b>{{ enrolled()[c.id] ?? 0 }}</b> de {{ c.maxCapacity }}</span>
                <span class="badge" [class.err]="pct(c) >= 100" [class.warn]="pct(c) >= 80 && pct(c) < 100" [class.ok]="pct(c) < 80">{{ pct(c) >= 100 ? 'Agotado' : pct(c) + '% ocupado' }}</span></div>
            </div>
          } @empty { @if (!loading()) { <div class="empty">No hay cursos. Carga datos de ejemplo desde Administración.</div> } }
        </div>
      </section>

      <section class="card">
        <h2>Matrículas recientes</h2><p class="muted">Creadas desde esta aplicación en este navegador.</p>
        <div class="list">
          @for (e of recent.items(); track e.id) {
            <div class="item row"><div class="avatar">{{ e.studentName.slice(0, 2).toUpperCase() }}</div>
              <div style="flex:1;min-width:0"><strong>{{ e.studentName }}</strong> <span class="mono muted">#{{ e.id }}</span><br><span class="muted">{{ e.courseName }}</span></div></div>
          } @empty { <div class="empty">Aún no hay matrículas recientes.</div> }
        </div>
        <a class="btn soft wide" routerLink="/matriculas">Ir a matrículas</a>
      </section>
    </div>

    <div class="grid cols">
      <section class="card">
        <div class="row spread"><h2>Estado de la API REST</h2>
          <span class="badge" [class.ok]="allUp()" [class.err]="!allUp()">{{ allUp() ? 'Operativa' : 'Con fallas' }}</span></div>
        <div class="grid probes">
          @for (p of probes(); track p.path) {
            <div class="item"><p class="mono">{{ p.path }}</p><p class="muted">{{ p.label }}</p>
              <p><span class="badge" [class.ok]="p.status === 200" [class.err]="p.status !== 200">{{ p.status ?? '…' }}</span>
                <span class="mono muted"> {{ p.ms ?? '–' }}ms</span></p></div>
          }
        </div>
      </section>
      <section class="card">
        <h2>Sesión &amp; JWT</h2>
        <dl>
          <dt>Usuario</dt><dd>{{ auth.user()?.username }}</dd>
          <dt>Rol</dt><dd><span class="badge">ROLE_{{ auth.user()?.role }}</span></dd>
          <dt>Vigencia</dt><dd class="mono">{{ auth.secondsLeft() }} s</dd>
          <dt>Esquema</dt><dd class="mono">Bearer (HS256)</dd>
        </dl>
      </section>
    </div>`,
  styles: `
    .stats { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 700; letter-spacing: .06em; } .num { font-size: 36px; font-weight: 800; line-height: 1.2; }
    .cols { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); margin-bottom: 16px; align-items: start; }
    .list { display: grid; gap: 10px; margin: 14px 0; } .item { background: var(--surface-2); border-radius: 12px; padding: 14px; display: grid; gap: 8px; }
    .item.row { display: flex; } .wide { display: block; text-align: center; text-decoration: none; }
    .probes { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); margin-top: 14px; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 10px 16px; margin: 14px 0 0; } dt { color: var(--muted); } dd { margin: 0; text-align: right; }`,
})
export class DashboardPage {
  private api = inject(ApiService);
  auth = inject(AuthService); recent = inject(RecentService);
  loading = signal(true);
  students = signal(0); courseTotal = signal(0);
  courses = signal<Course[]>([]); enrolled = signal<Partial<Record<number, number>>>({});
  probes = signal<Probe[]>([
    { path: '/auth/me', label: 'Sesión y roles', status: null, ms: null },
    { path: '/students', label: 'Directorio de alumnos', status: null, ms: null },
    { path: '/courses', label: 'Catálogo y cupos', status: null, ms: null },
    { path: '/internal/health', label: 'Estado del servicio', status: null, ms: null },
  ]);

  totalEnrolled = computed(() => Object.values(this.enrolled()).reduce((a: number, b) => a + (b ?? 0), 0));
  capacity = computed(() => this.courses().reduce((a, c) => a + c.maxCapacity, 0));
  fullCount = computed(() => this.courses().filter(c => (this.enrolled()[c.id] ?? 0) >= c.maxCapacity).length);
  allUp = computed(() => this.probes().every(p => p.status === null || p.status === 200));
  pct = (c: Course) => Math.min(100, Math.round(((this.enrolled()[c.id] ?? 0) / c.maxCapacity) * 100));

  constructor() {
    this.probe(0, this.api.me()); this.probe(3, this.api.health());
    this.probe(1, this.api.students(0, 1), p => this.students.set(p.totalElements));
    this.probe(2, this.api.courses(0, 50), p => {
      this.courseTotal.set(p.totalElements); this.courses.set(p.content);
      (p.content.length ? forkJoin(p.content.map(c => this.api.enrolled(c.id))) : of([])).subscribe(list => {
        this.enrolled.set(Object.fromEntries(list.map(e => [e.courseId, e.enrolled]))); this.loading.set(false);
      });
    });
  }

  private probe<T>(i: number, req: import('rxjs').Observable<T>, ok?: (v: T) => void) {
    const t0 = performance.now();
    const set = (status: number) => this.probes.update(ps => ps.map((p, j) => j === i ? { ...p, status, ms: Math.round(performance.now() - t0) } : p));
    req.subscribe({ next: v => { set(200); ok?.(v); }, error: e => { set(e.status || 0); this.loading.set(false); } });
  }
}
