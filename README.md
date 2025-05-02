![image](https://github.com/user-attachments/assets/ac86aeb6-5672-4d1a-8fda-0da478cd706d)

# 📊 API CNAE Processada

API para buscar e formatar dados da Classificação Nacional de Atividades Econômicas (CNAE) fornecidos pelo IBGE. <br>
A API retorna informações de classe e subclasse com códigos concatenados e dados organizados.
```bash 
https://api-cnae-ibge-ts.onrender.com/api-docs/
```
```bash
https://api-cnae-ibge-ts.onrender.com/api/cnae-classe-subclasse
```
---

## 🚀 Funcionalidades

- ✅ Retorna todos os CNAEs com classe e subclasse.
- ✅ Garante unicidade dos registros (sem duplicatas).
- ✅ Inclui documentação interativa via Swagger.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript.
- **Express** – Framework para construção de APIs.
- **Axios** – Cliente HTTP para comunicação com a API do IBGE.
- **Swagger (Swagger UI Express)** – Para documentação interativa.
- **TypeScript** – Tipagem estática para maior confiabilidade.

---

## 📦 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor:

   ```bash
   npm run dev
   ```

---

## 📚 Documentação da API

Acesse a interface Swagger:

```
http://localhost:3000/api-docs
```

---

## 🔗 Endpoints Disponíveis

### `GET /api/cnae-classe-subclasse`

- **Descrição:** Retorna todos os CNAEs com o código completo da classe + subclasse.
- **Resposta:**

```json
[
  {
    "Codigo": "0111301",
    "Descricao": "CULTIVO DE CEREAIS",
    "Percentual": 0.0
  },
]
```

---

## 🛡️ Tratamento de Erros

- `500 Internal Server Error` – Problemas ao buscar ou processar dados da API do IBGE.

---

## 🧪 Testes

1. Certifique-se de que o servidor está em execução (`npm run dev`).
2. Teste os endpoints usando:
   - Postman
   - Insomnia
   - curl

---
