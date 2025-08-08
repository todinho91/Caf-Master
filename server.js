// Importa as bibliotecas necessárias
const express = require('express');
const mysql = require('mysql2/promise'); // Usamos a versão com 'promise' para código mais limpo (async/await)
const cors = require('cors');

// Cria a aplicação Express
const app = express();
const PORT = 3000; // A porta em que nosso backend vai rodar

// --- CONFIGURAÇÕES ---

// Habilita o CORS para permitir que o frontend acesse a API
app.use(cors());
// Habilita o Express para entender JSON no corpo das requisições
app.use(express.json());

// Configurações da conexão com o banco de dados MySQL
// **IMPORTANTE: Altere com os seus dados do MySQL**
const dbConfig = {
    host: 'localhost',
    user: 'app_user', // seu usuário do MySQL
    password: 'Cafe@Forte#25', // sua senha do MySQL
    database: 'db_cafe' // o nome do banco de dados que você vai criar
};

// --- FUNÇÃO PRINCIPAL PARA CONECTAR E RODAR O SERVIDOR ---

async function main() {
    try {
        // Tenta criar o banco de dados se ele não existir
        const tempConnection = await mysql.createConnection({ host: dbConfig.host, user: dbConfig.user, password: dbConfig.password });
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database};`);
        await tempConnection.end();
        console.log(`Banco de dados '${dbConfig.database}' verificado/criado.`);

        // Cria um pool de conexões para otimizar a comunicação com o banco
        const connection = await mysql.createPool(dbConfig);
        console.log('Conectado ao banco de dados MySQL com sucesso!');

        // --- DEFINIÇÃO DOS ENDPOINTS DA API ---

        // GET /api/clientes2 - Retorna todos os clientes
        app.get('/api/clientes', async (req, res) => {
            const [rows] = await connection.query('SELECT id, nome_cliente as nome FROM Clientes ORDER BY nome_cliente');
            res.json(rows);
        });

        // GET /api/colaboradores - Retorna todos os colaboradores
        app.get('/api/colaboradores', async (req, res) => {
         const [rows] = await connection.query('SELECT id, nome_colaborador as nome, funcao FROM Colaboradores ORDER BY nome_colaborador');
         res.json(rows);
        });

        // POST /api/producao/iniciar - Inicia uma nova produção
        app.post('/api/producao/iniciar', async (req, res) => {
            const { cliente_id, operador_id, hora_inicio, meta_umidade, data_inicio } = req.body;
            const sql = 'INSERT INTO Producao (cliente_id, operador_id, data_inicio, hora_inicio, meta_umidade) VALUES (?, ?, ?, ?, ?)';
            const [result] = await connection.query(sql, [cliente_id, operador_id, data_inicio, hora_inicio, meta_umidade]);
            res.status(201).json({ id: result.insertId, message: 'Produção iniciada!' });
        });

        // PUT /api/producao/finalizar/:id - Finaliza uma produção existente
        app.put('/api/producao/finalizar/:id', async (req, res) => {
            const { id } = req.params;
            const { quantidade_produzida, hora_fim, motivo_baixa_producao, data_fim } = req.body;
            const sql = 'UPDATE Producao SET data_fim = ?, hora_fim = ?, quantidade_produzida = ?, motivo_baixa_producao = ? WHERE id = ?';
            await connection.query(sql, [data_fim, hora_fim, quantidade_produzida, motivo_baixa_producao, id]);
res.json({ message: 'Produção finalizada com sucesso!' });
        });

        // POST /api/paradas - Registra uma nova parada
        app.post('/api/paradas', async (req, res) => {
            const { producao_id, colaborador_parada_id, data_hora_inicio_parada, data_hora_fim_parada, motivo } = req.body;
            const sql = 'INSERT INTO Paradas (producao_id, colaborador_parada_id, data_hora_inicio_parada, data_hora_fim_parada, motivo) VALUES (?, ?, ?, ?, ?)';
            await connection.query(sql, [producao_id, colaborador_parada_id, data_hora_inicio_parada, data_hora_fim_parada, motivo]);
            res.status(201).json({ message: 'Parada registrada com sucesso!' });
        });
        

// POST /api/clientes - Adiciona um novo cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const { nome_cliente } = req.body;
        if (!nome_cliente) {
            return res.status(400).json({ message: 'O nome do cliente é obrigatório.' });
        }
        const sql = 'INSERT INTO Clientes (nome_cliente) VALUES (?)';
        const [result] = await connection.query(sql, [nome_cliente]);
        res.status(201).json({ id: result.insertId, nome_cliente });
    } catch (error) {
        console.error("Erro ao adicionar cliente:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// POST /api/colaboradores - Adiciona um novo colaborador
app.post('/api/colaboradores', async (req, res) => {
    try {
        const { nome_colaborador, funcao } = req.body;
        if (!nome_colaborador || !funcao) {2
            return res.status(400).json({ message: 'Nome e função são obrigatórios.' });
        }
        const sql = 'INSERT INTO Colaboradores (nome_colaborador, funcao) VALUES (?, ?)';
        const [result] = await connection.query(sql, [nome_colaborador, funcao]);
        res.status(201).json({ id: result.insertId, nome_colaborador, funcao });
    } catch (error) {
        console.error("Erro ao adicionar colaborador:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});
// Adicione este bloco no seu arquivo API/server.js

// DELETE /api/clientes/:id - Deleta um cliente
app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM Clientes WHERE id = ?';
        const [result] = await connection.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }
        res.json({ message: 'Cliente deletado com sucesso!' });
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// DELETE /api/colaboradores/:id - Deleta um colaborador
app.delete('/api/colaboradores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM Colaboradores WHERE id = ?';
        const [result] = await connection.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Colaborador não encontrado.' });
        }
        res.json({ message: 'Colaborador deletado com sucesso!' });
    } catch (error) {
        console.error("Erro ao deletar colaborador:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});
        
        // (Adicione aqui os endpoints de /api/conferencia se necessário, seguindo o mesmo padrão)
        // --- ENDPOINTS DE CONFERÊNCIA ---

        // POST /api/conferencia - Registra uma nova conferência diária
       
     app.post('/api/conferencia', async (req, res) => {
    // MUDANÇA AQUI
     const { data_conferencia, total_produzido_dia, perda_tipo_a, perda_tipo_b, conferente_id } = req.body;

     if (!data_conferencia || !total_produzido_dia || !conferente_id) {
        return res.status(400).json({ message: 'Dados incompletos...' });
    }

    // MUDANÇA AQUI
    const sql = 'INSERT INTO Conferencia (data_conferencia, total_produzido_dia, perda_tipo_a, perda_tipo_b, conferente_id) VALUES (?, ?, ?, ?, ?)';

    try {
        // MUDANÇA AQUI
        await connection.query(sql, [data_conferencia, total_produzido_dia, perda_tipo_a || 0, perda_tipo_b || 0, conferente_id]);
        res.status(201).json({ message: 'Conferência registrada com sucesso!' });
    } catch (error) { /* ... */ }
});
            // Adicione este bloco no seu arquivo API/server.js

// DELETE /api/conferencia/:id - Deleta um registro de conferência
              app.delete('/api/conferencia/:id', async (req, res) => {
                try {
                  const { id } = req.params;
                  await connection.query('DELETE FROM Conferencia WHERE id = ?', [id]);
                  res.json({ message: 'Registro de conferência deletado com sucesso!' });
                } catch (error) {
                  console.error("Erro ao deletar conferência:", error);
                  res.status(500).json({ message: 'Erro interno no servidor.' });
                }
              });

        // GET /api/conferencia - Busca conferências por data
        // Adicione este bloco no seu arquivo API/server.js

// GET /api/producao?data=... - Busca produções de uma data específica
// GET /api/conferencia - Busca conferências por data
app.get('/api/conferencia', async (req, res) => {
    // ...
    const sql = `
        SELECT 
            conf.id, conf.data_conferencia, conf.total_produzido_dia,
            conf.perda_tipo_a, conf.perda_tipo_b, -- MUDANÇA AQUI
            col.nome_colaborador as conferente_nome, conf.data_registro
        FROM Conferencia conf
        JOIN Colaboradores col ON conf.conferente_id = col.id
        WHERE conf.data_conferencia = ?
        ORDER BY conf.data_registro DESC
    `;
    // ...
});

// DELETE /api/producao/:id - Deleta um registro de produção
app.delete('/api/producao/:id', async (req, res) => {
    const { id } = req.params;
    // Primeiro, deletamos as paradas associadas para evitar erro de chave estrangeira
    await connection.query('DELETE FROM Paradas WHERE producao_id = ?', [id]);
    // Agora, deletamos a produção
    await connection.query('DELETE FROM Producao WHERE id = ?', [id]);
    res.json({ message: 'Registro de produção deletado com sucesso!' });
});
        app.get('/api/conferencia', async (req, res) => {
            const { data } = req.query; // Pega a data da URL, ex: /api/conferencia?data=2025-08-01

            if (!data) {
                return res.status(400).json({ message: 'É necessário fornecer uma data.' });
            }

            // A query SQL usa um JOIN para buscar o nome do conferente na tabela Colaboradores
            const sql = `
                SELECT 
                    conf.id,
                    conf.data_conferencia,
                    conf.total_produzido_dia,
                    conf.perda_rl,
                    conf.perda_rs,
                    col.nome_colaborador as conferente_nome,
                    conf.data_registro
                FROM Conferencia conf
                JOIN Colaboradores col ON conf.conferente_id = col.id
                WHERE conf.data_conferencia = ?
                ORDER BY conf.data_registro DESC
            `;

            try {
                const [rows] = await connection.query(sql, [data]);
                res.json(rows);
            } catch (error) {
                console.error('Erro ao buscar histórico de conferência:', error);
                res.status(500).json({ message: 'Erro interno no servidor ao buscar histórico.' });
            }
        });

        // Inicia o servidor para ouvir as requisições na porta definida
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Erro ao conectar ou configurar o banco de dados:', error);
        process.exit(1); // Encerra a aplicação se não conseguir conectar ao DB
    }
}

main();