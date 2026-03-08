'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Define interface for memory
interface Memory {
  id: number | string;
  src: string;
  caption: string;
  date: string;
}

// Placeholder data
const defaultMemories: Memory[] = [
  { id: 1, src: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=2788&auto=format&fit=crop', caption: 'Our First Date', date: '2023-01-15' },
  { id: 2, src: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=2942&auto=format&fit=crop', caption: 'Beach Day', date: '2023-03-20' },
  { id: 3, src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2788&auto=format&fit=crop', caption: 'Stargazing', date: '2023-05-10' },
  { id: 4, src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2938&auto=format&fit=crop', caption: 'Coffee Runs', date: '2023-06-01' },
  { id: 5, src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=2788&auto=format&fit=crop', caption: 'Anniversary', date: '2024-01-15' },
  { id: 6, src: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=2788&auto=format&fit=crop', caption: 'Just Because', date: '2024-02-14' },
];

export default function MemoryGrid({ memories: propMemories }: { memories?: any[] }) {
  // Map Prisma data to component shape if needed
  const displayMemories: Memory[] =
    propMemories && propMemories.length > 0
      ? propMemories.map((m) => ({
          id: m.id,
          src: m.image_url || m.src, // Handle both DB and placeholder shape
          caption: m.caption || '',
          date: m.date ? new Date(m.date).toLocaleDateString() : '',
        }))
      : defaultMemories;

  const [selectedImage, setSelectedImage] = useState<Memory | null>(null);

  return (
    <section className="py-20 px-4 md:px-8 bg-rose-50 dark:bg-slate-950 transition-colors duration-500 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold font-outfit text-center mb-12 text-slate-800 dark:text-rose-50">Our Memory Lane</h2>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayMemories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-white/30 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800/50"
              style={{ perspective: 1000 }}
              onClick={() => setSelectedImage(memory)}>
              <div className="relative w-full h-auto">
                <Image
                  src={memory.src}
                  alt={memory.caption}
                  width={500}
                  height={300} // Aspect ratio handled by layout, but explicit dims good for Next.js
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-medium font-outfit">{memory.caption}</p>
                <p className="text-white/80 text-sm font-sans">{memory.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white hover:text-rose-400 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full h-auto max-h-[80vh] flex justify-center" onClick={(e) => e.stopPropagation()}>
              <Image src={selectedImage.src} alt={selectedImage.caption} width={1200} height={800} className="object-contain max-h-[80vh] rounded-lg shadow-2xl" />
            </motion.div>
            <div className="mt-4 text-center">
              <h3 className="text-2xl text-white font-dancing">{selectedImage.caption}</h3>
              <p className="text-gray-300">{selectedImage.date}</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
