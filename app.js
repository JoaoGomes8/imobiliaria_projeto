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
            fotos2: planeta.fotos2,
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

// Função para navegar na galeria de imagens
function navegarGaleria(planetaId, direcao) {
    const galeriaElement = document.getElementById(`galeria-${planetaId}`);
    const fotoAtualElement = document.getElementById(`foto-atual-${planetaId}`);
    const fotoTotalElement = document.getElementById(`foto-total-${planetaId}`);
    
    if (!galeriaElement || !fotoAtualElement || !fotoTotalElement) return;
    
    const totalFotos = parseInt(fotoTotalElement.textContent);
    let indiceAtual = parseInt(fotoAtualElement.textContent) - 1;
    
    indiceAtual += direcao;
    if (indiceAtual < 0) indiceAtual = totalFotos - 1;
    if (indiceAtual >= totalFotos) indiceAtual = 0;
    
    const deslocamento = indiceAtual * 100;
    galeriaElement.style.transform = `translateX(-${deslocamento}%)`;
    
    fotoAtualElement.textContent = indiceAtual + 1;
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

        const fotosParaMostrar = (planeta.fotos2 && planeta.fotos2.length > 0) ? planeta.fotos2 : planeta.fotos;
        const temFotos = fotosParaMostrar && fotosParaMostrar.length > 0;
        const mostraNavegacao = temFotos && fotosParaMostrar.length > 1;

        const cartaoHTML = `
            <article class="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 relative">
                <button onclick="alternarFavorito('${planeta.id}')" 
                        class="absolute top-3 right-3 z-10 text-3xl drop-shadow-md cursor-pointer transition-colors ${corEstrela}"
                        title="Marcar como Favorito">
                    ${iconeEstrela}
                </button>

                <div class="relative bg-slate-900 h-48 overflow-hidden group">
                    <div class="galeria-fotos flex transition-transform duration-300 h-full" id="galeria-${planeta.id}">
                        ${temFotos 
                            ? fotosParaMostrar.map((foto, idx) => `
                                <img src="${foto}" 
                                     alt="Vista orbital de ${planeta.nome} (${idx + 1}/${fotosParaMostrar.length})" 
                                     class="w-full h-48 object-cover flex-shrink-0"
                                     onerror="this.onerror=null; this.src='${fallbackImagem}';">
                            `).join('')
                            : `<img src="${fallbackImagem}" 
                                  alt="Imagem padrão" 
                                  class="w-full h-48 object-cover">`
                        }
                    </div>
                    
                    ${mostraNavegacao ? `
                        <button class="navegacao-foto anterior absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                                onclick="navegarGaleria('${planeta.id}', -1)">
                            ❮
                        </button>
                        <button class="navegacao-foto proximo absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                                onclick="navegarGaleria('${planeta.id}', 1)">
                            ❯
                        </button>
                        <div class="absolute bottom-2 right-3 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            <span id="foto-atual-${planeta.id}">1</span>/<span id="foto-total-${planeta.id}">${fotosParaMostrar.length}</span>
                        </div>
                    ` : ''}
                </div>
                
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

                // Preencher com as fotos existentes
                if (planetaExistente.fotos2 && planetaExistente.fotos2.length > 0) {
                    const containerFotos = document.getElementById('container-fotos');
                    containerFotos.innerHTML = '';
                    
                    planetaExistente.fotos2.forEach((foto, idx) => {
                        if (idx === 0) {
                            containerFotos.innerHTML += `
                                <input type="url" class="foto-url w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" placeholder="https://..." data-foto-index="${idx}" value="${foto}">
                            `;
                        } else {
                            const novoInput = document.createElement('div');
                            novoInput.className = 'flex gap-2 items-center';
                            novoInput.innerHTML = `
                                <input type="url" class="foto-url flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" placeholder="https://..." data-foto-index="${idx}" value="${foto}">
                                <button type="button" class="remover-foto-btn bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded transition-colors">Remover</button>
                            `;
                            containerFotos.appendChild(novoInput);
                            novoInput.querySelector('.remover-foto-btn').addEventListener('click', function(e) {
                                e.preventDefault();
                                novoInput.remove();
                            });
                        }
                    });
                    contadorFotos = planetaExistente.fotos2.length;
                }
            }
        } catch (erro) {
            console.error("Erro ao preencher o formulário:", erro);
        }
    }

    // Inicializar botão de adicionar fotos (funciona em novo e edição)
    const btnAdicionarFoto = document.getElementById('adicionar-foto-btn');
    const containerFotos = document.getElementById('container-fotos');
    let contadorFotos = containerFotos.querySelectorAll('.foto-url').length;

    if (btnAdicionarFoto) {
        btnAdicionarFoto.addEventListener('click', function(e) {
            e.preventDefault();
            const novoInput = document.createElement('div');
            novoInput.className = 'flex gap-2 items-center';
            novoInput.innerHTML = `
                <input type="url" class="foto-url flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500" placeholder="https://..." data-foto-index="${contadorFotos}">
                <button type="button" class="remover-foto-btn bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded transition-colors">Remover</button>
            `;
            containerFotos.appendChild(novoInput);
            contadorFotos++;

            // Adicionar event listener para o botão remover
            novoInput.querySelector('.remover-foto-btn').addEventListener('click', function(e) {
                e.preventDefault();
                novoInput.remove();
            });
        });
    }

    // Criação e Edição
    formulario.addEventListener('submit', async function(evento) {
        evento.preventDefault(); 

        const checkboxesGeologia = document.querySelectorAll('input[name="geologia"]:checked');
        const arrayGeologia = Array.from(checkboxesGeologia).map(cb => cb.value);

        // Recolher todas as URLs de fotos (fotos2 - URLs externas)
        const inputsFotos = document.querySelectorAll('.foto-url');
        const arrayFotos2 = [];
        inputsFotos.forEach(input => {
            if (input.value.trim()) {
                arrayFotos2.push(input.value.trim());
            }
        });

        // Preparar fotos2 - sempre vêm do formulário ou do original
        let fotos2Finais;
        if (arrayFotos2.length > 0) {
            // Utilizador adicionou fotos novas
            fotos2Finais = arrayFotos2;
        } else if (planetaExistente?.fotos2) {
            // Mantém as fotos2 originais
            fotos2Finais = planetaExistente.fotos2;
        } else {
            // Nenhuma foto adicional
            fotos2Finais = null;
        }
        
        // Preparar fotos - sempre caminhos locais (nunca URLs do formulário)
        let fotosFinais;
        if (planetaExistente?.fotos && planetaExistente.fotos.length > 0) {
            // Mantém as fotos locais originais
            fotosFinais = planetaExistente.fotos;
        } else {
            // Usa um placeholder se nenhuma existe
            fotosFinais = ["imagens/anuncio/placeholder.png"];
        }

        const dadosFinais = {
            nome: document.getElementById('nome').value,
            vendedor: document.getElementById('vendedor').value,
            preco_btc: parseFloat(document.getElementById('preco').value).toFixed(8),
            galaxia: document.getElementById('galaxia').value,
            sistema_estrelar: document.getElementById('sistema_estrelar').value,
            descricao: document.getElementById('descricao').value,
            parcela_venda: document.getElementById('parcela').value,
            area_total: document.getElementById('area_total').value,
            area_util: document.getElementById('area_util').value,
            vendido: document.getElementById('vendido').value === "true",
            recursos: { 
                fauna: document.getElementById('fauna').value !== "none" ? document.getElementById('fauna').value : "none",
                flora: document.getElementById('flora').value !== "none" ? document.getElementById('flora').value : "none",
                geologia: arrayGeologia 
            },
            fotos: fotosFinais,
            fotos2: fotos2Finais
        };

        console.log('Dados a enviar para a API:', JSON.stringify(dadosFinais, null, 2));

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
                console.error('Erro completo da API:', msgErro);
                alert(`Erro na API (Status ${resposta.status}): ${msgErro}`);
            }
        } catch (erro) {
            console.error("Erro na comunicação com a API:", erro);
            alert("Erro de ligação com o servidor. Verifique a consola (F12) para mais detalhes.");
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
    
    // Usar fotos2 (URLs externas) se existirem, senão usar fotos locais
    const fotosParaMostrar = (planeta.fotos2 && planeta.fotos2.length > 0) ? planeta.fotos2 : planeta.fotos;
    
    if (fotosParaMostrar && fotosParaMostrar.length > 0) {
        fotosParaMostrar.forEach((fotoUrl, index) => {
            galeria.innerHTML += `
                <img src="${fotoUrl}" 
                     alt="Foto ${index + 1} de ${planeta.nome}" 
                     class="w-full h-64 object-cover rounded-lg border border-slate-700 shadow-md hover:scale-105 transition-transform duration-300"
                     onerror="this.onerror=null; this.src='${fallbackImagem}';">
            `;
        });
    } else {
        galeria.innerHTML = `<img src="${fallbackImagem}" alt="Imagem padrão" class="w-full h-64 object-cover rounded-lg border border-slate-700 shadow-md">`;
    }

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