import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Me, LoginResponse } from './models';
import { switchMap, tap } from 'rxjs';

const TOKEN_KEY = 'academia.token';
const ME_KEY = 'academia.me';

function read<T>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) ?? 'null'); } catch { return null; } }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<Me | null>(read<Me>(ME_KEY));
  private now = signal(Date.now());

  readonly isLoggedIn = computed(() => !!this.token() && this.secondsLeft() > 0);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  /** Segundos de vigencia restantes según el claim `exp` del JWT. */
  readonly secondsLeft = computed(() => {
    const exp = this.exp(this.token());
    return exp ? Math.max(0, Math.floor(exp - this.now() / 1000)) : 0;
  });

  constructor() { setInterval(() => this.now.set(Date.now()), 1000); }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>('/api/v1/auth/login', { username, password }).pipe(
      tap(r => { localStorage.setItem(TOKEN_KEY, r.token); this.token.set(r.token); }),
      switchMap(() => this.http.get<Me>('/api/v1/auth/me')),
      tap(me => { localStorage.setItem(ME_KEY, JSON.stringify(me)); this.user.set(me); }),
    );
  }

  logout(redirect = true) {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(ME_KEY);
    this.token.set(null); this.user.set(null);
    if (redirect) this.router.navigate(['/login']);
  }

  private exp(t: string | null): number | null {
    try { return t ? JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp : null; } catch { return null; }
  }
}
