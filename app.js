// Dados simulados para usarmos enquanto a API real não chega
const planetasMock = [
    {
        id: "123e4567-e89b-12d3-a456-426614174000", 
        nome: "Nova Sintra IV", 
        descricao: "Clima temperado com gravidade similar à Terra. Excelente potencial de habitação para amantes de montanhas.", 
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
        id: "123e4567-e89b-12d3-a456-426614174000", 
        nome: "Nova Sintra IV", 
        descricao: "Clima temperado com gravidade similar à Terra. Excelente potencial de habitação para amantes de montanhas.", 
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
        id: "123e4567-e89b-12d3-a456-426614174000", 
        nome: "Nova Sintra IV", 
        descricao: "Clima temperado com gravidade similar à Terra. Excelente potencial de habitação para amantes de montanhas.", 
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
];

// Função que no futuro fará o fetch da API
async function obterPlanetas() {
    // Quando o professor der o link, apagamos o 'return planetasMock' 
    // e usamos o fetch() aqui!
    return planetasMock;
}

// Taxa de câmbio fictícia
const TAXA_CAMBIO_BTC_EUR = 60000; 

// Função para os cartões no ecrã
async function carregarMontra() {
    const planetas = await obterPlanetas();
    const contentorGrelha = document.getElementById('grelha-planetas');
    
    contentorGrelha.innerHTML = ''; 

    planetas.forEach(planeta => {
        const estimativaEuros = (planeta.preco * TAXA_CAMBIO_BTC_EUR).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
        
        // Imagem de substituição "Espaço Profundo" caso a original falhe
        const fallbackImagem = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop";

        // Criação da estrutura do cartão
        const cartaoHTML = `
            <article class="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
                
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

document.addEventListener('DOMContentLoaded', carregarMontra);