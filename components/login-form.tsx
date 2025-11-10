"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {getData,getUserByEmail} from "@/lib/databaseneon"
import { useRouter } from "next/navigation";
import {setLoginCookie} from "@/lib/auth"

import { redirect } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";



export   function LoginForm() {
  const router=useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("[v0] Login attempt:", { email, password });
    const user = await getUserByEmail(email);


    if (user[0].usertype==1||user[0].password==password){
      // console.log(user[0]['first_name'])

      setLoginCookie(user[0]['first_name'],user[0]['type'])
      localStorage.setItem("email", user[0].email);
      localStorage.setItem("type", user[0].usertype);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    redirect("/aproval");

    }

    else if(user[0].usertype==2||user[0].password==password){
      localStorage.setItem("email", user[0].email);
      localStorage.setItem("type", user[0].usertype);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const emailSalvo = localStorage.getItem("email");
      console.log("Email salvo localmente:", emailSalvo);
    redirect("/aproval");

    }
    else{

      window.alert("login errado")
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Entre com seu email e senha para acessar sua conta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
         
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p></p>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {/* Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-primary hover:underline">
              Cadastre-se
            </Link> */}
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
