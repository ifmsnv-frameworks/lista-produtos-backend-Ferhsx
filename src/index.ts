import mysql, { RowDataPacket } from 'mysql2/promise';
import express from 'express';
import 'dotenv/config';

interface Produto extends RowDataPacket {
    id: number;
    nome: string;
    preco: number;
    urlfoto: string;
    descricao: string;
}

const app = express();
app.get('/', async (req, res) => {
    if (process.env.DBHOST === undefined) {
        res.status(500).send("DBHOST is not defined");
        return
    }
    if (process.env.DBUSER === undefined) {
        res.status(500).send("DBUSER is not defined");
        return
    }
    if (process.env.DBPASSWORD === undefined) {
        res.status(500).send("DBPASSWORD is not defined");
        return
    }
    if (process.env.DBDATABASE === undefined) {
        res.status(500).send("DBDATABASE is not defined");
        return
    }
    if (process.env.DBPORT === undefined) {
        res.status(500).send("DBPORT is not defined");
        return
    }
    
    try {
        const conn = await mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBDATABASE,
            port: Number(process.env.DBPORT)
        });
        res.send(`
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <p>Conectado, clique nesse botão para ver os produtos</p>
                <button onclick="window.location.href='/produtos' "style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Produtos
                </button>
            </div>
        `)
    }
    catch (err) {
        if(err instanceof Error === false){
            res.status(500).send("erro q n sabo")
            return
        }
        const error = err as Error
        res.status(500).send("Erro ao conectar no banco de dados " + error.message)
    }

})


app.get('/produtos', async (req, res) => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DBHOST,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: process.env.DBDATABASE,
            port: Number(process.env.DBPORT)
        });
        
        const [produtos] = await conn.query<Produto[]>('SELECT * FROM produtos');
        
        const produtosHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Produtos</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                h1 {
                    color: #333;
                    text-align: center;
                }
                .produtos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 20px 0;
                }
                .produto-card {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }
                .produto-card:hover {
                    transform: translateY(-5px);
                }
                .produto-imagem {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }
                .produto-info {
                    padding: 15px;
                }
                .produto-nome {
                    font-size: 1.2em;
                    margin: 0 0 10px 0;
                    color: #333;
                }
                .produto-preco {
                    font-size: 1.4em;
                    color: #2ecc71;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .produto-descricao {
                    color: #666;
                    font-size: 0.9em;
                    margin: 10px 0;
                }
                .voltar {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 10px 20px;
                    background-color: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                }
                .voltar:hover {
                    background-color: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Nossos Produtos</h1>
                <a href="/" class="voltar">← Voltar</a>
                <div class="produtos-grid">
                    ${produtos.length > 0 
                        ? produtos.map(produto => `
                            <div class="produto-card">
                                <img src="${produto.urlfoto || 'https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg'}" alt="${produto.nome}" class="produto-imagem">
                                <div class="produto-info">
                                    <h2 class="produto-nome">${produto.nome}</h2>
                                    <div class="produto-preco">R$ ${Number(produto.preco).toFixed(2).replace('.', ',')}</div>
                                    <p class="produto-descricao">${produto.descricao || 'Sem descrição disponível'}</p>
                                </div>
                            </div>
                        `).join('')
                        : '<p class="sem-produtos">Nenhum produto encontrado</p>'
                    }
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.send(produtosHtml);
    }
    catch (err) {
        console.error(err);
        res.status(500).send(`
            <div style="padding: 20px; font-family: Arial;">
                <h1>Erro ao carregar produtos</h1>
                <p>${err instanceof Error ? err.message : 'Erro desconhecido'}</p>
                <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 4px;">Voltar</a>
            </div>
        `);
    }
})

app.listen(8000, () => {
    console.log('Server is running on port 8000');
})

//criar rota get que pega e retorna lista dos produtos do banco de dados do aiven, deve ter id, nome, preco, urlfoto, descricao
//deve ser uma array a resposta 
//crie o codigo sql para criar a tabela de produtos
/*
CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    urlfoto VARCHAR(255) NOT NULL,
    descricao TEXT
);

*/
