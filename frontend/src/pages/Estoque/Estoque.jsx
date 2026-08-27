import React, { useState } from "react";
import { ControleEstoque } from "../../components/ControleEstoque";
import { Categorias } from "../../components/Categorias";
import { HistoricoMovimentacao } from "../../components/HistoricoMovimentacao";
import styles from "./Estoque.module.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function Estoque() {
  const [activeTab, setActiveTab] = useState('estoque');

  return (
    <main className={styles.container}>
      <h1 className={styles.pageTitle}>Gerenciamento de Estoque</h1>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'estoque' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('estoque')}
        >
          Controle de Estoque
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'categorias' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categorias')}
        >
          Categorias
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'historico' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          Histórico de Movimentação
        </button>
      </div>

      {activeTab === 'estoque' && <ControleEstoque />}
      {activeTab === 'categorias' && <Categorias />}
      {activeTab === 'historico' && <HistoricoMovimentacao />}
      <ToastContainer autoClose={3000} />
    </main>
  );
}
