# ControlaFacil

Monorepo do projeto Controla Fácil — sistema de controle de estoque, pedidos e integrações
(Mercado Livre) para pequenos negócios.

Este repositório reúne o que antes eram dois repositórios separados:

- [`backend/`](./backend) — API (Node.js + Express + SQL Server)
- [`frontend/`](./frontend) — Aplicação web (React + Vite)

O histórico de commits de ambos os projetos originais foi preservado dentro de suas
respectivas pastas.

## Pré-requisitos

- Node.js 18+
- SQL Server acessível (local ou remoto)

## Como rodar o backend

```bash
cd backend
npm install
cp .env.example .env   # preencha com suas credenciais (veja abaixo)
npm run dev             # http://localhost:5000
```

Variáveis obrigatórias em `backend/.env`: conexão com o banco (`DB_*`), `JWT_SECRET`.
Variáveis opcionais (funcionalidades específicas deixam de funcionar sem elas, mas o
servidor sobe normalmente): `EMAIL_*` (envio de e-mails), `ML_*` (integração Mercado Livre).

## Como rodar o frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste VITE_API_BASE_URL se o backend não estiver em localhost:5000
npm run dev             # http://localhost:5173
```

## Estrutura

```
ControlaFacil/
├── backend/     # API Express — ver backend/README.md
└── frontend/    # SPA React/Vite — ver frontend/README.md
```

Cada pasta mantém seu próprio `package.json`, `.gitignore` e `.env`/`.env.example` —
os dois projetos rodam de forma independente, apenas compartilhando este repositório.
