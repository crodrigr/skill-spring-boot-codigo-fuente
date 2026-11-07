import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { ApiService, toApiError } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ApiError, Course, Page } from '../core/models';
import { ToastService } from '../core/toast.service';
import { ErrorBanner } from './error-banner';

@Component({
  selector: 'app-courses',
  imports: [ReactiveFormsModule, ErrorBanner, CurrencyPipe],
  template: `
    <div class="page-head">
      <div><h1>Cursos</h1><p class="muted">Catálogo, precios y cupos.</p></div>
      <button class="btn primary" [disabled]="!auth.isAdmin()" [title]="auth.isAdmin() ? '' : 'Solo ADMIN'" (click)="openForm()">+ Crear curso <span class="badge">ADMIN</span></button>
    </div>
    <app-error [error]="error()" />

    @if (loading()) {
      <div class="grid cards"><div class="card skeleton" style="height:140px"></div><div class="card skeleton" style="height:140px"></div></div>
    } @else if (!page()?.content?.length) {
      <div class="card empty"><div class="big">📚</div><p>No hay cursos todavía.@if (auth.isAdmin()) { Crea uno o carga datos de ejemplo en Administración. }</p></div>
    } @else {
      <div class="grid cards">
        @for (c of page()!.content; track c.id) {
          <article class="card">
            <div class="row spread"><span class="mono muted">#{{ c.id }}</span>
              <span class="badge" [class.err]="full(c)" [class.warn]="!full(c) && pct(c) >= 80" [class.ok]="pct(c) < 80">{{ full(c) ? 'Agotado' : pct(c) + '% ocupado' }}</span></div>
            <h2 style="margin:8px 0 2px">{{ c.name }}</h2>
            <p><strong>{{ c.price | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</strong> <span class="muted">COP</span></p>
            <div class="bar" [class.full]="full(c)" [class.high]="!full(c) && pct(c) >= 80" style="margin:12px 0 6px"><i [style.width.%]="pct(c)"></i></div>
            <p class="muted">Matriculados: <strong>{{ enrolled()[c.id] ?? '…' }}</strong> de {{ c.maxCapacity }}</p>
          </article>
        }
      </div>
      @if (page(); as p) {
        <div class="row spread" style="margin-top:14px">
          <span class="muted">Página {{ p.page + 1 }} de {{ p.totalPages || 1 }} · {{ p.totalElements }} cursos</span>
          <span class="row"><button class="btn" [disabled]="p.page === 0" (click)="load(p.page - 1)">← Anterior</button>
            <button class="btn" [disabled]="p.page + 1 >= p.totalPages" (click)="load(p.page + 1)">Siguiente →</button></span>
        </div>
      }
    }

    @if (formOpen()) {
      <div class="modal-bg" (click)="formOpen.set(false)">
        <div class="card modal" (click)="$event.stopPropagation()" role="dialog" aria-label="Crear curso">
          <h2>Crear curso</h2><br>
          <form [formGroup]="f" (ngSubmit)="save()">
            <label>Nombre del curso
              <input formControlName="name" placeholder="Java desde cero" />
              @if (show('name')) { <span class="field-err">debe tener entre 2 y 100 caracteres</span> }
            </label>
            <label>Precio en pesos
              <input formControlName="price" type="number" />
              @if (show('price')) { <span class="field-err">debe ser mayor que cero</span> }
            </label>
            <label>Cupo máximo
              <input formControlName="maxCapacity" type="number" />
              @if (show('maxCapacity')) { <span class="field-err">debe ser 1 o más</span> }
            </label>
            <app-error [error]="formError()" />
            <div class="row spread"><button type="button" class="btn" (click)="formOpen.set(false)">Cancelar</button>
              <button class="btn primary" [disabled]="saving()">{{ saving() ? 'Creando…' : 'Crear curso' }}</button></div>
          </form>
        </div>
      </div>
    }`,
  styles: `.cards { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }`,
})
export class CoursesPage {
  private api = inject(ApiService); private toast = inject(ToastService);
  auth = inject(AuthService);
  f = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    maxCapacity: [30, [Validators.required, Validators.min(1)]],
  });
  page = signal<Page<Course> | null>(null); enrolled = signal<Partial<Record<number, number>>>({});
  loading = signal(true); error = signal<ApiError | null>(null);
  formOpen = signal(false); saving = signal(false); formError = signal<ApiError | null>(null);

  constructor() { this.load(0); }
  pct = (c: Course) => Math.min(100, Math.round(((this.enrolled()[c.id] ?? 0) / c.maxCapacity) * 100));
  full = (c: Course) => (this.enrolled()[c.id] ?? 0) >= c.maxCapacity;
  show(c: 'name' | 'price' | 'maxCapacity') { const x = this.f.controls[c]; return x.invalid && (x.touched || x.dirty); }

  load(p: number) {
    this.loading.set(true);
    this.api.courses(p, 12).subscribe({
      next: r => {
        this.page.set(r); this.loading.set(false);
        (r.content.length ? forkJoin(r.content.map(c => this.api.enrolled(c.id))) : of([])).subscribe(list =>
          this.enrolled.set(Object.fromEntries(list.map(e => [e.courseId, e.enrolled]))));
      },
      error: e => { this.error.set(toApiError(e)); this.loading.set(false); },
    });
  }
  openForm() { this.f.reset({ name: '', price: 0, maxCapacity: 30 }); this.formError.set(null); this.formOpen.set(true); }
  save() {
    this.f.markAllAsTouched(); if (this.f.invalid) return;
    this.saving.set(true); this.formError.set(null);
    this.api.createCourse(this.f.getRawValue()).subscribe({
      next: c => { this.saving.set(false); this.formOpen.set(false); this.toast.ok(`Curso «${c.name}» creado (id ${c.id}).`); this.load(0); },
      error: e => { this.saving.set(false); this.formError.set(toApiError(e)); },
    });
  }
}
