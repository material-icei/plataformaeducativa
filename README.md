# EduICEI — Plataforma educativa gamificada

Plataforma web estática (HTML5 + CSS3 + JavaScript puro, sin frameworks, sin
backend, sin base de datos y sin login) para el Colegio ICEI (Mendoza,
Argentina). Permite a cada estudiante elegir su **Ciclo → Grado → Área →
Actividad (misión)** y acceder a sus actividades.

## Archivos

- `index.html` — estructura de la página (navegación, hero, ciclos, grados,
  áreas, biblioteca virtual, footer, modal).
- `style.css` — toda la hoja de estilos (variables institucionales, layout,
  animaciones, responsive).
- `script.js` — toda la lógica: los datos de la plataforma (ciclos, grados,
  áreas, actividades) y el comportamiento de la interfaz.
- `assets/escudo-icei.png` — escudo institucional (usado en la barra de
  navegación, la etiqueta del hero y el footer).
- `assets/escudo-icei-3d.png` — versión del escudo con fondo transparente,
  usada específicamente en la escena animada del hero (efecto 3D).

## Colores institucionales (no modificar)

```css
--rojo: #af1b2e;
--azul: #002368;
--blanco: #ffffff;
```

## Cómo agregar una nueva actividad real

Toda la configuración de actividades vive en `script.js`, en el bloque
**"CONFIGURACIÓN DE ACTIVIDADES"**. Cada área nace con 3 casilleros
("Actividad 1", "Actividad 2", "Actividad 3") en estado `"proximamente"`.
Para cargar una actividad real en uno de esos casilleros alcanza con:

```js
configurarActividad(obtenerArea("ciclo-1", "2.º Grado", "Matemática"), 0, {
  nombre: "Nombre de la actividad",
  estado: "disponible",
  url: "https://..."
});
```

El segundo argumento es el índice del casillero (0, 1 o 2).

## Cómo agregar más de 3 actividades a un área

Si un área ya tiene sus 3 casilleros ocupados y necesitás un 4º (o más),
`configurarActividad()` no va a tener dónde escribir: como la función hace
`if (!area || !area.actividades[indice]) return;`, si el casillero no existe
simplemente no hace nada (falla en silencio, sin error en consola). Por eso,
antes de configurar el 4º casillero (índice 3) hay que agregarlo manualmente
con `.push()`:

```js
// 1) Agregar el casillero nuevo
obtenerArea("ciclo-1", "2.º Grado", "Matemática").actividades.push({
  nombre: "Actividad 4",
  estado: "proximamente",
  url: ""
});

// 2) Recién ahora configurarActividad() tiene dónde escribir
configurarActividad(obtenerArea("ciclo-1", "2.º Grado", "Matemática"), 3, {
  nombre: "Nombre de la nueva actividad",
  estado: "disponible",
  url: "https://..."
});
```

Para un 5º, 6º, etc. se repite el mismo patrón con el índice siguiente (4, 5...).

## Publicar en GitHub Pages

1. Subir `index.html`, `style.css`, `script.js` y la carpeta `assets/` a la
   raíz del repositorio (o a `/docs` si así se configuró Pages).
2. Activar GitHub Pages desde la configuración del repositorio, apuntando a
   la rama y carpeta correspondientes.
3. No se necesita build ni instalación: son archivos estáticos.

## Accesibilidad y rendimiento

- Totalmente responsive (desktop, notebook, tablet y celular).
- Respeta `prefers-reduced-motion` (desactiva animaciones si el usuario lo
  prefiere).
- Navegación por teclado y foco visible en todos los controles interactivos.
- Sin dependencias externas más que las tipografías de Google Fonts
  (Oxanium y Rajdhani).
