// O integracaoController é responsável por gerenciar as operações relacionadas a integrações, como inserção, atualização e exclusão de dados.

const categoriaProdutoModel = require("./categoriaProdutoModel");
const mlService = require("../integracoes/mercadoLivreServices");
const memoryCache = require("../../utils/memoryCache");

const categoriaProdutoController = {
    async inserirCategoriaProduto(req, res) {
        try {
            const { nome, descricao } = req.body;
            const usuarioId = req.usuario.id;

            if(!nome){
                return res.status(400).json({
                    error: "'Nome' da categoria é obrigatório!",
                    sucesso: false,
                });
            }

            const novaCategoria = await categoriaProdutoModel.inserir({ 
                nome, 
                descricao: descricao || null, 
                usuario_criador_id: usuarioId
            });

            return res.status(201).json({
                message: "Categoria de produto inserida com sucesso!",
                categoria: novaCategoria,
                sucesso: true,
            });

        } catch (error) {
            console.error("Erro ao inserir categoria de produto:", error);
            return res.status(500).json({
                error: "Erro ao inserir categoria de produto",
                sucesso: false,
            });
        }
    },

    async listarCategoriasProduto(req, res) {
        try {
            const categorias = await categoriaProdutoModel.listarTodas();
            return res.status(200).json({
                message: "Categorias de produto listadas com sucesso!",
                categorias: categorias,
                sucesso: true,
            });
        } catch (error) {
            console.error("Erro ao listar categorias de produto:", error);
            return res.status(500).json({
                error: "Erro ao listar categorias de produto",
                sucesso: false,
            });
        }
    },

    async atualizarCategoriaProduto(req, res) {
        try {
            const { id, nome, descricao } = req.body;

            if(!id) {
                return res.status(400).json({
                    error: "'id' da categoria é obrigatório!",
                    sucesso: false,
                });
            }

            if(!nome){
                return res.status(400).json({
                    error: "'Nome' da categoria é obrigatório!",
                    sucesso: false,
                });
            }

            const categoriaAtualizada = await categoriaProdutoModel.atualizar({ 
                id,
                nome, 
                descricao: descricao || null
            });

            return res.status(200).json({
                message: "Categoria de produto atualizada com sucesso!",
                categoria: categoriaAtualizada,
                sucesso: true,
            });

        } catch (error) {
            console.error("Erro ao atualizar categoria de produto:", error);
            return res.status(500).json({
                error: "Erro ao atualizar categoria de produto",
                sucesso: false,
            });
        }
    },

    async excluirCategoriaProduto(req, res) {
        try {
            const { id } = req.params;

            if(!id) {
                return res.status(400).json({
                    error: "'id' da categoria é obrigatório!",
                    sucesso: false,
                });
            }

            await categoriaProdutoModel.excluir(id);

            return res.status(200).json({
                message: "Categoria de produto excluída com sucesso!",
                sucesso: true,
            });

        } catch (error) {
            console.error("Erro ao excluir categoria de produto:", error);
            return res.status(500).json({
                error: "Erro ao excluir categoria de produto",
                sucesso: false,
            });
        }
    },

    async buscarSugestaoCategorias(req, res) {
        try {
            const { integracaoId, titulo } = req.body;

            if(!integracaoId) {
                return res.status(400).json({
                    error: "'integracaoId' é obrigatório!",
                    sucesso: false,
                });
            }

            if(!titulo) {
                return res.status(400).json({
                    error: "'titulo' do produto é obrigatório!",
                    sucesso: false,
                });
            }

            const sugestoes = await mlService.getSugestaoCategorias(integracaoId, titulo);

            return res.status(200).json({
                message: "Sugestões de categorias encontradas com sucesso!",
                sugestoes: sugestoes,
                sucesso: true,
            });
        } catch (error) {
            console.error("Erro ao buscar sugestões de categorias:", error);
            return res.status(500).json({
                error: "Erro ao buscar sugestões de categorias",
                sucesso: false,
            });
        }
    },

    async obterAtributosCategoria(req, res) {
        try {
            const integracaoId = req.query.integracaoId || req.body.integracaoId;
            const ml_categoriaId = req.query.ml_categoriaId || req.body.ml_categoriaId;

            if (!integracaoId) {
                return res.status(400).json({
                    error: "'integracaoId' é obrigatório!",
                    sucesso: false,
                });
            }

            if (!ml_categoriaId) {
                return res.status(400).json({
                    error: "'ml_categoriaId' é obrigatório!",
                    sucesso: false,
                });
            }

            const cacheKey = `attrs_${ml_categoriaId}`;
            const cachedData = memoryCache.get(cacheKey);
            if (cachedData) {
                return res.status(200).json({
                    message: "Atributos da categoria recuperados com sucesso (cache)!",
                    dados: cachedData,
                    sucesso: true,
                });
            }

            const rawAttributes = await mlService.getAtributosCategorias(integracaoId, ml_categoriaId);

            const cleanAttributes = (rawAttributes || [])
                .filter(attr => {
                    const isHidden = attr.tags && attr.tags.hidden === true;
                    const isReadOnly = attr.tags && attr.tags.read_only === true;
                    return !isHidden && !isReadOnly;
                })
                .map(attr => {
                    const required = !!(attr.tags && (attr.tags.required || attr.tags.catalog_required));

                    let fieldType = "text";
                    const valueType = attr.value_type;
                    const hasValues = Array.isArray(attr.values) && attr.values.length > 0;

                    if (valueType === "string") {
                        fieldType = hasValues ? "select" : "text";
                    } else if (valueType === "list") {
                        fieldType = "select";
                    } else if (valueType === "boolean") {
                        fieldType = "boolean";
                    } else if (valueType === "number") {
                        fieldType = "number";
                    } else if (valueType === "number_unit") {
                        fieldType = "number_unit";
                    } else if (valueType === "picture_id") {
                        fieldType = "file";
                    }

                    let options = null;
                    if ((fieldType === "select" || fieldType === "boolean") && hasValues) {
                        options = attr.values.map(v => ({
                            value: String(v.id),
                            label: v.name
                        }));
                    }

                    let allowedUnits = null;
                    if (Array.isArray(attr.allowed_units) && attr.allowed_units.length > 0) {
                        allowedUnits = attr.allowed_units.map(unit => unit.id);
                    }

                    const defaultUnit = attr.default_unit || null;

                    return {
                        id: attr.id,
                        label: attr.name,
                        fieldType,
                        required,
                        placeholder: attr.hint || null,
                        groupId: attr.attribute_group_id || "OTHERS",
                        groupLabel: attr.attribute_group_name || "Outros",
                        options,
                        allowedUnits,
                        defaultUnit
                    };
                });

            const responseData = {
                category_id: ml_categoriaId,
                attributes: cleanAttributes
            };

            memoryCache.set(cacheKey, responseData);

            return res.status(200).json({
                message: "Atributos da categoria recuperados com sucesso!",
                dados: responseData,
                sucesso: true,
            });

        } catch (error) {
            console.error("Erro ao obter atributos da categoria:", error);
            return res.status(500).json({
                error: error.message || "Erro ao obter atributos da categoria",
                sucesso: false,
            });
        }
    }
}

module.exports = categoriaProdutoController;