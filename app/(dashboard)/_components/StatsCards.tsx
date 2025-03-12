'use client';

import { UserSettings } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp, WalletIcon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { GetBalanceStatsResponseType } from '~/app/api/stats/balance/route';
import SkeleteonWrapper from '~/components/SkeleteonWrapper';
import { Card } from '~/components/ui/card';
import { DateToUTCDate, GetFormatterForCurrency } from '~/lib/helpers';
import CountUp from 'react-countup';

interface Props {
    userSettings: UserSettings;
    from: Date;
    to: Date;
}

function StatsCards({ userSettings, from, to }: Props) {
    const statsQuery = useQuery<GetBalanceStatsResponseType>({
        queryKey: ['overview', 'stats', from, to],
        queryFn: () =>
            fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res) => res.json()),
    });

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency]);

    const income = statsQuery.data?.income || 0;
    const expense = statsQuery.data?.expense || 0;
    const balance = income - expense;

    return (
        <>
            <div className="relative flex w-full gap-2 flex-wrap md:flex-nowrap">
                <SkeleteonWrapper isLoading={statsQuery.isFetching}>
                    <StatsCard
                        formatter={formatter}
                        value={income}
                        title="income"
                        icon={
                            <TrendingUp className="h-12 w-12 items-center rounded-lg text-emerald-500 bg-emerald-400/10" />
                        }
                    />
                </SkeleteonWrapper>
                <SkeleteonWrapper isLoading={statsQuery.isFetching}>
                    <StatsCard
                        formatter={formatter}
                        value={expense}
                        title="expense"
                        icon={<TrendingDown className="h-12 w-12 items-center rounded-lg text-red-500 bg-red-400/10" />}
                    />
                </SkeleteonWrapper>
                <SkeleteonWrapper isLoading={statsQuery.isFetching}>
                    <StatsCard
                        formatter={formatter}
                        value={balance}
                        title="balance"
                        icon={
                            <WalletIcon className="h-12 w-12 items-center rounded-lg text-violet-500 bg-violet-400/10" />
                        }
                    />
                </SkeleteonWrapper>
            </div>
        </>
    );
}

function StatsCard({
    formatter,
    value,
    title,
    icon,
}: {
    formatter: Intl.NumberFormat;
    value: number;
    title: string;
    icon: React.ReactNode;
}) {
    const formatFn = useCallback(
        (value: number) => {
            return formatter.format(value);
        },
        [formatter]
    );

    return (
        <Card className="flex h-24 w-full items-center gap-2 p-4">
            {icon}
            <div className="flex flex-col items-start gap-0">
                <p className="text-muted-foreground">{title}</p>
                <CountUp
                    preserveValue
                    redraw={false}
                    end={value}
                    decimals={2}
                    formattingFn={formatFn}
                    className="text-2xl"
                />
            </div>
        </Card>
    );
}

export default StatsCards;
