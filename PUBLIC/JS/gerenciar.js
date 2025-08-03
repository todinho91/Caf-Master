document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    const listaClientesEl = document.getElementById('lista-clientes');
    const listaColaboradoresEl = document.getElementById('lista-colaboradores');

    // Função para carregar e exibir as listas
    async function carregarListas() {
        try {
            const [clientesRes, colaboradoresRes] = await Promise.all([
                fetch(`${API_URL}/clientes`),
                fetch(`${API_URL}/colaboradores`)
            ]);
            const clientes = await clientesRes.json();
            const colaboradores = await colaboradoresRes.json();

            // Limpa as listas antes de preencher
            listaClientesEl.innerHTML = '';
            listaColaboradoresEl.innerHTML = '';

            // Preenche a lista de clientes
            clientes.forEach(cliente => {
                listaClientesEl.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${cliente.nome}
                        <button class="btn btn-danger btn-sm btn-deletar" data-id="${cliente.id}" data-tipo="cliente">Deletar</button>
                    </li>
                `;
            });

            // Preenche a lista de colaboradores
            colaboradores.forEach(col => {
                listaColaboradoresEl.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${col.nome} <span class="badge bg-secondary">${col.funcao}</span>
                        <button class="btn btn-danger btn-sm btn-deletar" data-id="${col.id}" data-tipo="colaborador">Deletar</button>
                    </li>
                `;
            });

        } catch (error) {
            console.error("Erro ao carregar listas:", error);
            alert('Não foi possível carregar os dados do servidor.');
        }
    }

    // Função para deletar um item
    // Em PUBLIC/JS/gerenciar.js, substitua esta função

async function deletarItem(id, tipo) {
    if (!confirm(`Tem certeza que deseja deletar este ${tipo}? A ação não pode ser desfeita.`)) {
        return;
    }

    try {
        
        let url = `${API_URL}/${tipo}s/${id}`;
        if (tipo === 'colaborador') {
            url = `${API_URL}/colaboradores/${id}`; // O plural correto é "colaboradores"
        }

        const response = await fetch(url, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Falha ao deletar ${tipo}.`);

        alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} deletado com sucesso!`);
        carregarListas(); // Recarrega as listas para refletir a remoção

    } catch (error) {
        alert(error.message);
    }
}

    // Adiciona um único listener para capturar cliques nos botões de deletar
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-deletar')) {
            const id = event.target.dataset.id;
            const tipo = event.target.dataset.tipo;
            deletarItem(id, tipo);
        }
    });

    // Carrega as listas ao iniciar a página
    carregarListas();
});