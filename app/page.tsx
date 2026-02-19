'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Zap, TrendingDown, Shield, ArrowRight, Check, Code2, BarChart3, GitBranch } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        icon: GitBranch,
        title: 'Intelligent Routing',
        description: 'Complexity scoring engine analyzes every request and routes to the optimal model — cheap for simple, premium for complex.',
        color: '#6366f1',
    },
    {
        icon: TrendingDown,
        title: '20–40% Cost Reduction',
        description: 'Stop paying GPT-4o prices for tasks that Llama-8B handles perfectly. Every dollar saved is tracked and reported.',
        color: '#10b981',
    },
    {
        icon: Shield,
        title: 'Automatic Fallback',
        description: 'If a model fails or times out, we automatically retry and escalate. Zero downtime, zero manual intervention.',
        color: '#f59e0b',
    },
    {
        icon: BarChart3,
        title: 'Full Cost Visibility',
        description: 'Per-request cost logging, savings delta vs GPT-4o baseline, spend by model, and monthly rollups.',
        color: '#8b5cf6',
    },
    {
        icon: Code2,
        title: 'Drop-In Replacement',
        description: 'OpenAI-compatible API. Change one URL. No SDK changes, no prompt rewrites, no migration headaches.',
        color: '#06b6d4',
    },
    {
        icon: Zap,
        title: '5 Provider Network',
        description: 'OpenAI, Anthropic, Gemini, Groq, and Mistral — all behind one endpoint with unified pricing intelligence.',
        color: '#ef4444',
    },
];

const models = [
    { name: 'GPT-4o', tier: 'premium', cost: '$5.00/1M', provider: 'OpenAI' },
    { name: 'Claude 3.5 Sonnet', tier: 'premium', cost: '$3.00/1M', provider: 'Anthropic' },
    { name: 'GPT-4o Mini', tier: 'mid', cost: '$0.15/1M', provider: 'OpenAI' },
    { name: 'Llama 3.1 70B', tier: 'mid', cost: '$0.59/1M', provider: 'Groq' },
    { name: 'Gemini 1.5 Flash', tier: 'cheap', cost: '$0.075/1M', provider: 'Google' },
    { name: 'Llama 3.1 8B', tier: 'cheap', cost: '$0.05/1M', provider: 'Groq' },
];

export default function LandingPage() {
    return (
        <div className="hero-bg min-h-screen">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-brand" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight gradient-text">AICortex</span>
                </div>
                <div className="flex items-center gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="btn-secondary text-sm py-2 px-4">Sign In</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="btn-primary text-sm py-2 px-4">Get Started Free</button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                            Go to Dashboard
                        </Link>
                    </SignedIn>
                </div>
            </nav>

            {/* Hero */}
            <section className="text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI FinOps for AI-native companies
                </div>

                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                    Reduce your LLM bill<br />
                    <span className="gradient-text-green">by 20–40%</span>
                </h1>

                <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    AICortex is the intelligent routing layer between your app and LLM providers.
                    Drop-in OpenAI replacement. Route cheap. Save money. Never compromise quality.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                    <SignedOut>
                        <SignUpButton mode="modal">
                            <button className="btn-primary text-base py-3 px-8">
                                Start Saving Now <ArrowRight size={16} />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard" className="btn-primary text-base py-3 px-8">
                            Go to Dashboard <ArrowRight size={16} />
                        </Link>
                    </SignedIn>
                    <a href="#how-it-works" className="btn-secondary text-base py-3 px-8 justify-center">
                        See How It Works
                    </a>
                </div>

                {/* Code snippet */}
                <div className="code-block text-left text-xs max-w-2xl mx-auto">
                    <span style={{ color: '#555577' }}># Before — paying GPT-4o for everything</span>{'\n'}
                    <span style={{ color: '#ef4444' }}>- api.openai.com/v1/chat/completions</span>{'\n\n'}
                    <span style={{ color: '#555577' }}># After — intelligent routing, 20-40% cheaper</span>{'\n'}
                    <span style={{ color: '#10b981' }}>+ api.aicortex.dev/api/v1/chat/completions</span>{'\n\n'}
                    <span style={{ color: '#555577' }}># Same API format. One line change. That's it.</span>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="px-6 py-20 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>How It Works</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Three steps. Zero friction.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: '01', title: 'Replace One URL', desc: 'Point your app at api.aicortex.dev instead of api.openai.com. Same JSON format, same response structure.' },
                        { step: '02', title: 'We Score Complexity', desc: 'Every request is analyzed — prompt length, task type, context size — and assigned a difficulty score 0–1.' },
                        { step: '03', title: 'Optimal Model Wins', desc: 'Simple request? Groq Llama-8B at $0.05/1M. Complex analysis? GPT-4o. You pay for what you actually need.' },
                    ].map(({ step, title, desc }) => (
                        <div key={step} className="glass-card p-6 text-center">
                            <div className="text-4xl font-bold mb-3 gradient-text">{step}</div>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Model Network */}
            <section className="px-6 py-16 max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>5 Providers. One Endpoint.</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>We route across the best models so you don't have to manage multiple APIs.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {models.map(model => (
                        <div key={model.name} className="glass-card p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{model.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.provider}</p>
                            </div>
                            <div className="text-right">
                                <span className={`badge badge-${model.tier} mb-1 block`}>{model.tier}</span>
                                <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{model.cost}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-16 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Everything You Need</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Built for AI-native startups spending $5K–$100K/month on LLMs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map(({ icon: Icon, title, description, color }) => (
                        <div key={title} className="glass-card p-5">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                                <Icon size={16} style={{ color }} />
                            </div>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section className="px-6 py-16 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Simple Pricing</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>We price on value delivered. Not per token.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { name: 'Starter', price: '$299', features: ['500K requests/month', 'Basic routing', '5 providers', 'Analytics dashboard'] },
                        { name: 'Growth', price: '$999', popular: true, features: ['Unlimited requests', 'Advanced routing', 'Budget guardrails', 'Priority support', 'Custom rules'] },
                        { name: 'Enterprise', price: 'Custom', features: ['Dedicated cluster', 'SLA routing', 'On-prem option', 'SOC2', 'Dedicated AM'] },
                    ].map(plan => (
                        <div key={plan.name} className="glass-card p-6 relative"
                            style={plan.popular ? { border: '1px solid rgba(99,102,241,0.4)' } : {}}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ background: '#6366f1', color: 'white' }}>Popular</div>
                            )}
                            <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                            <div className="text-2xl font-bold mb-4 gradient-text">{plan.price}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>{plan.price !== 'Custom' ? '/mo' : ''}</span></div>
                            <ul className="space-y-2 mb-5">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <Check size={13} style={{ color: '#10b981' }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Go to Dashboard'}
                                </Link>
                            </SignedIn>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 text-center">
                <div className="max-w-2xl mx-auto glass-card p-12"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.05))' }}>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Ready to cut your LLM bill?
                    </h2>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                        Join AI-native startups saving 20–40% on LLM costs. Setup takes 60 seconds.
                    </p>
                    <SignedOut>
                        <SignUpButton mode="modal">
                            <button className="btn-primary text-base py-3 px-10">
                                Start Free — No Credit Card Required <ArrowRight size={16} />
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard" className="btn-primary text-base py-3 px-10">
                            Go to Dashboard <ArrowRight size={16} />
                        </Link>
                    </SignedIn>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-8 py-8 border-t text-center" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap size={14} style={{ color: '#6366f1' }} />
                    <span className="font-semibold text-sm gradient-text">AICortex</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    AI Cost Intelligence Platform · hello@aicortex.dev
                </p>
            </footer>
        </div>
    );
}
