# Maya · Demo "Formaciones"

Demo navegable, **solo mobile**, de la funcionalidad Formaciones de Maya. Se usa en entrevistas con usuarias: no tiene backend y ningún botón envía mensajes ni hace llamadas reales.

## Cómo correrla

```bash
npm install
npm run dev
```

`npm run build` genera el sitio estático en `dist/`. Cada push a `main` lo publica en GitHub Pages.

## Cómo se usa

- La primera pantalla es **Configurar demo** (también en `#/config`): nombre de la participante, estatus y, para Emprendedoras, el nombre de su Directora.
- El panel flotante **Ver como** cambia de perfil sin recargar. Cada perfil guarda su propio estado.
- El perfil también se fija por URL: `?como=CEM`.
- **Reiniciar demo** borra la sesión y vuelve a la configuración.

## Estructura

```
src/
  config/demo.config.ts   única fuente de datos: perfiles, montos, requisitos, textos legales y URLs
  domain/                 reglas y textos calculados (camino de carrera, mensajes, formato de moneda)
  state/                  sesión, perfil activo y estado por perfil (localStorage) + rutas con hash
  components/             piezas compartidas: hoja inferior, navegación, "Ver como", chat simulado
  screens/                una carpeta o archivo por pantalla
  styles/                 CSS por pantalla, sobre los tokens de FrYDA
  assets/figma/           imágenes e íconos exportados del Figma "MVP Formaciones"
```

## Diseño

Los componentes (`fry-button`, `fry-chip`, `fry-switch`, `fry-input-currency`, `fry-icon`), los tokens y la tipografía Maison Neue vienen de **FrYDA**, cargados desde su CDN en `index.html`. La demo necesita conexión para verse con sus estilos.

## Etapas

1. Base, Configurar demo, panel "Ver como" y Parte A (Mi carrera) — **hecha**.
2. Parte B · Formaciones (Directoras Junior y Senior) — **hecha**.
3. Parte C · Emprendedoras (Líderes) — **hecha**.
