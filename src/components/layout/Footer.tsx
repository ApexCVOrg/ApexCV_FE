'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/constants';

const Footer = () => {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`footer ${theme}`}>
            <div className="footer-container">
                <div className="footer-section">
                    <h3>ApexCV</h3>
                    <p>Create your professional CV with ease</p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link href={ROUTES.HOME}>Home</Link>
                    <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
                    <Link href={ROUTES.PROFILE}>Profile</Link>
                </div>

                <div className="footer-section">
                    <h4>Legal</h4>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <p>Email: support@apexcv.com</p>
                    <p>Phone: +1 234 567 890</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} ApexCV. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer; 