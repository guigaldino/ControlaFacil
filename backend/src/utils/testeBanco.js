const { poolConnect, pool, sql } = require('../config/db');

async function verificarBancoConectado() {
    try {
        await poolConnect;

        const result = await pool.request()
            .query('SELECT DB_NAME() AS nomeBanco');

        console.log('Banco de dados conectado:', result.recordset[0].nomeBanco);
    } catch (error) {
        console.error('Erro ao verificar banco de dados:', error);
    }
}

verificarBancoConectado();
