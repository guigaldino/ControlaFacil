📑 Manual de Operações do PM2 (Modo Administrador)
⚠️ Lembrete de Segurança: Execute sempre esses comandos em um terminal (PowerShell ou CMD) aberto como Administrador no Windows Server para evitar erros de permissão (EPERM).

1. Apenas atualização dos arquivos do server
Você usa este fluxo quando alterou a lógica do backend (arquivos da pasta src), mas a aplicação já existe e já está cadastrada no PM2.

PowerShell
# Passo 1: Entre na pasta do seu backend no servidor
cd C:\Sistemas\ControlaFacil\server

# Passo 2: Instale novas dependências (Rode APENAS se o arquivo 'package.json' mudou)
npm install --production

# Passo 3: Recarregue a aplicação na memória RAM de forma limpa
pm2 reload controla-facil-api
Por que o reload? Ao contrário do restart (que derruba o processo abruptamente), o reload inicia uma nova instância do seu código em paralelo e só mata a antiga quando a nova estiver pronta. Isso garante Zero Downtime (o sistema não fica fora do ar por nenhum milissegundo).

Como validar: Rode pm2 logs controla-facil-api --lines 20 logo em seguida para garantir que o código novo leu o arquivo .env corretamente e se conectou ao banco.

2. Excluir a aplicação do PM2
Você usa este fluxo quando quer fazer uma limpeza total, trocar o nome do processo, ou quando o sistema mudou de pasta e você precisa deletar o registro antigo para que o PM2 pare de monitorá-lo.

PowerShell
# Passo 1: Para a execução do código (o processo entra em 'stopped')
pm2 stop controla-facil-api

# Passo 2: Remove a aplicação da lista de monitoramento do PM2
pm2 delete controla-facil-api

# Passo 3: Limpa os arquivos de log antigos acumulados no HD (Opcional, mas recomendado)
pm2 flush controla-facil-api

# Passo 4: Salva a lista atual (vazia) para o Windows não tentar subir o app se reiniciar
pm2 save
O que acontece no servidor: O Node.js é encerrado e o PM2 "esquece" que o projeto existe. Os arquivos físicos na sua pasta C:\Sistemas\... continuam intactos, apenas o monitoramento é removido.

3. Criação da aplicação (Do zero)
Você usa este fluxo na primeira vez que instala o sistema no servidor ou logo após ter executado o passo de exclusão (situação 2).

PowerShell
# Passo 1: Entre obrigatoriamente na pasta raiz do seu backend
cd C:\Sistemas\ControlaFacil\server

# Passo 2: Registre e inicie a aplicação dando um nome exclusivo a ela
pm2 start src/server.js --name "controla-facil-api"

# Passo 3: Verifique se ela subiu com status 'online'
pm2 status

# Passo 4: Salva o processo no sistema operacional
pm2 save
A importância do cd no Passo 1: Você precisa estar na pasta raiz para que o PM2 entenda o caminho relativo src/server.js e consiga mapear onde o arquivo .env está escondido.

O que faz o pm2 save? Ele salva o estado atual do PM2 em um arquivo de configuração oculto. Se o Windows Server for reiniciado para uma atualização da Microsoft, o PM2 usará esse arquivo salvo para ligar o backend do Controla Fácil automaticamente, sem você precisar logar no servidor para isso.