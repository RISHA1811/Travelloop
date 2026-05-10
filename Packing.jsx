import { useState } from 'react';

const TEMPLATES = {
  '🏖️ Beach': ['Sunscreen', 'Swimsuit', 'Flip flops', 'Beach towel', 'Sunglasses', 'Hat', 'Snorkel'],
  '💼 Business': ['Laptop', 'Charger', 'Business cards', 'Formal shoes', 'Suit/Blazer', 'Notebook'],
  '❄️ Winter': ['Warm jacket', 'Gloves', 'Scarf', 'Thermal socks', 'Snow boots', 'Beanie'],
  '🎒 Essentials': ['Passport', 'Phone charger', 'Wallet', 'Medications', 'Earphones', 'Power bank'],
};

export default function Packing({ packing = [], onChange }) {
  const [item, setItem] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const add = (val) => {
    const name = (val || item).trim();
    if (!name) return;
    if (packing.find((p) => p.item.toLowerCase() === name.toLowerCase())) return;
    onChange([...packing, { item: name, packed: false }]);
    setItem('');
  };

  const applyTemplate = (items) => {
    const existing = packing.map((p) => p.item.toLowerCase());
    const newItems = items
      .filter((i) => !existing.includes(i.toLowerCase()))
      .map((i) => ({ item: i, packed: false }));
    onChange([...packing, ...newItems]);
    setShowTemplates(false);
  };

  const toggle = (idx) =>
    onChange(packing.map((p, i) => (i === idx ? { ...p, packed: !p.packed } : p)));

  const remove = (idx) => onChange(packing.filter((_, i) => i !== idx));

  const clearPacked = () => onChange(packing.filter((p) => !p.packed));

  const packed = packing.filter((p) => p.packed).length;
  const percent = packing.length > 0 ? Math.round((packed / packing.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Add + Templates */}
      <div className="flex gap-2 flex-wrap">
        <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add item to pack"
          className="input flex-1" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button onClick={() => add()} className="btn-primary">Add</button>
        <button onClick={() => setShowTemplates(!showTemplates)}
          className="border border-indigo-300 text-indigo-600 text-sm px-3 py-2 rounded-xl hover:bg-indigo-50">
          📋 Templates
        </button>
      </div>

      {/* Template Picker */}
      {showTemplates && (
        <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">Quick-add packing templates:</p>
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

      {packing.length > 0 && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full transition-all"
                style={{ width: `${percent}%` }} />
            </div>
            <span className="text-sm font-semibold text-indigo-600 w-16 text-right">
              {packed}/{packing.length} ({percent}%)
            </span>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {packing.map((p, idx) => (
              <li key={idx} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition ${p.packed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}`}>
                <input type="checkbox" checked={p.packed} onChange={() => toggle(idx)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                <span className={`flex-1 text-sm ${p.packed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {p.item}
                </span>
                <button onClick={() => remove(idx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
              </li>
            ))}
          </ul>

          {packed > 0 && (
            <button onClick={clearPacked} className="text-xs text-red-400 hover:text-red-600 hover:underline">
              🗑️ Remove packed items ({packed})
            </button>
          )}
        </>
      )}
    </div>
  );
}
