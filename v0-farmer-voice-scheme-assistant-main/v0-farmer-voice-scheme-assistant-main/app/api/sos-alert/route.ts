import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/sos-alert
 *
 * Receives emergency alert data from the frontend.
 * In production, this would:
 *  - Verify the alert and filter false alarms
 *  - Find nearby users/responders within 5km radius
 *  - Send SMS / WhatsApp alerts via Twilio or similar
 *  - Log to database for tracking
 *
 * For now, it validates the payload and returns success.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { emergency_type, priority_weight, latitude, longitude, timestamp } = body

    // Validate required fields
    if (!emergency_type || priority_weight === undefined || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: emergency_type, priority_weight, timestamp" },
        { status: 400 }
      )
    }

    const validTypes = ["fire", "flood", "snake_bite", "farm_accident", "medical", "other"]
    if (!validTypes.includes(emergency_type)) {
      return NextResponse.json(
        { error: "Invalid emergency_type" },
        { status: 400 }
      )
    }

    // Log the alert (in production, store in DB and trigger notifications)
    console.log("SOS ALERT RECEIVED:", {
      emergency_type,
      priority_weight,
      latitude,
      longitude,
      timestamp,
      received_at: new Date().toISOString(),
    })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      message: "Emergency alert received and being processed",
      alert_id: `SOS-${Date.now()}`,
      emergency_type,
      priority_weight,
      location: {
        latitude,
        longitude,
        maps_url:
          latitude && longitude
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : null,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to process emergency alert" },
      { status: 500 }
    )
  }
}
