import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchMaterias } from "@/services/materias.service";
import type { Materia } from "@/types";

export function useMaterias() {
  return useAsyncData<Materia[]>(fetchMaterias, []);
}
