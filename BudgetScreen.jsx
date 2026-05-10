import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'];
const CAT_COLORS = { Food: 'bg-orange-400', Transport: 'bg-blue-400', Hotel: 'bg-purple-400', Activities: 'bg-green-400', Shopping: 'bg-pink-400', Other: 'bg-gray-400' };
const CAT_LIGHT = { Food: 'bg-orange-50 text-orange-700', Transport: 'bg-blue-50 text-blue-700', Hotel: 'bg-purple-50 text-purple-700', Activities: 'bg-green-50 text-green-700', Shopping: 'bg-pink-50 text-pink-700', Other: 'bg-gray-50 text-gray-600' };
const CAT_EMOJI = { Food: '🍔', Transport: '🚌', Hotel: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦' };

export default function BudgetScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [form, setForm] = useState({ item: '', cost: '', category: 'Other' });
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showLimitEdit, setShowLimitEdit] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      setBudget(data.budget || []);
      setBudgetLimit(data.budgetLimit || '');
    }).catch(() => navigate('/my-trips'));
  }, [id]);

  const saveBudget = async (updated, newLimit) => {
    const limitVal = newLimit !== undefined ? newLimit : budgetLimit;
    const { data } = await api.put(`/trips/${id}`, {
      ...trip,
      budget: updated,
      budgetLimit: limitVal ? parseFloat(limitVal) : null,
    });
    setTrip(data);
    setBudget(data.budget);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Check budget alerts
    const newTotal = updated.reduce((s, b) => s + b.cost, 0);
    const limit = limitVal ? parseFloat(limitVal) : null;
    if (limit) {
      const pct = (newTotal / limit) * 100;
      if (pct >= 100) {
        addNotification(`⚠️ Budget exceeded for "${data.name}"! Spent $${newTotal.toFixed(0)} of $${limit.toFixed(0)} limit.`, 'error');
      } else if (pct >= 80) {
        addNotification(`💸 80% of budget used for "${data.name}". $${(limit - newTotal).toFixed(0)} remaining.`, 'warning');
      }
    }
  };

  const add = () => {
    if (!form.item.trim() || !form.cost) return;
    const updated = [...budget, { item: form.item, cost: parseFloat(form.cost), category: form.category }];
    saveBudget(updated);
    setForm({ item: '', cost: '', category: 'Other' });
    addNotification(`Added "${form.item}" ($${parseFloat(form.cost).toFixed(2)}) to budget.`, 'success');
  };

  const remove = (idx) => {
    saveBudget(budget.filter((_, i) => i !== idx));
  };

  const saveEdit = (idx) => {
    saveBudget(budget.map((b, i) => i === idx ? { ...b, ...editForm, cost: parseFloat(editForm.cost) } : b));
    setEditIdx(null);
  };

  const saveLimitHandler = () => {
    saveBudget(budget, budgetLimit);
    setShowLimitEdit(false);
    if (budgetLimit) {
      addNotification(`Budget limit set to $${parseFloat(budgetLimit).toFixed(0)} for "${trip.name}".`, 'info');
    }
  };

  const total = budget.reduce((s, b) => s + b.cost, 0);
  const limit = trip?.budgetLimit ? parseFloat(trip.budgetLimit) : null;
  const limitPct = limit ? Math.min((total / limit) * 100, 100) : null;
  const remaining = limit ? limit - total : null;
  const isOverBudget = limit && total > limit;

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    items: budget.filter((b) => b.category === cat),
    total: budget.filter((b) => b.category === cat).reduce((s, b) => s + b.cost, 0),
  })).filter((c) => c.total > 0);

  const itineraryCost = trip?.itinerary?.reduce((s, c) => s + (c.activities?.reduce((a, act) => a + (act.cost || 0), 0) || 0), 0) || 0;
  const filtered = activeCategory === 'All' ? budget : budget.filter((b) => b.category === activeCategory);

  if (!trip) return <Layout><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <PageHeader
          title="💰 Budget & Cost Breakdown"
          subtitle={trip.name}
          backTo={`/trip/${id}`}
          actions={saved && <span className="text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg font-medium">✓ Saved</span>}
        />

        {/* Budget Limit Banner */}
        {limit && (
          <div className={`mb-5 rounded-2xl p-4 border ${isOverBudget ? 'bg-red-50 border-red-200' : limitPct >= 80 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{isOverBudget ? '🚨' : limitPct >= 80 ? '⚠️' : '✅'}</span>
                <span className={`font-semibold text-sm ${isOverBudget ? 'text-red-700' : limitPct >= 80 ? 'text-amber-700' : 'text-green-700'}`}>
                  {isOverBudget
                    ? `Over budget by $${(total - limit).toFixed(2)}!`
                    : `$${remaining.toFixed(2)} remaining of $${limit.toFixed(0)} budget`}
                </span>
              </div>
              <button onClick={() => setShowLimitEdit(true)} className="text-xs text-gray-500 hover:text-indigo-600 transition">Edit limit</button>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : limitPct >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${limitPct}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-500' : limitPct >= 80 ? 'text-amber-600' : 'text-green-600'}`}>
              {limitPct?.toFixed(0)}% of budget used
            </p>
          </div>
        )}

        {/* Set Budget Limit */}
        {(!limit || showLimitEdit) && (
          <div className="mb-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">🎯 Set Budget Limit:</span>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="e.g. 2000"
              className="input w-36"
            />
            <button onClick={saveLimitHandler} className="btn-primary text-sm py-2">
              {showLimitEdit ? 'Update Limit' : 'Set Limit'}
            </button>
            {showLimitEdit && (
              <button onClick={() => setShowLimitEdit(false)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
            )}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Spent', value: `$${total.toFixed(2)}`, icon: '💰', color: 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' },
            { label: 'Itinerary Cost', value: `$${itineraryCost.toFixed(2)}`, icon: '📍', color: 'bg-gradient-to-br from-purple-600 to-pink-500 text-white' },
            { label: 'Expenses', value: budget.length, icon: '🧾', color: 'bg-white text-gray-800 border border-gray-100' },
            { label: limit ? 'Remaining' : 'Categories', value: limit ? `$${remaining.toFixed(0)}` : byCategory.length, icon: limit ? (isOverBudget ? '🚨' : '💚') : '🗂️', color: 'bg-white text-gray-800 border border-gray-100' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 shadow-sm ${s.color}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Add form + table */}
          <div className="lg:col-span-2 space-y-5">
            {/* Add expense */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">➕ Add Expense</h3>
              <div className="flex gap-2 flex-wrap">
                <input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}
                  placeholder="Expense item *" className="input flex-1 min-w-[140px]"
                  onKeyDown={(e) => e.key === 'Enter' && add()} />
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="Cost ($)" className="input w-28" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <button onClick={add} className="btn-primary">Add</button>
              </div>
            </div>

            {/* Category filter tabs */}
            {budget.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {['All', ...CATEGORIES.filter((c) => budget.some((b) => b.category === c))].map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                    {cat !== 'All' && CAT_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Expense table */}
            {filtered.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">Item</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-right px-4 py-3">Cost</th>
                      <th className="px-4 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, idx) => {
                      const realIdx = budget.indexOf(b);
                      return editIdx === realIdx ? (
                        <tr key={realIdx} className="border-t bg-indigo-50">
                          <td className="px-4 py-2"><input value={editForm.item} onChange={(e) => setEditForm({ ...editForm, item: e.target.value })} className="input w-full text-xs" /></td>
                          <td className="px-4 py-2"><select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input text-xs">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></td>
                          <td className="px-4 py-2"><input type="number" value={editForm.cost} onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })} className="input w-24 text-xs text-right" /></td>
                          <td className="px-4 py-2 flex gap-1">
                            <button onClick={() => saveEdit(realIdx)} className="text-xs text-green-600 hover:underline font-medium">Save</button>
                            <button onClick={() => setEditIdx(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={realIdx} className="border-t hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">{b.item}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_LIGHT[b.category] || 'bg-gray-100 text-gray-600'}`}>
                              {CAT_EMOJI[b.category]} {b.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">${b.cost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => { setEditIdx(realIdx); setEditForm({ item: b.item, cost: b.cost, category: b.category }); }} className="text-indigo-400 text-xs hover:text-indigo-600 mr-2">✏️</button>
                            <button onClick={() => remove(realIdx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-indigo-50 font-bold">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-indigo-700">
                        {activeCategory === 'All' ? 'Grand Total' : `${activeCategory} Total`}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-700">
                        ${filtered.reduce((s, b) => s + b.cost, 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
                <p className="text-3xl mb-2">💸</p>
                <p>No expenses yet. Add your first one above!</p>
              </div>
            )}
          </div>

          {/* Right: Breakdown chart */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">📊 Category Breakdown</h3>
              {byCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total: catTotal, items }) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{CAT_EMOJI[cat]} {cat}</span>
                        <span className="font-semibold text-gray-800">${catTotal.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`${CAT_COLORS[cat]} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${total > 0 ? (catTotal / total) * 100 : 0}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} · {total > 0 ? ((catTotal / total) * 100).toFixed(0) : 0}%</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Itinerary cost comparison */}
            {itineraryCost > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-3">📍 Itinerary Activities Cost</h3>
                {trip.itinerary?.filter((c) => c.activities?.some((a) => a.cost > 0)).map((city, i) => {
                  const cityCost = city.activities.reduce((s, a) => s + (a.cost || 0), 0);
                  return (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                      <span className="text-gray-600">📍 {city.city}</span>
                      <span className="font-medium">${cityCost.toFixed(0)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-bold text-indigo-700 pt-2 mt-1">
                  <span>Total</span>
                  <span>${itineraryCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Budget tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
              <h3 className="font-semibold text-indigo-700 mb-2 text-sm">💡 Budget Tips</h3>
              <ul className="text-xs text-indigo-600 space-y-1.5">
                <li>• Set a budget limit to get overspend alerts</li>
                <li>• Track daily to avoid surprises</li>
                <li>• Food & transport are usually 60% of costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
