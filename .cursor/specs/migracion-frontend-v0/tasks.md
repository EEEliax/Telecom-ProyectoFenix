# Tasks — Migración Frontend v0 → proyecto-real

- [x] 1. Preparar staging
  - Copiar `conecta-max-customer-portal/` completo a `proyecto-real/frontend/_v0-import/` (fuera de `src/`).
  - _Requirements: 1_

- [x] 2. Reconciliar design tokens — **ya hecho en `tailwind.config.js` (verificar, no agregar)**
  - `muted`, `border`, `foreground` y también `primary` (mismo hex que `brand`), `secondary`, `accent`, `input`, `ring` ya existen. Conservar clases `bg-primary` / `text-primary` del v0-export (Landing/Login ya las usan); **no** renombrar a `brand`.
  - _Requirements: 4_

- [x] 3. Extraer y convertir componentes base — **N/A, decidido 2026-08-25**
  - [x] 3.1 ~~`components/ui/button.tsx` → `src/components/ui/Button.jsx`~~ **OMITIDO.** Ninguna vista ni el ChatWidget usan `<Button>` de shadcn — todo es `<button>` nativo. Portarlo agregaría `clsx`, `tailwind-merge`, `class-variance-authority` y `@base-ui/react` sin ningún consumidor real. No se porta.
  - [x] 3.2 ~~`lib/utils.ts` → `src/lib/utils.js`~~ **OMITIDO.** `src/lib/utils.js` ya existe en proyecto-real con un `cn()` más simple que cubre lo necesario. No se sobreescribe.
  - _Requirements: 2_

- [x] 4. Extraer y convertir `AppLayout` + `Sidebar`
  - Convertir `conecta-sidebar.tsx` → `src/components/Sidebar.jsx` (`Link`/`usePathname` de Next → `NavLink`/`useLocation` de React Router).
  - Construir `AppLayout.jsx` a partir de `DashboardShell` en `app/page.tsx` (sidebar + menú mobile + `<Outlet />` + `ChatWidget`). **No** usar `app/layout.tsx` (solo html/body + Analytics de Vercel) ni el stub `AppLayout` al final de `conecta-sidebar.tsx` (`open={false}`, sin menú mobile). `app/dashboard/[[...slug]]/page.tsx` solo reexporta el shell.
  - Cablear **Cerrar sesión** (`removeToken` + `navigate('/login')`). Pasar `userEmail` del JWT a `InicioPage` (el v0 hardcodea `martina.gonzalez@gmail.com`).
  - _Requirements: 2, 4_

- [x] 5. Dividir `conecta-views.tsx` en 4 páginas
  - Extraer helpers compartidos (`Card`, `Header`, `Status`, mocks) a p.ej. `src/components/dashboard/` para no duplicarlos.
  - [x] 5.1 `InicioPage.jsx`
  - [x] 5.2 `FacturacionPage.jsx`
  - [x] 5.3 `ServiciosPage.jsx`
  - [x] 5.4 `SoportePage.jsx`
  - _Requirements: 3, 4_

- [x] 6. Corregir búsqueda en Soporte (gap del v0-export)
  - El input ya filtra client-side, pero solo por `type` + `summary`. El placeholder dice “fecha de creación” y el campo mock es `date` (`'18 Jun 2024'`), **no** `fecha_creacion`. Incluir `t.date` en el filtro (además de tipo/resumen). No inventar un campo nuevo.
  - _Requirements: 8_

- [x] 7. Extraer y convertir `ChatWidget`
  - Convertir `chat-widget.tsx` → `src/components/ChatWidget.jsx`, verificando que el comportamiento de click-afuera (colapsar vs. confirmar cierre) sobrevive la conversión.
  - _Requirements: 2, 4_

- [x] 8. Registrar rutas en `App.jsx` y eliminar los artefactos de chat V1
  - Envolver `AppLayout` + las 4 vistas en `<ProtectedRoute>`, **eliminando** `<DashboardPage />` (no solo extendiendo).
  - **Eliminar del repo** (decidido 2026-08-25, no se conservan para la fase Backend): `frontend/src/pages/DashboardPage.jsx`, `frontend/src/components/ChatWindow.jsx`, `frontend/src/hooks/useChatHistory.js` y su test. Razón: `useChatHistory` está construido contra el contrato V1 (`fetch('/api/chat')`, historial 100% en `useState`, sin `sesion_id`) que ya fue anulado; su test valida específicamente la Property 7 (chat efímero), también anulada. No son reutilizables tal cual para V2 (que usa `/api/chat/message` + `/api/chat/close` con persistencia real) — reimplementar en la fase Backend contra el contrato real documentado en el vault, no partiendo de este código. Git conserva el historial si hace falta consultarlo.
  - El `ChatWidget` (mockeado, ajustado en las Rondas 1 y 2 de v0) queda como la única UI de chat hasta que arranque la fase Backend.
  - _Requirements: 5, 6_

- [x] 9. Checkpoint — verificación manual
  - Recorrer la tabla de "Criterios de verificación" de `design.md` una por una.
  - Build Vite OK (`npm run build`). Sin `"use client"` ni `next/*` en `src/`. Sin `fetch`/`axios` en páginas/componentes migrados. Rutas anidadas bajo `/dashboard` con `ProtectedRoute`. Staging eliminado.

- [x] 10. Limpieza
  - Eliminar `proyecto-real/frontend/_v0-import/` del repo.
  - _Requirements: 9_

## Notes
- Ningún dato real de backend se conecta en esta fase — todo sigue mockeado (ver checklist 🟢/🔴 en el vault).
- Esta spec vive en `.cursor/specs/migracion-frontend-v0/` y complementa (no reemplaza) `.kiro/specs/especificaciones-soporte/`, que sigue siendo la referencia de lo ya construido en V1.
