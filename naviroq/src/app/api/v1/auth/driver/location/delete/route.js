// delete a saved location
'use server'

import { NextResponse } from 'next/server';
import AuthController from '@/server/controllers/AuthController';
import DriverController from '@/server/controllers/DriverController';


export async function DELETE(request) {
    try {
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const adressId = await request.json();
        if (!adressId) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const driverProfile = await DriverController.DeleteLocation(userId, adressId);
        if (driverProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to delete location" }, { status: 400 });
        }
        return NextResponse.json(driverProfile, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}