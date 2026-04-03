# Grão & Byte — Backend

API REST desenvolvida para o sistema interno de gestão da cafeteria **Grão & Byte**, responsável por autenticação de funcionários, controle de cardápio e gerenciamento de usuários. Projeto desenvolvido como parte do case da segunda fase do Hackathon Insper Jr.

## Tecnologias

- Node.js + Express 5
- MongoDB + Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- CORS

## Funcionalidades

- Autenticação de funcionários via JWT (registro e login)
- Sistema de papéis (admin e funcionário) com controle de acesso por rota
- CRUD completo de produtos (criar, listar, buscar, editar e remover)
- Proteção das rotas de escrita — apenas usuários autenticados podem criar, editar e deletar produtos
- Registro de novos funcionários restrito a administradores
- Listagem e remoção de usuários (exclusivo para administradores)
- Filtros de busca por categoria e disponibilidade

## Estrutura de pastas

```
src/
├── config/
│   └── db.js                 # Conexão com MongoDB
├── controllers/
│   ├── authController.js     # Lógica de registro e login
│   ├── productController.js  # Lógica do CRUD de produtos
│   └── userController.js     # Lógica de listagem e remoção de usuários
├── middlewares/
│   └── authMiddleware.js     # Verificação do token JWT e permissão de admin
├── models/
│   ├── User.js               # Model de usuário
│   └── Product.js            # Model de produto
├── routes/
│   ├── authRoutes.js         # Rotas de autenticação
│   ├── productRoutes.js      # Rotas de produtos
│   └── userRoutes.js         # Rotas de gerenciamento de usuários
├── app.js                    # Configuração do Express
└── server.js                 # Inicialização do servidor
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

---

## Arquitetura da aplicação

O projeto segue o padrão **MVC adaptado** (Model-View-Controller), separando responsabilidades em camadas bem definidas. Por ser uma API, não há camada de View — o "retorno" é sempre um JSON.

### Como funciona uma API REST

Uma API REST é uma interface que permite que diferentes sistemas se comuniquem via HTTP. O frontend faz uma requisição (com método, URL e, se necessário, um corpo JSON), o backend processa e devolve uma resposta em JSON com um código de status (200, 201, 404, etc.).

### Conexão com o banco de dados

Na inicialização do servidor (`server.js`), a função `connectDB()` é chamada antes de qualquer outra coisa. Ela usa a variável `MONGO_URI` do `.env` para conectar ao cluster MongoDB Atlas via Mongoose. Se a conexão falhar, o processo encerra imediatamente.

### Fluxo de uma requisição

```
Cliente (frontend)
    │
    ▼
Rota (routes/)          → define o caminho e o método HTTP
    │
    ▼
Middleware (opcional)   → verifica autenticação e permissão antes de continuar
    │
    ▼
Controller (controllers/) → executa a lógica: valida dados, chama o model
    │
    ▼
Model (models/)         → interage com o MongoDB via Mongoose
    │
    ▼
Banco de dados (MongoDB Atlas)
    │
    ▼
Resposta JSON para o cliente
```

### Papel de cada camada

| Camada | Responsabilidade |
|--------|-----------------|
| **Routes** | Mapeiam URLs para controllers, definem quais middlewares aplicar |
| **Middlewares** | Código intermediário que roda antes do controller (ex: verificar JWT) |
| **Controllers** | Contêm a lógica de negócio: validam entrada, chamam o model, retornam JSON |
| **Models** | Definem a estrutura dos dados e interagem diretamente com o banco |

---

## Autenticação e autorização

### Login e geração de token

Quando um funcionário faz login (`POST /api/auth/login`), o backend:
1. Busca o usuário no banco pelo e-mail
2. Compara a senha enviada com o hash armazenado (usando **bcrypt**)
3. Se válido, gera um **JWT** assinado com a chave secreta (`JWT_SECRET`), com validade de 7 dias
4. Retorna o token e os dados do usuário (incluindo o `role`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "_id": "...",
    "name": "Lucas Ferreira",
    "email": "admin@graobyte.com",
    "role": "admin"
  }
}
```

### Proteção de senha com bcrypt

As senhas **nunca são armazenadas em texto puro**. Ao registrar um usuário, a senha é transformada em um hash irreversível com `bcrypt.hash(password, 10)`. O número `10` indica o "custo" do algoritmo — quanto maior, mais difícil é para um atacante tentar forçar a senha por tentativa e erro. Na comparação, `bcrypt.compare()` verifica se a senha enviada corresponde ao hash salvo.

### Validação do token (middleware `protect`)

Em cada rota protegida, o middleware `protect` é executado antes do controller:
1. Extrai o token do header `Authorization: Bearer <token>`
2. Verifica e decodifica o token com `jwt.verify()`
3. Busca o usuário no banco pelo ID contido no token
4. Anexa o usuário ao objeto `req.user` para uso no controller
5. Chama `next()` — permitindo que a requisição continue

Se o token estiver ausente, expirado ou inválido, a requisição é bloqueada com **401 Unauthorized**.

### Autenticação vs. Autorização

| Conceito | Significado | Exemplo neste projeto |
|----------|------------|----------------------|
| **Autenticação** | Confirmar *quem você é* | Ter um token JWT válido |
| **Autorização** | Confirmar *o que você pode fazer* | Ter `role: "admin"` para registrar novos funcionários |

O middleware `isAdmin` é aplicado após o `protect` e verifica se `req.user.role === "admin"`. Caso contrário, retorna **403 Forbidden** — o usuário está autenticado, mas não tem permissão.

---

## Operações CRUD

CRUD é o conjunto de quatro operações fundamentais de persistência de dados:

| Operação | Significado | Método HTTP | Rota |
|----------|------------|-------------|------|
| **C**reate | Criar | POST | `/api/products` |
| **R**ead | Ler | GET | `/api/products` e `/api/products/:id` |
| **U**pdate | Atualizar | PUT | `/api/products/:id` |
| **D**elete | Remover | DELETE | `/api/products/:id` |

### Fluxo de cada operação

**Create (POST /api/products)**
O frontend envia um JSON com os dados do produto. O controller valida os campos obrigatórios, chama `Product.create()` e o Mongoose insere o documento no MongoDB. Retorna o produto criado com status **201 Created**.

**Read (GET /api/products)**
O controller chama `Product.find()` com filtros opcionais (categoria via regex, disponibilidade). Retorna um array de produtos com status **200 OK**. A busca por ID usa `Product.findById()` e retorna **404** se não encontrar.

**Update (PUT /api/products/:id)**
O frontend envia apenas os campos que deseja atualizar. O controller chama `Product.findByIdAndUpdate()` com `{ new: true, runValidators: true }` — o `new: true` retorna o documento já atualizado, e o `runValidators` garante que as regras do schema sejam aplicadas. Retorna **404** se o produto não existir.

**Delete (DELETE /api/products/:id)**
O controller chama `Product.findByIdAndDelete()`. Retorna **404** se o produto não existir, ou **200** com mensagem de confirmação.

---

## Modelagem de dados

Os dados são organizados em duas **coleções** no MongoDB: `users` e `products`. Cada coleção é definida por um **schema Mongoose**, que especifica os campos, tipos e validações.

### Model: User

```
name     → String, obrigatório
email    → String, obrigatório, único, lowercase
password → String, obrigatório (armazenado como hash bcrypt)
role     → String, enum: ["admin", "employee"], padrão: "employee"
```

O campo `role` é central para o sistema de permissões: determina se o usuário pode ou não registrar funcionários e gerenciar a lista de usuários.

### Model: Product

```
name        → String, obrigatório
description → String, obrigatório
price       → Number, obrigatório, mínimo: 0
category    → String, obrigatório
available   → Boolean, padrão: true
```

O campo `available` permite que um produto seja marcado como indisponível (ex: sazonalidade) sem precisar ser removido do banco. O campo `category` suporta buscas por regex, tornando a filtragem flexível.

### Timestamps automáticos

Ambos os schemas usam `{ timestamps: true }`, o que faz o Mongoose adicionar automaticamente os campos `createdAt` e `updatedAt` em cada documento — útil para ordenação e auditoria.

---

## Segurança

### Hash de senhas com bcrypt

Senhas nunca são armazenadas em texto puro. O bcrypt aplica um algoritmo de hash com "salt" (ruído aleatório), tornando impossível que duas senhas iguais gerem o mesmo hash. Isso protege os dados dos usuários mesmo em caso de vazamento do banco.

### JSON Web Token (JWT)

O JWT é uma string codificada em Base64 que carrega informações (como o ID do usuário) e é assinada com uma chave secreta. O backend consegue verificar a autenticidade do token sem precisar consultá-lo no banco a cada requisição — o que torna o sistema mais eficiente e stateless.

### Proteção de rotas

Rotas sensíveis (criar, editar, deletar produtos; registrar e remover funcionários) exigem um token válido no header da requisição. Rotas de leitura pública (listar produtos) ficam abertas, pois podem ser consumidas pelo cardápio do frontend sem login.

### Variáveis de ambiente

Informações sensíveis como a string de conexão do banco (`MONGO_URI`), a porta do servidor (`PORT`) e a chave de assinatura dos tokens (`JWT_SECRET`) são armazenadas em um arquivo `.env` que **não é versionado** (consta no `.gitignore`). Isso impede que credenciais sejam expostas no repositório.

---

## Integração com o frontend

O frontend React consome esta API via requisições HTTP usando `fetch` ou `axios`.

### Comunicação via JSON

Todas as requisições e respostas usam o formato **JSON**. O backend está configurado com `express.json()` para parsear automaticamente o corpo das requisições, e responde sempre com `res.json()`.

### Envio do token no header

Após o login, o frontend armazena o token JWT (geralmente no `localStorage` ou em um contexto React) e o inclui no header de todas as requisições a rotas protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### CORS

O middleware `cors()` está habilitado para permitir que o frontend — rodando em uma origem diferente (ex: `http://localhost:3000`) — consiga fazer requisições para o backend sem ser bloqueado pelo navegador.

### Fluxo típico de uso

```
1. Frontend faz POST /api/auth/login com { email, password }
2. Backend retorna { token, user: { role, ... } }
3. Frontend salva o token e o role do usuário
4. Para criar um produto: POST /api/products com Authorization: Bearer <token>
5. Backend valida o token, executa e retorna o produto criado
```

---

## Demonstração

Foi gravado um vídeo demonstrativo mostrando o sistema em funcionamento, incluindo:

- Login de administrador e obtenção do token JWT
- Registro de novo funcionário via painel de administrador
- Operações de CRUD de produtos (criação, listagem, edição e remoção)
- Comportamento das rotas protegidas ao tentar acessar sem autenticação
- Listagem e remoção de usuários pelo administrador

---

## Rotas da API

### Autenticação

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/api/auth/login` | Realiza login e retorna token JWT | Nenhuma |
| POST | `/api/auth/register` | Registra um novo funcionário | Admin |

### Produtos

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/products` | Lista todos os produtos | Nenhuma |
| GET | `/api/products/:id` | Busca produto por ID | Nenhuma |
| POST | `/api/products` | Cria um novo produto | Sim |
| PUT | `/api/products/:id` | Atualiza um produto | Sim |
| DELETE | `/api/products/:id` | Remove um produto | Sim |

### Usuários

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/users` | Lista todos os usuários | Admin |
| DELETE | `/api/users/:id` | Remove um usuário | Admin |

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

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (nodemon) |
| `npm start` | Inicia o servidor em modo produção |
