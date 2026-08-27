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

function processFile(filePath, isPage) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix css imports
  content = content.replace(/(\.\/style\/)([^'"`]+)/g, './$2');

  components.forEach(c => {
    const regex = new RegExp(`(['"\`])\\.\\/${c}(['"\`])`, 'g');
    if (isPage) {
      content = content.replace(regex, `$1../../components/${c}$2`);
    } else {
      content = content.replace(regex, `$1../${c}$2`);
    }
  });

  pages.forEach(p => {
    const regex = new RegExp(`(['"\`])\\.\\/${p}(['"\`])`, 'g');
    if (isPage) {
      content = content.replace(regex, `$1../${p}$2`);
    } else {
      content = content.replace(regex, `$1../../pages/${p}$2`);
    }
  });

  fs.writeFileSync(filePath, content);
}

pages.forEach(p => {
  const file = path.join(pagesDir, p, p + '.jsx');
  if (fs.existsSync(file)) {
    processFile(file, true);
  }
});

components.forEach(c => {
  const file = path.join(compDir, c, c + '.jsx');
  if (fs.existsSync(file)) {
    processFile(file, false);
  }
});

console.log('Imports updated');
