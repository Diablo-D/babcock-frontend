import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaCode } from 'react-icons/fa';

function ThemeToggle() {
    const { theme, setTheme, isAdmin } = useTheme();

    if (isAdmin) {
        // 3-way toggle: Dark | Light | Dev
        const options = [
            { key: 'dark', icon: <FaMoon size={11} />, label: 'Dark' },
            { key: 'light', icon: <FaSun size={11} />, label: 'Light' },
            { key: 'dev', icon: <FaCode size={11} />, label: 'Dev' },
        ];

        const activeIndex = options.findIndex(o => o.key === theme);

        return (
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-default)',
                    padding: '3px',
                    gap: '2px',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {options.map((opt, i) => (
                    <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        title={opt.label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 'var(--text-xs)',
                            fontWeight: theme === opt.key ? '600' : '400',
                            fontFamily: opt.key === 'dev' ? 'var(--font-mono)' : 'var(--font-sans)',
                            background: theme === opt.key
                                ? (opt.key === 'dev' ? 'rgba(34,197,94,0.15)' : 'var(--accent-soft)')
                                : 'transparent',
                            color: theme === opt.key
                                ? (opt.key === 'dev' ? 'var(--green-400)' : 'var(--accent)')
                                : 'var(--text-muted)',
                            transition: 'all 200ms ease',
                        }}
                    >
                        {opt.icon}
                        <span className="hide-mobile">{opt.label}</span>
                    </button>
                ))}
            </div>
        );
    }

    // 2-way toggle: Light ↔ Dark
    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                fontSize: '14px',
            }}
        >
            {isDark ? <FaSun /> : <FaMoon />}
        </button>
    );
}

export default ThemeToggle;
