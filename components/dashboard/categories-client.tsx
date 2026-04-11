"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, CategoryType, DEFAULT_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("despesa");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Seed automático se não houver nenhuma categoria
  useEffect(() => {
    if (initialCategories.length === 0) {
      seedDefaults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function seedDefaults() {
    setSeeding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSeeding(false); return; }

    const toInsert = DEFAULT_CATEGORIES.filter(
      (d) => !categories.some((c) => c.name === d.name)
    ).map((d) => ({ ...d, user_id: user.id }));

    if (toInsert.length === 0) { setSeeding(false); return; }

    const { data, error } = await supabase.from("categories").insert(toInsert).select();
    if (!error && data) {
      setCategories((prev) =>
        [...prev, ...data].sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    setSeeding(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), type, user_id: user.id })
      .select()
      .single();

    if (error) {
      const msg = error.code === "23505" ? "Já existe uma categoria com esse nome." : error.message;
      toast({ title: "Erro ao adicionar", description: msg, variant: "destructive" });
    } else {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      toast({ title: "Categoria adicionada!" });
    }
    setLoading(false);
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Excluir a categoria "${catName}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Categoria excluída!" });
    }
  }

  const receitas = categories.filter((c) => c.type === "receita" || c.type === "ambas");
  const despesas = categories.filter((c) => c.type === "despesa" || c.type === "ambas");

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categorias</h1>
        <p className="text-muted-foreground text-sm">{categories.length} categoria(s) cadastrada(s)</p>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader className="pb-3">
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
                placeholder="Ex: Academia, Pets, Dividendos..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-52 space-y-1">
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
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />}
                <span className="ml-1.5">Adicionar</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading seed */}
      {seeding && (
        <div className="flex items-center gap-3 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando categorias padrão...
        </div>
      )}

      {/* Relatório separado por tipo */}
      {!seeding && categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Receitas */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                Receita
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {receitas.length} categoria(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {receitas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma categoria de receita
                </p>
              ) : (
                <div className="divide-y">
                  {receitas.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{cat.name}</span>
                        {cat.type === "ambas" && (
                          <span className="text-xs text-muted-foreground">(também despesa)</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                <TrendingDown className="h-4 w-4" />
                Despesa
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {despesas.length} categoria(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {despesas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma categoria de despesa
                </p>
              ) : (
                <div className="divide-y">
                  {despesas.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{cat.name}</span>
                        {cat.type === "ambas" && (
                          <span className="text-xs text-muted-foreground">(também receita)</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
