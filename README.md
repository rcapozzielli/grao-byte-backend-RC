# Grão & Byte — Backend

API REST desenvolvida para o sistema interno de gestão de produtos da cafeteria **Grão & Byte**, como parte do case da segunda fase do Hackaton Insper Jr.

## Tecnologias

- Node.js + Express 5
- MongoDB + Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- CORS

## Funcionalidades

- Autenticação de funcionários via JWT (registro e login)
- CRUD completo de produtos (criar, listar, buscar, editar e remover)
- Proteção das rotas de escrita — apenas usuários autenticados podem criar, editar e deletar produtos
- Filtros de busca por categoria e disponibilidade

## Estrutura de pastas

```
src/
├── config/
│   └── db.js               # Conexão com MongoDB
├── controllers/
│   ├── authController.js   # Lógica de registro e login
│   └── productController.js# Lógica do CRUD de produtos
├── middlewares/
│   └── authMiddleware.js   # Verificação do token JWT
├── models/
│   ├── User.js             # Model de usuário
│   └── Product.js          # Model de produto
├── routes/
│   ├── authRoutes.js       # Rotas de autenticação
│   └── productRoutes.js    # Rotas de produtos
├── app.js                  # Configuração do Express
└── server.js               # Inicialização do servidor
```

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/rcapozzielli/grao-byte-backend-RC.git
cd grao-byte-backend-RC
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
MONGO_URI=sua_string_de_conexao_mongodb
PORT=5000
JWT_SECRET=sua_chave_secreta
```

### 4. Inicie o servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`.

## Rotas da API

### Autenticação

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/api/auth/register` | Registra um novo funcionário | Não |
| POST | `/api/auth/login` | Realiza login e retorna token JWT | Não |

### Produtos

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/products` | Lista todos os produtos | Não |
| GET | `/api/products/:id` | Busca produto por ID | Não |
| POST | `/api/products` | Cria um novo produto | Sim |
| PUT | `/api/products/:id` | Atualiza um produto | Sim |
| DELETE | `/api/products/:id` | Remove um produto | Sim |

### Filtros disponíveis no GET /api/products

```
GET /api/products?category=cafe
GET /api/products?available=true
GET /api/products?category=cafe&available=true
```

### Exemplo de corpo para criar produto (POST)

```json
{
  "name": "Espresso",
  "description": "Café curto e encorpado",
  "price": 8.50,
  "category": "cafe",
  "available": true
}
```

### Exemplo de uso do token

Após o login, inclua o token no header das requisições protegidas:

```
Authorization: Bearer seu_token_aqui
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (nodemon) |
| `npm start` | Inicia o servidor em modo produção |
