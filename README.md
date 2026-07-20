# Peluquería SaaS — Plataforma Multi-Tenant para Peluquerías Caninas

SaaS multi-tenant que permite a múltiples peluquerías caninas registrarse, gestionar clientes, mascotas, citas e historial de servicios bajo un modelo de suscripción por planes (Básico / Intermedio / Pro).

## Stack

- **Backend**: ASP.NET Core 8, Clean Architecture, EF Core, PostgreSQL, ASP.NET Identity, JWT, MediatR, FluentValidation, Serilog.
- **Frontend**: React 18 + TypeScript + Vite, TailwindCSS 4, React Router, React Query, Axios, React Hook Form + Zod.
- **Infraestructura (dev)**: Docker Compose (PostgreSQL). Producción futura: VPS + Nginx + GitHub Actions + Cloudinary.

## Estrategia Multi-Tenant

Shared Database + Shared Schema: cada tabla de negocio lleva `TenantId`, aplicado automáticamente vía EF Core Global Query Filters y reforzado con PostgreSQL Row-Level Security como defensa en profundidad. Resolución de tenant por claim JWT (dashboard autenticado) o por slug público (`/f/{slug}` del formulario). Camino de migración a base de datos dedicada por tenant disponible para clientes enterprise, sin cambios de arquitectura.

## Estructura del repositorio

```
backend/
  src/Domain/          Entidades, Value Objects, eventos de dominio — sin dependencias externas
  src/Application/      Casos de uso (MediatR), DTOs, validadores, interfaces de infraestructura
  src/Infrastructure/    EF Core, Identity, Serilog, implementaciones concretas (mocks locales para pagos/WhatsApp)
  src/Api/               Controllers, middleware de resolución de tenant, Swagger
  tests/Application.Tests/
frontend/
  src/                   SPA: landing, dashboard por tenant, panel de administración de plataforma, formulario público
docker-compose.yml       PostgreSQL local
```

## Cómo correr el proyecto localmente

1. Levantar la base de datos:
   ```
   docker compose up -d
   ```
2. Backend (desde `backend/`), disponible en `http://localhost:5273`:
   ```
   dotnet run --project src/Api --launch-profile http
   ```
3. Frontend (desde `frontend/`), disponible en `http://localhost:5173` (proxy `/api` → backend):
   ```
   npm install
   npm run dev
   ```

> Nota: Postgres se expone en el puerto **5433** (no 5432) y el backend en **5273** (no 5000/5001) porque esta máquina ya tiene otros proyectos usando los puertos por defecto.

Las fotos y firmas del formulario público se guardan en `backend/src/Api/App_Data/uploads/` (fuera de git) y se sirven desde `/uploads`. Es la implementación local de `IFileStorage`; Cloudinary se conecta después implementando la misma interfaz.

## Estado del roadmap

- [x] Fase 0 — Setup (solución Clean Architecture, scaffold React, Docker Compose)
- [x] Fase 1 — Núcleo Multi-Tenant (Identity, resolución de tenant, Planes/Suscripciones simuladas, Platform Admin)
- [x] Fase 2 — Clientes, Mascotas y Formulario Público
- [x] Fase 3 — Agenda + Historial
- [ ] Fase 4 — Empleados y Roles (feature gating por plan)
- [ ] Fase 5 — Inventario + Caja
- [ ] Fase 6 — Notificaciones + Fotos + Estadísticas
- [ ] Fase 7 — Funcionalidades Pro (roles avanzados, API, dashboard avanzado, stubs de WhatsApp/dominio/facturación)
- [ ] Fase 8 — Pulido UX + datos de demo
- [ ] Fase 9 (futuro) — Producción: pasarela de pago real, WhatsApp Cloud API real, Cloudinary, despliegue VPS
