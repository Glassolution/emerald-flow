/**
 * Catálogo de Produtos Agrícolas
 * Dados mock simples para o catálogo
 */

export type ProductType = "Herbicida" | "Inseticida" | "Fungicida" | "Fertilizante";
export type ProductUnit = "mL" | "L";

export interface Product {
  id: string;
  nome: string;
  tipo: ProductType;
  dosePadrao: number; // Dose por hectare
  unidade: ProductUnit;
}

/**
 * Lista de produtos agrícolas comuns
 */
export const produtosAgricolas: Product[] = [
  // Herbicidas
  {
    id: "1",
    nome: "Glifosato 360",
    tipo: "Herbicida",
    dosePadrao: 2.5,
    unidade: "L",
  },
  {
    id: "2",
    nome: "2,4-D Amine",
    tipo: "Herbicida",
    dosePadrao: 1.5,
    unidade: "L",
  },
  {
    id: "3",
    nome: "Atrazina",
    tipo: "Herbicida",
    dosePadrao: 3.0,
    unidade: "L",
  },
  {
    id: "4",
    nome: "Paraquat",
    tipo: "Herbicida",
    dosePadrao: 2.0,
    unidade: "L",
  },

  // Inseticidas
  {
    id: "5",
    nome: "Deltametrina",
    tipo: "Inseticida",
    dosePadrao: 200,
    unidade: "mL",
  },
  {
    id: "6",
    nome: "Lambda-cialotrina",
    tipo: "Inseticida",
    dosePadrao: 150,
    unidade: "mL",
  },
  {
    id: "7",
    nome: "Tiametoxam",
    tipo: "Inseticida",
    dosePadrao: 100,
    unidade: "mL",
  },
  {
    id: "8",
    nome: "Imidacloprido",
    tipo: "Inseticida",
    dosePadrao: 250,
    unidade: "mL",
  },

  // Fungicidas
  {
    id: "9",
    nome: "Mancozebe",
    tipo: "Fungicida",
    dosePadrao: 2.0,
    unidade: "L",
  },
  {
    id: "10",
    nome: "Tebuconazol",
    tipo: "Fungicida",
    dosePadrao: 500,
    unidade: "mL",
  },
  {
    id: "11",
    nome: "Azoxistrobina",
    tipo: "Fungicida",
    dosePadrao: 400,
    unidade: "mL",
  },
  {
    id: "12",
    nome: "Ciproconazol",
    tipo: "Fungicida",
    dosePadrao: 300,
    unidade: "mL",
  },

  // Fertilizantes
  {
    id: "13",
    nome: "NPK 10-10-10",
    tipo: "Fertilizante",
    dosePadrao: 5.0,
    unidade: "L",
  },
  {
    id: "14",
    nome: "Ureia",
    tipo: "Fertilizante",
    dosePadrao: 2.5,
    unidade: "L",
  },
  {
    id: "15",
    nome: "Sulfato de Amônio",
    tipo: "Fertilizante",
    dosePadrao: 3.0,
    unidade: "L",
  },
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

