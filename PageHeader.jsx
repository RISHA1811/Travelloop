import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, backTo, actions }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        {backTo && (
          <button onClick={() => navigate(backTo)} className="text-xs text-indigo-500 hover:underline mb-1 flex items-center gap-1">
            ← Back
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
