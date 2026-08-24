import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus, 
  Moon, 
  Sun, 
  ArrowRight, 
  Command,
  TrendingUp,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import CreatorOSLogo from '../brand/CreatorOSLogo';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  openNewPostModal: () => void;
  onToggleTheme: () => void;
  currentTheme: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  openNewPostModal,
  onToggleTheme,
  currentTheme
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    {
      id: 'new-post',
      label: 'Draft & Schedule New Content',
      category: 'Creation',
      icon: Plus,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: 'PROD',
      perform: () => {
        onClose();
        openNewPostModal();
      }
    },
    {
      id: 'ai-strategy',
      label: 'Launch Gemini Viral Strategy Engine',
      category: 'Intelligence',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'AI',
      perform: () => {
        onClose();
        onNavigate('strategy');
      }
    },
    {
      id: 'ai-copilot',
      label: 'Chat with Nova Creator Copilot',
      category: 'Intelligence',
      icon: MessageSquare,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'LIVE',
      perform: () => {
        onClose();
        onNavigate('ai');
      }
    },
    {
      id: 'nav-dashboard',
      label: 'Jump to Studio Dashboard',
      category: 'Navigation',
      icon: TrendingUp,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      perform: () => {
        onClose();
        onNavigate('dashboard');
      }
    },
    {
      id: 'nav-calendar',
      label: 'Open Cross-Platform Calendar',
      category: 'Navigation',
      icon: Calendar,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      perform: () => {
        onClose();
        onNavigate('calendar');
      }
    },
    {
      id: 'nav-analytics',
      label: 'View Reach & Channel Analytics',
      category: 'Telemetry',
      icon: BarChart3,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      perform: () => {
        onClose();
        onNavigate('analytics');
      }
    },
    {
      id: 'nav-monetization',
      label: 'Inspect Income Streams & Deal Pipeline',
      category: 'Capital',
      icon: DollarSign,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      perform: () => {
        onClose();
        onNavigate('monetization');
      }
    },
    {
      id: 'nav-audience',
      label: 'Audience Demographics & Persona Matrix',
      category: 'Telemetry',
      icon: Users,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      perform: () => {
        onClose();
        onNavigate('audience');
      }
    },
    {
      id: 'theme-toggle',
      label: `Switch Theme to ${currentTheme === 'dark' ? 'Editorial Light' : 'Studio Noir Dark'}`,
      category: 'Preferences',
      icon: currentTheme === 'dark' ? Sun : Moon,
      color: 'text-zinc-300 bg-zinc-800 border-zinc-700',
      perform: () => {
        onToggleTheme();
      }
    },
    {
      id: 'nav-settings',
      label: 'Manage Connected Platforms & Cloud Profile',
      category: 'Preferences',
      icon: Settings,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
      perform: () => {
        onClose();
        onNavigate('settings');
      }
    }
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredActions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredActions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Spotlight Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            className="relative w-full max-w-xl bg-card border border-border/90 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col font-sans"
            onKeyDown={handleKeyDown}
          >
            {/* Header / Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/70 bg-muted/20">
              <CreatorOSLogo variant="mark" size="sm" />
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or jump to studio module..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
              />
              <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-[10px] font-mono font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Actions List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredActions.length > 0 ? (
                filteredActions.map((action, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      onClick={() => action.perform()}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-foreground border border-primary/20 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${action.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-foreground font-bold' : 'text-foreground/90'}`}>
                            {action.label}
                          </p>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            {action.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {action.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted border border-border/80 text-muted-foreground">
                            {action.badge}
                          </span>
                        )}
                        {isSelected && (
                          <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                  No matching studio commands found for "{query}"
                </div>
              )}
            </div>

            {/* Footer telemetry */}
            <div className="px-4 py-2 border-t border-border/60 bg-muted/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Use ↑ ↓ to navigate, Enter to select</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                CREATOR OS TELEMETRY
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
