const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configurações do Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Controla Fácil - API',
            version: '1.0.0',
            description: 'Documentação da API do sistema Controla Fácil',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js', './src/features/**/*Routes.js'], // Caminho onde estão as rotas com os comentários Swagger
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Documentação Swagger disponível em http://localhost:5000/api-docs`);
}

module.exports = swaggerDocs;