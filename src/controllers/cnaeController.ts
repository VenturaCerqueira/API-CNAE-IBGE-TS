import { Request, Response } from 'express';
import axios from 'axios';


interface CnaeTratado {
  Codigo: string;
  Descricao: string;
  Percentual: number;
}

// Função para buscar e processar os dados do IBGE
export const getCnaeData = async (req: Request, res: Response): Promise<void> => {
  const ibgeApiUrl = 'https://servicodados.ibge.gov.br/api/v2/cnae/classes'; 

  try {
    console.log(`Buscando dados de: ${ibgeApiUrl}`);
    const ibgeResponse = await axios.get(ibgeApiUrl);

    if (Array.isArray(ibgeResponse.data)) {
      const processedData: CnaeTratado[] = ibgeResponse.data.map((item: any) => ({
        Codigo: item.id,
        Descricao: item.descricao,
        Percentual: 0.00 // Valor fixo 
      }));
      console.log(`Dados processados: ${processedData.length} itens.`);
      res.status(200).json(processedData);
    } else {
      console.error('Formato inesperado da resposta do IBGE:', ibgeResponse.data);
      res.status(500).send('Formato inesperado da resposta do IBGE');
    }
  } catch (error: any) {
    console.error('Erro ao buscar ou processar dados do IBGE:', error.message);
     if (axios.isAxiosError(error)) {
        console.error('Detalhes Axios:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
     }
    res.status(500).send('Erro interno ao processar a requisição');
  }
};