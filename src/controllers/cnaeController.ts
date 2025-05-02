import { Request, Response } from 'express';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { setTimeout } from 'timers/promises';

interface CnaeTratado {
    Codigo: string;
    Descricao: string;
    Percentual: number;
}

// --- Cache Simples em Memória ---
interface CacheData {
    data: CnaeTratado[];
    timestamp: number;
}
let cache: CacheData | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora
// -------------------------------

// --- Configurações de Batch e Retry ---
const BATCH_SIZE = 15; // Tamanho do lote para requisições em paralelo
const MAX_RETRIES = 2; // Número máximo de retentativas para cada requisição
const RETRY_DELAY_MS = 500; // Tempo de espera inicial entre retentativas (em milissegundos)
// ------------------------------------

const processSubclasseData = ( // Função para processar dados de subclasses
    subclasse: any,
    classeFallback?: any
): CnaeTratado | null => {
    if (subclasse && subclasse.id && subclasse.descricao) { // Verifica se a subclasse é válida
        return {
            Codigo: `${subclasse.id}`,
            Descricao: subclasse.descricao,
            Percentual: 0.0,
        };
    } else if (classeFallback && classeFallback.id && classeFallback.descricao) { // Verifica se a classe de fallback é válida
        // Se a subclasse não for válida, retorna dados da classe como fallback
        return {
            Codigo: `${classeFallback.id}00`,
            Descricao: classeFallback.descricao,
            Percentual: 0.0,
        };
    }
    return null;
};

// Função auxiliar para buscar dados com retentativas
async function fetchWithRetry(
    url: string,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY_MS
): Promise<AxiosResponse> {
    try {
        // Configura timeout Axios
        return await axios.get(url, { timeout: 15000 }); // Timeout de 15 segundos
    } catch (error) { // error é do tipo 'unknown'

        // Lógica de Retentativa
        if (axios.isAxiosError(error) && retries > 0) {
            const axiosError = error; // Tipo estreitado para AxiosError
            if (
                axiosError.code === 'ETIMEDOUT' || // Timeout de conexão
                axiosError.code === 'ECONNRESET' || // Conexão resetada
                axiosError.code === 'ECONNREFUSED' || // Conexão recusada
                axiosError.code === 'ECONNABORTED' || // Timeout configurado no axios
                (axiosError.response && axiosError.response.status >= 500) // Erros 5xx do servidor
            ) {
                console.warn(`Retrying ${url} (${retries} retries left) after error: ${axiosError.code || axiosError.message}`);
                await setTimeout(delay);
                return fetchWithRetry(url, retries - 1, delay * 2); // Backoff exponencial
            }
        }

        // Log de Erro Final
        let errorMessage = 'Unknown error'; // Mensagem padrão para erro desconhecido
        if (axios.isAxiosError(error)) { // Verifica se o erro é do tipo AxiosError
            // Se for, extrai a mensagem e o código
            errorMessage = error.message;
            if(error.code) errorMessage += ` (Code: ${error.code})`;
        } else if (error instanceof Error) { // Verifica se o erro é uma instância de Error
            // Se for, extrai a mensagem
            errorMessage = error.message;
        } else if (typeof error === 'string') { // Verifica se o erro é uma string
            // Se for, usa a string como mensagem de erro
            errorMessage = error;
        } else { // Caso contrário, tenta converter o erro para string
            // Isso pode falhar, então usamos um bloco try-catch
            try {
                errorMessage = JSON.stringify(error);
            } catch {
                errorMessage = String(error);
            }
        }
        console.error(`Failed to fetch ${url} after multiple retries: ${errorMessage}`); // Loga o erro final
        // Lança o erro original para ser tratado na função chamadora


        throw error; // Re-lança o erro original
    }
}

export const getCnaeClasseSubclasse = async (req: Request, res: Response): Promise<void> => { // Função principal para buscar dados de CNAE
    const now = Date.now(); // Captura o timestamp atual
    if (cache && (now - cache.timestamp < CACHE_DURATION_MS)) { // Verifica se o cache é válido
        console.log('Retornando dados do cache.');
        res.status(200).json(cache.data);
        return;
    }

    console.log('Cache expirado ou inexistente. Buscando dados do IBGE...');
    const ibgeApiUrlClasses = 'https://servicodados.ibge.gov.br/api/v2/cnae/classes';

    try {
        console.log(`Buscando dados de classes em: ${ibgeApiUrlClasses}`);
        const classesResponse = await axios.get(ibgeApiUrlClasses);

        if (!Array.isArray(classesResponse.data)) {
            console.error('Formato inesperado da resposta de classes do IBGE:', classesResponse.data);
            res.status(500).send('Formato inesperado da resposta de classes do IBGE');
            return;
        }

        const classes: any[] = classesResponse.data;
        console.log(`Encontradas ${classes.length} classes. Buscando subclasses em lotes de ${BATCH_SIZE}...`);

        const processedDataMap = new Map<string, CnaeTratado>();
        const allResults = []; // Armazena resultados de todos os lotes

        // Processar em lotes
        for (let i = 0; i < classes.length; i += BATCH_SIZE) {
            const batch = classes.slice(i, i + BATCH_SIZE);
            console.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (classes ${i + 1} a ${Math.min(i + BATCH_SIZE, classes.length)})...`);

            const batchPromises = batch.map(classe => {
                const subclassesUrl = `https://servicodados.ibge.gov.br/api/v2/cnae/classes/${classe.id}/subclasses`;
                // Envelopa o resultado/erro para Promise.allSettled sempre ter status 'fulfilled'
                return fetchWithRetry(subclassesUrl)
                    .then(response => ({ status: 'fulfilled' as const, value: response, classData: classe }))
                    .catch(error => ({ status: 'rejected' as const, reason: error, classData: classe }));
            });

            const batchResults = await Promise.allSettled(batchPromises);
            allResults.push(...batchResults);

            // await setTimeout(100);
        }

        console.log('Todas as requisições de subclasses concluídas. Processando resultados...');

        // Processar todos os resultados coletados
        allResults.forEach(settledResult => {
            if (settledResult.status === 'fulfilled') {
                const innerResult = settledResult.value; 

                if (innerResult.status === 'fulfilled') {
                    // Requisição interna bem-sucedida
                    const subclassesResponse: AxiosResponse = innerResult.value; // A resposta Axios
                    const subclasses: any[] = subclassesResponse.data;
                    const classeOriginal = innerResult.classData;

                    if (Array.isArray(subclasses) && subclasses.length > 0) {
                        subclasses.forEach(subclasse => {
                            const item = processSubclasseData(subclasse);
                            if (item && !processedDataMap.has(item.Codigo)) {
                                processedDataMap.set(item.Codigo, item);
                            }
                        });
                    } else {
                        // Array de subclasses vazio ou inválido
                        const item = processSubclasseData(null, classeOriginal);
                        if (item && !processedDataMap.has(item.Codigo)) {
                            processedDataMap.set(item.Codigo, item);
                        }
                    }
                } else { // innerResult.status === 'rejected'
                    // Requisição interna falhou após retentativas
                    const classeOriginal = innerResult.classData;
                    const errorReason = innerResult.reason; // O erro original

                    let reasonMessage = 'Unknown error reason';
                    if (axios.isAxiosError(errorReason)) {
                       reasonMessage = errorReason.message;
                       if(errorReason.code) reasonMessage += ` (Code: ${errorReason.code})`;
                    } else if (errorReason instanceof Error) {
                       reasonMessage = errorReason.message;
                    } else if (typeof errorReason === 'string') {
                       reasonMessage = errorReason;
                    } else {
                        try { reasonMessage = JSON.stringify(errorReason); } catch { reasonMessage = String(errorReason); }
                    }
                    console.warn(`Erro final ao buscar subclasses da classe ${classeOriginal.id}: ${reasonMessage}`);

                    // Fallback com dados da classe
                    const item = processSubclasseData(null, classeOriginal);
                    if (item && !processedDataMap.has(item.Codigo)) {
                        processedDataMap.set(item.Codigo, item);
                    }
                }
            } else {
                // Este caso (settledResult.status === 'rejected') 
                // devido ao .catch interno
                console.error("Rejeição inesperada do Promise.allSettled:", settledResult.reason);
            }
        });

        const finalProcessedData = Array.from(processedDataMap.values());
        console.log(`Dados processados: ${finalProcessedData.length} itens únicos.`);

        cache = {
            data: finalProcessedData,
            timestamp: Date.now(),
        };

        res.status(200).json(finalProcessedData);

    } catch (error: unknown) {
        // Log erro geral (ex: falha ao buscar a lista inicial de classes)
        let generalErrorMessage = 'Unknown general error';
        if (axios.isAxiosError(error)) {
            generalErrorMessage = error.message;
            console.error('Detalhes Axios (Erro Geral):', {
                status: error.response?.status,
                data: error.response?.data,
                code: error.code,
                config_url: error.config?.url,
            });
        } else if (error instanceof Error) {
            generalErrorMessage = error.message;
        } else if (typeof error === 'string') {
            generalErrorMessage = error;
        } else {
             try { generalErrorMessage = JSON.stringify(error); } catch { generalErrorMessage = String(error); }
        }

        console.error(`Erro GERAL ao buscar ou processar dados do IBGE: ${generalErrorMessage}`);
        res.status(500).send('Erro interno ao processar a requisição');
    }
};