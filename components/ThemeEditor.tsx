'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateTheme } from '@/app/actions';

const presets = [
  {
    name: 'Sakura Love',
    primaryColor: '#f43f5e',
    secondaryColor: '#818cf8',
    backgroundColor: '#fff1f2',
    textColor: '#1e293b',
    textMutedColor: '#64748b',
    fontFamily: 'HANDWRITING',
    borderRadius: '0.5rem',
  },
  {
    name: 'Midnight Talks',
    primaryColor: '#818cf8',
    secondaryColor: '#f43f5e',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    textMutedColor: '#94a3b8',
    fontFamily: 'SANS',
    borderRadius: '0.75rem',
  },
  {
    name: 'Golden Hour',
    primaryColor: '#f97316',
    secondaryColor: '#facc15',
    backgroundColor: '#fff7ed',
    textColor: '#431407',
    textMutedColor: '#78350f',
    fontFamily: 'SERIF',
    borderRadius: '1rem',
  },
  {
    name: 'Minimalist',
    primaryColor: '#171717',
    secondaryColor: '#525252',
    backgroundColor: '#ffffff',
    textColor: '#0a0a0a',
    textMutedColor: '#525252',
    fontFamily: 'MONO',
    borderRadius: '0px',
  },
];

export default function ThemeEditor() {
  const [currentTheme, setCurrentTheme] = useState(presets[0]);
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateTheme(currentTheme);
    setIsSaving(false);
    alert('Theme Saved!');
  };

  return (
    <div className="p-6 space-y-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-outfit">Theme Customizer</h2>
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode('presets')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'presets' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            Presets
          </button>
          <button onClick={() => setMode('custom')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
            Advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="space-y-6">
          {mode === 'presets' ? (
            <div className="grid grid-cols-2 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setCurrentTheme(preset)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${currentTheme.name === preset.name ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.backgroundColor }} />
                  </div>
                  <h3 className="font-semibold font-outfit">{preset.name}</h3>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Theme Name</label>
                <input type="text" value={currentTheme.name} onChange={(e) => setCurrentTheme({ ...currentTheme, name: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={currentTheme.primaryColor} onChange={(e) => setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <span className="text-sm font-mono text-slate-500">{currentTheme.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Background</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={currentTheme.backgroundColor} onChange={(e) => setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <span className="text-sm font-mono text-slate-500">{currentTheme.backgroundColor}</span>
                  </div>
                </div>
                {/* Add more color pickers as needed */}
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={currentTheme.textColor} onChange={(e) => setCurrentTheme({ ...currentTheme, textColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer border-0" />
                    <span className="text-sm font-mono text-slate-500">{currentTheme.textColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <select value={currentTheme.fontFamily} onChange={(e) => setCurrentTheme({ ...currentTheme, fontFamily: e.target.value })} className="w-full p-2 border rounded">
                  <option value="SANS">Sans Serif (Modern)</option>
                  <option value="SERIF">Serif (Elegant)</option>
                  <option value="MONO">Monospace (Code)</option>
                  <option value="HANDWRITING">Handwriting (Romantic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="4"
                  value={parseInt(currentTheme.borderRadius) * 16 || 8} // rough approx
                  onChange={(e) => setCurrentTheme({ ...currentTheme, borderRadius: `${e.target.value}px` })}
                  className="w-full"
                />
                <span className="text-xs text-slate-500">{currentTheme.borderRadius}</span>
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>

        {/* Right Column: Live Preview */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
          <motion.div
            className="w-full max-w-sm p-6 shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: currentTheme.backgroundColor,
              color: currentTheme.textColor,
              borderRadius: currentTheme.borderRadius,
              fontFamily: currentTheme.fontFamily === 'HANDWRITING' ? 'var(--font-dancing)' : currentTheme.fontFamily === 'SERIF' ? 'serif' : currentTheme.fontFamily === 'MONO' ? 'monospace' : 'var(--font-geist-sans)',
            }}
            animate={{
              backgroundColor: currentTheme.backgroundColor,
              color: currentTheme.textColor,
              borderRadius: currentTheme.borderRadius,
            }}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.primaryColor }}>
                <span className="text-white">❤️</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Preview Card</h4>
                <p className="text-sm opacity-70">Just for you</p>
              </div>
            </div>
            <p className="mb-6 opacity-80">This is how your components will look with the selected theme. Adjust the colors and radius to match your vibe.</p>
            <button
              className="w-full py-2 rounded font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: currentTheme.primaryColor,
                color: '#fff', // Assuming light text on primary for now
                borderRadius: currentTheme.borderRadius,
              }}>
              Call to Action
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
