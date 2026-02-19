'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
    LayoutDashboard,
    Activity,
    Settings,
    CreditCard,
    BookOpen,
    Zap,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/requests', label: 'Requests', icon: Activity },
    { href: '/docs', label: 'Quick Start', icon: BookOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/billing', label: 'Billing', icon: CreditCard },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 min-h-screen flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-brand" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold text-base tracking-tight gradient-text">AICortex</span>
            </Link>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
                            style={{
                                background: active ? 'var(--brand-glow)' : 'transparent',
                                color: active ? 'var(--brand-light)' : 'var(--text-secondary)',
                                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                            }}
                        >
                            <Icon size={16} />
                            {label}
                            {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="px-4 py-4 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                <UserButton afterSignOutUrl="/" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>Account</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Manage profile</p>
                </div>
            </div>
        </aside>
    );
}
