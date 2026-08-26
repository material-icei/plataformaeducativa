# EduICEI

**EduICEI** es la plataforma educativa gamificada del Colegio ICEI: una landing page que convierte el recorrido escolar en una aventura de videojuego. Los alumnos eligen su **ciclo**, después su **grado** (nivel) y finalmente un **área** pedagógica, donde encuentran sus **misiones** (actividades).

Está pensada para alumnos de 1.º a 7.º grado, con estética de videojuego educativo moderno sobre la paleta institucional del colegio (azul y rojo).

## Características

- Sitio 100% estático: **HTML5 + CSS3 + JavaScript vanilla**, sin frameworks, sin backend, sin base de datos.
- Funciona abriendo `index.html` directamente y está listo para publicarse en **GitHub Pages** tal cual.
- No usa `localStorage`, cuentas, ni ningún tipo de seguimiento de alumnos: toda la experiencia es visual, nada se guarda entre visitas.
- Sin sonido ni video: la aventura es completamente visual.
- Responsive: pensado para Chromebooks en horizontal, y adaptado a notebooks y celulares.

## Estructura de archivos

```
eduicei/
├── index.html              → estructura de la página (semántica, sin contenido de ciclos/grados hardcodeado)
├── style.css                → todos los estilos (paleta institucional, tipografía, animaciones, responsive)
├── script.js                 → datos de la plataforma + toda la lógica e interacción
└── assets/
    └── escudo-icei.png       → escudo institucional del colegio
```

Los tres archivos deben mantenerse juntos y con esos nombres exactos, ya que `index.html` los referencia por ruta relativa (`style.css`, `script.js`, `assets/escudo-icei.png`).


## Cómo agregar una nueva actividad

Toda la configuración de actividades vive en **un solo lugar**: la sección `CONFIGURACIÓN DE ACTIVIDADES`, al principio del archivo `script.js`. No hace falta tocar `index.html` ni `style.css` para agregar, activar o cambiar actividades.

### Paso a paso

1. Abrí `script.js` con cualquier editor de texto.
2. Ubicá el ciclo, el grado y el área donde querés agregar o activar la actividad. La estructura sigue este orden: **ciclo → grado → área → actividades**. Los grupos de áreas están definidos como `AREAS_1ER_CICLO`, `AREAS_2DO_CICLO` y `AREAS_3ER_CICLO`, y cada grado los usa mediante `crearAreas(...)`.
3. Cada área ya tiene 3 actividades generadas automáticamente (`Actividad 1`, `Actividad 2`, `Actividad 3`), todas en estado `"proximamente"`. Para publicar la primera actividad real, hay que modificarla puntualmente después de que se genera la estructura, o directamente editar el objeto de esa actividad si preferís hacerlo a mano.
4. Cambiá dos cosas en la actividad:
   - `estado`: de `"proximamente"` a `"disponible"`.
   - `url`: la dirección completa (con `https://`) donde está publicada esa actividad (normalmente, otro repositorio de GitHub Pages).

**Antes:**
```js
{ nombre: "Actividad 1", estado: "proximamente", url: "" }
```

**Después:**
```js
{ nombre: "Actividad 1", estado: "disponible", url: "https://tu-usuario.github.io/actividad-lengua-1/" }
```

5. Guardá el archivo y volvé a subirlo a GitHub (o hacé commit + push si ya estás trabajando desde el repositorio).

Con ese cambio, la misión correspondiente va a mostrar el botón **"Jugar"** y va a abrir esa URL en una pestaña nueva. Mientras `estado` sea `"proximamente"`, la misión se muestra bloqueada con el texto **"Próximamente"**, sin importar lo que tenga cargado en `url`.

### Cómo agregar más de 3 actividades a un área

Por defecto cada área tiene 3 actividades (definidas por `crearMisiones(3)` dentro de la función `crearAreas`). Si un área necesita más misiones, hay dos formas:

- **Global:** cambiar el `3` por otro número dentro de `crearAreas` (por ejemplo `crearMisiones(4)`) para que todas las áreas tengan esa cantidad por defecto.
- **Puntual:** después de armar el objeto `plataforma`, agregar manualmente un objeto más al array `actividades` de esa área específica, con la misma forma: `{ nombre: "Actividad 4", estado: "proximamente", url: "" }`.

### Cómo agregar un grado, un área o un ciclo nuevo

La plataforma entera se genera a partir del objeto `plataforma` (al final de la sección de configuración de `script.js`). Para agregar:

- **Un área nueva a un grupo existente:** agregá un objeto `{ nombre: "...", icono: "..." }` al array correspondiente (`AREAS_1ER_CICLO`, `AREAS_2DO_CICLO` o `AREAS_3ER_CICLO`).
- **Un grado nuevo:** agregá una línea `crearGrado("8.º Grado", crearAreas(AREAS_3ER_CICLO))` (o el grupo de áreas que corresponda) dentro del array `grados` del ciclo correspondiente.
- **Un ciclo nuevo:** copiá la forma de uno de los objetos dentro de `plataforma.ciclos` (con su `id`, `nombre`, `personaje`, `recompensa`, `rasgos` y `grados`) y agregalo al array.

En los tres casos, la navegación, las tarjetas, la ruta de aventura y el acordeón de misiones se generan solos: no hace falta escribir HTML a mano.

## Reemplazar el escudo institucional

El escudo se toma de `assets/escudo-icei.png`. Para reemplazarlo, alcanza con subir un archivo nuevo con exactamente ese nombre y ruta; se usa automáticamente en la barra de navegación, el Hero y el footer, sin recortar ni modificar sus colores.

## Notas importantes

- No hay sistema de login, cuentas ni seguimiento real de alumnos: los "niveles desbloqueables" son solamente una representación visual de la estructura de contenidos.
- No inventes actividades educativas: usá siempre `Actividad 1`, `Actividad 2`, etc., y dejalas en `"proximamente"` hasta tener la URL real.
- No uses `iframe` para las actividades: siempre se abren en una pestaña nueva mediante su URL completa.
