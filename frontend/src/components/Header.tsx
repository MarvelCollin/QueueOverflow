import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full bg-gradient-to-r from-theme-bg-card/80 via-theme-accent-primary/5 to-theme-bg-card/80 
                 backdrop-blur-xl border-b border-theme-accent-primary/20 z-50"
    >
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center h-16 gap-8">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="p-2.5 rounded-xl text-theme-accent-primary hover:bg-theme-accent-primary/10 
                       transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>

            <motion.h1 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-theme-accent-primary via-theme-accent-blue 
                       to-theme-accent-secondary bg-clip-text text-transparent animate-gradient-x"
            >
              QueueOverflow
            </motion.h1>
          </div>
            
          <div className="hidden md:flex flex-1 relative group">
            <input
              type="search"
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-2.5 bg-theme-bg-primary/50 rounded-2xl
                       border border-theme-accent-primary/20 text-theme-text-primary
                       placeholder:text-theme-text-muted focus:border-theme-accent-primary/50
                       focus:bg-theme-bg-primary/80 focus:ring-2 focus:ring-theme-accent-primary/20
                       transition-all duration-300"
            />
            <div className="absolute left-4 top-3 text-theme-accent-primary/50 group-hover:text-theme-accent-primary
                         transition-colors duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-theme-accent-blue px-5 py-2 rounded-xl
                       border border-theme-accent-blue/30 hover:bg-theme-accent-blue/10
                       transition-all duration-300"
            >
              Log in
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                       hover:from-theme-accent-secondary hover:to-theme-accent-primary
                       text-white px-6 py-2 rounded-xl font-medium
                       shadow-lg shadow-theme-accent-primary/20 hover:shadow-theme-accent-primary/40
                       transition-all duration-300"
            >
              Sign up
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
