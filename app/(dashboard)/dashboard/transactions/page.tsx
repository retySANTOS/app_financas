import { createClient } from "@/lib/supabase/server";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  return <TransactionsClient initialTransactions={transactions ?? []} />;
}
