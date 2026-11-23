import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
    params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const task = await prisma.task.update({
        where: {
            id: Number(id),
        },
        data: {
            title: body.title,
            description: body.description || null,
            category: body.category,
            priority: body.priority,
            status: body.status,
            dueDate: body.dueDate ? new Date(body.dueDate) : null,
        },
    });

    return NextResponse.json(task);
    } catch {
        return NextResponse.json(
        { message: "Failed to update task" },
        { status: 500 }
        );
    }
}

export async function DELETE(_: Request, context: Context) {
    try {
        const { id } = await context.params;

        await prisma.task.delete({
        where: {
            id: Number(id),
        },
        });

        return NextResponse.json({
        message: "Task deleted successfully",
        });
    } catch {
        return NextResponse.json(
        { message: "Failed to delete task" },
        { status: 500 }
        );
    }
}