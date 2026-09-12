# Design — Migración Frontend v0 → proyecto-real

## Overview
Migración quirúrgica, no reescritura. El v0-export aporta el diseño visual ya validado (dos rondas de ajuste ya revisadas con el usuario); proyecto-real aporta el andamiaje de producción (routing, auth, build). El trabajo es de traducción y reconciliación, no de generación de UI nueva.

## Estructura de carpetas (antes / después)

```
ANTES:
Telecom-FyB-Final/
├── conecta-max-customer-portal/      ← v0-export (Next.js, TS, standalone)
└── proyecto-real/frontend/src/       ← app real (Vite, JSX)
    ├── pages/ (LandingPage, LoginPage, DashboardPage)
    └── components/ (ProtectedRoute)

DESPUÉS:
proyecto-real/frontend/src/
├── pages/
│   ├── LandingPage.jsx        (sin cambios)
│   ├── LoginPage.jsx          (sin cambios)
│   ├── InicioPage.jsx         ← extraído de conecta-views.tsx
│   ├── FacturacionPage.jsx    ← extraído de conecta-views.tsx
│   ├── ServiciosPage.jsx      ← extraído de conecta-views.tsx
│   └── SoportePage.jsx        ← extraído de conecta-views.tsx (+ filtro incluye `date`)
├── components/
│   ├── ProtectedRoute.jsx     (sin cambios, reutilizado)
│   ├── AppLayout.jsx          ← desde DashboardShell en app/page.tsx (no app/layout.tsx)
│   ├── Sidebar.jsx            ← ex conecta-sidebar.tsx
│   ├── ChatWidget.jsx         ← ex chat-widget.tsx
│   └── dashboard/             ← helpers compartidos (Card, Header, Status) extraídos de conecta-views
└── lib/utils.js                ← YA EXISTE en proyecto-real, NO se sobreescribe (ver Tarea 3)

Eliminados (tarea 8): DashboardPage.jsx, ChatWindow.jsx, useChatHistory.js y su test.
```

## Mapeo de design tokens (Tailwind v4 → v3)

| Token v0-export (Tailwind v4, CSS var) | Token proyecto-real (Tailwind v3, JS config) | Acción |
|---|---|---|
| `--primary` (#2563EB) | `primary` (también existe `brand`, mismo hex) | Conservar clases `bg-primary` / `text-primary` — Landing/Login ya las usan. No renombrar a `brand`. |
| `--brand-dark` (#1E3A8A) | `brand-dark` | Coincide — sin cambio de nombre |
| `--brand-sky` (#38BDF8) | `brand-sky` | Coincide — sin cambio de nombre |
| `--background` (#F8FAFC) | `background` | Coincide |
| `--card` (#FFFFFF) | `card` | Coincide |
| `--muted` / `--muted-foreground` | `muted` / `muted.foreground` | Ya existen — no agregar |
| `--border` | `border` | Ya existe — no agregar |
| `--foreground` | `foreground` | Ya existe — no agregar |

## Plan de conversión de `conecta-views.tsx`
El archivo ya exporta las 4 páginas (`InicioPage`, `FacturacionPage`, `ServiciosPage`, `SoportePage`) más helpers (`Card`, `Header`, `Status`) y mocks. El switch de ruta vive en `DashboardShell` (`app/page.tsx`) vía `usePathname`, no dentro de `conecta-views.tsx`. Extraer cada página a su `.jsx`, mover helpers a `src/components/dashboard/`, y dejar el ruteo en `App.jsx` (rutas anidadas + `<Outlet />`).

## Criterios de verificación (por requirement)
No aplican property-based tests formales en esta fase (no hay lógica de negocio invariante — es migración de UI estática con mocks). Cada requirement se verifica con checklist manual:

| Requirement | Verificación |
|---|---|
| 1 | No hay cambios dentro de `src/` hasta que se haga la extracción explícita de cada archivo |
| 2 | Ningún archivo en `src/` contiene `"use client"` ni imports de `next/*` |
| 3 | Existen 4 archivos de página independientes, cada uno con export default |
| 4 | Landing/Login no cambian visualmente tras el merge (regresión visual manual) |
| 5 | Las 4 vistas son inaccesibles sin JWT válido (mismo comportamiento que `/dashboard` hoy) |
| 6 | Navegar a `/dashboard/soporte`, etc., renderiza la vista correcta dentro del Sidebar |
| 7 | No hay ninguna llamada `fetch`/`axios` en los componentes migrados |
| 8 | Escribir una fecha en el buscador de Soporte filtra la tabla mock visiblemente |
| 9 | La carpeta de staging no existe en el repo tras el merge final |

*(Cuando esta migración conecte con datos reales de backend, ahí sí corresponde retomar el rigor de property-based testing que usa `.kiro` — para los endpoints y la lógica de negocio, no para esta fase de UI pura.)*
