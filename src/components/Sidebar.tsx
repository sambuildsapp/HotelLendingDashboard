'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    {
        href: '/', label: 'Dashboard', icon: (
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 13h6M9 17h4" />
            </svg>
        )
    },
    {
        href: '/loans', label: 'Loans', icon: (
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        )
    },
    {
        href: '/hotels', label: 'Hotels', icon: (
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15" />
                <path d="M9 9h1M9 13h1M9 17h1" />
            </svg>
        )
    },
    {
        href: '/market', label: 'Market Data', icon: (
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
        )
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">HL</div>
                <span className="sidebar-logo-text">Hotel Lending</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    v1.0.0 • Phase 4 Complete
                </div>
            </div>
        </aside>
    );
}
