'use server'
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import AuthController from '@/server/controllers/AuthController';
import DriverController from '@/server/controllers/DriverController';


export async function PATCH(request) {
    try {
        await dbClient.connect();
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const obj = await request.json();
        if (!obj) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const driverProfile = await DriverController.SetLocation(userId, obj);
        if (driverProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update location" }, { status: 400 });
        }
        await dbClient.close();
        return NextResponse.json(driverProfile, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}