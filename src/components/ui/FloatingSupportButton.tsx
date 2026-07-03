import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const FloatingSupportButton: React.FC = () => {
  return (
    <motion.a
      href="https://wa.me/2348081670463"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] text-white group"
    >
      <MessageCircle className="w-7 h-7" />

      {/* Subtle Glow Ring */}
      <span className="absolute inset-0 rounded-full border-4 border-[#25D366]/20 animate-ping pointer-events-none" />

      {/* Tooltip */}
      <span className="absolute right-16 bg-card border border-purple-primary/20 text-text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
        Support
      </span>
    </motion.a>
  );
};

export default FloatingSupportButton;
