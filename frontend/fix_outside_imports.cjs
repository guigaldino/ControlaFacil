const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');
const compDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

const pages = [
  'Cadastro', 'CadastroParceiro', 'CadastroProduto', 'DashBoardEstoque', 
  'EmailConfirmation', 'EmailValidado', 'EmailValidationFailed', 'Estoque', 
  'HomeU', 'LoginU', 'MarketplaceAuthError', 'MarketplaceAuthSuccess', 
  'MarketplaceCallback', 'MarketplaceIntegrations', 'MeusDados', 'Pedidos', 
  'Relatorios'
];
const components = [
  'Categorias', 'ControleEstoque', 'HeaderU', 'Loading', 
  'ModalCategoria', 'ModalConfirmacao', 'ModalProdutos', 'UserMenu'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix api, assets, utils imports that were ../ before.
  // We look for 'from "../api"' and replace with 'from "../../api"'
  content = content.replace(/(['"`])\.\.\/(api|assets|utils)(['"`\\/])/g, '$1../../$2$3');

  fs.writeFileSync(filePath, content);
}

pages.forEach(p => {
  const file = path.join(pagesDir, p, p + '.jsx');
  if (fs.existsSync(file)) {
    processFile(file);
  }
});

components.forEach(c => {
  const file = path.join(compDir, c, c + '.jsx');
  if (fs.existsSync(file)) {
    processFile(file);
  }
});

console.log('Outside imports updated');
