# Plan: Pestaña "Material" — PDFs cargados por docentes

## Contexto

La página actual es un sitio de una sola pantalla donde los botones de navegación solo resaltan el ítem activo sin cambiar el contenido. El diagrama `.drawio` muestra que "Material" es una entidad propia con campos Título, descripción, archivo (PDF), asignatura, clasificación (pedagógico / lectura) y fecha de publicación. El usuario quiere una pestaña funcional coherente con la paleta y estilo del Inicio.

## Enfoque

Usar **renderizado condicional** sobre `activeNav` (ya existente en el estado). No se agrega router — es la solución más simple y no rompe nada.

- Cuando `activeNav === "Inicio"` → se muestran todas las secciones actuales.
- Cuando `activeNav === "Material"` → se muestra el nuevo componente `MaterialPage`.
- Resto de pestañas → sin cambio (el nav ya las resalta sin contenido, se mantiene igual).

## Archivos a modificar

Solo **`src/App.tsx`** — todos los cambios van ahí.

## Cambios detallados

### 1. NAV_LINKS
Agregar `"Material"` entre `"Programación"` y `"Actividades"`:
```ts
const NAV_LINKS = ["Inicio", "Académico", "Programación", "Material", "Actividades", "Noticias", "Contacto"];
```

### 2. Datos mock — `MATERIALES`
Array con ~8 entradas que simulan PDFs cargados por docentes:
```ts
const MATERIALES = [
  {
    id: 1,
    titulo: "Introducción a Python — Unidad 1",
    descripcion: "Variables, tipos de datos y estructuras de control básicas.",
    asignatura: "Programación",
    clasificacion: "Pedagógico",
    docente: "Prof. García",
    fecha: "15 ago 2026",
    paginas: 24,
    archivo: "intro-python-u1.pdf",
  },
  // …más entradas cubriendo: Desarrollo Web, Matemática, Pensamiento Computacional, Seguridad Informática, Robótica — con ambas clasificaciones
]
```

### 3. Componente `MaterialPage`
Componente funcional interno con estado propio:
- `filtroAsignatura`: `string` (default `"Todas"`)
- `filtroClasificacion`: `string` (default `"Todas"`)
- `busqueda`: `string`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Cabecera de sección (título + subtítulo mono)  │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Grid de tarjetas de material        │
│ Filtros  │                                      │
│ Asignatura│  [Tarjeta] [Tarjeta] [Tarjeta]     │
│ Clasif.  │  [Tarjeta] [Tarjeta] ...             │
└──────────┴──────────────────────────────────────┘
```

**Sidebar de filtros** (izquierda, ~240px):
- Input de búsqueda por título
- Lista de botones de asignatura (Todas / Programación / Desarrollo Web / Matemática / …)  
- Lista de botones de clasificación (Todas / Pedagógico / Lectura)
- Colores activos: `bg-[#274C77] text-white`, inactivos: `bg-white border-[#c0cdd7]`

**Tarjeta de material:**
- Ícono de PDF en `#274C77`
- Título en Fraunces bold
- Badge de asignatura (estilo `TAG_COLORS` existente) + badge de clasificación en JetBrains Mono
- Descripción en Outfit, color `#8B8C89`
- Footer de tarjeta: docente, fecha, n.º de páginas
- Botón "Descargar PDF" → `bg-[#274C77]` con hover `#6096BA`
- Hover de tarjeta: `border-[#6096BA]` (coherente con el resto de tarjetas del sitio)

### 4. Renderizado condicional en el cuerpo de `App`
Envolver las secciones actuales:
```tsx
{activeNav === "Material" ? (
  <MaterialPage />
) : (
  <>
    {/* AVISO */}
    {/* HERO */}
    {/* PROGRAMACIÓN */}
    {/* NOTICIAS */}
    {/* EVENTOS */}
    {/* ACADÉMICO */}
    {/* VIDA ESTUDIANTIL */}
    {/* CTA */}
  </>
)}
```
El `<header>` y el `<footer>` quedan fuera del condicional (siempre visibles).

## Paleta y tipografía (coherencia con Inicio)

| Elemento | Valor |
|---|---|
| Fondo de página | `#E7ECEF` |
| Cabecera de sección | Fraunces, `#0d1b2a` |
| Label mono | JetBrains Mono, `#6096BA` |
| Tarjetas | `bg-white border-[#c0cdd7]` |
| Botón primario | `bg-[#274C77]` |
| Hover/acento | `#6096BA` |
| Texto secundario | `#8B8C89` |

## Verificación

1. Hacer clic en "Material" en el nav → aparece la nueva sección, desaparecen las del Inicio.
2. Hacer clic en "Inicio" → vuelven las secciones originales.
3. Filtrar por asignatura y clasificación → las tarjetas se filtran correctamente.
4. Buscar por texto → el input filtra por título.
5. Verificar en móvil: sidebar colapsa arriba de las tarjetas.
