document.addEventListener('DOMContentLoaded', () => {
    // URL base da nossa API. Facilita a manutenção.
    const API_URL = 'http://localhost:3000/api';

    let producaoAtualId = null;

    const formInicio = document.getElementById('inicio-producao');
    const formFim = document.getElementById('fim-producao');
    const btnIniciar = document.getElementById('btn-iniciar-producao');
    const btnFinalizar = document.getElementById('btn-finalizar-producao');
    const btnSalvarParada = document.getElementById('btn-salvar-parada');
    
    async function carregarSeletores() {
        try {
            // Busca dados reais da API
            const [clientesRes, operadoresRes] = await Promise.all([
                fetch(`${API_URL}/clientes`),
                fetch(`${API_URL}/colaboradores`)
            ]);

            const clientes = await clientesRes.json();
            const operadores = await operadoresRes.json();

            const selectCliente = document.getElementById('cliente');
            const selectOperador = document.getElementById('operador');
            const selectColaboradorParada = document.getElementById('parada-colaborador');

            // Limpa opções existentes antes de adicionar novas
            selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';
            selectOperador.innerHTML = '<option value="">Selecione um operador</option>';
            selectColaboradorParada.innerHTML = '<option value="">Selecione um colaborador</option>';

            clientes.forEach(c => selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
            operadores.forEach(o => {
                const option = `<option value="${o.id}">${o.nome}</option>`;
                selectOperador.innerHTML += option;
                selectColaboradorParada.innerHTML += option;
            });
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            alert('Não foi possível carregar os dados do servidor. Verifique se o backend está rodando.');
        }
    }

    btnIniciar.addEventListener('click', async () => {
        const dadosProducao = {
            cliente_id: document.getElementById('cliente').value,
            operador_id: document.getElementById('operador').value,
            hora_inicio: document.getElementById('hora-inicio').value,
            meta_umidade: document.getElementById('meta-umidade').value,
            data_inicio: new Date().toISOString().split('T')[0]
        };

        // Validação simples
        if (!dadosProducao.cliente_id || !dadosProducao.operador_id || !dadosProducao.hora_inicio) {
            alert('Por favor, preencha todos os campos para iniciar.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/producao/iniciar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProducao)
            });

            if (!response.ok) throw new Error('Falha ao iniciar produção.');

            const resultado = await response.json();
            producaoAtualId = resultado.id; // Pega o ID real retornado pela API

            alert('Produção iniciada com sucesso!');

            formInicio.classList.add('d-none');
            formFim.classList.remove('d-none');
            document.getElementById('info-inicio').textContent = `${dadosProducao.data_inicio} às ${dadosProducao.hora_inicio}`;
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    btnFinalizar.addEventListener('click', async () => {
        const dadosFinalizacao = {
            quantidade_produzida: document.getElementById('qtd-produzida').value,
            hora_fim: document.getElementById('hora-fim').value,
            motivo_baixa_producao: document.getElementById('motivo-baixa').value,
            data_fim: new Date().toISOString().split('T')[0]
        };

        if (!dadosFinalizacao.quantidade_produzida || !dadosFinalizacao.hora_fim) {
            alert('Por favor, preencha a quantidade produzida e a hora de término.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/producao/finalizar/${producaoAtualId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosFinalizacao)
            });

            if (!response.ok) throw new Error('Falha ao finalizar produção.');

            alert('Produção finalizada e salva!');
            
            producaoAtualId = null;
            formFim.classList.add('d-none');
            formInicio.classList.remove('d-none');
            document.getElementById('form-producao').reset();
            // Recarrega os seletores para garantir que estejam atualizados
            carregarSeletores(); 
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    btnSalvarParada.addEventListener('click', async () => {
        const dadosParada = {
            producao_id: producaoAtualId,
            colaborador_parada_id: document.getElementById('parada-colaborador').value,
            data_hora_inicio_parada: document.getElementById('parada-inicio').value,
            data_hora_fim_parada: document.getElementById('parada-fim').value,
            motivo: document.getElementById('parada-motivo').value
        };

        if (!dadosParada.motivo || !dadosParada.data_hora_inicio_parada || !dadosParada.data_hora_fim_parada) {
             alert('Preencha todos os campos da parada.');
             return;
        }

        try {
            const response = await fetch(`${API_URL}/paradas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParada)
            });

            if (!response.ok) throw new Error('Falha ao registrar parada.');

            alert('Parada registrada com sucesso!');
            document.getElementById('form-parada').reset();
            
            const modalEl = document.getElementById('paradaModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    }); 

// Adicione este bloco dentro do seu addEventListener em main.js
// Adicione este código todo dentro do seu addEventListener em main.js

// --- LÓGICA DO HISTÓRICO DE PRODUÇÃO ---
const corpoTabelaProducao = document.getElementById('corpo-tabela-producao');

async function carregarHistoricoProducao() {
    const hoje = new Date().toISOString().split('T')[0];
    try {
        const response = await fetch(`${API_URL}/producao?data=${hoje}`);
        const producoes = await response.json();
        
        corpoTabelaProducao.innerHTML = ''; // Limpa a tabela
        
        producoes.forEach(p => {
            corpoTabelaProducao.innerHTML += `
                <tr>
                    <td>${p.nome_cliente}</td>
                    <td>${p.nome_operador}</td>
                    <td>${p.hora_inicio}</td>
                    <td>${p.hora_fim || 'Em andamento'}</td>
                    <td>${p.quantidade_produzida || '-'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm btn-deletar-producao" data-id="${p.id}">Deletar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar histórico de produção:', error);
    }
}

async function deletarProducao(id) {
    if (!confirm('Tem certeza que deseja deletar este registro de produção?')) {
        return;
    }
    try {
        await fetch(`${API_URL}/producao/${id}`, { method: 'DELETE' });
        alert('Registro deletado com sucesso!');
        carregarHistoricoProducao(); // Atualiza a tabela
    } catch (error) {
        alert('Falha ao deletar registro.');
    }
}

// Adiciona listener para os botões de deletar
corpoTabelaProducao.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-deletar-producao')) {
        const id = event.target.dataset.id;
        deletarProducao(id);
    }
});

// Chame esta função no início e após finalizar uma produção
// No final do seu código de inicialização:
carregarHistoricoProducao();

// E dentro do evento do btnFinalizar, após o alert de sucesso:
// btnFinalizar.addEventListener('click', async () => { ... alert(...); carregarHistoricoProducao(); ... })

    // --- LÓGICA PARA ADICIONAR NOVOS ITENS ---
    const btnSalvarCliente = document.getElementById('btn-salvar-cliente');
    const btnSalvarColaborador = document.getElementById('btn-salvar-colaborador');

    // Evento para salvar um novo cliente
    btnSalvarCliente.addEventListener('click', async () => {
        const nomeCliente = document.getElementById('nome-novo-cliente').value;
        if (!nomeCliente) {
            alert('Por favor, insira o nome do cliente.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_cliente: nomeCliente })
            });

            if (!response.ok) throw new Error('Falha ao adicionar cliente.');

            alert('Cliente adicionado com sucesso!');
            document.getElementById('form-novo-cliente').reset();
            bootstrap.Modal.getInstance(document.getElementById('novoClienteModal')).hide();
            
            // Recarrega as listas para mostrar o novo cliente!
            carregarSeletores(); 

        } catch (error) {
            alert(error.message);
        }
    });

    // Evento para salvar um novo colaborador
    btnSalvarColaborador.addEventListener('click', async () => {
        const nomeColaborador = document.getElementById('nome-novo-colaborador').value;
        const funcao = document.getElementById('funcao-novo-colaborador').value;

        if (!nomeColaborador || !funcao) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/colaboradores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_colaborador: nomeColaborador, funcao: funcao })
            });

            if (!response.ok) throw new Error('Falha ao adicionar colaborador.');

            alert('Colaborador adicionado com sucesso!');
            document.getElementById('form-novo-colaborador').reset();
            bootstrap.Modal.getInstance(document.getElementById('novoColaboradorModal')).hide();

            // Recarrega as listas para mostrar o novo colaborador!
            carregarSeletores();

        } catch (error) {
            alert(error.message);
        }
    });

    carregarSeletores();
});
