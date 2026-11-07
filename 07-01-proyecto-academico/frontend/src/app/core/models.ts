export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }
export interface Student { id: number; name: string; age: number; email: string; }
export interface StudentRequest { name: string; age: number; email: string; }
export interface Course { id: number; name: string; price: number; maxCapacity: number; }
export interface CourseRequest { name: string; price: number; maxCapacity: number; }
export interface Enrolled { courseId: number; enrolled: number; }
export interface Enrollment { id: number; studentId: number; studentName: string; courseId: number; courseName: string; }
export interface EnrollmentRequest { studentId: number; courseId: number; }
export interface LoginResponse { token: string; tokenType: string; expiresIn: number; }
export interface Me { username: string; role: 'ADMIN' | 'USER'; }
export interface ApiError {
  timestamp?: string; status: number; error?: string; message: string; path?: string;
  details?: { field: string; message: string }[];
}
