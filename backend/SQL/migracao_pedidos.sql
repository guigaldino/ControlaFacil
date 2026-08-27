-- =================================================================================
-- SCRIPT DE MIGRAÇÃO - AJUSTE DA ESTRUTURA DE PEDIDOS E ITENS (MERCADO LIVRE WEBHOOKS)
-- =================================================================================
-- AVISO: Se a sua tabela 'pedido' já contiver registros de teste, limpe-a antes de 
-- executar esta migração para evitar erros de restrição NOT NULL:
-- TRUNCATE TABLE item_pedido;
-- DELETE FROM pedido;
-- =================================================================================

-- =================================================================================
-- 1. AJUSTES NA TABELA: item_pedido
-- =================================================================================

-- Remover a FK restritiva fk_itempedido_produto para poder alterar a coluna produto_id
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_itempedido_produto')
BEGIN
    ALTER TABLE item_pedido DROP CONSTRAINT fk_itempedido_produto;
    PRINT 'FK fk_itempedido_produto removida temporariamente.';
END
GO

-- Alterar a coluna produto_id para aceitar NULL (permitindo importar pedidos com itens não cadastrados localmente)
ALTER TABLE item_pedido ALTER COLUMN produto_id INT NULL;
PRINT 'Coluna produto_id alterada para aceitar NULL.';
GO

-- Adicionar novamente a FK associada ao produto
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_itempedido_produto')
BEGIN
    ALTER TABLE item_pedido ADD CONSTRAINT fk_itempedido_produto FOREIGN KEY (produto_id) REFERENCES produto(id);
    PRINT 'FK fk_itempedido_produto recriada.';
END
GO

-- Adicionar novas colunas em PT-BR para rastrear os detalhes do item vendido no Mercado Livre
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('item_pedido') AND name = 'id_item_ml')
BEGIN
    ALTER TABLE item_pedido ADD id_item_ml VARCHAR(50) NOT NULL;
    PRINT 'Coluna id_item_ml adicionada em item_pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('item_pedido') AND name = 'titulo_item')
BEGIN
    ALTER TABLE item_pedido ADD titulo_item VARCHAR(255) NOT NULL;
    PRINT 'Coluna titulo_item adicionada em item_pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('item_pedido') AND name = 'tarifa_venda')
BEGIN
    ALTER TABLE item_pedido ADD tarifa_venda DECIMAL(10,2) NULL;
    PRINT 'Coluna tarifa_venda adicionada em item_pedido.';
END
GO

-- =================================================================================
-- 2. AJUSTES NA TABELA: pedido (Multitenancy e Comprador)
-- =================================================================================

-- Adicionar colunas obrigatórias de Tenant (usuario_id e integracao_id)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'usuario_id')
BEGIN
    ALTER TABLE pedido ADD usuario_id INT NOT NULL;
    PRINT 'Coluna usuario_id adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'integracao_id')
BEGIN
    ALTER TABLE pedido ADD integracao_id INT NOT NULL;
    PRINT 'Coluna integracao_id adicionada em pedido.';
END
GO

-- Adicionar chaves estrangeiras para garantir a integridade dos dados e isolamento
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_pedido_usuarios')
BEGIN
    ALTER TABLE pedido ADD CONSTRAINT fk_pedido_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
    PRINT 'FK fk_pedido_usuarios criada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_pedido_integracoes')
BEGIN
    ALTER TABLE pedido ADD CONSTRAINT fk_pedido_integracoes FOREIGN KEY (integracao_id) REFERENCES integracoes(id);
    PRINT 'FK fk_pedido_integracoes criada em pedido.';
END
GO

-- Adicionar campos de comprador, envio e pagamento em PT-BR
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'id_comprador_ml')
BEGIN
    ALTER TABLE pedido ADD id_comprador_ml VARCHAR(50) NULL;
    PRINT 'Coluna id_comprador_ml adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'apelido_comprador')
BEGIN
    ALTER TABLE pedido ADD apelido_comprador VARCHAR(150) NULL;
    PRINT 'Coluna apelido_comprador adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'nome_completo_comprador')
BEGIN
    ALTER TABLE pedido ADD nome_completo_comprador VARCHAR(255) NULL;
    PRINT 'Coluna nome_completo_comprador adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'id_envio_ml')
BEGIN
    ALTER TABLE pedido ADD id_envio_ml VARCHAR(50) NULL;
    PRINT 'Coluna id_envio_ml adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'forma_pagamento')
BEGIN
    ALTER TABLE pedido ADD forma_pagamento VARCHAR(50) NULL;
    PRINT 'Coluna forma_pagamento adicionada em pedido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pedido') AND name = 'metodo_pagamento')
BEGIN
    ALTER TABLE pedido ADD metodo_pagamento VARCHAR(50) NULL;
    PRINT 'Coluna metodo_pagamento adicionada em pedido.';
END
GO

PRINT 'Migração concluída com sucesso!';
