'use client';
import {Inter} from 'next/font/google';
import StoreProvider from './store_provider';
import {SequenceViewerProvider} from './components/sequence_viewer';
import {MolstarProvider} from '@/components/mstar/mstar_service';

const inter = Inter({subsets: ['latin']});

export default function ClientLayout({children}: {children: React.ReactNode}) {
    return (
        <StoreProvider>
            <MolstarProvider>
                <SequenceViewerProvider>
                    <body className={inter.className}>{children}</body>
                </SequenceViewerProvider>
            </MolstarProvider>
        </StoreProvider>
    );
}