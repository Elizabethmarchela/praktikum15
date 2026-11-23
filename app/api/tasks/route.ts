import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
        orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(tasks);
        } catch (error) {
    console.error("FETCH TASKS ERROR:", error);
    console.error("DATABASE URL EXISTS:", !!process.env.DATABASE_URL);

    return NextResponse.json(
        { message: "Failed to fetch tasks" },
        { status: 500 }
    );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const task = await prisma.task.create({
        data: {
            title: body.title,
            description: body.description || null,
            category: body.category,
            priority: body.priority || "Medium",
            status: body.status || "To Do",
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
        },
        });

        return NextResponse.json(task, { status: 201 });
    } catch {
        return NextResponse.json(
        { message: "Failed to create task" },
        { status: 500 }
        );
    }
}