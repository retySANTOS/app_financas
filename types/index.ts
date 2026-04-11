export type TransactionType = "receita" | "despesa";

export type CategoryType = "receita" | "despesa" | "ambas";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export const DEFAULT_CATEGORIES: { name: string; type: CategoryType }[] = [
  { name: "Salário", type: "receita" },
  { name: "Freelance", type: "receita" },
  { name: "Investimentos", type: "ambas" },
  { name: "Alimentação", type: "despesa" },
  { name: "Transporte", type: "despesa" },
  { name: "Moradia", type: "despesa" },
  { name: "Saúde", type: "despesa" },
  { name: "Educação", type: "despesa" },
  { name: "Lazer", type: "despesa" },
  { name: "Outros", type: "ambas" },
];

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  created_at: string;
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
}
