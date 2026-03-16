// Dados simulados para usarmos enquanto não há API
const planetasMock = [
    {
        id: "123e4567-e89b-12d3-a456-426614174001",
        nome: "Nova Sintra IV",
        descricao: "Clima temperado com gravidade similar à Terra.",
        fotos: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop"],
        localizacao: { galaxia: "Andrómeda", sistemaEstrelar: "Alpha Lusi" },
        parcela: "Planeta Inteiro",
        dimensoes: { areaTotal: 510000000, areaUtil: 150000000 },
        preco: 2.5,
        recursos: {
            fauna: ["terrestre", "marisco"],
            flora: ["madeireira"],
            geologia: ["minerio", "liquido"]
        },
        vendedor: "Fernão Mendes Pinto",
        estado: "Disponível"
    },
    {
        id: "123e4567-e89b-12d3-a456-426614174002",  
        nome: "Lusitânia Prime",
        descricao: "Planeta gasoso ideal para extração.",
        fotos: ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop"],
        localizacao: { galaxia: "Via Láctea", sistemaEstrelar: "Orion" },
        parcela: "Hemisfério",
        dimensoes: { areaTotal: 800000000, areaUtil: 0 },
        preco: 1.2,
        recursos: {
            fauna: ["insetos"],
            flora: [],
            geologia: ["gas"]
        },
        vendedor: "Vasco da Gama Spaceways",
        estado: "Disponível"
    },
    {
        id: "123e4567-e89b-12d3-a456-426614174003",
        nome: "Éden Aquático",
        descricao: "Oceano global com flora ornamental exótica.",
        fotos: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop"],
        localizacao: { galaxia: "Andrómeda", sistemaEstrelar: "Beta Lusi" },
        parcela: "Planeta Inteiro",
        dimensoes: { areaTotal: 400000000, areaUtil: 400000000 },
        preco: 4.0,
        recursos: {
            fauna: ["aquatico"],
            flora: ["ornamental"],
            geologia: ["liquido"]
        },
        vendedor: "Fernão Mendes Pinto",
        estado: "Vendido"
    }
];
 
// Função futura para o fetch da API
async function obterPlanetas() {
    // Quando tivermos o link da API, apagamos o 'return planetasMock'
    // e usamos o fetch() aqui
    return planetasMock;
}
 
const TAXA_CAMBIO_BTC_EUR = 60000;
 
// --- LÓGICA DE FAVORITOS (Requisito Adicional) ---
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
 
 
// --- LÓGICA DA MONTRA (Atualizada com Filtros e Favoritos) ---
 
async function carregarMontra(filtroSelecionado = 'todos') {
    const planetas = await obterPlanetas();
    const contentorGrelha = document.getElementById('grelha-planetas');
    if (!contentorGrelha) return;
   
    contentorGrelha.innerHTML = '';
    const favoritos = obterFavoritos();
 
    // Filtra em memória os planetas por "Tipo de Recurso"
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
 
async function carregarTabelaComando() {
    const planetas = await obterPlanetas();
    const corpoTabela = document.getElementById('tabela-planetas');
   
    if (!corpoTabela) return;
 
    corpoTabela.innerHTML = '';
 
    planetas.forEach(planeta => {
        const idCurto = planeta.id.substring(0, 8) + '...';
       
        const corStatus = planeta.estado === "Disponível" ? "text-green-400" : "text-red-400";
 
        const linhaHTML = `
            <tr class="hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 font-mono text-slate-400" title="${planeta.id}">${idCurto}</td>
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
 
// Função para eliminar um planeta da base de dados
async function eliminarPlaneta(id) {
    const confirmacao = confirm('Tem a certeza que deseja eliminar este planeta? Esta ação é irreversível.');
 
    if (confirmacao) {
        try {
            // --- PREPARAÇÃO PARA A API REAL ---
            // Quando tiveres o link, descomenta o bloco abaixo e coloca o link correto.
 
            /*
            const resposta = await fetch(`URL_DA_TUA_API_AQUI/${id}`, {
                method: 'DELETE', // O verbo exigido pelo guião
            });
 
            if (resposta.ok) {
                // Recarrega a tabela imediatamente para refletir a eliminação
                carregarTabelaComando();
            } else {
                alert('Erro ao eliminar o planeta.');
            }
            */
 
            const index = planetasMock.findIndex(p => p.id === id);
            if (index > -1) {
                planetasMock.splice(index, 1);
            }
 
            carregarTabelaComando();
 
        } catch (erro) {
            console.error("Falha nas comunicações de rede:", erro);
        }
    }
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
 
// --- GESTOR DE PÁGINAS ---
document.addEventListener('DOMContentLoaded', () => {
   
    if (document.getElementById('grelha-planetas')) {
        carregarMontra();
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
 
 
// --- LÓGICA DO REGISTO DE DESCOBERTA (FORMULÁRIO) ---
 
async function configurarFormulario() {
    const formulario = document.getElementById('formulario-planeta');
    if (!formulario) return;
 
    const parametrosUrl = new URLSearchParams(window.location.search);
    const idEdicao = parametrosUrl.get('id');
 
    if (idEdicao) {
        document.getElementById('titulo-formulario').innerText = "Editar Planeta";
        // Quando a API estiver pronta, farias aqui um fetch GET para preencher os inputs com os dados do planeta
        console.log(`Modo Edição ativado para o ID: ${idEdicao}`);
    }
 
    formulario.addEventListener('submit', async function(evento) {
        evento.preventDefault();
 
       
        const dadosPlaneta = {
            nome: document.getElementById('nome').value,
            preco: parseFloat(document.getElementById('preco').value),
            localizacao: { galaxia: document.getElementById('galaxia').value },
            fotos: [document.getElementById('fotoUrl').value]
        };
 
        // --- PREPARAÇÃO PARA A API REAL ---
        const urlBaseApi = 'URL_DA_TUA_API_AQUI'; // O link da api
        let urlFetch = urlBaseApi;
        let metodoFetch = 'POST';
 
        if (idEdicao) {
            urlFetch = `${urlBaseApi}/${idEdicao}`;
            metodoFetch = 'PUT';
        }
 
        try {
            /* QUANDO TIVER O LINK DA API, DESCOMENTAR ESTE BLOCO:
            const resposta = await fetch(urlFetch, {
                method: metodoFetch,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosPlaneta)
            });
 
            if (resposta.ok) {
                window.location.href = "comando.html";
            } else {
                alert('Erro ao guardar os dados do planeta na API.');
            }
            */
 
           
            alert(`Simulação: Planeta ${idEdicao ? 'editado' : 'criado'} com sucesso!`);
           
            window.location.href = "comando.html";
 
        } catch (erro) {
            console.error("Erro na comunicação com a API:", erro);
        }
    });
}