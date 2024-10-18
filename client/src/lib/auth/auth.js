import NextAuth from "next-auth";
import options from "@/lib/auth/options";

export const { handlers, signIn, signOut, auth } = NextAuth(options);