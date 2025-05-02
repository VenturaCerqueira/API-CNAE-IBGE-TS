import { Router } from 'express';
import { getCnaeClasseSubclasse } from '../controllers/cnaeController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: CNAE
 *     description: Operações relacionadas à Classificação Nacional de Atividades Econômicas
 */

/**
 * @swagger
 * /api/cnae-classe-subclasse:
 *   get:
 *     summary: Retorna todos os CNAEs com classe e subclasse
 *     tags: [CNAE]
 *     description: Busca todos os CNAEs com o código concatenado de classe e subclasse.
 *     responses:
 *       200:
 *         description: Lista de CNAEs retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Codigo:
 *                     type: string
 *                     description: Código completo do CNAE (classe + subclasse).
 *                     example: "9609207"
 *                   Descricao:
 *                     type: string
 *                     description: Descrição da subclasse ou classe.
 *                     example: "CULTIVO DE CEREAIS"
 *                   Percentual:
 *                     type: number
 *                     description: Percentual fixo.
 *                     example: 0.0
 */
router.get('/cnae-classe-subclasse', getCnaeClasseSubclasse);

export default router;
