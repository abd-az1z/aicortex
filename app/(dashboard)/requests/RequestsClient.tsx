'use client';

import { useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';
import type { Request } from '@/lib/db/schema';

interface RequestsClientProps {
    requests: Request[];
}

function formatCost(cost: number) {
    if (cost === 0) return '$0.00';
    if (cost < 0.0001) return `<$0.0001`;
    return `$${cost.toFixed(6)}`;
}

function formatLatency(ms: number) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

export default function RequestsClient({ requests }: RequestsClientProps) {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('all');

    const filtered = requests.filter(r => {
        const matchesSearch = !search || r.modelUsed.toLowerCase().includes(search.toLowerCase());
        const matchesTier = tierFilter === 'all' || r.modelTier === tierFilter;
        return matchesSearch && matchesTier;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Request Log</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Every API call routed through AICortex — {requests.length} total
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                        className="input-field pl-9"
                        placeholder="Search by model..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input-field w-auto"
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                    style={{ width: 'auto', minWidth: '140px' }}
                >
                    <option value="all">All Tiers</option>
                    <option value="cheap">Cheap</option>
                    <option value="mid">Mid</option>
                    <option value="premium">Premium</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Activity size={40} style={{ color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No requests yet</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Make your first API call to see it here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Model</th>
                                    <th>Tier</th>
                                    <th>Difficulty</th>
                                    <th>Tokens</th>
                                    <th>Actual Cost</th>
                                    <th>Savings</th>
                                    <th>Latency</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(req => (
                                    <tr key={req.id}>
                                        <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(req.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                                                {req.modelUsed.replace('claude-3-5-sonnet-20241022', 'claude-3.5-sonnet').replace('claude-3-haiku-20240307', 'claude-3-haiku')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${req.modelTier}`}>{req.modelTier}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${req.difficultyScore * 100}%`,
                                                            background: req.difficultyScore > 0.7 ? '#6366f1' : req.difficultyScore > 0.3 ? '#f59e0b' : '#10b981',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.difficultyScore.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {(req.inputTokens + req.outputTokens).toLocaleString()}
                                        </td>
                                        <td style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '12px' }}>
                                            {formatCost(req.costActual)}
                                        </td>
                                        <td>
                                            <span style={{ color: '#10b981', fontFamily: 'monospace', fontSize: '12px' }}>
                                                +{formatCost(req.savingsDelta)}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{formatLatency(req.latencyMs)}</td>
                                        <td>
                                            <span className={`badge badge-${req.status}`}>{req.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
