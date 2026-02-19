import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
    title: 'AICortex — AI Cost Intelligence Platform',
    description: 'Reduce your LLM spend by 20–40% with intelligent model routing. Drop-in replacement for OpenAI API.',
    keywords: ['AI cost optimization', 'LLM routing', 'AI FinOps', 'OpenAI alternative', 'model orchestration'],
    openGraph: {
        title: 'AICortex — AI Cost Intelligence Platform',
        description: 'Reduce your LLM spend by 20–40% with intelligent model routing.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
