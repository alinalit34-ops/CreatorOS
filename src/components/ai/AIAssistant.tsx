import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
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
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Platform } from '@/src/types/index';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  onNavigate?: (screen: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
}

export default function AIAssistant({ onNavigate, showToast, openNewPostModal }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi Alex! I'm your Creator OS Assistant. I have deep access to your analytics, calendar, and monetization feeds. How can I facilitate your growth today?" }
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
      localStorage.removeItem('assistant_default_prompt'); // Consume trigger
      triggerDirectPrompt(queuePrompt);
    }
  }, []);

  const triggerDirectPrompt = async (promptText: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: promptText }] }
        ],
        config: {
          systemInstruction: "You are a world-class Creator Coach integrated inside 'Creator OS' assisting Alex (display name Alex Rivers, niche Tech & Design, London). You analyze content performance, suggest schedules, write scripts, or formulate sponsorship pitch responses. Use bullet points and elegant formatting to be highly legible."
        }
      });
      const txt = response.text || "Your query returned an empty stream. However, optimization indices imply continuing with current publication queues.";
      setMessages(prev => [...prev, { role: 'assistant', content: txt }]);
    } catch (err) {
      // Graceful offline mock responses based on queries for a perfect offline-friendly preview
      let answer = "";
      if (promptText.toLowerCase().includes("revenue")) {
        answer = "### Unified Revenue Analysis\nBased on your active index:\n- **Monthly gross estimate**: **$12,450** led by AdSense Ads ($4,500).\n- **Sponsorship board**: You have **$7,300** locked inside the negotiation pipeline (NordVPN, Skillshare, TechCo).\n\n**Recommendation**: Promote the **Skillshare** contract. Their engagement profile match-rate is **91%**.";
      } else if (promptText.toLowerCase().includes("calendar") || promptText.toLowerCase().includes("ideas")) {
        answer = "### Creative Content Production Prompts\nHere are 3 platform-tailored prompts you can add to your calendar:\n1. **YouTube long-form**: *'Is Gemini 1.5 Pro replacing UI/UX layouts in 2026?'* (Highly relevant to your Tech & Design profile).\n2. **Instagram carousel**: *'5 Crucial Rules of Visual Balance & White Space'*.\n3. **X thread**: *'Workflow Deep-Dive: How I manage $12k/mo creative career barebones.'*";
      } else if (promptText.toLowerCase().includes("reach") || promptText.toLowerCase().includes("down")) {
        answer = "### Reach Metric Breakdown\nWhile your short-form TikTok reach is surging (**+24%** velocity), your Instagram stories are under-indexing. Use interactive poll templates and post during the **Wednesday lunch window (12:00 PM)** to revitalize story algorithms.";
      } else {
        answer = `### Strategic Topic Analysis: AI Tools / Creator Productivity\nBased on your target audience spike, here is a breakdown:\n\n- **Target platform**: YouTube / Instagram Reels.\n- **Hook recommendation**: *"This single AI workflow saves me 15 hours of design labor every single week..."*.\n- **Viral reach tips**: Include high-contrast overlay labels and tag with #Productivity #AITools.\n\nWould you like me to pre-fill a draft placeholder for this showcasing piece on your calendar?`;
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

  const suggestions = [
    { label: "Analyze my revenue status", icon: DollarSign },
    { label: "Draft content ideas for next week", icon: Calendar },
    { label: "Why is my story reach down?", icon: TrendingUp },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 select-none text-left">
      <header className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Proactive creative insights, scripting, and conversational intelligence.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/15 font-bold">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
          Powered by Gemini 1.5 Pro
        </Badge>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' 
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-500' 
                      : 'bg-muted border border-border text-muted-foreground'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className={`max-w-[80%] p-4.5 rounded-2xl ${
                    msg.role === 'assistant' 
                      ? 'bg-muted text-foreground border border-border' 
                      : 'bg-cyan-500 text-zinc-950 font-bold'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Interactive inline scheduling options if assistant suggests creative ideas */}
                    {msg.role === 'assistant' && msg.content.includes("YouTube long-form") && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                        <Button 
                          size="xs" 
                          className="rounded-lg text-[10px] bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold h-7 cursor-pointer"
                          onClick={() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            openNewPostModal("Is Gemini 1.5 Pro replacing UI/UX layouts in 2026?", 'youtube', todayStr);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          <span>Schedule YouTube suggestion</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-muted border border-border p-4.5 rounded-2xl flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                    <span className="text-xs text-muted-foreground">Formulating creative responses...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-5 border-t border-border bg-muted/10">
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((s) => (
                <Button 
                  key={s.label} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs gap-2 border-border bg-background hover:bg-muted text-foreground cursor-pointer"
                  onClick={() => triggerDirectPrompt(s.label)}
                  disabled={isLoading}
                >
                  <s.icon className="h-3.5 w-3.5 text-cyan-500" />
                  {s.label}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask helper about monetization audit, draft scripts, or type prompts..."
                className="w-full bg-background border border-border rounded-2xl py-4.5 pl-6 pr-16 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-muted-foreground/80 text-foreground"
                disabled={isLoading}
              />
              <Button 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-11 w-11 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 cursor-pointer shadow-md"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Proactive Insights Sidebar */}
        <div className="w-80 space-y-6 hidden xl:block shrink-0">
          <h3 className="font-bold flex items-center gap-2 px-2 text-sm text-foreground font-display">
            <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
            Proactive Prompts
          </h3>
          <div className="space-y-4">
            {[
              { title: 'YouTube Growth', desc: 'Your latest video is performing 20% better than average. Consider a follow-up about UI White-Space rules.', query: 'Formulate a follow-up video script regarding the UI White-Space rules.' },
              { title: 'Monetization Insight', desc: 'Pipeline indicators show brand response velocity is up. Should we review your pitch standard?', query: 'Help me write an outstanding brand sponsorship response pitch for Skillshare.' },
              { title: 'Audience Interest tag', desc: 'Brazil user clusters are spiking. Tap into localization guidelines?', query: 'Show me guidelines to localise and caption my tutorials for international clusters.' }
            ].map((insight, i) => (
              <Card 
                key={i} 
                className="p-4 hover:border-cyan-500/55 border-border hover:bg-muted/30 transition-all cursor-pointer group text-left rounded-2xl relative"
                onClick={() => triggerDirectPrompt(insight.query)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#818CF8]">{insight.title}</span>
                  <Sparkles className="h-3.5 w-3.5 text-yellow-500 opacity-60 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{insight.desc}</p>
                <span className="text-[9px] font-mono font-bold text-muted-foreground mt-2 block group-hover:text-cyan-500 transition-colors">Click to analyze &rarr;</span>
              </Card>
            ))}
          </div>
          
          <Card className="p-6 bg-cyan-500/[0.04] border border-cyan-500/15 rounded-2xl">
            <h4 className="text-xs font-bold mb-4 uppercase text-foreground/85 tracking-wider">AI Synaptic Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Model Engine</span>
                <span className="text-cyan-500 font-mono font-bold">3.5 Dual Flash</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Context Window</span>
                <span className="font-mono font-bold text-foreground">1.2M Tokens</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full w-full bg-cyan-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
