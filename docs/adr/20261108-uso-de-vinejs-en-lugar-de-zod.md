# Uso de VineJS en lugar de Zod para la validación

- Status: accepted
- Date: 2026-11-08
- Tags: backend, validacion

## Context and Problem Statement

El backend (AdonisJS 7) necesita validar siempre el input de las peticiones HTTP antes de que llegue a la lógica de los controllers. ¿Qué librería de validación debemos usar?

## Decision Drivers

- Integración nativa con AdonisJS 7 y con los modelos Lucid.
- Minimizar dependencias adicionales y boilerplate.
- Curva de aprendizaje: el equipo ya conoce la sintaxis de VineJS por la guía oficial de AdonisJS v6.
- Coherencia con la convención del proyecto: validación con validators de VineJS en `app/validators/`.

## Considered Options

- VineJS
- Zod

## Decision Outcome

Chosen option: "VineJS", porque AdonisJS 7 lo incluye de forma nativa y se integra directamente con los modelos Lucid, no añade dependencias y el equipo ya conoce su sintaxis.

### Positive Consequences

- Sin dependencias adicionales: VineJS ya forma parte del framework.
- Menos boilerplate para integrar la validación con los tipos de AdonisJS.
- Menor curva de aprendizaje; el equipo reutiliza lo aprendido con la guía oficial de AdonisJS v6.
- Los validators viven en un único sitio (`app/validators/`), alineado con `CLAUDE.md`.

### Negative Consequences

- Menor portabilidad: los esquemas de validación quedan acoplados al ecosistema AdonisJS.
- No se pueden compartir esquemas con el frontend (React) tal cual, como sí permitiría Zod. Si surge esa necesidad habrá que revisar esta decisión.
- Ecosistema y comunidad más reducidos que los de Zod.

## Pros and Cons of the Options

### VineJS

- Good, because viene incluido de forma nativa en AdonisJS 7.
- Good, because se integra directamente con los modelos Lucid.
- Good, because no introduce una dependencia adicional.
- Good, because el equipo ya conoce su sintaxis.
- Bad, because está acoplado al ecosistema AdonisJS.
- Bad, because tiene un ecosistema más pequeño que Zod.

### Zod

- Good, because funcionaría correctamente para validar el input.
- Good, because es agnóstico del framework y ampliamente adoptado.
- Bad, because introduce una dependencia adicional.
- Bad, because la integración manual con los tipos de AdonisJS requiere más boilerplate.
- Bad, because el equipo no tiene experiencia previa con ella en este contexto.

## Links

- Relates to [Use Markdown Architectural Decision Records](20261108-use-markdown-architectural-decision-records.md)
- [VineJS](https://vinejs.dev/)
- [Validación en AdonisJS](https://docs.adonisjs.com/)
