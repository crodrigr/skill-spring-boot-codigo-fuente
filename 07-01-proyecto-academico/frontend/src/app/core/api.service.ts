import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiError, Course, CourseRequest, Enrolled, Enrollment, EnrollmentRequest, Me, Page, Student, StudentRequest } from './models';

/** Un solo punto de acceso a los endpoints del backend (ver Swagger en /swagger-ui.html). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // /api/v1/auth
  me() { return this.http.get<Me>('/api/v1/auth/me'); }

  // /api/v1/students
  students(page = 0, size = 10): Observable<Page<Student>> {
    return this.http.get<Page<Student>>('/api/v1/students', { params: new HttpParams().set('page', page).set('size', size) });
  }
  student(id: number) { return this.http.get<Student>(`/api/v1/students/${id}`); }
  studentByEmail(email: string) { return this.http.get<Student>('/api/v1/students/by-email', { params: { email } }); }
  createStudent(body: StudentRequest) { return this.http.post<Student>('/api/v1/students', body); }

  // /api/v1/courses
  courses(page = 0, size = 10): Observable<Page<Course>> {
    return this.http.get<Page<Course>>('/api/v1/courses', { params: new HttpParams().set('page', page).set('size', size) });
  }
  course(id: number) { return this.http.get<Course>(`/api/v1/courses/${id}`); }
  createCourse(body: CourseRequest) { return this.http.post<Course>('/api/v1/courses', body); }
  enrolled(id: number) { return this.http.get<Enrolled>(`/api/v1/courses/${id}/enrolled`); }

  // /api/v1/enrollments
  enrollment(id: number) { return this.http.get<Enrollment>(`/api/v1/enrollments/${id}`); }
  enroll(body: EnrollmentRequest) { return this.http.post<Enrollment>('/api/v1/enrollments', body); }

  // /internal
  health() { return this.http.get<{ status: string }>('/internal/health'); }
  seed() { return this.http.post<{ students: number; courses: number }>('/internal/seed', {}); }
}

/** Convierte cualquier fallo HTTP en el formato ErrorResponse del backend. */
export function toApiError(e: unknown): ApiError {
  if (e instanceof HttpErrorResponse) {
    const b = e.error;
    if (b && typeof b === 'object' && 'message' in b) return b as ApiError;
    return { status: e.status, message: e.status === 0 ? 'No hay conexión con el servidor.' : e.message };
  }
  return { status: 0, message: 'Error inesperado.' };
}
