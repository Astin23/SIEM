import { useQuery } from "@tanstack/react-query";
import { chainsApi, type ChainFilterParams } from "@/api/chains";

export const useAttackChains = (params?: ChainFilterParams) => {
  return useQuery({
    queryKey: ["attackChains", params],
    queryFn: () => chainsApi.getAttackChains(params),
    refetchInterval: 15000,
  });
};
