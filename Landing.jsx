import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🗺️', title: 'Smart Itinerary Builder', desc: 'Drag-and-drop day-by-day planning with activities, costs, and notes.' },
  { icon: '💰', title: 'Budget Tracker', desc: 'Track every expense by category with visual breakdowns and spending alerts.' },
  { icon: '🧳', title: 'Packing Lists', desc: 'Never forget essentials. Smart checklists synced across your trip.' },
  { icon: '📔', title: 'Travel Journal', desc: 'Capture memories, photos, and stories from every destination.' },
  { icon: '👥', title: 'Collaborate', desc: 'Plan together with friends and family in real-time.' },
  { icon: '🌤️', title: 'Weather Insights', desc: 'Live weather for every city on your itinerary.' },
];

const STATS = [
  { value: '10K+', label: 'Trips Planned' },
  { value: '50K+', label: 'Happy Travelers' },
  { value: '120+', label: 'Countries Covered' },
  { value: '4.9★', label: 'Average Rating' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Solo Traveler', text: 'Traveloop made my 3-week Europe trip so organized. The budget tracker alone saved me hundreds!', avatar: 'S' },
  { name: 'James K.', role: 'Family Vacationer', text: 'Planning a family trip used to be chaos. Now everything is in one place and the kids love the packing list!', avatar: 'J' },
  { name: 'Priya R.', role: 'Digital Nomad', text: 'I use Traveloop for every work trip. The itinerary builder is incredibly intuitive.', avatar: 'P' },
];

const GRADIENT_CARDS = [
  'from-violet-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-blue-500 to-indigo-500',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Traveloop</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition px-4 py-2 rounded-xl hover:bg-indigo-50">
            Login
          </Link>
          <Link to="/signup" className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:opacity-90 transition shadow-md shadow-indigo-200">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 -translate-y-1/2" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-indigo-100">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            The all-in-one travel planner
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Plan trips that feel like{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              adventures
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Itineraries, budgets, packing lists, journals — everything you need to travel smarter, all in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-xl shadow-indigo-200 text-base">
              Start Planning for Free →
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition border border-gray-200 text-base">
              Sign In
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-4">No credit card required · Free forever plan</p>
        </div>

        {/* Hero visual */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-1 shadow-2xl shadow-indigo-300">
            <div className="bg-gray-50 rounded-[22px] p-6">
              {/* Mock dashboard */}
              <div className="flex gap-4">
                {/* Sidebar mock */}
                <div className="w-40 bg-white rounded-2xl p-3 shadow-sm hidden sm:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-indigo-600 rounded-lg" />
                    <div className="h-3 bg-indigo-200 rounded w-16" />
                  </div>
                  {['Dashboard', 'My Trips', 'Budget', 'Journal'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-1 ${i === 0 ? 'bg-indigo-600' : ''}`}>
                      <div className={`w-3 h-3 rounded ${i === 0 ? 'bg-white/50' : 'bg-gray-200'}`} />
                      <div className={`h-2.5 rounded ${i === 0 ? 'bg-white/70 w-14' : 'bg-gray-200 w-12'}`} />
                    </div>
                  ))}
                </div>
                {/* Main content mock */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[['🗺️', 'indigo'], ['🕐', 'blue'], ['🚀', 'green'], ['💰', 'amber']].map(([icon, color], i) => (
                      <div key={i} className={`bg-${color}-50 rounded-xl p-3`}>
                        <div className="text-lg mb-1">{icon}</div>
                        <div className={`h-3 bg-${color}-200 rounded w-8 mb-1`} />
                        <div className={`h-2 bg-${color}-100 rounded w-12`} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADIENT_CARDS.slice(0, 3).map((g, i) => (
                      <div key={i} className={`bg-gradient-to-r ${g} rounded-xl h-20 flex items-end p-3`}>
                        <div className="space-y-1">
                          <div className="h-2 bg-white/50 rounded w-16" />
                          <div className="h-2 bg-white/30 rounded w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-xs font-bold text-gray-800">Budget Saved</p>
              <p className="text-xs text-green-600 font-semibold">$340 under budget!</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-xs font-bold text-gray-800">Packing List</p>
              <p className="text-xs text-indigo-600 font-semibold">18/20 items packed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold mb-1">{value}</p>
              <p className="text-indigo-200 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to travel better</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">From the first idea to the last memory — Traveloop has you covered.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div key={title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 group hover:-translate-y-1 duration-200">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRADIENT_CARDS[i]} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Get started in 3 steps</h2>
          <p className="text-gray-500 mb-14">No complicated setup. Just start planning.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your trip', desc: 'Name it, set dates, add a description and cover emoji.', icon: '✈️' },
              { step: '02', title: 'Build your itinerary', desc: 'Add cities, activities, costs, and notes day by day.', icon: '📍' },
              { step: '03', title: 'Travel & track', desc: 'Monitor your budget, check off packing items, write your journal.', icon: '🌍' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {icon}
                </div>
                <div className="absolute top-0 right-1/4 text-6xl font-black text-gray-100 -z-10 select-none">{step}</div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Loved by travelers worldwide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 text-amber-400 mb-4">{'★★★★★'}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">✈️</div>
          <div className="absolute bottom-10 right-10 text-9xl">🌍</div>
          <div className="absolute top-1/2 left-1/2 text-9xl -translate-x-1/2 -translate-y-1/2">🗺️</div>
        </div>
        <div className="relative max-w-2xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Ready for your next adventure?</h2>
          <p className="text-indigo-100 text-lg mb-8">Join thousands of travelers who plan smarter with Traveloop.</p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl hover:bg-indigo-50 transition shadow-xl text-base">
            Start Planning Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">✈️</span>
          <span className="text-white font-bold text-lg">Traveloop</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Traveloop. Built with ❤️ for travelers.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <Link to="/login" className="hover:text-white transition">Login</Link>
          <Link to="/signup" className="hover:text-white transition">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
