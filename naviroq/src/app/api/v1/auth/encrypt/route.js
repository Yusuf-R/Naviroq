'use server'
// api call to encrypt a data
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';


export async function POST(request) {
    try {
        await dbClient.connect();
        const data = await request.json();
        const encryptedData = await AuthController.encryptData(data);
        await dbClient.close();
        return NextResponse.json(encryptedData, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}