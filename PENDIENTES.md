# Pendientes — Rendimiento y deuda técnica

Plan de optimización de la plataforma de e-commerce. Este documento refleja el estado actual del
código; se actualiza a medida que se resuelven los puntos.

## Alto impacto

1. **Cache del catálogo `/productos`**
   - `getCachedProducts` en `src/lib/cache.ts` funciona como passthrough: cada carga/página/filtro
     ejecuta consultas Prisma vía server action POST (no cacheable).
   - Evaluar SSR/ISR de la primera página y cache de servidor con tags para el listado.

2. **`getPageConfig` en cada render**
   - `src/actions/page-config/general.actions.ts` consulta Prisma con `unstable_cache` por
     `tenantId`. Revisar que los includes (banners, homegrid, carousels) no se pidan cuando la
     sección no se renderiza.

3. **Búsqueda global**
   - `src/actions/search.ts` ejecuta varias consultas secuenciales al montar la barra de búsqueda
     del header. Paralelizar o cachear.

4. **N+1 en el dashboard**
   - Evitar llamadas por fila al montar la tabla de productos; usar los datos ya paginados.

## Medio impacto

5. **Índices Prisma**: revisar índices faltantes en consultas frecuentes (filtros por categoría,
   subcategoría, tenant y fecha).

6. **Paginación**: verificar paginación consistente en catálogo, categorías y movimientos.

7. **Memoización de contextos**: revisar `CartContext` y contextos de configuración para evitar
   renders innecesarios.

8. **Imágenes**: usar URLs optimizadas de Cloudinary y tamaños adecuados al viewport.

## Bajo impacto / limpieza

9. **Código muerto**: antes de borrar cualquier archivo, confirmar 0 importadores con búsqueda
   global y correr `npx tsc --noEmit` después de cada tanda.

10. **Dependencias sin uso**: verificar con búsqueda global y desinstalar solo las confirmadas.

11. **Tipos**: reemplazar `any` por tipos concretos (regla ESLint `no-explicit-any`).

## Verificación

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (con base de datos disponible)
- Navegación de humo: home, `/productos`, `/productos/<categoria>`, detalle, `/checkout`,
  dashboard y panel `/admin` completo.
