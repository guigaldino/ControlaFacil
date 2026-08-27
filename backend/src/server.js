const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const swaggerDocs = require('../docs/swagger');

const PORT = process.env.PORT || 5000;

swaggerDocs(app);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
