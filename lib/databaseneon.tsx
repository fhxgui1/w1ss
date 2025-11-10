"use server";

import { neon } from "@neondatabase/serverless";

// Example usage (add your DATABASE_URL env var)
const sql = neon(process.env.DATABASE_URL!);

// Example query
export async function getData() {
  const result = await sql`SELECT * FROM users `;
  console.log(result)
  return result;
}


export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  console.log("Query result:", result);
  return result;
}


