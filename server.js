const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Method", 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
})


const port = process.env.PORT || 3000;

// Configuração do MySQL
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

app.use(bodyParser.json());

// Rota para autenticação de login
app.post('/login', (req, res) => {
  const { caff, frafemcod } = req.body;

  connection.query(
    'SELECT * FROM frafem WHERE caff = ? AND frafemcod = ?',
    [caff, frafemcod],
    (error, results) => {
      if (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ success: false });
        return;
      }

      if (results.length > 0) {
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false });
      }
    }
  );
});

// Rota para obter informações do usuário
app.get('/user/:caff', (req, res) => {
  const { caff } = req.params;
  const query = `SELECT * FROM frafem FRA, fraternidades FRAT, lojas LOJ WHERE FRA.FRAFEMCOD = FRAT.IDFRATERNIDADES AND FRAT.LOJCOD = LOJ.LOJCOD AND FRA.CAFF = '${caff}'`;

  connection.query(query, (err, result) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
      return;
    }
    if (result.length > 0) {
      res.status(200).json({ success: true, user: result[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});