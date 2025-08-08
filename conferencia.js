document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';

    // Elementos do DOM
    const formConferencia = document.getElementById('form-conferencia');
    const inputData = document.getElementById('data-conferencia');
    const tabelaHistorico = document.getElementById('tabela-historico');
    const corpoTabela = document.getElementById('corpo-tabela-historico');
    const msgHistoricoVazio = document.getElementById('historico-vazio');

    /**
     * Carrega a lista de colaboradores no seletor de conferentes.
     */
    async function carregarConferentes() {
        try {
            const response = await fetch(`${API_URL}/colaboradores`);
            if (!response.ok) throw new Error('Falha ao buscar colaboradores.');
            
            const colaboradores = await response.json();
            const selectConferente = document.getElementById('conferente');
            selectConferente.innerHTML = '<option value="">Selecione um conferente</option>';

            colaboradores.forEach(col => {
                selectConferente.innerHTML += `<option value="${col.id}">${col.nome}</option>`;
            });
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    }

    /**
     * Busca o histórico de conferências para a data selecionada e exibe na tabela.
     * @param {string} data - A data no formato 'AAAA-MM-DD'.
     */
    async function buscarHistorico(data) {
        if (!data) {
            tabelaHistorico.classList.add('d-none');
            msgHistoricoVazio.textContent = 'Selecione uma data para ver os registros.';
            msgHistoricoVazio.classList.remove('d-none');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/conferencia?data=${data}`);
            if (!response.ok) throw new Error('Falha ao buscar histórico.');

            const historico = await response.json();
            corpoTabela.innerHTML = ''; // Limpa a tabela antes de preencher

            if (historico.length === 0) {
                tabelaHistorico.classList.add('d-none');
                msgHistoricoVazio.textContent = 'Nenhum registro encontrado para esta data.';
                msgHistoricoVazio.classList.remove('d-none');
            } else {
                tabelaHistorico.classList.remove('d-none');
                msgHistoricoVazio.classList.add('d-none');

    historico.forEach(reg => {
        const dataRegistro = new Date(reg.data_registro).toLocaleTimeString('pt-BR');
        corpoTabela.innerHTML += `
            <tr>
                <td>${reg.total_produzido_dia}</td>
                <td>${reg.perda_tipo_a}</td>
                <td>${reg.perda_tipo_b}</td>
                <td>${reg.conferente_nome}</td>
                <td>${dataRegistro}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-deletar-conferencia" data-id="${reg.id}">Deletar</button>
                </td>
            </tr>
        `;
    });
            }
        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    }
    // Adicione este código dentro do seu addEventListener em conferencia.js

async function deletarConferencia(id) {
    if (!confirm('Tem certeza que deseja deletar este registro de conferência?')) {
        return;
    }
    try {
        await fetch(`${API_URL}/conferencia/${id}`, { method: 'DELETE' });
        alert('Registro deletado com sucesso!');
        buscarHistorico(document.getElementById('data-conferencia').value); // Atualiza a tabela
    } catch (error) {
        alert('Falha ao deletar registro.');
    }
}

corpoTabela.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-deletar-conferencia')) {
        const id = event.target.dataset.id;
        deletarConferencia(id);
    }
});

    /**
     * Lida com o envio do formulário de conferência.
     */
    formConferencia.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const dadosConferencia = {
            data_conferencia: inputData.value,
            total_produzido_dia: document.getElementById('total-produzido').value,
            perda_tipo_a: document.getElementById('perda-tipo-a').value,
            perda_tipo_b: document.getElementById('perda-tipo-b').value,
            conferente_id: document.getElementById('conferente').value,
        };

        if (!dadosConferencia.data_conferencia || !dadosConferencia.total_produzido_dia || !dadosConferencia.conferente_id) {
            alert('Por favor, preencha Data, Total Produzido e Conferente.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/conferencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosConferencia)
            });

            if (!response.ok) throw new Error('Falha ao salvar o registro de conferência.');
            
            alert('Conferência registrada com sucesso!');
            formConferencia.reset(); // Limpa o formulário
            inputData.value = dadosConferencia.data_conferencia; // Mantém a data selecionada
            buscarHistorico(dadosConferencia.data_conferencia); // Atualiza a tabela de histórico

        } catch (error) {
            console.error('Erro:', error);
            alert(error.message);
        }
    });

    // Adiciona um evento que busca o histórico sempre que a data é alterada.
    inputData.addEventListener('change', () => {
        buscarHistorico(inputData.value);
    });

    // --- INICIALIZAÇÃO ---
    // Define a data de hoje como padrão no campo de data
    inputData.value = new Date().toISOString().split('T')[0];
    // Carrega a lista de conferentes e o histórico do dia atual ao carregar a página
    carregarConferentes();
    buscarHistorico(inputData.value);
});