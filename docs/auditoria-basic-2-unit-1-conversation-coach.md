# Auditoría - Basic English 2 Unit 1 Conversation Coach

Fecha: 2026-07-26  
Actividad: `ingles/basico-2/conversation-coach-unit-1-weather-going-out.html`  
Personaje: Mia Parker  
Perfil: práctica privada, formativa, sin entrega al profesor.

## Resultado

Estado: PASSED.

## Alcance pedagógico

- Unidad: Going Out.
- Enfoque: weather, present continuous, sports/activity verbs, going-out phrasal verbs, changing plans, role reversal.
- Banco: 8 preguntas.
- Intento: 4 turnos balanceados.
- Turno obligatorio: el estudiante pregunta a Mia dos preguntas sobre weather, sports o going out.
- Modo guiado: muestra frames, vocabulario, pista gramatical, feedback y reacción de Mia.
- Modo real conversation: oculta soporte durante la conversación y deja el detalle para el reporte final.
- Puntaje: reporte privado `/50`.
- Reintentos: ilimitados; historial local en el navegador.
- Entrega al profesor: no implementada por diseño.

## Audio e identidad

- Imagen profesional nueva: `mia-parker-conversation-coach-hero.webp`.
- Retrato derivado de la misma imagen: `mia-parker-conversation-coach-portrait.webp`.
- Voz: ElevenLabs female US voice configurada como `Mia`.
- Guion aprobado junto a los audios: `ingles/basico-2/audio/unit1/conversation-coach/mia-weather-going-out-scripts.md`.
- MP3 generados: 25.
- Velocidades visibles: `0.75x`, `1x`, `1.25x`.
- No usa `speechSynthesis`.

## Reacciones naturales

El motor v2 fue extendido de forma compatible para:

- usar el nombre configurado del coach en vez de textos fijos con “Maya”;
- seleccionar reacciones por evidencia de transcripción mediante `reactionResponses`.

Ejemplos de rutas:

- rain / raining / pouring / stormy → reacción sobre cambio de planes por lluvia;
- sunny / warm / hot → reacción sobre salir, caminar o reunirse;
- soccer / running / yoga → reacción sobre actividad adecuada al clima;
- stay in / staying in → reacción sobre quedarse en casa;
- meet up / go out / come over → reacción sobre planes sociales;
- present continuous evidence → reacción sobre acciones happening now.

## Validaciones ejecutadas

- `node --check assets/js/conversation-coach-v2.js`
- `node --check assets/js/conversation-coach-data/english-basic-2-unit-1-weather-going-out.js`
- Validación automática de referencias:
  - 8 preguntas;
  - 4 preguntas por intento;
  - role reversal obligatorio;
  - 25 MP3 referenciados existentes;
  - imágenes de Mia existentes.
- Servidor local:
  - `http://127.0.0.1:8026/ingles/basico-2/conversation-coach-unit-1-weather-going-out.html` respondió `200`.
- Prueba headless con Chrome:
  - `390x844`: sin overflow horizontal, dock oculto al inicio y visible durante conversación.
  - `768x1024`: sin overflow horizontal, dock oculto al inicio y visible durante conversación.
  - `1366x768`: sin overflow horizontal, dock oculto al inicio y visible durante conversación.

## Archivos principales

- Página: `ingles/basico-2/conversation-coach-unit-1-weather-going-out.html`
- Configuración: `assets/js/conversation-coach-data/english-basic-2-unit-1-weather-going-out.js`
- Motor compartido ajustado: `assets/js/conversation-coach-v2.js`
- Estilos propios: `assets/css/english-basic2-conversation-coach.css`
- Audios: `ingles/basico-2/audio/unit1/conversation-coach/`
- Imágenes: `assets/img/english-basic-2/unit-1-going-out/mia-parker-conversation-coach-*.webp`

## Nota de privacidad

La actividad procesa el audio temporalmente con el servicio de transcripción configurado. No persiste blobs de audio en `localStorage`, no envía resultado al profesor y no crea registro en Grades.
