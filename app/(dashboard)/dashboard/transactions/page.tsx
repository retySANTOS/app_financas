import { createClient } from "@/lib/supabase/server";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions ?? []}
      initialCategories={categories ?? []}
    />
  );
}
