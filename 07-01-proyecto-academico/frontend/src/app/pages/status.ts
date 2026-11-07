import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `<div class="card empty"><div class="big">⛔</div><h1>403 · Acceso denegado</h1>
    <p>Tu rol no permite ver esta sección. Se requiere el rol ADMIN.</p><br><a class="btn primary" routerLink="/panel">Volver al panel</a></div>`,
})
export class ForbiddenPage {}

@Component({
  imports: [RouterLink],
  template: `<div class="card empty"><div class="big">🧭</div><h1>404 · Página no encontrada</h1><br><a class="btn primary" routerLink="/panel">Volver al panel</a></div>`,
})
export class NotFoundPage {}
