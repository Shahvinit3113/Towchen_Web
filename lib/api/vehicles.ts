import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { VehicleRecord, VehicleInspectionPhotos } from "@/types";

export const vehiclesApi = {
  getVehicles: async (dealerId?: string): Promise<VehicleRecord[]> => {
    const res = await api.get<VehicleRecord[]>(API_ENDPOINTS.vehicles.list, {
      params: { dealerId },
    });
    const data = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
    return Array.isArray(data) ? data : [];
  },

  registerVehicle: async (
    payload: Omit<VehicleRecord, "id" | "registeredAt" | "status">
  ): Promise<VehicleRecord> => {
    const res = await api.post<VehicleRecord>(
      API_ENDPOINTS.vehicles.register,
      payload
    );
    return (res.data as any)?.data || res.data;
  },

  uploadRcDocument: async (
    vehicleId: string,
    fileBase64OrUrl: string
  ): Promise<{ rcDocumentUrl: string }> => {
    const res = await api.post<{ rcDocumentUrl: string }>(
      API_ENDPOINTS.vehicles.uploadRc(vehicleId),
      { rcDocument: fileBase64OrUrl }
    );
    return (res.data as any)?.data || res.data;
  },

  uploadInspectionPhotos: async (
    vehicleId: string,
    photos: VehicleInspectionPhotos
  ): Promise<{ success: boolean; inspectionPhotos: VehicleInspectionPhotos }> => {
    const res = await api.post<{
      success: boolean;
      inspectionPhotos: VehicleInspectionPhotos;
    }>(API_ENDPOINTS.vehicles.uploadInspection(vehicleId), photos);
    return (res.data as any)?.data || res.data;
  },

  verifyVehicleRc: async (vehicleNumber: string): Promise<any> => {
    const res = await api.post<any>(API_ENDPOINTS.verification.vehicleRc, {
      vehicle_number: vehicleNumber,
    });
    return (res.data as any)?.data || res.data;
  },
};
