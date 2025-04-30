import express from 'express';
import cnaeRoutes from './routes/cnaeRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';   

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bem-vindo à API CNAE!');
});

// Rota documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api', cnaeRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`); 
});

export default app;