const integracaoStatus = Object.freeze({
    EXCLUIDO: 0,
    ATIVO: 1,
    PENDENTE: 2,
    INATIVO: 3
});

const marketplaces = Object.freeze({
    MERCADO_LIVRE: 1,
});

const produtoStatus = Object.freeze({
  ATIVO: 0,
  INATIVO: 1,
  EXCLUIDO: 2
});

const tipoMovimentacaoEstoque = Object.freeze({
  ENTRADA: 1,
  SAIDA:2
})

const condicaoProduto = Object.freeze({
  NOVO: "new",
  USADO: "used",
  RECONDICIONADO: "refurbished",
  NAO_ESPECIFICADO: "not_specified"
})

const mapStatusProdutoML = Object.freeze({
  [produtoStatus.ATIVO]: "active",
  [produtoStatus.INATIVO]: "paused",
  [produtoStatus.EXCLUIDO]: "closed"
})

module.exports = { 
  integracaoStatus, 
  marketplaces, 
  produtoStatus, 
  tipoMovimentacaoEstoque, 
  condicaoProduto,
  mapStatusProdutoML
};