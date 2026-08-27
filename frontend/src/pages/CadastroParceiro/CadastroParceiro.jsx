import React, { useState } from 'react';
import styles from "./CadastroParceiro.module.css";

// ------------------------------------
// FUNÇÕES DE MÁSCARA (REGEX)
// ------------------------------------

// Máscara para CNPJ: 00.000.000/0000-00
const maskCnpj = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    const limitedValue = cleanValue.substring(0, 14);

    return limitedValue.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
};

// Máscara para Telefone: (00) 0000-0000 ou (00) 00000-0000
const maskTelefone = (value) => {
    const cleanValue = value.replace(/\D/g, "");
    const limitedValue = cleanValue.substring(0, 11);

    if (limitedValue.length <= 10) {
        return limitedValue.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );
    } else {
        return limitedValue.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );
    }
};


export function CadastroParceiro() {
    const [form, setForm] = useState({
        razaoSocial: '',
        cnpj: '',
        nomeParceiro: '',
        tipoParceiro: '',
        email: '',
        telefone: '',
        endereco: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Aplica as máscaras
        switch (name) {
            case "cnpj":
                newValue = maskCnpj(value);
                break;
            case "telefone":
                newValue = maskTelefone(value);
                break;
            default:
                break;
        }

        setForm(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Exemplo de validação final (se 14 dígitos não foram alcançados, é inválido)
        if (form.cnpj.replace(/\D/g, "").length !== 14) {
            console.error("CNPJ inválido ou incompleto.");
            // toast.error("CNPJ inválido ou incompleto.");
            return;
        }
        
        console.log("Parceiro cadastrado com valores limpos (simulação):", {
            ...form,
            cnpj: form.cnpj.replace(/\D/g, ""), // Envia CNPJ limpo para a API
            telefone: form.telefone.replace(/\D/g, "") // Envia Telefone limpo para a API
        });
        // Implementar lógica de API...
    };

    return (
        <main className={styles.container}>
            <div className={styles.formSection}>
                <h1 className={styles.pageTitle}>Cadastro de Novo Parceiro</h1>
                <form onSubmit={handleSubmit}>
                    
                    {/* Linha 1: Razão Social */}
                    <div className={styles.formGroup}>
                        <label htmlFor="razaoSocial">Razão Social*</label>
                        <input
                            type="text"
                            id="razaoSocial"
                            name="razaoSocial"
                            value={form.razaoSocial}
                            onChange={handleChange}
                            required
                            placeholder="Nome legal da empresa"
                        />
                    </div>

                    {/* Linha 2: CNPJ */}
                    <div className={styles.formGroup}>
                        <label htmlFor="cnpj">CNPJ*</label>
                        <input
                            type="text"
                            id="cnpj"
                            name="cnpj"
                            value={form.cnpj}
                            onChange={handleChange}
                            required
                            placeholder="00.000.000/0000-00"
                            maxLength={18} // Limita o input formatado
                        />
                    </div>

                    {/* Linha 3: Nome Fantasia */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nomeParceiro">Nome Fantasia (Opcional)</label>
                        <input
                            type="text"
                            id="nomeParceiro"
                            name="nomeParceiro"
                            value={form.nomeParceiro}
                            onChange={handleChange}
                            placeholder="Nome comercial ou de fachada"
                        />
                    </div>

                    {/* Linha 4: Tipo de Parceiro */}
                    <div className={styles.formGroup}>
                        <label htmlFor="tipoParceiro">Tipo de Parceiro*</label>
                        <select
                            id="tipoParceiro"
                            name="tipoParceiro"
                            value={form.tipoParceiro}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Selecione o tipo</option>
                            <option value="fornecedor">Fornecedor</option>
                            <option value="transportadora">Transportadora</option>
                        </select>
                    </div>

                    {/* Linha 5: Email */}
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email (Opcional)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="contato@parceiro.com"
                        />
                    </div>

                    {/* Linha 6: Telefone */}
                    <div className={styles.formGroup}>
                        <label htmlFor="telefone">Telefone (Opcional)</label>
                        <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            value={form.telefone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            maxLength={15} // Limita o input formatado
                        />
                    </div>
                    
                    {/* Linha 7: Endereço */}
                    <div className={styles.formGroup}>
                        <label htmlFor="endereco">Endereço Completo (Opcional)</label>
                        <textarea
                            id="endereco"
                            name="endereco"
                            value={form.endereco}
                            onChange={handleChange}
                            placeholder="Rua, Número, Bairro, Cidade, Estado"
                            rows="3"
                        />
                    </div>

                    <button type="submit" className={styles.actionBtn}>
                        Cadastrar Parceiro
                    </button>
                </form>
            </div>
        </main>
    );
}