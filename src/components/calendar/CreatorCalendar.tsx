import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudioPlaque from '../brand/StudioPlaque';
import StudioCard from '../brand/StudioCard';
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
    <div className="space-y-8 pb-12 select-none text-left font-sans">
      {/* Unified Studio Plaque Header */}
      <StudioPlaque
        nodeId="NODE: 03"
        category="DISTRIBUTION TIMELINE"
        status="SCHEDULE SYNCED"
        statusColor="indigo"
        title="Content Calendar"
        subtitle="Multi-platform release scheduling, draft queues, and algorithmic pacing."
        action={
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-card/60 rounded-xl p-1 border border-border/80">
              <Button variant="ghost" size="icon" className="rounded-lg h-7 w-7 hover:bg-muted" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </Button>
              <span className="px-3 font-mono font-bold min-w-[120px] text-center text-xs text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button variant="ghost" size="icon" className="rounded-lg h-7 w-7 hover:bg-muted" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4 text-foreground" />
              </Button>
            </div>
            <Button 
              onClick={handleCreatePostForSelectedDate}
              className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold px-4 h-9 text-xs cursor-pointer shadow-md shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ SCHEDULE SLOT</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <StudioCard
          cornerBrackets={true}
          watermark={false}
          className="lg:col-span-3 p-5"
        >
          <div className="grid grid-cols-7 mb-3">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[10px] font-mono font-bold tracking-widest text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border/60 border border-border/70 rounded-xl overflow-hidden shadow-sm">
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
                  className={`aspect-square bg-card/70 p-2 relative cursor-pointer hover:bg-muted/30 transition-all ${
                    isSelected ? 'ring-1 ring-primary z-10 bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className={`text-[11px] font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    isToday 
                      ? 'bg-primary text-primary-foreground font-bold' 
                      : isSelected 
                        ? 'text-primary font-bold' 
                        : 'text-foreground/80'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-1.5 flex flex-wrap gap-1 max-h-10 overflow-y-auto">
                    {dayPosts.map(post => {
                      return (
                        <div 
                          key={post.id} 
                          className={`w-2 h-2 rounded-full cursor-pointer hover:scale-125 transition-transform ${
                            post.platform === 'youtube' 
                              ? 'bg-red-500' 
                              : post.platform === 'instagram' 
                                ? 'bg-pink-500' 
                                : post.platform === 'tiktok'
                                  ? 'bg-cyan-400'
                                  : post.platform === 'twitter'
                                    ? 'bg-sky-400'
                                    : 'bg-primary'
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
        </StudioCard>

        {/* Day Details */}
        <div className="space-y-6">
          <StudioCard
            cornerBrackets={true}
            watermark={true}
            className="p-5"
            title={
              <span className="font-display">{format(selectedDate, 'EEEE, MMM d')}</span>
            }
            headerAction={
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                {getPostsForDay(selectedDate).length} POSTS
              </span>
            }
          >
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {getPostsForDay(selectedDate).length > 0 ? (
                getPostsForDay(selectedDate).map(post => {
                  const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || CalendarIcon;
                  const isMenuOpen = activeMenuPost === post.id;
                  return (
                    <div key={post.id} className="p-3.5 rounded-xl bg-card/80 border border-border space-y-2.5 relative group hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 capitalize text-xs text-muted-foreground font-mono">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          <span>{post.platform}</span>
                        </div>
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                                  className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-xl shadow-xl p-1 z-50 text-xs font-mono"
                                >
                                  <button
                                    onClick={() => togglePostStatus(post.id, post.status)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted flex items-center gap-1.5"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    <span>CYCLE STATUS</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id, post.title)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 font-bold border-t border-border mt-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>DELETE</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold leading-relaxed text-foreground">{post.title}</h4>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-muted/60 text-muted-foreground border border-border/50">
                          {post.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">10:00 AM</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center mx-auto text-muted-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-muted-foreground">No content scheduled for this slot.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-xs font-mono font-bold border-border hover:bg-muted text-foreground cursor-pointer h-7"
                    onClick={handleCreatePostForSelectedDate}
                  >
                    + ADD ENTRY
                  </Button>
                </div>
              )}
            </div>
          </StudioCard>

          <StudioCard
            cornerBrackets={true}
            watermark={false}
            className="p-5"
          >
            <h4 className="text-xs font-bold mb-2 flex items-center gap-2 text-foreground font-display">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              Instant Spark Drafts
            </h4>
            <p className="text-xs text-muted-foreground mb-3">Pre-fill high-converting launch topics:</p>
            <ul className="space-y-2">
              {[
                { idea: 'Behind the scenes studio workflow breakdown', plat: 'instagram' },
                { idea: 'Deep-dive critique on minimalist web systems', plat: 'youtube' },
                { idea: 'Micro-interaction design heuristics checklist', plat: 'twitter' }
              ].map((rec, i) => (
                <li 
                  key={i} 
                  className="text-xs p-2.5 rounded-xl bg-card hover:bg-muted/40 border border-border/70 hover:border-primary/40 cursor-pointer transition-all flex items-start gap-2 group"
                  onClick={() => {
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    openNewPostModal(rec.idea, rec.plat as Platform, formattedDate);
                  }}
                >
                  <Sparkles className="h-3 w-3 mt-0.5 text-primary shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">{rec.idea}</span>
                </li>
              ))}
            </ul>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
