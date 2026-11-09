Contexto:
Formato exacto: Como [rol], quiero [acción], para [beneficio].
Alcance acotado: Solo funcionalidades del MVP
AC en Given/When/Then
Deja el contexto técnico de cada historia para el final.

Recomendaciones para el prompt:
- Rol para la IA
- Restricciones explícitas
- Ejemplo del formato de output esperado
- Una instrucción de marca como (asumido) lo que infieras y no esté literal en el PRD.

Prompt entregable:

As a senior Product Owner expert in SaaS solutions, take the Product Requirements Document (PRD) for the solution called FlowSync, analyze it and decompose in sprint-ready user stories so they can be picked up by a human or agent.

- User Stories should follow best practice, such as: As a [role], I want to [action], so that [profit].
- The scope for the project should focus on what is described as part of the MVP, you should leave the rest out of scope in this first version.
- Acceptance Criteria should be added for each story following the Given/When/Then methodology.
- Try to leave the technical context at the end of the user story description.
- For anything that you infer and is not literally reflected in the PRD, please add a tag "Inferred".
- Do NOT add estimations, do NOT invent new features, do NOT propose architecture.
