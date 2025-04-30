import { Router } from 'express';
import { getCnaeData } from '../controllers/cnaeController'; // Importa a função do controller

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CNAE
 *   description: Operações relacionadas à Classificação Nacional de Atividades Econômicas
 */

/**
 * @swagger
 * /api/cnae-data:
 *   get:
 *     summary: Retorna lista de dados CNAE processados
 *     tags: [CNAE]
 *     description: Busca dados das classes CNAE da API do IBGE e retorna uma lista formatada com Código, Descrição e Percentual (fixo em 0.00).
 *     responses:
 *       200:
 *         description: Lista de dados CNAE retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Codigo:
 *                     type: string
 *                     description: Identificador da classe CNAE.
 *                     example: "01113"
 *                   Descricao:
 *                     type: string
 *                     description: Descrição da classe CNAE.
 *                     example: "Cultivo de cereais"
 *                   Percentual:
 *                     type: number
 *                     format: float
 *                     description: Valor percentual fixo.
 *                     example: 0.00
 *       500:
 *         description: Erro interno no servidor ao buscar ou processar os dados.
 */
router.get('/cnae-data', getCnaeData);

export default router;