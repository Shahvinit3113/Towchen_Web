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
  files: {
    front: File;
    rear: File;
    left: File;
    right: File;
    odometer: File;
  };
  geoData?: GeoData;
}

const mockPlans = [
  {
    id: 1,
    name: "Gold Mobility Shield",
    plan_period_months: 12,
    incidents: 4,
    distance_km: 50.0,
    hotel_accommodation: 2,
    cab_service: 2,
    price_basic: 1999.0,
    price_standard: 2999.0,
    price_premium: 4999.0,
    selected_segment: "Basic",
    resolved_price: 1999.0
  },
  {
    id: 2,
    name: "Platinum Plus Shield",
    plan_period_months: 24,
    incidents: 6,
    distance_km: 100.0,
    hotel_accommodation: 4,
    cab_service: 4,
    price_basic: 3499.0,
    price_standard: 4999.0,
    price_premium: 7999.0,
    selected_segment: "Basic",
    resolved_price: 3499.0
  }
];

const mockOrders = [
  {
    id: "ord-001",
    order_number: "DPKG00000045",
    plan_name: "Gold Mobility Shield",
    car_segment: "Basic",
    amount: 1999.0,
    plan_period_months: 12,
    incidents_allowed: 4,
    incidents_used: 0,
    distance_km_allowed: 50.0,
    hotel_accommodation_allowed: 2,
    hotel_accommodation_used: 0,
    cab_service_allowed: 2,
    cab_service_used: 0,
    start_date: "2026-10-05T00:00:00.000Z",
    expiry_date: "2027-10-05T00:00:00.000Z",
    status: "Active",
    payment_status: "PAID",
    created_at: "2026-10-05T10:30:00.000Z",
    customer: {
      id: 1,
      customer_name: "Rahul Sharma",
      customer_number: "+919876543210",
      alternative_number: "+919876543211",
      email_address: "rahul.sharma@example.com",
      building: "Galaxy Apartments, Flat 402",
      block: "B-Wing",
      road: "Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      gst_number: "27AABCT2341P1Z9"
    },
    vehicle: {
      id: 1,
      vehicle_reg_number: "MH02AB1234",
      vehicle_make: "Maruti Suzuki",
      vehicle_model: "Dzire",
      vehicle_fuel_type: "Petrol",
      transmission_type: "Manual",
      registration_year: 2022,
      chassis_number: "MA3EAA12S00123456",
      current_odometer_reading: 34500,
      car_segment: "Basic"
    }
  },
  {
    id: "ord-002",
    order_number: "DPKG000000323",
    plan_name: "Platinum Plus Shield",
    car_segment: "Standard",
    amount: 4999.0,
    plan_period_months: 24,
    incidents_allowed: 6,
    incidents_used: 1,
    distance_km_allowed: 100.0,
    hotel_accommodation_allowed: 4,
    hotel_accommodation_used: 0,
    cab_service_allowed: 4,
    cab_service_used: 0,
    start_date: "2026-10-05T00:00:00.000Z",
    expiry_date: "2028-10-05T00:00:00.000Z",
    status: "Active",
    payment_status: "PAID",
    created_at: "2026-10-05T11:45:00.000Z",
    customer: {
      id: 2,
      customer_name: "Rahul Sharma",
      customer_number: "+919876543210",
      alternative_number: null,
      email_address: "rahul.sharma@example.com",
      building: "Shanti Heights, Flat 101",
      block: "A-Wing",
      road: "S.V. Road, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      gst_number: null
    },
    vehicle: {
      id: 2,
      vehicle_reg_number: "MH02AB1234",
      vehicle_make: "Hyundai",
      vehicle_model: "Creta",
      vehicle_fuel_type: "Diesel",
      transmission_type: "Automatic",
      registration_year: 2023,
      chassis_number: "MALC241CLNM987654",
      current_odometer_reading: 21800,
      car_segment: "Standard"
    }
  }
];

export const packagesApi = {
  getDealerPackagePlans: async (segment?: string) => {
    const params = segment ? { segment } : {};
    try {
      const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackagePlan, { params });
      // If the API returns successfully, return the data (even if it's an empty array)
      if (res.data && res.data.data !== undefined) return res.data.data;
    } catch (e) {
      console.log('Using mock plans due to API failure');
    }
    
    // Return mock data fallback based on segment
    const seg = segment || "Basic";
    return mockPlans.map(plan => ({
      ...plan,
      selected_segment: seg,
      resolved_price: seg === "Premium" ? plan.price_premium : (seg === "Standard" ? plan.price_standard : plan.price_basic)
    }));
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

    // Files
    formData.append('image_front', data.files.front);
    formData.append('image_rear', data.files.rear);
    formData.append('image_left', data.files.left);
    formData.append('image_right', data.files.right);
    formData.append('odometer_image', data.files.odometer);

    const res = await api.post<any>(API_ENDPOINTS.packages.dealerPackageOrder, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  },

  getDealerPackageOrders: async (params?: { page?: number; limit?: number; search?: string; status?: string; payment_status?: string }) => {
    try {
      const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrder, { params });
      // If the API returns successfully, return the data (even if it's an empty array)
      if (res.data && res.data.data !== undefined) return res.data.data;
    } catch (e) {
      console.log('Using mock orders due to API failure');
    }
    return mockOrders;
  },

  getDealerPackageOrderDetail: async (id: string | number) => {
    try {
      const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrderDetail(id));
      if (res.data && res.data.data !== undefined) return res.data.data;
    } catch (e) {
      console.log('Using mock order detail due to API failure');
    }
    return (
      mockOrders.find(
        (o) => String(o.id) === String(id) || String(o.order_number) === String(id)
      ) || mockOrders[0]
    );
  },

  getCertificateDownloadUrl: async (id: string | number) => {
    const res = await api.get<any>(API_ENDPOINTS.packages.dealerPackageOrderDownload(id));
    return res.data?.data?.download_url;
  }
};
