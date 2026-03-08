'use server';

import { revalidatePath } from 'next/cache';

// --- Static Data Definitions ---

const STATIC_SITE_CONFIG = {
  id: 'static-id',
  hero_title: 'Happy Anniversary!',
  partner_name: 'My Love',
  anniversary_date: new Date('2024-01-01'), // Ganti dengan tanggal anniversary Anda
  love_letter_content: 'Aku mencintaimu lebih dari apapun. Setiap momen bersamamu adalah anugerah terbesar dalam hidupku. Terima kasih sudah menjadi bagian dari ceritaku.',
};

const STATIC_THEME = {
  id: 'static-theme-id',
  isActive: true,
  name: 'Default Theme',
  primaryColor: '#f43f5e', // Rose-500
  secondaryColor: '#818cf8', // Indigo-400
  backgroundColor: '#fff1f2', // Rose-50
  textColor: '#1e293b', // Slate-800
  textMutedColor: '#64748b', // Slate-500
  fontFamily: 'SANS',
  borderRadius: '0.5rem',
};

const STATIC_MUSIC = [
  {
    id: 'music-1',
    title: 'Our Song',
    url: 'https://example.com/music.mp3', // Ganti dengan URL musik Anda (Supabase storage atau lainnya)
    is_active: true,
  },
];

const STATIC_MEMORIES = [
  {
    id: 'memory-1',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
    caption: 'Momen pertama kita tertawa bersama.',
    date: new Date('2024-02-14'),
  },
  {
    id: 'memory-2',
    image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    caption: 'Senja yang tak terlupakan.',
    date: new Date('2024-05-20'),
  },
  {
    id: 'memory-3',
    image_url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=80',
    caption: 'Terima kasih untuk segalanya.',
    date: new Date('2024-08-10'),
  },
];

// --- Theme Actions ---

export async function getTheme() {
  return STATIC_THEME;
}

export async function updateTheme(data: any) {
  console.log('Update theme: Database disabled, static mode active.');
  return { success: true };
}

// --- Data Fetching Actions ---

export async function getSiteConfig() {
  return STATIC_SITE_CONFIG;
}

export async function getThemeConfig() {
  return STATIC_THEME;
}

export async function getActiveMusic() {
  return STATIC_MUSIC.find((m) => m.is_active) || null;
}

export async function getAllMusic() {
  return STATIC_MUSIC;
}

export async function getMemories() {
  return STATIC_MEMORIES;
}

// --- Form Actions for AdminPage ---

export async function updateSiteConfig(formData: FormData) {
  console.log('Update site config: Database disabled, static mode active.');
  return { success: true };
}

export async function updateThemeConfig(formData: FormData) {
  console.log('Update theme config: Database disabled, static mode active.');
  return { success: true };
}

export async function uploadMusic(formData: FormData) {
  return { success: false, error: 'Database disabled' };
}

export async function setActiveMusic(id: string) {
  console.log('Set active music: Database disabled, static mode active.');
  return { success: true };
}

export async function uploadMemory(formData: FormData) {
  return { success: false, error: 'Database disabled' };
}

export async function deleteMemory(id: string) {
  console.log('Delete memory: Database disabled, static mode active.');
  return { success: true };
}
