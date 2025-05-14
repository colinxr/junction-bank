"use client";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignIn />

      <div className="text-sm text-muted-foreground text-center mt-4">
        Don't have an account?{` `}
        <Link href="/auth/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
