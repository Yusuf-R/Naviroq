'use server';
// src/app/api/client/profile/route.js
import { NextResponse } from "next/server";
import AuthController from "@/server/controllers/AuthController";
import ClientController from "@/server/controllers/ClientController";

export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic
export async function GET(request) {
    try {
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const clientProfile = await ClientController.Profile(userId);
        if (clientProfile instanceof Error) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(
            clientProfile,
            {
                status: 200
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}