import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto transition-all duration-200" style={{ marginLeft: '240px' }}>
        {children}
      </main>
    </div>
  );
}
