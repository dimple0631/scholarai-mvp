'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  CalendarDays,
  Clock3,
  CircleDollarSign,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  LockKeyhole,
  Globe2,
  BriefcaseBusiness
} from 'lucide-react';

// FIXED IMPORT PATH
import { programs, scholarships, type Program } from '../lib/data';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

type Tab =
  | 'Dashboard'
  | 'Explore'
  | 'My Budget'
  | 'Shortlist'
  | 'Applications'
  | 'Profile & settings';

type AppItem = {
  id: string;
  programId: string;
  status: string;
  deadline: string;
  tasks: string[];
};

const nav: { name: Tab; icon: typeof LayoutDashboard }[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Explore', icon: Compass },
  { name: 'My Budget', icon: Wallet },
  { name: 'Shortlist', icon: Bookmark },
  { name: 'Applications', icon: FileText },
  { name: 'Profile & settings', icon: Settings2 }
];

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(n);

const initialProfile = {
  firstName: 'Student',
  residence: 'India',
  nationality: 'Indian',
  level: "Bachelor's",
  field: 'Computer Science',
  grade: '82%',
  destinations: ['Germany', 'United Kingdom', 'Canada'],
  budget: 12000,
  budgetCurrency: 'EUR',
  funding: 'Scholarship + family',
  intake: 'September 2027'
};

export default function Home() {
    const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('Dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('All destinations');
  const [level, setLevel] = useState('All levels');
  const [shortlist, setShortlist] = useState<string[]>(['p4', 'p6', 's1']);
  const [profile, setProfile] = useState(initialProfile);

  const [apps, setApps] = useState<AppItem[]>([
    {
      id: 'a1',
      programId: 'p4',
      status: 'Preparing',
      deadline: '2027-04-01',
      tasks: [
        'Check entry requirements',
        'Draft statement',
        'Request transcripts'
      ]
    },
    {
      id: 'a2',
      programId: 'p6',
      status: 'Interested',
      deadline: '2027-05-15',
      tasks: [
        'Confirm tuition details',
        'Check language requirements'
      ]
    }
  ]);

  const [modal, setModal] = useState<
    'onboarding' | 'plans' | 'newApp' | null
  >(null);

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [budgetCurrency, setBudgetCurrency] = useState('EUR');
  const [living, setLiving] = useState(14000);
  const [oneTime, setOneTime] = useState(2200);
  const [scholarship, setScholarship] = useState(0);
  const [notice, setNotice] = useState('');
  const [plan, setPlan] = useState<'Free' | 'Standard' | 'Premium'>('Free');
  const [taskDone, setTaskDone] = useState<string[]>([]);
  const [newAppProgram, setNewAppProgram] = useState('p1');
  const [newAppDeadline, setNewAppDeadline] = useState('2027-03-01');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const raw = localStorage.getItem('scholarai-demo');

      if (raw) {
        const d = JSON.parse(raw);

        if (d.tab) setTab(d.tab);
        if (d.shortlist) setShortlist(d.shortlist);
        if (d.profile) setProfile(d.profile);
        if (d.apps) setApps(d.apps);
        if (d.plan) setPlan(d.plan);
        if (d.taskDone) setTaskDone(d.taskDone);
      }
    } catch {
      // Ignore invalid saved demo data.
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      'scholarai-demo',
      JSON.stringify({
        tab,
        shortlist,
        profile,
        apps,
        plan,
        taskDone
      })
    );
  }, [mounted, tab, shortlist, profile, apps, plan, taskDone]);

  const filteredPrograms = useMemo(
    () =>
      programs.filter(
        (p) =>
          (country === 'All destinations' || p.country === country) &&
          (level === 'All levels' || p.level === level) &&
          `${p.university} ${p.program} ${p.country} ${p.field}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [country, level, query]
  );

  const shortlistedPrograms = programs.filter((p) =>
    shortlist.includes(p.id)
  );

  const shortlistedScholarships = scholarships.filter((s) =>
    shortlist.includes(s.id)
  );

  const activeApps = apps.filter(
    (a) => !['Accepted', 'Rejected', 'Withdrawn'].includes(a.status)
  );

  const allTasks = apps.flatMap((a) =>
    a.tasks.map((t) => ({
      key: `${a.id}-${t}`,
      text: t,
      program:
        programs.find((p) => p.id === a.programId)?.university ||
        'Application'
    }))
  );

  const nextTasks = allTasks
    .filter((t) => !taskDone.includes(t.key))
    .slice(0, 3);

  
const firstProgram = programs.find((p) => p.id === 'p4') ?? programs[0];


  const annualTotal = (firstProgram?.tuition ?? 0) + living;
  const fundingGap = Math.max(0, annualTotal - profile.budget);

  function toggleSave(id: string) {
    setShortlist((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id]
    );

    setNotice(
      shortlist.includes(id)
        ? 'Removed from your shortlist'
        : 'Saved to your shortlist'
    );

    setTimeout(() => setNotice(''), 2200);
  }

  function createApplication() {
    const exists = apps.some((a) => a.programId === newAppProgram);

    if (exists) {
      setNotice('This program is already in your application tracker.');
      setTimeout(() => setNotice(''), 2500);
      return;
    }

    setApps((old) => [
      ...old,
      {
        id: `a${Date.now()}`,
        programId: newAppProgram,
        status: 'Interested',
        deadline: newAppDeadline,
        tasks: [
          'Review official entry requirements',
          'Prepare required documents',
          'Draft personal statement'
        ]
      }
    ]);

    setModal(null);
    setTab('Applications');
    setNotice('Application added to your workspace');
    setTimeout(() => setNotice(''), 2500);
  }

  function changeStatus(id: string, status: string) {
    setApps((old) =>
      old.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const go = (t: Tab) => {
    setTab(t);
    setMobileNav(false);
  };
      useEffect(() => {
    let active = true;

    async function checkAuth() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        router.replace('/auth');
        return;
      }

      setAuthChecking(false);
    }

    void checkAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/auth');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (authChecking) {
    return (
      <div className="app-shell">
        <main className="main-area flex min-h-screen items-center justify-center">
          <p>Loading your ScholarAI workspace...</p>
        </main>
      </div>
    );
  }
  return ( 
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={21} />
          </div>

          <span>
            Scholar<span className="brand-ai">AI</span>
          </span>

          <button
            className="mobile-close icon-btn"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">YOUR WORKSPACE</div>

        <nav className="main-nav">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  tab === item.name ? 'active' : ''
                }`}
                onClick={() => go(item.name)}
              >
                <Icon size={18} />
                <span>{item.name}</span>

                {item.name === 'Applications' && (
                  <span className="nav-count">{apps.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-help">
          <div className="help-icon">
            <CircleHelp size={18} />
          </div>

          <div>
            <strong>Need a hand?</strong>
            <p>Make your next step clearer.</p>

            <button
              onClick={() =>
                setNotice('Help centre is planned for a future release.')
              }
            >
              Visit help centre <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="profile-mini">
          <div className="avatar">
            {profile.firstName.slice(0, 1).toUpperCase()}
          </div>

          <div className="profile-mini-copy">
            <strong>
              {profile.firstName === 'Student'
                ? 'Your profile'
                : profile.firstName}
            </strong>
            <span>{plan} plan</span>
          </div>

          <button
            className="icon-btn"
            onClick={() => go('Profile & settings')}
            aria-label="Profile settings"
          >
            <Settings2 size={17} />
          </button>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="mobile-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label="Close menu"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-btn"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>{tab}</strong>
          </div>

          <div className="topbar-right">
            <span className="demo-pill">
              <span /> MVP DEMO
            </span>

            <button
              className="icon-btn notification"
              onClick={() =>
                setNotice(
                  'You’re all caught up. Deadline email reminders will be connected in the next build.'
                )
              }
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <button
              className="upgrade-button"
              onClick={() => setModal('plans')}
            >
              Explore plans <ArrowRight size={15} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {tab === 'Dashboard' && (
            <>
              <div className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE
                  </div>

                  <h1>
                    Let’s make your study-abroad plan <em>real.</em>
                  </h1>

                  <p className="page-subtitle">
                    A clearer view of your options, your budget, and what to do
                    next.
                  </p>
                </div>

                <button
                  className="button button-primary"
                  onClick={() => setModal('onboarding')}
                >
                  Personalise my plan <ArrowRight size={16} />
                </button>
              </div>

              <div className="journey-banner">
                <div className="journey-icon">
                  <Compass size={21} />
                </div>

                <div className="journey-copy">
                  <strong>Your journey, one step at a time</strong>
                  <p>
                    Start with realistic options. Build your shortlist. Keep
                    every application moving.
                  </p>
                </div>

                <div className="journey-progress">
                  <span>PROFILE PROGRESS</span>
                  <div className="progress-track">
                    <i
                      style={{
                        width: `${profile.grade && profile.budget ? 72 : 36}%`
                      }}
                    />
                  </div>
                  <strong>
                    {profile.grade && profile.budget ? '72' : '36'}%
                  </strong>
                </div>
              </div>

              <div className="stats-grid">
                <Stat
                  icon={<Bookmark size={18} />}
                  label="Shortlisted options"
                  value={`${shortlist.length}`}
                  note="Programs & funding"
                />

                <Stat
                  icon={<FileText size={18} />}
                  label="Active applications"
                  value={`${activeApps.length}`}
                  note="Across your workspace"
                />

                <Stat
                  icon={<CircleDollarSign size={18} />}
                  label="Estimated funding gap"
                  value={fmt(fundingGap, budgetCurrency)}
                  note="For your featured option"
                />

                <Stat
                  icon={<CalendarDays size={18} />}
                  label="Next key deadline"
                  value="Apr 01"
                  note="Check the official date"
                />
              </div>

              <div className="dashboard-grid">
                <section className="panel next-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">YOUR FOCUS</span>
                      <h2>Three next steps</h2>
                    </div>

                    <span className="soft-badge">
                      <Sparkles size={13} /> Personalised
                    </span>
                  </div>

                  <p className="panel-intro">
                    Small, clear actions that move your plan forward.
                  </p>

                  <div className="task-list">
                    {nextTasks.length ? (
                      nextTasks.map((t, i) => (
                        <label className="task-row" key={t.key}>
                          <input
                            type="checkbox"
                            checked={taskDone.includes(t.key)}
                            onChange={(e) =>
                              setTaskDone((old) =>
                                e.target.checked
                                  ? [...old, t.key]
                                  : old.filter((x) => x !== t.key)
                              )
                            }
                          />

                          <span className="task-check">
                            <Check size={13} />
                          </span>

                          <span className="task-text">
                            <strong>{t.text}</strong>
                            <small>{t.program}</small>
                          </span>

                          <span className="task-priority">
                            {i === 0
                              ? 'NEXT UP'
                              : i === 1
                                ? 'THIS WEEK'
                                : 'UP NEXT'}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="empty-inline">
                        <CheckCircle2 size={22} />
                        All visible tasks are complete. Nice work.
                      </div>
                    )}
                  </div>

                  <button
                    className="text-button"
                    onClick={() => go('Applications')}
                  >
                    Open application workspace <ArrowRight size={15} />
                  </button>
                </section>

                <section className="panel budget-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">MONEY, MADE CLEAR</span>
                      <h2>Your budget snapshot</h2>
                    </div>

                    <button
                      className="icon-btn"
                      onClick={() => go('My Budget')}
                      aria-label="Open budget"
                    >
                      <ArrowDownRight size={18} />
                    </button>
                  </div>

                  <p className="panel-intro">
                    A starting estimate for your saved options.
                  </p>

                  <div className="budget-visual">
                    <div className="donut">
                      <div>
                        <strong>{fmt(annualTotal, budgetCurrency)}</strong>
                        <span>estimated / year</span>
                      </div>
                    </div>

                    <div className="budget-legend">
                      <div>
                        <i className="legend-dot tuition" />
                        <span>Tuition</span>
                      <strong>{fmt(firstProgram?.tuition ?? 0, budgetCurrency)}</strong>
                      </div>

                      <div>
                        <i className="legend-dot living" />
                        <span>Living costs</span>
                        <strong>{fmt(living, budgetCurrency)}</strong>
                      </div>

                      <div>
                        <i className="legend-dot gap" />
                        <span>Budget gap</span>
                        <strong>{fmt(fundingGap, budgetCurrency)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="budget-foot">
                    <span>
                      <ShieldCheck size={14} /> Estimate only · verify fees
                    </span>

                    <button onClick={() => go('My Budget')}>
                      View breakdown <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
              </div>

              <section className="panel recommended-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">A PLACE TO START</span>
                    <h2>Options worth exploring</h2>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => go('Explore')}
                  >
                    Explore all <ArrowRight size={15} />
                  </button>
                </div>

                <div className="program-grid">
                  {programs.slice(0, 3).map((p) => (
                    <ProgramCard
                      key={p.id}
                      p={p}
                      saved={shortlist.includes(p.id)}
                      onSave={() => toggleSave(p.id)}
                      onOpen={() => {
                        setQuery(p.program);
                        go('Explore');
                      }}
                      compact
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === 'Explore' && (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <Compass size={14} /> FIND YOUR FIT
                  </div>
                  <h1>Explore opportunities</h1>
                  <p className="page-subtitle">
                    Search programs and discover possibilities. Always confirm
                    details with official sources.
                  </p>
                </div>

                <span className="result-count">
                  {filteredPrograms.length} programs
                </span>
              </div>

              <div className="filter-bar">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search university, course, subject..."
                  />
                </div>

                <div className="select-wrap">
                  <Globe2 size={16} />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option>All destinations</option>
                    {[...new Set(programs.map((p) => p.country))].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>

                <div className="select-wrap">
                  <SlidersHorizontal size={16} />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option>All levels</option>
                    <option>Bachelor's</option>
                    <option>Master's</option>
                    <option>PhD</option>
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="explore-layout">
                <div className="catalogue-list">
                  {filteredPrograms.map((p) => (
                    <ProgramCard
                      key={p.id}
                      p={p}
                      saved={shortlist.includes(p.id)}
                      onSave={() => toggleSave(p.id)}
                      onOpen={() =>
                        setNotice(
                          `Selected ${p.program}. Official programme details open in the source link.`
                        )
                      }
                    />
                  ))}
                </div>

                <aside className="explore-aside">
                  <div className="aside-card aside-highlight">
                    <div className="aside-spark">
                      <Sparkles size={18} />
                    </div>

                    <h3>Match with your reality</h3>
                    <p>
                      Your profile and budget help you compare options. Missing
                      data stays visible—no made-up admission promises.
                    </p>

                    <button
                      className="button button-primary full"
                      onClick={() => setModal('onboarding')}
                    >
                      Update my profile
                    </button>
                  </div>

                  <div className="aside-card">
                    <h3>Scholarships to explore</h3>
                    <p className="muted-small">
                      Demo placeholders only. Confirm actual awards and
                      eligibility before relying on them.
                    </p>

                    {scholarships.map((s) => (
                      <div className="scholar-mini" key={s.id}>
                        <div className="scholar-mini-icon">
                          <GraduationCap size={16} />
                        </div>

                        <div>
                          <strong>{s.name}</strong>
                          <span>
                            {s.country} · {s.coverage}
                          </span>
                        </div>

                        <button
                          className={`save-mini ${
                            shortlist.includes(s.id) ? 'saved' : ''
                          }`}
                          onClick={() => toggleSave(s.id)}
                          aria-label="Save scholarship"
                        >
                          <Bookmark
                            size={15}
                            fill={
                              shortlist.includes(s.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          )}

          {tab === 'My Budget' && (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <Wallet size={14} /> AFFORDABILITY FIRST
                  </div>
                  <h1>Make the numbers clearer.</h1>
                  <p className="page-subtitle">
                    Compare estimated annual and full-program costs. Change the
                    assumptions to fit your situation.
                  </p>
                </div>
              </div>

              <div className="calculator-layout">
                <section className="panel calculator-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">COST SCENARIO</span>
                      <h2>Build your estimate</h2>
                    </div>
                    <span className="estimate-pill">Estimate only</span>
                  </div>

                  <div className="form-grid">
                    <Field label="Program to estimate">
                      <select value={firstProgram?.id ?? ''} onChange={() => {}} disabled>
                        <option>
                          {firstProgram ? `${firstProgram.program} · ${firstProgram.university}` : 'No programs available yet'}
                        </option>
                      </select>
                      <small>
                        Demo: calculator currently uses the featured catalogue
                        program.
                      </small>
                    </Field>

                    <Field label="Comparison currency">
                      <select
                        value={budgetCurrency}
                        onChange={(e) => setBudgetCurrency(e.target.value)}
                      >
                        {['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'INR'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <small>
                        Demo values are not converted automatically. Use one
                        currency consistently.
                      </small>
                    </Field>

                    <Field label={`Annual living costs (${budgetCurrency})`}>
                      <input
                        type="number"
                        min="0"
                        value={living}
                        onChange={(e) =>
                          setLiving(Math.max(0, Number(e.target.value)))
                        }
                      />
                    </Field>

                    <Field label={`One-time costs (${budgetCurrency})`}>
                      <input
                        type="number"
                        min="0"
                        value={oneTime}
                        onChange={(e) =>
                          setOneTime(Math.max(0, Number(e.target.value)))
                        }
                      />
                    </Field>

                    <Field
                      label={`Confirmed scholarship (${budgetCurrency}/year)`}
                    >
                      <input
                        type="number"
                        min="0"
                        value={scholarship}
                        onChange={(e) =>
                          setScholarship(Math.max(0, Number(e.target.value)))
                        }
                      />
                      <small>
                        Only enter funding that has actually been confirmed.
                      </small>
                    </Field>

                    <Field
                      label={`Your available annual budget (${budgetCurrency})`}
                    >
                      <input
                        type="number"
                        min="0"
                        value={profile.budget}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            budget: Math.max(0, Number(e.target.value)),
                            budgetCurrency
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="calculator-note">
                    <CircleHelp size={16} />
                    <p>
                      For this prototype, tuition is displayed from the demo
                      catalogue. Costs and exchange rates must be verified and
                      set to the same currency before using this for a real
                      decision.
                    </p>
                  </div>
                </section>

                <section className="panel results-panel">
                  <span className="section-kicker">YOUR ESTIMATE</span>
                  <h2>Cost breakdown</h2>

                  <div className="result-big">
                    <span>Estimated first-year cost</span>
                    <strong>
                      {fmt(
                        Math.max(
                          0,
                          (firstProgram?.tuition ?? 0) + living - scholarship
                        ),
                        budgetCurrency
                      )}
                    </strong>
                  </div>

                  <div className="result-line">
                    <span>
                      Tuition / year <i>Demo value</i>
                    </span>
                    <strong>
                      {fmt((firstProgram?.tuition ?? 0), budgetCurrency)}
                    </strong>
                  </div>

                  <div className="result-line">
                    <span>Living costs</span>
                    <strong>{fmt(living, budgetCurrency)}</strong>
                  </div>

                  <div className="result-line">
                    <span>Confirmed scholarship / year</span>
                    <strong className="green">
                      −{fmt(scholarship, budgetCurrency)}
                    </strong>
                  </div>

                  <div className="result-line">
                    <span>One-time costs</span>
                    <strong>{fmt(oneTime, budgetCurrency)}</strong>
                  </div>

                  <div className="result-line">
                    <span>Estimated full-program cost</span>
                    <strong>
                      {fmt(
                        Math.max(
                          0,
                          ((firstProgram?.tuition ?? 0) + living - scholarship) *
                            (firstProgram?.duration ?? 1) +
                            oneTime
                        ),
                        budgetCurrency
                      )}
                    </strong>
                  </div>

                  <div
                    className={`verdict ${
                      Math.max(
                        0,
                        (firstProgram?.tuition ?? 0) + living - scholarship
                      ) <= profile.budget
                        ? 'verdict-good'
                        : (firstProgram?.tuition ?? 0) +
                            living -
                            scholarship -
                            profile.budget <=
                          3000
                          ? 'verdict-warn'
                          : 'verdict-gap'
                    }`}
                  >
                    <div className="verdict-icon">
                      <CircleDollarSign size={20} />
                    </div>

                    <div>
                      <strong>
                        {Math.max(
                          0,
                          (firstProgram?.tuition ?? 0) + living - scholarship
                        ) <= profile.budget
                          ? 'Within your stated budget'
                          : (firstProgram?.tuition ?? 0) +
                              living -
                              scholarship -
                              profile.budget <=
                            3000
                            ? 'Small funding gap'
                            : 'Funding gap to plan for'}
                      </strong>

                      <p>
                        {Math.max(
                          0,
                          (firstProgram?.tuition ?? 0) +
                            living -
                            scholarship -
                            profile.budget
                        ) === 0
                          ? 'Your stated annual budget covers this estimate.'
                          : `Estimated gap: ${fmt(
                              Math.max(
                                0,
                                (firstProgram?.tuition ?? 0) +
                                  living -
                                  scholarship -
                                  profile.budget
                              ),
                              budgetCurrency
                            )} per year, before other funding.`}
                      </p>
                    </div>
                  </div>

                  <button
                    className="button button-primary full"
                    onClick={() => go('Shortlist')}
                  >
                    Compare my shortlist <ArrowRight size={16} />
                  </button>

                  <p className="fine-print">
                    No exchange-rate conversion is applied in this demo. Do
                    not use placeholder tuition or costs as verified figures.
                  </p>
                </section>
              </div>
            </>
          )}

          {tab === 'Shortlist' && (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <Bookmark size={14} /> YOUR SAVED OPTIONS
                  </div>
                  <h1>Your shortlist</h1>
                  <p className="page-subtitle">
                    Keep your options together and compare them before you
                    decide.
                  </p>
                </div>

                <button
                  className="button button-primary"
                  onClick={() => go('Explore')}
                >
                  Find more options <Plus size={16} />
                </button>
              </div>

              <div className="shortlist-summary">
                <div>
                  <span>Saved programs</span>
                  <strong>{shortlistedPrograms.length}</strong>
                </div>
                <div>
                  <span>Saved scholarships</span>
                  <strong>{shortlistedScholarships.length}</strong>
                </div>
                <div>
                  <span>Next step</span>
                  <strong className="summary-next">
                    Compare costs <ArrowRight size={15} />
                  </strong>
                </div>
              </div>

              <h2 className="subsection-title">Programs & universities</h2>

              {shortlistedPrograms.length ? (
                <div className="catalogue-list">
                  {shortlistedPrograms.map((p) => (
                    <ProgramCard
                      key={p.id}
                      p={p}
                      saved
                      onSave={() => toggleSave(p.id)}
                      onOpen={() => {
                        setQuery(p.program);
                        go('Explore');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Empty
                  title="Your shortlist is waiting"
                  copy="Save programs from Explore to compare them here."
                  action="Explore programs"
                  onClick={() => go('Explore')}
                />
              )}

              <h2 className="subsection-title section-gap">
                Scholarships & funding
              </h2>

              {shortlistedScholarships.length ? (
                <div className="scholarship-grid">
                  {shortlistedScholarships.map((s) => (
                    <div className="panel scholarship-card" key={s.id}>
                      <div className="scholarship-card-top">
                        <div className="scholarship-icon">
                          <GraduationCap size={19} />
                        </div>
                        <button
                          className="icon-btn"
                          onClick={() => toggleSave(s.id)}
                          aria-label="Remove scholarship"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <h3>{s.name}</h3>
                      <p>
                        {s.provider} · {s.country}
                      </p>
                      <div className="coverage">{s.coverage}</div>
                      <div className="placeholder-warning">
                        <CircleHelp size={14} />
                        {s.verified}
                      </div>
                      <a href={s.source} target="_blank" rel="noreferrer">
                        Check official source <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  title="No funding saved yet"
                  copy="Explore funding options and save the ones you want to check."
                  action="Explore opportunities"
                  onClick={() => go('Explore')}
                />
              )}
            </>
          )}

          {tab === 'Applications' && (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <FileText size={14} /> YOUR APPLICATION WORKSPACE
                  </div>
                  <h1>Keep every application moving.</h1>
                  <p className="page-subtitle">
                    Track statuses, key dates and the small tasks that add up
                    to a complete application.
                  </p>
                </div>

                <button
                  className="button button-primary"
                  onClick={() => setModal('newApp')}
                >
                  <Plus size={16} /> Add application
                </button>
              </div>

              <div className="application-summary">
                <div>
                  <span>All applications</span>
                  <strong>{apps.length}</strong>
                </div>
                <div>
                  <span>In progress</span>
                  <strong>{activeApps.length}</strong>
                </div>
                <div>
                  <span>Tasks remaining</span>
                  <strong>
                    {allTasks.filter((t) => !taskDone.includes(t.key)).length}
                  </strong>
                </div>
              </div>

              <div className="panel applications-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">APPLICATION PIPELINE</span>
                    <h2>Applications by deadline</h2>
                  </div>

                  <span className="soft-badge">
                    <Clock3 size={13} /> Nearest first
                  </span>
                </div>

                {apps.length ? (
                  apps
                    .slice()
                    .sort((a, b) => a.deadline.localeCompare(b.deadline))
                    .map((a) => {
                      const p = programs.find((x) => x.id === a.programId);

                      return (
                        <div className="application-card" key={a.id}>
                          <div className="application-logo">
                            <GraduationCap size={22} />
                          </div>

                          <div className="application-main">
                            <div className="application-title-row">
                              <div>
                                <h3>{p?.program || 'Program'}</h3>
                                <p>
                                  {p?.university} · {p?.country}
                                </p>
                              </div>

                              <span
                                className={`status-pill ${a.status
                                  .toLowerCase()
                                  .replaceAll(' ', '-')}`}
                              >
                                {a.status}
                              </span>
                            </div>

                            <div className="application-meta">
                              <span>
                                <CalendarDays size={14} /> Deadline:{' '}
                                {new Date(
                                  a.deadline + 'T12:00:00'
                                ).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}{' '}
                                <small>(verify date)</small>
                              </span>

                              <span>
                                <CheckCircle2 size={14} />{' '}
                                {
                                  a.tasks.filter((t) =>
                                    taskDone.includes(`${a.id}-${t}`)
                                  ).length
                                }
                                /{a.tasks.length} tasks complete
                              </span>
                            </div>

                            <div className="application-tasks">
                              {a.tasks.map((t) => (
                                <label key={t} className="mini-task">
                                  <input
                                    type="checkbox"
                                    checked={taskDone.includes(`${a.id}-${t}`)}
                                    onChange={(e) =>
                                      setTaskDone((old) =>
                                        e.target.checked
                                          ? [...old, `${a.id}-${t}`]
                                          : old.filter(
                                              (x) => x !== `${a.id}-${t}`
                                            )
                                      )
                                    }
                                  />
                                  <span>{t}</span>
                                </label>
                              ))}
                            </div>

                            <div className="application-actions">
                              <label>
                                Update status
                                <select
                                  value={a.status}
                                  onChange={(e) =>
                                    changeStatus(a.id, e.target.value)
                                  }
                                >
                                  {[
                                    'Interested',
                                    'Preparing',
                                    'Ready to submit',
                                    'Submitted',
                                    'Decision received',
                                    'Accepted',
                                    'Rejected',
                                    'Withdrawn'
                                  ].map((s) => (
                                    <option key={s}>{s}</option>
                                  ))}
                                </select>
                              </label>

                              <button
                                className="text-button"
                                onClick={() => {
                                  setApps((old) =>
                                    old.filter((x) => x.id !== a.id)
                                  );
                                  setTaskDone((old) =>
                                    old.filter((x) => !x.startsWith(`${a.id}-`))
                                  );
                                }}
                              >
                                Remove application
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <Empty
                    title="Your application tracker is empty"
                    copy="Add an application from a saved program to start organizing your next steps."
                    action="Explore programs"
                    onClick={() => go('Explore')}
                  />
                )}
              </div>

              <div className="notice-card">
                <Bell size={18} />
                <div>
                  <strong>Deadline reminders</strong>
                  <p>
                    Email reminders are part of the planned MVP, but they are
                    not connected in this local demo. Dates shown here should
                    be confirmed with official university pages.
                  </p>
                </div>
              </div>
            </>
          )}

          {tab === 'Profile & settings' && (
            <>
              <div className="page-title-row">
                <div>
                  <div className="eyebrow">
                    <Settings2 size={14} /> YOUR DETAILS
                  </div>
                  <h1>Your profile & settings</h1>
                  <p className="page-subtitle">
                    Keep your academic goals, destinations and budget up to
                    date.
                  </p>
                </div>
              </div>

              <div className="settings-layout">
                <section className="panel settings-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">STUDENT PROFILE</span>
                      <h2>Your study-abroad goals</h2>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setModal('onboarding')}
                    >
                      Edit profile <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="profile-detail-grid">
                    <Detail label="First name" value={profile.firstName} />
                    <Detail
                      label="Country of residence"
                      value={profile.residence}
                    />
                    <Detail label="Nationality" value={profile.nationality} />
                    <Detail label="Intended level" value={profile.level} />
                    <Detail label="Field of study" value={profile.field} />
                    <Detail label="Academic result" value={profile.grade} />
                    <Detail label="Target intake" value={profile.intake} />
                    <Detail
                      label="Funding preference"
                      value={profile.funding}
                    />
                  </div>

                  <div className="settings-budget">
                    <span>Annual budget</span>
                    <strong>
                      {fmt(profile.budget, profile.budgetCurrency)}
                    </strong>
                  </div>

                  <div className="destinations-row">
                    <span>Preferred destinations</span>
                    <div>
                      {profile.destinations.map((d) => (
                        <span className="destination-chip" key={d}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="panel plan-panel">
                  <span className="section-kicker">YOUR SUBSCRIPTION</span>

                  <div className="plan-name-row">
                    <div>
                      <h2>{plan} plan</h2>
                      <p>
                        {plan === 'Free'
                          ? 'Your journey starts here.'
                          : plan === 'Standard'
                            ? 'More tools for your application journey.'
                            : 'Expanded guidance for your next chapter.'}
                      </p>
                    </div>

                    <span className="plan-symbol">
                      <Sparkles size={20} />
                    </span>
                  </div>

                  <div className="plan-feature">
                    <Check size={15} /> Profile and opportunity discovery
                  </div>
                  <div className="plan-feature">
                    <Check size={15} /> Local demo data and saved progress
                  </div>
                  <div className="plan-feature">
                    <LockKeyhole size={15} /> Real payments not connected
                  </div>

                  <button
                    className="button button-primary full"
                    onClick={() => setModal('plans')}
                  >
                    {plan === 'Free' ? 'Compare paid plans' : 'Manage plan'}{' '}
                    <ArrowRight size={15} />
                  </button>

                  <p className="fine-print">
                    Demo plan switching only; no payment is collected.
                  </p>
                </section>
              </div>
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>
            ScholarAI <span className="footer-dot">·</span> Make your next step
            clearer.
          </span>
          <span>
            <ShieldCheck size={13} /> Estimates and demo records require
            official verification.
          </span>
        </footer>
      </main>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {modal === 'onboarding' && (
        <Modal
          title="Personalise your study plan"
          subtitle="A few details help us make your options more relevant."
          onClose={() => {
            setModal(null);
            setOnboardingStep(0);
          }}
        >
          <div className="wizard-progress">
            <i style={{ width: `${((onboardingStep + 1) / 3) * 100}%` }} />
          </div>

          {onboardingStep === 0 ? (
            <div className="modal-form">
              <Field label="What should we call you?">
                <input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                  placeholder="First name"
                />
              </Field>

              <div className="form-grid">
                <Field label="Country of residence">
                  <input
                    value={profile.residence}
                    onChange={(e) =>
                      setProfile({ ...profile, residence: e.target.value })
                    }
                  />
                </Field>

                <Field label="Nationality">
                  <input
                    value={profile.nationality}
                    onChange={(e) =>
                      setProfile({ ...profile, nationality: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="What do you want to study?">
                <input
                  value={profile.field}
                  onChange={(e) =>
                    setProfile({ ...profile, field: e.target.value })
                  }
                />
              </Field>
            </div>
          ) : onboardingStep === 1 ? (
            <div className="modal-form">
              <Field label="Intended study level">
                <select
                  value={profile.level}
                  onChange={(e) =>
                    setProfile({ ...profile, level: e.target.value })
                  }
                >
                  <option>Bachelor's</option>
                  <option>Master's</option>
                  <option>PhD</option>
                  <option>Diploma / other</option>
                </select>
              </Field>

              <Field label="Academic result (keep your own grading scale)">
                <input
                  value={profile.grade}
                  onChange={(e) =>
                    setProfile({ ...profile, grade: e.target.value })
                  }
                  placeholder="e.g. 82%, GPA 3.4, unknown"
                />
              </Field>

              <Field label="Target intake">
                <select
                  value={profile.intake}
                  onChange={(e) =>
                    setProfile({ ...profile, intake: e.target.value })
                  }
                >
                  <option>September 2027</option>
                  <option>February 2027</option>
                  <option>September 2028</option>
                  <option>Flexible</option>
                </select>
              </Field>

              <Field label="Funding preference">
                <select
                  value={profile.funding}
                  onChange={(e) =>
                    setProfile({ ...profile, funding: e.target.value })
                  }
                >
                  <option>Scholarship + family</option>
                  <option>Scholarship</option>
                  <option>Family</option>
                  <option>Savings</option>
                  <option>Education loan</option>
                  <option>Mixed</option>
                  <option>Undecided</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="modal-form">
              <Field label="Annual budget (in your selected currency)">
                <input
                  type="number"
                  min="0"
                  value={profile.budget}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      budget: Math.max(0, Number(e.target.value))
                    })
                  }
                />
              </Field>

              <Field label="Budget currency">
                <select
                  value={profile.budgetCurrency}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      budgetCurrency: e.target.value
                    })
                  }
                >
                  {[
                    'USD',
                    'EUR',
                    'GBP',
                    'CAD',
                    'AUD',
                    'INR',
                    'NGN',
                    'PKR',
                    'BDT'
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred destinations (select multiple)">
                <div className="destination-options">
                  {[
                    'Germany',
                    'United Kingdom',
                    'Canada',
                    'Australia',
                    'Ireland',
                    'Netherlands'
                  ].map((d) => (
                    <button
                      key={d}
                      className={`destination-option ${
                        profile.destinations.includes(d) ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          destinations: profile.destinations.includes(d)
                            ? profile.destinations.filter((x) => x !== d)
                            : [...profile.destinations, d]
                        })
                      }
                    >
                      {profile.destinations.includes(d) && (
                        <Check size={13} />
                      )}{' '}
                      {d}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="preview-result">
                <Sparkles size={18} />
                <div>
                  <strong>Your first planning profile is ready</strong>
                  <p>
                    We’ll use these details to organize discovery and
                    affordability. Catalogue matches in this demo are
                    illustrative, not verified recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="button button-secondary"
              onClick={() =>
                onboardingStep === 0
                  ? setModal(null)
                  : setOnboardingStep((s) => s - 1)
              }
            >
              {onboardingStep === 0 ? 'Cancel' : 'Back'}
            </button>

            {onboardingStep < 2 ? (
              <button
                className="button button-primary"
                onClick={() => setOnboardingStep((s) => s + 1)}
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="button button-primary"
                onClick={() => {
                  setModal(null);
                  setOnboardingStep(0);
                  setNotice('Your demo profile has been saved.');
                  setTimeout(() => setNotice(''), 2200);
                }}
              >
                Save my profile <Check size={15} />
              </button>
            )}
          </div>
        </Modal>
      )}

      {modal === 'plans' && (
        <Modal
          title="Choose the support you need"
          subtitle="Compare the proposed plans. Checkout is not connected in this MVP demo."
          onClose={() => setModal(null)}
          wide
        >
          <div className="pricing-grid">
            <PricingCard
              name="Free"
              price="$0"
              description="Explore what may be possible."
              features={[
                'Basic profile and discovery',
                'Shortlist up to 5 items',
                'One tracked application',
                'Basic cost estimate'
              ]}
              active={plan === 'Free'}
              onChoose={() => {
                setPlan('Free');
                setModal(null);
                setNotice('Demo plan set to Free');
                setTimeout(() => setNotice(''), 2000);
              }}
            />

            <PricingCard
              name="Standard"
              price="$9.99"
              suffix="/ month"
              description="For students actively preparing."
              features={[
                'Unlimited shortlist',
                'Full cost comparisons',
                'Unlimited application tracking',
                'Deadline-based action plan',
                'Email reminders (planned)'
              ]}
              active={plan === 'Standard'}
              onChoose={() => {
                setPlan('Standard');
                setModal(null);
                setNotice('Demo plan switched to Standard. No payment taken.');
                setTimeout(() => setNotice(''), 2500);
              }}
            />

            <PricingCard
              name="Premium"
              price="$19.99"
              suffix="/ month"
              description="For deeper planning support."
              features={[
                'Everything in Standard',
                'Advanced planning tools',
                'Proof-of-funds planner (planned)',
                'Priority data requests (planned)'
              ]}
              active={plan === 'Premium'}
              onChoose={() => {
                setPlan('Premium');
                setModal(null);
                setNotice('Demo plan switched to Premium. No payment taken.');
                setTimeout(() => setNotice(''), 2500);
              }}
            />
          </div>

          <p className="pricing-note">
            <LockKeyhole size={14} /> These buttons change the local demo plan
            only. They do not start a subscription or collect payment.
          </p>
        </Modal>
      )}

      {modal === 'newApp' && (
        <Modal
          title="Add an application"
          subtitle="Create a tracking card for a program you’re considering."
          onClose={() => setModal(null)}
        >
          <div className="modal-form">
            <Field label="University & program">
              <select
                value={newAppProgram}
                onChange={(e) => setNewAppProgram(e.target.value)}
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.university} — {p.program}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Application deadline">
              <input
                type="date"
                value={newAppDeadline}
                onChange={(e) => setNewAppDeadline(e.target.value)}
              />
              <small>
                Demo date—verify the official deadline before relying on it.
              </small>
            </Field>
          </div>

          <div className="modal-actions">
            <button
              className="button button-secondary"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>

            <button
              className="button button-primary"
              onClick={createApplication}
            >
              Create application <Plus size={15} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  note
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-dot" />
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || 'Not provided'}</strong>
    </div>
  );
}

function Empty({
  title,
  copy,
  action,
  onClick
}: {
  title: string;
  copy: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Bookmark size={22} />
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <button className="button button-secondary" onClick={onClick}>
        {action} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function ProgramCard({
  p,
  saved,
  onSave,
  onOpen,
  compact = false
}: {
  p: Program;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`program-card ${
        compact ? 'program-card-compact' : ''
      }`}
    >
      <div className="program-monogram">
        <GraduationCap size={21} />
      </div>

      <div className="program-card-content">
        <div className="program-topline">
          <span className="program-country">{p.country}</span>
          <span className="match-pill">
            <span /> Requirements need checking
          </span>
        </div>

        <h3>{p.program}</h3>
        <p className="program-university">
          {p.university} <span>·</span> {p.city}
        </p>

        <div className="program-meta">
          <span>
            <BriefcaseBusiness size={14} />
            {p.level}
          </span>

          <span>
            <Wallet size={14} />
            {fmt(p.tuition, p.currency)} <small>{p.tuitionPeriod}</small>
          </span>

          <span>
            <CalendarDays size={14} />
            {p.intake}
          </span>
        </div>

        <div className="program-bottom">
          <span className="verification">
            <ShieldCheck size={13} />
            {p.verified}
          </span>

          <div className="program-actions">
            <button
              className={`save-button ${saved ? 'is-saved' : ''}`}
              onClick={onSave}
            >
              <Bookmark
                size={15}
                fill={saved ? 'currentColor' : 'none'}
              />
              {saved ? 'Saved' : 'Save'}
            </button>

            <button className="details-button" onClick={onOpen}>
              View details <ArrowRight size={14} />
            </button>

            <a
              className="source-link"
              href={p.source}
              target="_blank"
              rel="noreferrer"
              aria-label="Open official source"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  suffix,
  description,
  features,
  active,
  onChoose
}: {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  features: string[];
  active: boolean;
  onChoose: () => void;
}) {
  return (
    <div
      className={`pricing-card ${
        name === 'Standard' ? 'pricing-featured' : ''
      }`}
    >
      <div className="pricing-card-head">
        <span>{name}</span>
        {active && <span className="current-label">CURRENT</span>}
        {name === 'Standard' && !active && (
          <span className="popular-label">MOST POPULAR</span>
        )}
      </div>

      <div className="price-line">
        <strong>{price}</strong>
        {suffix && <span>{suffix}</span>}
      </div>

      <p>{description}</p>

      <div className="pricing-features">
        {features.map((f) => (
          <div key={f}>
            <Check size={15} />
            <span>{f}</span>
          </div>
        ))}
      </div>

      <button
        className={`button ${
          active ? 'button-secondary' : 'button-primary'
        } full`}
        onClick={onChoose}
      >
        {active ? 'Current demo plan' : `Select ${name}`}
        {!active && <ArrowRight size={14} />}
      </button>
    </div>
  );
}