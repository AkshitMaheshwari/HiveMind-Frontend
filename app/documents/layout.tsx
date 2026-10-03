import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HiveMind | Documents',
  description: 'Manage uploaded files and their analysis and search availability.',
};

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return children;
}
