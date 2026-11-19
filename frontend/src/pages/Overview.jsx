import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, CircleHelp, Leaf, MapPin, Plus, Recycle,
  Search, Settings2, ShieldCheck, Sparkles, Sprout, Wallet,
} from 'lucide-react';
import { errMsg, getListings } from '../api.js';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const categories = ['plastic', 'paper', 'cardboard', 'iron', 'aluminium', 'copper', 'ewaste', 'glass'];
const categoryTone = { paper: 'amber', cardboard: 'amber', plastic: 'blue', iron: 'slate', aluminium: 'slate', copper: 'amber', ewaste: 'violet', glass: 'cyan' };

function money(value = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function listingSummary(listing) {
  const items = listing.items || [];
  const category = items[0]?.category || 'other';
  const quantity = items.reduce((sum, item) => sum + Number(item.actualKg ?? item.estimatedKg ?? 0), 0);
  const title = items.map((item) => item.category).join(', ') || 'Waste listing';
  const statusLabels = { open: 'Open', accepted: 'Pickup accepted', completed: 'Completed', cancelled: 'Cancelled' };
  return {
    ...listing,
    title,
    category,
    quantityKg: quantity,
    location: listing.address || 'Pickup address not provided',
    displayValue: listing.status === 'completed' ? listing.finalValue : listing.estimatedValue,
    statusLabel: statusLabels[listing.status] || listing.status || 'Unknown',
  };
}

export default function Overview() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');

  useEffect(() => {
    let active = true;
    Promise.all([getListings(), api.get('/passport/me')])
      .then(([listingData, passportResponse]) => {
        if (!active) return;
        setListings(Array.isArray(listingData.listings) ? listingData.listings : []);
        setPassport(passportResponse.data.passport || null);
      })
      .catch((requestError) => { if (active) setError(errMsg(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredListings = useMemo(() => listings.map(listingSummary).filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || `${item.title} ${item.category} ${item.location} ${item.description || ''}`.toLowerCase().includes(term);
    return matchesSearch && (categoryFilter === 'All categories' || item.category === categoryFilter);
  }), [listings, searchTerm, categoryFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim()) || categoryFilter !== 'All categories';
  const activeCount = listings.filter((item) => ['open', 'accepted'].includes(item.status)).length;
  const totalKg = passport?.totalKg || 0;
  const totalEarned = passport?.totalEarned || 0;
  const memberSince = passport?.memberSince
    ? new Date(passport.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

  function clearFilters() {
    setSearchTerm('');
    setCategoryFilter('All categories');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/overview" aria-label="Waste2Value overview">
          <span className="brand-mark"><Recycle size={23} strokeWidth={2.5} /></span>
          <span>Waste<span className="brand-light">2Value</span><small>SMART WASTE EXCHANGE</small></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#home"><span className="nav-icon"><Sparkles size={18} /></span>Overview</a>
          <a className="nav-link" href="#listings"><span className="nav-icon"><Recycle size={18} /></span>My listings<span className="nav-count">{listings.length}</span></a>
          <Link className="nav-link" to="/new-listing"><span className="nav-icon"><MapPin size={18} /></span>Find collectors</Link>
          <Link className="nav-link" to="/passport"><span className="nav-icon"><ShieldCheck size={18} /></span>Waste Passport</Link>
          <Link className="nav-link" to="/settings"><span className="nav-icon"><Settings2 size={18} /></span>Profile settings</Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <strong>Need a hand?</strong>
            <p>List material and check for verified collectors near your pickup location.</p>
            <Link to="/new-listing">Create a listing <ArrowRight size={14} /></Link>
          </div>
          <div className="profile-mini">
            <div className="avatar">{(user?.name || 'U').slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><strong>{user?.name || 'Account'}</strong><span>{user?.role || 'Member'}</span></div>
            <button className="profile-logout" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><span className={`connection ${!error && !loading ? 'connected' : ''}`}><span />{error ? 'API unavailable' : loading ? 'Loading data' : 'Live data'}</span><div className="avatar top-avatar" aria-label={user?.name}>{(user?.name || 'U').slice(0, 1).toUpperCase()}</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={13} /> YOUR CIRCULAR ECONOMY DASHBOARD</div><h1>Good things start with <span>less waste.</span></h1><p className="subheading">Track your verified impact, give recyclables a second life, and connect with local collectors.</p></div>
            <Link className="button button-primary" to="/new-listing"><Plus size={18} /> List your waste</Link>
          </section>

          {error && <div className="notice" role="alert"><CircleHelp size={17} />{error}</div>}

          <section className="hero-card">
            <div className="hero-copy"><div className="hero-tag"><Leaf size={13} /> SMALL ACTIONS. REAL IMPACT.</div><h2>Your waste is<br />someone's resource.</h2><p>Connect with local recyclers, schedule a pickup, and keep useful materials in circulation.</p><Link className="button button-white" to="/new-listing">Start with a listing <ArrowRight size={16} /></Link><div className="hero-footnote"><ShieldCheck size={14} /> Impact shown here comes from completed pickup records</div></div>
            <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-circle"><Recycle size={88} strokeWidth={1.5} /></div><div className="floating-chip chip-leaf"><Sprout size={17} /><span><b>Reuse more</b><small>Waste → resource</small></span></div><div className="floating-chip chip-value"><Wallet size={18} /><span><b>Earn value</b><small>Verified pickups</small></span></div><div className="tiny-dot dot-one" /><div className="tiny-dot dot-two" /><div className="tiny-dot dot-three" /></div>
          </section>

          <section className="stats-grid" aria-label="Impact summary">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-green"><Recycle size={19} /></span><span className="stat-period">COMPLETED</span></div><div className="stat-label">Material recycled</div><div className="stat-value">{loading ? '—' : totalKg}<span>kg</span></div><div className="stat-bottom">Verified from completed pickups</div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-gold"><Wallet size={19} /></span><span className="stat-period">LIFETIME</span></div><div className="stat-label">Value recovered</div><div className="stat-value">{loading ? '—' : money(totalEarned)}</div><div className="stat-bottom">Based on completed pickups</div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-blue"><MapPin size={19} /></span><span className="stat-period">ACTIVE</span></div><div className="stat-label">Open or accepted</div><div className="stat-value">{loading ? '—' : activeCount}<span> listings</span></div><div className="stat-bottom">Your current pickup requests</div></article>
            <article className="stat-card score-card"><div className="stat-top"><span className="stat-icon icon-purple"><Sparkles size={19} /></span><span className="stat-period">WASTE PASSPORT</span></div><div className="stat-label">Green Score</div><div className="stat-value">{loading ? '—' : passport?.greenScore ?? 0}<span>/100</span></div><div className="score-bottom"><div className="score-ring"><span>{loading ? '—' : passport?.greenScore ?? 0}</span></div><div><strong>{passport?.level || 'Getting started'}</strong><p>Calculated from completed pickups.</p></div></div></article>
          </section>

          <section className="content-grid">
            <div className="panel listings-panel" id="listings"><div className="panel-heading"><div><div className="section-kicker">YOUR MATERIALS</div><h3>Recent waste listings</h3></div><Link className="text-button" to="/new-listing">Add new <Plus size={15} /></Link></div>
              <div className="listing-controls" role="search" aria-label="Filter waste listings"><label className="search-box" htmlFor="listing-search"><Search size={16} aria-hidden="true" /><input id="listing-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search category, location..." /></label><label className="visually-hidden" htmlFor="listing-category-filter">Filter by category</label><select id="listing-category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><button type="button" className="text-button clear-filters" onClick={clearFilters} disabled={!hasActiveFilters}>Clear filters</button></div>
              <div className="table-wrap"><table><thead><tr><th>ITEMS</th><th>QUANTITY</th><th>VALUE</th><th>STATUS</th></tr></thead><tbody>
                {filteredListings.map((item) => <tr key={item._id}><td><div className="item-cell"><span className={`material-icon tone-${categoryTone[item.category] || 'green'}`}><Recycle size={17} /></span><span><strong>{item.title}</strong><small><span className={`category-dot tone-dot-${categoryTone[item.category] || 'green'}`} />{item.category} <span className="cell-divider">·</span> {item.location}</small></span></div></td><td className="quantity-cell">{item.quantityKg} kg</td><td className="value-cell">{money(item.displayValue)}</td><td><span className={`status-pill ${item.status === 'completed' ? 'status-available' : item.status === 'cancelled' ? 'status-cancelled' : 'status-pending'}`}><span />{item.statusLabel}</span></td></tr>)}
                {!filteredListings.length && <tr><td colSpan="4" className="empty-row" role={loading ? 'status' : 'note'}>{loading ? 'Loading your listings…' : error ? 'Listings could not be loaded.' : listings.length === 0 ? 'No waste listings yet. Create one to get started.' : hasActiveFilters ? 'No listings match your search or filters.' : 'No waste listings to show.'}</td></tr>}
              </tbody></table></div>
              <div className="table-footer"><span>Showing {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'}</span><span className="live-label"><span />{loading ? 'Loading' : error ? 'Unavailable' : 'Live data'}</span></div>
            </div>

            <div className="right-column">
              <section className="panel passport-panel" id="passport"><div className="panel-heading"><div><div className="section-kicker">YOUR IMPACT ID</div><h3>Waste Passport</h3></div><span className="passport-badge"><ShieldCheck size={15} /> {passport ? 'VERIFIED PROFILE' : 'PASSPORT'}</span></div><div className="passport-body"><div className="passport-user"><div className="passport-avatar"><Recycle size={25} /></div><div><strong>{passport?.name || user?.name || 'Your Passport'}</strong><span>Member since {memberSince}</span></div><span className="level-pill">{passport?.level || 'Seedling'}</span></div><div className="passport-metrics"><div><span className="metric-icon"><Recycle size={16} /></span><b>{loading ? '—' : totalKg} kg</b><small>Recycled</small></div><div><span className="metric-icon gold-metric"><Wallet size={16} /></span><b>{loading ? '—' : money(totalEarned)}</b><small>Value recovered</small></div></div><div className="impact-note"><div className="impact-leaf"><Leaf size={17} /></div><div><strong>Your verified impact</strong><p>Passport totals update after a collector confirms completed pickup weights.</p></div></div><Link className="passport-link" to="/passport">View full passport <ArrowRight size={15} /></Link></div></section>
              <section className="tip-card"><div className="tip-icon"><Sprout size={19} /></div><div><div className="tip-title">A smarter sorting tip</div><p>Keep paper dry and separate it from food waste. Clean, sorted material is easier for collectors to process.</p><Link to="/new-listing">Check local collectors <ArrowRight size={14} /></Link></div></section>
            </div>
          </section>

          <section className="how-section" id="how-it-works"><div><div className="section-kicker">SIMPLE BY DESIGN</div><h3>From waste to worth in 3 steps</h3></div><div className="steps-row"><div className="step"><span className="step-number">01</span><div className="step-icon"><Plus size={20} /></div><div><strong>List your material</strong><p>Add category, estimated weight, and pickup location.</p></div></div><ArrowRight className="step-arrow" size={19} /><div className="step"><span className="step-number">02</span><div className="step-icon"><MapPin size={20} /></div><div><strong>Connect with a collector</strong><p>Check for verified collectors near the pickup location.</p></div></div><ArrowRight className="step-arrow" size={19} /><div className="step"><span className="step-number">03</span><div className="step-icon"><CheckCircle2 size={20} /></div><div><strong>Verify and earn</strong><p>Collector-confirmed weight updates your impact record.</p></div></div></div></section>
          <footer className="footer"><span>© 2026 Waste2Value · Give materials another life.</span><span><span className="footer-dot" /> A circular future starts locally</span></footer>
        </div>
      </main>
    </div>
  );
}
