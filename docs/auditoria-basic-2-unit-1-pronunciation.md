# Auditoría - Basic English 2 Unit 1 Pronunciation

Fecha local de auditoría: 2026-07-26  
Actividad auditada: `ingles/basico-2/pronunciation-unit-1-weather-going-out.html`  
JS auditado: `assets/js/english-basic2-pronunciation-unit1.js`  
Estándar usado: `docs/pronunciation-activity-standard.md`

## Resultado general

Estado: **APROBADA CON UNA OBSERVACIÓN PEDAGÓGICA**

La actividad no ejecuta flujo francés ni intermedio. Usa endpoint de inglés básico, claves de almacenamiento propias de Basic 2, `lang="en"`, audios profesionales MP3 y evaluación palabra por palabra. La única observación relevante es que el reto final actual es un párrafo integrador, no una concatenación literal de las seis secciones guiadas, mientras que el estándar de pronunciación pide que el reto final reúna el texto completo de las secciones guiadas.

## Comandos ejecutados

```powershell
node --check assets\js\english-basic2-pronunciation-unit1.js
python -m py_compile server\progress_api.py
rg -n "speechSynthesis|SpeechSynthesisUtterance|webkitSpeechSynthesis|responsiveVoice|/api/french|/api/english-intermediate|jaralingua:french|Français|Recording vocal|Bilan|Terminer|Section suivante|Intermediate English account|unit-6|future-plans|Olivia|Marcus|rehearsing|producer|photo session" assets\js\english-basic2-pronunciation-unit1.js ingles\basico-2\pronunciation-unit-1-weather-going-out.html docs\basic-2-unit-1-weather-pronunciation-plan.md
```

## Evidencia técnica

| Revisión | Resultado | Evidencia |
|---|---:|---|
| Sintaxis JS | OK | `node --check` sin errores |
| Sintaxis backend | OK | `python -m py_compile` sin errores |
| Endpoint de pronunciación | OK | `const API_PATH = "/api/english-basic/pronunciation-assessment"` |
| Endpoint de entrega docente | OK | `const SUBMIT_PATH = "/api/basic/basic2-unit1-pronunciation-weather/submit"` |
| Clave de progreso | OK | `jaralingua:english-basic2:pronunciation-unit1-weather-going-out:v1` |
| Idioma visible del texto de lectura | OK | `#readingText lang="en"` |
| Voces del navegador | OK | No hay `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` |
| Residuos de francés/intermedio en runtime | OK | No se encontraron endpoints franceses/intermedio ni cadenas heredadas operativas |
| Botón siguiente antes de evaluar | OK | No visible antes de evaluación |
| Botón de entrega antes de completar | OK | Deshabilitado antes de completar todas las etapas |
| Velocidad de modelo | OK | `1.0` activa por defecto; `0.75` disponible |
| Responsive | OK | Sin overflow en móvil, tablet y desktop |
| Banner | OK | `background-attachment: scroll` |
| Producción | OK | Página, JS, CSS y MP3 principales responden `200` |
| Endpoint sin sesión | OK | Responde `401`, esperado |

## Auditoría texto visible vs fuente ElevenLabs

| Sección | MP3 | Fuente existe | Texto visible = fuente |
|---|---|---:|---:|
| Section 1 - Weather words | `section-1-weather-words.mp3` | Sí | Sí |
| Section 2 - Weather sentences | `section-2-weather-sentences.mp3` | Sí | Sí |
| Section 3 - Actions now | `section-3-actions-now.mp3` | Sí | Sí |
| Section 4 - -ing endings | `section-4-ing-endings.mp3` | Sí | Sí |
| Section 5 - Changing plans | `section-5-changing-plans.mp3` | Sí | Sí |
| Section 6 - Unit expressions | `section-6-unit-expressions.mp3` | Sí | Sí |
| Final challenge | `final-challenge-weather-going-out.mp3` | Sí | Sí |

Archivos MP3 auditados:

```text
section-1-weather-words.mp3            47,273 bytes
section-2-weather-sentences.mp3        70,261 bytes
section-3-actions-now.mp3             134,626 bytes
section-4-ing-endings.mp3              72,351 bytes
section-5-changing-plans.mp3          123,759 bytes
section-6-unit-expressions.mp3        109,549 bytes
final-challenge-weather-going-out.mp3 232,847 bytes
```

## Observación pedagógica

El estándar dice:

> El desafío final debe contener el texto completo de las secciones guiadas.

Estado actual:

- Secciones guiadas: 103 palabras aproximadamente.
- Reto final actual: 52 palabras aproximadamente.
- El reto final integra clima + presente continuo + cambio de planes, pero no repite literalmente todo el texto de las seis secciones.

Impacto:

- No rompe la actividad.
- No mezcla francés ni intermedio.
- Sí es una desviación del estándar estricto de pronunciación.

Decisión recomendada:

1. Si queremos seguir el estándar estrictamente, cambiar el reto final por la concatenación completa de las seis secciones y regenerar solo `final-challenge-weather-going-out.mp3`.
2. Si queremos mantener un reto final más pedagógico y menos largo, actualizar el estándar para permitir “reto final integrador” cuando las secciones guiadas ya cubren todo el contenido.

## Nota sobre consola en producción

La revisión en producción reportó mensajes 404 genéricos asociados al endpoint global `/csp-report`. No corresponden a assets de esta actividad. Página, JS, CSS, imagen y audios cargan correctamente.

## Conclusión

La actividad está técnicamente sana para uso: no ejecuta revisión francesa, no usa endpoints de francés, no usa voces del navegador, y mantiene la entrega docente con peso `0`. La decisión pendiente es pedagógica: ajustar el reto final al estándar literal o aceptar el formato integrador y documentarlo como variante permitida.
