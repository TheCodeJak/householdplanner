import { NextRequest } from "next/server";
import { getAssignmentForDate } from "@/db/queries/assignments";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const familyId = searchParams.get("familyId");

  if (!date || !familyId) {
    return Response.json(
      { error: "date and familyId are required" },
      { status: 400 },
    );
  }

  const assignments = await getAssignmentForDate(date, familyId);
  return Response.json(assignments);
}
