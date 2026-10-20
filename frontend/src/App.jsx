import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Leaf, MapPin, Menu, Plus, Recycle, Search,
  ShieldCheck, Sparkles, Sprout, TrendingUp, Wallet, X,
} from 'lucide-react';
import { createListing, getListings } from './api.js';

const starterListings = [
  { _id: 'sample-1', title: 'Clean cardboard boxes', category: 'Paper', quantityKg: 12, location: 'Indirapuram, Ghaziabad', status: 'Available', estimatedValue: 96 },
  { _id: 'sample-2', title: 'PET plastic bottles', category: 'Plastic', quantityKg: 8, location: 'Vaishali, Ghaziabad', status: 'Available', estimatedValue: 120 },
  { _id: 'sample-3', title: 'Old metal utensils', category: 'Metal', quantityKg: 4, location: 'Sector 62, Noida', status: 'Pickup requested', estimatedValue: 240 },
];

const categories = ['Paper', 'Plastic', 'Metal', 'E-waste', 'Glass', 'Other'];
const categoryTone = { Paper: 'amber', Plastic: 'blue', Metal: 'slate', 'E-waste': 'violet', Glass: 'cyan', Other: 'green' };

function money(value = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [listings, setListings] = useState(starterListings);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [form, setForm] = useState({ title: '', category: 'Plastic', quantityKg: '', location: '', description: '' });

  useEffect(() => {
    let active = true;
    getListings()
      .then((data) => {
        if (!active) return;
        setListings(Array.isArray(data.listings) ? data.listings : []);
        setApiConnected(true);
      })
      .catch(() => {
        if (active) setApiConnected(false);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredListings = useMemo(() => listings.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All categories' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [listings, searchTerm, categoryFilter]);

  // Demo passport figures are placeholders until collector-confirmed pickups exist.
  const totalKg = 47;
  const totalValue = 1240;

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice('');
    const payload = { ...form, quantityKg: Number(form.quantityKg) };
    if (!payload.title.trim() || !payload.location.trim() || !Number.isFinite(payload.quantityKg) || payload.quantityKg <= 0) {
      setNotice('Add a title, location, and a quantity greater than 0 kg.');
      return;
    }
    try {
      setSubmitting(true);
      const data = await createListing(payload);
      setListings((current) => [data.listing, ...current]);
      setApiConnected(true);
      setForm({ title: '', category: 'Plastic', quantityKg: '', location: '', description: '' });
      setIsFormOpen(false);
      setNotice('Your waste listing was added successfully.');
    } catch (error) {
      setNotice(`Could not save listing: ${error.message}. Start the backend and connect MongoDB, then try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Waste2Value home">
          <span className="brand-mark"><Recycle size={23} strokeWidth={2.5} /></span>
          <span>Waste<span className="brand-light">2Value</span><small>SMART WASTE EXCHANGE</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#home"><span className="nav-icon"><TrendingUp size={18} /></span>Overview</a>
          <a className="nav-link" href="#listings"><span className="nav-icon"><Recycle size={18} /></span>Waste listings<span className="nav-count">{listings.length}</span></a>
          <a className="nav-link" href="#how-it-works"><span className="nav-icon"><MapPin size={18} /></span>Find collectors</a>
          <a className="nav-link" href="#passport"><span className="nav-icon"><ShieldCheck size={18} /></span>Waste Passport</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <strong>Need a hand?</strong>
            <p>Learn how to list waste and arrange a pickup.</p>
            <a href="#how-it-works">View quick guide <ArrowRight size={14} /></a>
          </div>
          <div className="profile-mini">
            <div className="avatar">NK</div>
            <div className="profile-copy"><strong>Nitesh Kumar</strong><span>Community member</span></div>
            <ChevronDown size={16} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions"><span className={`connection ${apiConnected ? 'connected' : ''}`}><span />{apiConnected ? 'API connected' : 'Demo preview'}</span><button className="avatar top-avatar" aria-label="Open profile">NK</button></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={13} /> YOUR CIRCULAR ECONOMY DASHBOARD</div><h1>Good things start with <span>less waste.</span></h1><p className="subheading">Track your impact, give recyclables a second life, and turn unused material into value.</p></div>
            <button className="button button-primary" onClick={() => setIsFormOpen(true)}><Plus size={18} /> List your waste</button>
          </section>

          {notice && <div className={`notice ${notice.includes('successfully') ? 'success' : ''}`} role="status"><span>{notice.includes('successfully') ? <CheckCircle2 size={17} /> : <CircleHelp size={17} />}</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15} /></button></div>}

          <section className="hero-card">
            <div className="hero-copy"><div className="hero-tag"><Leaf size={13} /> SMALL ACTIONS. REAL IMPACT.</div><h2>Your waste is<br />someone's resource.</h2><p>Connect with local recyclers, schedule a pickup, and keep useful materials in circulation.</p><button className="button button-white" onClick={() => setIsFormOpen(true)}>Start with a listing <ArrowRight size={16} /></button><div className="hero-footnote"><ShieldCheck size={14} /> Built around verified pickups and transparent value</div></div>
            <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-circle"><Recycle size={88} strokeWidth={1.5} /></div><div className="floating-chip chip-leaf"><Sprout size={17} /><span><b>Reuse more</b><small>Waste → resource</small></span></div><div className="floating-chip chip-value"><Wallet size={18} /><span><b>Earn value</b><small>Fairer recovery</small></span></div><div className="tiny-dot dot-one" /><div className="tiny-dot dot-two" /><div className="tiny-dot dot-three" /></div>
          </section>

          <section className="stats-grid" aria-label="Impact summary">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-green"><Recycle size={19} /></span><span className="stat-trend"><ArrowUpRight size={14} /> +12.8%</span></div><div className="stat-label">Material recycled</div><div className="stat-value">{totalKg}<span>kg</span></div><div className="stat-bottom"><span className="mini-progress"><i style={{ width: '68%' }} /></span><span>of your 100 kg goal</span></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-gold"><Wallet size={19} /></span><span className="stat-period">LIFETIME</span></div><div className="stat-label">Estimated value</div><div className="stat-value">{money(totalValue)}</div><div className="stat-bottom"><span className="subtle-dot" />Indicative value, subject to weight check</div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-blue"><MapPin size={19} /></span><span className="stat-period">LOCAL</span></div><div className="stat-label">Active listings</div><div className="stat-value">{listings.length.toString().padStart(2, '0')}<span> listings</span></div><div className="stat-bottom"><span className="subtle-dot blue-dot" />Ready for collector matching</div></article>
            <article className="stat-card score-card"><div className="stat-top"><span className="stat-icon icon-purple"><Sparkles size={19} /></span><span className="stat-period">WASTE PASSPORT</span></div><div className="stat-label">Green Score</div><div className="stat-value">82<span>/100</span></div><div className="score-bottom"><div className="score-ring"><span>82</span></div><div><strong>Nice momentum!</strong><p>Keep recycling to grow your score.</p></div></div></article>
          </section>

          <section className="content-grid">
            <div className="panel listings-panel" id="listings"><div className="panel-heading"><div><div className="section-kicker">YOUR MATERIALS</div><h3>Recent waste listings</h3></div><button className="text-button" onClick={() => setIsFormOpen(true)}>Add new <Plus size={15} /></button></div>
              <div className="listing-controls"><label className="search-box"><Search size={16} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search listings..." /></label><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category"><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
              <div className="table-wrap"><table><thead><tr><th>ITEM</th><th>QUANTITY</th><th>EST. VALUE</th><th>STATUS</th></tr></thead><tbody>
                {filteredListings.map((item) => <tr key={item._id}><td><div className="item-cell"><span className={`material-icon tone-${categoryTone[item.category] || 'green'}`}><Recycle size={17} /></span><span><strong>{item.title}</strong><small><span className={`category-dot tone-dot-${categoryTone[item.category] || 'green'}`} />{item.category} <span className="cell-divider">·</span> {item.location}</small></span></div></td><td className="quantity-cell">{item.quantityKg} kg</td><td className="value-cell">{money(item.estimatedValue)}</td><td><span className={`status-pill ${(item.status || 'Available').toLowerCase().includes('pickup') ? 'status-pending' : 'status-available'}`}><span />{item.status || 'Available'}</span></td></tr>)}
                {!filteredListings.length && <tr><td colSpan="4" className="empty-row">{loading ? 'Loading your listings…' : 'No listings match your search yet.'}</td></tr>}
              </tbody></table></div>
              <div className="table-footer"><span>Showing {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'}</span><span className="live-label"><span />{apiConnected ? 'Live data' : 'Sample data'}</span></div>
            </div>

            <div className="right-column">
              <section className="panel passport-panel" id="passport"><div className="panel-heading"><div><div className="section-kicker">YOUR IMPACT ID</div><h3>Waste Passport</h3></div><span className="passport-badge"><ShieldCheck size={15} /> VERIFIED PROFILE</span></div><div className="passport-body"><div className="passport-user"><div className="passport-avatar"><Recycle size={25} /></div><div><strong>Nitesh's Passport</strong><span>Member since 2026</span></div><span className="level-pill">LEVEL 2</span></div><div className="passport-metrics"><div><span className="metric-icon"><Recycle size={16} /></span><b>{totalKg} kg</b><small>Recycled</small></div><div><span className="metric-icon gold-metric"><Wallet size={16} /></span><b>{money(totalValue)}</b><small>Value recovered*</small></div></div><div className="impact-note"><div className="impact-leaf"><Leaf size={17} /></div><div><strong>Every kilogram counts</strong><p>Impact estimates will be calculated from verified pickup records as your activity grows.</p></div></div><button className="passport-link" onClick={() => setNotice('The full Waste Passport and shareable impact certificate can be built as the next project milestone.')}>View full passport <ArrowRight size={15} /></button><p className="fine-print">*Illustrative starter data. Collector-confirmed weights and prices should replace estimates.</p></div></section>
              <section className="tip-card"><div className="tip-icon"><Sprout size={19} /></div><div><div className="tip-title">A smarter sorting tip</div><p>Keep paper dry and separate it from food waste. Clean, sorted material is easier for collectors to process.</p><a href="#how-it-works">How it works <ArrowRight size={14} /></a></div></section>
            </div>
          </section>

          <section className="how-section" id="how-it-works"><div><div className="section-kicker">SIMPLE BY DESIGN</div><h3>From waste to worth in 3 steps</h3></div><div className="steps-row"><div className="step"><span className="step-number">01</span><div className="step-icon"><Plus size={20} /></div><div><strong>List your material</strong><p>Add category, estimated weight, and pickup location.</p></div></div><ArrowRight className="step-arrow" size={19} /><div className="step"><span className="step-number">02</span><div className="step-icon"><MapPin size={20} /></div><div><strong>Connect with a collector</strong><p>Find a suitable local recycler or collection partner.</p></div></div><ArrowRight className="step-arrow" size={19} /><div className="step"><span className="step-number">03</span><div className="step-icon"><CheckCircle2 size={20} /></div><div><strong>Verify and earn</strong><p>Confirm weight, final price, and recycling impact.</p></div></div></div></section>
          <footer className="footer"><span>© 2026 Waste2Value · Give materials another life.</span><span><span className="footer-dot" /> A circular future starts locally</span></footer>
        </div>
      </main>

      {isFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsFormOpen(false); }}><section className="listing-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="section-kicker">NEW MATERIAL</div><h2 id="modal-title">List your waste</h2><p>Share a few details so a collector can assess the material.</p></div><button className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Close form"><X size={19} /></button></div><form onSubmit={handleSubmit} className="listing-form"><label>Listing title<input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Clean cardboard boxes" maxLength="100" required /></label><div className="form-row"><label>Material category<select name="category" value={form.category} onChange={updateForm}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Estimated quantity (kg)<input name="quantityKg" type="number" min="0.1" step="0.1" value={form.quantityKg} onChange={updateForm} placeholder="e.g. 5" required /></label></div><label>Pickup location<input name="location" value={form.location} onChange={updateForm} placeholder="Area, city or PIN code" maxLength="160" required /></label><label>Description <span className="optional-label">OPTIONAL</span><textarea name="description" value={form.description} onChange={updateForm} rows="3" maxLength="600" placeholder="Mention condition, sorting, or special handling needs." /></label><div className="estimate-note"><Sparkles size={16} /><span><strong>Value estimate</strong><small>The starter version will use indicative category-based rates; the collector must confirm actual weight and price.</small></span></div><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Create listing'} <ArrowRight size={16} /></button></div></form></section></div>}
    </div>
  );
}

export default App;
