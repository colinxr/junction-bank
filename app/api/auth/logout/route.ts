import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from '@/infrastructure/supabase/server';

export async function POST() {
  try {
    // Sign out from Supabase
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("auth_user");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 