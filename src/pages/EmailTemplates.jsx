import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import NotificationBell from '../components/NotificationBell';
import { FaSave, FaUndo, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

const VARIABLE_COLORS = {
    '{{name}}': '#3b5ceb', '{{department}}': '#10b981',
    '{{reason}}': '#ef4444', '{{matric}}': '#f59e0b',
};

function HighlightedBody({ html }) {
    // Highlight {{variable}} tokens in the preview
    const highlighted = html.replace(/\{\{(\w+)\}\}/g, (match) => {
        const color = VARIABLE_COLORS[match] || '#9333ea';
        return `<span style="background:${color}22;color:${color};padding:0 3px;border-radius:3px;font-weight:600;">${match}</span>`;
    });
    return <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

export default function EmailTemplates() {
    const [templates, setTemplates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState({ subject: '', body_html: '' });
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const navigate = useNavigate();

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/admin/email-templates');
            setTemplates(res.data);
            if (res.data.length > 0 && !selected) {
                setSelected(res.data[0]);
                setEditing({ subject: res.data[0].subject, body_html: res.data[0].body_html });
            }
        } catch (e) { toast.error('Failed to load templates'); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const selectTemplate = (t) => {
        setSelected(t);
        setEditing({ subject: t.subject, body_html: t.body_html });
        setPreview(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/admin/email-templates/${selected.id}`, editing);
            setTemplates(prev => prev.map(t => t.id === selected.id ? res.data.template : t));
            setSelected(res.data.template);
            toast.success('Template saved!');
        } catch (e) { toast.error('Save failed'); }
        finally { setSaving(false); }
    };

    const handleReset = async () => {
        if (!confirm('Reset this template to the system default?')) return;
        try {
            const res = await api.post(`/admin/email-templates/${selected.id}/reset`);
            const updated = res.data.find(t => t.name === selected.name) || res.data[0];
            setTemplates(res.data);
            selectTemplate(updated);
            toast.success('Template reset to default');
        } catch (e) { toast.error('Reset failed'); }
    };

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) { }
        localStorage.clear(); navigate('/');
    };

    const friendlyName = (name) => name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

    return (
        <div className="animated-mesh-bg" style={{ minHeight: '100vh' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaEnvelope /></div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Email Templates</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <ThemeToggle />
                    <NotificationBell />
                    <button onClick={() => navigate('/admin/dashboard')} className="btn-ghost-glass">← Dashboard</button>
                    <button onClick={handleLogout} className="btn-ghost-glass"><FaSignOutAlt size={12} /></button>
                </div>
            </nav>

            <div className="page-container page-enter">
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Email Templates</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Customise the emails sent to students and officers</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
                    {/* Template list sidebar */}
                    <div className="glass-card" style={{ padding: 'var(--space-3)' }}>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', paddingLeft: 6 }}>Templates</p>
                        {templates.map(t => (
                            <button key={t.id} onClick={() => selectTemplate(t)} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: 'var(--space-3) var(--space-3)', borderRadius: 'var(--radius-md)',
                                background: selected?.id === t.id ? 'var(--accent-soft)' : 'transparent',
                                border: selected?.id === t.id ? '1px solid var(--accent)' : '1px solid transparent',
                                color: selected?.id === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer', marginBottom: 4,
                                fontSize: 'var(--text-sm)', fontWeight: selected?.id === t.id ? 700 : 400,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <FaEnvelope size={11} /> {friendlyName(t.name)}
                            </button>
                        ))}
                    </div>

                    {/* Editor */}
                    {selected && (
                        <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{friendlyName(selected.name)}</h4>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button onClick={() => setPreview(!preview)} className="btn-ghost-glass" style={{ fontSize: 'var(--text-sm)' }}>
                                        {preview ? '✏️ Edit' : '👁 Preview'}
                                    </button>
                                    <button onClick={handleReset} className="btn-ghost-glass" style={{ fontSize: 'var(--text-sm)' }}>
                                        <FaUndo size={11} /> Reset
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="btn-primary-glass" style={{ fontSize: 'var(--text-sm)' }}>
                                        <FaSave size={11} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            {/* Variables hint */}
                            {selected.variables && (
                                <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Variables:</span>
                                    {selected.variables.map(v => (
                                        <span key={v} style={{
                                            fontSize: '11px', background: (VARIABLE_COLORS[v] || '#9333ea') + '22',
                                            color: VARIABLE_COLORS[v] || '#9333ea', padding: '1px 8px',
                                            borderRadius: 4, fontFamily: 'monospace', fontWeight: 600,
                                        }}>{v}</span>
                                    ))}
                                </div>
                            )}

                            {/* Subject */}
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>Subject Line</label>
                                {preview ? (
                                    <div style={{ padding: 10, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {editing.subject}
                                    </div>
                                ) : (
                                    <input className="glass-input" value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} />
                                )}
                            </div>

                            {/* Body */}
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                    Email Body <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, color: 'var(--text-muted)' }}>(HTML supported)</span>
                                </label>
                                {preview ? (
                                    <div style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                                        <HighlightedBody html={editing.body_html} />
                                    </div>
                                ) : (
                                    <textarea className="glass-input" rows={12} value={editing.body_html}
                                        onChange={e => setEditing({ ...editing, body_html: e.target.value })}
                                        style={{ fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
