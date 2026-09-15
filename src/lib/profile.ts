import { supabase } from './supabase';

/** Sets the current user's avatar to one of the preset picker options (see AvatarPicker) —
 * just a short generated-avatar URL, never an uploaded file, so this never grows the
 * database the way arbitrary image uploads would. RLS's "Users can update own basic profile"
 * policy already allows a self-update to avatar_url (it's not one of the pinned columns), so
 * no schema change was needed for this. */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
  if (error) return { error: error.message };
  return { error: null };
}
