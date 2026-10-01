import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_KEY = "AIzaSyAQK1sS6O_bdakZVnLomDX-1BAWyE7ulfU";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return NextResponse.json(
      { error: "Invalid latitude or longitude numbers" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || DEFAULT_API_KEY;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${numLat},${numLng}&key=${apiKey}&language=en`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
      // Find the most descriptive result: prefer street_address, premise, or subpremise, else fallback to results[0]
      const bestResult =
        data.results.find((r: any) =>
          r.types.some((t: string) =>
            ["street_address", "premise", "subpremise", "route", "point_of_interest"].includes(t)
          )
        ) || data.results[0];

      let city = "";
      let state = "";
      let pincode = "";
      let area = "";

      for (const comp of bestResult.address_components || []) {
        if (comp.types.includes("locality")) {
          city = comp.long_name;
        } else if (comp.types.includes("administrative_area_level_1")) {
          state = comp.long_name;
        } else if (comp.types.includes("postal_code")) {
          pincode = comp.long_name;
        } else if (
          comp.types.includes("sublocality") ||
          comp.types.includes("sublocality_level_1")
        ) {
          area = comp.long_name;
        }
      }

      return NextResponse.json({
        success: true,
        address: bestResult.formatted_address,
        formatted_address: bestResult.formatted_address,
        place_id: bestResult.place_id,
        latitude: numLat,
        longitude: numLng,
        city,
        state,
        pincode,
        area,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: data.error_message || data.status || "No address found for these coordinates",
        address: `${numLat.toFixed(4)}, ${numLng.toFixed(4)}`,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reverse geocode coordinates",
        address: `${numLat.toFixed(4)}, ${numLng.toFixed(4)}`,
      },
      { status: 500 }
    );
  }
}
