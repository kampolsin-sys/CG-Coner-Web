import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { orderedIds } = await req.json(); // array of topic ids in new order

    // We can run updates in a transaction
    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.topic.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder topics" }, { status: 500 });
  }
}
