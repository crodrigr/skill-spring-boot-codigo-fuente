import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, toApiError } from '../core/api.service';
import { ApiError, Course, Enrollment, Student } from '../core/models';
import { RecentService } from '../core/recent.service';
import { ErrorBanner } from './error-banner';

@Component({
  selector: 'app-enrollments',
  imports: [ReactiveFormsModule, ErrorBanner],
  template: `
    <div class="page-head"><div><h1>Matrículas</h1><p class="muted">Matricula estudiantes en cursos y consulta una matrícula por id.</p></div></div>
    <div class="grid two">
      <section class="card">
        <h2>Matricular estudiante</h2><br>
        <form [formGroup]="f" (ngSubmit)="enroll()">
          <label>Estudiante
            <select formControlName="studentId">
              <option [ngValue]="null" disabled>Selecciona un estudiante</option>
              @for (s of students(); track s.id) { <option [ngValue]="s.id">{{ s.name }} · {{ s.email }}</option> }
            </select>
            @if (touched('studentId')) { <span class="field-err">es obligatorio</span> }
          </label>
          <label>Curso
            <select formControlName="courseId">
              <option [ngValue]="null" disabled>Selecciona un curso</option>
              @for (c of courses(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
            </select>
            @if (touched('courseId')) { <span class="field-err">es obligatorio</span> }
          </label>
          <app-error [error]="error()" />
          <button class="btn primary" [disabled]="saving()">{{ saving() ? 'Matriculando…' : 'Matricular' }}</button>
        </form>
        @if (created(); as e) {
          <div class="alert ok" style="margin-top:14px">✔ <strong>201 Created</strong> — matrícula <span class="mono">#{{ e.id }}</span>: {{ e.studentName }} → {{ e.courseName }}</div>
        }
      </section>

      <section class="card">
        <h2>Buscar matrícula por id</h2><br>
        <form class="row" (submit)="$event.preventDefault(); lookup()">
          <input [formControl]="searchId" type="number" placeholder="Id de la matrícula" aria-label="Id de la matrícula" style="flex:1;width:auto" />
          <button class="btn soft">Buscar</button>
        </form>
        <app-error [error]="searchError()" />
        @if (found(); as e) {
          <div class="detail">
            <p class="mono muted">MATRÍCULA #{{ e.id }}</p>
            <p><span class="muted">Estudiante</span><br><strong>{{ e.studentName }}</strong> <span class="mono muted">(#{{ e.studentId }})</span></p>
            <p><span class="muted">Curso</span><br><strong>{{ e.courseName }}</strong> <span class="mono muted">(#{{ e.courseId }})</span></p>
          </div>
        }
      </section>
    </div>`,
  styles: `.two { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items: start; } .detail { display: grid; gap: 12px; margin-top: 16px; background: var(--surface-2); padding: 16px; border-radius: 12px; }`,
})
export class EnrollmentsPage {
  private api = inject(ApiService); private recent = inject(RecentService);
  f = inject(FormBuilder).group({ studentId: [null as number | null, Validators.required], courseId: [null as number | null, Validators.required] });
  searchId = inject(FormBuilder).control<number | null>(null);
  students = signal<Student[]>([]); courses = signal<Course[]>([]);
  saving = signal(false); error = signal<ApiError | null>(null); created = signal<Enrollment | null>(null);
  found = signal<Enrollment | null>(null); searchError = signal<ApiError | null>(null);

  constructor() {
    this.api.students(0, 50).subscribe(p => this.students.set(p.content));
    this.api.courses(0, 50).subscribe(p => this.courses.set(p.content));
  }
  touched(c: 'studentId' | 'courseId') { const x = this.f.controls[c]; return x.invalid && x.touched; }

  enroll() {
    this.f.markAllAsTouched(); if (this.f.invalid) return;
    this.saving.set(true); this.error.set(null); this.created.set(null);
    const { studentId, courseId } = this.f.getRawValue();
    this.api.enroll({ studentId: studentId!, courseId: courseId! }).subscribe({
      next: e => { this.saving.set(false); this.created.set(e); this.recent.add(e); this.f.reset(); },
      error: e => { this.saving.set(false); this.error.set(toApiError(e)); },
    });
  }
  lookup() {
    const id = this.searchId.value; if (!id) return;
    this.searchError.set(null); this.found.set(null);
    this.api.enrollment(id).subscribe({ next: e => this.found.set(e), error: e => this.searchError.set(toApiError(e)) });
  }
}
