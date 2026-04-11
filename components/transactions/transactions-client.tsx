"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionFormData, Category } from "@/types";
import { formatCurrency, formatDate, CATEGORY_COLORS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, getYear, getMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionsClientProps {
  initialTransactions: Transaction[];
  initialCategories: Category[];
}

function getMonthOptions() {
  const options = [{ value: "all", label: "Todos os meses" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: format(d, "MMMM yyyy", { locale: ptBR }),
    });
  }
  return options;
}

export function TransactionsClient({ initialTransactions, initialCategories }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const supabase = createClient();
  const { toast } = useToast();
  const monthOptions = getMonthOptions();

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterMonth !== "all") {
        const [year, month] = filterMonth.split("-").map(Number);
        const d = new Date(t.date + "T00:00:00");
        if (getYear(d) !== year || getMonth(d) + 1 !== month) return false;
      }
      return true;
    });
  }, [transactions, searchQuery, filterMonth, filterCategory, filterType]);

  async function handleCreate(data: TransactionFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive" });
      return;
    }

    const { data: created, error } = await supabase
      .from("transactions")
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      return;
    }

    setTransactions((prev) => [created, ...prev]);
    setDialogOpen(false);
    toast({ title: "Transação criada!" });
  }

  async function handleUpdate(data: TransactionFormData) {
    if (!editingTransaction) return;

    const { data: updated, error } = await supabase
      .from("transactions")
      .update(data)
      .eq("id", editingTransaction.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return;
    }

    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setDialogOpen(false);
    setEditingTransaction(undefined);
    toast({ title: "Transação atualizada!" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta transação?")) return;

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Transação excluída!" });
  }

  function openEdit(t: Transaction) {
    setEditingTransaction(t);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditingTransaction(undefined);
    setDialogOpen(true);
  }

  function exportCSV() {
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Valor"];
    const rows = filtered.map((t) => [
      formatDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === "receita" ? "Receita" : "Despesa",
      t.category,
      t.amount.toString().replace(".", ","),
    ]);

    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes_${filterMonth !== "all" ? filterMonth : "todas"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-500 text-sm">{filtered.length} transação(ões) encontrada(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingTransaction(undefined);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nova transação
              </Button>
            </DialogTrigger>
            <TransactionForm
              transaction={editingTransaction}
              categories={categories}
              onSubmit={editingTransaction ? handleUpdate : handleCreate}
              onCancel={() => { setDialogOpen(false); setEditingTransaction(undefined); }}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar descrição..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="capitalize">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma transação encontrada</p>
              <p className="text-xs mt-1">Ajuste os filtros ou adicione uma nova transação</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[t.category] + "20" }}
                    >
                      {t.type === "receita" ? (
                        <TrendingUp className="h-4 w-4" style={{ color: CATEGORY_COLORS[t.category] }} />
                      ) : (
                        <TrendingDown className="h-4 w-4" style={{ color: CATEGORY_COLORS[t.category] }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: CATEGORY_COLORS[t.category] + "20",
                            color: CATEGORY_COLORS[t.category],
                          }}
                        >
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span
                      className={`font-semibold text-sm ${
                        t.type === "receita" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "receita" ? "+" : "-"}
                      {formatCurrency(Number(t.amount))}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-blue-600"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
