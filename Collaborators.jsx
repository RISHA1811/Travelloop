import { useState } from 'react';

export default function Collaborators({ collaborators = [], onChange }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const add = () => {
    if (!name.trim()) return;
    onChange([...collaborators, { name, email }]);
    setName('');
    setEmail('');
  };

  const remove = (idx) => onChange(collaborators.filter((_, i) => i !== idx));

  const avatarColor = (n) => {
    const colors = ['bg-indigo-400', 'bg-pink-400', 'bg-amber-400', 'bg-teal-400', 'bg-green-400', 'bg-purple-400'];
    return colors[n.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
          className="input flex-1 min-w-[120px]" onKeyDown={(e) => e.key === 'Enter' && add()} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
          className="input flex-1 min-w-[160px]" />
        <button onClick={add} className="btn-primary">Add</button>
      </div>

      {collaborators.length > 0 && (
        <div className="space-y-2">
          {collaborators.map((c, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border rounded-xl px-4 py-2.5">
              <div className={`${avatarColor(c.name)} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{c.name}</p>
                {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
              </div>
              <button onClick={() => remove(idx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      )}

      {collaborators.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No co-travellers added yet.</p>
      )}
    </div>
  );
}
