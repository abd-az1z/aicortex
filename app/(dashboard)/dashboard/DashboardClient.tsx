'use client';

import { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    DollarSign, TrendingDown, Zap, Clock, AlertCircle,
    ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import type { User } from '@/lib/db/schema';

interface DashboardClientProps {
    user: User;
    stats: {
        totalSpend: number;
        totalSavings: number;
        totalHypotheticalSpend: number;
        savingsPercent: number;
        requestCount: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        avgLatency: number;
        errorRate: number;
        spendByModel: Record<string, number>;
    };
    spendHistory: Array<{ period: string; spend: number; savings: number; hypothetical: number }>;
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({
    title, value, subtitle, icon: Icon, trend, color = 'brand'
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: string; positive: boolean };
    color?: 'brand' | 'green' | 'yellow' | 'red';
}) {
    const colorMap = {
        brand: { bg: 'rgba(99,102,241,0.1)', icon: '#6366f1', border: 'rgba(99,102,241,0.2)' },
        green: { bg: 'rgba(16,185,129,0.1)', icon: '#10b981', border: 'rgba(16,185,129,0.2)' },
        yellow: { bg: 'rgba(245,158,11,0.1)', icon: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        red: { bg: 'rgba(239,68,68,0.1)', icon: '#ef4444', border: 'rgba(239,68,68,0.2)' },
    };
    const c = colorMap[color];

    return (
        <div className="stat-card animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon size={18} style={{ color: c.icon }} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-medium" style={{ color: trend.positive ? '#10b981' : '#ef4444' }}>
                        {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</div>
            {subtitle && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 text-xs" style={{ border: '1px solid var(--border-bright)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: ${Number(entry.value).toFixed(4)}
                </p>
            ))}
        </div>
    );
};

export default function DashboardClient({ user, stats, spendHistory }: DashboardClientProps) {
    const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;

    // Pie chart data for spend by model
    const pieData = Object.entries(stats.spendByModel)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([model, spend]) => ({
            name: model.replace('claude-3-5-sonnet-20241022', 'claude-3.5-sonnet')
                .replace('claude-3-haiku-20240307', 'claude-3-haiku')
                .replace('llama-3.1-8b-instant', 'llama-3.1-8b')
                .replace('llama-3.1-70b-versatile', 'llama-3.1-70b'),
            value: spend,
        }));

    const hasData = stats.requestCount > 0;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Cost Intelligence Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    This month's LLM spend optimization overview
                </p>
            </div>

            {/* Savings Banner */}
            {hasData && stats.savingsPercent > 0 && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-4 animate-fade-in-up"
                    style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                        <TrendingDown size={20} style={{ color: '#10b981' }} />
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: '#10b981' }}>
                            🎉 You've saved {stats.savingsPercent}% vs always using GPT-4o this month
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            ${stats.totalSavings.toFixed(4)} saved · ${stats.totalSpend.toFixed(4)} actual spend vs ${stats.totalHypotheticalSpend.toFixed(4)} hypothetical
                        </p>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Spend"
                    value={`$${stats.totalSpend.toFixed(4)}`}
                    subtitle="This month"
                    icon={DollarSign}
                    color="brand"
                />
                <StatCard
                    title="Total Savings"
                    value={`$${stats.totalSavings.toFixed(4)}`}
                    subtitle={`${stats.savingsPercent}% vs GPT-4o baseline`}
                    icon={TrendingDown}
                    color="green"
                    trend={stats.savingsPercent > 0 ? { value: `${stats.savingsPercent}%`, positive: true } : undefined}
                />
                <StatCard
                    title="Requests Processed"
                    value={stats.requestCount.toLocaleString()}
                    subtitle={`${(totalTokens / 1000).toFixed(1)}K tokens total`}
                    icon={Zap}
                    color="yellow"
                />
                <StatCard
                    title="Avg Latency"
                    value={`${stats.avgLatency}ms`}
                    subtitle={`${stats.errorRate}% error rate`}
                    icon={Clock}
                    color={stats.errorRate > 5 ? 'red' : 'brand'}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Spend vs Savings Over Time */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Spend vs Hypothetical Cost</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly comparison — actual spend vs if you used GPT-4o for everything</p>
                    {spendHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={spendHistory}>
                                <defs>
                                    <linearGradient id="colorHypo" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="period" tick={{ fill: '#555577', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#555577', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="hypothetical" name="Hypothetical (GPT-4o)" stroke="#ef4444" strokeWidth={1.5} fill="url(#colorHypo)" strokeDasharray="4 4" />
                                <Area type="monotone" dataKey="spend" name="Actual Spend" stroke="#6366f1" strokeWidth={2} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center flex-col gap-2">
                            <Activity size={32} style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet — make your first API call to see savings</p>
                        </div>
                    )}
                </div>

                {/* Spend by Model */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Spend by Model</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Last 30 days</p>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {pieData.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => [`$${v.toFixed(6)}`, 'Spend']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <span style={{ color: 'var(--text-secondary)' }} className="truncate max-w-[120px]">{item.name}</span>
                                        </div>
                                        <span style={{ color: 'var(--text-primary)' }}>${item.value.toFixed(4)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center">
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No requests yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Start */}
            {!hasData && (
                <div className="glass-card p-6 animate-fade-in-up">
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🚀 Get Started in 30 Seconds</h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Replace your OpenAI endpoint with AICortex. That's it.
                    </p>
                    <div className="code-block text-xs">
                        {`# Before (OpenAI)
curl https://api.openai.com/v1/chat/completions \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{"model": "gpt-4o", "messages": [...]}'

# After (AICortex — same format, 20-40% cheaper)
curl ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://api.aicortex.dev'}/api/v1/chat/completions \\
  -H "Authorization: Bearer ${user.apiKey}" \\
  -d '{"model": "auto", "messages": [...]}'`}
                    </div>
                </div>
            )}
        </div>
    );
}
