import { Request, Response } from 'express';
import axios from 'axios';

interface CnaeTratado {
  Codigo: string;
  Descricao: string;
  Percentual: number;
}

export const getCnaeClasseSubclasse = async (req: Request, res: Response): Promise<void> => {
  const ibgeApiUrl = 'https://servicodados.ibge.gov.br/api/v2/cnae/classes';

  try {
    console.log(`Buscando dados de classes em: ${ibgeApiUrl}`);
    const classesResponse = await axios.get(ibgeApiUrl);

    if (Array.isArray(classesResponse.data)) {
      const processedData: CnaeTratado[] = [];

      for (const classe of classesResponse.data) {
        const { id: classeId } = classe;

        const subclassesUrl = `https://servicodados.ibge.gov.br/api/v2/cnae/classes/${classeId}/subclasses`;
        console.log(`Buscando subclasses da classe ${classeId} em: ${subclassesUrl}`);

        try {
          const subclassesResponse = await axios.get(subclassesUrl);

          if (Array.isArray(subclassesResponse.data) && subclassesResponse.data.length > 0) {
            for (const subclasse of subclassesResponse.data) {
              const codigo = `${subclasse.id}`;
              const descricao = subclasse.descricao;

              
              if (!processedData.some(item => item.Codigo === codigo && item.Descricao === descricao)) {
                processedData.push({
                  Codigo: codigo,
                  Descricao: descricao,
                  Percentual: 0.0,
                });
              }
            }
          } else {
            const codigo = `${classeId}00`;
            const descricao = classe.descricao;

            
            if (!processedData.some(item => item.Codigo === codigo && item.Descricao === descricao)) {
              processedData.push({
                Codigo: codigo,
                Descricao: descricao,
                Percentual: 0.0,
              });
            }
          }
        } catch (subclasseError: any) {
          console.error(`Erro ao buscar subclasses da classe ${classeId}:`, subclasseError.message);
          const codigo = `${classeId}00`;
          const descricao = classe.descricao;

          // Verifica se o registro já existe no array
          if (!processedData.some(item => item.Codigo === codigo && item.Descricao === descricao)) {
            processedData.push({
              Codigo: codigo,
              Descricao: descricao,
              Percentual: 0.0,
            });
          }
        }
      }

      console.log(`Dados processados: ${processedData.length} itens.`);
      res.status(200).json(processedData);
    } else {
      console.error('Formato inesperado da resposta do IBGE:', classesResponse.data);
      res.status(500).send('Formato inesperado da resposta do IBGE');
    }
  } catch (error: any) {
    console.error('Erro ao buscar ou processar dados do IBGE:', error.message);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes Axios:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    res.status(500).send('Erro interno ao processar a requisição');
  }
};
