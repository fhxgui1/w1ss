"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Package, Search, Loader2 } from "lucide-react";
import { getData, type Item } from "@/lib/data3";
import { useRouter } from "next/navigation";

import { redirect } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";





export default   function ProdutosPage() {
  const router=useRouter()
  const [produtos, setProdutos] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [familiaFilter, setFamiliaFilter] = useState<string>("all");



  

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function fetchData() {      
    const loggedIn = await isUserLoggedIn();


      try {
        const result = await getData() as Item[];
        setProdutos(result);
      } finally {
        setIsLoading(false);
      }
        if (!loggedIn) {
    redirect("/login");
  }

    }

    fetchData();

    timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // 🔹 Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <h2 className="text-2xl font-bold mb-2">Carregando produtos...</h2>
        </div>
      </div>
    );
  }

  // 🔹 Timeout state (sem dados após 3s)
  if ((!produtos || produtos.length === 0) && timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Nenhuma cotação aprovada</h2>
          <p className="text-muted-foreground mb-4">Não encontramos produtos com cotações aprovadas.</p>
          <Link href="/aprovals">
            <span className="text-blue-500 hover:underline cursor-pointer">Voltar</span>
          </Link>
        </div>
      </div>
    );
  }

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      searchTerm === "" ||
      produto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.familia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.aplicacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.frota_sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const hasApproved = produto.cotacoes?.some((c) => c.status === "approved");
    const hasPending = produto.cotacoes?.some((c) => c.status === "pending");
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && hasApproved) ||
      (statusFilter === "pending" && hasPending && !hasApproved);

    const matchesFamilia = familiaFilter === "all" || produto.familia === familiaFilter;

    return matchesSearch && matchesStatus && matchesFamilia;
  });

  const uniqueFamilias = Array.from(new Set(produtos.map((p) => p.familia).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Aprovação de Cotações</h1>
          <p className="text-muted-foreground text-lg">Selecione um produto para visualizar suas cotações</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU, família, aplicação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={familiaFilter} onValueChange={setFamiliaFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Família" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as famílias</SelectItem>
                {uniqueFamilias.map((familia) => (
                  <SelectItem key={familia} value={familia}>
                    {familia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Mostrando {filteredProdutos.length} de {produtos.length} produtos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProdutos.map((produto) => {
            const cotacoesPendentes = produto.cotacoes?.filter((c) => c.escolhido === 1).length || 0;
            const hasApproved = produto.cotacoes?.some((c) => c.escolhido === 0);

            return (
              <Link key={produto.iditem} href={`/aproval/items/${produto.iditem}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bkcard">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Package className="h-8 w-8 text-primary" />
                      <Badge variant={hasApproved ? "default" : "secondary"}>
                        {hasApproved
                          ? "Cotação Aprovada"
                          : `${cotacoesPendentes} pendente${cotacoesPendentes !== 1 ? "s" : ""}`}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{produto.sku}</CardTitle>
                    <CardDescription>{produto.familia}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>SKU:</strong> {produto.sku}
                    </p>
                    {produto.frota_sku && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Frota SKU:</strong> {produto.frota_sku}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {produto.aplicacao || "Sem descrição"}
                    </p>

                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        {produto.cotacoes?.length || 0} cotaç
                        {produto.cotacoes?.length === 1 ? "ão" : "ões"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredProdutos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  );
}
