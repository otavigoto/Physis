const bodyParser = require('body-parser');
const express = require('express'); //Importando express
const app = express(); // Iniciando express
const mysql = require('mysql2'); // Importando mysql
const session = require('express-session'); // Importando express-session

app.set('view engine', 'ejs'); // Definindo o motor de visualização como EJS
app.use(express.static('public')); // Definindo a pasta public como estática
app.use(bodyParser.urlencoded({ extended: false })); // Configurando o body-parser para receber dados do formulário
app.use(bodyParser.json()); // Configurando o body-parser para receber dados em JSON
app.use(session({ // Configurando o express-session para gerenciar sessões
    secret: 'shhhh', // Segredo para assinar o cookie da sessão
    resave: true, // Não resalvar a sessão se não houver alterações 
    saveUninitialized: false, // Não salvar sessões não inicializadas
}));


const db = mysql.createConnection({ // Criando a conexão com o banco de dados
    host: 'localhost', // Endereço do banco de dados
    user: 'root', // Usuário do banco de dados
    password: 'otavio2912', // Senha do banco de dados
    port: 3306, // Porta do banco de dados
    database: 'physisbd' // Nome do banco de dados
});

db.connect((erro) => { // Conectando ao banco de dados
    if (erro) {
        console.log('Erro ao conectar ao banco de dados: ' + erro); // Caso ocorra um erro, exibe a mensagem de erro
    } else {
        return console.log('Banco de dados conectado com sucesso!'); // Caso contrário, exibe a mensagem de sucesso
    }
});

//Funções


function verificarLogin(req, res, next){
    if (req.session.usuario) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function redirecionarSeLogado(req, res, next) {
    if (req.session.usuario) {
        return res.redirect('/home'); // Redireciona para a página home se o usuário já estiver logado
    }
    next(); // Prossegue para a próxima função se o usuário não estiver logado
}

// Valida se o email é válido
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarSenha(senha) {
    const regex = /^[a-zA-Z]{6,}$/;
    return regex.test(senha);
}

function formatarDataParaMySQL(data) {
    // Divide a data no formato DD/MM/AAAA
    const [dia, mes, ano] = data.split('/');

    // Retorna no formato AAAA-MM-DD
    return `${ano}-${mes}-${dia}`;
}

function validarFormatoData(data) {
    // Remove qualquer "/" da string
    const dataSemBarra = data.replace(/\//g, '');

    // Verifica se a string tem exatamente 8 caracteres numéricos
    if (!/^\d{8}$/.test(dataSemBarra)) {
        return false;
    }

    // Extrai dia, mês e ano
    const dia = parseInt(dataSemBarra.substring(0, 2), 10);
    const mes = parseInt(dataSemBarra.substring(2, 4), 10);
    const ano = parseInt(dataSemBarra.substring(4, 8), 10);

    // Verifica se o dia, mês e ano são válidos
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1900 || ano > new Date().getFullYear()) {
        return false;
    }

    // Verifica se a data é válida no calendário
    const dataObj = new Date(ano, mes - 1, dia); // `mes - 1` porque os meses no JavaScript são baseados em zero
    return (
        dataObj.getDate() === dia &&
        dataObj.getMonth() === mes - 1 &&
        dataObj.getFullYear() === ano
    );
}

function calcularInversa2x2(matriz) {
    let det = (matriz[0][0] * matriz[1][1]) - (matriz[0][1] * matriz[1][0]);
    det = ((det % 26) + 26) % 26; // Garante determinante positivo módulo 26

    let detInversa = null;
    for (let i = 1; i < 26; i++) {
        if ((det * i) % 26 === 1) {
            detInversa = i;
            break;
        }
    }

    if (detInversa === null) {
        console.log("Não possui inversa :(");
        return null;
    }

    // Criar cópia da matriz para evitar modificar a original
    let inversa = [
        [matriz[1][1], -matriz[0][1]],
        [-matriz[1][0], matriz[0][0]]
    ];

    // Aplicar inverso do determinante e módulo 26 a cada elemento
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            inversa[i][j] = ((inversa[i][j] * detInversa) % 26 + 26) % 26;
        }
    }

    return inversa;
}


function codificarTexto(texto) {
    const matriz = [  //Matriz de codificação
        [4, 3],
        [1, 2]
    ];

    const numerico = {  //Modulo 26, letra para numero
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 10, 'k': 11, 'l': 12, 'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17,
        'r': 18, 's': 19, 't': 20, 'u': 21, 'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 0
    };

    const pares = [];  // Array para armazenar os pares de duas letras
    for (let i = 0; i < texto.length; i += 2) {
        // Pega duas letras por vez
        const par = texto.slice(i, i + 2);
        // Se o par tiver apenas uma letra, repete a ultima letra
        pares.push(par.length === 2 ? par : par + par);
    }

    console.log(pares);

    const numeros = pares.map(par => {  // Transformar os pares em números
        const [primeira, segunda] = par.split('');
        return [numerico[primeira.toLowerCase()], numerico[segunda.toLowerCase()]];
    });

    console.log(numeros);

    const resultado = numeros.map(par => { // Multiplicação da matriz de codificação
        const [x, y] = par;
        return [
            (matriz[0][0] * x + matriz[0][1] * y) % 26,
            (matriz[1][0] * x + matriz[1][1] * y) % 26
        ];
    });

    console.log(resultado);

    const numericoInvertido = Object.fromEntries(Object.entries(numerico).map(([letra, numero]) => [numero, letra]));  //tabela do modulo 26 invertida

    const textoCodificado = resultado.map(par => {  //Codifica o texto
        return par.map(numero => numericoInvertido[numero < 0 ? (numero + 26) : numero]).join('');
    }).join('');

    console.log(textoCodificado);
    console.log(decodificarTexto(textoCodificado));
    console.log(calcularInversa2x2(matriz));
    return textoCodificado;

}

function decodificarTexto(texto) {
    const matriz = [ 
        [16, 15],
        [5, 6]
    ];

    const numerico = {  //Modulo 26, letra para numero
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 10, 'k': 11, 'l': 12, 'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17,
        'r': 18, 's': 19, 't': 20, 'u': 21, 'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 0
    };

    const pares = [];   // Array para armazenar os pares de duas letras
    for (let i = 0; i < texto.length; i += 2) {
        const par = texto.slice(i, i + 2);
        pares.push(par.length === 2 ? par : par + par); // Adiciona 'Z' se o par tiver apenas uma letra
    }

    const numeros = pares.map(par => { // Transformar os pares em números
        const [primeira, segunda] = par.split('');
        return [numerico[primeira.toLowerCase()], numerico[segunda.toLowerCase()]];
    });

    const resultado = numeros.map(par => {  // Multiplicação da matriz inversa
        const [x, y] = par;
        return [
            matriz[0][0] * x + matriz[0][1] * y,
            matriz[1][0] * x + matriz[1][1] * y
        ];
    });

    const resultadoModulo = resultado.map(par => {  //Calculo do modulo de 26
        return par.map(numero => ((numero % 26) + 26) % 26); // Garante que o resultado seja positivo
    });

    const numericoInvertido = Object.fromEntries(Object.entries(numerico).map(([letra, numero]) => [numero, letra]));  //tabela do modulo 26 invertida
    const textoDecodificado = resultadoModulo.map(par => {  //Decodifica o texto
        return par.map(numero => numericoInvertido[numero]).join('');
    }).join('');
    return textoDecodificado;

};

//Rotas


app.get(['/', '/index'], redirecionarSeLogado, (req, res) => { // Rota para a página inicial
    const msg = req.session.msg || '';
    req.session.msg = null;
    res.render('index', {
        titulo: 'Index',
        css: 'index.css',
        msg: msg,
    });
});

app.get('/login', redirecionarSeLogado, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null;
    res.render('login', {
        titulo: 'Login',
        css: 'login.css',
        msg: msg,
    })
});

app.post('/login', (req, res) => {
    let email = req.body.email; // Pegando o email do formulário
    let senha = req.body.senha; // Pegando a senha do formulário

    if (!validarSenha(senha)) {
    req.session.msg = 'A senha deve conter apenas letras (a-z, A-Z)';
    return res.redirect('/login');
    }

    let senha_codificada = codificarTexto(senha);

    // Consulta ao banco de dados para verificar o email e senha
    const query = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';
    db.query(query, [email, senha_codificada], (erro, resultados) => {
        if (erro) {
            console.log('Erro ao consultar o banco de dados: ' + erro);
            return res.status(500).send('Erro interno do servidor');
        }

        if (resultados.length > 0) {
            // Usuário encontrado
            req.session.usuario = {
                cpf: resultados[0].cpf,
                nome: resultados[0].nome,
                email: resultados[0].email,
                senha: senha,
                data_nascimento: resultados[0].data_nascimento,
            };
            res.redirect('/home'); // Redireciona para a página inicial após o login
        } else {
            // Usuário não encontrado
            req.session.msg = 'Email ou senha inválidos!'; // Mensagem de erro
            return res.redirect('/login');;
        }
    });
});

app.get('/cadastro', redirecionarSeLogado, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null;
    res.render('cadastro', {
        titulo: 'Cadastro',
        css: 'cadastro.css',
        msg: msg,
    });
});

app.post('/cadastro', (req, res) => {
    let nome = req.body.nome; // Pegando o nome do formulário
    let email = req.body.email; // Pegando o email do formulário
    let senha = req.body.senha; // Pegando a senha do formulário
    let confirmar_senha = req.body.confirmar_senha; // Pegando a confirmação da senha do formulário
    let cpf = req.body.cpf; // Pegando o cpf do formulário
    let data = req.body.data; // Pegando a data do formulário


    if (!nome || !email || !senha || !cpf || !data) {
        req.session.msg = 'Preencha todos os campos!'; // Mensagem de erro
        return res.redirect('/cadastro'); // Redireciona para a página de cadastro
    }

    const dataFormatada = data

    if (!validarEmail(email)) {
        req.session.msg = 'Email inválido!'; // Mensagem de erro
        return res.redirect('/cadastro'); // Redireciona para a página de cadastro
    }

    if (!validarSenha(senha)) {
    req.session.msg = 'A senha deve conter apenas letras (a-z, A-Z) e ter pelo menos 6 caracteres!';
    return res.redirect('/cadastro');
    }

    if (cpf.length !== 11) {
        req.session.msg = 'O CPF deve ter 11 dígitos!'; // Mensagem de erro
        return res.redirect('/cadastro'); // Redireciona para a página de cadastro
    }

    if (senha !== confirmar_senha) {
        req.session.msg = 'As senhas não coincidem!';
        return res.redirect('/cadastro');
    }

    let senha_codificada = codificarTexto(senha);

    const query = `INSERT INTO usuario (nome, email, senha, cpf, data_nascimento) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [nome, email, senha_codificada, cpf, dataFormatada], (erro, resultados) => {
        if (erro) {
            console.log('Erro ao inserir o usuário: ' + erro); // Mensagem de erro
            req.session.msg = 'Erro ao cadastrar o usuário!'; // Mensagem de erro
            return res.redirect('/cadastro'); // Redireciona para a página de cadastro
        }

        req.session.msg = 'Usuário cadastrado com sucesso!'; // Mensagem de sucesso
        res.redirect('/login'); // Redireciona para a página de login
    });


});

app.get('/home', verificarLogin, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null; 

    const queryBuscaIndices = `
    SELECT
        r.data_consumo,
        c.indice_total
    FROM registro r
    INNER JOIN class_cons cc ON r.id_consumo = cc.id_consumo
    INNER JOIN classificacao c ON cc.id_classificação = c.id_classificacao
    WHERE r.cpf = ? AND r.data_consumo BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
    ORDER BY r.data_consumo ASC
    `;

    db.query(queryBuscaIndices, [req.session.usuario.cpf], (erro, resultados) => {
        if (erro) {
            console.log('Erro ao buscar índices: ' + erro);
            req.session.msg = 'Erro ao buscar índices!';
            return res.redirect('/home');
        }

        const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const indicesPorDia = {};

        // Agrupar índices por dia da semana
resultados.forEach((registro) => {
    const diaSemana = diasSemana[new Date(registro.data_consumo).getDay()];
    if (!indicesPorDia[diaSemana]) {
        indicesPorDia[diaSemana] = [];
    }
    indicesPorDia[diaSemana].push(parseFloat(registro.indice_total));
});

// Calcular a média dos índices para cada dia
Object.keys(indicesPorDia).forEach((dia) => {
    const soma = indicesPorDia[dia].reduce((acc, val) => acc + val, 0);
    indicesPorDia[dia] = (soma / indicesPorDia[dia].length).toFixed(2); // Média com 2 casas decimais
});

const hojeSemana = (new Date().getDay() + 6) % 7;

const queryDicas = `SELECT
r.data_consumo,
c.indice_agua, c.indice_energia, c.indice_lixo, c.indice_transporte
FROM registro r
INNER JOIN class_cons cc ON r.id_consumo = cc.id_consumo
INNER JOIN classificacao c ON cc.id_classificação = c.id_classificacao
WHERE r.cpf = ?
`;
db.query(queryDicas, [req.session.usuario.cpf], (erro, resultados) => {
    if (erro) {
        console.log('Erro ao buscar dicas: ' + erro);
        req.session.msg = 'Erro ao buscar dicas!';
        return res.redirect('/home');
    }


    try {
        res.render('home', {
            titulo: 'Home',
            css: 'home.css',
            usuario: req.session.usuario,
            msg: msg,
            indicesPorDia: indicesPorDia,
            hojeSemana: hojeSemana, // Passa os índices por dia para a view
            dicas:{
                agua: resultados[(resultados.length)-1].indice_agua || [],
                energia: resultados[(resultados.length)-1].indice_energia || [],
                lixo: resultados[(resultados.length)-1].indice_lixo || [],
                transporte: resultados[(resultados.length)-1].indice_transporte || [],
            }
        });
    } catch {
        res.render('home', {
            titulo: 'Home',
            css: 'home.css',
            usuario: req.session.usuario,
            msg: msg,
            indicesPorDia: indicesPorDia,
            hojeSemana: hojeSemana, // Passa os índices por dia para a view
            dicas:{
                agua: [],
                energia: [],
                lixo: [],
                transporte: [],
            },
    });
    }});
    });
});

app.get('/api/medias', verificarLogin, (req, res) => {
    const dias = parseInt(req.query.dias, 10) || 7; // Número de dias (padrão: 7 dias)
    const hoje = new Date();
    const dataInicio = new Date(hoje);

    if (dias === 1) {
        // Para 1 dia, usamos apenas a data atual
        const dataHojeMySQL = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        const queryMedias = `
            SELECT 
                AVG(cl.indice_agua) AS media_indice_agua,
                AVG(cl.indice_energia) AS media_indice_energia,
                AVG(cl.indice_lixo) AS media_indice_lixo,
                AVG(cl.indice_transporte) AS media_indice_transporte,
                AVG(cl.indice_total) AS media_indice_total
            FROM classificacao cl
            INNER JOIN class_cons cc ON cl.id_classificacao = cc.id_classificação
            INNER JOIN registro r ON cc.id_consumo = r.id_consumo
            WHERE r.cpf = ? AND r.data_consumo = ?
        `;

        db.query(queryMedias, [req.session.usuario.cpf, dataHojeMySQL], (erro, resultados) => {
            if (erro) {
                console.log('Erro ao calcular médias: ' + erro);
                return res.status(500).json({ error: 'Erro ao calcular médias!' });
            }

            res.json(resultados[0]); // Retorna as médias como JSON
        });
    } else {
        // Para outros períodos, calcula o intervalo de dias
        dataInicio.setDate(hoje.getDate() - dias); // Calcula a data de início subtraindo os dias desejados
        const dataInicioMySQL = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}-${String(dataInicio.getDate()).padStart(2, '0')}`;
        const dataHojeMySQL = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

        const queryMedias = `
            SELECT 
                AVG(cl.indice_agua) AS media_indice_agua,
                AVG(cl.indice_energia) AS media_indice_energia,
                AVG(cl.indice_lixo) AS media_indice_lixo,
                AVG(cl.indice_transporte) AS media_indice_transporte,
                AVG(cl.indice_total) AS media_indice_total
            FROM classificacao cl
            INNER JOIN class_cons cc ON cl.id_classificacao = cc.id_classificação
            INNER JOIN registro r ON cc.id_consumo = r.id_consumo
            WHERE r.cpf = ? AND r.data_consumo BETWEEN ? AND ?
        `;

        db.query(queryMedias, [req.session.usuario.cpf, dataInicioMySQL, dataHojeMySQL], (erro, resultados) => {
            if (erro) {
                console.log('Erro ao calcular médias: ' + erro);
                return res.status(500).json({ error: 'Erro ao calcular médias!' });
            }

            res.json(resultados[0]); // Retorna as médias como JSON
        });
    }
});

app.post('/home', verificarLogin, (req, res) => {
    let reciclavel = req.body.reciclavel; // Pegando o tipo de material reciclável do formulário
    let organico = req.body.organico; // Pegando o tipo de material orgânico do formulário
    let transporte = req.body.transporte; // Pegando o tipo de transporte do formulário
    let agua = req.body.agua; // Pegando a quantidade de água do formulário
    let energia = req.body.energia; // Pegando a quantidade de energia do formulário
    let hoje = new Date();
    const ano = hoje.getFullYear(); // Obtém o ano
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Obtém o mês (0-11, por isso +1) e adiciona zero à esquerda
    const dia = String(hoje.getDate()).padStart(2, '0'); // Obtém o dia e adiciona zero à esquerda

    hoje = `${ano}-${mes}-${dia}`; // Retorna no formato AAAA-MM-DD


    const queryVerifica = `
    SELECT id_consumo FROM registro WHERE data_consumo = ? AND cpf = ?
    `;
    
    db.query(queryVerifica, [hoje, req.session.usuario.cpf], (erro, resultados) => {


        if (resultados && resultados.length > 0) {
            req.session.msg = 'Você já registrou os dados hoje!'; // Mensagem de erro
            return res.redirect('/home'); // Redireciona para a página de home
        }

    const queryConsumo = `INSERT INTO consumo (lixo_reciclavel_kg, lixo_nao_reciclavel_kg, agua_litros, energia_kwh, tipo_transporte) VALUES (?, ?, ?, ?, ?)`;

    db.query(queryConsumo, [reciclavel, organico, agua, energia, transporte], (erro, resultados) => {
        if (erro) {
            console.log('Erro ao inserir os dados: ' + erro); // Mensagem de erro
            req.session.msg = 'Erro ao inserir os dados!'; // Mensagem de erro
            return res.redirect('/home'); // Redireciona para a página de home
        }

        const idConsumo = resultados.insertId;

        const queryRegistro = `INSERT INTO registro (cpf, id_consumo, data_consumo) VALUES (?, ?, ?)`;
        db.query(queryRegistro, [req.session.usuario.cpf, idConsumo, hoje], (erro) => {
            if (erro) {
                console.log('Erro ao registrar os dados: ' + erro);
                req.session.msg = 'Erro ao registrar os dados!';
                return res.redirect('/home');
            }
        });

        let agua_indice, energia_indice, lixo_indice, transporte_indice, indice_total;

        let reciclavelporcento = (reciclavel / (parseFloat(reciclavel) + parseFloat(organico)) * 100);

        if (agua < 150) {
            agua_indice = 3;
        } else if (agua <= 200) {
            agua_indice = 2;
        } else if (agua > 200) {
            agua_indice = 1;
        }

        if (energia < 5) {
            energia_indice = 3;
        } else if( energia <= 10) {
            energia_indice = 2;
        } else if (energia > 10) {
            energia_indice = 1;
        }

        if (transporte == 3) {

            transporte_indice = 3;
        } else if (transporte == 2) {
            transporte_indice = 2;
        } else if (transporte == 1) {
            transporte_indice = 1;
        }

        if (reciclavelporcento > 50) {
            lixo_indice = 3;
        } else if (reciclavelporcento >= 20) {
            lixo_indice = 2;
        } else if (reciclavelporcento < 20) {
            lixo_indice = 1;
        }

        indice_total = (parseFloat(agua_indice) + parseFloat(energia_indice) + parseFloat(lixo_indice) + parseFloat(transporte_indice)) / 4; 

        console.log(transporte);

        const queryClassificacao = `INSERT INTO classificacao (indice_agua, indice_energia, indice_lixo, indice_transporte, indice_total) VALUES (?, ?, ?, ?, ?)`;

        db.query(queryClassificacao, [agua_indice, energia_indice, lixo_indice, transporte_indice, indice_total], (erro, resultados) => {
            if (erro) {
                console.log('Erro ao inserir os dados: ' + erro); // Mensagem de erro
                req.session.msg = 'Erro ao inserir os dados!'; // Mensagem de erro
                return res.redirect('/home'); // Redireciona para a página de home
            }

            const idClassificacao = resultados.insertId;

            const queryRegistroClassificacao = `INSERT INTO class_cons (id_classificação, id_consumo) VALUES (?, ?)`;
            db.query(queryRegistroClassificacao, [idClassificacao, idConsumo], (erro) => {
                if (erro) {
                    console.log('Erro ao registrar os dados: ' + erro); // Mensagem de erro
                    req.session.msg = 'Erro ao registrar os dados!'; // Mensagem de erro
                    return res.redirect('/home'); // Redireciona para a página de home
                }

                const queryIndice = `
                INSERT INTO indice (id_classificacao, cpf) VALUES (?, ?)
                `; 

                db.query(queryIndice, [idClassificacao, req.session.usuario.cpf], (erro, resultados) => {
                    if (erro) {
                        console.log('Erro ao inserir os dados: ' + erro); // Mensagem de erro
                        req.session.msg = 'Erro ao inserir os dados!'; // Mensagem de erro
                        return res.redirect('/home'); // Redireciona para a página de home
                    }


                });

            });

        });

        req.session.msg = 'Dados inseridos com sucesso!'; // Mensagem de sucesso
        res.redirect('/home'); // Redireciona para a página de home
    });

});

});


app.get('/graficos', verificarLogin, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null;

    const dias = parseInt(req.query.dias, 30) || 7; // Número de dias (padrão: 7 dias)
    const hoje = new Date();
    const dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - dias); // Calcula a data de início subtraindo os dias desejados
    const dataInicioMySQL = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}-${String(dataInicio.getDate()).padStart(2, '0')}`;
    const dataHojeMySQL = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    // Query para os dados de consumo
    const queryConsumo = `
        SELECT 
            c.lixo_reciclavel_kg, 
            c.lixo_nao_reciclavel_kg, 
            c.agua_litros, 
            c.energia_kwh, 
            c.tipo_transporte, 
            r.data_consumo
        FROM consumo c
        INNER JOIN registro r ON c.id_consumo = r.id_consumo
        WHERE r.cpf = ? AND r.data_consumo BETWEEN ? AND ?
        ORDER BY r.data_consumo ASC
    `;

    // Query para as médias dos índices das classificações
    const queryMedias = `
        SELECT 
            AVG(cl.indice_agua) AS media_indice_agua,
            AVG(cl.indice_energia) AS media_indice_energia,
            AVG(cl.indice_lixo) AS media_indice_lixo,
            AVG(cl.indice_transporte) AS media_indice_transporte,
            AVG(cl.indice_total) AS media_indice_total
        FROM classificacao cl
        INNER JOIN class_cons cc ON cl.id_classificacao = cc.id_classificação
        INNER JOIN registro r ON cc.id_consumo = r.id_consumo
        WHERE r.cpf = ? AND r.data_consumo BETWEEN ? AND ?
    `;

    // Executar ambas as queries
    db.query(queryConsumo, [req.session.usuario.cpf, dataInicioMySQL, dataHojeMySQL], (erroConsumo, resultadosConsumo) => {
        if (erroConsumo) {
            console.log('Erro ao buscar dados de consumo: ' + erroConsumo);
            req.session.msg = 'Erro ao buscar dados de consumo!';
            return res.redirect('/home');
        }

        db.query(queryMedias, [req.session.usuario.cpf, dataInicioMySQL, dataHojeMySQL], (erroMedias, resultadosMedias) => {
            if (erroMedias) {
                console.log('Erro ao calcular médias: ' + erroMedias);
                req.session.msg = 'Erro ao calcular médias!';
                return res.redirect('/home');
            }

            // Renderizar a view com os resultados
            res.render('graficos', {
                titulo: 'Gráficos',
                css: 'graficos.css',
                usuario: req.session.usuario,
                msg: msg,
                dados: resultadosConsumo, // Dados de consumo
                medias: resultadosMedias[0], // Médias dos índices
            });
        });
    });
});

app.get('/perfil', verificarLogin, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null;
    res.render('perfil', {
        titulo: 'Perfil',
        css: 'perfil.css',
        usuario: req.session.usuario,
        msg: msg,
    });
});

app.post('/perfil/editar', verificarLogin, (req, res) => {
    const { nome, data, email, senha } = req.body;
    const cpf = req.session.usuario.cpf;

    if (!nome || !data || !email || !senha) {
        req.session.msg = 'Preencha todos os campos!';
        return res.redirect('/perfil');
    };

    if (!validarEmail(email)) {
        req.session.msg = 'Email inválido!';
        return res.redirect('/perfil');
    };

    if (!validarSenha(senha)) {
    req.session.msg = 'A senha deve conter apenas letras (a-z, A-Z) e ter pelo menos 6 caracteres!';
    return res.redirect('/perfil');
    };

    const query = `
        UPDATE usuario 
        SET nome = ?, data_nascimento = ?, email = ?, senha = ?
        WHERE cpf = ?
    `;

    let senha_codificada = codificarTexto(senha);

    db.query(query, [nome, data, email, senha_codificada, cpf], (erro, resultados) => {
        if (erro) {
            console.log('Erro ao atualizar os dados do usuário: ' + erro);
            return res.status(500).send('Erro ao atualizar os dados do perfil');
        }

        // Atualiza os dados na sessão
        req.session.usuario.nome = nome;
        req.session.usuario.data_nascimento = data;
        req.session.usuario.email = email;
        req.session.usuario.senha = senha;

        req.session.msg = 'Dados atualizados com sucesso!';
        res.redirect('/perfil');
    });
});


app.get('/perfil/logout', (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            console.log('Erro ao encerrar a sessão: ' + erro);
            return res.status(500).send('Erro ao encerrar a sessão');
        }
        res.redirect('/index');
    });
});

app.get('/editar', verificarLogin, (req, res) => {
    const msg = req.session.msg || '';
    req.session.msg = null;
    const data = null;



    res.render('editar', {
        titulo: 'Editar',
        css: 'editar.css',
        usuario: req.session.usuario,
        msg: msg,
        data: data
    });
});

app.get('/editar/dados', verificarLogin, (req, res) => {
    const { data } = req.query;
    const cpf = req.session.usuario.cpf;

    if (!data) {
        return res.json({ success: false, message: 'Data não fornecida.' });
    }

    const query = `
        SELECT 
            c.lixo_reciclavel_kg, 
            c.lixo_nao_reciclavel_kg, 
            c.agua_litros, 
            c.energia_kwh, 
            c.tipo_transporte
        FROM consumo c
        INNER JOIN registro r ON c.id_consumo = r.id_consumo
        WHERE r.cpf = ? AND r.data_consumo = ?
    `;

    db.query(query, [cpf, data], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar dados de consumo:', erro);
            return res.json({ success: false, message: 'Erro ao buscar dados de consumo.' });
        }

        if (resultados.length === 0) {
            return res.json({ success: false, message: 'Nenhum dado encontrado para esta data.' });
        }

        res.json({ success: true, consumo: resultados[0] });
    });
});

// ROTA POST PARA EDIÇÃO DE DAODS.
app.post('/editar', verificarLogin, (req, res) => {
    // Dados recebidos
    const {
        data_consumo,
        agua_litros,
        energia_kwh,
        lixo_reciclavel_kg,
        lixo_nao_reciclavel_kg,
        tipo_transporte,
    } = req.body;

    // Validação 
    if (!data_consumo || !agua_litros || !energia_kwh || 
        !lixo_reciclavel_kg || !lixo_nao_reciclavel_kg || 
        !tipo_transporte) {
        console.log("Dados faltando:", req.body);
        req.session.msg = 'Preencha todos os campos corretamente!';
        return res.redirect('/editar');
    }

    // SELECT PARA BUSCAR OS VALORES
    db.query(
        `SELECT id_consumo FROM registro WHERE cpf = ? AND data_consumo = ?`,
        [req.session.usuario.cpf, data_consumo],
        (erro, resultados) => {
            if (erro || !resultados.length) {
                console.error("Erro ao buscar registro:", erro);
                req.session.msg = 'Nenhum registro encontrado para esta data!';
                return res.redirect('/editar');
            }

            const id_consumo = resultados[0].id_consumo;

            // ATUALIZA
            db.query(
                `UPDATE consumo SET
                    lixo_reciclavel_kg = ?,
                    lixo_nao_reciclavel_kg = ?,
                    agua_litros = ?,
                    energia_kwh = ?,
                    tipo_transporte = ?
                WHERE id_consumo = ?`,
                [
                    lixo_reciclavel_kg,
                    lixo_nao_reciclavel_kg,
                    agua_litros,
                    energia_kwh,
                    tipo_transporte,
                    id_consumo
                ],
                (erro) => {
                    if (erro) {
                        console.error("Erro ao atualizar:", erro);
                        req.session.msg = 'Erro ao salvar no banco de dados!';
                        return res.redirect('/editar');
                    }


                    let reciclavelPorcento = (lixo_reciclavel_kg / (parseFloat(lixo_reciclavel_kg) + parseFloat(lixo_nao_reciclavel_kg))) * 100;

                    let indice_agua = agua_litros < 150 ? 3 : agua_litros <= 200 ? 2 : 1;
                    let indice_energia = energia_kwh < 5 ? 3 : energia_kwh <= 10 ? 2 : 1;
                    let indice_lixo = reciclavelPorcento > 50 ? 3 : reciclavelPorcento >= 20 ? 2 : 1;
                    let indice_transporte = tipo_transporte == 3 ? 3 : tipo_transporte == 2 ? 2 : 1;

                    let indice_total = (indice_agua + indice_energia + indice_lixo + indice_transporte) / 4;

                    // Atualiza os dados na tabela classificacao
                    db.query(
                        `UPDATE classificacao SET
                            indice_agua = ?,
                            indice_energia = ?,
                            indice_lixo = ?,
                            indice_transporte = ?,
                            indice_total = ?
                        WHERE id_classificacao = (
                            SELECT id_classificação FROM class_cons WHERE id_consumo = ?
                        )`,
                        [
                            indice_agua,
                            indice_energia,
                            indice_lixo,
                            indice_transporte,
                            indice_total,
                            id_consumo
                        ],
                        (erro) => {
                            if (erro) {
                                console.error("Erro ao atualizar classificação:", erro);
                                req.session.msg = 'Erro ao salvar os índices no banco de dados!';
                                return res.redirect('/editar');
                            }

                            req.session.msg = 'Dados atualizados com sucesso!';
                            res.redirect('/home');
                        }
                    );
                }
            );
        }
    );
});

app.post('/editar/apagar', verificarLogin, (req, res) => {
const { data_consumo } = req.body;
const cpf = req.session.usuario.cpf;

if (!data_consumo) {
    return res.json({ success: false, message: 'Data não fornecida.' });
}

// Buscar o id_consumo relacionado à data e ao CPF
db.query(
    `SELECT id_consumo FROM registro WHERE cpf = ? AND data_consumo = ?`,
    [cpf, data_consumo],
    (erro, resultados) => {
        if (erro || resultados.length === 0) {
            console.error('Erro ao buscar registro:', erro);
            return res.json({ success: false, message: 'Nenhum registro encontrado para esta data.' });
        }

        const id_consumo = resultados[0].id_consumo;

        // Buscar o id_classificacao relacionado ao id_consumo
        db.query(
            `SELECT id_classificação FROM class_cons WHERE id_consumo = ?`,
            [id_consumo],
            (erro, resultados) => {
                if (erro || resultados.length === 0) {
                    console.error('Erro ao buscar classificação:', erro);
                    return res.json({ success: false, message: 'Nenhuma classificação encontrada para este consumo.' });
                }

                const id_classificacao = resultados[0].id_classificação;

                // Deletar os registros relacionados na tabela `indice`
                db.query(
                    `DELETE FROM indice WHERE id_classificacao = ?`,
                    [id_classificacao],
                    (erro) => {
                        if (erro) {
                            console.error('Erro ao deletar de indice:', erro);
                            return res.json({ success: false, message: 'Erro ao apagar os dados de índice.' });
                        }

                        // Deletar os registros relacionados na tabela `class_cons`
                        db.query(
                            `DELETE FROM class_cons WHERE id_consumo = ?`,
                            [id_consumo],
                            (erro) => {
                                if (erro) {
                                    console.error('Erro ao deletar de class_cons:', erro);
                                    return res.json({ success: false, message: 'Erro ao apagar os dados de class_cons.' });
                                }

                                // Deletar os registros relacionados na tabela `registro`
                                db.query(
                                    `DELETE FROM registro WHERE id_consumo = ?`,
                                    [id_consumo],
                                    (erro) => {
                                        if (erro) {
                                            console.error('Erro ao deletar de registro:', erro);
                                            return res.json({ success: false, message: 'Erro ao apagar os dados de registro.' });
                                        }

                                        // Deletar os registros relacionados na tabela `classificacao`
                                        db.query(
                                            `DELETE FROM classificacao WHERE id_classificacao = ?`,
                                            [id_classificacao],
                                            (erro) => {
                                                if (erro) {
                                                    console.error('Erro ao deletar de classificacao:', erro);
                                                    return res.json({ success: false, message: 'Erro ao apagar os dados de classificação.' });
                                                }

                                                // Deletar os registros relacionados na tabela `consumo`
                                                db.query(
                                                    `DELETE FROM consumo WHERE id_consumo = ?`,
                                                    [id_consumo],
                                                    (erro) => {
                                                        if (erro) {
                                                            console.error('Erro ao deletar de consumo:', erro);
                                                            return res.json({ success: false, message: 'Erro ao apagar os dados de consumo.' });
                                                        }

                                                        res.json({ success: true, message: 'Dados apagados com sucesso!' });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);
});
 

app.listen(3000, (erro) => { // Iniciando o servidor na porta 3000
    if (erro) {
        console.log('Erro ao iniciar o servidor: ' + erro);
    } else {
        console.log('Servidor iniciado na porta 3000');
    }
});