# CLAUDE.md — Nexus Project

Regras permanentes para agentes de IA neste repositório. Leia antes de qualquer tarefa.

---

## Stack

- Next.js 16 com App Router
- TypeScript estrito (`strict: true`)
- Tailwind CSS
- Alias de importação: `@/` aponta para a raiz do projeto

---

## Arquitetura de camadas

O projeto separa três responsabilidades. Nunca misture.

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Domínio | `lib/entities/` | Tipos que representam o dado real, como vem da fonte |
| Dados | `lib/mock/` | Registros brutos no formato dos tipos de domínio |
| Apresentação | `components/dashboard/views/` | Renderização, derivada dos dados |

### Regra central

A view **nunca declara dado**. Ela importa do mock, passa pelas funções de derivação e renderiza o resultado.


