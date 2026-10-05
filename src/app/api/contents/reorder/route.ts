import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { orderedIds } = await req.json(); // array of content ids in new order

    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.content.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder contents" }, { status: 500 });
  }
}
