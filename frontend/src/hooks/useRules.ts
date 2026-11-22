import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRules, fetchRule, createRule, updateRule, deleteRule } from "@/api/rules";
import type { RuleFilters } from "@/api/rules";

export const useRulesQuery = (filters: RuleFilters) => {
  return useQuery({
    queryKey: ["rules", filters],
    queryFn: () => fetchRules(filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useRuleDetailQuery = (id: string | number) => {
  return useQuery({
    queryKey: ["rules", id],
    queryFn: () => fetchRule(id),
    enabled: !!id,
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["rules", variables.id] });
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};
