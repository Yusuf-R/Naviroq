'use server';
import { NextResponse } from "next/server";
import AuthController from '@/server/controllers/AuthController';
import DriverController from '@/server/controllers/DriverController';


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
        const driverProfile = await DriverController.UpdateBioData(userId, obj);
        if (driverProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update location" }, { status: 400 });
        }
        return NextResponse.json(driverProfile, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
