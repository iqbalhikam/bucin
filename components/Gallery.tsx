'use client';

import { motion } from 'framer-motion';

interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  date: Date;
}

interface GalleryProps {
  memories: Memory[];
}

export default function Gallery({ memories }: GalleryProps) {
  if (!memories.length) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Memories</h2>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-md">
              <img src={memory.image_url} alt={memory.caption || 'Memory'} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-medium">{memory.caption}</p>
                <p className="text-white/80 text-xs">{new Date(memory.date).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
