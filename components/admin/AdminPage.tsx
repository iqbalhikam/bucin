'use client';

import { useState, type ElementType } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Save, Music, Image as ImageIcon, Settings, Palette } from 'lucide-react';
import { updateSiteConfig, updateThemeConfig, uploadMusic, setActiveMusic, uploadMemory, deleteMemory } from '@/app/actions';

interface SiteConfig {
  id?: string;
  hero_title?: string;
  partner_name?: string;
  anniversary_date?: string | Date;
  love_letter_content?: string;
}

interface ThemeConfig {
  id?: string;
  primary_color?: string;
  font_style?: string;
  is_dark_mode_default?: boolean;
}

interface Music {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
}

interface Memory {
  id: string;
  image_url: string;
  caption: string;
  date: string | Date;
}

interface AdminPageProps {
  siteConfig: SiteConfig;
  themeConfig: ThemeConfig;
  allMusic: Music[];
  memories: Memory[];
}

interface TabButtonProps {
  id: string;
  icon: ElementType;
  label: string;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }: TabButtonProps) => (
  <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === id ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
    <Icon size={18} />
    {label}
  </button>
);

export default function AdminPage({ siteConfig, themeConfig, allMusic, memories }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Manage your romantic website content.</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-8">
        <TabButton id="general" icon={Settings} label="General" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="theme" icon={Palette} label="Theme" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="music" icon={Music} label="Music" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="gallery" icon={ImageIcon} label="Gallery" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'general' && (
          <form
            action={async (formData) => {
              await updateSiteConfig(formData);
            }}
            className="space-y-6 max-w-xl">
            <input type="hidden" name="id" value={siteConfig?.id || ''} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input name="hero_title" defaultValue={siteConfig?.hero_title} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
              <input name="partner_name" defaultValue={siteConfig?.partner_name} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary Date</label>
              <input
                type="datetime-local"
                name="anniversary_date"
                defaultValue={siteConfig?.anniversary_date ? new Date(siteConfig.anniversary_date).toISOString().slice(0, 16) : ''}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Love Letter Content</label>
              <textarea name="love_letter_content" rows={6} defaultValue={siteConfig?.love_letter_content} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>

            <button type="submit" className="flex items-center gap-2 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">
              <Save size={18} /> Save Changes
            </button>
          </form>
        )}

        {activeTab === 'theme' && (
          <form
            action={async (formData) => {
              await updateThemeConfig(formData);
            }}
            className="space-y-6 max-w-xl">
            <input type="hidden" name="id" value={themeConfig?.id || ''} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" name="primary_color" defaultValue={themeConfig?.primary_color} className="h-10 w-20 p-1 rounded border" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Style</label>
              <select name="font_style" defaultValue={themeConfig?.font_style} className="w-full p-2 border rounded-md">
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_dark_mode_default" defaultChecked={themeConfig?.is_dark_mode_default} id="dark-mode" />
              <label htmlFor="dark-mode" className="text-sm font-medium text-gray-700">
                Dark Mode by Default
              </label>
            </div>

            <button type="submit" className="flex items-center gap-2 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">
              <Save size={18} /> Save Theme
            </button>
          </form>
        )}

        {activeTab === 'music' && (
          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <h3 className="font-medium mb-4">Upload New Music</h3>
              <form
                action={async (formData) => {
                  await uploadMusic(formData);
                }}
                className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input name="title" required className="w-full p-2 border rounded-md" placeholder="Song Title" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">File (MP3)</label>
                  <input type="file" name="file" accept="audio/*" required className="w-full text-sm" />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  <Upload size={18} />
                </button>
              </form>
            </div>

            <div>
              <h3 className="font-medium mb-4">Music Library</h3>
              <div className="space-y-2">
                {allMusic.map((music: Music) => (
                  <div key={music.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${music.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="font-medium">{music.title}</span>
                    </div>
                    <div className="flex gap-2">
                      {!music.is_active && (
                        <button onClick={() => setActiveMusic(music.id)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
                          Set Active
                        </button>
                      )}
                      <audio src={music.url} controls className="h-8 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <h3 className="font-medium mb-4">Upload Memory</h3>
              <form
                action={async (formData) => {
                  await uploadMemory(formData);
                }}
                className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Caption</label>
                    <input name="caption" className="w-full p-2 border rounded-md" placeholder="Moment description" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input type="date" name="date" required className="w-full p-2 border rounded-md" />
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Image</label>
                    <input type="file" name="file" accept="image/*" required className="w-full text-sm" />
                  </div>
                  <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 h-10 mt-5">
                    <Upload size={18} /> Upload
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {memories.map((memory: Memory) => (
                <div key={memory.id} className="relative group rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={memory.image_url} alt="" className="w-full h-32 object-cover" />
                  <button onClick={() => deleteMemory(memory.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                  <div className="p-2 text-xs text-gray-600 truncate">{memory.caption}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
