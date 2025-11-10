"use server";

import { neon } from "@neondatabase/serverless";



export interface Cotacao {
  id: number
  numero_cotacao: number
  fornecedor: string
  valor_cotado: number
  condicoes_pagamento: string
  data_cotacao: string,
    marca: string,
    observacoes: string,
    item_desenvolvido: true,
    iditem: number
    escolhido:number
    status:number
    marca_amostra:string
    prazo_entrega:string
}




export interface Cotacaos {
  id: number
  numero_cotacao: number
  fornecedor: string
  precoCotado: number
  condicoesPagamento: string
  dataCotacao: string,
    marca: string,
    observacoes: string,
    item_desenvolvido: true,
    iditem: number
}

export interface Version {
  id: string
  versionNumber: string
  descricao: string
  createdAt: string
  author: string
  changes: string[]
  escolhido:number
  status: "pending" | "approved" | "rejected"
}

export interface Item {
  id: string
  iditem:number
  sku:string
  aplicacao:string
  frota_sku:string
  name: string
  familia: string
  descricao: string
  cotacoes: Version[]
  approvedVersionId?: string
}

interface Item2 {
  peca: string
  familia: string
  comentario: string
  aplicacao:string
  chaveamento: string
  sku:string
  motor: string 
  frota_sku:string
}



// Example usage (add your DATABASE_URL env var)
const sql = neon(process.env.DATABASE_URL!);

// Example query
export async function getData() {
  // Busca todos os produtos
  const produtos = await sql`SELECT * FROM produtos where sendprov=1`;

  console.log(produtos)
    let cotacoes = await sql`SELECT * FROM cotacoes  `;

      const produtosComCotacoes = produtos.map(produto => {
    let cotacoesDoProduto = cotacoes.filter(c => c.iditem === produto.iditem);
    return {
      ...produto,
      cotacoes: cotacoesDoProduto, // adiciona o array de cotações
    };
  });


  console.log(produtos);
  return produtosComCotacoes;
}



export async function getData2() {
  
  const produtos = await sql`SELECT * FROM produtos  `;
  console.log(produtos)
    let cotacoes = await sql`SELECT * FROM cotacoes  `;

      const produtosComCotacoes = produtos.map(produto => {
    let cotacoesDoProduto = cotacoes.filter(c => c.iditem === produto.iditem);
    return {
      ...produto,
      cotacoes: cotacoesDoProduto, // adiciona o array de cotações
    };
  });


  console.log(produtos);
  return produtosComCotacoes;
}


export async function getcotacoes(id: number) {
  const rows= await sql`SELECT * FROM cotacoes WHERE iditem = ${id} and sendprov = 1`;
  
  console.log(rows)
  
  return rows; // retorna só as linhas
}


export async function getcotacoes2(id:number) {
  const cotacoes = await sql`SELECT * FROM cotacoes WHERE iditem = ${id} `; 
  console.log(cotacoes);
  return cotacoes;
}



export async function escolher(id:number,comment:string) {
  const cotacoes = await sql`update cotacoes set escolhido=1 where id= ${id}`; 
  const historico=await sql `insert into historico (id,comentario,tipo) values (${id},${comment},'saida')`

  console.log(cotacoes);
  return cotacoes;
}
export async function desescolher(id:number,comment:string) {

  const cotacoes = await sql`update cotacoes set escolhido=0 where id= ${id}`; 
  const historico=await sql `insert into historico (id,comentario,tipo) values (${id},${comment},'saida')`
 
  console.log(historico);
  return historico;
}

export async function sendapr(id:number) {
  const cotacoes = await sql`update cotacoes set sendprov=1 where id= ${id}`; 

}

export async function dessendapr(id:number) {
  const cotacoes = await sql`update cotacoes set sendprov=0 where id= ${id}`; 

}


export async function enviarCotacao(cotacao: Cotacaos, item: Item2) {
      console.log(`
      SELECT 1 FROM produtos WHERE sku = ${item.sku} LIMIT 1
    `)

  try {
    
    const [produtoExistente] = await sql`
      SELECT 1 FROM produtos WHERE sku = ${item.sku} LIMIT 1
    `;

    
    if (produtoExistente) {
      console.log(`SKU ${item.sku} já existe. Cotação não será inserida.`);
      
    const result = await sql`
      INSERT INTO cotacoes (
        numero_cotacao,
        fornecedor,
        valor_cotado,
        condicoes_pagamento,
        data_cotacao,
        marca_amostra,
        observacoes,
        item_desenvolvido,
        iditem
      ) VALUES (
        ${cotacao.id},
        ${cotacao.fornecedor},
        ${cotacao.precoCotado},
        ${cotacao.condicoesPagamento},
        ${cotacao.dataCotacao},
        ${cotacao.marca},
        ${cotacao.observacoes},
        ${cotacao.item_desenvolvido},
        ${cotacao.iditem}
      )
      RETURNING *;
    `;
      return { success: false, message: 'SKU já cadastrado', sku: item.sku };
    }else{
      const result= await sql`
          INSERT INTO produtos (
            peca, familia, comentario, aplicacao, chaveamento, sku, motor, frota_sku
          ) VALUES (
            ${item.peca},
            ${item.familia},
            ${item.comentario},
            ${item.aplicacao},
            ${item.chaveamento},
            ${item.sku},
            ${item.motor},
            ${item.frota_sku}
          )
          RETURNING id, sku, peca, familia; -- retorna apenas o que precisar
        `;

    }



    return { success: true };

  } catch (error) {
    console.error('Erro ao processar cotação:', error);
    return { success: false, message: 'Erro no servidor', error };
  }
}

