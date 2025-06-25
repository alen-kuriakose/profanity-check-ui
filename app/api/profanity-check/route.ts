/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Example: always returns success, replace with your logic if needed
  return NextResponse.json({ status: "success", message: "Profanity check completed", responseData: null });
}
