'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/lib/constants/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { usePathname, useParams } from 'next/navigation';

const Header = () => {
  const { theme } = useTheme();
  const pathname = usePathname(); // ví dụ: /en, /vi/some-page
  const params = useParams(); // { locale: 'en' hoặc 'vi' }

  // Lấy locale hiện tại, mặc định là 'vi'
  const currentLocale = params?.locale || 'vi';

  // Hàm chuyển đổi locale trong URL
  const switchLocale = (locale: string) => {
    if (!pathname) return `/${locale}`;

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${locale}`;

    // Nếu segment đầu tiên là locale, thay nó
    if (segments[0] === 'vi' || segments[0] === 'en') {
      segments[0] = locale;
    } else {
      // Nếu URL không có locale, thêm locale vào đầu
      segments.unshift(locale);
    }

    return '/' + segments.join('/');
  };

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

        {/* Link đổi ngôn ngữ */}
        <nav className="locale-switcher" style={{ marginLeft: '20px' }}>
          <Link
            href={switchLocale('vi')}
            style={{ fontWeight: currentLocale === 'vi' ? 'bold' : 'normal', marginRight: 10 }}
          >
            Tiếng Việt
          </Link>
          <Link
            href={switchLocale('en')}
            style={{ fontWeight: currentLocale === 'en' ? 'bold' : 'normal' }}
          >
            English
          </Link>
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
