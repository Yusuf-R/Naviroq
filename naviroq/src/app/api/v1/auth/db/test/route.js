'use server';
import dbClient from "@/server/database/mongoDB"; //  conn test
import { NextResponse } from "next/server";


// Test connection to MongoDB
export async function GET() {
    try {
        await dbClient.connect();
        return NextResponse.json({ message: 'Connection successful', project: 'Naviroq' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Connection failed', error: error.message }, { status: 400 });
    }
}