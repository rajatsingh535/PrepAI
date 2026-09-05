import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Sparkles, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Starter / Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with basic interview practice.',
    features: [
      'Up to 5 questions per AI session',
      'Basic technical & behavioral practice',
      'Standard question feedback',
      'Community support',
    ],
    popular: false,
    buttonText: 'Current Plan',
    buttonVariant: 'secondary',
  },
  {
    id: 'pro',
    name: 'PrepAI Pro',
    price: '$19',
    period: 'per month',
    description: 'Unlock full power with unlimited AI questions and live webcam audio feedback.',
    features: [
      'Unlimited questions per session (up to 20)',
      'Unlimited DSA & NeetCode 150 practice',
      'Live Web Audio level & video posture scoring',
      'Candidate approach breakdown & deep AI feedback',
      'Matched Jobs resume auto-match',
      'Priority AI response speeds',
    ],
    popular: true,
    badge: 'Most Popular',
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Team',
    price: '$49',
    period: 'per month',
    description: 'For teams, universities, and coaching institutes.',
    features: [
      'Everything in Pro plan',
      'Multi-user team dashboard & analytics',
      'Custom company job description uploads',
      'Dedicated support & API access',
    ],
    popular: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary',
  },
];

const FAQS = [
  {
    q: 'Can I upgrade or cancel anytime?',
    a: 'Yes! You can upgrade to Pro or cancel your subscription at any time directly from your profile settings.',
  },
  {
    q: 'How does live webcam & audio analysis work?',
    a: 'Our Web Audio API and real-time canvas engine analyze audio volume, speaking cadence, posture, and eye contact right inside your browser without uploading raw video anywhere.',
  },
  {
    q: 'Are DSA questions generated from NeetCode?',
    a: 'Yes! PrepAI generates NeetCode 150 & LeetCode style problems covering 12 core computer science topics with real code execution.',
  },
];

export default function PricingPage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = (planId) => {
    if (planId === 'free') {
      toast('You are currently on the Free plan');
      return;
    }
    setUpgrading(true);
    setTimeout(() => {
      updateUser({ isPremium: true });
      setUpgrading(false);
      toast.success('🎉 Welcome to PrepAI Pro! You now have unlimited access.');
      navigate('/interviews/new');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-10 animate-fade-in">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-warning text-xs font-semibold px-3 py-1">
          <Crown className="w-3.5 h-3.5 inline mr-1 text-amber-400" /> Flexible Pricing Plans
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Supercharge Your Interview Prep
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Master AI mock interviews, NeetCode DSA challenges, and webcam communication analysis.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = (plan.id === 'pro' && user?.isPremium) || (plan.id === 'free' && !user?.isPremium);

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative card p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-2 border-brand-500 shadow-glow bg-slate-900/90'
                  : 'border border-surface-border bg-slate-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-white/[0.06]">
                  <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-medium">/ {plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06]">
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgrading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                      ? 'btn-primary shadow-glow'
                      : 'btn-secondary'
                  }`}
                >
                  {isCurrent ? (
                    'Current Active Plan'
                  ) : plan.id === 'pro' ? (
                    <>
                      <Zap className="w-4 h-4" /> {plan.buttonText}
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="card p-8 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          <h3 className="text-lg font-display font-bold text-white">Frequently Asked Questions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FAQS.map(({ q, a }, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm font-semibold text-white">{q}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
