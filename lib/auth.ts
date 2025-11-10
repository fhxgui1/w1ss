// lib/auth.ts
"use server";

import { cookies } from "next/headers";

export async function setLoginCookie(userId: string, tipo:string) {
  const cookieStore = await cookies();
  cookieStore.set("user_session", userId, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 1, // 7 dias
  });
    cookieStore.set("user_type", tipo, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 1, // 7 dias
  });
}



export async function isUserLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session");
  return !!userSession; // retorna true se existir
}


export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
}