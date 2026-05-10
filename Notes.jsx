export default function Notes({ notes = '', onChange }) {
  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your trip notes here..."
        rows={6}
        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
      />
    </div>
  );
}
