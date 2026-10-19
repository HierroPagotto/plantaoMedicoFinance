# MedSinc — Interface

Interface web do **MedSinc** (React + TypeScript + Vite): agenda de plantões, marketplace, finanças, pacientes e atendimentos.

API (backend): [MedSincBackend](https://github.com/HierroPagotto/MedSincBackend)

## Pré-requisitos

- Node.js 20 ou superior
- npm
- API MedSinc rodando localmente (ou URL de API acessível)

## Configuração

```bash
git clone https://github.com/HierroPagotto/plantaoMedicoFinance.git
cd plantaoMedicoFinance

npm install
```

Copie o exemplo de variáveis:

```bash
cp .env.example .env
```

Conteúdo esperado do `.env` para desenvolvimento local:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

Sem `VITE_API_BASE_URL`, a aplicação usa a API de produção (`https://api.medsinc.com.br/api`). Para trabalhar local, o `.env` é obrigatório.

## Rodar local

Com a API em [http://127.0.0.1:5000](http://127.0.0.1:5000):

```bash
npm run dev
```

O Vite sobe em [http://localhost:8080](http://localhost:8080). Essa porta é a liberada no CORS do backend.

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 8080) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## Ordem sugerida

1. MySQL + backend (`python run.py` no repositório da API)  
2. Este projeto com `VITE_API_BASE_URL=http://127.0.0.1:5000/api`  
3. Abrir [http://localhost:8080](http://localhost:8080)

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router, Axios, React Hook Form + Zod
- Recharts

## Estrutura

```
src/
  pages/         # Telas (Dashboard, Plantões, Marketplace, Gastos, etc.)
  components/    # UI e módulos (shifts, patients, expenses, layout)
  lib/           # Cliente HTTP (api.ts), utilitários
  types/         # Tipos TypeScript
```
