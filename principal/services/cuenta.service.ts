import { MOCK_CONFIG } from "@/config/mock.config";
import { USER } from "@/mocks/cuenta.mock.ts";
import type { User } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function fetchMaterias(): Promise<User[]> {
  if (MOCK_CONFIG.materias) {
    await delay(0);
    return USER;
  }

  const res = await fetch(`${BASE}/api/User`);
  if (!res.ok) throw new Error(`[User] ${res.status} ${res.statusText}`);
  return res.json() as Promise<User[]>;
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}