import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      return res.data.data; // { notifications: [], unreadCount: number }
    },
    refetchInterval: 60000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch("/notifications", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = query.data?.notifications || [];
  const unreadCount = query.data?.unreadCount || 0;

  return {
    notifications,
    isLoading: query.isLoading,
    unreadCount,
    markAsRead,
  };
};
