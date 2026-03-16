const API_URL = 'https://formacoes-api.onrender.com/imobiliaria-interplanetaria';
const TAXA_CAMBIO_BTC_EUR = 60000; 

// COMUNICAÇÃO COM A API (FETCH)
async function obterPlanetas() {
    try {
        const resposta = await fetch(API_URL);
        const dadosAPI = await resposta.json();

        return dadosAPI.map(planeta => ({
            id: planeta.id.toString(), 
            nome: planeta.nome,
            descricao: planeta.descricao,
            fotos: planeta.fotos, 
            localizacao: { galaxia: planeta.galaxia, sistemaEstrelar: planeta.sistema_estrelar },
            parcela: planeta.parcela_venda,
            dimensoes: { areaTotal: Number(planeta.area_total), areaUtil: Number(planeta.area_util) },
            preco: parseFloat(planeta.preco_btc),
            recursos: {
                fauna: planeta.recursos.fauna !== "none" ? [planeta.recursos.fauna] : [],
                flora: planeta.recursos.flora !== "none" ? [planeta.recursos.flora] : [],
                geologia: planeta.recursos.geologia || []
            },
            vendedor: planeta.vendedor,
            estado: planeta.vendido ? "Vendido" : "Disponível"
        }));
    } catch (erro) {
        console.error("Falha ao comunicar com o centro de comando (API):", erro);
        return [];
    }
}

// Eliminar um planeta via API
async function eliminarPlaneta(id) {
    const confirmacao = confirm('Tem a certeza que deseja eliminar este planeta? Esta ação é irreversível.');

    if (confirmacao) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (resposta.ok) {
                carregarTabelaComando();
            } else {
                alert('Erro ao eliminar o planeta na base de dados galáctica.');
            }
        } catch (erro) {
            console.error("Falha nas comunicações de rede:", erro);
        }
    }
}


// LÓGICA DE FAVORITOS (LOCALSTORAGE)

function obterFavoritos() {
    const favsGuardados = localStorage.getItem('favoritosGalacticos');
    return favsGuardados ? JSON.parse(favsGuardados) : [];
}

function alternarFavorito(id) {
    let favoritos = obterFavoritos();
    
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(favId => favId !== id);
    } else {
        favoritos.push(id);
    }
    
    localStorage.setItem('favoritosGalacticos', JSON.stringify(favoritos));
    
    const filtroAtual = document.getElementById('filtro-recurso') ? document.getElementById('filtro-recurso').value : 'todos';
    carregarMontra(filtroAtual);
}


// MONTRA GALÁCTICA
async function carregarMontra(filtroSelecionado = 'todos') {
    const planetas = await obterPlanetas();
    const contentorGrelha = document.getElementById('grelha-planetas');
    if (!contentorGrelha) return;
    
    contentorGrelha.innerHTML = ''; 
    const favoritos = obterFavoritos();

    let planetasParaMostrar = planetas;
    if (filtroSelecionado !== 'todos') {
        planetasParaMostrar = planetas.filter(planeta => {
            const rec = planeta.recursos;
            return (rec.fauna && rec.fauna.includes(filtroSelecionado)) ||
                   (rec.flora && rec.flora.includes(filtroSelecionado)) ||
                   (rec.geologia && rec.geologia.includes(filtroSelecionado));
        });
    }

    if (planetasParaMostrar.length === 0) {
        contentorGrelha.innerHTML = '<p class="text-slate-400 text-center col-span-full">Nenhum planeta encontrado com este recurso.</p>';
        return;
    }

    planetasParaMostrar.forEach(planeta => {
        const estimativaEuros = (planeta.preco * TAXA_CAMBIO_BTC_EUR).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
        const fallbackImagem = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop";
        
        const eFavorito = favoritos.includes(planeta.id);
        const corEstrela = eFavorito ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400';
        const iconeEstrela = eFavorito ? '★' : '☆';

        const cartaoHTML = `
            <article class="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 relative">
                <button onclick="alternarFavorito('${planeta.id}')" 
                        class="absolute top-3 right-3 z-10 text-3xl drop-shadow-md cursor-pointer transition-colors ${corEstrela}"
                        title="Marcar como Favorito">
                    ${iconeEstrela}
                </button>

                <img src="${planeta.fotos[0]}" 
                     alt="Vista orbital de ${planeta.nome}" 
                     class="w-full h-48 object-cover"
                     onerror="this.onerror=null; this.src='${fallbackImagem}';">
                
                <div class="p-5">
                    <h2 class="text-2xl font-bold text-white mb-2">${planeta.nome}</h2>
                    <p class="text-slate-400 mb-4 flex items-center">
                        <span class="mr-2">🌌</span> Galáxia: ${planeta.localizacao.galaxia}
                    </p>
                    
                    <div class="bg-slate-900 p-3 rounded-lg border border-slate-700">
                        <p class="text-blue-400 font-bold text-lg">${planeta.preco} BTC</p>
                        <p class="text-sm text-slate-500">≈ ${estimativaEuros}</p>
                    </div>

                    <a href="detalhes.html?id=${planeta.id}" class="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition-colors">
                        Explorar Planeta
                    </a>
                </div>
            </article>
        `;
        contentorGrelha.innerHTML += cartaoHTML;
    });
}

// CENTRO DE COMANDO (TABELA)
async function carregarTabelaComando() {
    const planetas = await obterPlanetas();
    const corpoTabela = document.getElementById('tabela-planetas');
    if (!corpoTabela) return; 

    corpoTabela.innerHTML = ''; 

    planetas.forEach(planeta => {
        const corStatus = planeta.estado === "Disponível" ? "text-green-400" : "text-red-400";

        const linhaHTML = `
            <tr class="hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 font-mono text-slate-400">${planeta.id}</td>
                <td class="px-6 py-4 font-medium text-white">${planeta.nome}</td>
                <td class="px-6 py-4">${planeta.vendedor}</td>
                <td class="px-6 py-4 font-bold text-blue-400">${planeta.preco}</td>
                <td class="px-6 py-4 font-semibold ${corStatus}">${planeta.estado}</td>
                <td class="px-6 py-4 flex justify-center space-x-3">
                    <a href="registo.html?id=${planeta.id}" class="text-yellow-400 hover:text-yellow-300 font-medium">Editar</a>
                    <button onclick="eliminarPlaneta('${planeta.id}')" class="text-red-500 hover:text-red-400 font-medium">Eliminar</button>
                </td>
            </tr>
        `;
        corpoTabela.innerHTML += linhaHTML;
    });
}

// REGISTO DE DESCOBERTA
async function configurarFormulario() {
    const formulario = document.getElementById('formulario-planeta');
    if (!formulario) return; 

    const parametrosUrl = new URLSearchParams(window.location.search);
    const idEdicao = parametrosUrl.get('id');
    
    let planetaExistente = null; 

    if (idEdicao) {
        document.getElementById('titulo-formulario').innerText = "Editar Planeta";
        
        try {
            const planetas = await obterPlanetas();
            planetaExistente = planetas.find(p => p.id === idEdicao);
            
            if (planetaExistente) {
                document.getElementById('nome').value = planetaExistente.nome;
                document.getElementById('vendedor').value = planetaExistente.vendedor;
                document.getElementById('preco').value = planetaExistente.preco;
                document.getElementById('galaxia').value = planetaExistente.localizacao.galaxia;
                document.getElementById('sistema_estrelar').value = planetaExistente.localizacao.sistemaEstrelar;
                document.getElementById('descricao').value = planetaExistente.descricao;
                document.getElementById('parcela').value = planetaExistente.parcela;
                document.getElementById('area_total').value = planetaExistente.dimensoes.areaTotal;
                document.getElementById('area_util').value = planetaExistente.dimensoes.areaUtil;
                document.getElementById('fauna').value = planetaExistente.recursos.fauna.length > 0 ? planetaExistente.recursos.fauna[0] : "none";
                document.getElementById('flora').value = planetaExistente.recursos.flora.length > 0 ? planetaExistente.recursos.flora[0] : "none";
                document.getElementById('vendido').value = planetaExistente.estado === "Vendido" ? "true" : "false";
                
                
                const geoArray = planetaExistente.recursos.geologia || [];
                document.querySelectorAll('input[name="geologia"]').forEach(cb => {
                    cb.checked = geoArray.includes(cb.value);
                });

                if (planetaExistente.fotos && planetaExistente.fotos.length > 0) {
                    document.getElementById('fotoUrl').value = planetaExistente.fotos[0];
                }
            }
        } catch (erro) {
            console.error("Erro ao preencher o formulário:", erro);
        }
    }

    // Criação e Edição
    formulario.addEventListener('submit', async function(evento) {
        evento.preventDefault(); 

        const checkboxesGeologia = document.querySelectorAll('input[name="geologia"]:checked');
        const arrayGeologia = Array.from(checkboxesGeologia).map(cb => cb.value);

        const valorFoto = document.getElementById('fotoUrl').value;
        const fallbackFoto = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop";

        const dadosFinais = {
            nome: document.getElementById('nome').value,
            vendedor: document.getElementById('vendedor').value,
            preco_btc: parseFloat(document.getElementById('preco').value).toFixed(8),
            galaxia: document.getElementById('galaxia').value,
            sistema_estrelar: document.getElementById('sistema_estrelar').value,
            descricao: document.getElementById('descricao').value,
            parcela_venda: document.getElementById('parcela').value,
            area_total: document.getElementById('area_total').value.toString(),
            area_util: document.getElementById('area_util').value.toString(),
            vendido: document.getElementById('vendido').value === "true",
            recursos: { 
                fauna: document.getElementById('fauna').value, 
                flora: document.getElementById('flora').value, 
                geologia: arrayGeologia 
            },
            fotos: valorFoto ? [valorFoto] : (planetaExistente ? planetaExistente.fotos : [fallbackFoto])
        };

        const urlFetch = idEdicao ? `${API_URL}/${idEdicao}` : API_URL;
        const metodoFetch = idEdicao ? 'PUT' : 'POST'; 

        try {
            const resposta = await fetch(urlFetch, {
                method: metodoFetch,
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(dadosFinais)
            });

            if (resposta.ok) {
                alert(`Planeta ${idEdicao ? 'editado' : 'criado'} com sucesso!`);
                window.location.href = "comando.html";
            } else {
                const msgErro = await resposta.text();
                alert(`Erro na API (Status ${resposta.status}): ${msgErro}`);
            }
        } catch (erro) {
            console.error("Erro na comunicação com a API:", erro);
        }
    });
}

// --- PÁGINA DE DETALHES ---
async function carregarDetalhes() {
    const container = document.getElementById('detalhes-planeta-container');
    if (!container) return; 

    const parametrosUrl = new URLSearchParams(window.location.search);
    const idPlaneta = parametrosUrl.get('id');

    if (!idPlaneta) {
        document.getElementById('mensagem-carregamento').innerText = "Erro: Nenhum planeta especificado.";
        return;
    }

    const planetas = await obterPlanetas();
    const planeta = planetas.find(p => p.id === idPlaneta);

    if (!planeta) {
        document.getElementById('mensagem-carregamento').innerText = "Erro: Planeta não encontrado nos nossos registos.";
        return;
    }

    const estimativaEuros = (planeta.preco * TAXA_CAMBIO_BTC_EUR).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

    document.getElementById('detalhe-nome').innerText = planeta.nome;
    document.getElementById('detalhe-localizacao').innerText = `${planeta.localizacao.galaxia} / ${planeta.localizacao.sistemaEstrelar}`;
    document.getElementById('detalhe-preco').innerText = `${planeta.preco} BTC`;
    document.getElementById('detalhe-euros').innerText = `≈ ${estimativaEuros}`;
    document.getElementById('detalhe-descricao').innerText = planeta.descricao;
    document.getElementById('detalhe-parcela').innerText = planeta.parcela;
    document.getElementById('detalhe-vendedor').innerText = planeta.vendedor;
    document.getElementById('detalhe-areatotal').innerText = `${planeta.dimensoes.areaTotal.toLocaleString('pt-PT')} km²`;

    const elemEstado = document.getElementById('detalhe-estado');
    elemEstado.innerText = planeta.estado;
    elemEstado.className = planeta.estado === "Disponível" ? "font-medium text-green-400" : "font-medium text-red-400";

    const listaRecursos = document.getElementById('detalhe-recursos');
    const rec = planeta.recursos;
    let htmlRecursos = '';
    
    if (rec.fauna && rec.fauna.length > 0) htmlRecursos += `<li><span class="font-bold text-blue-300">Fauna:</span> ${rec.fauna.join(', ')}</li>`;
    if (rec.flora && rec.flora.length > 0) htmlRecursos += `<li><span class="font-bold text-green-300">Flora:</span> ${rec.flora.join(', ')}</li>`;
    if (rec.geologia && rec.geologia.length > 0) htmlRecursos += `<li><span class="font-bold text-yellow-300">Geologia:</span> ${rec.geologia.join(', ')}</li>`;
    if (htmlRecursos === '') htmlRecursos = '<li class="text-slate-500">Nenhum recurso registado.</li>';
    listaRecursos.innerHTML = htmlRecursos;

    const galeria = document.getElementById('galeria-fotos');
    const fallbackImagem = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop";
    
    planeta.fotos.forEach((fotoUrl, index) => {
        galeria.innerHTML += `
            <img src="${fotoUrl}" 
                 alt="Foto ${index + 1} de ${planeta.nome}" 
                 class="w-full h-64 object-cover rounded-lg border border-slate-700 shadow-md hover:scale-105 transition-transform duration-300"
                 onerror="this.onerror=null; this.src='${fallbackImagem}';">
        `;
    });

    document.getElementById('mensagem-carregamento').classList.add('hidden');
    document.getElementById('conteudo-detalhes').classList.remove('hidden');
}


// GESTOR DE PÁGINAS (INICIALIZAÇÃO)
document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('grelha-planetas')) {
        carregarMontra();
        
        const selectFiltro = document.getElementById('filtro-recurso');
        if (selectFiltro) {
            selectFiltro.addEventListener('change', (evento) => {
                carregarMontra(evento.target.value);
            });
        }
    }
    
    if (document.getElementById('tabela-planetas')) {
        carregarTabelaComando();
    }

    if (document.getElementById('formulario-planeta')) {
        configurarFormulario();
    }

    if (document.getElementById('detalhes-planeta-container')) {
        carregarDetalhes();
    }
});