const express = require('express');
const app = express();
const data = require('./teste_dados.js');
const port = process.env.PORT || 6000;
var request = require("request");
const bodyParser = require("body-parser");
const fs = require("file-system");
const httpclient = require("http-client");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

//Importantes!!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(port, function () {
    console.log("Rodando na porta:", port);
});

app.get('/', function (req, res) {
    res.send("funcionou!!");
    res.status(200).json("funcionou!");
});


//Importantes!

// Exemplos abaixo!!
/*app.get('/stock/:itemid/:qtd', function (req, res) {

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
});*/


app.get('/item/:itemid', function (req, res) {
    let id = req.params.itemid;
    console.log("ID que veio do parametro: " + id);
    //let item = data.find(i => i.item == id);
    console.log("Data que veio: "+data.item);

   /* if (item != null) {
        res.status(200).json({ "Descrição:": item.description, "Valor:": item.value });
    } else {
        res.status(401).json("Não foi encontrado nada desse tipo de produto!!");
    }*/

});

/*
app.post("/stock/:itemid", function (req, res) {
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
});*/
// Exemplos acima!!
