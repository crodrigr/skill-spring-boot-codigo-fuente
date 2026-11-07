import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, toApiError } from '../core/api.service';
import { ApiError, Page, Student } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ErrorBanner } from './error-banner';

@Component({
  selector: 'app-students',
  imports: [ReactiveFormsModule, ErrorBanner],
  template: `
    <div class="page-head">
      <div><h1>Estudiantes</h1><p class="muted">Directorio de alumnos registrados.</p></div>
      <button class="btn primary" (click)="openForm()">+ Nuevo estudiante</button>
    </div>

    <section class="card">
      <form class="row search" (submit)="$event.preventDefault(); search()">
        <input [formControl]="email" type="search" placeholder="Buscar por correo exacto (ana@mail.com)" aria-label="Buscar por correo" />
        <button class="btn soft" [disabled]="!email.value.trim()">Buscar</button>
        @if (found() || searched()) { <button type="button" class="btn" (click)="clear()">Limpiar</button> }
      </form>
      <app-error [error]="searchError()" />

      @if (loading()) {
        <div class="grid" style="margin-top:16px"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
      } @else if (rows().length === 0) {
        <div class="empty"><div class="big">👥</div><p>No hay estudiantes{{ searched() ? ' con ese correo' : ' todavía' }}.</p></div>
      } @else {
        <div class="table-wrap"><table>
          <thead><tr><th>Id</th><th>Nombre</th><th>Edad</th><th>Correo</th></tr></thead>
          <tbody>@for (s of rows(); track s.id) {
            <tr><td class="mono">#{{ s.id }}</td>
              <td><div class="row"><div class="avatar">{{ initials(s.name) }}</div><strong>{{ s.name }}</strong></div></td>
              <td>{{ s.age }}</td><td>{{ s.email }}</td></tr>}
          </tbody></table></div>
        @if (!found() && page(); as p) {
          <div class="row spread pager">
            <span class="muted">Página {{ p.page + 1 }} de {{ p.totalPages || 1 }} · {{ p.totalElements }} estudiantes</span>
            <span class="row">
              <button class="btn" [disabled]="p.page === 0" (click)="load(p.page - 1)">← Anterior</button>
              <button class="btn" [disabled]="p.page + 1 >= p.totalPages" (click)="load(p.page + 1)">Siguiente →</button>
            </span>
          </div>
        }
      }
    </section>

    @if (formOpen()) {
      <div class="modal-bg" (click)="formOpen.set(false)">
        <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-label="Registrar estudiante">
          <h2>Registrar estudiante</h2><br>
          <form [formGroup]="f" (ngSubmit)="save()">
            <label>Nombre completo
              <input formControlName="name" />
              @if (show('name')) { <span class="field-err">{{ f.controls.name.hasError('required') ? 'es obligatorio' : 'debe tener entre 2 y 100 caracteres' }}</span> }
            </label>
            <label>Edad
              <input formControlName="age" type="number" />
              @if (show('age')) { <span class="field-err">debe estar entre 16 y 99</span> }
            </label>
            <label>Correo electrónico
              <input formControlName="email" type="email" />
              @if (show('email')) { <span class="field-err">{{ f.controls.email.hasError('required') ? 'es obligatorio' : 'no tiene formato de correo electrónico' }}</span> }
            </label>
            <app-error [error]="formError()" />
            <div class="row spread"><button type="button" class="btn" (click)="formOpen.set(false)">Cancelar</button>
              <button class="btn primary" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Registrar' }}</button></div>
          </form>
        </div>
      </div>
    }`,
  styles: `.search input { flex: 1; min-width: 220px; width: auto; } .pager { margin-top: 14px; }`,
})
export class StudentsPage {
  private api = inject(ApiService); private toast = inject(ToastService);
  email = inject(FormBuilder).nonNullable.control('');
  f = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    age: [18, [Validators.required, Validators.min(16), Validators.max(99)]],
    email: ['', [Validators.required, Validators.email]],
  });
  page = signal<Page<Student> | null>(null); found = signal<Student | null>(null);
  searched = signal(false); loading = signal(true);
  searchError = signal<ApiError | null>(null); formError = signal<ApiError | null>(null);
  formOpen = signal(false); saving = signal(false);

  rows = () => this.found() ? [this.found()!] : (this.page()?.content ?? []);
  constructor() { this.load(0); }
  initials = (n: string) => n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
  show(c: 'name' | 'age' | 'email') { const x = this.f.controls[c]; return x.invalid && (x.touched || x.dirty); }

  load(p: number) {
    this.loading.set(true);
    this.api.students(p, 10).subscribe({ next: r => { this.page.set(r); this.loading.set(false); }, error: e => { this.searchError.set(toApiError(e)); this.loading.set(false); } });
  }
  search() {
    const v = this.email.value.trim(); if (!v) return;
    this.searchError.set(null); this.searched.set(true);
    this.api.studentByEmail(v).subscribe({
      next: s => this.found.set(s),
      error: e => { this.found.set(null); const a = toApiError(e); if (a.status !== 404) this.searchError.set(a); this.page.update(p => p && { ...p, content: [] }); },
    });
  }
  clear() { this.email.setValue(''); this.found.set(null); this.searched.set(false); this.searchError.set(null); this.load(0); }
  openForm() { this.f.reset({ name: '', age: 18, email: '' }); this.formError.set(null); this.formOpen.set(true); }
  save() {
    this.f.markAllAsTouched(); if (this.f.invalid) return;
    this.saving.set(true); this.formError.set(null);
    this.api.createStudent(this.f.getRawValue()).subscribe({
      next: s => { this.saving.set(false); this.formOpen.set(false); this.toast.ok(`Estudiante ${s.name} registrado (id ${s.id}).`); this.clear(); },
      error: e => { this.saving.set(false); this.formError.set(toApiError(e)); },
    });
  }
}
