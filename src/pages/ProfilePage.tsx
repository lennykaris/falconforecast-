import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Crown,
  LayoutDashboard,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker } from '../components/AvatarPicker';

export const ProfilePage: React.FC = () => {
  const { user, isLoggedIn, isVip, isAdmin, isTipster, logout } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-sm w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-black font-display" style={{ color: 'var(--text-primary)' }}>Your Profile</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Log in to view your profile.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-3.5 text-xs font-bold uppercase tracking-wider text-center text-slate-950 rounded-xl transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const joinedDate = user.subscribedAt
    ? new Date(user.subscribedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const quickLinks = [
    { to: '/dashboard', label: 'My Picks & Subscription', description: 'VIP predictions and billing', icon: LayoutDashboard, show: true },
    { to: '/tipster-dashboard', label: 'Tipster Panel', description: 'Manage your published tips', icon: Star, show: isTipster },
    { to: '/apply-tipster', label: 'Become a Tipster', description: 'Apply to publish your own tips', icon: Star, show: !isTipster && !isAdmin },
    { to: '/admin', label: 'Admin Panel', description: 'Platform management', icon: ShieldCheck, show: isAdmin },
    { to: '/tipsters', label: 'Browse Tipsters', description: 'Follow verified experts', icon: Users, show: true },
  ].filter(l => l.show);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-6 md:pt-24 pb-28 md:pb-16 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-5 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="relative w-16 h-16 rounded-full flex-shrink-0 group"
            title="Change avatar"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black"
                style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}
              >
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform" style={{ borderColor: 'var(--brand)' }}>
              <Pencil className="w-3 h-3" style={{ color: 'var(--brand)' }} />
            </span>
          </button>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display truncate" style={{ color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              {isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(139,92,246,0.14)', color: '#8b5cf6' }}>
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
              {isTipster && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.14)', color: '#d97706' }}>
                  <Star className="w-3 h-3" /> Tipster
                </span>
              )}
              {isVip && !isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="rounded-2xl p-6 bet-card space-y-4">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Plan</div>
              <div className="text-sm font-bold capitalize mt-1" style={{ color: 'var(--text-primary)' }}>
                {user.plan.replace(/_/g, ' ')}
              </div>
            </div>
            {joinedDate && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-3 h-3" /> Member since
                </div>
                <div className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{joinedDate}</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quick links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 rounded-xl p-4 bet-card transition-transform hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-light)' }}>
                  <link.icon className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{link.label}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{link.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>

      <AvatarPicker isOpen={avatarPickerOpen} onClose={() => setAvatarPickerOpen(false)} />
    </div>
  );
};
