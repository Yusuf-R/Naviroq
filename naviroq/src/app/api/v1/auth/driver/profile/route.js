'use server';
// src/app/api/client/profile/route.js
import { NextResponse } from "next/server";
import AuthController from "@/server/controllers/AuthController";
import DriverController from "@/server/controllers/DriverController";


export async function GET(request) {
    try {
        const driverId = await AuthController.headlessCheck(request);
        if (driverId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const driverProfile = await DriverController.Profile(driverId);
        if (driverProfile instanceof Error) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }
        // Return the driver profile
        return NextResponse.json(driverProfile, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}