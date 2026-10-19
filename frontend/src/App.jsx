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
