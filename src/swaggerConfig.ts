import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CNAE Processada',
      version: '1.0.0',
      description: 'API para buscar e formatar dados CNAE do IBGE, documentada com Swagger.',
      contact: {
        name: 'Keep Informática - Desenvolvimento',
        email: 'contato@keepinformatica.com.br',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
