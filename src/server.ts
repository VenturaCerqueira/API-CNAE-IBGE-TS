import express, { Application } from 'express';
import cnaeRoutes from './routes/cnaeRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';

const app: Application = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api', cnaeRoutes);

// Inicialização do servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação disponível em: http://localhost:${port}/api-docs`);
});

export default app;
