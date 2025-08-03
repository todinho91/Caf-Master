-- Seleciona o banco de dados para garantir que os comandos rodem no lugar certo
USE db_cafe;

-- Insere os dados nas tabelas
INSERT INTO Clientes (nome_cliente) VALUES ('Café Brasil'), ('Aroma Export');
INSERT INTO Colaboradores (nome_colaborador, funcao) VALUES ('João da Silva', 'Operador'), ('Maria Souza', 'Operador'), ('Carlos Pereira', 'Conferente');