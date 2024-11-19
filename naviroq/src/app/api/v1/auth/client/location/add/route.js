
import { NextResponse } from 'next/server';
import AuthController from '@/server/controllers/AuthController';
import ClientController from '@/server/controllers/ClientController';

export const dynamic = 'force-dynamic'; // Ensure all routes in /client are dynamic

export async function PATCH(request) {
    try {
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const obj = await request.json();
        if (!obj) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const clientProfile = await ClientController.AddLocation(userId, obj);
        if (clientProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update location" }, { status: 400 });
        }
        return NextResponse.json(clientProfile, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}