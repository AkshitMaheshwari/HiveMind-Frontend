import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'HiveMind | Chat', description: 'Work with your specialist AI teams.' };
export default function ChatLayout({ children }: { children: ReactNode }) { return children; }
