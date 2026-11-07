import { Component, input } from '@angular/core';
import { ApiError } from '../core/models';

/** Muestra el ErrorResponse del backend, con el detalle campo por campo si existe. */
@Component({
  selector: 'app-error',
  template: `
    @if (error(); as e) {
      <div class="alert" role="alert">
        <strong>{{ e.status }} {{ e.error }}</strong> — {{ e.message }}
        @if (e.details?.length) { <ul>@for (d of e.details; track d.field) { <li><b>{{ d.field }}</b>: {{ d.message }}</li> }</ul> }
      </div>
    }`,
})
export class ErrorBanner { error = input<ApiError | null>(null); }
