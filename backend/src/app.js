const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { uploadFolder } = require('./middlewares/upload');

const app = express();

// Permite que o backend aceite requisições de qualquer domínio
app.use(cors());

// Permite que o backend receba JSON no corpo da requisição
app.use(express.json());

// Servir imagens enviadas de forma estática
app.use('/api/uploads', express.static(uploadFolder));

app.get('/', (req, res) => {
    res.send('API está rodando! 🚀');
});

// Define o prefixo das rotas
app.use('/api', routes);

module.exports = app;
