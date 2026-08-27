-- Created by GitHub Copilot in SSMS - review carefully before executing
/*
Este script recria as tabelas do banco de dados controla_facil.
Verificações de existência são realizadas antes de cada criação.
*/

-- 1. Tabela de Usuários
-- Cria a tabela de usuários com suas configurações de colunas.
IF OBJECT_ID('usuarios', 'U') IS NULL
CREATE TABLE usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    celular VARCHAR(20) NULL,
    cargo VARCHAR(100) NULL,
    senha_hash VARCHAR(MAX) NOT NULL,
    data_criacao DATETIME DEFAULT (getdate()),
    excluido BIT DEFAULT ((0)),
    ultimo_login DATETIME DEFAULT (getdate()),
    verificado BIT DEFAULT ((0)),
    token_verificacao VARCHAR(255) DEFAULT (NULL),
    token_expiracao DATETIME DEFAULT (NULL)
);
GO

-- 2. Tabela de Integrações
-- Cria a tabela de integrações realizando as ligações via chaves estrangeiras com a tabela de usuários.
IF OBJECT_ID('integracoes', 'U') IS NULL
CREATE TABLE integracoes (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255) NOT NULL,
    marketplace VARCHAR(100) NOT NULL,
    usuario_id INT NOT NULL,
    ativo TINYINT NULL,
    data_ativacao DATETIME DEFAULT (getdate()),
    data_atualizacao DATETIME DEFAULT (getdate()),
    CONSTRAINT fk_integracoes_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
GO

-- 3. Tabela de Configuração de Integrações
-- Cria a tabela de detalhes e credenciais para as integrações de marketplaces.
IF OBJECT_ID('integracao_configuracao', 'U') IS NULL
CREATE TABLE integracao_configuracao (
    id INT PRIMARY KEY IDENTITY(1,1),
    access_token VARCHAR(800) NOT NULL,
    refresh_token VARCHAR(800) NOT NULL,
    expires_at DATETIME NOT NULL,
    mercado_livre_user_id BIGINT NOT NULL,
    data_ativacao DATETIME DEFAULT (getdate()),
    data_atualizacao DATETIME DEFAULT (getdate()),
    integracao_id INT NOT NULL,
    usuario_id INT NULL,
    CONSTRAINT fk_integracaoconf_integracoes FOREIGN KEY (integracao_id) REFERENCES integracoes(id),
    CONSTRAINT fk_integracaoconf_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
GO

-- 4. Tabela de Categoria de Produtos
-- Cria as categorias relacionadas aos produtos do sistema.
IF OBJECT_ID('categoria_produto', 'U') IS NULL
CREATE TABLE categoria_produto (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR (MAX) NULL,
    usuario_criador_id INT NOT NULL,
    excluido BIT DEFAULT ((0)),
    CONSTRAINT fk_categoriaproduto_usuarios FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id)
);
GO

-- 5. Tabela de Produtos
-- Cria a estrutura principal onde todas as informações do produto serão armazenadas.
IF OBJECT_ID('produto', 'U') IS NULL
CREATE TABLE produto (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(MAX) NULL,
    condicao VARCHAR(20) DEFAULT ('new'),
    caracteristicas VARCHAR(MAX) NULL,
    categoria_id INT NOT NULL,
    ml_categoria_id VARCHAR(50) NULL,
    ml_domain_id VARCHAR (100) NULL,
    gtin VARCHAR(14) NULL,
    ml_item_id VARCHAR(50) NULL,
    usuario_criador_id INT NOT NULL,
    data_criacao DATETIME DEFAULT (getdate()),
    data_alteracao DATETIME DEFAULT (getdate()),
    excluido TINYINT DEFAULT ((0)),
    integracao_id INT NOT NULL,
    ml_link_anuncio VARCHAR (max) null
    CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria_produto(id),
    CONSTRAINT fk_produto_usuarios FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id),
    CONSTRAINT fk_produto_integracoes FOREIGN KEY (integracao_id) REFERENCES integracoes(id)
);
GO

-- 6. Tabela de Imagens de Produtos
-- Cria a estrutura que armazenará o caminho das imagens vinculadas aos produtos.
IF OBJECT_ID('produto_imagem', 'U') IS NULL
CREATE TABLE produto_imagem (
    id INT PRIMARY KEY IDENTITY(1,1),
    produto_id INT NOT NULL,
    url_imagem VARCHAR(500) NOT NULL,
    ordem INT DEFAULT ((1)),
    destaque BIT DEFAULT ((0)),
    data_upload DATETIME DEFAULT (getdate()),
    CONSTRAINT fk_produtoimagem_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);
GO

-- 7. Tabela de Estoque
-- Cria a tabela de definição do estoque atual para cada um dos produtos.
IF OBJECT_ID('estoque', 'U') IS NULL
CREATE TABLE estoque (
    id INT PRIMARY KEY IDENTITY(1,1),
    produto_id INT NOT NULL,
    qtd_disponivel INT NOT NULL DEFAULT ((0)),
    qtd_minima INT NOT NULL DEFAULT ((0)),
    data_alteracao DATETIME DEFAULT (getdate()),
    CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);
GO

-- 8. Tabela de Movimentação de Estoque
-- Cria a tabela para registro do histórico de entradas, saídas e ajustes no estoque.
IF OBJECT_ID('movimentacao_estoque', 'U') IS NULL
CREATE TABLE movimentacao_estoque (
    id INT PRIMARY KEY IDENTITY(1,1),
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    quantidade INT NOT NULL,
    tipo TINYINT NOT NULL,
    motivo VARCHAR(MAX) NULL,
    data_hora DATETIME DEFAULT (getdate()),
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (produto_id) REFERENCES produto(id),
    CONSTRAINT fk_movimentacao_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
GO

-- 9. Tabela de Pedidos
-- Cria a tabela principal para armazenar os dados consolidados do pedido efetuado no marketplace.
IF OBJECT_ID('pedido', 'U') IS NULL
CREATE TABLE pedido (
    id INT PRIMARY KEY IDENTITY(1,1),
    id_pedido_ml VARCHAR(255) NOT NULL,
    data_pedido DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status_pedido VARCHAR(50) NOT NULL,
    data_atualizacao_status DATETIME NOT NULL,
    usuario_id INT NOT NULL,
    integracao_id INT NOT NULL,
    id_comprador_ml VARCHAR(50) NULL,
    apelido_comprador VARCHAR(150) NULL,
    nome_completo_comprador VARCHAR(255) NULL,
    id_envio_ml VARCHAR(50) NULL,
    forma_pagamento VARCHAR(50) NULL,
    metodo_pagamento VARCHAR(50) NULL,
    CONSTRAINT fk_pedido_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pedido_integracoes FOREIGN KEY (integracao_id) REFERENCES integracoes(id)
);
GO

-- 10. Tabela de Itens do Pedido
-- Cria a tabela que relacional que lista quais produtos foram comprados e sua quantidade para cada pedido.
IF OBJECT_ID('item_pedido', 'U') IS NULL
CREATE TABLE item_pedido (
    id INT PRIMARY KEY IDENTITY(1,1),
    pedido_id INT NOT NULL,
    produto_id INT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    valor_desconto_item DECIMAL(10,2) NULL,
    id_item_ml VARCHAR(50) NOT NULL,
    titulo_item VARCHAR(255) NOT NULL,
    tarifa_venda DECIMAL(10,2) NULL,
    CONSTRAINT fk_itempedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id),
    CONSTRAINT fk_itempedido_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);
GO

-- 11. Tabela de Relatórios Personalizados
IF OBJECT_ID('relatorio_personalizado', 'U') IS NULL
CREATE TABLE relatorio_personalizado (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(MAX) NULL,
    tipo VARCHAR(50) NOT NULL, -- 'produtos', 'pedidos', 'estoque', 'clientes'
    filtros VARCHAR(MAX) NOT NULL, -- JSON com filtros adicionais como { data_inicio, data_fim, status, etc. }
    colunas VARCHAR(MAX) NOT NULL, -- JSON contendo a lista de colunas a exibir
    usuario_id INT NOT NULL,
    integracao_id INT NULL, -- Opcional: filtro por integração específica
    data_criacao DATETIME DEFAULT (getdate()),
    data_atualizacao DATETIME DEFAULT (getdate()),
    excluido BIT DEFAULT ((0)),
    CONSTRAINT fk_relatorios_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_relatorios_integracoes FOREIGN KEY (integracao_id) REFERENCES integracoes(id)
);
GO
