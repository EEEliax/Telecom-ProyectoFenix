# Requirements — Migración Frontend v0 → proyecto-real

## Introduction

El equipo generó el frontend del Portal B2C (Inicio, Facturación, Mis Servicios, Soporte + ChatWidget) usando v0 de Vercel, exportado como proyecto Next.js en `conecta-max-customer-portal/`. Esta feature cubre la migración quirúrgica de esos componentes hacia `proyecto-real/frontend`, que usa Vite + React Router + JSX, reutilizando la autenticación JWT ya existente. El backend permanece pausado — todos los datos siguen mockeados en esta fase.

## Glossary
- **v0-export**: el proyecto Next.js generado en `conecta-max-customer-portal/`.
- **proyecto-real**: la aplicación real en `proyecto-real/frontend`, la que efectivamente se despliega.
- **Staging**: carpeta temporal fuera de `src/` donde vive el v0-export mientras se extrae.
- **AppLayout**: shell fijo (Sidebar + área de contenido + ChatWidget flotante).

## Requirements

### Requirement 1 — Aislamiento del v0-export
El v0-export SHALL permanecer en una carpeta de staging fuera de `src/` (`proyecto-real/frontend/_v0-import/` o equivalente) durante todo el proceso de extracción, para que Vite no intente compilarlo ni se mezcle con el build real.

### Requirement 2 — Conversión de formato Next.js → Vite/JSX
Todo componente extraído del v0-export SHALL convertirse de `.tsx` a `.jsx`: sin directivas `"use client"`, sin imports de `next/link` ni `next/navigation` (reemplazados por `react-router-dom`).

### Requirement 3 — Separación de `conecta-views.tsx`
El archivo consolidado `components/conecta-views.tsx` SHALL dividirse en 4 componentes de página independientes: `InicioPage.jsx`, `FacturacionPage.jsx`, `ServiciosPage.jsx`, `SoportePage.jsx`, ubicados en `frontend/src/pages/`, siguiendo la convención de nombres ya usada en el proyecto.

### Requirement 4 — Reconciliación de design tokens (Tailwind v4 → v3)
Las clases del v0-export basadas en tokens Tailwind v4 (`bg-primary`, `text-foreground`, `bg-muted`, `border-border`) SHALL traducirse a los tokens ya definidos en `tailwind.config.js` de proyecto-real. `brand-dark` y `brand-sky` ya coinciden en nombre; `primary` → `brand`; `muted`, `border` (y evaluar `foreground`) deben agregarse como tokens nuevos si no existen, sin modificar los valores de los tokens ya usados por Landing/Login.

### Requirement 5 — Reutilización de autenticación existente
Las 4 vistas nuevas y el `ChatWidget` SHALL quedar protegidas por el `ProtectedRoute` ya existente y usar el mecanismo de JWT ya implementado (`sessionStorage`, `useAuth`) — no se crea ningún sistema de autenticación paralelo.

### Requirement 6 — Registro de rutas
`AppLayout` con las 4 vistas SHALL registrarse como rutas anidadas bajo `/dashboard` en `App.jsx` (reemplazando o extendiendo el actual `<DashboardPage />` plano), envueltas en `<ProtectedRoute>`.

### Requirement 7 — Datos mockeados, sin conexión a backend real
Todos los componentes migrados SHALL seguir recibiendo datos vía props/mocks locales — sin `fetch` a endpoints reales — siguiendo la checklist de "mock permanente vs. mock temporal" documentada en el vault (`Proyecto Fénix V2 - Arquitectura.md`, sección 6).

### Requirement 8 — Búsqueda de tickets por fecha (gap conocido del v0-export)
El v0-export no implementó la búsqueda funcional en `SoportePage`. Esta migración SHALL agregar filtrado client-side de la tabla de tickets por fecha de creación (sobre los datos mock existentes), ya que no hay backend conectado todavía para una búsqueda real.

### Requirement 9 — Limpieza post-integración
Una vez verificada la integración, la carpeta de staging (Requirement 1) SHALL eliminarse del repositorio para no dejar código muerto ni duplicar dependencias.

## Fuera de alcance (explícito)
- Cualquier conexión a datos reales de PostgreSQL — pertenece a la fase de Backend, todavía pausada.
- Cualquier cambio a `.kiro/specs/especificaciones-soporte/` más allá de lo ya anotado.
