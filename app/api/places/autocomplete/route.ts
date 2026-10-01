import { NextRequest, NextResponse } from "next/server";

const DEFAULT_API_KEY = "AIzaSyAQK1sS6O_bdakZVnLomDX-1BAWyE7ulfU";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || DEFAULT_API_KEY;

  try {
    // Primary query with country:in
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}&language=en&components=country:in`;

    let response = await fetch(url);
    let data = await response.json();

    // If zero results with country:in restriction, try global query
    if (data.status === "ZERO_RESULTS") {
      const globalUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${apiKey}&language=en`;
      const globalResponse = await fetch(globalUrl);
      const globalData = await globalResponse.json();
      if (globalData.status === "OK") {
        data = globalData;
      }
    }

    if (data.status === "OK" && Array.isArray(data.predictions)) {
      const predictions = data.predictions.map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting?.main_text || p.description,
        secondary_text: p.structured_formatting?.secondary_text || "",
      }));

      return NextResponse.json({ predictions });
    }

    return NextResponse.json({ predictions: [] });
  } catch (error) {
    console.error("Error fetching place predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions", predictions: [] },
      { status: 500 }
    );
  }
}
