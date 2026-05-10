import { useState } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'];
const CAT_COLORS = {
  Food: 'bg-orange-400', Transport: 'bg-blue-400', Hotel: 'bg-purple-400',
  Activities: 'bg-green-400', Shopping: 'bg-pink-400', Other: 'bg-gray-400',
};
const CAT_EMOJI = {
  Food: '🍔', Transport: '🚌', Hotel: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦',
};

export default function Budget({ budget = [], onChange }) {
  const [item, setItem] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('Other');

  const add = () => {
    if (!item.trim() || !cost) return;
    onChange([...budget, { item, cost: parseFloat(cost), category }]);
    setItem('');
    setCost('');
  };

  const remove = (idx) => onChange(budget.filter((_, i) => i !== idx));

  const total = budget.reduce((sum, b) => sum + b.cost, 0);

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    total: budget.filter((b) => b.category === cat).reduce((s, b) => s + b.cost, 0),
  })).filter((c) => c.total > 0);

  return (
    <div className="space-y-5">
      {/* Add form */}
      <div className="flex gap-2 flex-wrap">
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Expense item"
          className="input flex-1 min-w-[140px]" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost ($)"
          className="input w-28" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={add} className="btn-primary">Add</button>
      </div>

      {budget.length > 0 && (
        <>
          {/* Category breakdown */}
          <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-3">Breakdown by Category</p>
            {byCategory.map(({ cat, total: catTotal }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm w-24 text-gray-600">{CAT_EMOJI[cat]} {cat}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className={`${CAT_COLORS[cat]} h-2 rounded-full`}
                    style={{ width: `${total > 0 ? (catTotal / total) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-700 w-16 text-right">${catTotal.toFixed(0)}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden border">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="text-left px-4 py-2">Item</th>
                  <th className="text-left px-4 py-2">Category</th>
                  <th className="text-right px-4 py-2">Cost</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {budget.map((b, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{b.item}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {CAT_EMOJI[b.category] || '📦'} {b.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">${b.cost.toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-indigo-50 font-bold">
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-indigo-700">Total</td>
                  <td className="px-4 py-2 text-right text-indigo-700">${total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
