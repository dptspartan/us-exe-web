/** Display label from Supabase auth user (metadata name or email local-part). */
export function displayNameFromUser(user) {
  if (!user) return 'You';
  const meta = user.user_metadata || {};
  const fromMeta = meta.full_name || meta.name || meta.display_name;
  if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
  if (user.email) return user.email.split('@')[0];
  return 'You';
}

/** Partner label from optional couples nickname columns, else fallback. */
export function displayNameFromCouple(coupleProfile, partnerId) {
  console.log('coupleProfile', coupleProfile);
  console.log('partnerId', partnerId);
  if (!coupleProfile || !partnerId) return 'Partner';
  if (coupleProfile.partner_1_id === partnerId && coupleProfile.partner_1_name) {
    return coupleProfile.partner_1_name;
  }
  if (coupleProfile.partner_2_id === partnerId && coupleProfile.partner_2_name) {
    return coupleProfile.partner_2_name;
  }
  return 'Partner';
}
