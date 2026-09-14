import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchNoticias } from "@/services/noticias.service";
import type { Noticia } from "@/types";

export function useNoticias() {
  return useAsyncData<Noticia[]>(fetchNoticias, []);
}
