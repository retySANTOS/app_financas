"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, CategoryType, DEFAULT_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Tag, Loader2, LayoutList } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/utils";

const TYPE_LABELS: Record<CategoryType, string> = {
  receita: "Receita",
  despesa: "Despesa",
  ambas: "Receita e Despesa",
};

const TYPE_STYLES: Record<CategoryType, string> = {
  receita: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  despesa: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  ambas: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("despesa");
  const [loading, setLoading] = useState(false);
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), type, user_id: user.id })
      .select()
      .single();

    if (error) {
      const msg = error.code === "23505"
        ? "Já existe uma categoria com esse nome."
        : error.message;
      toast({ title: "Erro ao adicionar", description: msg, variant: "destructive" });
    } else {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      toast({ title: "Categoria adicionada!" });
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Categoria excluída!" });
    }
  }

  async function handleSeedDefaults() {
    setSeedingDefaults(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const toInsert = DEFAULT_CATEGORIES.filter(
      (d) => !categories.some((c) => c.name === d.name)
    ).map((d) => ({ ...d, user_id: user.id }));

    if (toInsert.length === 0) {
      toast({ title: "Todas as categorias padrão já existem." });
      setSeedingDefaults(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert(toInsert)
      .select();

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setCategories((prev) =>
        [...prev, ...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({ title: `${data?.length} categorias padrão adicionadas!` });
    }
    setSeedingDefaults(false);
  }

  const grouped = {
    receita: categories.filter((c) => c.type === "receita" || c.type === "ambas"),
    despesa: categories.filter((c) => c.type === "despesa" || c.type === "ambas"),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categorias</h1>
          <p className="text-muted-foreground text-sm">{categories.length} categoria(s) cadastrada(s)</p>
        </div>
        {categories.length === 0 && (
          <Button variant="outline" size="sm" onClick={handleSeedDefaults} disabled={seedingDefaults}>
            {seedingDefaults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutList className="mr-2 h-4 w-4" />}
            Adicionar categorias padrão
          </Button>
        )}
      </div>

      {/* Formulário de nova categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                placeholder="Ex: Academia, Pets, Aluguel..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-48 space-y-1">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="ambas">Receita e Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="ml-1">Adicionar</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de categorias */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
            <Tag className="h-10 w-10 opacity-30" />
            <p className="text-sm">Nenhuma categoria cadastrada.</p>
            <Button variant="outline" size="sm" onClick={handleSeedDefaults} disabled={seedingDefaults}>
              {seedingDefaults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutList className="mr-2 h-4 w-4" />}
              Adicionar categorias padrão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (CATEGORY_COLORS[cat.name] ?? "#6b7280") + "25" }}
                    >
                      <Tag
                        className="h-3.5 w-3.5"
                        style={{ color: CATEGORY_COLORS[cat.name] ?? "#6b7280" }}
                      />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[cat.type]}`}>
                      {TYPE_LABELS[cat.type]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo por tipo */}
      {categories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {grouped.receita.length} para Receita
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {grouped.despesa.length} para Despesa
          </div>
        </div>
      )}
    </div>
  );
}
