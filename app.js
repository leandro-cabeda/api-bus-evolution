const express = require('express');
const app = express();
const data = require('./teste_dados.json');
const port = process.env.PORT || 6000;
var request = require("request");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const httpclient = require("http-client");
const path = require("path");
//const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const redirectPath = "/api/auth";
const https = require('https');


// Teste Inicio
const extractIpParameter = () =>
    process.argv[2] ? process.argv[2] : 'localhost';

const ip = extractIpParameter();
app.set('ip', ip);

const usuario = {
    "id": 1,
    "nome": "leandro cabeda",
    "email":"leandro.cabeda@hotmail.com",
    "senha": "12345"
};

const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic MGJlOGMxZGEtMDY3Ni00NWY3LWI0ZjYtMjRjMjYzMzhmZmEz"
};

const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
};

const message = {
    app_id: "e53f5d24-40e4-458f-99db-5230cf3f8bc0",
    headings: { "en": "Leandro" },
    contents: { "en": "Registro confirmado!" },
};

const req = https.request(options, function (res) {
    res.on('data', function (data) {
        //console.log("Response:");
        //console.log(JSON.parse(data));
    });
});

req.on('error', function (e) {
    console.log("ERROR:");
    console.log(e);
});

req.write(JSON.stringify(message));
req.end();

app.post('/api/login', (req, res) => {
    let usuarioLogin = req.body;

    if (usuarioLogin.email == usuario.email
        && usuarioLogin.senha == usuario.senha) {

        res.json(usuario);
    } else {
        res.status(403).end();
    }
});

// Teste Fim!

//Importantes inicio!!
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(port, function () {
    console.log(`Servidor rodando em http://${ip}:`+port);
});

app.get('/', function (req, res, next) {
    console.log("Deu certo o inicio!");
    res.status(200).json("funcionou!!");
    
});

const v=[
    {
        "linha":"VERACRUZ SAOCRISTOVAO"
    },
    {
        "linha": "UPFUNIVERSIDADEUPF VILALUIZA"
    },
    {
        "linha": "JERONIMOCOELHO UPFUNIVERSIDADEUPF"
    }
]
app.get('/api/buscalinhas', function (req, res, next) {
    console.log("Deu certo a busca de linhas!");
    //res.status(200).json(data);
    res.status(200).json(v);
});

app.get('/api/buscalinhas/:linha', function (req, res, next) {
    console.log("Deu certo a busca pela linha pedida!");
    var acentos = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g
    };

    
    let linha = req.params.linha.toLocaleUpperCase();

    while (linha.indexOf(" ") != -1)
    {
        linha = linha.replace(" ", "");
    }


    for (let i in acentos) {
       
        linha = linha.replace(acentos[i],i);
    }
  
    console.log("Linha que veio do parametro: " + linha);

    let bus = data.filter(i => i.linha.includes(linha));
    //let bus = JSON.stringify(data.find(i => i.linha.includes(linha)));
    

    if (bus != null && bus != undefined && bus !="") {
        res.status(200).json(bus);
    } else {
        res.status(401).json("Não foi encontrado nenhuma linha com esse nome!!");
    }

});


//Importantes fim!


// Exemplos inicio!!

// Função de decodificação do login e senha
function decodAuth(authorization) {
    if (authorization === undefined) return [undefined, undefined]
    console.log("Valor que veio da autorização:  "+authorization);
    return new Buffer(authorization.split(' ')[1], 'base64').toString().split(':');
};

app.get('/api/auth', function (req, res) {
    // Decodifica o valor de authorization, passado no header da requisição
    console.log("Valor da req Get:  " + req.headers.authorization);
    let [username, password] = decodAuth(req.headers.authorization);

    console.log("Valor do username que veio:  " + username);
    console.log("Valor do password que veio:  " + password);

        // Compara os valores de usuário e senha enviados com o objeto em memória
        if (username === "leandro" && password === "123456") {
            // Se o login e senha estiverem corretos gera o token com um tempo de vida de 1 hora
            let token = jwt.sign({
                login: username,
            }, secret,
                { expiresIn: 60 * 60 });
            // Responde com o status de logado como verdadeiro e o token gerado
            res.status(200).json({
                loged: true,
                jwt: token
            });
        } else {
            // Se não o login e senha não estiverem corretos seta o cabeçalho da resposta exigindo autenticação
            res.set('WWW-Authenticate', 'Basic realm="401"');
            // devolve o status de loged como falso
            res.status(401).json({ loged: false, redirect: redirectPath });
        }
    
});

app.post('/api/token', function (req, res) {
    // Recebe o token JWT pelo cabeçalho na chave autorization
    console.log("Valor da req Post:  "+req.headers.authorization);
    let token = req.headers.authorization;
    // Caso o token tenha valor
    if (token) {
        // remove a string "bearer"
        token = req.headers.authorization.split(' ')[1];
        console.log("Valor do token:  "+token);
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
                fs.writeFile("./produtos_dados.js", JSON.stringify(lista));
            }
            x++;
        }

    }
});

function verifyToken(req, res, next) {
    console.log("Valor da função verifyToken da req autorização:  " + req.headers.authorization);
    let auth = req.headers.authorization;
    if (auth) {
        auth = auth.split(' ')[1];
        console.log("Valor do auth função verifyToken:  " + auth);
        let options = {
            method: 'POST',
            url: 'https://api-bus-evolution.herokuapp.com:80/api/token',
            headers:
                { Authorization: 'Bearer ' + auth }
        }
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            console.log("Valor do Body:  "+body);
            if (body.loged) {
                req.payload = body;
                console.log("Valor do req.payload do body, função verifyToken:  " + req.payload);
            }
            next();
        })
    } else {
        next();
    }
};
// Exemplos fim!!
