'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Header = () => {
    const { theme } = useTheme();

    return (
        <header className={`header ${theme}`}>
            <div className="header-container">
                <Link href={ROUTES.HOME} className="logo">
                    ApexCV
                </Link>

                <nav className="nav-menu">
                    <Link href={ROUTES.HOME}>Home</Link>
                    <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
                    <Link href={ROUTES.PROFILE}>Profile</Link>
                </nav>

                <div className="header-actions">
                    <ThemeToggle />
                    <Link href={ROUTES.LOGIN} className="btn btn-primary">
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header; 