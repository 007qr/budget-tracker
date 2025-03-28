import React, { ReactNode } from 'react';
import Navbar from '~/components/Navbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative h-screen w-full flex-col">
            <Navbar />
            <div className="w-full px-8">{children}</div>
        </div>
    );
}
