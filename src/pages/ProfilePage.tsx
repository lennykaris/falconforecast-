import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker } from '../components/AvatarPicker';
import { updateProfileDetails } from '../lib/profile';

export const ProfilePage: React.FC = () => {
  const { user, isLoggedIn, isVip, isAdmin, isTipster, logout, updatePassword, refetchUser } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // ── Edit Profile (name / bio) ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [bioDraft, setBioDraft] = useState(user?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const openEditProfile = () => {
    setNameDraft(user?.name || '');
    setBioDraft(user?.bio || '');
    setProfileError(null);
    setProfileSaved(false);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !nameDraft.trim()) return;
    setProfileSaving(true);
    setProfileError(null);
    const { error } = await updateProfileDetails(user.id, { name: nameDraft.trim(), bio: bioDraft.trim() });
    setProfileSaving(false);
    if (error) {
      setProfileError(error);
      return;
    }
    await refetchUser();
    setIsEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // ── Change Password ──
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordSaving(true);
    const { error } = await updatePassword(newPassword);
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

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

        {profileSaved && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Profile updated.
          </div>
        )}
        {passwordSaved && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#059669' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Password changed.
          </div>
        )}

        {/* Account info + Edit Profile — name and bio are self-editable; bio shows on the
            tipster marketplace card too, so anyone considering becoming a tipster benefits
            from filling it in early. */}
        <div className="rounded-2xl p-6 bet-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Account</h2>
            {!isEditingProfile && (
              <button
                onClick={openEditProfile}
                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}
              >
                <Pencil className="w-3 h-3" /> Edit Profile
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Display Name</label>
                <input
                  type="text"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  maxLength={60}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Bio {isTipster && <span className="normal-case font-normal">— shown on your tipster profile</span>}
                </label>
                <textarea
                  value={bioDraft}
                  onChange={e => setBioDraft(e.target.value)}
                  maxLength={280}
                  rows={3}
                  placeholder="Tell subscribers a bit about your approach..."
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none resize-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <div className="text-[10px] text-right mt-0.5" style={{ color: 'var(--text-muted)' }}>{bioDraft.length}/280</div>
              </div>

              {profileError && (
                <p className="text-xs font-semibold" style={{ color: '#e11d48' }}>{profileError}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving || !nameDraft.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-slate-950 transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {profileSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
              {user.bio && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Bio</div>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tipster record — win rate/tips only mean something once they're an actual tipster;
            hidden entirely otherwise rather than showing a confusing 0% to a regular user. */}
        {isTipster && (
          <div className="rounded-2xl p-6 bet-card space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Trophy className="w-4 h-4" style={{ color: 'var(--brand)' }} /> Tipster Record
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Win Rate</div>
                <div className="text-lg font-black mt-1" style={{ color: 'var(--brand)' }}>{user.winRate ?? 0}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Record</div>
                <div className="text-lg font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: '#059669' }}>{user.tipsWon ?? 0}W</span>{' – '}<span style={{ color: '#e11d48' }}>{user.tipsLost ?? 0}L</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Subscribers</div>
                <div className="text-lg font-black mt-1" style={{ color: 'var(--text-primary)' }}>{user.subscribersCount ?? 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        <div className="rounded-2xl p-6 bet-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <KeyRound className="w-4 h-4" style={{ color: 'var(--brand)' }} /> Security
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => { setIsChangingPassword(true); setPasswordError(null); }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-transparent focus:outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {passwordError && (
                <p className="text-xs font-semibold" style={{ color: '#e11d48' }}>{passwordError}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving || !newPassword || !confirmPassword}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-slate-950 transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {passwordSaving ? 'Saving…' : 'Update Password'}
                </button>
                <button
                  onClick={() => { setIsChangingPassword(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(null); }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>••••••••</p>
          )}
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
