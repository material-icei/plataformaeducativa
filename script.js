/* ============================================================================
   EduICEI — script.js
   Plataforma educativa gamificada del Colegio ICEI.
   JavaScript vanilla, sin frameworks, sin backend, sin almacenamiento de datos
   del alumno. Pensado para publicarse tal cual en GitHub Pages.

   Índice de este archivo:
     1. CONFIGURACIÓN DE ACTIVIDADES  → lo único que hay que tocar a futuro
     2. Utilidades generales
     3. Referencias al DOM
     4. Estado de navegación (en memoria, se pierde al recargar a propósito)
     5. Render: ciclos → niveles (grados) → áreas + misiones
     6. Ruta de aventura (breadcrumb)
     7. Modal "Próximamente"
     8. Menú responsive, scroll suave y nav activo
     9. Animaciones de entrada al hacer scroll
     10. Inicialización
   ============================================================================ */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONFIGURACIÓN DE ACTIVIDADES
     ==========================================================================
     Esta es la ÚNICA sección que hay que editar para incorporar actividades
     reales a EduICEI. El resto de la plataforma (ciclos, grados, áreas,
     misiones, navegación) se genera automáticamente a partir de esta
     estructura de datos.

     Cada actividad tiene esta forma:

       { nombre: "Actividad 1", estado: "disponible", url: "https://tu-usuario.github.io/tu-actividad/" }
       { nombre: "Actividad 2", estado: "proximamente", url: "" }

     - "estado" acepta únicamente "disponible" o "proximamente".
     - Cuando "estado" es "disponible", la URL debe ser una dirección completa
       (empezar con http:// o https://) de un repositorio publicado con
       GitHub Pages. La misión mostrará un botón "JUGAR" que abre esa URL en
       una pestaña nueva.
     - Cuando "estado" es "proximamente", la URL puede dejarse vacía. La
       misión se mostrará bloqueada con el texto "PRÓXIMAMENTE".
     - No se necesita tocar ningún otro archivo ni ninguna otra parte del
       código para agregar o modificar actividades.
     ========================================================================== */

  // Plantilla reutilizable: genera N actividades "próximamente" para un área.
  // Reemplazar estado/url puntualmente, como en el ejemplo de arriba, cuando
  // una actividad real esté lista.
  function crearMisiones(cantidad) {
    const misiones = [];
    for (let i = 1; i <= cantidad; i++) {
      misiones.push({ nombre: "Actividad " + i, estado: "proximamente", url: "" });
    }
    return misiones;
  }

  // Fábrica de áreas pedagógicas: cada área recibe su propio set de misiones.
  function crearAreas(definiciones) {
    return definiciones.map(function (def) {
      return {
        id: normalizarId(def.nombre),
        nombre: def.nombre,
        icono: def.icono,
        actividades: crearMisiones(3)
      };
    });
  }

  // Grupos de áreas por ciclo pedagógico (definidos en la especificación).
  const AREAS_1ER_CICLO = [
    { nombre: "Lengua", icono: "📖" },
    { nombre: "Matemática", icono: "➗" },
    { nombre: "Ambiente", icono: "🌱" }
  ];
  const AREAS_2DO_CICLO = [
    { nombre: "Lengua", icono: "📖" },
    { nombre: "Matemática", icono: "➗" },
    { nombre: "NAT", icono: "🔬" },
    { nombre: "SAC", icono: "🌎" }
  ];
  const AREAS_3ER_CICLO = [
    { nombre: "Lengua", icono: "📖" },
    { nombre: "Matemática", icono: "➗" },
    { nombre: "NAT", icono: "🔬" },
    { nombre: "SAC", icono: "🌎" },
    { nombre: "FEC", icono: "🎨" }
  ];

  function crearGrado(nombre, areas) {
    return { id: normalizarId(nombre), nombre: nombre, areas: areas };
  }

  // ==========================================================================
  // ESTRUCTURA COMPLETA DE LA PLATAFORMA — no debería requerir cambios.
  // ==========================================================================
  const plataforma = {
    ciclos: [
      {
        id: "ciclo-1",
        numero: 1,
        nombre: "1.º Ciclo",
        gradosTexto: "1.º · 2.º · 3.º Grado",
        personaje: "ciclo1",
        insignia: "🧭",
        recompensa: { icono: "⭐🏆", nombre: "Estrellas y Trofeos" },
        rasgos: ["Curiosidad", "Descubrimiento", "Entusiasmo"],
        grados: [
          crearGrado("1.º Grado", crearAreas(AREAS_1ER_CICLO)),
          crearGrado("2.º Grado", crearAreas(AREAS_1ER_CICLO)),
          crearGrado("3.º Grado", crearAreas(AREAS_1ER_CICLO))
        ]
      },
      {
        id: "ciclo-2",
        numero: 2,
        nombre: "2.º Ciclo",
        gradosTexto: "4.º · 5.º Grado",
        personaje: "ciclo2",
        insignia: "🗺️",
        recompensa: { icono: "🥇", nombre: "Medallas" },
        rasgos: ["Desafío", "Exploración", "Autonomía"],
        grados: [
          crearGrado("4.º Grado", crearAreas(AREAS_2DO_CICLO)),
          crearGrado("5.º Grado", crearAreas(AREAS_2DO_CICLO))
        ]
      },
      {
        id: "ciclo-3",
        numero: 3,
        nombre: "3.º Ciclo",
        gradosTexto: "6.º · 7.º Grado",
        personaje: "ciclo3",
        insignia: "🎖️",
        recompensa: { icono: "🎖️", nombre: "Insignias" },
        rasgos: ["Estrategia", "Conocimiento", "Autonomía"],
        grados: [
          crearGrado("6.º Grado", crearAreas(AREAS_3ER_CICLO)),
          crearGrado("7.º Grado", crearAreas(AREAS_3ER_CICLO))
        ]
      }
    ]
  };

  // --------------------------------------------------------------------------
  // Utilidades para cargar actividades reales sin tocar el resto del código.
  // --------------------------------------------------------------------------

  // Busca un área puntual dentro de la plataforma por ciclo → grado → área.
  function obtenerArea(idCiclo, nombreGrado, nombreArea) {
    const ciclo = plataforma.ciclos.find(function (c) { return c.id === idCiclo; });
    const grado = ciclo && ciclo.grados.find(function (g) { return g.nombre === nombreGrado; });
    return grado && grado.areas.find(function (a) { return a.nombre === nombreArea; });
  }

  // Completa una actividad ya existente (por posición) con sus datos reales.
  function configurarActividad(area, indice, datos) {
    if (!area || !area.actividades[indice]) return;
    Object.assign(area.actividades[indice], datos);
  }

  /* --------------------------------------------------------------------------
     ACTIVIDADES REALES CARGADAS
     Para agregar una nueva, sumá una línea siguiendo este mismo formato:
     obtenerArea("<id del ciclo>", "<nombre del grado>", "<nombre del área>")
     y el índice (0 = Actividad 1, 1 = Actividad 2, etc.).
     -------------------------------------------------------------------------- */

//  ==>>>  ciclo-1
//     ==>> 1.º Grado
  configurarActividad(obtenerArea("ciclo-1", "1.º Grado", "Lengua"), 0, {
    nombre: "Alfabetización",
    estado: "disponible",
    url: "https://material-icei.github.io/alfabetizacion1/"
  });
   
//     ==>> 2.º Grado
  configurarActividad(obtenerArea("ciclo-1", "2.º Grado", "Lengua"), 0, {
    nombre: "Alfabetización",
    estado: "disponible",
    url: "https://material-icei.github.io/alfabetizacion2/"
  });

  /* --------------------------------------------------------------------------
     RECURSOS DE LA BIBLIOTECA VIRTUAL
     Cada recurso se muestra como un botón que abre su URL en una pestaña
     nueva. Para agregar uno nuevo, sumá un objeto más a este array con el
     mismo formato (nombre, grado y url).
     -------------------------------------------------------------------------- */
  const RECURSOS_BIBLIOTECA = [
    { nombre: "Biblioteca mágica", grado: "1.º Grado", url: "https://material-icei.github.io/cuentosparaprimero/" },
    { nombre: "Cuentos que brillan", grado: "2.º Grado", url: "https://material-icei.github.io/cuentosparasegundo/" }
  ];

  /* ==========================================================================
     2. UTILIDADES GENERALES
     ========================================================================== */

  function normalizarId(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function esUrlValida(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  }

  function prefiereMovimientoReducido() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function crearElemento(etiqueta, opciones) {
    const el = document.createElement(etiqueta);
    opciones = opciones || {};
    if (opciones.clase) el.className = opciones.clase;
    if (opciones.html !== undefined) el.innerHTML = opciones.html;
    if (opciones.texto !== undefined) el.textContent = opciones.texto;
    if (opciones.atributos) {
      Object.keys(opciones.atributos).forEach(function (clave) {
        el.setAttribute(clave, opciones.atributos[clave]);
      });
    }
    return el;
  }

  /* ==========================================================================
     3. REFERENCIAS AL DOM
     ========================================================================== */

  const dom = {
    barraNav: document.getElementById("barra-nav"),
    navPrincipal: document.getElementById("nav-principal"),
    botonHamburguesa: document.getElementById("boton-hamburguesa"),
    enlacesNav: Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]")),
    botonesScroll: Array.prototype.slice.call(document.querySelectorAll("[data-scroll-a]")),

    rutaAventura: document.getElementById("ruta-aventura"),
    rutaAventuraInterior: document.getElementById("ruta-aventura-interior"),

    rejillaCiclos: document.getElementById("rejilla-ciclos"),

    seccionNiveles: document.getElementById("niveles"),
    nivelesDescripcion: document.getElementById("niveles-descripcion"),
    rejillaNiveles: document.getElementById("rejilla-niveles"),
    volverACiclos: document.getElementById("volver-a-ciclos"),

    seccionAreas: document.getElementById("areas"),
    areasDescripcion: document.getElementById("areas-descripcion"),
    listaAreas: document.getElementById("lista-areas"),
    volverANiveles: document.getElementById("volver-a-niveles"),

    modalFondo: document.getElementById("modal-fondo"),
    modal: document.getElementById("modal-proximamente"),
    modalCerrar: document.getElementById("modal-cerrar"),
    modalVolver: document.getElementById("modal-volver"),

    bibliotecaRecursos: document.getElementById("biblioteca-recursos"),

    anioActual: document.getElementById("anio-actual")
  };

  /* ==========================================================================
     4. ESTADO DE NAVEGACIÓN
     ========================================================================== */

  const estado = {
    ciclo: null,
    grado: null,
    areaAbiertaId: null,
    elementoFocoPrevio: null
  };

  /* ==========================================================================
     5. RENDER: CICLOS → NIVELES (GRADOS) → ÁREAS + MISIONES
     ========================================================================== */

  function renderCiclos() {
    dom.rejillaCiclos.innerHTML = "";

    plataforma.ciclos.forEach(function (ciclo) {
      const tarjeta = crearElemento("article", {
        clase: "tarjeta-ciclo tarjeta-ciclo--" + ciclo.personaje,
        atributos: { role: "listitem", "data-anim": "subir" }
      });

      tarjeta.innerHTML =
        '<div class="tarjeta-ciclo__marco">' +
          '<div class="personaje-guia personaje-guia--' + ciclo.personaje + '">' +
            '<span class="personaje-guia__cuerpo"></span>' +
            '<span class="personaje-guia__cara"><span class="personaje-guia__ojo"></span><span class="personaje-guia__ojo"></span></span>' +
            '<span class="personaje-guia__insignia">' + ciclo.insignia + "</span>" +
          "</div>" +
        "</div>" +
        '<p class="tarjeta-ciclo__numero">Ciclo ' + ciclo.numero + "</p>" +
        '<h3 class="tarjeta-ciclo__titulo">' + ciclo.nombre + "</h3>" +
        '<p class="tarjeta-ciclo__grados">' + ciclo.gradosTexto + "</p>" +
        '<p class="tarjeta-ciclo__recompensa"><span aria-hidden="true">' + ciclo.recompensa.icono + "</span> " + ciclo.recompensa.nombre + "</p>" +
        '<div class="barra-progreso" aria-hidden="true"><span class="barra-progreso__relleno" style="--progreso:' + (ciclo.numero * 12) + '%"></span></div>' +
        '<button class="boton boton--secundario tarjeta-ciclo__boton" type="button">Explorar</button>';

      tarjeta.querySelector(".tarjeta-ciclo__boton").addEventListener("click", function () {
        seleccionarCiclo(ciclo);
      });

      dom.rejillaCiclos.appendChild(tarjeta);
    });
  }

  function seleccionarCiclo(ciclo) {
    estado.ciclo = ciclo;
    estado.grado = null;
    estado.areaAbiertaId = null;

    marcarSeleccionActiva(dom.rejillaCiclos, ".tarjeta-ciclo", ciclo.id, plataforma.ciclos);

    renderNiveles(ciclo);
    ocultarSeccion(dom.seccionAreas);
    mostrarSeccion(dom.seccionNiveles);
    actualizarRutaAventura();
    desplazarA(dom.seccionNiveles);
  }

  function marcarSeleccionActiva(contenedor, selector, idActivo, listaOriginal) {
    const tarjetas = contenedor.querySelectorAll(selector);
    tarjetas.forEach(function (tarjeta, indice) {
      const item = listaOriginal[indice];
      const activa = item && item.id === idActivo;
      tarjeta.classList.toggle("esta-seleccionada", !!activa);
    });
  }

  function renderNiveles(ciclo) {
    dom.nivelesDescripcion.textContent =
      ciclo.nombre + " · " + ciclo.gradosTexto + " · recompensa: " + ciclo.recompensa.nombre;
    dom.rejillaNiveles.innerHTML = "";

    ciclo.grados.forEach(function (grado, indice) {
      const numeroNivel = String(indice + 1).padStart(2, "0");
      const cantidadAreas = grado.areas.length;

      const tarjeta = crearElemento("article", {
        clase: "tarjeta-nivel",
        atributos: { role: "listitem", "data-anim": "subir" }
      });

      tarjeta.innerHTML =
        '<p class="tarjeta-nivel__etiqueta">Nivel ' + numeroNivel + "</p>" +
        '<h3 class="tarjeta-nivel__titulo">' + grado.nombre + "</h3>" +
        '<p class="tarjeta-nivel__meta">' + cantidadAreas + " área" + (cantidadAreas === 1 ? "" : "s") + " para desbloquear</p>" +
        '<button class="boton boton--primario tarjeta-nivel__boton" type="button">Explorar</button>';

      tarjeta.querySelector(".tarjeta-nivel__boton").addEventListener("click", function () {
        seleccionarGrado(ciclo, grado);
      });

      dom.rejillaNiveles.appendChild(tarjeta);
    });
  }

  function seleccionarGrado(ciclo, grado) {
    estado.grado = grado;
    estado.areaAbiertaId = null;

    marcarSeleccionActiva(dom.rejillaNiveles, ".tarjeta-nivel", grado.id, ciclo.grados);

    renderAreas(ciclo, grado);
    mostrarSeccion(dom.seccionAreas);
    actualizarRutaAventura();
    desplazarA(dom.seccionAreas);
  }

  function renderAreas(ciclo, grado) {
    dom.areasDescripcion.textContent =
      ciclo.nombre + " · " + grado.nombre + " · elegí un área para ver sus misiones";
    dom.listaAreas.innerHTML = "";

    grado.areas.forEach(function (area) {
      const disponibles = area.actividades.filter(function (a) { return a.estado === "disponible"; }).length;

      const tarjeta = crearElemento("div", {
        clase: "tarjeta-area",
        atributos: { "data-anim": "subir" }
      });

      const idPanel = "panel-" + grado.id + "-" + area.id;

      const cabecera = crearElemento("button", {
        clase: "tarjeta-area__cabecera",
        atributos: {
          type: "button",
          "aria-expanded": "false",
          "aria-controls": idPanel
        }
      });
      cabecera.innerHTML =
        '<span class="tarjeta-area__icono" aria-hidden="true">' + area.icono + "</span>" +
        '<span class="tarjeta-area__info">' +
          '<span class="tarjeta-area__nombre">' + area.nombre + "</span>" +
          '<span class="tarjeta-area__meta">' + area.actividades.length + " misiones · " + disponibles + " disponibles</span>" +
        "</span>" +
        '<span class="tarjeta-area__flecha" aria-hidden="true">▾</span>';

      const panel = crearElemento("div", {
        clase: "tarjeta-area__panel",
        atributos: { id: idPanel, role: "region" }
      });
      panel.hidden = true;

      const listaMisiones = crearElemento("ul", { clase: "lista-misiones" });
      area.actividades.forEach(function (actividad, indice) {
        listaMisiones.appendChild(crearItemMision(actividad, indice));
      });
      panel.appendChild(listaMisiones);

      cabecera.addEventListener("click", function () {
        alternarArea(tarjeta, cabecera, panel, idPanel);
      });

      tarjeta.appendChild(cabecera);
      tarjeta.appendChild(panel);
      dom.listaAreas.appendChild(tarjeta);
    });
  }

  function crearItemMision(actividad, indice) {
    const numeroMision = String(indice + 1).padStart(2, "0");
    const disponible = actividad.estado === "disponible" && esUrlValida(actividad.url);

    const item = crearElemento("li", {
      clase: "mision" + (disponible ? " mision--disponible" : " mision--bloqueada")
    });

    item.innerHTML =
      '<span class="mision__numero">Misión ' + numeroMision + "</span>" +
      '<span class="mision__nombre">' + actividad.nombre + "</span>" +
      '<span class="mision__estado" aria-hidden="true">' + (disponible ? "✔" : "🔒") + "</span>";

    const boton = crearElemento("button", {
      clase: "boton boton--mision",
      texto: disponible ? "Jugar" : "Próximamente",
      atributos: { type: "button" }
    });

    boton.addEventListener("click", function () {
      if (disponible) {
        window.open(actividad.url.trim(), "_blank", "noopener,noreferrer");
      } else {
        abrirModalProximamente(boton);
      }
    });

    item.appendChild(boton);
    return item;
  }

  function alternarArea(tarjeta, cabecera, panel, idPanel) {
    const yaAbierta = estado.areaAbiertaId === idPanel;

    // Cerrar cualquier otra área abierta dentro de la misma lista (efecto acordeón).
    dom.listaAreas.querySelectorAll(".tarjeta-area__cabecera[aria-expanded='true']").forEach(function (otraCabecera) {
      if (otraCabecera !== cabecera) {
        colapsarPanel(otraCabecera);
      }
    });

    if (yaAbierta) {
      colapsarPanel(cabecera);
      estado.areaAbiertaId = null;
    } else {
      expandirPanel(cabecera, panel);
      estado.areaAbiertaId = idPanel;
    }
  }

  function expandirPanel(cabecera, panel) {
    cabecera.setAttribute("aria-expanded", "true");
    cabecera.closest(".tarjeta-area").classList.add("tarjeta-area--abierta");
    panel.hidden = false;
    // Se fija la altura real para animar con transición de max-height.
    panel.style.maxHeight = panel.scrollHeight + "px";
  }

  function colapsarPanel(cabecera) {
    const tarjeta = cabecera.closest(".tarjeta-area");
    const panel = tarjeta.querySelector(".tarjeta-area__panel");
    cabecera.setAttribute("aria-expanded", "false");
    tarjeta.classList.remove("tarjeta-area--abierta");
    panel.style.maxHeight = "0px";
    window.setTimeout(function () {
      if (cabecera.getAttribute("aria-expanded") === "false") panel.hidden = true;
    }, 350);
  }

  // Genera los botones de la Biblioteca Virtual a partir de RECURSOS_BIBLIOTECA.
  function renderBibliotecaRecursos() {
    if (!dom.bibliotecaRecursos) return;
    dom.bibliotecaRecursos.innerHTML = "";

    RECURSOS_BIBLIOTECA.forEach(function (recurso) {
      const enlace = crearElemento("a", {
        clase: "boton boton--secundario",
        atributos: {
          href: recurso.url,
          target: "_blank",
          rel: "noopener noreferrer"
        }
      });
      enlace.innerHTML =
        '<span aria-hidden="true">📚</span> ' + recurso.nombre +
        ' <span class="biblioteca__recurso-grado">· ' + recurso.grado + "</span>";
      dom.bibliotecaRecursos.appendChild(enlace);
    });
  }

  function mostrarSeccion(seccion) {
    seccion.classList.remove("oculta");
  }
  function ocultarSeccion(seccion) {
    seccion.classList.add("oculta");
  }

  function desplazarA(elemento) {
    const comportamiento = prefiereMovimientoReducido() ? "auto" : "smooth";
    window.setTimeout(function () {
      elemento.scrollIntoView({ behavior: comportamiento, block: "start" });
    }, 30);
  }

  /* ==========================================================================
     6. RUTA DE AVENTURA (BREADCRUMB)
     ========================================================================== */

  function actualizarRutaAventura() {
    dom.rutaAventuraInterior.innerHTML = "";

    if (!estado.ciclo) {
      dom.rutaAventura.classList.remove("ruta-aventura--visible");
      return;
    }
    dom.rutaAventura.classList.add("ruta-aventura--visible");

    const pasos = [{ etiqueta: "Inicio", accion: irAInicio }];
    pasos.push({ etiqueta: estado.ciclo.nombre, accion: function () { seleccionarCiclo(estado.ciclo); } });
    if (estado.grado) {
      pasos.push({ etiqueta: estado.grado.nombre, accion: function () { seleccionarGrado(estado.ciclo, estado.grado); } });
    }

    pasos.forEach(function (paso, indice) {
      const esUltimo = indice === pasos.length - 1;
      const boton = crearElemento("button", {
        clase: "ruta-aventura__paso" + (esUltimo ? " ruta-aventura__paso--actual" : ""),
        texto: paso.etiqueta,
        atributos: { type: "button" }
      });
      if (esUltimo) boton.setAttribute("aria-current", "step");
      boton.addEventListener("click", paso.accion);
      dom.rutaAventuraInterior.appendChild(boton);

      if (!esUltimo) {
        dom.rutaAventuraInterior.appendChild(crearElemento("span", {
          clase: "ruta-aventura__separador",
          texto: "→",
          atributos: { "aria-hidden": "true" }
        }));
      }
    });
  }

  function irAInicio() {
    estado.ciclo = null;
    estado.grado = null;
    estado.areaAbiertaId = null;
    ocultarSeccion(dom.seccionNiveles);
    ocultarSeccion(dom.seccionAreas);
    actualizarRutaAventura();
    desplazarA(document.getElementById("inicio"));
  }

  dom.volverACiclos.addEventListener("click", function () {
    ocultarSeccion(dom.seccionNiveles);
    ocultarSeccion(dom.seccionAreas);
    estado.grado = null;
    actualizarRutaAventura();
    desplazarA(document.getElementById("ciclos"));
  });

  dom.volverANiveles.addEventListener("click", function () {
    ocultarSeccion(dom.seccionAreas);
    estado.grado = null;
    actualizarRutaAventura();
    desplazarA(dom.seccionNiveles);
  });

  /* ==========================================================================
     7. MODAL "PRÓXIMAMENTE"
     ========================================================================== */

  function abrirModalProximamente(elementoDisparador) {
    estado.elementoFocoPrevio = elementoDisparador || document.activeElement;
    dom.modalFondo.hidden = false;
    // Forzamos reflow para permitir la transición de entrada.
    requestAnimationFrame(function () {
      dom.modalFondo.classList.add("modal-fondo--visible");
    });
    dom.modalCerrar.focus();
    document.addEventListener("keydown", cerrarModalConEsc);
  }

  function cerrarModalProximamente() {
    dom.modalFondo.classList.remove("modal-fondo--visible");
    document.removeEventListener("keydown", cerrarModalConEsc);
    window.setTimeout(function () {
      dom.modalFondo.hidden = true;
      if (estado.elementoFocoPrevio && typeof estado.elementoFocoPrevio.focus === "function") {
        estado.elementoFocoPrevio.focus();
      }
    }, 250);
  }

  function cerrarModalConEsc(evento) {
    if (evento.key === "Escape") cerrarModalProximamente();
  }

  dom.modalCerrar.addEventListener("click", cerrarModalProximamente);
  dom.modalVolver.addEventListener("click", cerrarModalProximamente);
  dom.modalFondo.addEventListener("click", function (evento) {
    if (evento.target === dom.modalFondo) cerrarModalProximamente();
  });

  /* ==========================================================================
     8. MENÚ RESPONSIVE, SCROLL SUAVE Y NAV ACTIVO
     ========================================================================== */

  function alternarMenuMovil(forzarCerrado) {
    const abierto = forzarCerrado ? false : !dom.navPrincipal.classList.contains("nav-principal--abierto");
    dom.navPrincipal.classList.toggle("nav-principal--abierto", abierto);
    dom.botonHamburguesa.setAttribute("aria-expanded", String(abierto));
    dom.botonHamburguesa.classList.toggle("boton-hamburguesa--activo", abierto);
    document.body.classList.toggle("bloquear-scroll", abierto);
  }

  dom.botonHamburguesa.addEventListener("click", function () {
    alternarMenuMovil();
  });

  function irASeccion(idDestino) {
    const destino = document.getElementById(idDestino);
    if (!destino) return;
    alternarMenuMovil(true);
    desplazarA(destino);
  }

  dom.enlacesNav.forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
      evento.preventDefault();
      irASeccion(enlace.getAttribute("data-destino"));
    });
  });

  dom.botonesScroll.forEach(function (boton) {
    boton.addEventListener("click", function () {
      irASeccion(boton.getAttribute("data-scroll-a"));
    });
  });

  function initNavActivo() {
    const secciones = ["inicio", "ciclos", "biblioteca"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || secciones.length === 0) return;

    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        dom.enlacesNav.forEach(function (enlace) {
          const activo = enlace.getAttribute("data-destino") === entrada.target.id;
          enlace.classList.toggle("nav-principal__enlace--activo", activo);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    secciones.forEach(function (seccion) { observador.observe(seccion); });
  }

  /* ==========================================================================
     9. ANIMACIONES DE ENTRADA AL HACER SCROLL
     ========================================================================== */

  function initRevelarAlScroll() {
    const elementos = document.querySelectorAll("[data-anim]");

    if (prefiereMovimientoReducido() || !("IntersectionObserver" in window)) {
      elementos.forEach(function (el) { el.classList.add("en-vista"); });
      return;
    }

    const observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("en-vista");
          obs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15 });

    elementos.forEach(function (el) { observador.observe(el); });
  }

  // Reobservar los elementos que se generan dinámicamente después del primer render.
  function revelarNuevosElementos(contenedor) {
    const elementos = contenedor.querySelectorAll("[data-anim]:not(.en-vista)");
    if (prefiereMovimientoReducido()) {
      elementos.forEach(function (el) { el.classList.add("en-vista"); });
      return;
    }
    // Pequeño retardo para que el navegador aplique el estado inicial antes de animar.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        elementos.forEach(function (el) { el.classList.add("en-vista"); });
      });
    });
  }

  const renderNivelesOriginal = renderNiveles;
  renderNiveles = function (ciclo) {
    renderNivelesOriginal(ciclo);
    revelarNuevosElementos(dom.rejillaNiveles);
  };
  const renderAreasOriginal = renderAreas;
  renderAreas = function (ciclo, grado) {
    renderAreasOriginal(ciclo, grado);
    revelarNuevosElementos(dom.listaAreas);
  };

  /* ==========================================================================
     10. INICIALIZACIÓN
     ========================================================================== */

  function init() {
    dom.anioActual.textContent = new Date().getFullYear();
    renderCiclos();
    renderBibliotecaRecursos();
    initNavActivo();
    initRevelarAlScroll();
    revelarNuevosElementos(dom.rejillaCiclos);

    // Recalcular la altura del panel abierto si cambia el tamaño de ventana
    // (por ejemplo, al rotar el dispositivo).
    window.addEventListener("resize", function () {
      const cabeceraAbierta = dom.listaAreas.querySelector(".tarjeta-area__cabecera[aria-expanded='true']");
      if (!cabeceraAbierta) return;
      const panel = cabeceraAbierta.closest(".tarjeta-area").querySelector(".tarjeta-area__panel");
      panel.style.maxHeight = panel.scrollHeight + "px";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
