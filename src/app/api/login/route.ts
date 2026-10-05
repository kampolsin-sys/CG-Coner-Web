import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// In a real app, use environment variables. For simplicity, we hardcode a default or use ENV.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cgadmin2026";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      // Set HTTP-only cookie
      cookies().set({
        name: "admin_token",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
