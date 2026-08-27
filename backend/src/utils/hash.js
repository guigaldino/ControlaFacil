const bcrypt = require('bcryptjs'); // Corrigido o nome

/**
 * Função para gerar um hash de uma senha
 * @param {string} senha - A senha em texto puro
 * @returns {Promise<string>} - Retorna a senha já em hash
 */

async function gerarHash(senha) {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
}

async function conferirHash(senha, senhaHash) {
    return await bcrypt.compare(senha, senhaHash);
}

module.exports = {
    gerarHash,
    conferirHash
};

// teste de funcionalidade
// async function teste() {
//     const senha = '1234';
//     const senhaHash = await gerarHash(senha);

//     console.log('Senha original:', senha);
//     console.log('Senha em hash:', senhaHash);


//     // Conferir
//     const conferirCorreto = await conferirHash(senha, senhaHash);
//     console.log('Conferir senha correta:', conferirCorreto); // Deve ser true

//     // Conferir incorreto
//     const senhaIncorreta = '12345';
//     const conferirIncorreto = await conferirHash(senhaIncorreta, senhaHash);
//     console.log('Conferir senha incorreta:', conferirIncorreto); // Deve ser false
// }

// teste()
//     .then(() => console.log('Teste concluído com sucesso'))
//     .catch(err => console.error('Erro no teste:', err));
