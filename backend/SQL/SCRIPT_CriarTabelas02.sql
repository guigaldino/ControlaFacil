-- ===================================
-- CRIAÇÃO DAS TABELAS
-- ===================================

CREATE TABLE `usuarios` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `cpf` VARCHAR(255) UNIQUE NOT NULL,
  `celular` VARCHAR(255),
  `cargo` VARCHAR(255),
  -- Ajuste de sintaxe para MySQL: TIMESTAMP e CURRENT_TIMESTAMP
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  `excluido` TINYINT DEFAULT 0, 
  `senhaHash` TEXT
);

CREATE TABLE integracao_configuracao (
  `id INT PRIMARY KEY AUTO_INCREMENT`,
  `usuario_configurador_id INT NULL`,
  `access_token VARCHAR(800) NOT NULL`,
  `refresh_token VARCHAR(800) NOT NULL`,
  `expires_at DATETIME NOT NULL`,
  `mercado_livre_user_id BIGINT NOT NULL`,
  `data_ativacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
);

CREATE TABLE `categoria_produto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `usuario_criador` INT NOT NULL,
  `excluido` TINYINT DEFAULT 0 
);

CREATE TABLE `tipo_produto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `usuario_criador` INT NOT NULL,
  `excluido` TINYINT DEFAULT 0 
);

CREATE TABLE `categoria_tipo_produto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `categoria_produto_id` INT NOT NULL,
  `tipo_produto_id` INT NOT NULL
);

CREATE TABLE `modelo_produto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `tipo_produto_id` INT NOT NULL,
  `usuario_criador` INT NOT NULL,
  `excluido` TINYINT DEFAULT 0 
);

CREATE TABLE `produto` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `preco` DECIMAL(10, 2), -- Adicionada precisão decimal
  `modelo_produto_id` INT NOT NULL,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- TIMESTAMP com ON UPDATE CURRENT_TIMESTAMP é ideal para data_alteracao
  `data_alteracao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
  `usuario_criador` INT NOT NULL,
  `usuario_atualizador` INT, -- Removido NOT NULL (ajuste de lógica)
  `excluido` TINYINT DEFAULT 0 
);

CREATE TABLE `produto_integracao` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `produto_id` INT NOT NULL,
  `integracao_id` INT NOT NULL
);

CREATE TABLE `estoque` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `produto_id` INT NOT NULL UNIQUE,
  `qtd_disponivel` INT NOT NULL,
  `qtd_minima` INT NOT NULL,
  `data_criacao` DATETIME,
  `data_alteracao` DATETIME
);

CREATE TABLE `movimentacao_estoque` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `produto_id` INT NOT NULL,
  `quantidade` INT NOT NULL,
  `tipo_movimentacao` VARCHAR(50) NOT NULL, 
  `razao` TEXT NOT NULL,
  `usuario_id` INT NOT NULL,
  `data_hora_movimentacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `cliente` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `telefone` VARCHAR(255)
);

CREATE TABLE `pedido` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `numero_pedido_marketplace` VARCHAR(255) NOT NULL,
  `integracao_id` INT NOT NULL,
  `cliente_id` INT NOT NULL,
  `data_pedido` DATETIME NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `status_pedido` VARCHAR(50) NOT NULL,
  `data_atualizacao_status` DATETIME NOT NULL
);

CREATE TABLE `item_pedido` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `pedido_id` INT NOT NULL,
  `produto_id` INT NOT NULL,
  `quantidade` INT NOT NULL,
  `preco_unitario` DECIMAL(10, 2) NOT NULL,
  `valor_desconto_item` DECIMAL(10, 2)
);

-- AVALIAR PARA O FUTURO
-- CREATE TABLE `devolucao` (
--   `id` INT PRIMARY KEY AUTO_INCREMENT,
--   `pedido_id` INT NOT NULL,
--   `numero_devolucao_marketplace` VARCHAR(255) UNIQUE, 
--   `data_devolucao` DATETIME NOT NULL,
--   `motivo_devolucao` TEXT NOT NULL,
--   `status_devolucao` VARCHAR(50) NOT NULL,
--   `data_status_attualizacao_devolucao` DATETIME NOT NULL,
--   `valor_total_devolucao` DECIMAL(10, 2) NOT NULL
-- );

-- CREATE TABLE `item_devolucao` (
--   `id` INT PRIMARY KEY AUTO_INCREMENT,
--   `devolucao_id` INT NOT NULL,
--   `item_pedido_id` INT NOT NULL,
--   `produto_id` INT NOT NULL,
--   `quantidade` INT NOT NULL,
--   `preco_unitario` DECIMAL(10, 2) NOT NULL
-- );

-- CREATE TABLE `feedback` (
--   `id` INT PRIMARY KEY AUTO_INCREMENT,
--   `integracao_id` INT NOT NULL,
--   `numero_pedido_marketplace` VARCHAR(255) NOT NULL,
--   `produto_id` INT NOT NULL,
--   `nota` INT NOT NULL,
--   `comentario` TEXT NOT NULL,
--   `data_feedback` DATETIME NOT NULL,
--   `excluido` TINYINT DEFAULT 0
-- );

-- CREATE TABLE `relatorio_personalizado` (
--   `id` INT PRIMARY KEY AUTO_INCREMENT,
--   `nome` VARCHAR(255) NOT NULL,
--   `parametros_json` JSON NOT NULL,
--   `usuario_criador` INT NOT NULL,
--   `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `data_ultima_edicao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `excluido` TINYINT DEFAULT 0 
-- );

-- CREATE TABLE `produto_imagem` (
--   `id` INT PRIMARY KEY AUTO_INCREMENT,
--   `produto_id` INT NOT NULL,
--   `url_imagem` VARCHAR(500) NOT NULL,
--   `ordem` INT DEFAULT 1,
--   `destaque` TINYINT DEFAULT 1,
--   `data_upload` DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- ===================================
-- DEFINIÇÃO DAS CHAVES ESTRANGEIRAS (FOREIGN KEYS)
-- ===================================

-- Auditoria (Usuários)
ALTER TABLE `integracao_configuracao` ADD FOREIGN KEY (`usuario_configurador_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `categoria_produto` ADD FOREIGN KEY (`usuario_criador`) REFERENCES `usuarios` (`id`);
ALTER TABLE `tipo_produto` ADD FOREIGN KEY (`usuario_criador`) REFERENCES `usuarios` (`id`);
ALTER TABLE `modelo_produto` ADD FOREIGN KEY (`usuario_criador`) REFERENCES `usuarios` (`id`);
ALTER TABLE `produto` ADD FOREIGN KEY (`usuario_criador`) REFERENCES `usuarios` (`id`);
ALTER TABLE `produto` ADD FOREIGN KEY (`usuario_atualizador`) REFERENCES `usuarios` (`id`);
ALTER TABLE `movimentacao_estoque` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);
ALTER TABLE `relatorio_personalizado` ADD FOREIGN KEY (`usuario_criador`) REFERENCES `usuarios` (`id`);

-- Integrações e Configuração
ALTER TABLE `integracao_configuracao` ADD FOREIGN KEY (`integracao_id`) REFERENCES `integracoes` (`id`);

-- Hierarquia de Produtos
ALTER TABLE `categoria_tipo_produto` ADD FOREIGN KEY (`categoria_produto_id`) REFERENCES `categoria_produto` (`id`);
ALTER TABLE `categoria_tipo_produto` ADD FOREIGN KEY (`tipo_produto_id`) REFERENCES `tipo_produto` (`id`);
ALTER TABLE `modelo_produto` ADD FOREIGN KEY (`tipo_produto_id`) REFERENCES `tipo_produto` (`id`);

-- Produto e Vínculos
ALTER TABLE `produto` ADD FOREIGN KEY (`modelo_produto_id`) REFERENCES `modelo_produto` (`id`);
ALTER TABLE `produto_integracao` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);
ALTER TABLE `produto_integracao` ADD FOREIGN KEY (`integracao_id`) REFERENCES `integracoes` (`id`);

-- Estoque e Movimentação
ALTER TABLE `estoque` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);
ALTER TABLE `movimentacao_estoque` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);

-- Pedidos e Itens
ALTER TABLE `pedido` ADD FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`);
ALTER TABLE `pedido` ADD FOREIGN KEY (`integracao_id`) REFERENCES `integracoes` (`id`);
ALTER TABLE `item_pedido` ADD FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`);
ALTER TABLE `item_pedido` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);

-- Devoluções e Itens
ALTER TABLE `devolucao` ADD FOREIGN KEY (`pedido_id`) REFERENCES `pedido` (`id`);
ALTER TABLE `item_devolucao` ADD FOREIGN KEY (`devolucao_id`) REFERENCES `devolucao` (`id`);
ALTER TABLE `item_devolucao` ADD FOREIGN KEY (`item_pedido_id`) REFERENCES `item_pedido` (`id`);
ALTER TABLE `item_devolucao` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);

-- Feedbacks
ALTER TABLE `feedback` ADD FOREIGN KEY (`integracao_id`) REFERENCES `integracoes` (`id`);
ALTER TABLE `feedback` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);

-- Produto Imagem: referência ao produto
ALTER TABLE `produto_imagem` ADD FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`);


-- ===================================
-- RESTRIÇÕES ADICIONAIS DE INTEGRIDADE
-- ===================================

-- Chave Composta para N:N de Categoria/Tipo (Impede duplicação)
ALTER TABLE `categoria_tipo_produto` ADD UNIQUE KEY `idx_categoria_tipo` (`categoria_produto_id`, `tipo_produto_id`);

-- Chave Composta para N:N de Produto/Integracao (Impede duplicação)
ALTER TABLE `produto_integracao` ADD UNIQUE KEY `idx_produto_integracao` (`produto_id`, `integracao_id`);

