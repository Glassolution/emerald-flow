
/**
 * Catálogo de Produtos Agrícolas
 * Dados mock para o catálogo
 */

export type ProductType = "Herbicida" | "Inseticida" | "Fungicida" | "Fertilizante" | "Adjuvante";
export type ProductUnit = "mL" | "L" | "g" | "kg";

export interface Product {
  id: string;
  nome: string;
  tipo: ProductType;
  dosePadrao: number; // Dose por hectare
  unidade: ProductUnit;
  // Novos campos para ficha completa
  ingredienteAtivo?: string;
  descricao?: string;
  recomendacao?: string;
  observacao?: string;
  imagem?: string;
  classe?: string;
}

/**
 * Lista de produtos agrícolas
 */
export const produtosAgricolas: Product[] = [
  // Produtos Originais (Mantidos)
  {
    id: "1",
    nome: "Glifosato 360",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Herbicida sistêmico não seletivo para controle de plantas daninhas anuais e perenes.",
    recomendacao: "Aplicar em pós-emergência das plantas daninhas. Consultar agrônomo para dose específica.",
    observacao: "Respeitar intervalo de segurança. Uso obrigatório de EPI.",
    imagem: "https://placehold.co/400x600?text=Glifosato+360"
  },
  {
    id: "2",
    nome: "2,4-D Amine",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida seletivo para controle de plantas daninhas de folhas largas.",
    recomendacao: "Indicado para pastagens e culturas de gramíneas. Evitar deriva.",
    observacao: "Extremamente volátil. Cuidado com culturas sensíveis vizinhas.",
    imagem: "https://placehold.co/400x600?text=2,4-D+Amine"
  },
  {
    id: "3",
    nome: "Atrazina",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Atrazina",
    descricao: "Herbicida pré e pós-emergente para controle de folhas largas e gramíneas.",
    recomendacao: "Muito utilizado na cultura do milho. Requer umidade no solo.",
    observacao: "Atenção ao efeito residual no solo (carryover).",
    imagem: "https://placehold.co/400x600?text=Atrazina"
  },
  {
    id: "4",
    nome: "Paraquat",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Paraquat",
    descricao: "Herbicida de contato não seletivo para dessecação.",
    recomendacao: "Ação rápida. Exige boa cobertura do alvo.",
    observacao: "Produto de alta toxicidade. Manusear com extremo cuidado.",
    imagem: "https://placehold.co/400x600?text=Paraquat"
  },
  {
    id: "5",
    nome: "Deltametrina",
    tipo: "Inseticida",
    dosePadrao: 200,
    unidade: "mL",
    ingredienteAtivo: "Deltametrina",
    descricao: "Inseticida piretroide de amplo espectro de ação.",
    recomendacao: "Controle de lagartas e percevejos. Ação de choque.",
    observacao: "Tóxico para abelhas. Evitar aplicação na florada.",
    imagem: "https://placehold.co/400x600?text=Deltametrina"
  },
  {
    id: "6",
    nome: "Lambda-cialotrina",
    tipo: "Inseticida",
    dosePadrao: 150,
    unidade: "mL",
    ingredienteAtivo: "Lambda-cialotrina",
    descricao: "Inseticida piretroide com ação de contato e ingestão.",
    recomendacao: "Eficaz contra lagartas, percevejos e vaquinhas.",
    observacao: "Uso obrigatório de EPI completo.",
    imagem: "https://placehold.co/400x600?text=Lambda"
  },
  {
    id: "7",
    nome: "Tiametoxam",
    tipo: "Inseticida",
    dosePadrao: 100,
    unidade: "mL",
    ingredienteAtivo: "Tiametoxam",
    descricao: "Inseticida neonicotinoide sistêmico.",
    recomendacao: "Controle de pragas sugadoras como pulgões e mosca-branca.",
    observacao: "Alta mobilidade na planta. Proteger colmeias.",
    imagem: "https://placehold.co/400x600?text=Tiametoxam"
  },
  {
    id: "8",
    nome: "Imidacloprido",
    tipo: "Inseticida",
    dosePadrao: 250,
    unidade: "mL",
    ingredienteAtivo: "Imidacloprido",
    descricao: "Inseticida sistêmico do grupo dos neonicotinoides.",
    recomendacao: "Tratamento de sementes e pulverização foliar para sugadores.",
    observacao: "Seguir período de carência rigorosamente.",
    imagem: "https://placehold.co/400x600?text=Imidacloprido"
  },
  {
    id: "9",
    nome: "Mancozebe",
    tipo: "Fungicida",
    dosePadrao: 2.0,
    unidade: "L", // Geralmente KG, mas mantendo L para compatibilidade se for suspensão
    ingredienteAtivo: "Mancozebe",
    descricao: "Fungicida protetor multissítio de amplo espectro.",
    recomendacao: "Preventivo para doenças fúngicas em diversas culturas.",
    observacao: "Importante para manejo de resistência.",
    imagem: "https://placehold.co/400x600?text=Mancozebe"
  },
  {
    id: "10",
    nome: "Tebuconazol",
    tipo: "Fungicida",
    dosePadrao: 500,
    unidade: "mL",
    ingredienteAtivo: "Tebuconazol",
    descricao: "Fungicida sistêmico do grupo dos triazóis.",
    recomendacao: "Controle de ferrugens e manchas foliares.",
    observacao: "Pode causar fitotoxicidade em doses elevadas.",
    imagem: "https://placehold.co/400x600?text=Tebuconazol"
  },
  {
    id: "11",
    nome: "Azoxistrobina",
    tipo: "Fungicida",
    dosePadrao: 400,
    unidade: "mL",
    ingredienteAtivo: "Azoxistrobina",
    descricao: "Fungicida do grupo das estrobilurinas.",
    recomendacao: "Ação preventiva e curativa. Efeito fisiológico positivo.",
    observacao: "Não aplicar com adjuvantes siliconados em certas condições.",
    imagem: "https://placehold.co/400x600?text=Azoxistrobina"
  },
  {
    id: "12",
    nome: "Ciproconazol",
    tipo: "Fungicida",
    dosePadrao: 300,
    unidade: "mL",
    ingredienteAtivo: "Ciproconazol",
    descricao: "Fungicida sistêmico triazol de rápida absorção.",
    recomendacao: "Eficaz contra ferrugens em soja e café.",
    observacao: "Respeitar intervalo de reentrada.",
    imagem: "https://placehold.co/400x600?text=Ciproconazol"
  },
  {
    id: "13",
    nome: "NPK 10-10-10",
    tipo: "Fertilizante",
    dosePadrao: 5.0,
    unidade: "L",
    ingredienteAtivo: "Nitrogênio, Fósforo, Potássio",
    descricao: "Fertilizante foliar balanceado.",
    recomendacao: "Nutrição complementar para diversas culturas.",
    observacao: "Aplicar nas horas mais frescas do dia.",
    imagem: "https://placehold.co/400x600?text=NPK"
  },
  {
    id: "14",
    nome: "Ureia",
    tipo: "Fertilizante",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Nitrogênio",
    descricao: "Fonte de nitrogênio para aplicação foliar.",
    recomendacao: "Estimula o crescimento vegetativo.",
    observacao: "Evitar mistura com produtos alcalinos.",
    imagem: "https://placehold.co/400x600?text=Ureia"
  },
  {
    id: "15",
    nome: "Sulfato de Amônio",
    tipo: "Fertilizante",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Nitrogênio e Enxofre",
    descricao: "Fertilizante e adjuvante para caldas.",
    recomendacao: "Melhora a absorção de herbicidas como glifosato.",
    observacao: "Acidifica a calda.",
    imagem: "https://placehold.co/400x600?text=Sulfato+Amonio"
  },

  // Novos Produtos Adicionados (Solicitação do Usuário)
  {
    id: "16",
    nome: "2,4 D 806 SL AGCN",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida seletivo sistêmico para controle de plantas daninhas de folhas largas em pastagens e culturas.",
    recomendacao: "Aplicar em pós-emergência das plantas daninhas. Evitar aplicação em dias de vento.",
    observacao: "Produto volátil. Respeitar áreas sensíveis.",
    imagem: "https://placehold.co/400x600?text=2,4+D+806"
  },
  {
    id: "17",
    nome: "2,4 D NORTOX",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida hormonal seletivo para dicotiledôneas.",
    recomendacao: "Indicado para limpeza de pastagens e pré-plantio.",
    observacao: "Uso obrigatório de EPI. Atenção à deriva.",
    imagem: "https://placehold.co/400x600?text=2,4+D+Nortox"
  },
  {
    id: "18",
    nome: "ALABAMA",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Picloram",
    descricao: "Herbicida sistêmico para controle de plantas daninhas em pastagens.",
    recomendacao: "Aplicação foliar em pós-emergência.",
    observacao: "Respeitar período de carência para pastejo.",
    imagem: "https://placehold.co/400x600?text=Alabama"
  },
  {
    id: "19",
    nome: "ALACLOR",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Alaclor",
    descricao: "Herbicida pré-emergente para controle de gramíneas e algumas folhas largas.",
    recomendacao: "Utilizado em milho, soja e outras culturas.",
    observacao: "Requer umidade no solo para ativação.",
    imagem: "https://placehold.co/400x600?text=Alaclor"
  },
  {
    id: "20",
    nome: "AMINOL 806",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida concentrado para controle de invasoras de folha larga.",
    recomendacao: "Uso em pastagens, cana-de-açúcar e cereais.",
    observacao: "Alta concentração. Diluir corretamente.",
    imagem: "https://placehold.co/400x600?text=Aminol+806"
  },
  {
    id: "21",
    nome: "ARENA",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para controle de plantas daninhas arbustivas e herbáceas em pastagens.",
    recomendacao: "Aplicação localizada ou em área total.",
    observacao: "Tóxico para culturas de folhas largas.",
    imagem: "https://placehold.co/400x600?text=Arena"
  },
  {
    id: "22",
    nome: "ARREIO",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida sistêmico de alta eficiência para pastagens.",
    recomendacao: "Controle de plantas lenhosas e de difícil controle.",
    observacao: "Evitar contaminação de águas.",
    imagem: "https://placehold.co/400x600?text=Arreio"
  },
  {
    id: "23",
    nome: "ARREMATE",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Triclopir + Fluroxipir",
    descricao: "Herbicida seletivo para pastagens, eficaz contra plantas lenhosas.",
    recomendacao: "Uso em pós-emergência das plantas infestantes.",
    observacao: "Seguir rigorosamente a bula.",
    imagem: "https://placehold.co/400x600?text=Arremate"
  },
  {
    id: "24",
    nome: "ARTYS",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para manejo de pastagens.",
    recomendacao: "Indicado para reformas e manutenção de pastos.",
    observacao: "Cuidado com deriva em culturas sensíveis.",
    imagem: "https://placehold.co/400x600?text=Artys"
  },
  // ATRAZINA já existe (id 3), mas adicionando entrada específica se necessário ou assumindo coberta.
  // Vou adicionar como entrada distinta para manter fidelidade à lista do usuário
  {
    id: "25",
    nome: "ATRAZINA NORTOX",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Atrazina",
    descricao: "Herbicida seletivo para milho, sorgo e cana.",
    recomendacao: "Aplicação em pré ou pós-emergência precoce.",
    observacao: "Agitar bem antes de usar.",
    imagem: "https://placehold.co/400x600?text=Atrazina+Nortox"
  },
  {
    id: "26",
    nome: "AVATI",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "kg",
    ingredienteAtivo: "Terbutilazina",
    descricao: "Herbicida seletivo para cultura do milho.",
    recomendacao: "Controle de folhas largas e gramíneas em pré-emergência.",
    observacao: "Formulação WG. Pré-diluição recomendada.",
    imagem: "https://placehold.co/400x600?text=Avati"
  },
  {
    id: "27",
    nome: "BROWSER",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram",
    descricao: "Herbicida sistêmico para controle de plantas lenhosas.",
    recomendacao: "Uso em pastagens. Aplicação no toco ou foliar.",
    observacao: "Produto persistente no solo.",
    imagem: "https://placehold.co/400x600?text=Browser"
  },
  {
    id: "28",
    nome: "CALARIS",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "Mesotriona + Atrazina",
    descricao: "Herbicida sistêmico para milho.",
    recomendacao: "Pós-emergência para controle de folhas largas e gramíneas.",
    observacao: "Não aplicar em milho pipoca ou doce sem teste.",
    imagem: "https://placehold.co/400x600?text=Calaris"
  },
  {
    id: "29",
    nome: "CAMP D",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Picloram",
    descricao: "Herbicida para pastagens.",
    recomendacao: "Controle de invasoras em áreas de pastoreio.",
    observacao: "Respeitar carência para abate.",
    imagem: "https://placehold.co/400x600?text=Camp+D"
  },
  {
    id: "30",
    nome: "CAMPESTRE 240 SL",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram",
    descricao: "Herbicida seletivo condicional.",
    recomendacao: "Controle de arbustos e invasoras difíceis.",
    observacao: "Uso profissional.",
    imagem: "https://placehold.co/400x600?text=Campestre"
  },
  {
    id: "31",
    nome: "COYOTE",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para limpeza de pasto.",
    recomendacao: "Aplicação foliar plena.",
    observacao: "Evitar deriva.",
    imagem: "https://placehold.co/400x600?text=Coyote"
  },
  {
    id: "32",
    nome: "CRETA",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida sistêmico para pastagens.",
    recomendacao: "Controle de dicotiledôneas indesejáveis.",
    observacao: "Produto classe toxicológica amarela (geralmente).",
    imagem: "https://placehold.co/400x600?text=Creta"
  },
  {
    id: "33",
    nome: "CRUZARO 480 EC",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Triclopir",
    descricao: "Herbicida seletivo para arroz e pastagens.",
    recomendacao: "Controle de plantas lenhosas e aquáticas.",
    observacao: "Pode ser usado em toco.",
    imagem: "https://placehold.co/400x600?text=Cruzaro"
  },
  {
    id: "34",
    nome: "DERRETE",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato + 2,4-D",
    descricao: "Mistura pronta para dessecação.",
    recomendacao: "Manejo de pré-plantio.",
    observacao: "Ação rápida.",
    imagem: "https://placehold.co/400x600?text=Derrete"
  },
  {
    id: "35",
    nome: "DISPARO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida padrão para pastagens.",
    recomendacao: "Controle de molejo e plantas duras.",
    observacao: "Seguir recomendações de segurança.",
    imagem: "https://placehold.co/400x600?text=Disparo"
  },
  {
    id: "36",
    nome: "DMA 806 BR",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida sal dimetilamina.",
    recomendacao: "Controle de folhas largas em diversas culturas.",
    observacao: "Odor característico. Volátil.",
    imagem: "https://placehold.co/400x600?text=DMA+806"
  },
  {
    id: "37",
    nome: "DOMINUM XT",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + Fluroxipir",
    descricao: "Herbicida de tecnologia avançada para pastagens.",
    recomendacao: "Controle de plantas lenhosas resistentes.",
    observacao: "Não afeta gramíneas forrageiras.",
    imagem: "https://placehold.co/400x600?text=Dominum+XT"
  },
  {
    id: "38",
    nome: "DORADO",
    tipo: "Fungicida",
    dosePadrao: 0.5,
    unidade: "L",
    ingredienteAtivo: "Tebuconazol", // Assumindo fungicida comum com esse nome ou similar
    descricao: "Fungicida sistêmico para culturas anuais.",
    recomendacao: "Controle de doenças foliares.",
    observacao: "Alternar princípios ativos.",
    imagem: "https://placehold.co/400x600?text=Dorado"
  },
  {
    id: "39",
    nome: "FAMOSO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida renomado para pastagens.",
    recomendacao: "Limpeza de pastos sujos.",
    observacao: "Evitar dias muito quentes.",
    imagem: "https://placehold.co/400x600?text=Famoso"
  },
  {
    id: "40",
    nome: "FLUROXIPIR NORTOX",
    tipo: "Herbicida",
    dosePadrao: 0.8,
    unidade: "L",
    ingredienteAtivo: "Fluroxipir",
    descricao: "Herbicida para controle de plantas de difícil controle como 'Vassourinha'.",
    recomendacao: "Pós-emergência em pastagens e gramados.",
    observacao: "Pode ser misturado com outros herbicidas.",
    imagem: "https://placehold.co/400x600?text=Fluroxipir"
  },
  {
    id: "41",
    nome: "FRONT",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Picloram",
    descricao: "Herbicida seletivo de ação sistêmica.",
    recomendacao: "Controle de invasoras em pastagens.",
    observacao: "Uso pecuário.",
    imagem: "https://placehold.co/400x600?text=Front"
  },
  {
    id: "42",
    nome: "FUSILADE",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Fluazifop-p-butil",
    descricao: "Herbicida graminicida seletivo.",
    recomendacao: "Controle de gramíneas em culturas de folhas largas (soja, feijão).",
    observacao: "Não controla folhas largas.",
    imagem: "https://placehold.co/400x600?text=Fusilade"
  },
  {
    id: "43",
    nome: "GALIGAN",
    tipo: "Herbicida",
    dosePadrao: 0.5,
    unidade: "L",
    ingredienteAtivo: "Oxyfluorfen",
    descricao: "Herbicida de contato com residual.",
    recomendacao: "Pré e pós-emergência precoce em alho, cebola e florestais.",
    observacao: "Forma barreira química no solo.",
    imagem: "https://placehold.co/400x600?text=Galigan"
  },
  {
    id: "44",
    nome: "GALOP M",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Herbicida sistêmico não seletivo.",
    recomendacao: "Dessecação e controle geral.",
    observacao: "Atenção a culturas transgênicas.",
    imagem: "https://placehold.co/400x600?text=Galop+M"
  },
  {
    id: "45",
    nome: "GARLON 480 BR",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Triclopir",
    descricao: "Herbicida especialista em plantas lenhosas.",
    recomendacao: "Controle de arbustos e árvores invasoras em pastagens.",
    observacao: "Pode ser aplicado no toco ou basal.",
    imagem: "https://placehold.co/400x600?text=Garlon"
  },
  {
    id: "46",
    nome: "GIGANTE 360 CS",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Clomazone",
    descricao: "Herbicida pré-emergente microencapsulado.",
    recomendacao: "Cana-de-açúcar, arroz e tabaco.",
    observacao: "Menor volatilidade devido à formulação CS.",
    imagem: "https://placehold.co/400x600?text=Gigante"
  },
  {
    id: "47",
    nome: "GLI UP 480 SL",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Herbicida para plantio direto.",
    recomendacao: "Eliminação de cobertura vegetal.",
    observacao: "Intervalo de chuva de 4-6 horas.",
    imagem: "https://placehold.co/400x600?text=Gli+Up"
  },
  {
    id: "48",
    nome: "GLIATO",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Glifosato de qualidade.",
    recomendacao: "Controle total de vegetação.",
    observacao: "Não seletivo.",
    imagem: "https://placehold.co/400x600?text=Gliato"
  },
  {
    id: "49",
    nome: "GRANDE BR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para grandes áreas de pastagem.",
    recomendacao: "Controle de invasoras.",
    observacao: "Seguir período de carência.",
    imagem: "https://placehold.co/400x600?text=Grande+BR"
  },
  {
    id: "50",
    nome: "HUMMER",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Imazetapir",
    descricao: "Herbicida sistêmico para leguminosas.",
    recomendacao: "Pós-emergência em soja e feijão.",
    observacao: "Efeito residual.",
    imagem: "https://placehold.co/400x600?text=Hummer"
  },
  {
    id: "51",
    nome: "JACARE",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Picloram",
    descricao: "Herbicida potente para pastagens.",
    recomendacao: "Controle de plantas espinhosas.",
    observacao: "Cuidado no manuseio.",
    imagem: "https://placehold.co/400x600?text=Jacare"
  },
  {
    id: "52",
    nome: "JAGUAR",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + 2,4-D",
    descricao: "Herbicida moderno para pastagens.",
    recomendacao: "Alta eficácia em plantas resistentes.",
    observacao: "Preserva o capim.",
    imagem: "https://placehold.co/400x600?text=Jaguar"
  },
  {
    id: "53",
    nome: "LONGAR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida de longa ação.",
    recomendacao: "Manutenção de pastos limpos.",
    observacao: "Evitar aplicação próxima a cursos d'água.",
    imagem: "https://placehold.co/400x600?text=Longar"
  },
  {
    id: "54",
    nome: "MATTOR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para controle de mato em pasto.",
    recomendacao: "Aplicação tratorizada ou aérea.",
    observacao: "Uso restrito.",
    imagem: "https://placehold.co/400x600?text=Mattor"
  },
  {
    id: "55",
    nome: "MESOTRIONA CANA NORTOX",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "Mesotriona",
    descricao: "Herbicida seletivo para cana-de-açúcar.",
    recomendacao: "Controle de folhas largas e algumas gramíneas.",
    observacao: "Pode causar branqueamento temporário.",
    imagem: "https://placehold.co/400x600?text=Mesotriona"
  },
  {
    id: "56",
    nome: "MIRATO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida sistêmico.",
    recomendacao: "Controle de invasoras em pastagens.",
    observacao: "Seguir bula.",
    imagem: "https://placehold.co/400x600?text=Mirato"
  },
  {
    id: "57",
    nome: "NORTON",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para pastagens.",
    recomendacao: "Eficiente na limpeza de áreas.",
    observacao: "Produto tóxico.",
    imagem: "https://placehold.co/400x600?text=Norton"
  },
  {
    id: "58",
    nome: "NUFURON",
    tipo: "Herbicida",
    dosePadrao: 10,
    unidade: "g",
    ingredienteAtivo: "Metsulfuron-metil",
    descricao: "Herbicida sulfonilureia de baixa dose.",
    recomendacao: "Controle de samambaias e folhas largas.",
    observacao: "Alta potência, cuidado na dosagem.",
    imagem: "https://placehold.co/400x600?text=Nufuron"
  },
  {
    id: "59",
    nome: "PADRON",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram",
    descricao: "Herbicida padrão ouro para plantas lenhosas.",
    recomendacao: "Controle de arbustos resistentes.",
    observacao: "Persistente no solo.",
    imagem: "https://placehold.co/400x600?text=Padron"
  },
  {
    id: "60",
    nome: "PALACE ULTRA S",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida concentrado para pastagens.",
    recomendacao: "Controle amplo de invasoras.",
    observacao: "Tecnologia Ultra S.",
    imagem: "https://placehold.co/400x600?text=Palace"
  },
  {
    id: "61",
    nome: "PAMPA",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para a região dos pampas e cerrado.",
    recomendacao: "Limpeza de campos.",
    observacao: "Respeitar áreas de preservação.",
    imagem: "https://placehold.co/400x600?text=Pampa"
  },
  {
    id: "62",
    nome: "PASTOR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida amigo do pecuarista.",
    recomendacao: "Manutenção de pastagens produtivas.",
    observacao: "Seguir recomendações técnicas.",
    imagem: "https://placehold.co/400x600?text=Pastor"
  },
  {
    id: "63",
    nome: "PICLORAM",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram",
    descricao: "Ingrediente ativo puro para formulações ou uso técnico.",
    recomendacao: "Controle de lenhosas.",
    observacao: "Alto residual.",
    imagem: "https://placehold.co/400x600?text=Picloram"
  },
  {
    id: "64",
    nome: "PIQUE 240 SL",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Picloram",
    descricao: "Herbicida seletivo.",
    recomendacao: "Controle de invasoras em pastagens.",
    observacao: "Uso com receituário agronômico.",
    imagem: "https://placehold.co/400x600?text=Pique"
  },
  {
    id: "65",
    nome: "PISTOL",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida de ação rápida.",
    recomendacao: "Limpeza de pastos.",
    observacao: "Seguir normas de segurança.",
    imagem: "https://placehold.co/400x600?text=Pistol"
  },
  {
    id: "66",
    nome: "PLANADOR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida sistêmico.",
    recomendacao: "Controle de plantas daninhas em pastagens.",
    observacao: "Não pastar logo após aplicação.",
    imagem: "https://placehold.co/400x600?text=Planador"
  },
  {
    id: "67",
    nome: "PLANADOR XT",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + 2,4-D",
    descricao: "Versão XT de alta performance.",
    recomendacao: "Controle de plantas difíceis.",
    observacao: "Tecnologia avançada.",
    imagem: "https://placehold.co/400x600?text=Planador+XT"
  },
  {
    id: "68",
    nome: "PLANADOR XT S",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + 2,4-D",
    descricao: "Versão XT S.",
    recomendacao: "Controle superior em pastagens.",
    observacao: "Consulte o técnico.",
    imagem: "https://placehold.co/400x600?text=Planador+XT+S"
  },
  {
    id: "69",
    nome: "PRECISO XK",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato Potássico",
    descricao: "Glifosato de sal potássico, absorção rápida.",
    recomendacao: "Dessecação eficiente e rápida.",
    observacao: "Ideal para janelas de chuva curtas.",
    imagem: "https://placehold.co/400x600?text=Preciso+XK"
  },
  {
    id: "70",
    nome: "PREND 806",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida hormonal concentrado.",
    recomendacao: "Controle de folhas largas.",
    observacao: "Cuidado com deriva.",
    imagem: "https://placehold.co/400x600?text=Prend"
  },
  {
    id: "71",
    nome: "PROOF",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para pastagens.",
    recomendacao: "Controle de invasoras.",
    observacao: "Produto eficaz.",
    imagem: "https://placehold.co/400x600?text=Proof"
  },
  {
    id: "72",
    nome: "RAIO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida de ação fulminante.",
    recomendacao: "Limpeza de pastagens.",
    observacao: "Seguir instruções do rótulo.",
    imagem: "https://placehold.co/400x600?text=Raio"
  },
  {
    id: "73",
    nome: "RAISOR",
    tipo: "Herbicida",
    dosePadrao: 0.1,
    unidade: "L", // ou kg se for WG
    ingredienteAtivo: "Flumioxazin",
    descricao: "Herbicida pré-emergente com efeito residual.",
    recomendacao: "Controle de banco de sementes.",
    observacao: "Pode ser usado na dessecação.",
    imagem: "https://placehold.co/400x600?text=Raisor"
  },
  {
    id: "74",
    nome: "ROUNDUP WG",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "kg",
    ingredienteAtivo: "Glifosato",
    descricao: "Glifosato granulado de alta solubilidade.",
    recomendacao: "Facilidade no transporte e manuseio.",
    observacao: "Mesma eficiência do líquido.",
    imagem: "https://placehold.co/400x600?text=Roundup+WG"
  },
  {
    id: "75",
    nome: "RUNNER",
    tipo: "Inseticida",
    dosePadrao: 0.2,
    unidade: "L",
    ingredienteAtivo: "Metoxifenozida",
    descricao: "Inseticida acelerador de ecdise.",
    recomendacao: "Controle de lagartas em diversas culturas.",
    observacao: "Seletivo para inimigos naturais.",
    imagem: "https://placehold.co/400x600?text=Runner"
  },
  {
    id: "76",
    nome: "SILVERADO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para pastagens.",
    recomendacao: "Controle de plantas daninhas.",
    observacao: "Uso veterinário/agrícola.",
    imagem: "https://placehold.co/400x600?text=Silverado"
  },
  {
    id: "77",
    nome: "SNIPER",
    tipo: "Inseticida",
    dosePadrao: 0.2,
    unidade: "L",
    ingredienteAtivo: "Fipronil",
    descricao: "Inseticida e cupinicida.",
    recomendacao: "Controle de pragas de solo e foliares.",
    observacao: "Tóxico para abelhas e peixes.",
    imagem: "https://placehold.co/400x600?text=Sniper"
  },
  {
    id: "78",
    nome: "SOBERAN",
    tipo: "Herbicida",
    dosePadrao: 0.3,
    unidade: "L",
    ingredienteAtivo: "Tembotriona",
    descricao: "Herbicida para milho.",
    recomendacao: "Controle de gramíneas e folhas largas em pós-emergência.",
    observacao: "Usar com adjuvante específico.",
    imagem: "https://placehold.co/400x600?text=Soberan"
  },
  {
    id: "79",
    nome: "STARANE 200",
    tipo: "Herbicida",
    dosePadrao: 0.8,
    unidade: "L",
    ingredienteAtivo: "Fluroxipir",
    descricao: "Herbicida específico para 'Vassourinha' e outras resistentes.",
    recomendacao: "Pós-emergência em pastagens.",
    observacao: "Não afeta capim.",
    imagem: "https://placehold.co/400x600?text=Starane"
  },
  {
    id: "80",
    nome: "STOPPER",
    tipo: "Fungicida",
    dosePadrao: 0.5,
    unidade: "L",
    ingredienteAtivo: "Epoxiconazol + Piraclostrobina", // Suposição baseada em misturas comuns
    descricao: "Fungicida misto.",
    recomendacao: "Controle de complexo de doenças.",
    observacao: "Preventivo e curativo.",
    imagem: "https://placehold.co/400x600?text=Stopper"
  },
  {
    id: "81",
    nome: "TEMPEST-E",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida emulsionável.",
    recomendacao: "Controle de invasoras em pastagens.",
    observacao: "Boa absorção.",
    imagem: "https://placehold.co/400x600?text=Tempest"
  },
  {
    id: "82",
    nome: "TEXAS",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para grandes extensões.",
    recomendacao: "Manejo de pastagens.",
    observacao: "Custo-benefício.",
    imagem: "https://placehold.co/400x600?text=Texas"
  },
  {
    id: "83",
    nome: "TOPINAM",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida de combate.",
    recomendacao: "Eliminação de plantas indesejáveis.",
    observacao: "Seguir a bula.",
    imagem: "https://placehold.co/400x600?text=Topinam"
  },
  {
    id: "84",
    nome: "TORDON",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Picloram",
    descricao: "O herbicida mais tradicional para pastagens.",
    recomendacao: "Padrão de referência no mercado.",
    observacao: "Sinônimo de limpeza de pasto.",
    imagem: "https://placehold.co/400x600?text=Tordon"
  },
  {
    id: "85",
    nome: "TORDON ULTRA S",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "2,4-D + Aminopiralide",
    descricao: "Evolução do Tordon.",
    recomendacao: "Maior espectro de controle.",
    observacao: "Tecnologia Ultra.",
    imagem: "https://placehold.co/400x600?text=Tordon+Ultra"
  },
  {
    id: "86",
    nome: "TORDON XT",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + Picloram + 2,4-D",
    descricao: "Tordon com tecnologia XT.",
    recomendacao: "Controle de plantas muito difíceis.",
    observacao: "Máxima eficiência.",
    imagem: "https://placehold.co/400x600?text=Tordon+XT"
  },
  {
    id: "87",
    nome: "TOUCHDOWN",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato Potássico",
    descricao: "Glifosato premium com tecnologia de absorção.",
    recomendacao: "Dessecação e pós-emergência.",
    observacao: "Resistência à chuva.",
    imagem: "https://placehold.co/400x600?text=Touchdown"
  },
  {
    id: "88",
    nome: "TRACTOR",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida forte para o campo.",
    recomendacao: "Limpeza pesada de pastagens.",
    observacao: "Uso tratorizado.",
    imagem: "https://placehold.co/400x600?text=Tractor"
  },
  {
    id: "89",
    nome: "TRICLON",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Triclopir",
    descricao: "Herbicida específico.",
    recomendacao: "Controle de arbustos.",
    observacao: "Aplicação localizada.",
    imagem: "https://placehold.co/400x600?text=Triclon"
  },
  {
    id: "90",
    nome: "TRICLOPIR",
    tipo: "Herbicida",
    dosePadrao: 1.0,
    unidade: "L",
    ingredienteAtivo: "Triclopir",
    descricao: "Ingrediente ativo puro.",
    recomendacao: "Formulação técnica ou genérica.",
    observacao: "Seguir a bula.",
    imagem: "https://placehold.co/400x600?text=Triclopir"
  },
  {
    id: "91",
    nome: "TROLLER",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para terrenos difíceis.",
    recomendacao: "Controle de invasoras em pastagens.",
    observacao: "Eficiência comprovada.",
    imagem: "https://placehold.co/400x600?text=Troller"
  },
  {
    id: "92",
    nome: "TRONADOR ULTRA S",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
    ingredienteAtivo: "Aminopiralide + Picloram",
    descricao: "Herbicida potente.",
    recomendacao: "Controle de plantas lenhosas.",
    observacao: "Alto valor agregado.",
    imagem: "https://placehold.co/400x600?text=Tronador+Ultra+S"
  },
  {
    id: "93",
    nome: "TROP",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Herbicida à base de glifosato.",
    recomendacao: "Controle geral.",
    observacao: "Não seletivo.",
    imagem: "https://placehold.co/400x600?text=Trop"
  },
  {
    id: "94",
    nome: "TROPERO",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida para a lida do campo.",
    recomendacao: "Pastagens limpas.",
    observacao: "Uso profissional.",
    imagem: "https://placehold.co/400x600?text=Tropero"
  },
  {
    id: "95",
    nome: "TUCSON",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida resistente.",
    recomendacao: "Controle de invasoras em clima quente.",
    observacao: "Evitar deriva.",
    imagem: "https://placehold.co/400x600?text=Tucson"
  },
  {
    id: "96",
    nome: "U 46 BR",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
    ingredienteAtivo: "2,4-D",
    descricao: "Herbicida hormonal clássico.",
    recomendacao: "Controle de folhas largas.",
    observacao: "Odor forte.",
    imagem: "https://placehold.co/400x600?text=U+46"
  },
  {
    id: "97",
    nome: "ULTIMATO SC",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "A solução final para invasoras.",
    recomendacao: "Limpeza de pastos.",
    observacao: "Suspensão concentrada.",
    imagem: "https://placehold.co/400x600?text=Ultimato"
  },
  {
    id: "98",
    nome: "VERLON",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
    ingredienteAtivo: "Picloram + 2,4-D",
    descricao: "Herbicida eficaz.",
    recomendacao: "Manutenção de pastagens.",
    observacao: "Seguir normas.",
    imagem: "https://placehold.co/400x600?text=Verlon"
  },
  {
    id: "99",
    nome: "XEQUE MATE",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
    ingredienteAtivo: "Glifosato",
    descricao: "Fim de jogo para as ervas daninhas.",
    recomendacao: "Dessecação total.",
    observacao: "Não seletivo.",
    imagem: "https://placehold.co/400x600?text=Xeque+Mate"
  },
  {
    id: "100",
    nome: "ZARTAN",
    tipo: "Herbicida",
    dosePadrao: 0.5,
    unidade: "kg",
    ingredienteAtivo: "Metribuzin",
    descricao: "Herbicida para soja e batata.",
    recomendacao: "Controle de folhas largas e gramíneas.",
    observacao: "Seletivo.",
    imagem: "https://placehold.co/400x600?text=Zartan"
  }
];

/**
 * Obter produtos por tipo
 */
export function getProdutosPorTipo(tipo: ProductType): Product[] {
  return produtosAgricolas.filter((p) => p.tipo === tipo);
}

/**
 * Buscar produto por ID
 */
export function getProdutoPorId(id: string): Product | undefined {
  return produtosAgricolas.find((p) => p.id === id);
}
