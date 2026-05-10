import { useState } from 'react';
import { Link } from 'react-router-dom';

const EXPENSE_CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: 'from-orange-400 to-red-500' },
  { name: 'Transport', icon: '🚌', color: 'from-blue-400 to-indigo-500' },
  { name: 'Hotel', icon: '🏨', color: 'from-purple-400 to-pink-500' },
  { name: 'Activities', icon: '🎯', color: 'from-green-400 to-emerald-500' },
  { name: 'Shopping', icon: '🛍️', color: 'from-pink-400 to-rose-500' },
  { name: 'Other', icon: '📌', color: 'from-gray-400 to-gray-500' }
];

export default function ExpenseTracker({ tripId, expenses = [], onUpdate }) {
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], receipt: null });
  const [view, setView] = useState('list'); // list, analytics, receipt
  const [filter, setFilter] = useState('all');

  const addExpense = () => {
    if (!form.description || !form.amount) return;
    const newExpense = {
      id: Date.now().toString(),
      ...form,
      amount: parseFloat(form.amount),
      timestamp: new Date().toISOString()
    };
    onUpdate?.([...expenses, newExpense]);
    setForm({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], receipt: null });
  };

  const deleteExpense = (id) => {
    onUpdate?.(expenses.filter(e => e.id !== id));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, receipt: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredExpenses = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0)
  }));

  const dailyExpenses = expenses.reduce((acc, exp) => {
    const date = exp.date;
    acc[date] = (acc[date] || 0) + exp.amount;
    return acc;
  }, {});

  const avgDaily = Object.keys(dailyExpenses).length > 0 
    ? totalSpent / Object.keys(dailyExpenses).length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
          <p className="text-xs opacity-80">Total Spent</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{expenses.length}</p>
          <p className="text-xs opacity-80">Transactions</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">${avgDaily.toFixed(0)}</p>
          <p className="text-xs opacity-80">Avg/Day</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 shadow">
        {['list', 'analytics', 'receipt'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition capitalize ${
              view === v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {v === 'list' ? '📋' : v === 'analytics' ? '📊' : '📸'} {v}
          </button>
        ))}
      </div>

      {/* Add Expense Form */}
      {view === 'list' && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>➕</span> Add Expense
          </h3>
          <div className="space-y-3">
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description *"
              className="input w-full"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount ($) *"
                className="input"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input w-full"
            />
            <div>
              <label className="text-xs text-gray-600 mb-1 block">📸 Receipt (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="text-xs w-full"
              />
              {form.receipt && (
                <div className="mt-2 relative">
                  <img src={form.receipt} alt="Receipt" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => setForm({ ...form, receipt: null })}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button onClick={addExpense} className="btn-primary w-full">Add Expense</button>
          </div>
        </div>
      )}

      {/* Expense List */}
      {view === 'list' && (
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">💳 Expenses</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No expenses yet</p>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map(exp => {
                const cat = EXPENSE_CATEGORIES.find(c => c.name === exp.category);
                return (
                  <div key={exp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:shadow-md transition group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat?.color} flex items-center justify-center text-xl`}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{exp.description}</p>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span>{exp.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">${exp.amount.toFixed(2)}</p>
                      {exp.receipt && <span className="text-xs text-indigo-500">📸</span>}
                    </div>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics View */}
      {view === 'analytics' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">📊 Category Breakdown</h3>
            <div className="space-y-3">
              {categoryTotals.map(cat => {
                const percentage = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="font-medium text-gray-700">{cat.name}</span>
                      </span>
                      <span className="font-bold text-gray-800">${cat.total.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of total</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">📅 Daily Spending</h3>
            <div className="space-y-2">
              {Object.entries(dailyExpenses).sort().reverse().slice(0, 7).map(([date, amount]) => (
                <div key={date} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{date}</span>
                  <span className="text-sm font-bold text-indigo-600">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Gallery */}
      {view === 'receipt' && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">📸 Receipt Gallery</h3>
          {expenses.filter(e => e.receipt).length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No receipts uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {expenses.filter(e => e.receipt).map(exp => (
                <div key={exp.id} className="relative group">
                  <img src={exp.receipt} alt={exp.description} className="w-full h-40 object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition rounded-xl flex flex-col items-center justify-center text-white p-2">
                    <p className="text-xs font-semibold text-center">{exp.description}</p>
                    <p className="text-lg font-bold">${exp.amount}</p>
                    <p className="text-xs">{exp.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
