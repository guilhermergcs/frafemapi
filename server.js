const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
app.use(cors());
const port = 3000;

// Configuração do MySQL
const connection = mysql.createConnection({
  host: '10.20.1.46',
  user: 'gob_frafem',
  password: 'ppLt2J[xZKb!YhYB',
  database: 'gob_app_frafem',
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