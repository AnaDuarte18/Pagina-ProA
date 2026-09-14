import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchMateriales } from "@/services/materiales.service";
import type { MaterialItem } from "@/types";

export function useMateriales() {
  return useAsyncData<MaterialItem[]>(fetchMateriales, []);
}
