# Configuração de Backend com Node.js e SQL Server

---

## Estrutura de Pastas
backend
├── src
│ ├── config
│ │ └── db.js
│ ├── controllers
│ ├── models
│ ├── routes
│ ├── app.js
│ ├── server.js
│ └── testDb.js (opcional)
├── .env
├── .gitignore
├── package.json
└── package-lock.json

---

## 1. Criar Projeto Node.js

No terminal, dentro da pasta `/backend`, execute:

```bash
npm init -y
```

Isso criará o arquivo package.json.

--- 

## 2. Instalar Dependências
Instale as dependências principais:

```Bash
npm install express mssql dotenv cors
```
Instale a dependência de desenvolvimento (para reiniciar automaticamente o servidor):

```Bash
npm install nodemon --save-dev
```

--- 

## 3. Configurar Scripts no package.json
Adicione os seguintes scripts ao seu package.json:

```JSON

"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```
``` BASH
npm run dev: Executa o servidor com nodemon (para desenvolvimento).
npm start: Executa o servidor normalmente (para produção/local).
```

--- 

## 4. Criar Arquivo .env
Crie um arquivo .env na raiz do projeto com as seguintes configurações:

Snippet de código

PORT=5000

DB_SERVER=seu-endpoint-do-rds.amazonaws.com
DB_PORT=1433
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_DATABASE=nome-do-seu-banco
DB_ENCRYPT=true
Importante: DB_ENCRYPT deve ser true ao usar banco de dados na AWS.

---

## 5. Configurar Conexão com SQL Server

Crie o arquivo `src/config/db.js`:

```javascript
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_ENCRYPT !== 'true'
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('Erro na conexão com o banco de dados:', err);
});

module.exports = { sql, pool, poolConnect };
```

---

## 6. Testar Conexão (Opcional)

Crie o arquivo `src/testDb.js`:

```javascript
const { poolConnect, pool } = require('./config/db');

async function testarConexao() {
    try {
        await poolConnect;
        const result = await pool.request().query('SELECT GETDATE() AS dataAtual');
        console.log('Conexão bem-sucedida! Data atual:', result.recordset[0].dataAtual);
    } catch (err) {
        console.error('Erro na conexão:', err);
    }
}

testarConexao();
```

Para executar o teste, use o comando:

```bash
node src/testDb.js
```

---

## 7. Criar Servidor Express

Crie o arquivo `src/app.js`:

```javascript
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

module.exports = app;
```

---

## 8. Arquivo para Rodar o Servidor

Crie o arquivo `src/server.js`:

```javascript
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
```

---

## 9. Criar Arquivo de Rotas

Crie o arquivo `src/routes/index.js`:

```javascript
const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/ping', (req, res) => {
    res.json({ message: 'Servidor funcionando ✅' });
});

module.exports = router;
```

---

## 10. Criar Pasta Models

Crie a pasta `src/models` e um exemplo de model:

Crie o arquivo `src/models/Cliente.js`:

```javascript
class Cliente {
    constructor(id, nome, email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
    }
}

module.exports = Cliente;
```

---

## 11. Criar Controllers

Crie o arquivo `src/controllers/clienteController.js`:

```javascript
const { poolConnect, pool } = require('../config/db');

const clienteController = {
    listarClientes: async (req, res) => {
        try {
            await poolConnect;
            const result = await pool.request().query('SELECT * FROM Clientes');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao listar clientes', detalhes: err.message });
        }
    }
};

module.exports = clienteController;
```

---

## 12. Adicionar Rotas Específicas

Crie o arquivo `src/routes/clienteRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/clientes', clienteController.listarClientes);

module.exports = router;
```

Atualize `src/routes/index.js` para importar as rotas de clientes:

```javascript
const express = require('express');
const router = express.Router();

const clienteRoutes = require('./clienteRoutes');

router.use('/', clienteRoutes);

router.get('/ping', (req, res) => {
    res.json({ message: 'Servidor funcionando ✅' });
});

module.exports = router;
```

---

## 13. .gitignore

Crie um arquivo `.gitignore` na raiz do backend com o seguinte conteúdo:

```
node_modules/
.env
```

Isso evita que arquivos sensíveis (como `.env`) e dependências sejam versionados no Git.

---

## 14. Rodar o Projeto

No terminal, dentro da pasta `/backend`:

```bash
npm run dev
```

Se preferir rodar sem nodemon:

```bash
npm start
```

Teste no navegador ou Postman:

```
http://localhost:5000/api/ping
```

Resposta esperada:

```json
{
  "message": "Servidor funcionando ✅"
}
```

Para listar clientes (exemplo):

```
http://localhost:5000/api/clientes
```