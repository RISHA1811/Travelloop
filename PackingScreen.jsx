import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const TEMPLATES = {
  '🏖️ Beach': ['Sunscreen', 'Swimsuit', 'Flip flops', 'Beach towel', 'Sunglasses', 'Hat', 'Snorkel'],
  '💼 Business': ['Laptop', 'Charger', 'Business cards', 'Formal shoes', 'Suit/Blazer', 'Notebook'],
  '❄️ Winter': ['Warm jacket', 'Gloves', 'Scarf', 'Thermal socks', 'Snow boots', 'Beanie'],
  '🎒 Essentials': ['Passport', 'Phone charger', 'Wallet', 'Medications', 'Earphones', 'Power bank'],
  '🏕️ Camping': ['Tent', 'Sleeping bag', 'Flashlight', 'Bug spray', 'First aid kit', 'Water bottle'],
};

const PACK_CATEGORIES = ['Clothing', 'Electronics', 'Documents', 'Toiletries', 'Medicines', 'Other'];

export default function PackingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [packing, setPacking] = useState([]);
  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Other');
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      setPacking(data.packing || []);
    }).catch(() => navigate('/my-trips'));
  }, [id]);

  const savePacking = async (updated) => {
    const { data } = await api.put(`/trips/${id}`, { ...trip, packing: updated });
    setTrip(data);
    setPacking(data.packing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const add = (val, cat) => {
    const name = (val || item).trim();
    const packCat = cat || category;
    if (!name) return;
    if (packing.find((p) => p.item.toLowerCase() === name.toLowerCase())) return;
    savePacking([...packing, { item: name, packed: false, category: packCat }]);
    setItem('');
  };

  const applyTemplate = (items) => {
    const existing = packing.map((p) => p.item.toLowerCase());
    const newItems = items.filter((i) => !existing.includes(i.toLowerCase())).map((i) => ({ item: i, packed: false, category: 'Other' }));
    savePacking([...packing, ...newItems]);
    setShowTemplates(false);
  };

  const toggle = (idx) => savePacking(packing.map((p, i) => i === idx ? { ...p, packed: !p.packed } : p));
  const remove = (idx) => savePacking(packing.filter((_, i) => i !== idx));
  const clearPacked = () => savePacking(packing.filter((p) => !p.packed));
  const checkAll = () => savePacking(packing.map((p) => ({ ...p, packed: true })));
  const uncheckAll = () => savePacking(packing.map((p) => ({ ...p, packed: false })));

  const packed = packing.filter((p) => p.packed).length;
  const percent = packing.length > 0 ? Math.round((packed / packing.length) * 100) : 0;

  const filtered = packing.filter((p) => {
    const catMatch = filterCat === 'All' || p.category === filterCat;
    const statusMatch = filterStatus === 'all' || (filterStatus === 'packed' ? p.packed : !p.packed);
    return catMatch && statusMatch;
  });

  const byCategory = PACK_CATEGORIES.map((cat) => ({
    cat,
    total: packing.filter((p) => p.category === cat).length,
    packed: packing.filter((p) => p.category === cat && p.packed).length,
  })).filter((c) => c.total > 0);

  if (!trip) return <Layout><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <PageHeader
          title="🧳 Packing Checklist"
          subtitle={trip.name}
          backTo={`/trip/${id}`}
          actions={saved && <span className="text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg">✓ Saved</span>}
        />

        {/* Progress hero */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-5 mb-6 shadow">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-3xl font-bold">{percent}%</p>
              <p className="text-indigo-200 text-sm">{packed} of {packing.length} items packed</p>
            </div>
            <span className="text-5xl">{percent === 100 ? '🎉' : percent > 50 ? '🧳' : '📋'}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add item */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex gap-2 flex-wrap mb-3">
                <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add item to pack"
                  className="input flex-1" onKeyDown={(e) => e.key === 'Enter' && add()} />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                  {PACK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => add()} className="btn-primary">Add</button>
                <button onClick={() => setShowTemplates(!showTemplates)}
                  className="border border-indigo-300 text-indigo-600 text-sm px-3 py-2 rounded-xl hover:bg-indigo-50">
                  📋 Templates
                </button>
              </div>

              {showTemplates && (
                <div className="bg-indigo-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-indigo-700">Quick-add templates:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TEMPLATES).map(([name, items]) => (
                      <button key={name} onClick={() => applyTemplate(items)}
                        className="bg-white border border-indigo-200 text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-100 text-indigo-700">
                        {name} <span className="text-gray-400 text-xs">({items.length})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters + bulk actions */}
            {packing.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
                  {['all', 'unpacked', 'packed'].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`text-xs px-3 py-1 rounded-lg capitalize transition ${filterStatus === s ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input text-xs py-1.5">
                  <option value="All">All Categories</option>
                  {PACK_CATEGORIES.filter((c) => packing.some((p) => p.category === c)).map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-1 ml-auto">
                  <button onClick={checkAll} className="text-xs text-green-600 hover:underline">Check All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={uncheckAll} className="text-xs text-gray-400 hover:underline">Uncheck All</button>
                  {packed > 0 && <>
                    <span className="text-gray-300">|</span>
                    <button onClick={clearPacked} className="text-xs text-red-400 hover:underline">Clear Packed</button>
                  </>}
                </div>
              </div>
            )}

            {/* Items list */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-400">
                <p className="text-3xl mb-2">🧳</p>
                <p>{packing.length === 0 ? 'No items yet. Add items or use a template!' : 'No items match your filter.'}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <ul className="divide-y">
                  {filtered.map((p, idx) => {
                    const realIdx = packing.indexOf(p);
                    return (
                      <li key={realIdx} className={`flex items-center gap-3 px-4 py-3 transition ${p.packed ? 'bg-gray-50' : 'hover:bg-indigo-50/30'}`}>
                        <input type="checkbox" checked={p.packed} onChange={() => toggle(realIdx)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0" />
                        <span className={`flex-1 text-sm ${p.packed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{p.item}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p.category}</span>
                        <button onClick={() => remove(realIdx)} className="text-red-400 text-xs hover:text-red-600 flex-shrink-0">✕</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Category breakdown */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-semibold text-gray-700 mb-4">📊 By Category</h3>
              {byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No items yet</p>
              ) : (
                <div className="space-y-3">
                  {byCategory.map(({ cat, total, packed: catPacked }) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{cat}</span>
                        <span className="text-xs text-gray-400">{catPacked}/{total}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${total > 0 ? (catPacked / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl shadow p-5 space-y-3">
              <h3 className="font-semibold text-gray-700 mb-2">📈 Stats</h3>
              {[
                { label: 'Total Items', value: packing.length },
                { label: 'Packed', value: packed },
                { label: 'Remaining', value: packing.length - packed },
                { label: 'Progress', value: `${percent}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
