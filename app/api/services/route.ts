import { NextResponse } from "next/server";

export interface BackendSubService {
  id: number;
  name: string;
  service_id: number;
  is_active: boolean;
  base_distance?: number;
  base_price?: number;
  extra_distance_price?: number;
  ton?: number;
  image_url?: string | null;
  journey_type?: string;
}

export interface BackendService {
  id: number;
  name: string;
  description?: string | null;
  image_url?: string | null;
  sub_services?: BackendSubService[];
}

export interface ServiceOptionItem {
  id: string;
  name: string;
  label: string;
  service_id: number;
  sub_service_id: number;
  service_name: string;
  description?: string;
  base_price?: number;
  base_distance?: number;
  icon: string;
}

// Fallback matching backend DB exactly
const DEFAULT_BACKEND_SERVICES: BackendService[] = [
  {
    id: 1,
    name: "Towing",
    description: "Vehicle towing and breakdown recovery",
    sub_services: [
      { id: 1, name: "Flatbed", service_id: 1, is_active: true, base_price: 100, base_distance: 5 },
      { id: 3, name: "Underlift", service_id: 1, is_active: true, base_price: 100, base_distance: 5 },
      { id: 4, name: "Zero Degree", service_id: 1, is_active: true, base_price: 120, base_distance: 5 },
      { id: 5, name: "2-Wheeler Flatbed", service_id: 1, is_active: true, base_price: 80, base_distance: 5 },
      { id: 11, name: "Flatbed Towing", service_id: 1, is_active: true, base_price: 100, base_distance: 5 },
    ],
  },
  {
    id: 2,
    name: "Technician",
    description: "On-demand roadside assistance and quick repair",
    sub_services: [
      { id: 2, name: "Jump Start", service_id: 2, is_active: true, base_price: 60, base_distance: 5 },
      { id: 6, name: "Mechanic", service_id: 2, is_active: true, base_price: 80, base_distance: 5 },
    ],
  },
  {
    id: 3,
    name: "Custody",
    description: "Secure vehicle storage and custody handling",
    sub_services: [
      { id: 7, name: "Custodian", service_id: 3, is_active: true, base_price: 150, base_distance: 5 },
    ],
  },
  {
    id: 4,
    name: "Hydra",
    description: "Heavy crane and specialized winch recovery",
    sub_services: [
      { id: 8, name: "12 Ton", service_id: 4, is_active: true, base_price: 250, base_distance: 5 },
      { id: 9, name: "20 Ton", service_id: 4, is_active: true, base_price: 350, base_distance: 5 },
      { id: 10, name: "25+ Ton", service_id: 4, is_active: true, base_price: 500, base_distance: 5 },
    ],
  },
];

function mapIconName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("jump") || lower.includes("battery")) return "BatteryCharging";
  if (lower.includes("flatbed") || lower.includes("underlift") || lower.includes("tow")) return "Truck";
  if (lower.includes("tire") || lower.includes("puncture") || lower.includes("wheel")) return "Disc";
  if (lower.includes("fuel") || lower.includes("petrol") || lower.includes("diesel")) return "Fuel";
  if (lower.includes("lock") || lower.includes("custod") || lower.includes("key")) return "Key";
  if (lower.includes("mechanic") || lower.includes("tech") || lower.includes("repair")) return "Wrench";
  if (lower.includes("hydra") || lower.includes("crane") || lower.includes("recovery")) return "ShieldCheck";
  return "Truck";
}

function normalizeOptions(services: BackendService[]): ServiceOptionItem[] {
  const options: ServiceOptionItem[] = [];

  for (const s of services) {
    if (s.sub_services && s.sub_services.length > 0) {
      for (const ss of s.sub_services) {
        if (ss.is_active !== false) {
          const slug = ss.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
          const label =
            ss.name.toLowerCase().includes("flatbed") && !ss.name.toLowerCase().includes("tow")
              ? `${ss.name} Tow`
              : ss.name;

          options.push({
            id: slug,
            name: ss.name,
            label,
            service_id: s.id,
            sub_service_id: ss.id,
            service_name: s.name,
            description: s.description || undefined,
            base_price: ss.base_price,
            base_distance: ss.base_distance,
            icon: mapIconName(ss.name),
          });
        }
      }
    } else {
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      options.push({
        id: slug,
        name: s.name,
        label: s.name,
        service_id: s.id,
        sub_service_id: s.id,
        service_name: s.name,
        description: s.description || undefined,
        icon: mapIconName(s.name),
      });
    }
  }

  return options;
}

export async function GET() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://towchen-api-1.onrender.com";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  try {
    // 1. Try local/configured backend endpoint
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}/service?include_sub_services=true`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    }).catch(() => null);

    clearTimeout(timeout);

    if (res && res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (Array.isArray(data) && data.length > 0) {
        // If services came back with sub_services
        const hasSub = data.some((s: any) => Array.isArray(s.sub_services) && s.sub_services.length > 0);
        if (hasSub) {
          return NextResponse.json({
            success: true,
            source: "backend-api",
            services: data,
            options: normalizeOptions(data),
          });
        }

        // Merge parent services with default DB sub-services
        const enriched = data.map((s: any) => {
          const match = DEFAULT_BACKEND_SERVICES.find((d) => d.id === s.id || d.name === s.name);
          return {
            ...s,
            sub_services: match ? match.sub_services : [],
          };
        });

        return NextResponse.json({
          success: true,
          source: "backend-enriched",
          services: enriched,
          options: normalizeOptions(enriched),
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch services from backend, using database seed fallback:", err);
  }

  // Graceful fallback to verified DB seed
  return NextResponse.json({
    success: true,
    source: "database-seed",
    services: DEFAULT_BACKEND_SERVICES,
    options: normalizeOptions(DEFAULT_BACKEND_SERVICES),
  });
}
