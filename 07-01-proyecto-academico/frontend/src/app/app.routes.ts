import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/http';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.LoginPage) },
  {
    path: '', canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'panel', loadComponent: () => import('./pages/dashboard').then(m => m.DashboardPage) },
      { path: 'estudiantes', loadComponent: () => import('./pages/students').then(m => m.StudentsPage) },
      { path: 'cursos', loadComponent: () => import('./pages/courses').then(m => m.CoursesPage) },
      { path: 'matriculas', loadComponent: () => import('./pages/enrollments').then(m => m.EnrollmentsPage) },
      { path: 'administracion', canActivate: [adminGuard], loadComponent: () => import('./pages/admin').then(m => m.AdminPage) },
      { path: 'acceso-denegado', loadComponent: () => import('./pages/status').then(m => m.ForbiddenPage) },
      { path: '**', loadComponent: () => import('./pages/status').then(m => m.NotFoundPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
