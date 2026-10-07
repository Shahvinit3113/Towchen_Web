import { api } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  TowingEstimateRequest,
  TowingEstimateResponse,
  BookingSubmissionRequest,
  BookingConfirmation,
} from "@/types";

// Base rates for service types
const SERVICE_BASE_RATES: Record<string, { base: number; perMile: number }> = {
  flatbed_towing: { base: 75, perMile: 4.5 },
  wheel_lift_towing: { base: 65, perMile: 4.0 },
  accident_recovery: { base: 110, perMile: 5.0 },
  ev_towing: { base: 85, perMile: 4.5 },
  jumpstart: { base: 55, perMile: 0 },
  flat_tire: { base: 60, perMile: 0 },
  tire_change: { base: 60, perMile: 0 },
  fuel_delivery: { base: 50, perMile: 0 },
  lockout: { base: 65, perMile: 0 },
  winch_out: { base: 95, perMile: 0 },
  vehicle_recovery: { base: 110, perMile: 4.0 },
};

export const towingApi = {
  getServices: async (): Promise<{ success: boolean; services: any[]; options: any[] }> => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Error fetching services from API:", err);
    }
    return { success: false, services: [], options: [] };
  },

  searchAddress: async (input: string): Promise<any[]> => {
    try {
      const res = await api.get<any>(
        `${API_ENDPOINTS.location.searchAddress}?input=${encodeURIComponent(input)}`
      );
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as any).data)) return (data as any).data;
    } catch (err) {
      console.warn("Backend searchAddress failed, attempting fallback:", err);
    }
    return [];
  },

  reverseGeocode: async (lat: number, lng: number): Promise<any | null> => {
    try {
      const res = await api.get<any>(
        `${API_ENDPOINTS.location.reverseGeocode}?lat=${lat}&lng=${lng}`
      );
      const data = res.data;
      return (data as any)?.data || data;
    } catch (err) {
      console.warn("Backend reverseGeocode failed:", err);
      return null;
    }
  },

  getOrderEstimate: async (dto: {
    breakdown_place_id: string;
    dropoff_place_id?: string;
  }): Promise<any | null> => {
    try {
      const res = await api.post<any>(API_ENDPOINTS.location.estimate, dto);
      const data = res.data;
      return (data as any)?.data || data;
    } catch (err) {
      console.error("Backend getOrderEstimate failed:", err);
      return null;
    }
  },

  getEstimate: async (
    payload: TowingEstimateRequest
  ): Promise<TowingEstimateResponse> => {
    try {
      let breakdownPlaceId = payload.breakdown_place_id;
      let dropoffPlaceId = payload.dropoff_place_id;

      // 1. If place IDs not directly passed, search them via backend /location/search-address
      if (!breakdownPlaceId && payload.pickupLocation) {
        const pickupPredictions = await towingApi.searchAddress(payload.pickupLocation);
        if (pickupPredictions?.length > 0) {
          breakdownPlaceId = pickupPredictions[0].place_id;
        }
      }

      if (!dropoffPlaceId && payload.dropLocation) {
        const dropPredictions = await towingApi.searchAddress(payload.dropLocation);
        if (dropPredictions?.length > 0) {
          dropoffPlaceId = dropPredictions[0].place_id;
        }
      }

      // 2. Call backend /location/estimate if pickup place ID is available
      if (breakdownPlaceId) {
        const orderEst = await towingApi.getOrderEstimate({
          breakdown_place_id: breakdownPlaceId,
          dropoff_place_id: dropoffPlaceId,
        });

        if (orderEst && orderEst.sub_services && Array.isArray(orderEst.sub_services)) {
          // Distance & travel time from backend Distance Matrix
          const distanceRawMeters = orderEst.distance?.raw_value || 0;
          const distanceKm = distanceRawMeters > 0
            ? Math.round((distanceRawMeters / 1000) * 10) / 10
            : 5.1;
          const distanceMiles = Math.round((distanceKm / 1.60934) * 10) / 10;
          const distanceFormatted =
            orderEst.distance?.formatted ||
            orderEst.distance?.text ||
            `${distanceKm} km`;

          const durationFormatted =
            orderEst.travel_time?.formatted ||
            orderEst.travel_time?.text ||
            "20 mins";
          const travelMinutes = orderEst.travel_time?.raw_value
            ? Math.max(1, Math.round(orderEst.travel_time.raw_value / 60))
            : 22;

          // Find matching sub-service by ID or name
          let matchedSubService = null;
          if (payload.sub_service_id) {
            matchedSubService = orderEst.sub_services.find(
              (s: any) => s.id === payload.sub_service_id
            );
          }
          if (!matchedSubService && payload.serviceType) {
            const normalizedReq = payload.serviceType.toLowerCase().replace(/[^a-z0-9]/g, "");
            matchedSubService = orderEst.sub_services.find((s: any) => {
              const normalizedName = (s.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
              return (
                normalizedName.includes(normalizedReq) ||
                normalizedReq.includes(normalizedName)
              );
            });
          }
          if (!matchedSubService) {
            matchedSubService = orderEst.sub_services[0];
          }

          if (matchedSubService) {
            const price =
              matchedSubService.grand_total_int ||
              matchedSubService.final_amount_int ||
              89;
            const priceFormatted =
              matchedSubService.grand_total_string ||
              matchedSubService.final_amount_string ||
              `₹${price}`;

            const etaMinutes = matchedSubService.arrival_estimate?.eta?.raw_value
              ? Math.max(1, Math.round(matchedSubService.arrival_estimate.eta.raw_value / 60))
              : travelMinutes;

            return {
              distanceMiles,
              distanceKm,
              distanceFormatted,
              durationFormatted,
              baseFare: matchedSubService.base_rate_int || 75,
              distanceFare: matchedSubService.extra_distance_rate_int || 14,
              vehicleCategoryCharge: 0,
              totalEstimatedPrice: Math.round(price),
              totalEstimatedPriceFormatted: priceFormatted,
              estimatedEtaMinutes: etaMinutes,
              serviceType: payload.serviceType,
              vehicleCategory: payload.vehicleCategory || "suv",
              isApproximate: false,
              sub_services: orderEst.sub_services,
              rawEstimate: orderEst,
              breakdown: {
                baseRate: matchedSubService.base_rate_int || 75,
                perKmRate: matchedSubService.extra_distance_int || 20,
                taxes: matchedSubService.cgst_int
                  ? Math.round((matchedSubService.cgst_int + (matchedSubService.sgst_int || 0)))
                  : Math.round(price * 0.18),
              },
            };
          }
        }
      }
    } catch (err) {
      console.warn("Failed to get live backend estimate, falling back:", err);
    }

    // Realistic calculation fallback matching the estimate screen
    const pricing =
      SERVICE_BASE_RATES[payload.serviceType] || { base: 75, perMile: 4.5 };
    const distanceMiles = 3.2; // approx 5.1 km
    const distanceKm = Math.round(distanceMiles * 1.60934 * 10) / 10;
    const distanceFare = Math.round(pricing.perMile * distanceMiles);
    const totalEstimatedPrice = pricing.base + distanceFare; // e.g. $75 + $14 = $89

    return {
      distanceMiles,
      distanceKm,
      baseFare: pricing.base,
      distanceFare,
      vehicleCategoryCharge: 0,
      totalEstimatedPrice,
      totalEstimatedPriceFormatted: `~$${totalEstimatedPrice}`,
      estimatedEtaMinutes: 22,
      serviceType: payload.serviceType,
      vehicleCategory: payload.vehicleCategory || "suv",
      isApproximate: true,
      breakdown: {
        baseRate: pricing.base,
        perKmRate: Math.round(pricing.perMile / 1.60934),
        taxes: Math.round(totalEstimatedPrice * 0.08),
      },
    };
  },

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
