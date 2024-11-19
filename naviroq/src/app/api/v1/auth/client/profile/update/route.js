'use server';
import { NextResponse } from "next/server";
import AuthController from '@/server/controllers/AuthController';
import ClientController from '@/server/controllers/ClientController';


// Backend PATCH endpoint
export async function PATCH(req) {
    try {
        const userId = await AuthController.headlessCheck(req);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const obj = await req.json();
        if (!obj) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const clientProfile = await ClientController.UpdateBioData(userId, obj);
        if (clientProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update location" }, { status: 400 });
        }
        return NextResponse.json(clientProfile, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
