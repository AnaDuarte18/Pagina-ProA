import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchEventos } from "@/services/eventos.service";
import type { Evento } from "@/types";

export function useEventos() {
  return useAsyncData<Evento[]>(fetchEventos, []);
}
