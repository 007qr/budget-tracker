'use server';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '~/lib/prisma';
import { CreateTransactionSchema, CreateTransactionSchemaType } from '~/schema/transaction';

export async function CreateTransactions(form: CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form);
    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();
    if (!user) redirect('/sign-in');

    const { amount, category, date, description, type } = parsedBody.data;
    const categoryRow = await prisma.category.findFirst({
        where: {
            userId: user.id,
            name: category,
        },
    });

    if (!categoryRow) {
        throw new Error('Category not found');
    }

    // NOTE: don't be consfused between $transaction (prisma) and prisma.transaction (table)

    await prisma.$transaction([
        // Create a user transaction
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount,
                date,
                description: description || '',
                type,
                category: categoryRow.name,
                categoryIcon: categoryRow.icon,
            },
        }),
        // Update month aggregate table
        prisma.monthHistory.upsert({
            where: {
                day_month_year_userId: {
                    userId: user.id,
                    day: date.getUTCDate(),
                    month: date.getMonth(),
                    year: date.getFullYear(),
                },
            },
            create: {
                userId: user.id,
                day: date.getUTCDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },
                income: {
                    increment: type === 'income' ? amount : 0,
                },
            },
        }),
        // Update year agggregate table
        prisma.yearHistory.upsert({
            where: {
                month_year_userId: {
                    userId: user.id,
                    month: date.getMonth(),
                    year: date.getFullYear(),
                },
            },
            create: {
                userId: user.id,
                month: date.getMonth(),
                year: date.getFullYear(),
                expense: type === 'expense' ? amount : 0,
                income: type === 'income' ? amount : 0,
            },
            update: {
                expense: {
                    increment: type === 'expense' ? amount : 0,
                },
                income: {
                    increment: type === 'income' ? amount : 0,
                },
            },
        }),
    ]);
}
