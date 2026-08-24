import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  X,
  Check,
  Plus,
  Compass,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Platform } from '@/src/types/index';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  onNavigate?: (screen: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  userProfile?: any;
  connectedPlatforms?: string[];
  youtubeChannelInfo?: any;
  tiktokAccountInfo?: any;
  posts?: any[];
}

export default function AIAssistant({ 
  onNavigate, 
  showToast, 
  openNewPostModal, 
  userProfile = { name: 'Alina Litvinova', niche: 'Product and Creative' },
  connectedPlatforms = [],
  youtubeChannelInfo,
  tiktokAccountInfo,
  posts = []
}: AIAssistantProps) {
  const firstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Creator';
  const niche = userProfile?.niche || 'Product and Creative';
  
  const ytSubs = typeof youtubeChannelInfo?.metrics?.subscribers === 'number' ? youtubeChannelInfo.metrics.subscribers : 0;
  const ytViews = typeof youtubeChannelInfo?.metrics?.views === 'number' ? youtubeChannelInfo.metrics.views : 0;
  const ytVideos = typeof youtubeChannelInfo?.metrics?.videos === 'number' ? youtubeChannelInfo.metrics.videos : (typeof youtubeChannelInfo?.metrics?.videoCount === 'number' ? youtubeChannelInfo.metrics.videoCount : 0);
  
  const tkFollowers = typeof tiktokAccountInfo?.metrics?.followers === 'number' ? tiktokAccountInfo.metrics.followers : 0;
  const tkLikes = typeof tiktokAccountInfo?.metrics?.likes === 'number' ? tiktokAccountInfo.metrics.likes : 0;
  const tkVideos = typeof tiktokAccountInfo?.metrics?.videos === 'number' ? tiktokAccountInfo.metrics.videos : 0;

  const publishedCount = Array.isArray(posts) ? posts.filter(p => p.status === 'published').length : 0;
  
  const totalAudience = ytSubs + tkFollowers;
  const totalViews = ytViews + tkLikes;
  const isZeroState = ytSubs === 0 && ytViews === 0 && ytVideos === 0 && tkFollowers === 0 && tkLikes === 0 && tkVideos === 0 && publishedCount === 0;

  const initialGreeting = isZeroState 
    ? `Hi ${firstName}! I see you're getting started with your brand in ${niche} from ground zero. You haven't started posting yet, so let's brainstorm foundational ideas, build your production schedule, and craft high-converting hooks to get you rolling. How can I help you launch today?`
    : `Hi ${firstName}! I'm your Creator OS AI Strategist. With ${totalViews > 0 ? `${totalViews.toLocaleString()} total engagement/views` : `${totalAudience.toLocaleString()} followers & subscribers`} across your connected channels in ${niche}, I'm ready to help you optimize retention, script new videos, and scale monetization. What should we tackle today?`;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Deep cross-screen integration hook: Catch pre-configured analysis queries
  useEffect(() => {
    const queuePrompt = localStorage.getItem('assistant_default_prompt');
    if (queuePrompt) {
      localStorage.removeItem('assistant_default_prompt');
      triggerDirectPrompt(queuePrompt);
    }
  }, []);

  const triggerDirectPrompt = async (promptText: string) => {
    setIsLoading(true);
    const updatedMessages: Message[] = [...messages, { role: 'user', content: promptText }];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userContext: {
            name: userProfile?.name,
            niche: userProfile?.niche,
            connectedPlatforms,
            hasYt: connectedPlatforms.includes('youtube') || Boolean(youtubeChannelInfo),
            ytSubs,
            ytViews,
            ytVideos,
            postsCount: posts.length
          }
        })
      });

      if (!res.ok) {
        throw new Error('API chat error');
      }

      const data = await res.json();
      const reply = data.reply || "I've processed your request. Let's keep building your content pipeline!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      // Intelligent contextual fallback
      let answer = "";
      if (isZeroState) {
        if (promptText.toLowerCase().includes("idea") || promptText.toLowerCase().includes("brainstorm") || promptText.toLowerCase().includes("start")) {
          answer = `### 🚀 3 Launch Content Ideas for ${niche}\n\n1. **The Origin Manifesto (YouTube)**: *"Why I'm Documenting My ${niche} Journey in 2026"*\n   - **Hook**: "Most people wait until they are successful to share their work. I'm starting today."\n   - **Goal**: Establish authentic vulnerability and win your first 50 loyal subscribers.\n\n2. **The 3-Tool Breakdown (TikTok/Reels)**: *"The 3 Tools I Can't Live Without in ${niche}"*\n   - **Hook**: "If I lost everything and had to restart today, here are the 3 free tools I would download first."\n   - **Goal**: High algorithmic discovery.\n\n3. **The Contrarian Advice (Twitter/X)**: *"4 Things Beginners in ${niche} Waste Time On"*\n   - **Goal**: Fast thought-leadership positioning.`;
        } else if (promptText.toLowerCase().includes("calendar") || promptText.toLowerCase().includes("schedule")) {
          answer = `### 📅 Recommended 30-Day Launch Cadence\n\n- **Week 1**: 1 YouTube Introduction Video + 2 TikTok/Reels Short Clips.\n- **Week 2**: 3 Short-form breakdown clips + 1 Twitter thread on your workflow.\n- **Week 3**: 1 Deep-dive tutorial answering the most frequent beginner question in ${niche}.\n- **Week 4**: Publish a free Gumroad template/checklist as a lead magnet.\n\nWould you like me to add these draft slots to your Content Calendar?`;
        } else {
          answer = `### Zero-to-One Growth Strategy\nSince you are starting fresh in **${niche}**, focus 80% on **publishing consistency** and 20% on **refining hook retention**.\n\n- Don't worry about complex monetization until you establish your signature format.\n- Aim for your first 5 published pieces to train platform algorithms on your target audience.`;
        }
      } else {
        answer = `### Content Scaling Strategy for ${niche}\nBased on your ${ytViews.toLocaleString()} views and active pipeline:\n\n- **Optimization Focus**: Repurpose your best-performing long-form topics into short visual carousels and TikTok clips.\n- **Monetization**: Package your signature workflow into a downloadable digital product or course outline to drive direct sales.`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const txt = input.trim();
    setInput('');
    triggerDirectPrompt(txt);
  };

  const starterChips = isZeroState ? [
    { label: "Brainstorm my first 3 video ideas", prompt: "I'm starting from scratch. Help me brainstorm my first 3 high-impact video ideas in my niche." },
    { label: "Build a 30-day launch schedule", prompt: "Create a realistic 30-day content calendar for a brand new creator starting from zero." },
    { label: "Hook formulas for beginners", prompt: "Give me 5 proven hook formulas to capture viewers in the first 3 seconds." },
    { label: "How to monetize with 0 followers", prompt: "What are the best monetization and audience-building steps before getting monetized?" }
  ] : [
    { label: "Analyze my channel growth", prompt: "Analyze my current viewership metrics and tell me my biggest growth lever." },
    { label: "Next content batch ideas", prompt: "Suggest 3 high-performing content ideas based on my current audience niche." },
    { label: "Monetization & sponsorship ideas", prompt: "How can I expand my revenue streams and secure brand sponsors for my channel?" },
    { label: "Improve audience retention", prompt: "Give me actionable techniques to increase average view duration on my videos." }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 pb-4 select-none text-left font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Creator AI Assistant</h1>
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[9px] uppercase font-mono font-bold">
                {isZeroState ? "LAUNCH MODE (0-1)" : "SCALE TELEMETRY"}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">Direct Gemini 2.5 channel intelligence, production ideas & monetization.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs gap-1.5 cursor-pointer font-mono font-bold h-8 border-border hover:bg-muted"
            onClick={() => setMessages([{ role: 'assistant', content: initialGreeting }])}
          >
            CLEAR LOG
          </Button>
          <Button 
            size="sm" 
            className="rounded-xl text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer font-mono font-bold h-8 shadow-md shadow-primary/20"
            onClick={() => openNewPostModal()}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ NEW DRAFT</span>
          </Button>
        </div>
      </header>

      {/* Starter Quick Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {starterChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => triggerDirectPrompt(chip.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-card/60 hover:bg-primary/10 hover:text-foreground hover:border-primary/40 border border-border/80 transition-all cursor-pointer shrink-0 disabled:opacity-50 text-muted-foreground"
          >
            ⌘ {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Canvas */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-2xl p-4 bg-card/40 border border-border/80 shadow-lg shadow-black/5">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              
              <div 
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground font-medium shadow-md rounded-tr-sm' 
                    : 'bg-muted/30 border border-border/70 text-foreground rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
              <div className="bg-muted/30 border border-border/70 rounded-2xl p-3 rounded-tl-sm flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span>Analyzing your metrics & synthesizing strategic guidance...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Command Bar */}
        <div className="pt-3 border-t border-border/50 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isZeroState ? `Ask anything about launching your brand in ${niche}...` : "Ask for video scripts, hook ideas, retention analysis..."}
            className="flex-1 bg-muted/30 border border-border/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground text-foreground font-sans"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer font-bold text-xs shadow-md shadow-primary/20"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
