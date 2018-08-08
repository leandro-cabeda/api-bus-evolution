const express = require('express');
const app = express();
const data = require('./teste_dados.json');
const port = process.env.PORT || 6000;
var request = require("request");
const bodyParser = require("body-parser");
const fs = require("fs");
const httpclient = require("http-client");
const path = require("path");
//const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

//Importantes inicio!!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(port, function () {
    console.log("Rodando na porta:", port);
});

app.get('/', function (req, res) {
    res.json("funcionou!!");
    
});


//Importantes fim!


// Exemplos inicio!!
const redirectPath = "/api/auth";
// Função de decodificação do login e senha
function decodAuth(authorization) {
    if (authorization === undefined) return [undefined, undefined]
    return new Buffer(authorization.split(' ')[1], 'base64').toString().split(':');
};

app.get('/buscalinhas', function (req, res) {
    res.send(data);
});

pp.get('/api/auth', function (req, res) {
    // Decodifica o valor de authorization, passado no header da requisição
    let [username, password] = decodAuth(req.headers.authorization);

        // Compara os valores de usuário e senha enviados com o objeto em memória
        if (username === "leandro" && password === "963852741Lcr30") {
            // Se o login e senha estiverem corretos gera o token com um tempo de vida de 1 hora
            let token = jwt.sign({
                login: "leandro"
            }, secret,
                { expiresIn: 60 * 60 });
            // Responde com o status de logado como verdadeiro e o token gerado
            res.status(200).json({
                loged: true,
                jwt: token
            })
        } else {
            // Se não o login e senha não estiverem corretos seta o cabeçalho da resposta exigindo autenticação
            res.set('WWW-Authenticate', 'Basic realm="401"');
            // devolve o status de loged como falso
            res.status(401).json({ loged: false, redirect: redirectPath });
        }
    
});

app.post('/api/token', function (req, res) {
    // Recebe o token JWT pelo cabeçalho na chave autorization
    let token = req.headers.authorization;
    // Caso o token tenha valor
    if (token) {
        // remove a string "bearer"
        token = req.headers.authorization.split(' ')[1];
        // Usa a lib jwt para verificar a autenticidade do token
        jwt.verify(token, secret, function (err, decoded) {
            // Em caso de erro
            if (err) {
                // Responde que o usuário não está logado e informa o path para onde ele deve ir para se autenticar
                res.status(401).json({ loged: false, redirect: redirectPath });
            } else {
                // Caso não haja problemas é porque o token é válido
                // Adiciona o valor "loged" como verdadeiro
                decoded.loged = true;
                // devolve o payload do token para o requisitante
                res.status(200).json(decoded);
            }
        });
        // Caso não venha nada no header autorization
    } else {
        // Exige a autenticação do usuário
        res.set('WWW-Authenticate', 'Bearer realm="401"');
        // Envia o status de loged como falso e o endereço onde ele se autentica
        res.status(401).json({ loged: false, redirect: redirectPath });
    }
});

app.get('/stock/:itemid/:qtd', verifyToken, function (req, res) {

    let id = req.params.itemid;
    var qtdEstoque = req.params.qtd;

    let item = data.find(i => i.item == id);
    console.log(item.stock);
    console.log(qtdEstoque);
    if (item.stock > qtdEstoque && item != null) {
        res.status(200).json("Quantidade Disponível");
    } else {
        res.status(401).json("Quantidade Indisponível");
    }
});


app.get('/item/:itemid', function (req, res) {
    let id = req.params.itemid;
    console.log("ID que veio do parametro: " + id);
    let item = data.find(i => i.item == id);

   if (item != null) {
        res.status(200).json({ "Descrição:": item.description, "Valor:": item.value });
    } else {
        res.status(401).json("Não foi encontrado nada desse tipo de produto!!");
    }

});


app.post("/stock/:itemid", verifyToken, function (req, res) {
    var id = req.params.itemid;
    var quantidade = parseInt(req.body.quantidade);
    var lista = data;
    var item = lista.find(i => i.item == id);
    if (parseInt(item.stock) + quantidade < 0) {
        res.status(200).json("ESTOQUE INSUFICIENTE");
    } else {
        var x = 0;
        while (x <= lista.length - 1) {
            if (lista[x].item == id) {
                lista[x].stock += quantidade;
                res.status(200).json(lista[x]);
                fs.writeFile("./teste_dados.js", JSON.stringify(lista));
            }
            x++;
        }

    }
});

function verifyToken(req, res, next) {
    let auth = req.headers.authorization;
    if (auth) {
        auth = auth.split(' ')[1];
        let options = {
            method: 'POST',
            url: 'https://api-bus-evolution.herokuapp.com:80/api/token',
            headers:
                { Authorization: 'Bearer ' + auth }
        }
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            if (body.loged) {
                req.payload = body;
            }
            next();
        })
    } else {
        next();
    }
};
// Exemplos fim!!
