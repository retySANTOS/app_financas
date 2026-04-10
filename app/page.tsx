import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  PieChart,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Download,
  Filter,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <TrendingUp className="h-6 w-6" />
            FinançasPessoais
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <CheckCircle2 className="h-4 w-4" />
            100% gratuito · Sem cartão de crédito
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Controle suas finanças<br />
            <span className="text-blue-600">de forma simples e visual</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Registre receitas e despesas, visualize gráficos por categoria e tenha sempre uma visão clara do seu saldo mensal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <Link href="/signup">
                Criar conta grátis <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Tudo que você precisa para organizar suas finanças
          </h2>
          <p className="text-center text-gray-600 mb-14 max-w-xl mx-auto">
            Uma plataforma completa, simples de usar e com visual moderno.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Dashboard Completo</h3>
                <p className="text-sm text-gray-600">
                  Resumo mensal com cards de receita, despesa e saldo sempre atualizados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Gráficos por Categoria</h3>
                <p className="text-sm text-gray-600">
                  Visualize onde você mais gasta com gráficos de pizza interativos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Filtros Avançados</h3>
                <p className="text-sm text-gray-600">
                  Filtre por período, categoria e busque transações por descrição.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exportar CSV</h3>
                <p className="text-sm text-gray-600">
                  Exporte suas transações filtradas para Excel com um clique.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Mobile */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Seus dados são seus</h3>
              <p className="text-gray-600">
                Autenticação segura com Supabase. Cada usuário acessa somente suas próprias transações graças ao Row Level Security (RLS).
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Mobile-first</h3>
              <p className="text-gray-600">
                Interface responsiva que funciona perfeitamente no celular, tablet e desktop. Acesse de qualquer dispositivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece agora mesmo, é grátis
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Cadastre-se em segundos e comece a controlar suas finanças hoje.
          </p>
          <Button size="lg" variant="secondary" className="gap-2 text-base px-10" asChild>
            <Link href="/signup">
              Criar minha conta <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center gap-2 font-semibold text-gray-700 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            FinançasPessoais
          </div>
          <p>© {new Date().getFullYear()} FinançasPessoais. Controle financeiro pessoal.</p>
        </div>
      </footer>
    </div>
  );
}
