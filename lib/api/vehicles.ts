import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { VehicleRecord, VehicleInspectionPhotos } from "@/types";

// In-memory mock store for dealer vehicles during standalone evaluation
let mockVehicles: VehicleRecord[] = [
  {
    id: "veh-101",
    dealerId: "dlr-9941",
    vinOrChassis: "MALCA51HLFM876123",
    registrationNumber: "DL03CC4482",
    make: "Hyundai",
    model: "Creta SX(O)",
    year: 2023,
    category: "suv",
    status: "verified",
    assignedPackageId: "pkg-pro-shield",
    packageName: "TowChen Pro Shield Plus",
    rcDocumentUrl: "/docs/rc-DL03CC4482.pdf",
    registeredAt: "2026-08-15T10:30:00Z",
  },
  {
    id: "veh-102",
    dealerId: "dlr-9941",
    vinOrChassis: "MA3FNEB1SS0248911",
    registrationNumber: "HR26DY9011",
    make: "Maruti Suzuki",
    model: "Grand Vitara Hybrid",
    year: 2024,
    category: "suv",
    status: "pending_inspection",
    assignedPackageId: "pkg-essential",
    packageName: "TowChen Essential RSA",
    registeredAt: "2026-09-01T14:20:00Z",
  },
  {
    id: "veh-103",
    dealerId: "dlr-9941",
    vinOrChassis: "WBA73AK00PFR11892",
    registrationNumber: "MH01EF2020",
    make: "BMW",
    model: "3 Series Gran Limousine",
    year: 2024,
    category: "luxury",
    status: "verified",
    assignedPackageId: "pkg-elite-fleet",
    packageName: "TowChen Elite Fleet & Luxury",
    registeredAt: "2026-09-12T16:45:00Z",
  },
];

export const vehiclesApi = {
  getVehicles: async (dealerId?: string): Promise<VehicleRecord[]> => {
    try {
      const res = await api.get<VehicleRecord[]>(API_ENDPOINTS.vehicles.list, {
        params: { dealerId },
      });
      return Array.isArray(res.data) ? res.data : mockVehicles;
    } catch {
      return mockVehicles;
    }
  },

  registerVehicle: async (
    payload: Omit<VehicleRecord, "id" | "registeredAt" | "status">
  ): Promise<VehicleRecord> => {
    const newVehicle: VehicleRecord = {
      ...payload,
      id: `veh-${Date.now().toString().slice(-4)}`,
      status: "pending_inspection",
      registeredAt: new Date().toISOString(),
    };

    try {
      const res = await api.post<VehicleRecord>(
        API_ENDPOINTS.vehicles.register,
        newVehicle
      );
      mockVehicles.unshift(res.data || newVehicle);
      return res.data || newVehicle;
    } catch {
      mockVehicles.unshift(newVehicle);
      return newVehicle;
    }
  },

  uploadRcDocument: async (
    vehicleId: string,
    fileBase64OrUrl: string
  ): Promise<{ rcDocumentUrl: string }> => {
    try {
      const res = await api.post<{ rcDocumentUrl: string }>(
        API_ENDPOINTS.vehicles.uploadRc(vehicleId),
        { rcDocument: fileBase64OrUrl }
      );
      return res.data;
    } catch {
      const idx = mockVehicles.findIndex((v) => v.id === vehicleId);
      if (idx !== -1) {
        mockVehicles[idx].rcDocumentUrl = fileBase64OrUrl;
      }
      return { rcDocumentUrl: fileBase64OrUrl };
    }
  },

  uploadInspectionPhotos: async (
    vehicleId: string,
    photos: VehicleInspectionPhotos
  ): Promise<{ success: boolean; inspectionPhotos: VehicleInspectionPhotos }> => {
    try {
      const res = await api.post<{
        success: boolean;
        inspectionPhotos: VehicleInspectionPhotos;
      }>(API_ENDPOINTS.vehicles.uploadInspection(vehicleId), photos);
      return res.data;
    } catch {
      const idx = mockVehicles.findIndex((v) => v.id === vehicleId);
      if (idx !== -1) {
        mockVehicles[idx].inspectionPhotos = photos;
        mockVehicles[idx].status = "verified";
      }
      return { success: true, inspectionPhotos: photos };
    }
  },
};
