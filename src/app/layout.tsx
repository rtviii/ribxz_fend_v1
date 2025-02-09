import './globals.css';
import ClientLayout from './client-layout';

export const metadata = {
    title: 'riboxyz',
    description: 'An interface to the atomic structure of the ribosome',
    icons: {
        icon : '/favicon.ico',
        apple: '/logo.ico'
    }
}

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <ClientLayout>{children}</ClientLayout>
        </html>
    );
}
