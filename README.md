# WiCap Backend API

API backend do WiCap - Sistema de Gerenciamento de Condomínios, desenvolvida com **Fastify** e **TypeScript**.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js v18+
- **Framework**: Fastify 5.x
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Validação**: Zod
- **Autenticação**: JWT
- **Hash**: bcryptjs

## 📋 Estrutura do Projeto

```
src/
├── config/              # Configurações (database, environment)
├── controllers/         # Camada HTTP (handlers)
├── services/            # Lógica de negócio
├── repositories/        # Acesso a dados
├── schemas/             # Validação com Zod
├── middlewares/         # Autenticação e validação
├── types/               # Tipos TypeScript
├── utils/               # Funções utilitárias
├── routes/              # Definição de rotas
├── app.ts               # Configuração do Fastify
└── server.ts            # Entrada da aplicação

prisma/
├── schema.prisma        # Schema do banco de dados
└── migrations/          # Histórico de migrações
```

## ⚡ Quick Start

### 1. Instalação de dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` e crie um `.env`:

```bash
cp .env.example .env
```

Configure o `DATABASE_URL` com sua conexão PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wicap"
JWT_SECRET="your-secret-key"
```

### 3. Executar migrações do Prisma

```bash
npx prisma migrate dev
```

### 4. Iniciar o servidor em desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 🔧 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor em desenvolvimento com hot-reload
npm run build     # Compila TypeScript para JavaScript
npm start         # Inicia servidor em produção
npm run lint      # Executa linter (ESLint)
npm run format    # Formata código (Prettier)
```

## 🔐 Autenticação

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "User Name",
      "role": "MANAGER"
    },
    "token": "eyJhbGc..."
  }
}
```

### Usar Token

Adicione o token no header de autorização:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

## 📚 Endpoints Principais

### Auth

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Info do usuário autenticado

### Admin (SUPER_ADMIN only)

- `GET /admin/stats` - Estatísticas gerais
- `GET /admin/managers` - Lista de gerenciadores
- `POST /admin/managers` - Criar novo gerenciador
- `GET /admin/residents` - Lista de moradores
- `GET /admin/condominiums` - Lista de condomínios
- `GET /admin/encargos` - Relatório de encargos
- `GET /admin/reports` - Relatórios

### Condomínios

- `GET /condominiums` - Listar condomínios
- `POST /condominiums` - Criar condomínio

### Apartamentos

- `GET /apartments` - Listar apartamentos
- `POST /apartments` - Criar apartamento

### Moradores

- `GET /residents` - Listar moradores

### Faturas

- `GET /invoices` - Listar faturas
- `GET /invoices/:id` - Detalhe da fatura
- `PATCH /invoices/:id` - Atualizar status
- `POST /invoices/import` - Importar faturas

### Dashboard

- `GET /dashboard/manager` - Dashboard do gerenciador
- `GET /dashboard/resident` - Dashboard do morador

## 🗄️ Banco de Dados

### Migrações

Criar nova migração:

```bash
npx prisma migrate dev --name nome_da_migracao
```

Visualizar Prisma Studio:

```bash
npx prisma studio
```

## 🧪 Testes

Para adicionar testes, instale:

```bash
npm install --save-dev vitest @vitest/ui
```

## 📝 Estrutura de Resposta

Todas as respostas seguem este padrão:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Mensagem opcional"
}
```

## 🚨 Tratamento de Erros

Os erros seguem este padrão:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "statusCode": 400
}
```

## 📦 Build para Produção

```bash
npm run build
npm start
```

Ou usar Docker:

```bash
docker build -t wicap-backend .
docker run -p 3000:3000 wicap-backend
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença ISC.

## 👨‍💻 Autor

Desenvolvido por **Matheus Honorio**

Para mais informações, visite: https://github.com/mthonorio/wicap-backend
