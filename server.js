const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // Remover query string
  let filePath = req.url.split('?')[0];
  
  // Se for raiz, redireciona para streamflix
  if (filePath === '/') {
    filePath = '/streamflix/index.html';
  }
  
  // Adicionar streamflix/ se não tiver
  if (!filePath.startsWith('/streamflix/')) {
    filePath = '/streamflix' + filePath;
  }
  
  // Caminho completo do arquivo
  filePath = path.join(__dirname, filePath);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.log(`[${timestamp}] ❌ 404: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Arquivo não encontrado</h1><p>' + filePath + '</p>', 'utf-8');
      } else {
        console.log(`[${timestamp}] ❌ ERRO: ${error.code}`);
        res.writeHead(500);
        res.end('Erro no servidor: ' + error.code, 'utf-8');
      }
    } else {
      console.log(`[${timestamp}] ✅ 200: ${path.basename(filePath)}`);
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  CineFlix Hub - Servidor Local');
  console.log('========================================');
  console.log('');
  console.log(`Servidor rodando em: http://localhost:${PORT}/`);
  console.log('');
  console.log('Acesse: http://localhost:8000/streamflix/');
  console.log('');
  console.log('Pressione Ctrl+C para parar o servidor');
  console.log('========================================');
});
