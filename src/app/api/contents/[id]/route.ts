import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.content.delete({
      where: { id: Number(params.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { text, linkUrl, isHidden } = body;
    
    const dataToUpdate: any = {};
    if (text !== undefined) dataToUpdate.text = text;
    if (linkUrl !== undefined) dataToUpdate.linkUrl = linkUrl;
    if (isHidden !== undefined) dataToUpdate.isHidden = isHidden;

    const content = await prisma.content.update({
      where: { id: Number(params.id) },
      data: dataToUpdate
    });
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
