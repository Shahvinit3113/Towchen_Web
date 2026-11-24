import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export interface GeoData {
  latitude: number | null;
  longitude: number | null;
  captured_at: string;
}

export interface SubmitPackageOrderParams {
  customerData: {
    name: string;
    number: string;
    altNumber?: string;
    email: string;
    building?: string;
    block?: string;
    road?: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
  };
  vehicleData: {
    regNumber: string;
    make: string;
    model: string;
    fuelType: string;
    transmissionType: string;
    registrationYear: number;
    chassisNumber: string;
    odometerReading: number;
    carSegment: string;
  };
  packageData: {
    planId: number;
    startDate: string;
  };
  files?: {
    front?: File | null;
    rear?: File | null;
    left?: File | null;
    right?: File | null;
    odometer?: File | null;
  };
  uploaded_by_dealer?: boolean;
  geoData?: GeoData;
}

export const packagesApi = {
  getDealerPackagePlans: async (segment?: string): Promise<any> => {
    const params = segment ? { segment } : {};
    const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackagePlan, { params });
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    return Array.isArray(data) ? data : [];
  },

  submitDealerPackageOrder: async (data: SubmitPackageOrderParams) => {
    const formData = new FormData();

    // Customer
    formData.append('customer_name', data.customerData.name);
    formData.append('customer_number', data.customerData.number);
    if (data.customerData.altNumber) formData.append('alternative_number', data.customerData.altNumber);
    formData.append('email_address', data.customerData.email);
    if (data.customerData.building) formData.append('building', data.customerData.building);
    if (data.customerData.block) formData.append('block', data.customerData.block);
    if (data.customerData.road) formData.append('road', data.customerData.road);
    formData.append('city', data.customerData.city);
    formData.append('state', data.customerData.state);
    formData.append('pincode', data.customerData.pincode);
    if (data.customerData.gstNumber) formData.append('gst_number', data.customerData.gstNumber);

    // Vehicle
    formData.append('vehicle_reg_number', data.vehicleData.regNumber);
    formData.append('vehicle_make', data.vehicleData.make);
    formData.append('vehicle_model', data.vehicleData.model);
    formData.append('vehicle_fuel_type', data.vehicleData.fuelType);
    formData.append('transmission_type', data.vehicleData.transmissionType);
    formData.append('registration_year', String(data.vehicleData.registrationYear));
    formData.append('chassis_number', data.vehicleData.chassisNumber);
    formData.append('current_odometer_reading', String(data.vehicleData.odometerReading));
    formData.append('car_segment', data.vehicleData.carSegment);

    // Package
    formData.append('package_plan_id', String(data.packageData.planId));
    formData.append('package_plan_start_date', data.packageData.startDate);

    // Meta
    if (data.geoData) {
      const metaString = JSON.stringify(data.geoData);
      formData.append('vehicle_images_meta', metaString);
      formData.append('odometer_image_meta', metaString);
    }

        // Files (Optional: Dealer vs Customer upload)
    const hasAnyFile = Boolean(
      data.files?.front ||
      data.files?.rear ||
      data.files?.left ||
      data.files?.right ||
      data.files?.odometer
    );

    if (data.files?.front) formData.append('image_front', data.files.front);
    if (data.files?.rear) formData.append('image_rear', data.files.rear);
    if (data.files?.left) formData.append('image_left', data.files.left);
    if (data.files?.right) formData.append('image_right', data.files.right);
    if (data.files?.odometer) formData.append('odometer_image', data.files.odometer);

    const uploadedByDealer = data.uploaded_by_dealer !== undefined ? data.uploaded_by_dealer : hasAnyFile;
    formData.append('uploaded_by_dealer', String(uploadedByDealer));

    const res = await api.post<any>(API_ENDPOINTS.packages.dealerPackageOrder, formData);
    return res?.data?.data ?? res?.data;
  },

  getDealerPackageOrders: async (params?: { page?: number; limit?: number; search?: string; status?: string; payment_status?: string }): Promise<any> => {
    try {
      const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrder, { params });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data)) return data;
      if (data?.items && Array.isArray(data.items)) return data.items;
      return [];
    } catch {
      return [];
    }
  },

  getDealerPackageOrderDetail: async (id: string | number) => {
    const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrderDetail(id));
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  
  uploadInspectionImages: async (
    orderId: string | number,
    files: { front: File; rear: File; left: File; right: File; odometer: File },
    geoData?: GeoData,
    uploadedByDealer: boolean = true
  ) => {
    const formData = new FormData();
    formData.append('image_front', files.front);
    formData.append('image_rear', files.rear);
    formData.append('image_left', files.left);
    formData.append('image_right', files.right);
    formData.append('odometer_image', files.odometer);
    formData.append('uploaded_by_dealer', String(uploadedByDealer));
    if (geoData) {
      const meta = JSON.stringify(geoData);
      formData.append('vehicle_images_meta', meta);
      formData.append('odometer_image_meta', meta);
    }
    const res = await api.post<any>(`/dealer-package-order/${orderId}/upload-inspection`, formData);
    return res.data?.data;
  },

  getCertificateDownloadUrl: async (id: string | number) => {
    const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrderDownload(id));
    return res.data?.data?.download_url;
  },

  createInspectionLink: async (orderId: string | number) => {
    const res = await api.post<any>(`/dealer-package-order/${orderId}/inspection-link`);
    return res.data?.data;
  },

  getInspectionLink: async (orderId: string | number) => {
    const res = await api.get<any>(`/dealer-package-order/${orderId}/inspection-link`);
    return res.data?.data;
  },

  getAllInspectionLinks: async (orderId: string | number) => {
    const res = await api.get<any>(`/dealer-package-order/${orderId}/inspection-links`);
    return res.data?.data || [];
  },

  closeInspectionLink: async (orderId: string | number, linkId: number) => {
    const res = await api.patch<any>(`/dealer-package-order/${orderId}/inspection-link/${linkId}/close`, {});
    return res.data?.data;
  },

  getPublicInspection: async (orderIdentifier: string) => {
    const res = await api.get<any>(`/dealer-package-order/public/inspection/${encodeURIComponent(orderIdentifier.trim())}`);
    if (res?.data?.data) return res.data.data;
    if (res?.data && typeof res.data === 'object' && ('order_number' in res.data || 'id' in res.data)) {
      return res.data;
    }
    return res?.data?.data ?? res?.data;
  },

  submitCustomerInspection: async (
    orderIdentifier: string,
    files: { front: File; rear: File; left: File; right: File; odometer: File },
    geoData?: GeoData
  ) => {
    const formData = new FormData();
    formData.append('image_front', files.front);
    formData.append('image_rear', files.rear);
    formData.append('image_left', files.left);
    formData.append('image_right', files.right);
    formData.append('odometer_image', files.odometer);
    formData.append('uploaded_by_dealer', 'false');
    if (geoData) {
      const meta = JSON.stringify(geoData);
      formData.append('vehicle_images_meta', meta);
      formData.append('odometer_image_meta', meta);
    }
    const res = await api.post<any>(`/dealer-package-order/public/inspection/${orderIdentifier}`, formData);
    return res.data?.data;
  },
};