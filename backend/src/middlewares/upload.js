const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Lógica de Pasta de Destino: Caso o ambiente seja de produção, utiliza o caminho especificado
// por process.env.UPLOAD_DIR ou fallback seguro. Se for desenvolvimento, armazene na pasta local uploads.
let uploadFolder;
if (process.env.NODE_ENV === 'production') {
  uploadFolder = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
} else {
  uploadFolder = path.join(__dirname, '../../uploads');
}

// Certifique-se de que a pasta seja criada automaticamente se não existir (fs.mkdirSync recursivo).
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configuração de Armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // Salva cada arquivo com um nome único combinando o timestamp atual (Date.now()), um sufixo aleatório e a extensão original do arquivo.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Filtro: Permita apenas mimetypes de imagem (image/*)
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

// Limite de Tamanho: Defina o limite máximo de 5MB por arquivo
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  upload,
  uploadFolder
};
