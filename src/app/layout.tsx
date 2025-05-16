import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/global.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ApexCV - Professional CV Builder',
  description: 'Create your professional CV with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
