'use client';

import { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Shield, Sliders, DollarSign } from 'lucide-react';
import type { User } from '@/lib/db/schema';

export default function SettingsClient({ user }: { user: User }) {
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [budget, setBudget] = useState(user.monthlyBudget?.toString() ?? '');
    const [preference, setPreference] = useState(user.routingPreference ?? 'balanced');
    const [saved, setSaved] = useState(false);

    const copyApiKey = () => {
        navigator.clipboard.writeText(user.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    monthlyBudget: budget ? parseFloat(budget) : null,
                    routingPreference: preference,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Configure your API key, budget, and routing preferences</p>
            </div>

            {/* API Key */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Key size={16} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>API Key</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Use this key in your Authorization header</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 code-block text-xs flex items-center" style={{ padding: '10px 14px' }}>
                        {user.apiKey}
                    </div>
                    <button className="btn-secondary px-3" onClick={copyApiKey} title="Copy API key">
                        {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                    </button>
                </div>

                <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--brand-light)' }}>Usage:</strong>{' '}
                        <code style={{ color: '#a5b4fc' }}>Authorization: Bearer {user.apiKey}</code>
                    </p>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--brand-light)' }}>Endpoint:</strong>{' '}
                        <code style={{ color: '#a5b4fc' }}>POST /api/v1/chat/completions</code>
                    </p>
                </div>
            </div>

            {/* Budget Cap */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <DollarSign size={16} style={{ color: '#10b981' }} />
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Budget Cap</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Requests will be blocked when this limit is reached</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>$</span>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="No limit"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>/ month</span>
                </div>
            </div>

            {/* Routing Preference */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Sliders size={16} style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Routing Preference</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Controls how aggressively we optimize for cost vs quality</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {(['cost', 'balanced', 'quality'] as const).map(pref => (
                        <button
                            key={pref}
                            onClick={() => setPreference(pref)}
                            className="p-3 rounded-lg text-sm font-medium transition-all text-center"
                            style={{
                                background: preference === pref ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                                border: preference === pref ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
                                color: preference === pref ? 'var(--brand-light)' : 'var(--text-secondary)',
                            }}
                        >
                            <div className="font-semibold capitalize">{pref}</div>
                            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {pref === 'cost' && 'Max savings'}
                                {pref === 'balanced' && 'Recommended'}
                                {pref === 'quality' && 'Best output'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button className="btn-primary" onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
            </button>
        </div>
    );
}
