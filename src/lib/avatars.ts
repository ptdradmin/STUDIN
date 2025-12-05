
'use client';

// A list of fun, varied avatar styles from DiceBear.
const avatarStyles = [
  'micah',
  'bottts',
  'adventurer',
  'fun-emoji',
  'lorelei',
  'notionists',
  'identicon',
  'initials',
];

/**
 * Selects a random avatar style from the predefined list.
 * @returns A string representing a random DiceBear avatar style.
 */
function getRandomAvatarStyle(): string {
  const randomIndex = Math.floor(Math.random() * avatarStyles.length);
  return avatarStyles[randomIndex];
}

/**
 * Generates a unique, stylized avatar URL for a new user.
 * @param seed - A unique string to seed the avatar generation (e.g., user ID or email).
 * @returns A full URL to a generated SVG avatar from DiceBear.
 */
export function generateAvatar(seed: string): string {
  const style = getRandomAvatarStyle();
  // We encode the seed to ensure it's URL-safe.
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}`;
}


/**
 * Generates fallback initials from a name or email.
 * @param name The string to generate initials from.
 * @returns A 2-character string of initials.
 */
export const getInitials = (name?: string | null) => {
    if (!name) return '..';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
