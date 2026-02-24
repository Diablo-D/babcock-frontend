import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('bucs-theme') || 'light';
    });

    const userRole = localStorage.getItem('user_role');
    const isAdmin = userRole === 'super_admin';

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('bucs-theme', newTheme);
    };

    // Apply theme class to html element
    useEffect(() => {
        const html = document.documentElement;
        html.classList.remove('theme-light', 'theme-dark', 'theme-dev');
        html.classList.add(`theme-${theme}`);
    }, [theme]);

    // If non-admin tries to use dev theme, fall back to dark
    useEffect(() => {
        if (theme === 'dev' && !isAdmin) {
            setTheme('dark');
        }
    }, [theme, isAdmin]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isAdmin }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
