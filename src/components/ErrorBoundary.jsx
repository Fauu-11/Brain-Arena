import React from 'react';
import { recordRuntimeIssue } from '../utils/runtimeHealth.js';

export default class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error, details) {
    console.error('Brain Arena:', error, details);
    recordRuntimeIssue('react-boundary', error, { componentStack:details?.componentStack || '' });
  }
  render() {
    if (this.state.error) return <section className="empty-state stability-error-state" role="alert">
      <span className="eyebrow">STABILITY RECOVERY</span>
      <h2>{this.props.lang === 'en' ? 'This page hit a problem.' : 'Halaman ini mengalami masalah.'}</h2>
      <p>{this.props.lang === 'en' ? 'Your saved progress is still on this device. You can return home, or reload the app if the issue persists.' : 'Progress yang tersimpan tetap berada di perangkat ini. Anda bisa kembali ke beranda, atau memuat ulang aplikasi jika masalah tetap terjadi.'}</p>
      <div className="stability-error-actions">
        <button className="ba-button outline" onClick={() => { window.location.hash = '#/'; this.setState({ error:false }); }}>{this.props.lang === 'en' ? 'Back to home' : 'Kembali ke beranda'}</button>
        <button className="ba-button primary" onClick={() => window.location.reload()}>{this.props.lang === 'en' ? 'Reload app' : 'Muat ulang aplikasi'}</button>
      </div>
    </section>;
    return this.props.children;
  }
}
