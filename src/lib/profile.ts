import { supabase } from './supabase';

/** Sets the current user's avatar to one of the preset picker options (see AvatarPicker) —
 * just a short generated-avatar URL, never an uploaded file, so this never grows the
 * database the way arbitrary image uploads would. RLS's "Users can update own basic profile"
 * policy already allows a self-update to avatar_url (it's not one of the pinned columns), so
 * no schema change was needed for this.
 *
 * Chains `.select('id')` and checks the row actually came back — Supabase's `.update()`
 * reports `{error: null}` even when RLS silently matches zero rows, so without this check a
 * blocked write (e.g. a stale/expired session) looks identical to a real success. See the
 * same fix in TipstersContext's updateProfileRow for the admin-approval case this bit us on. */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<{ error: string | null }> {
  const { data, error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId).select('id');
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Avatar wasn't saved — please try logging in again." };
  return { error: null };
}

/** Updates the editable identity fields on the "Edit Profile" form — name and bio. Both are
 * allowed by RLS's self-update policy (only role/verified/plan/vip_expires_at/tipster_status
 * are pinned there), so no admin path is needed for this. */
export async function updateProfileDetails(
  userId: string,
  fields: { name: string; bio: string }
): Promise<{ error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ name: fields.name, bio: fields.bio })
    .eq('id', userId)
    .select('id');
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Profile wasn't saved — please try logging in again." };
  return { error: null };
}
