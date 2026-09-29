# Revisión de entrega del examen final de Francés 1

## Resultado

- La entrega guarda nota sobre 5 inmediatamente en `finalExam`, peso 20 %, aunque el resultado del examen aún no se publique al estudiante.
- Se exige completar las preguntas para el envío manual.
- El envío utiliza las últimas respuestas del formulario; el borrador anterior no las reemplaza.
- El servidor conserva un único examen por estudiante y devuelve el mismo comprobante ante un segundo envío.
- Si se guarda la copia y falla la escritura de la grilla, repetir el envío repara la nota pendiente.

## Cambios de interfaz

- Un fallo de envío inicia un único reintento de recuperación del mismo envío. Puede recuperar el comprobante y terminar de sincronizar la nota. No se confunde una respuesta de conexión perdida con una entrega rechazada.
- Si no se consigue confirmar, se conserva el formulario y el borrador; el mensaje indica que puede reintentarse sin duplicar la copia.
- La confirmación muestra « Votre examen final a été enregistré » y el comprobante del servidor. Recibe foco y se desplaza a la vista del estudiante.
- No se limpia el formulario sin un recibo correspondiente al estudiante, intento y versión actuales.
- Un recibo de otra identidad no deja la interfaz atascada en « enviando ».

## Pruebas

`tools/test_french1_final_delivery.py`: cuatro escenarios nuevos sobre la banca completa real y archivos temporales, junto a las 29 pruebas existentes del backend. Se ejecutaron también como `www-data` en el VPS. No crean entregas de alumnos reales.

`tools/test_french1_final_delivery_ui.cjs`: ejecución aislada de funciones de interfaz para confirmación previa, preguntas incompletas, respuestas modificadas, doble pulsación, respuesta perdida, duplicados, desconexión persistente, recibo incorrecto y confirmación visible.

Durante la inspección de producción el examen estaba abierto, había cero entregas y cero discrepancias entre entregas y notas. No se cambió la apertura ni se reinició el servicio. La prueba de botones es una simulación automatizada; no reemplaza una sesión física en cada teléfono.
