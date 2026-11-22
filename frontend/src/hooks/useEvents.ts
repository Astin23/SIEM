import { useQuery } from "@tanstack/react-query";
import { fetchEvents, fetchEventById } from "@/api/events";
import type { FetchEventsParams } from "@/api/events";

export const useEventsList = (params: FetchEventsParams) => {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
    refetchInterval: 30000,
  });
};

export const useEventDetail = (eventId: number | null) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventId ? fetchEventById(eventId) : Promise.reject("No ID"),
    enabled: !!eventId,
  });
};
