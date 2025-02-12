import { motion } from 'framer-motion';
import { HomeIcon, QuestionMarkCircleIcon, TagIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const menuItems = [
    { icon: HomeIcon, text: 'Home', badge: '' },
    { icon: QuestionMarkCircleIcon, text: 'Questions', badge: '23' },
    { icon: TagIcon, text: 'Tags', badge: '' },
    { icon: UserGroupIcon, text: 'Users', badge: '' },
    { icon: FireIcon, text: 'Trending', badge: '5' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isOpen ? 'auto' : '0px',
        opacity: isOpen ? 1 : 0
      }}
      className="fixed left-0 top-16 h-screen bg-gradient-to-b from-theme-bg-card/90 to-theme-bg-primary/90
                 backdrop-blur-xl border-r border-theme-accent-primary/20 overflow-hidden z-40"
    >
      <motion.div 
        className="w-64 p-4 space-y-2"
        initial={false}
        animate={{ x: isOpen ? 0 : -20 }}
      >
        {menuItems.map((item, index) => (
          <motion.a
            key={item.text}
            href="#"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl
                     text-theme-text-secondary hover:text-theme-text-primary
                     hover:bg-theme-accent-primary/10 transition-all duration-300 group"
          >
            <item.icon className="w-6 h-6 group-hover:text-theme-accent-primary transition-colors" />
            <span className="flex-1">{item.text}</span>
            {item.badge && (
              <span className="px-2 py-1 rounded-full text-xs bg-theme-accent-primary/20 
                           text-theme-accent-primary group-hover:bg-theme-accent-primary 
                           group-hover:text-white transition-colors">
                {item.badge}
              </span>
            )}
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
}
