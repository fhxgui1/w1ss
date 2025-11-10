"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadixAlertDialog } from "@/components/alert-dialog2";
import { ArrowLeft, Check, X, FileText, Loader2 } from "lucide-react";
import React from "react";
import { getcotacoes, Cotacao, escolher, desescolher, Cotacaos } from "@/lib/data3";
import { Textarea } from "@/components/ui/textarea"


import { redirect } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";





export default function CotacaoDetailPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = React.use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedCotacao, setSelectedCotacao] = useState<Cotacao | null>(null);
  const [isDeselection, setIsDeselection] = useState(false);
  const [comment, setComment] = useState('');


  const [cotacoes, setCotacoes] = useState<Cotacao[]>( [{
  id: 0,
  numero_cotacao: 0,
  fornecedor: 'string',
  valor_cotado: 0,
  condicoes_pagamento: 'string',
  data_cotacao: 'string',
    marca: 'string',
    observacoes: 'string',
    item_desenvolvido: true,
    iditem: 0,
    escolhido:0,
    status:0,
    marca_amostra:'string',
    prazo_entrega:'string',
}]

);

useEffect(() => {
  let timeoutId: NodeJS.Timeout;
  

  async function carregar() {
    
    const loggedIn = await isUserLoggedIn();

    try {
      const idd =parseInt(id)
      const result = await getcotacoes(idd) as Cotacao[]; 
      setCotacoes(result); 
    } finally {
      setIsLoading(false);
    }
  if (!loggedIn) {
    redirect("/login");
  }
  
  }

  carregar();

  timeoutId = setTimeout(() => {
    setTimeoutReached(true);
    setIsLoading(false);
  }, 3000);

  return () => clearTimeout(timeoutId);
}, [id]);


  const handleApprove = async (id: number,coment:string) => {
    setConfirmDialog(false);
    if (isDeselection) {
      await escolher(id,coment);
    } else {
      await desescolher(id,coment);
    }
    const result = await getcotacoes(id) as Cotacao[];
    setCotacoes(result);
    setSelectedCotacao(null);
  };

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <h2 className="text-2xl font-bold mb-2">Carregando cotações...</h2>
        </div>
      </div>
    );
  }

  if ((!cotacoes || cotacoes.length === 0) && timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Nenhuma cotação aprovada</h2>
          <Button onClick={() => router.push("/aproval")}>Voltar</Button>
        </div>
      </div>
    );
  }


  const statusBadge = (status: number) => {
    if (status === 1)
      return (
        <Badge className="bg-primary">
          <Check className="h-3 w-3 mr-1" />
          Aprovada
        </Badge>
      );
    if (status === 0)
      return (
        <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" />
          Rejeitada
        </Badge>
      );
    return <Badge variant="secondary">Pendente</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/aproval")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>

        {cotacoes.map((cotacao) => {
          const isSelected = cotacao.escolhido === 1;

          return (
            <Card
              key={cotacao.numero_cotacao}
              className={`mb-6 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-2 border-blue-500 bg-blue-50 shadow-md"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedCotacao(cotacao);
                setIsDeselection(isSelected);
                setConfirmDialog(true);
              }}
            >
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl">
                    Cotação Nº {cotacao.numero_cotacao}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Fornecedor: <strong>{cotacao.fornecedor}</strong>
                  </p>
                </div>
                {statusBadge(cotacao.status)}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Valor Cotado:</strong> R$ {cotacao.valor_cotado}
                  </p>
                  <p>
                    <strong>Prazo de Entrega:</strong> {cotacao.prazo_entrega}
                  </p>
                  <p>
                    <strong>Condições de Pagamento:</strong>{" "}
                    {cotacao.condicoes_pagamento}
                  </p>
                  <p>
                    <strong>Data da Cotação:</strong>{" "}
                    {new Date(cotacao.data_cotacao).toLocaleDateString("pt-BR")}
                  </p>
                  <p>
                    <strong>Marca/Amostra:</strong>{" "}
                    {cotacao.marca_amostra || "—"}
                  </p>
                  <p>
                    <strong>Item Desenvolvido:</strong>{" "}
                    {cotacao.item_desenvolvido ? "Sim" : "Não"}
                  </p>
                </div>

                {cotacao.observacoes && (
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Observações
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {cotacao.observacoes}
                    </p>
                  </div>
                )}

                {cotacao.status === 1 && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setConfirmDialog(true)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" /> Aprovar Cotação
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <X className="h-4 w-4 mr-2" /> Rejeitar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}



<RadixAlertDialog
  from="bottom"
  title={
    isDeselection
      ? `Deseja desaprovar a cotação ${selectedCotacao?.numero_cotacao}?`
      : `Deseja aprovar a cotação ${selectedCotacao?.numero_cotacao}?`
  }
  description= {isDeselection
      ? "Essa cotação deixará de ser a escolhida."
      : "Essa ação definirá esta cotação como escolhida."}
  description2={isDeselection
      ? "Diga o motivo do por que deixará de ser excolhida"
      : "Diga o motivo do por que  esta cotação como escolhida."}
  cancelLabel="Cancelar"
  actionLabel={isDeselection ? "Desaprovar" : "Aprovar"}
  onAction={(comment) => {
    console.log('Comentário:', comment); // Exibe no console
    handleApprove(selectedCotacao!.numero_cotacao, comment);
    setComment(''); // limpa o estado externo se precisar
  }}
  open={confirmDialog}
  onOpenChange={(open) => {
    setConfirmDialog(open);
    if (!open) setComment(''); // limpa ao fechar
  }}
  initialComment={comment} // opcional: sincroniza com estado externo
>
  <p className="text-sm text-muted-foreground mb-3">
    {isDeselection
      ? "Essa cotação deixará de ser a escolhida."
      : "Essa ação definirá esta cotação como escolhida."}
  </p>
</RadixAlertDialog>
      </div>
    </div>
  );
}
