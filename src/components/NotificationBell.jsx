import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { FaBell } from 'react-icons/fa';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/user/notifications');
            setNotifications(res.data || []);
        } catch (e) { /* silently fail on 404 */ }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const markRead = async (id) => {
        try {
            await api.post('/user/notifications/mark-read', { id });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (e) { }
    };

    const markAllRead = async () => {
        try {
            await api.post('/user/notifications/mark-read', { all: true });
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch (e) { }
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'relative', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                    padding: '7px 10px', cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}
            >
                <FaBell size={14} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -5, right: -5,
                        background: 'var(--danger)', color: '#fff', fontSize: '10px',
                        borderRadius: '50%', width: 17, height: 17,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: 320, maxHeight: 400, overflowY: 'auto',
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                    zIndex: 999,
                }}>
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead}
                                style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} onClick={() => markRead(n.id)} style={{
                                padding: '12px 16px',
                                background: n.read_at ? 'transparent' : 'var(--accent-soft)',
                                borderBottom: '1px solid var(--border-subtle)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: n.read_at ? 400 : 600 }}>
                                    {n.data?.title || 'Notification'}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
                                    {n.data?.message || ''}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
                                    {new Date(n.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
