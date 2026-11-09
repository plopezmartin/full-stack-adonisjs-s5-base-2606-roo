# Entregables · Sesión 4

Esta carpeta es donde subes tu entrega del **Ejercicio pre-sesión de la S4**. Trabaja en tu rama personal `alumno/<nombre-apellido>` y crea aquí los cuatro archivos siguientes.

> 📌 **No hace falta perfección.** Lo importante es el proceso, no la pulcritud. Entrega el output **crudo** de la IA, incluyendo sus errores — eso es justo lo que analizaremos en el directo.

## Estructura esperada

```
entregables/sesion-04/
├── prompt.md         # Tu prompt completo de descomposición (Parte 1)
├── output.md         # El output crudo de la IA, sin retocar (Parte 2)
├── poke-holes.md     # Los 3-5 hallazgos del patrón "AI as poke-holes" (Parte 3)
└── reflexion.md      # 4-6 líneas de reflexión honesta (Parte 4)
```

## Qué va en cada archivo

| Archivo | Contenido | Criterio de completitud |
| --- | --- | --- |
| `prompt.md` | El prompt completo que diseñaste para extraer user stories del PRD. | Cubre los **5 requisitos** de la Parte 1 (contexto, formato exacto, alcance acotado, AC en Given/When/Then, agrupación). |
| `output.md` | El output **crudo** de la IA, exactamente como lo devolvió. Sin pulir. | **8-12 user stories** agrupadas, con AC en Given/When/Then. |
| `poke-holes.md` | Los hallazgos al pedirle a la IA que critique una de sus propias stories. | **3-5 hallazgos no triviales** (gaps, supuestos implícitos, edge cases reales). |
| `reflexion.md` | Tu reflexión honesta sobre el ejercicio. | **4-6 líneas**: qué te sorprendió, qué falló, si poke-holes encontró algo que no viste. |

## Antes de empezar

- Lee el [enunciado completo del ejercicio](../../README.md).
- Ten a mano el [PRD de FlowSync](../../docs/PRD.md) — es tu insumo de entrada.

## Cómo entregar

```bash
git checkout -b alumno/nombre-apellido
git add entregables/sesion-04/
git commit -m "S4: backlog inicial FlowSync + poke-holes"
git push origin alumno/nombre-apellido
```

Luego abre un Pull Request hacia el repositorio original. Esa es tu entrega final.
