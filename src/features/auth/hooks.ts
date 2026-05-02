import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout } from "./api";

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,  // 5 min — we invalidate manually on login/logout
    refetchOnWindowFocus: false,
    refetchOnMount: false,       // don't re-fetch just because layout re-mounts
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      // Set me cache directly so AuthenticatedLayout doesn't need to re-fetch
      queryClient.setQueryData(['me'], {
        id: data.id,
        email: data.email,
        lastLoginAt: null,
      })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
