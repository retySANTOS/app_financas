import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "@/components/dashboard/categories-client";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name");

  return <CategoriesClient initialCategories={categories ?? []} />;
}
