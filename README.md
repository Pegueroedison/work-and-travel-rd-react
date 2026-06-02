# Work and Travel RD — React UI Redesign v4074

Proyecto React + Vite + TypeScript integrado a partir del código inicial generado por Claude y completado para que compile en modo estricto.

## Qué incluye

- React 18 + Vite + TypeScript.
- React Router con rutas principales.
- PWA preparada con `vite-plugin-pwa`.
- Modo claro/oscuro global con `html[data-theme="light"]` y `html[data-theme="dark"]`.
- Sistema de diseño con tokens globales.
- Navegación Liquid Glass con bottom nav móvil y navegación desktop.
- Datos mock centralizados en `src/mocks`.
- Componentes UI reutilizables.
- Pantallas visuales para inicio, foro, crear publicación, detalle/comentarios, perfiles, amigos, mensajes, notificaciones, práctica, blogs y admin.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Validación realizada

Se ejecutó correctamente:

```bash
npm run build
```

El build generó la app y el service worker de PWA sin errores TypeScript.

## Archivos clave de diseño

- `src/styles/tokens.css`: tokens globales de tema, sombras, radius, espaciado, z-index y transiciones.
- `src/styles/global.css`: reset, contenedores, page shell y utilidades.
- `src/styles/components.css`: botones, inputs, modales, bottom sheets, badges, tabs, acordeones, toasts, estados y previews.
- `src/styles/layout.css`: navegación Liquid Glass, admin shell, foro y mensajes.
- `src/styles/pages.css`: estilos de pantallas principales.
- `src/components/ui`: componentes base reutilizables.
- `src/components/layout/AppLayout.tsx`: navegación global.

## Pendiente para conectar backend real

Este ZIP no conecta Supabase, Oracle, Cloudflare ni autenticación real. Las áreas listas para reemplazar mocks están en:

- `src/mocks/index.ts`
- `src/utils/AppContext.tsx`
- formularios de `CreatePostPage`, `MyProfilePage`, `MessagesPage` y `AdminPage`
