import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error, details) {
    console.error('Brain Arena:', error, details);
    try {
      localStorage.setItem('ba_last_crash_v1',JSON.stringify({time:Date.now(),message:String(error?.message||error),stack:String(error?.stack||'').slice(0,4000),componentStack:String(details?.componentStack||'').slice(0,4000),route:location.hash||'#/',version:'1.17.0'}));
    } catch {}
  }
  render() {
    if (this.state.error) return <section className="empty-state" role="alert"><h2>{this.props.lang === 'en' ? 'Something needs a restart.' : 'Halaman perlu dimuat ulang.'}</h2><p>{this.props.lang === 'en' ? 'Your saved progress remains on this device. System Diagnostics can show the latest crash report.' : 'Progress yang tersimpan tetap berada di perangkat ini. System Diagnostics dapat menampilkan laporan crash terakhir.'}</p><button className="ba-button primary" onClick={() => window.location.reload()}>{this.props.lang === 'en' ? 'Reload page' : 'Muat ulang'}</button></section>;
    return this.props.children;
  }
}
