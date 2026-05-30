import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Youtube, 
  Instagram, 
  Twitter, 
  Music,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { Post, Platform } from '@/src/types/index';

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  gumroad: CalendarIcon,
  convertkit: CalendarIcon,
  spotify: Music,
};

interface CreatorCalendarProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function CreatorCalendar({ posts, setPosts, openNewPostModal, showToast }: CreatorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeMenuPost, setActiveMenuPost] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => isSameDay(new Date(post.date), day));
  };

  const handleCreatePostForSelectedDate = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    openNewPostModal(undefined, undefined, formattedDate);
  };

  const handleDeletePost = (id: string, title: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setActiveMenuPost(null);
    showToast(`"${title}" deleted successfully.`, 'info');
  };

  const togglePostStatus = (id: string, currentStatus: 'draft' | 'scheduled' | 'published') => {
    const nextStatusMap: Record<'draft' | 'scheduled' | 'published', 'draft' | 'scheduled' | 'published'> = {
      draft: 'scheduled',
      scheduled: 'published',
      published: 'draft'
    };
    const nextStatus = nextStatusMap[currentStatus];
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    setActiveMenuPost(null);
    showToast(`Updated post status to ${nextStatus}.`);
  };

  return (
    <div className="space-y-8 pb-12 select-none text-left">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Content Calendar</h1>
          <p className="text-muted-foreground text-sm">Plan and manage your upcoming posts across all platforms.</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center bg-muted/40 rounded-full p-1 border border-border">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            </Button>
            <span className="px-4 font-semibold min-w-[130px] text-center text-xs text-zinc-800 dark:text-zinc-200">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            </Button>
          </div>
          <Button 
            onClick={handleCreatePostForSelectedDate}
            className="rounded-full gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-10 text-sm cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            Schedule Post
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3 p-6 rounded-3xl border-border/60 bg-muted/10">
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border/40 border border-border/40 rounded-2xl overflow-hidden shadow-2xl">
            {/* Padding for start of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square bg-muted/10" />
            ))}
            
            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={day.toString()} 
                  className={`aspect-square bg-card/60 p-2.5 relative cursor-pointer hover:bg-muted/30 transition-all ${
                    isSelected ? 'ring-2 ring-blue-50 z-10 bg-blue-500/[0.02]' : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isToday 
                      ? 'bg-blue-600 text-white font-bold' 
                      : isSelected 
                        ? 'text-blue-500' 
                        : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                    {dayPosts.map(post => {
                      const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || CalendarIcon;
                      return (
                        <div 
                          key={post.id} 
                          className={`w-2 h-2 rounded-full cursor-pointer hover:scale-125 transition-transform ${
                            post.platform === 'youtube' 
                              ? 'bg-[#FF0000]' 
                              : post.platform === 'instagram' 
                                ? 'bg-[#E4405F]' 
                                : post.platform === 'tiktok'
                                  ? 'bg-[#00F2FE]'
                                  : post.platform === 'twitter'
                                    ? 'bg-[#1DA1F2]'
                                    : post.platform === 'gumroad'
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                          }`}
                          title={post.title} 
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Day Details */}
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border-border/60 bg-muted/10">
            <h3 className="font-bold flex items-center justify-between border-b border-border/45 pb-3 mb-4 text-sm text-foreground font-display">
              <span>{format(selectedDate, 'EEEE, MMM d')}</span>
              <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10">
                {getPostsForDay(selectedDate).length} Posts
              </Badge>
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {getPostsForDay(selectedDate).length > 0 ? (
                getPostsForDay(selectedDate).map(post => {
                  const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || CalendarIcon;
                  const isMenuOpen = activeMenuPost === post.id;
                  return (
                    <div key={post.id} className="p-4 rounded-2xl bg-card border border-border space-y-3 relative group hover:border-blue-500/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 capitalize text-xs text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{post.platform}</span>
                        </div>
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => setActiveMenuPost(isMenuOpen ? null : post.id)}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                          
                          <AnimatePresence>
                            {isMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuPost(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-xl shadow-xl p-1 z-50 text-xs"
                                >
                                  <button
                                    onClick={() => togglePostStatus(post.id, post.status)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-foreground hover:bg-muted flex items-center gap-1.5"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Cycle status</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id, post.title)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 font-medium border-t border-border mt-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete slot</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold leading-relaxed text-foreground">{post.title}</h4>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 h-4.5 rounded font-mono bg-muted/40 border-border">
                          {post.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">10:00 AM</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-11 h-11 rounded-full bg-muted/40 border border-border/30 flex items-center justify-center mx-auto">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">No content scheduled for this day.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full text-xs font-bold border-border hover:bg-muted text-foreground cursor-pointer"
                    onClick={handleCreatePostForSelectedDate}
                  >
                    Schedule Now
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-blue-500/[0.04] border border-blue-500/15 rounded-3xl">
            <h4 className="text-xs font-bold mb-2.5 flex items-center gap-2 text-foreground font-display">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
              AI Prompt Generators
            </h4>
            <p className="text-xs text-muted-foreground mb-4">Click any spark topic to prepopulate and link a calendar draft instantly:</p>
            <ul className="space-y-2">
              {[
                { idea: 'Behind the scenes layout setup', plat: 'instagram' },
                { idea: 'Q&A about mobile utility design', plat: 'youtube' },
                { idea: 'Micro interaction guidelines checklist', plat: 'twitter' }
              ].map((rec, i) => (
                <li 
                  key={i} 
                  className="text-xs p-2.5 rounded-xl bg-background hover:bg-blue-500/[0.02] border border-border hover:border-blue-500/50 cursor-pointer transition-all flex items-start gap-2 group"
                  onClick={() => {
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    openNewPostModal(rec.idea, rec.plat as Platform, formattedDate);
                  }}
                >
                  <Sparkles className="h-3 w-3 mt-0.5 text-blue-500 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[11px] leading-relaxed text-muted-foreground font-medium group-hover:text-foreground transition-colors">{rec.idea}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
