'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Zap, Shield, Building2, CheckCircle, ExternalLink } from 'lucide-react';
import type { User } from '@/lib/db/schema';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$299',
        period: '/month',
        description: 'Perfect for early-stage AI startups',
        icon: Zap,
        color: '#6366f1',
        features: [
            'Up to 500K requests/month',
            'Basic cost-aware routing',
            '5 model providers',
            'Cost analytics dashboard',
            'Email support',
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: '$999',
        period: '/month',
        description: 'For scaling AI-native companies',
        icon: Shield,
        color: '#10b981',
        popular: true,
        features: [
            'Unlimited requests',
            'Advanced routing + fallback chains',
            'Budget guardrails',
            'Complexity scoring tuning',
            'Priority support',
            'Custom routing rules',
            'Savings reports',
        ],
        priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Dedicated cluster + SLA routing',
        icon: Building2,
        color: '#f59e0b',
        features: [
            'Everything in Growth',
            'Dedicated infrastructure',
            'SLA-aware routing',
            'On-prem deployment option',
            'SOC2 compliance',
            'Dedicated account manager',
            'Custom integrations',
        ],
    },
];

export default function BillingClient({ user }: { user: User }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            // Clean the URL without a page reload
            window.history.replaceState({}, '', '/billing');
        }
    }, [searchParams]);

    const handleManage = async () => {
        setLoading('manage');
        try {
            const res = await fetch('/api/billing/portal', { method: 'POST' });
            const { url } = await res.json();
            if (url) window.location.href = url;
        } finally {
            setLoading(null);
        }
    };

    const handleSubscribe = async (planId: string, priceId?: string) => {
        if (planId === 'enterprise') {
            window.location.href = 'mailto:hello@aicortex.dev?subject=Enterprise Plan Inquiry';
            return;
        }
        if (!priceId) return;

        setLoading(planId);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const { url } = await res.json();
            if (url) window.location.href = url;
        } finally {
            setLoading(null);
        }
    };

    const hasPaidPlan = user.plan !== 'free';

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {showSuccess && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <div>
                        <p className="font-semibold" style={{ color: '#10b981' }}>Subscription activated!</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Your plan has been upgraded. Changes take effect immediately.
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Choose Your Plan</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    We price on value delivered — not per token. Your current plan: <strong style={{ color: 'var(--brand-light)' }}>{user.plan}</strong>
                </p>
                {hasPaidPlan && (
                    <button
                        className="btn-secondary text-sm mt-3 inline-flex items-center gap-2"
                        onClick={handleManage}
                        disabled={loading === 'manage'}
                    >
                        <ExternalLink size={14} />
                        {loading === 'manage' ? 'Opening portal...' : 'Manage or cancel subscription'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const Icon = plan.icon;
                    const isCurrentPlan = user.plan === plan.id;
                    const isPopular = plan.popular;

                    return (
                        <div
                            key={plan.id}
                            className="glass-card p-6 flex flex-col relative"
                            style={isPopular ? { border: '1px solid rgba(16,185,129,0.4)', boxShadow: '0 0 30px rgba(16,185,129,0.08)' } : {}}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ background: '#10b981', color: 'white' }}>
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                    style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40` }}>
                                    <Icon size={18} style={{ color: plan.color }} />
                                </div>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-2 flex-1 mb-6">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={isCurrentPlan ? 'btn-secondary w-full justify-center' : 'btn-primary w-full justify-center'}
                                onClick={() => handleSubscribe(plan.id, plan.priceId)}
                                disabled={isCurrentPlan || loading === plan.id}
                                style={!isCurrentPlan && plan.id !== 'enterprise' ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` } : {}}
                            >
                                {loading === plan.id ? 'Redirecting...' : isCurrentPlan ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                All plans include a 14-day money-back guarantee. No setup fees.
            </p>
        </div>
    );
}
