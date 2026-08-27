# Documentação da API - Controla Fácil Backend

Esta documentação descreve todos os endpoints da API do projeto **Controla Fácil Backend**, organizada de acordo com as pastas e módulos de funcionalidades (`features`) do sistema.

---

## 🔒 Autenticação e Segurança

A maioria das rotas do sistema exige autenticação baseada em **JSON Web Token (JWT)**. 

### Como autenticar suas requisições:
1. Faça login utilizando o endpoint `POST /api/usuarios/login` para receber um token de acesso.
2. Adicione o token no cabeçalho (header) de todas as requisições subsequentes que necessitem de proteção:
   ```http
   Authorization: Bearer <SEU_TOKEN_JWT_AQUI>
   Content-Type: application/json
   ```

---

## 📁 1. Usuários (`src/features/usuarios`)

Gerenciamento de contas de usuários, autenticação e verificação de e-mails.

### 1.1. Cadastrar Usuário
Cria uma nova conta de usuário no sistema e envia um e-mail de verificação.

*   **Método:** `POST`
*   **URL:** `/api/usuarios`
*   **Autenticação:** Não necessária (Pública)
*   **Headers:**
    *   `Content-Type: application/json`
*   **Corpo da Requisição (JSON):**
    
    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `nome` | String | **Sim** | Nome completo do usuário. |
    | `email` | String | **Sim** | E-mail único do usuário. |
    | `cpf_cnpj` | String | **Sim** | CPF ou CNPJ único do usuário. |
    | `celular` | String | **Sim** | Número de telefone/celular do usuário. |
    | `cargo` | String | **Sim** | Cargo ou nível de permissão (ex: `Administrador`, `Operador`). |
    | `senha` | String | **Sim** | Senha do usuário (será criptografada). |

    *Exemplo de envio:*
    ```json
    {
      "nome": "João da Silva",
      "email": "joao@email.com",
      "cpf_cnpj": "12345678900",
      "celular": "11999999999",
      "cargo": "Administrador",
      "senha": "senhaSegura123"
    }
    ```

*   **Retornos da Requisição:**
    *   **201 Created (Sucesso):**
        ```json
        {
          "message": "Usuário inserido com sucesso",
          "idUsuario": 10,
          "sucesso": true
        }
        ```
    *   **400 Bad Request (Erro de Validação/Duplicidade):**
        *   *Dados obrigatórios ausentes:*
            ```json
            {
              "error": "Dados obrigatórios não foram preenchidos",
              "sucesso": false
            }
            ```
        *   *CPF/CNPJ já cadastrado:*
            ```json
            {
              "error": "CPF ou CNPJ já cadastrado",
              "sucesso": false
            }
            ```
        *   *E-mail já cadastrado:*
            ```json
            {
              "error": "Email já cadastrado",
              "sucesso": false
            }
            ```
    *   **500 Internal Server Error:**
        ```json
        {
          "error": "Erro ao inserir usuário",
          "message": "Detalhes técnicos do erro",
          "sucesso": false
        }
        ```

> [!WARNING]
> **Divergência de Documentação Swagger:** Nos comentários Swagger do arquivo `usuarioRoutes.js`, o campo é documentado como `cpf`. No entanto, o backend (`usuarioController.js`) exige estritamente `cpf_cnpj`. Certifique-se de enviar `cpf_cnpj`.

---

### 1.2. Login de Usuário
Autentica o usuário e retorna o token JWT de acesso.

*   **Método:** `POST`
*   **URL:** `/api/usuarios/login`
*   **Autenticação:** Não necessária (Pública)
*   **Headers:**
    *   `Content-Type: application/json`
*   **Corpo da Requisição (JSON):**
    
    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `email` | String | **Sim** | E-mail cadastrado. |
    | `senha` | String | **Sim** | Senha do usuário. |

    *Exemplo de envio:*
    ```json
    {
      "email": "joao@email.com",
      "senha": "senhaSegura123"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Login realizado com sucesso",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "sucesso": true
        }
        ```
    *   **400 Bad Request:**
        ```json
        {
          "error": "Email e senha são obrigatórios",
          "sucesso": false
        }
        ```
    *   **401 Unauthorized (Senha Incorreta):**
        ```json
        {
          "error": "Senha incorreta",
          "sucesso": false
        }
        ```
    *   **403 Forbidden (E-mail não verificado):**
        ```json
        {
          "error": "Email não validado",
          "sucesso": false
        }
        ```
    *   **404 Not Found (Usuário inexistente):**
        ```json
        {
          "error": "Usuário não encontrado",
          "sucesso": false
        }
        ```

---

### 1.3. Verificar E-mail
Valida o token enviado para o e-mail do usuário e ativa a conta no sistema.

*   **Método:** `GET`
*   **URL:** `/api/usuarios/verificar-email/:token`
*   **Autenticação:** Não necessária (Pública)
*   **Parâmetros de Rota:**
    *   `token` (String, Obrigatório): Token de verificação enviado por e-mail.
*   **Retornos da Requisição:**
    *   **Redirect (302):** Este endpoint redireciona o navegador para o frontend.
        *   Se o token for válido e ativo: redireciona para `${URL_FRONTEND}/email-validado`
        *   Se o token for inválido, ausente ou expirado: redireciona para `${URL_FRONTEND}/email-falha-validacao`

---

### 1.4. Dados do Usuário Logado
Retorna as informações básicas do usuário atualmente autenticado pelo token JWT.

*   **Método:** `GET`
*   **URL:** `/api/usuarios/me`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Dados do usuário logado obtidos com sucesso",
          "usuario": {
            "id": 10,
            "nome": "João da Silva",
            "email": "joao@email.com",
            "cpf_cnpj": "12345678900",
            "celular": "11999999999",
            "cargo": "Administrador"
          },
          "sucesso": true
        }
        ```
    *   **401 Unauthorized:** Token inválido ou ausente.
    *   **404 Not Found:** Usuário não encontrado no banco de dados.

---

### 1.5. Buscar Usuário por ID
Retorna as informações completas de um usuário específico pesquisado pelo ID.

*   **Método:** `GET`
*   **URL:** `/api/usuarios/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID do usuário a ser buscado.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Usuário encontrado",
          "data": {
            "id": 1,
            "nome": "João da Silva",
            "email": "joao@email.com",
            "cpf_cnpj": "12345678900",
            "celular": "11999999999",
            "cargo": "Administrador",
            "verificado": 1,
            "data_criacao": "2026-05-30T15:00:00.000Z"
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID não fornecido.
    *   **404 Not Found:** Usuário com o ID especificado não encontrado.

---

### 1.6. Atualizar Usuário
Atualiza os dados cadastrais de um usuário existente. Os campos não informados no corpo da requisição permanecerão inalterados.

*   **Método:** `PUT`
*   **URL:** `/api/usuarios/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**
    
    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `id` | Integer | **Sim** | ID do usuário a ser atualizado (deve corresponder ao ID da rota). |
    | `nome` | String | Não | Novo nome completo. |
    | `email` | String | Não | Novo e-mail. |
    | `cpf_cnpj` | String | Não | Novo CPF ou CNPJ. |
    | `celular` | String | Não | Novo número de celular. |
    | `cargo` | String | Não | Novo cargo. |

    *Exemplo de envio:*
    ```json
    {
      "id": 1,
      "nome": "João da Silva Atualizado",
      "celular": "11988888888"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Usuário atualizado com sucesso",
          "data": {
            "id": 1,
            "nome": "João da Silva Atualizado",
            "email": "joao@email.com",
            "cpf_cnpj": "12345678900",
            "celular": "11988888888",
            "cargo": "Administrador"
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID não informado no corpo da requisição.
    *   **404 Not Found:** Usuário com ID especificado não encontrado.

---

### 1.7. Listar todos os Usuários
Lista todos os usuários cadastrados no banco de dados.

*   **Método:** `GET`
*   **URL:** `/api/usuarios`
*   **Autenticação:** **Exigida** (JWT Bearer Token)

> [!CAUTION]
> **Bug Conhecido no Handler:** A função `usuarioController.listarUsuarios` no backend retorna o objeto de resposta diretamente da função, em vez de utilizar o objeto `res` do Express (ex: `res.json(...)`). Isso fará com que qualquer chamada HTTP para este endpoint específico **trave/aguarde indefinidamente (hang)** até estourar o timeout do cliente. O retorno planejado para o endpoint é:
> ```json
> {
>   "quantidade": 2,
>   "data": [
>     { "id": 1, "nome": "João...", "email": "..." },
>     { "id": 2, "nome": "Maria...", "email": "..." }
>   ],
>   "sucesso": true
> }
> ```

---

## 📁 2. Integrações (`src/features/integracoes`)

Gerenciamento das conexões de marketplaces, especificamente a autenticação e renovação de credenciais do Mercado Livre.

### 2.1. Cadastrar Integração
Cria o registro inicial de uma integração (ex: Mercado Livre) com status `PENDENTE`.

*   **Método:** `POST`
*   **URL:** `/api/integracoes`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `nome` | String | **Sim** | Nome identificador que você quer dar à integração (Ex: "Loja Principal ML"). |

    *Exemplo de envio:*
    ```json
    {
      "nome": "Minha Loja ML"
    }
    ```

*   **Retornos da Requisição:**
    *   **201 Created (Sucesso):**
        ```json
        {
          "message": "Integração cadastrada com sucesso",
          "id": 1,
          "sucesso": true
        }
        ```
    *   **500 Internal Server Error:** Falha ao persistir no banco.

---

### 2.2. Listar Integrações
Lista todas as integrações que não estejam marcadas com status de excluído.

*   **Método:** `GET`
*   **URL:** `/api/integracoes`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Integrações listadas com sucesso",
          "integracoes": [
            {
              "id": 1,
              "nome": "Minha Loja ML",
              "marketplace": "MERCADO_LIVRE",
              "usuario_id": 10,
              "ativo": "PENDENTE",
              "data_criacao": "2026-05-31T20:00:00.000Z"
            }
          ],
          "sucesso": true
        }
        ```
    *   **404 Not Found:**
        ```json
        {
          "error": "Nenhuma integração encontrada",
          "integracoes": [],
          "sucesso": false
        }
        ```

---

### 2.3. Editar Integração
Altera o nome identificador de uma integração específica.

*   **Método:** `PUT`
*   **URL:** `/api/integracoes`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `id` | Integer | **Sim** | ID da integração a ser editada. |
    | `nome` | String | **Sim** | Novo nome para a integração. |

    *Exemplo de envio:*
    ```json
    {
      "id": 1,
      "nome": "Minha Loja ML Atualizada"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Integração editada com sucesso",
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID ou Nome não informados.

---

### 2.4. Inativar Integração
Altera o status de uma integração para `INATIVO`.

*   **Método:** `DELETE`
*   **URL:** `/api/integracoes/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID da integração a ser inativada.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Integração inativada com sucesso",
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID inválido ou ausente.

---

### 2.5. Autenticar com Mercado Livre (OAuth)
Endpoint chamado durante o fluxo de redirecionamento (callback) do Mercado Livre após o usuário consentir com o acesso. Obtém o token de acesso (access_token), token de renovação (refresh_token) e armazena a configuração ativa.

*   **Método:** `GET`
*   **URL:** `/api/integracoes/mercado-livre/auth`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Query:**
    
    | Parâmetro | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `code` | String | **Sim** | Código de autorização fornecido pelo redirecionamento do Mercado Livre. |
    | `integracaoId` | Integer | **Sim** | ID da integração previamente cadastrada no sistema. |

    *Exemplo:* `/api/integracoes/mercado-livre/auth?code=TG-xxxxx&integracaoId=1`

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Integração com Mercado Livre realizada com sucesso",
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** Código ou ID da integração ausentes.
    *   **500 Internal Server Error:** Falha na autenticação da API externa do Mercado Livre ou ao persistir as credenciais.

---

### 2.6. Testar Validade do Token [TESTE]
Verifica o estado atual dos tokens salvos no banco. Se o token estiver expirado (ou prestes a expirar nos próximos 5 minutos), dispara automaticamente o fluxo de refresh (renovação do token) com o Mercado Livre e faz uma chamada de teste real para verificar a integridade da comunicação.

*   **Método:** `GET`
*   **URL:** `/api/integracoes/mercado-livre/testar-token/:integracaoId`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `integracaoId` (Integer, Obrigatório): ID da integração a ser testada.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "message": "Token estava válido — nenhum refresh necessário" // ou "Token estava expirado — refresh realizado com sucesso",
          "refresh_ocorreu": false,
          "estado_antes": {
            "expires_at": "2026-06-01T04:00:00.000Z",
            "token_expirado": false
          },
          "estado_depois": {
            "expires_at": "2026-06-01T04:00:00.000Z",
            "token_expirado": false
          },
          "validacao_ml": {
            "chamada_bem_sucedida": true,
            "usuario_ml_id": 123456789,
            "usuario_ml_nickname": "VENDEDOR_TESTE"
          }
        }
        ```

---

### 2.7. Forçar Refresh de Token [TESTE]
Simula a expiração forçada de um token no banco de dados (retroagindo a expiração em 1 hora) e executa o fluxo imediato de refresh. Útil para validar o funcionamento do agendamento ou do fluxo de contingência de tokens.

*   **Método:** `POST`
*   **URL:** `/api/integracoes/mercado-livre/forcar-refresh/:integracaoId`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `integracaoId` (Integer, Obrigatório): ID da integração cuja renovação será forçada.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "message": "Fluxo de refresh testado com sucesso",
          "etapas": {
            "1_token_expirado_no_banco": true,
            "2_refresh_disparado": true,
            "3_novos_tokens_salvos": true
          },
          "novo_expires_at": "2026-06-01T08:00:00.000Z",
          "token_expirado_apos_refresh": false
        }
        ```

---

## 📁 3. Categorias de Produtos (`src/features/categorias`)

Módulo que gerencia categorias locais e integra ferramentas inteligentes do Mercado Livre para recomendação e mapeamento de categorias e atributos.

### 3.1. Cadastrar Categoria de Produto
Cria uma nova categoria para classificação interna de produtos.

*   **Método:** `POST`
*   **URL:** `/api/categoria-produto`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `nome` | String | **Sim** | Nome descritivo da categoria. |
    | `descricao` | String | Não | Breve descrição da utilidade da categoria. |

    *Exemplo de envio:*
    ```json
    {
      "nome": "Escolares",
      "descricao": "Produtos voltados a materiais escolares"
    }
    ```

*   **Retornos da Requisição:**
    *   **201 Created (Sucesso):**
        ```json
        {
          "message": "Categoria de produto inserida com sucesso!",
          "categoria": {
            "id": 5,
            "nome": "Escolares",
            "descricao": "Produtos voltados a materiais escolares"
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** Nome não enviado.

---

### 3.2. Listar Categorias de Produtos
Retorna todas as categorias ativas (não excluídas).

*   **Método:** `GET`
*   **URL:** `/api/categoria-produto`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Categorias de produto listadas com sucesso!",
          "categorias": [
            {
              "id": 1,
              "nome": "Eletrônicos",
              "descricao": "Aparelhos eletrônicos em geral"
            },
            {
              "id": 5,
              "nome": "Escolares",
              "descricao": "Produtos voltados a materiais escolares"
            }
          ],
          "sucesso": true
        }
        ```

---

### 3.3. Atualizar Categoria de Produto
Modifica o nome ou a descrição de uma categoria de produto ativa.

*   **Método:** `PUT`
*   **URL:** `/api/categoria-produto`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `id` | Integer | **Sim** | ID da categoria a ser modificada. |
    | `nome` | String | **Sim** | Novo nome da categoria. |
    | `descricao` | String | Não | Nova descrição. |

    *Exemplo de envio:*
    ```json
    {
      "id": 5,
      "nome": "Materiais Escolares e Papelaria",
      "descricao": "Papéis, canetas, mochilas e correlatos"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Categoria de produto atualizada com sucesso!",
          "categoria": {
            "id": 5,
            "nome": "Materiais Escolares e Papelaria",
            "descricao": "Papéis, canetas, mochilas e correlatos"
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID ou Nome não fornecidos.

---

### 3.4. Excluir Categoria de Produto
Marca uma categoria como excluída (`excluido = 1`).

*   **Método:** `DELETE`
*   **URL:** `/api/categoria-produto/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID da categoria que será excluída.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Categoria de produto excluída com sucesso!",
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID ausente.

---

### 3.5. Buscar Sugestões de Categorias no Mercado Livre
Utiliza o classificador automático do Mercado Livre para sugerir a melhor categoria de anúncio baseado no título/nome de um produto.

*   **Método:** `POST`
*   **URL:** `/api/categoria-produto/mercado-livre/sugeridas`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `integracaoId` | Integer | **Sim** | ID da integração do Mercado Livre. |
    | `titulo` | String | **Sim** | Nome/Título do produto que será classificado (Ex: "iPhone 13 128GB"). |

    *Exemplo de envio:*
    ```json
    {
      "integracaoId": 1,
      "titulo": "Carregador Portatil Power Bank 10000mah"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Sugestões de categorias encontradas com sucesso!",
          "sugestoes": [
            {
              "id": "MLB271813",
              "name": "Carregadores Portáteis",
              "prediction_probability": 0.98,
              "path_from_root": [
                { "id": "MLB1648", "name": "Celulares e Telefones" },
                { "id": "MLB3813", "name": "Acessórios para Celulares" },
                { "id": "MLB271813", "name": "Carregadores Portáteis" }
              ]
            }
          ],
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** Parâmetros `integracaoId` ou `titulo` ausentes.

---

### 3.6. Obter Atributos de Categoria do Mercado Livre
Busca a ficha técnica e os atributos obrigatórios/opcionais exigidos pelo Mercado Livre para publicar um produto sob determinada categoria. Possui sistema de cache em memória para acelerar as respostas subsequentes.

*   **Método:** `POST` ou `GET`
*   **URL:** `/api/categoria-produto/mercado-livre/categoria/atributos`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Query ou Corpo da Requisição:**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `integracaoId` | Integer | **Sim** | ID da integração correspondente ao ML. |
    | `ml_categoriaId` | String | **Sim** | ID da categoria no Mercado Livre (Ex: "MLB271813"). |

    *Exemplo de envio:*
    ```json
    {
      "integracaoId": 1,
      "ml_categoriaId": "MLB271813"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "message": "Atributos da categoria recuperados com sucesso!",
          "dados": {
            "category_id": "MLB271813",
            "attributes": [
              {
                "id": "BRAND",
                "label": "Marca",
                "fieldType": "text",
                "required": true,
                "placeholder": "Ex: Samsung",
                "groupId": "MAIN",
                "groupLabel": "Principais",
                "options": null,
                "allowedUnits": null,
                "defaultUnit": null
              },
              {
                "id": "MODEL",
                "label": "Modelo",
                "fieldType": "text",
                "required": true,
                "placeholder": null,
                "groupId": "MAIN",
                "groupLabel": "Principais",
                "options": null,
                "allowedUnits": null,
                "defaultUnit": null
              }
            ]
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** ID da integração ou da categoria ML não informados.

---

## 📁 4. Produtos (`src/features/produtos`)

Módulo central para criação de produtos no sistema, controle de estoque inicial, gestão de catálogo e carregamento de imagens.

### 4.1. Cadastrar Produto
Cadastra um novo produto na base de dados. Em uma única transação atômica, o sistema:
1. Registra o produto no banco.
2. Inicializa os registros de estoque e quantidade mínima.
3. Se a quantidade inicial for maior que zero, registra uma movimentação de estoque inicial (`ENTRADA`).
4. Associa as imagens do produto.

*   **Método:** `POST`
*   **URL:** `/api/produto`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `nome` | String | **Sim** | Título ou nome do produto. |
    | `sku` | String | **Sim** | Código de identificação SKU único. |
    | `preco` | Decimal/Float | **Sim** | Preço unitário do produto. |
    | `categoria_id` | Integer | **Sim** | ID da categoria interna cadastrada. |
    | `integracao_id` | Integer | **Sim** | ID da integração associada ao produto. |
    | `descricao` | String | Não | Descrição detalhada do produto. |
    | `condicao` | String | Não | Estado do produto. Padrão: `"new"`. |
    | `caracteristicas`| Objeto/String | Não | Ficha técnica livre (ex: JSON de especificações). |
    | `gtin` | String | Não | Código de barras universal (EAN/GTIN). |
    | `quantidade_inicial` | Integer | Não | Saldo inicial do estoque físico. Padrão: `0`. |
    | `quantidade_minima` | Integer | Não | Alerta de estoque baixo. Padrão: `0`. |
    | `imagens` | Array | Não | Lista de imagens associadas ao produto (ver formato abaixo). |

    *Estrutura das imagens no array:*
    *   `url` (String, Obrigatória): Caminho relativo da imagem (ex: `uploads/foto.jpg`).
    *   `ordem` (Integer, Opcional): Ordem de exibição da foto.
    *   `ehDestaque` (Integer 0 ou 1, Opcional): Define se será a imagem de capa.

    *Exemplo de envio:*
    ```json
    {
      "nome": "Caderno Universitário Tilibra 10 Matérias",
      "sku": "TIL-CAD-10M",
      "preco": 24.90,
      "categoria_id": 5,
      "integracao_id": 1,
      "descricao": "Caderno espiral 10 matérias com capa dura",
      "condicao": "new",
      "caracteristicas": {
        "folhas": 160,
        "tipo": "Espiral"
      },
      "gtin": "7891020304050",
      "quantidade_inicial": 50,
      "quantidade_minima": 5,
      "imagens": [
        {
          "url": "uploads/imagem-caderno-1.jpg",
          "ordem": 0,
          "ehDestaque": 1
        }
      ]
    }
    ```

*   **Retornos da Requisição:**
    *   **201 Created (Sucesso):**
        ```json
        {
          "produto": {
            "id": 15,
            "nome": "Caderno Universitário Tilibra 10 Matérias",
            "sku": "TIL-CAD-10M",
            "preco": 24.90,
            "descricao": "Caderno espiral 10 matérias com capa dura",
            "condicao": "new",
            "categoria_id": 5,
            "caracteristicas": "{\"folhas\":160,\"tipo\":\"Espiral\"}",
            "gtin": "7891020304050",
            "usuario_criador_id": 10,
            "integracao_id": 1,
            "quantidadeInicial": 50,
            "totalImagens": 1
          },
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** Ausência de campos obrigatórios (`nome`, `sku`, `preco`, `categoria_id` ou `integracao_id`).
    *   **500 Internal Server Error:** Falhas no processo transacional de banco de dados (o cadastro inteiro sofre rollback automático se qualquer etapa falhar).

---

### 4.2. Listar Produtos
Retorna todos os produtos ativos (excluido = 0).

*   **Método:** `GET`
*   **URL:** `/api/produto`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "produtos": [
            {
              "id": 15,
              "nome": "Caderno Universitário Tilibra 10 Matérias",
              "sku": "TIL-CAD-10M",
              "preco": 24.90,
              "descricao": "Caderno espiral 10 matérias com capa dura",
              "condicao": "new",
              "categoria_id": 5,
              "caracteristicas": "{\"folhas\":160,\"tipo\":\"Espiral\"}",
              "gtin": "7891020304050",
              "excluido": 0,
              "data_criacao": "2026-05-31T22:00:00.000Z",
              "data_alteracao": null
            }
          ],
          "sucesso": true
        }
        ```

---

### 4.3. Buscar Produto por ID
Retorna as especificações de um produto individual, enriquecido com o saldo de estoque atual e as imagens cadastradas.

*   **Método:** `GET`
*   **URL:** `/api/produto/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID do produto.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "produto": {
            "id": 15,
            "nome": "Caderno Universitário Tilibra 10 Matérias",
            "sku": "TIL-CAD-10M",
            "preco": 24.90,
            "descricao": "Caderno espiral 10 matérias com capa dura",
            "condicao": "new",
            "categoria_id": 5,
            "caracteristicas": "{\"folhas\":160,\"tipo\":\"Espiral\"}",
            "gtin": "7891020304050",
            "excluido": 0,
            "data_criacao": "2026-05-31T22:00:00.000Z",
            "data_alteracao": null,
            "estoque": 50,
            "imagens": [
              {
                "id": 1,
                "produto_id": 15,
                "url_imagem": "uploads/imagem-caderno-1.jpg",
                "ordem": 0,
                "destaque": 1
              }
            ]
          },
          "sucesso": true
        }
        ```
    *   **404 Not Found:** Produto com o ID fornecido não existe ou foi excluído do catálogo.

---

### 4.4. Atualizar Produto
Atualiza as propriedades gerais de um produto no catálogo.

*   **Método:** `PUT`
*   **URL:** `/api/produto/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID do produto a ser atualizado.
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `nome` | String | **Sim** | Novo nome/título. |
    | `sku` | String | **Sim** | Novo SKU único. |
    | `preco` | Decimal | **Sim** | Novo valor. |
    | `categoria_id` | Integer | **Sim** | ID da categoria associada. |
    | `descricao` | String | Não | Nova descrição do produto. |
    | `condicao` | String | Não | Estado do produto. |
    | `caracteristicas`| Objeto/String | Não | Especificações adicionais. |
    | `gtin` | String | Não | Novo código de barras universal. |

    *Exemplo de envio:*
    ```json
    {
      "nome": "Caderno Universitário Tilibra 10 Matérias (Edição Luxo)",
      "sku": "TIL-CAD-10M-LUXO",
      "preco": 29.90,
      "categoria_id": 5,
      "descricao": "Capa personalizada holográfica",
      "condicao": "new",
      "caracteristicas": { "folhas": 160, "tipo": "Espiral" },
      "gtin": "7891020304050"
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "produto": {
            "id": "15",
            "nome": "Caderno Universitário Tilibra 10 Matérias (Edição Luxo)",
            "sku": "TIL-CAD-10M-LUXO",
            "preco": 29.90,
            "descricao": "Capa personalizada holográfica",
            "condicao": "new",
            "categoria_id": 5,
            "caracteristicas": "{\"folhas\":160,\"tipo\":\"Espiral\"}",
            "gtin": "7891020304050"
          },
          "sucesso": true
        }
        ```

---

### 4.5. Excluir Produto
Marca o produto como deletado do sistema (`excluido = 1`).

*   **Método:** `DELETE`
*   **URL:** `/api/produto/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID do produto a ser desativado.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "mensagem": "Produto excluído com sucesso",
          "sucesso": true
        }
        ```

---

### 4.6. Enviar Imagem do Produto (Upload)
Realiza o upload físico de um arquivo de imagem para o servidor. O arquivo é armazenado no diretório `uploads/` e a resposta indica o caminho relativo correspondente para salvamento no banco de dados.

*   **Método:** `POST`
*   **URL:** `/api/produto/upload-imagem`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Headers:**
    *   `Content-Type: multipart/form-data`
*   **Corpo da Requisição (Form-Data):**
    
    | Chave | Tipo | Obrigatória? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `imagem` | Arquivo (Binary) | **Sim** | Arquivo de imagem a ser enviado. |

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "caminho": "uploads/imagem-1685573489123.jpg",
          "mensagem": "Imagem enviada com sucesso"
        }
        ```
    *   **400 Bad Request:** Arquivo não anexado na propriedade `imagem`.

> [!NOTE]
> As imagens enviadas por esse endpoint ficam disponíveis publicamente para consumo estático sob o prefixo `/api/uploads/` (Ex: `http://localhost:5000/api/uploads/imagem-1685573489123.jpg`).

---

### 4.7. Publicar Produto no Mercado Livre
Publica um produto do sistema local como um novo anúncio no Mercado Livre, utilizando os dados já cadastrados (estoque, imagens, categoria, etc).

*   **Método:** `POST`
*   **URL:** `/api/produto/mercado-livre/publicar/:produtoId`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `produtoId` (Integer, Obrigatório): ID do produto no sistema a ser publicado.
*   **Corpo da Requisição:** N/A (Os dados são extraídos do banco de dados do sistema).
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "mensagem": "Produto publicado com sucesso",
          "produtoML": { "id": "MLB123456789", "title": "...", "price": 24.90, "..." },
          "produtoAtualizado": { "id": 15, "ml_item_id": "MLB123456789", "..." }
        }
        ```
    *   **404 Not Found:** Produto, estoque ou imagens não encontrados.
    *   **500 Internal Server Error:** Falha ao publicar produto no Mercado Livre.

---

### 4.8. Editar Produto no Mercado Livre
Atualiza as informações de um anúncio já existente no Mercado Livre com base nos dados atuais do produto no sistema local (preço, quantidade disponível em estoque, condição, características, fotos e descrição).

*   **Método:** `PUT`
*   **URL:** `/api/produto/mercado-livre/editar/:produtoId`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `produtoId` (Integer, Obrigatório): ID do produto no sistema local que já está vinculado ao Mercado Livre.
*   **Corpo da Requisição:** N/A (Os dados são extraídos do banco de dados do sistema).
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "mensagem": "Produto editado com sucesso",
          "produtoAtualizadoML": { "id": "MLB123456789", "title": "...", "price": 29.90, "..." },
          "descricaoMl": { "text": "Nova descrição..." }
        }
        ```
    *   **500 Internal Server Error:** Falha ao editar o produto no Mercado Livre.

---

### 4.9. Alterar Status do Produto
Altera o status de exclusão/ativação do produto no banco de dados local e envia a atualização correspondente para o anúncio do Mercado Livre (ativo, pausado ou encerrado).

*   **Método:** `PUT`
*   **URL:** `/api/produto/status/:id`
*   **Autenticação:** **Exigida** (JWT Bearer Token)
*   **Parâmetros de Rota:**
    *   `id` (Integer, Obrigatório): ID do produto no sistema local.
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `status` | Integer | **Sim** | Novo status interno do produto (0 = ATIVO, 1 = PAUSADO, 2 = ENCERRADO/EXCLUÍDO). |

    *Exemplo de envio:*
    ```json
    {
      "status": 1
    }
    ```

*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "sucesso": true,
          "mensagem": "Produto alterado com sucesso",
          "produtoAlteradoML": {
            "id": "MLB123456789",
            "status": "paused"
          }
        }
        ```
    *   **400 Bad Request:** Status inválido ou não mapeado para o Mercado Livre.
        ```json
        {
          "error": "Status fornecido (9) é inválido para integração com o Mercado Livre.",
          "sucesso": false
        }
        ```
    *   **404 Not Found:** Produto com o ID especificado não encontrado.
        ```json
        {
          "error": "Produto não encontrado",
          "sucesso": false
        }
        ```
    *   **500 Internal Server Error:** Falha ao atualizar o status local ou ao comunicar a alteração ao Mercado Livre.
        ```json
        {
          "error": "Erro ao alterar status do produto: <mensagem do erro>",
          "sucesso": false
        }
        ```

---

## 📁 5. Estoque (`src/features/estoque`)

Gestão de saldos de estoque físico e registro histórico de movimentações (entradas e saídas).

### 5.1. Consultar Saldo de Estoque de um Produto
Consulta a quantidade de itens fisicamente disponíveis para venda e as configurações de alertas de estoque mínimo para um produto.

*   **Método:** `GET`
*   **URL:** `/api/estoque/:produtoId`
*   **Autenticação:** Não necessária no arquivo de rotas (Pública)
*   **Parâmetros de Rota:**
    *   `produtoId` (Integer, Obrigatório): ID do produto para consulta do estoque.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "estoque": {
            "id": 8,
            "produto_id": 15,
            "qtd_disponivel": 50,
            "qtd_minima": 5,
            "data_criacao": "2026-05-31T22:00:00.000Z",
            "data_alteracao": null
          },
          "sucesso": true
        }
        ```
    *   **404 Not Found:** Registro de estoque não encontrado para o produto especificado.

---

### 5.2. Registrar Movimentação de Estoque
Registra a entrada ou saída de itens do estoque de um produto, atualizando em tempo real o saldo disponível (`qtd_disponivel`). Esta chamada é protegida por transação atômica.

*   **Método:** `POST`
*   **URL:** `/api/estoque/movimentacoes`
*   **Autenticação:** Não necessária no arquivo de rotas (Pública). 
*   **Headers:**
    *   `Content-Type: application/json`
*   **Corpo da Requisição (JSON):**

    | Campo | Tipo | Obrigatório? | Descrição |
    | :--- | :--- | :--- | :--- |
    | `produto_id` | Integer | **Sim** | ID do produto cuja quantidade será alterada. |
    | `quantidade` | Integer | **Sim** | Quantidade movimentada (deve ser um número positivo). |
    | `tipo` | String | **Sim** | Sentido do fluxo. Deve ser estritamente `ENTRADA` ou `SAIDA`. |
    | `motivo` | String | Não | Texto descritivo para histórico (Ex: "Ajuste inventário", "Venda Balcão"). |
    | `usuario_id` | Integer | Não | ID do usuário que fez a movimentação (Padrão: resolve de `req.usuario.id`, senão do corpo, senão resolve para `5`). |

    *Exemplo de envio:*
    ```json
    {
      "produto_id": 15,
      "quantidade": 10,
      "tipo": "SAIDA",
      "motivo": "Perda por avaria na capa"
    }
    ```

*   **Retornos da Requisição:**
    *   **201 Created (Sucesso):**
        ```json
        {
          "mensagem": "Movimentação registrada com sucesso",
          "movimentacao": {
            "id": 48,
            "data_hora": "2026-05-31T22:15:00.000Z"
          },
          "novoSaldo": 40,
          "sucesso": true
        }
        ```
    *   **400 Bad Request:** 
        *   *Dados obrigatórios ausentes:*
            ```json
            {
              "error": "Campos obrigatórios ausentes (produto_id, quantidade, tipo)"
            }
            ```
        *   *Tipo de movimentação inválido:*
            ```json
            {
              "error": "Tipo deve ser ENTRADA ou SAIDA",
              "sucesso": false
            }
            ```
        *   *Saldo insuficiente (para operações de `SAIDA`):*
            ```json
            {
              "error": "Erro ao registrar movimentação: Saldo insuficiente para a saída solicitada."
            }
            ```
    *   **500 Internal Server Error:** Erro ao registrar dados no banco ou ao buscar o produto.

---

### 5.3. Listar Histórico de Movimentações de um Produto
Lista todas as operações de Entrada e Saída executadas para um produto específico, com ordenação decrescente (da mais recente para a mais antiga).

*   **Método:** `GET`
*   **URL:** `/api/estoque/movimentacoes/:produtoId`
*   **Autenticação:** Não necessária no arquivo de rotas (Pública)
*   **Parâmetros de Rota:**
    *   `produtoId` (Integer, Obrigatório): ID do produto para consulta do histórico.
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "movimentacoes": [
            {
              "id": 48,
              "produto_id": 15,
              "usuario_id": 10,
              "quantidade": 10,
              "tipo": "SAIDA",
              "motivo": "Perda por avaria na capa",
              "data_hora": "2026-05-31T22:15:00.000Z",
              "usuario_nome": "João da Silva"
            },
            {
              "id": 12,
              "produto_id": 15,
              "usuario_id": 10,
              "quantidade": 50,
              "tipo": "ENTRADA",
              "motivo": "Saldo Inicial de Cadastro",
              "data_hora": "2026-05-31T22:00:00.000Z",
              "usuario_nome": "João da Silva"
            }
          ],
          "sucesso": true
        }
        ```

---

### 5.4. Listar Todas as Movimentações
Lista todas as operações de Entrada e Saída executadas no estoque de todos os produtos do sistema, incluindo os dados detalhados do produto e do usuário responsável, com ordenação decrescente (da mais recente para a mais antiga).

*   **Método:** `GET`
*   **URL:** `/api/estoque/movimentacoes`
*   **Autenticação:** Não necessária no arquivo de rotas (Pública)
*   **Retornos da Requisição:**
    *   **200 OK (Sucesso):**
        ```json
        {
          "movimentacoes": [
            {
              "id": 48,
              "produto_id": 15,
              "usuario_id": 10,
              "quantidade": 10,
              "tipo": 2,
              "motivo": "Perda por avaria na capa",
              "data_hora": "2026-05-31T22:15:00.000Z",
              "produto_nome": "Caderno Universitário Tilibra 10 Matérias",
              "produto_sku": "TIL-CAD-10M",
              "usuario_nome": "João da Silva"
            }
          ],
          "sucesso": true
        }
        ```
