-- Garante que estamos usando o banco de dados correto
USE db_cafe;

-- Inserindo os NOVOS CLIENTES na tabela Clientes
INSERT INTO Clientes (nome_cliente) VALUES 
    ('Grão de Ouro Exportação'),
    ('Café da Serra Ltda.'),
    ('Aroma & Sabor Cafés Especiais'),
    ('Fazenda Monte Alto');

-- Inserindo os NOVOS COLABORADORES com a função de CONFERENTE
INSERT INTO Colaboradores (nome_colaborador, funcao) VALUES 
    ('Ana Carolina Lima', 'Conferente'),
    ('Ricardo Almeida', 'Conferente'),
    ('Beatriz Costa', 'Conferente'),
    ('Lucas Martins', 'Conferente');