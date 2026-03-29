import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();

app.use(cookieParser());
app.use(session({
  secret: 'irmaoDoJorel',
  resave: false,
  saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let listaDeProdutos = [];

app.get('/login', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Login</title>
      <style>
        h1{text-align:center}
      </style>
    </head>
    <body>
      <h1>Login</h1>
      <form action="/login" method="POST">
        <label for="usuario">Usuário:</label>
        <input type="text" id="usuario" name="usuario" required><br><br>
        <button type="submit">Entrar</button>
      </form>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { usuario } = req.body;
  if (usuario) {
    req.session.usuario = usuario;
    res.cookie('ultimoAcesso', new Date().toISOString());
    res.redirect('/produtos');
  } else {
    res.send('O nome de usuário é obrigatório.');
  }
});

app.get('/produtos', (req, res) => {
  if (!req.session.usuario) {
    return res.send('Você precisa fazer login primeiro. <a href="/login">Ir para Login</a>');
  }

  const ultimoAcesso = req.cookies.ultimoAcesso || 'Nunca';

  let tabela = `
    <table border="1">
      <tr>
        <th>Código de Barras</th>
        <th>Descrição</th>
        <th>Preço de Custo</th>
        <th>Preço de Venda</th>
        <th>Data de Validade</th>
        <th>Quantidade em Estoque</th>
        <th>Fabricante</th>
      </tr>
  `;

  listaDeProdutos.forEach(produto => {
    tabela += `
      <tr>
        <td>${produto.codigoDeBarras}</td>
        <td>${produto.descricao}</td>
        <td>${produto.precoDeCusto}</td>
        <td>${produto.precoDeVenda}</td>
        <td>${produto.dataDeValidade}</td>
        <td>${produto.quantidadeEmEstoque}</td>
        <td>${produto.fabricante}</td>
      </tr>
    `;
  });

  tabela += `</table>`;

  res.send(`
    <html>
    <head><title>Cadastro de Produtos</title></head>
    <body>
      <h1>Cadastro de Produtos</h1>
      <p>Usuário logado: ${req.session.usuario}</p>
      <p>Último acesso: ${ultimoAcesso}</p>

      <form action="/produtos" method="POST">
        <label for="codigoDeBarras">Código de Barras:</label>
        <input type="text" id="codigoDeBarras" name="codigoDeBarras" required><br><br>

        <label for="descricao">Descrição:</label>
        <input type="text" id="descricao" name="descricao" required><br><br>

        <label for="precoDeCusto">Preço de Custo:</label>
        <input type="number" step="0.01" id="precoDeCusto" name="precoDeCusto" required><br><br>

        <label for="precoDeVenda">Preço de Venda:</label>
        <input type="number" step="0.01" id="precoDeVenda" name="precoDeVenda" required><br><br>

        <label for="dataDeValidade">Data de Validade:</label>
        <input type="date" id="dataDeValidade" name="dataDeValidade" required><br><br>

        <label for="quantidadeEmEstoque">Quantidade em Estoque:</label>
        <input type="number" id="quantidadeEmEstoque" name="quantidadeEmEstoque" required><br><br>

        <label for="fabricante">Fabricante:</label>
        <input type="text" id="fabricante" name="fabricante" required><br><br>

        <button type="submit">Cadastrar Produto</button>
      </form>

      <h2>Produtos Cadastrados</h2>
      ${tabela}

      <br><a href="/logout">Sair do Sistema</a>
    </body>
    </html>
  `);
});

app.post('/produtos', (req, res) => {
  if (!req.session.usuario) {
    return res.send('Você precisa fazer login primeiro. <a href="/login">Ir para Login</a>');
  }

  const { codigoDeBarras, descricao, precoDeCusto, precoDeVenda, dataDeValidade, quantidadeEmEstoque, fabricante } = req.body;

  listaDeProdutos.push({
    codigoDeBarras,
    descricao,
    precoDeCusto,
    precoDeVenda,
    dataDeValidade,
    quantidadeEmEstoque,
    fabricante
  });

  res.cookie('ultimoAcesso', new Date().toISOString());
  res.redirect('/produtos');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('ultimoAcesso');
  res.redirect('/login');
});

app.listen(3000, () => console.log("Servidor iniciado na porta 3000"));
