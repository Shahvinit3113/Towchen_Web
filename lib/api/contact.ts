import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export interface ContactInquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "Pending" | "InProgress" | "Resolved";
  created_at: string;
  updated_at: string;
}

export interface CreateContactInquiryPayload {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  submitInquiry: async (payload: CreateContactInquiryPayload) => {
    return apiClient<ContactInquiry>(API_ENDPOINTS.contact.submit, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getInquiries: async () => {
    try {
      const res = await apiClient<any>(API_ENDPOINTS.contact.list);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? (data as ContactInquiry[]) : [];
    } catch (err) {
      console.warn("Failed to fetch contact inquiries:", err);
      return [];
    }
  },

  getInquiry: async (id: number | string) => {
    const res = await apiClient<any>(API_ENDPOINTS.contact.detail(id));
    return (res.data?.data ?? res.data) as ContactInquiry;
  },
};
