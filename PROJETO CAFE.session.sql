-- Garante que estamos usando o banco de dados correto
USE db_cafe;

-- Insere os dados nas tabelas
INSERT INTO Clientes (nome_cliente) VALUES ('Café Brasil'), ('Aroma Export');
INSERT INTO Colaboradores (nome_colaborador, funcao) VALUES ('João da Silva', 'Operador'), ('Maria Souza', 'Operador'), ('Carlos Pereira', 'Conferente');

USE db_cafe;

ALTER TABLE Conferencia CHANGE COLUMN perda_rl perda_tipo_a DECIMAL(10, 2);
ALTER TABLE Conferencia CHANGE COLUMN perda_rs perda_tipo_b DECIMAL(10, 2);