# Unit 6 · What did they say?

Actividad oral dirigida por el docente en Practice Lab. Un ejemplo guiado y diez imágenes de práctica distintas; el hero es una imagen adicional propia. El docente elige dos estudiantes: A describe tres detalles en presente y B reporta las palabras de A con `said (that)` y cambios al pasado. Luego intercambian roles. No solicita nombres, graba, entrega ni califica.

## Referencias y pedagogía

Reutiliza la secuencia de clase por imágenes y dos participantes de **Yesterday’s Picture Challenge**, Básico 2, Unidad 5; la proyección, navegación de escenas y ayudas optativas de **One Picture, Many Impressions**, Intermedio 2, Unidad 5. Conserva el tema, autenticación y QR compartidos del curso.

El modelo muestra tres frases paralelas por escena, con cambios explícitos: presente simple a pasado simple, presente continuo a pasado continuo, `can → could` y los pronombres según la persona que habla. `said` frente a `told me`, `that` opcional y expresiones de tiempo/lugar se explican. Se aclara que el cambio al pasado es el foco de este ejercicio, no una obligación universal cuando la información sigue siendo cierta. B debe conservar lo que A dijo, sin añadir una nueva descripción. Ana es la hablante ficticia de los modelos; usar el nombre real del compañero al practicar.

Escenas: entrevista tras una tormenta (ejemplo), inundación, terremoto, incendio forestal, sequía, deslizamiento, huracán, entrevista musical, comprobación de fuentes, rueda de prensa y refugio. Los modelos de práctica se ocultan al cambiar de escena. La guía de A, la de B, los pasos, la explicación, la tabla de cambios, los modelos y cada imagen se pueden proyectar por separado; también la ronda completa. Flechas del teclado en el proyector, cierre Escape y pantalla completa con alternativa de diálogo ampliado.

## Recursos y mantenimiento

- Página: `speaking-unit-6-what-did-they-say.html`.
- Datos: `assets/js/english-intermediate2-reported-speech-data.js`; generador `tools/build_intermediate2_reported_speech_data.py`.
- Comportamiento y estilo: `english-intermediate2-reported-speech.js` y `.css`.
- Imágenes originales: `assets/img/english-intermediate-2/unit-6/reported-speech/`; prompts y procedencia en `prompts.json`. Herramienta integrada image_gen; WebP para publicación.
- 25 MP3 de ElevenLabs, voz David clonada previamente autorizada (`pv8WYYW60prEkDbDXyC0`), Multilingual v2: dos modelos por imagen y tres instrucciones. Manifiesto y auditoría en `audio/unit-6-reported-speech/`. Modelos públicos por solicitud del docente.
- Un reproductor, velocidad 0.75×/1×, inicio mediante clic y cancelación al cambiar escena, proyección o cerrar. No voz sintética del navegador.
- Catálogo con buscador de Practice Lab, diez miniaturas filtrables, QR y sitemap. El contrato del curso pasa a 51 páginas.

## Validación

`tools/test_intermediate2_reported_speech.cjs --static` comprueba escenas, frases, recursos, hashes y auditoría de voz. Sin el indicador prueba la interfaz: escenas, modelos ocultos, proyecciones, navegación por teclado, audio real, errores de audio, velocidad, cancelación, QR, seis anchos y enlace de catálogo. Complementar con contrato del curso y auditoría de Sign in. La transcripción comprueba las palabras audibles; no es una evaluación perceptiva de la entonación.
