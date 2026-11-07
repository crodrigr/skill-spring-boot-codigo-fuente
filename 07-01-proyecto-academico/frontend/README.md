# Academia — frontend Angular 19

Cliente web del backend `../backend/academica-security` (Spring Boot + JWT). Diseño de referencia: `../backend/diseño.png`.

## Ejecutar
1. Levantar el backend (MySQL en `localhost:3306`): `cd ../backend/academica-security && ./mvnw spring-boot:run`
2. `npm install && npm start` → http://localhost:4200

`proxy.conf.json` reenvía `/api` y `/internal` a `http://localhost:8080`, así que no hace falta CORS.
Cuentas: `admin / admin123` (ADMIN) y `ana / ana123` (USER). Con ADMIN, usa Administración → *Cargar datos de ejemplo*.

## Endpoints usados (`src/app/core/api.service.ts`)
| Pantalla | Endpoint |
|---|---|
| Login / sesión | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| Estudiantes | `GET /students?page&size`, `GET /students/by-email`, `POST /students` |
| Cursos | `GET /courses`, `POST /courses` (ADMIN), `GET /courses/{id}/enrolled` |
| Matrículas | `POST /enrollments`, `GET /enrollments/{id}` |
| Administración | `GET /internal/health`, `POST /internal/seed` (ADMIN) |

## Notas
- El JWT se guarda en `localStorage`; el interceptor (`core/http.ts`) lo envía como `Bearer`, redirige al login en 401 y avisa en 403.
- El backend no lista matrículas: «Matrículas recientes» del panel recuerda las creadas desde esta app.
- Del diseño no se incluyen datos que la API no ofrece (docentes, tendencias, latencias reales de microservicios, WebSocket).
