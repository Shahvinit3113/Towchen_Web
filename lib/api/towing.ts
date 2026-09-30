import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  BookingSubmissionRequest,
  BookingConfirmation,
} from "@/types";

export const towingApi = {
  createBooking: async (
    payload: BookingSubmissionRequest
  ): Promise<BookingConfirmation> => {
    const res = await api.post<BookingConfirmation>(
      API_ENDPOINTS.towing.book,
      payload
    );
    return res.data;
  },

  trackBooking: async (bookingId: string): Promise<BookingConfirmation> => {
    const res = await api.get<BookingConfirmation>(
      API_ENDPOINTS.towing.track(bookingId)
    );
    return res.data;
  },
};
