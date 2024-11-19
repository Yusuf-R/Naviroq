// delete a saved location
'use server'

import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import AuthController from '@/server/controllers/AuthController';
import ClientController from '@/server/controllers/ClientController';
export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic
export async function DELETE(request) {
    try {
        await dbClient.connect();
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const adressId = await request.json();
        if (!adressId) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const clientProfile = await ClientController.DeleteLocation(userId, adressId);
        if (clientProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to delete location" }, { status: 400 });
        }
        await dbClient.close();
        return NextResponse.json(clientProfile, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}