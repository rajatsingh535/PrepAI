import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, Clock, Building2, ExternalLink,
  Filter, X, ChevronDown, Star, Zap, BookmarkPlus, Globe,
  DollarSign, Users, TrendingUp, RefreshCw
} from 'lucide-react';

/* ── Mock job data (replace with real Remotive / Adzuna API later) */
const MOCK_JOBS = [
  { id: 1, title: 'Senior React Developer', company: 'Stripe', location: 'Remote', type: 'Full-time', salary: '$130k–$170k', posted: '2d ago', logo: '💳', tags: ['React','TypeScript','Node.js'], description: 'Build and maintain world-class payment UIs used by millions. You will work on our core dashboard, merchant-facing tools, and internal dev tools.', applyUrl: '#', featured: true, experience: 'Senior' },
  { id: 2, title: 'Backend Engineer (Node.js)', company: 'Vercel', location: 'Remote – US', type: 'Full-time', salary: '$120k–$160k', posted: '1d ago', logo: '▲', tags: ['Node.js','Go','PostgreSQL'], description: 'Join Vercel\'s infrastructure team to build edge functions, global routing, and distributed systems at massive scale.', applyUrl: '#', featured: true, experience: 'Mid' },
  { id: 3, title: 'Full Stack Engineer', company: 'Linear', location: 'Remote', type: 'Full-time', salary: '$110k–$150k', posted: '3d ago', logo: '📐', tags: ['React','GraphQL','Rust'], description: 'Work on Linear\'s beautiful issue tracker used by the best engineering teams. Focus on performance and delightful UX.', applyUrl: '#', featured: false, experience: 'Mid' },
  { id: 4, title: 'ML Engineer – LLM', company: 'Groq', location: 'San Jose, CA', type: 'Full-time', salary: '$150k–$200k', posted: '5h ago', logo: '⚡', tags: ['Python','PyTorch','CUDA'], description: 'Help design and optimize LLM inference at unprecedented speed. You\'ll work on kernel optimization and hardware-software co-design.', applyUrl: '#', featured: true, experience: 'Senior' },
  { id: 5, title: 'DevOps / Platform Engineer', company: 'PlanetScale', location: 'Remote', type: 'Full-time', salary: '$115k–$145k', posted: '1w ago', logo: '🌍', tags: ['Kubernetes','Terraform','AWS'], description: 'Scale the world\'s most advanced serverless MySQL platform. Manage multi-region clusters and CI/CD pipelines.', applyUrl: '#', featured: false, experience: 'Mid' },
  { id: 6, title: 'iOS Engineer', company: 'Notion', location: 'New York, NY', type: 'Full-time', salary: '$125k–$165k', posted: '2d ago', logo: '📝', tags: ['Swift','SwiftUI','CoreData'], description: 'Build the Notion iOS app used by 20M+ users. You\'ll own features end-to-end, from architecture to App Store release.', applyUrl: '#', featured: false, experience: 'Mid' },
  { id: 7, title: 'Data Engineer', company: 'Databricks', location: 'Remote – EU', type: 'Full-time', salary: '$100k–$140k', posted: '4d ago', logo: '🔥', tags: ['Spark','Python','Scala'], description: 'Build robust data pipelines and lake architectures for enterprise customers. Collaborate with solutions engineering globally.', applyUrl: '#', featured: false, experience: 'Mid' },
  { id: 8, title: 'Frontend Engineer (Design Systems)', company: 'Figma', location: 'San Francisco, CA', type: 'Full-time', salary: '$135k–$175k', posted: '6d ago', logo: '🎨', tags: ['React','CSS','WebGL'], description: 'Contribute to Figma\'s design system used internally and externally. Own component APIs, documentation, and accessibility.', applyUrl: '#', featured: true, experience: 'Senior' },
  { id: 9, title: 'Security Engineer', company: 'Cloudflare', location: 'Austin, TX', type: 'Full-time', salary: '$130k–$180k', posted: '3d ago', logo: '🔒', tags: ['Rust','C++','Networking'], description: 'Protect millions of websites and APIs at the network edge. Work on DDoS mitigation, WAF rules, and zero-trust infrastructure.', applyUrl: '#', featured: false, experience: 'Senior' },
  { id: 10, title: 'Junior React Developer', company: 'Supabase', location: 'Remote', type: 'Full-time', salary: '$75k–$100k', posted: '1d ago', logo: '⚡', tags: ['React','TypeScript','Tailwind'], description: 'Join the open-source Firebase alternative. Help build our dashboard, docs site, and self-serve onboarding flows.', applyUrl: '#', featured: false, experience: 'Entry' },
  { id: 11, title: 'Staff Engineer – Infrastructure', company: 'Shopify', location: 'Remote – Canada', type: 'Full-time', salary: '$170k–$220k', posted: '1w ago', logo: '🛍️', tags: ['Ruby','Go','Kubernetes'], description: 'Lead infrastructure initiatives for one of the world\'s largest commerce platforms serving millions of merchants.', applyUrl: '#', featured: false, experience: 'Lead' },
  { id: 12, title: 'Product Engineer (AI Features)', company: 'Loom', location: 'Remote', type: 'Full-time', salary: '$120k–$155k', posted: '2d ago', logo: '🎥', tags: ['React','Python','OpenAI'], description: 'Ship AI-powered features like auto-summaries, transcriptions, and smart highlights into Loom\'s async video product.', applyUrl: '#', featured: false, experience: 'Mid' },
];

const JOB_TYPES    = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE   = ['All', 'Entry', 'Mid', 'Senior', 'Lead'];
const LOCATIONS    = ['All', 'Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'San Jose, CA'];

export default function JobsPage() {
  const [query,       setQuery]       = useState('');
  const [location,    setLocation]    = useState('All');
  const [jobType,     setJobType]     = useState('All');
  const [experience,  setExperience]  = useState('All');
  const [selected,    setSelected]    = useState(null);
  const [bookmarked,  setBookmarked]  = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_JOBS.filter((j) => {
      const matchQ = !query || j.title.toLowerCase().includes(query.toLowerCase()) ||
                     j.company.toLowerCase().includes(query.toLowerCase()) ||
                     j.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchL = location === 'All' || j.location.includes(location) || (location === 'Remote' && j.location.toLowerCase().includes('remote'));
      const matchT = jobType === 'All' || j.type === jobType;
      const matchE = experience === 'All' || j.experience === experience;
      return matchQ && matchL && matchT && matchE;
    });
  }, [query, location, jobType, experience]);

  const toggleBookmark = (id) => setBookmarked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Job Board</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filtered.length} opportunities • Tailored to your profile
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-brand text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" /> Powered by PrepAI
          </span>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="form-input pl-9 h-11"
              placeholder="Search jobs, companies, or skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative hidden sm:block">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select className="form-select h-11 pl-9 pr-8 w-48"
              value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-2 px-4 h-11 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-brand-600/20 border-brand-500/40 text-brand-300' : 'bg-surface border-surface-border text-slate-400 hover:border-slate-500 hover:text-white'}`}>
            <Filter className="w-4 h-4" />
            Filters
            {(jobType !== 'All' || experience !== 'All') && (
              <span className="w-2 h-2 bg-brand-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3 pt-2 border-t border-surface-border">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Job Type</p>
                <div className="flex gap-2 flex-wrap">
                  {JOB_TYPES.map((t) => (
                    <button key={t} onClick={() => setJobType(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${jobType === t ? 'bg-brand-600/30 border-brand-500 text-brand-300' : 'border-surface-border text-slate-400 hover:border-slate-500'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Experience</p>
                <div className="flex gap-2 flex-wrap">
                  {EXPERIENCE.map((e) => (
                    <button key={e} onClick={() => setExperience(e)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${experience === e ? 'bg-brand-600/30 border-brand-500 text-brand-300' : 'border-surface-border text-slate-400 hover:border-slate-500'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {(jobType !== 'All' || experience !== 'All') && (
                <button onClick={() => { setJobType('All'); setExperience('All'); }}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 ml-auto self-end transition-colors">
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Grid + Detail */}
      <div className={`grid gap-4 ${selected ? 'grid-cols-1 xl:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>

        {/* Job List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="card p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No jobs match your search</p>
              <button onClick={() => { setQuery(''); setJobType('All'); setExperience('All'); setLocation('All'); }}
                className="btn-ghost mt-3 text-sm text-brand-400">Clear all filters</button>
            </div>
          )}
          {filtered.map((job, i) => (
            <motion.div key={job.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(selected?.id === job.id ? null : job)}
              className={`card p-5 cursor-pointer transition-all hover:border-brand-500/40 hover:shadow-brand group ${selected?.id === job.id ? 'border-brand-500/60 bg-brand-500/5' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-2xl flex-shrink-0">
                  {job.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{job.title}</h3>
                        {job.featured && (
                          <span className="badge badge-brand text-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />{job.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
                        className={`p-1.5 rounded-lg transition-colors ${bookmarked.has(job.id) ? 'text-brand-400 bg-brand-500/10' : 'text-slate-500 hover:text-brand-400 hover:bg-brand-500/10'}`}>
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                    {job.salary && <span className="flex items-center gap-1 text-emerald-400"><DollarSign className="w-3 h-3" />{job.salary}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-surface border border-surface-border text-slate-400 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Job Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="card p-6 space-y-5 h-fit xl:sticky xl:top-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-2xl">
                    {selected.logo}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white">{selected.title}</h2>
                    <p className="text-slate-400 text-sm">{selected.company}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: MapPin,    label: 'Location', value: selected.location },
                  { icon: Briefcase, label: 'Type',     value: selected.type },
                  { icon: DollarSign,label: 'Salary',   value: selected.salary || 'Not disclosed' },
                  { icon: Users,     label: 'Level',    value: selected.experience },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-surface border border-surface-border">
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <Icon className="w-3 h-3" /> {label}
                    </p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">About the role</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{selected.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-brand-600/10 border border-brand-500/20 text-brand-300 text-sm font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <a href={selected.applyUrl} target="_blank" rel="noreferrer"
                  className="btn-primary w-full justify-center">
                  <ExternalLink className="w-4 h-4" /> Apply Now
                </a>
                <button onClick={() => toggleBookmark(selected.id)}
                  className={`btn-secondary w-full justify-center ${bookmarked.has(selected.id) ? 'border-brand-500/40 text-brand-300' : ''}`}>
                  <BookmarkPlus className="w-4 h-4" />
                  {bookmarked.has(selected.id) ? 'Saved' : 'Save Job'}
                </button>
              </div>

              <div className="pt-2 border-t border-surface-border">
                <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                  <Globe className="w-3 h-3" /> Posted {selected.posted} • {selected.company}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
