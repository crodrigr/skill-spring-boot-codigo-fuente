import { Injectable, signal } from '@angular/core';
import { Enrollment } from './models';

export interface RecentEnrollment extends Enrollment { at: number; }
const KEY = 'academia.recent';

/**
 * El backend no tiene un endpoint para listar matrículas, así que el panel
 * recuerda (en este navegador) las que se crearon desde esta aplicación.
 */
@Injectable({ providedIn: 'root' })
export class RecentService {
  readonly items = signal<RecentEnrollment[]>(this.read());
  add(e: Enrollment) {
    const next = [{ ...e, at: Date.now() }, ...this.items()].slice(0, 6);
    this.items.set(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }
  private read(): RecentEnrollment[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } }
}
