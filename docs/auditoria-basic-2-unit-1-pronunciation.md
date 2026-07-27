# Auditoria - Basic English 2 Unit 1 Pronunciation

Fecha local de auditoria: 2026-07-26  
Actividad auditada: `ingles/basico-2/pronunciation-unit-1-weather-going-out.html`  
JS auditado: `assets/js/english-basic2-pronunciation-unit1.js`  
Estandar usado: `docs/pronunciation-activity-standard.md`

## Resultado general

Estado: **APROBADA**

La actividad no ejecuta flujo frances ni intermedio. Usa endpoint de ingles basico, claves de almacenamiento propias de Basic 2, `lang="en"`, audios profesionales MP3 y evaluacion palabra por palabra.

Correccion aplicada despues de la auditoria inicial:

- El reto final ya no es un parrafo integrador reducido.
- El reto final ahora concatena literalmente las seis secciones guiadas, siguiendo el patron ya usado en las actividades de pronunciacion anteriores.
- Se regenero exclusivamente `final-challenge-weather-going-out.mp3`.

## Comandos ejecutados

```powershell
node --check assets\js\english-basic2-pronunciation-unit1.js
python -m py_compile server\progress_api.py
rg -n "speechSynthesis|SpeechSynthesisUtterance|webkitSpeechSynthesis|responsiveVoice|/api/french|/api/english-intermediate|jaralingua:french|Français|Recording vocal|Bilan|Terminer|Section suivante|Intermediate English account|unit-6|future-plans|Olivia|Marcus|rehearsing|producer|photo session" assets\js\english-basic2-pronunciation-unit1.js ingles\basico-2\pronunciation-unit-1-weather-going-out.html docs\basic-2-unit-1-weather-pronunciation-plan.md
```

## Evidencia tecnica

| Revision | Resultado | Evidencia |
|---|---:|---|
| Sintaxis JS | OK | `node --check` sin errores |
| Sintaxis backend | OK | `python -m py_compile` sin errores |
| Endpoint de pronunciacion | OK | `const API_PATH = "/api/english-basic/pronunciation-assessment"` |
| Endpoint de entrega docente | OK | `const SUBMIT_PATH = "/api/basic/basic2-unit1-pronunciation-weather/submit"` |
| Clave de progreso | OK | `jaralingua:english-basic2:pronunciation-unit1-weather-going-out:v1` |
| Idioma visible del texto de lectura | OK | `#readingText lang="en"` |
| Voces del navegador | OK | No hay `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` |
| Residuos de frances/intermedio en runtime | OK | No se encontraron endpoints franceses/intermedio ni cadenas heredadas operativas |
| Boton siguiente antes de evaluar | OK | No visible antes de evaluacion |
| Boton de entrega antes de completar | OK | Deshabilitado antes de completar todas las etapas |
| Velocidad de modelo | OK | `1.0` activa por defecto; `0.75` disponible |
| Responsive | OK | Sin overflow en movil, tablet y desktop |
| Banner | OK | `background-attachment: scroll` |
| Produccion | OK | Pagina, JS, CSS y MP3 principales responden `200` |
| Endpoint sin sesion | OK | Responde `401`, esperado |

## Auditoria texto visible vs fuente ElevenLabs

| Seccion | MP3 | Fuente existe | Texto visible = fuente |
|---|---|---:|---:|
| Section 1 - Weather words | `section-1-weather-words.mp3` | Si | Si |
| Section 2 - Weather sentences | `section-2-weather-sentences.mp3` | Si | Si |
| Section 3 - Actions now | `section-3-actions-now.mp3` | Si | Si |
| Section 4 - -ing endings | `section-4-ing-endings.mp3` | Si | Si |
| Section 5 - Changing plans | `section-5-changing-plans.mp3` | Si | Si |
| Section 6 - Unit expressions | `section-6-unit-expressions.mp3` | Si | Si |
| Final challenge | `final-challenge-weather-going-out.mp3` | Si | Si |

Archivos MP3 auditados:

```text
section-1-weather-words.mp3            47,273 bytes
section-2-weather-sentences.mp3        70,261 bytes
section-3-actions-now.mp3             134,626 bytes
section-4-ing-endings.mp3              72,351 bytes
section-5-changing-plans.mp3          123,759 bytes
section-6-unit-expressions.mp3        109,549 bytes
final-challenge-weather-going-out.mp3 607,338 bytes
```

## Reto final

El estandar dice:

> El desafio final debe contener el texto completo de las secciones guiadas.

Estado actual:

- Secciones guiadas: 103 palabras aproximadamente.
- Reto final: 103 palabras aproximadamente.
- El reto final es la concatenacion literal de las seis secciones guiadas.
- El audio final fue regenerado despues de la correccion y coincide con el texto visible.

## Nota sobre consola en produccion

La revision en produccion puede reportar mensajes 404 genericos asociados al endpoint global `/csp-report`. No corresponden a assets de esta actividad. Pagina, JS, CSS, imagen y audios cargan correctamente.

## Conclusion

La actividad cumple el estandar de pronunciacion: no ejecuta revision francesa, no usa endpoints de frances, no usa voces del navegador, mantiene la entrega docente con peso `0`, y el reto final ahora exige decir todo el contenido guiado.
