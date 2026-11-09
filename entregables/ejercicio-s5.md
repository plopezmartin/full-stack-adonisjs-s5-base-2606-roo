# Ejercicio S5

## Parte A

### Ajustes al prompt

1. **Ajuste:** Incluir ejemplos y concretar más el prompt.
   **Motivo:** Mi prompt era demasiado general. Quería que los criterios Given/When/Then siguieran un formato Gherkin estricto, pero la IA no lo infirió por sí sola. Añadir un ejemplo ayuda a fijar el formato de las historias de usuario.
2. **Ajuste:** Pedir explícitamente edge cases y escenarios negativos en los criterios de aceptación (AC).
   **Motivo:** Los AC generados eran demasiado simples y solo cubrían el camino feliz.
3. **Ajuste:** Acotar el número de AC y de historias de usuario (US).
   **Motivo:** Ayuda a la IA a centrarse en lo más importante.

## Parte B

### Auditoría de documentación

#### README de proyecto

- **Estado:** PARCIAL
- **Observación:** El README.md ofrece una buena visión general del proyecto, su stack y la guía operacional. El AGENTS.md es un buen punto de partida para un agente: se centra en las convenciones y en lo que no se deduce explorando el código. Sin embargo, la documentación no está estructurada, sino repartida en archivos .md sueltos. Convendría centralizarla en `docs/`, tanto a nivel general como por componente.

#### Arquitectura general

- **Estado:** INEXISTENTE
- **Observación:** No hay diagramas C4 en ningún nivel. Los he generado yo con Structurizr.

#### Documentación de la API o de los endpoints

- **Estado:** INEXISTENTE
- **Observación:** Los README.md incluyen un resumen de los endpoints, pero no existe documentación estructurada y accesible mediante Swagger/Scalar, ni documentación de los tipos con TypeDoc.

#### Docstrings y comentarios significativos en código

- **Estado:** PARCIAL
- **Observación:** Los endpoints públicos no suelen documentarse con TSDoc, mientras que el código del propio framework AdonisJS sí lo está.

#### Decisiones técnicas registradas

- **Estado:** INEXISTENTE
- **Observación:** No se registra ninguna decisión técnica.

#### Guía operacional

- **Estado:** COMPLETA
- **Observación:** Cubierta en el README.md general y en los de backend y frontend.

#### Convenciones de código del proyecto

- **Estado:** COMPLETA
- **Observación:** Documentadas en los README.md.

#### Especificación OpenSpec y su trazabilidad con el código

- **Estado:** INEXISTENTE
- **Observación:** No hay ninguna documentación de OpenSpec.

### Top 3 carencias que más duelen

1. No hay modelos C4.
2. No hay documentación de la API con Scalar.
3. No hay ADR que permitan comprender el histórico de decisiones de arquitectura.

### Top 3 cosas que ya están bien

1. Los README.md con su guía operacional.
2. Las convenciones de código.
3. _(pendiente)_

### Reflexiones

#### Modelo C4

Ofrece visualizaciones de la arquitectura en varios niveles y muestra cómo se relacionan entre sí. No es necesario cubrir todos los niveles; el de código es quizá el más prescindible. Es imprescindible para el onboarding, y también lo es mantenerlo al día.

#### ADRs

Son el histórico de las decisiones de arquitectura. Es muy humano llegar a un proyecto nuevo y pensar que es mejorable. Los ADR aportan el trasfondo y permiten saber si ya se valoraron las alternativas que tenías en mente. Son el antídoto contra el «if it works, don't touch it»: cuando entiendes bien _why it works in the first place_, decides con criterio.

#### OpenAPI

Es el estándar de facto para documentar APIs. Define un contrato consultable por el cliente, y sobre él se puede generar documentación de referencia visual (Swagger UI, Scalar, etc.).
