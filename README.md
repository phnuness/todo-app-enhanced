# ToDo Enhanced

Aplicação ToDo simples (Node.js + Express + SQLite) com prioridade e data de vencimento.

## Como executar localmente

1. Backend:
```bash
cd backend
npm install
npm run dev   # ou npm start
```

2. Frontend:
- O backend serve o frontend quando o servidor é iniciado (em `server.js` a pasta `../frontend` foi exposta).
- Abra `http://localhost:3000` no navegador.

## Deploy
- Para deploy em Render/Heroku, configure o build para executar `npm install` e `npm start` dentro da pasta `backend`. Ajuste o caminho do arquivo sqlite conforme a plataforma.

## Licença
MIT
