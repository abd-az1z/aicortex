'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Zap, FileText, Search } from 'lucide-react';
import type { User } from '@/lib/db/schema';

const ENDPOINT = 'https://aicortex.vercel.app/api/v1/chat/completions';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

function CodeBlock({ code, label, icon: Icon }: { code: string; label: string; icon: React.ElementType }) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color: '#6366f1' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                </div>
                <CopyButton text={code} />
            </div>
            <pre className="p-4 text-xs overflow-x-auto" style={{ color: '#a5b4fc', lineHeight: '1.7' }}>
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function DocsClient({ user }: { user: User }) {
    const [keyCopied, setKeyCopied] = useState(false);

    const copyKey = () => {
        navigator.clipboard.writeText(user.apiKey);
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
    };

    const chatExample = `curl ${ENDPOINT} \\
  -H "Authorization: Bearer ${user.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      { "role": "user", "content": "What is the capital of France?" }
    ]
  }'`;

    const summarizeExample = `curl ${ENDPOINT} \\
  -H "Authorization: Bearer ${user.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      {
        "role": "system",
        "content": "You are a summarization assistant. Be concise."
      },
      {
        "role": "user",
        "content": "Summarize this: AICortex is an intelligent routing layer that reduces LLM costs by 20-40% by analyzing request complexity and routing to the cheapest model that can handle the task well."
      }
    ],
    "max_tokens": 100
  }'`;

    const extractExample = `curl ${ENDPOINT} \\
  -H "Authorization: Bearer ${user.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "auto",
    "messages": [
      {
        "role": "system",
        "content": "Extract the requested data as JSON. Return only valid JSON."
      },
      {
        "role": "user",
        "content": "Extract name, email, and company from: Hi, I am Sarah Chen, sarah@acme.com, CTO at Acme Corp."
      }
    ]
  }'`;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Quick Start</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    One URL swap. No SDK changes. You're live in 60 seconds.
                </p>
            </div>

            {/* Step 1 - The swap */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>1</div>
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Replace your endpoint</h2>
                </div>
                <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span style={{ color: '#ef4444' }}>-</span>
                        <span style={{ color: '#fca5a5' }}>https://api.openai.com/v1/chat/completions</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span style={{ color: '#10b981' }}>+</span>
                        <span style={{ color: '#6ee7b7' }}>{ENDPOINT}</span>
                    </div>
                </div>
            </div>

            {/* Step 2 - API Key */}
            <div className="glass-card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>2</div>
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Use your AICortex API key</h2>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 code-block text-xs flex items-center" style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                        {user.apiKey}
                    </div>
                    <button className="btn-secondary px-3" onClick={copyKey}>
                        {keyCopied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                    </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Pass as <code style={{ color: '#a5b4fc' }}>Authorization: Bearer {'<key>'}</code> — same header format as OpenAI.
                </p>
            </div>

            {/* Step 3 - Model */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>3</div>
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Set model to <code style={{ color: '#a5b4fc' }}>"auto"</code></h2>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Use <code style={{ color: '#a5b4fc' }}>"model": "auto"</code> and AICortex picks the optimal model for each request.
                    Or pass a specific model name (<code style={{ color: '#a5b4fc' }}>gpt-4o</code>, <code style={{ color: '#a5b4fc' }}>claude-3-5-sonnet-20241022</code>, etc.) to route directly.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    {[
                        { tier: 'cheap', label: 'Simple tasks', models: 'Llama 8B, Gemini Flash', color: '#10b981' },
                        { tier: 'mid', label: 'Medium tasks', models: 'GPT-4o Mini, Llama 70B', color: '#f59e0b' },
                        { tier: 'premium', label: 'Complex tasks', models: 'GPT-4o, Claude 3.5', color: '#6366f1' },
                    ].map(t => (
                        <div key={t.tier} className="p-3 rounded-lg" style={{ background: `${t.color}10`, border: `1px solid ${t.color}25` }}>
                            <p className="font-semibold mb-0.5" style={{ color: t.color }}>{t.label}</p>
                            <p style={{ color: 'var(--text-muted)' }}>{t.models}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Examples */}
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Live Examples</h2>
            <div className="space-y-4">
                <CodeBlock code={chatExample} label="Simple Chat" icon={Terminal} />
                <CodeBlock code={summarizeExample} label="Summarization" icon={FileText} />
                <CodeBlock code={extractExample} label="Data Extraction" icon={Search} />
            </div>

            {/* Footer note */}
            <div className="mt-8 p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--brand-light)' }}>Response format</strong> is identical to OpenAI's.
                    Every response includes an <code style={{ color: '#a5b4fc' }}>aicortex</code> field with cost, savings, and routing metadata.
                    Your existing code needs zero changes beyond the URL and key.
                </p>
            </div>
        </div>
    );
}
