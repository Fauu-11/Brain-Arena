import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error, details) { console.error('Brain Arena:', error, details); }
  render() {
    if (this.state.error) return <section className="empty-state" role="alert"><h2>{this.props.lang === 'en' ? 'Something needs a restart.' : 'Halaman perlu dimuat ulang.'}</h2><p>{this.props.lang === 'en' ? 'Your saved favorites and records are still on this device.' : 'Favorit dan rekor yang tersimpan tetap berada di perangkat ini.'}</p><button className="ba-button primary" onClick={() => window.location.reload()}>{this.props.lang === 'en' ? 'Reload page' : 'Muat ulang'}</button></section>;
    return this.props.children;
  }
}
