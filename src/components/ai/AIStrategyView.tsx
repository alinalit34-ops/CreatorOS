import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCreatorStrategy, AIStrategy } from '@/src/services/aiStrategyService';
import { repurposeContent, RepurposeResult } from '@/src/services/aiRepurposeService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Youtube,
  Instagram,
  Twitter,
  Music,
  ArrowRight,
  Copy,
  Check,
  Video,
  FileText,
  Linkedin,
  Zap,
  ArrowUpRight,
  Layers,
  HelpCircle,
  Plus
} from 'lucide-react';
import { Platform } from '@/src/types/index';

const PLATFORM_ICONS: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  YouTube: Youtube,
  Instagram: Instagram,
  TikTok: Music,
  Twitter: Twitter,
};

const PLATFORM_BRAND_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  youtube: {
    text: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/20 dark:border-red-500/30'
  },
  instagram: {
    text: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    border: 'border-pink-500/20 dark:border-pink-500/30'
  },
  tiktok: {
    text: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    border: 'border-cyan-500/20 dark:border-cyan-500/30'
  },
  twitter: {
    text: 'text-sky-500 dark:text-sky-450',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    border: 'border-sky-500/20 dark:border-sky-500/30'
  }
};

interface AIStrategyViewProps {
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AIStrategyView({ openNewPostModal, showToast }: AIStrategyViewProps) {
  const [strategy, setStrategy] = useState<AIStrategy | null>(null);
  const [loading, setLoading] = useState(true);

  // Repurposing States
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [targetPlatform, setTargetPlatform] = useState<string>("Twitter/X Thread");
  const [selectedTone, setSelectedTone] = useState<string>("punchy & engaging");
  const [repurposedResult, setRepurposedResult] = useState<RepurposeResult | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedTip, setCopiedTip] = useState(false);

  const fetchStrategy = async () => {
    setLoading(true);
    const data = await generateCreatorStrategy();
    setStrategy(data);
    if (data && data.contentIdeas && data.contentIdeas.length > 0) {
      setSelectedIdea(data.contentIdeas[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStrategy();
  }, []);

  const handleRepurpose = async () => {
    if (!selectedIdea) return;
    setIsRepurposing(true);
    setRepurposedResult(null);
    try {
      const result = await repurposeContent(
        selectedIdea.title,
        selectedIdea.description,
        selectedIdea.platform,
        targetPlatform,
        selectedTone
      );
      setRepurposedResult(result);
      showToast(`Repurposed design asset for ${targetPlatform}!`, 'success');
    } catch (err: any) {
      console.warn("Repurposer action returned non-blocking notice:", err?.message || err);
      showToast('Error producing repurposed asset', 'error');
    } finally {
      setIsRepurposing(false);
    }
  };

  const handleCopyBlock = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Copied variation content block to clipboard', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyTip = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTip(true);
    showToast('Copied algorithmic growth tip', 'info');
    setTimeout(() => setCopiedTip(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 select-none">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-left select-none">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            AI Strategy Engine
            <Badge variant="secondary" className="gap-1 px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
              Optimized
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">Proactive content recommendations and cross-platform scripting.</p>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 border-border hover:bg-muted cursor-pointer text-xs font-semibold h-10" onClick={fetchStrategy} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </header>

      {/* Performance Insight Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="p-8 bg-gradient-to-br from-purple-500/[0.04] via-zinc-900/10 to-transparent border-purple-500/25 relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-purple-500">
            <TrendingUp className="h-48 w-48" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 bg-purple-600 text-white font-bold tracking-wide text-[10px]">CORE AI ADVICE</Badge>
            <h2 className="text-2xl font-bold mb-6 leading-snug font-display text-foreground">
              {strategy?.performanceInsight}
            </h2>
            <Button 
              onClick={() => {
                const draftTitle = "Integrated Growth Action (Cross promotion campaign)";
                openNewPostModal(draftTitle, 'instagram');
                showToast("Pre-filled active growth campaign draft onto calendar!");
              }}
              className="rounded-xl gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold hover:opacity-95 text-xs h-10 px-5"
            >
              <span>Implement Recommendation</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Ideas Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 px-2 font-display">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Proactive Content Strategy Ideas
            </h3>
            <p className="text-xs text-muted-foreground px-2 mt-1">
              Select any creative insight card to customize and open our algorithmic cross-platform Repurposing Studio below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategy?.contentIdeas.map((idea, i) => {
              const Icon = PLATFORM_ICONS[idea.platform] || Sparkles;
              const isSelected = selectedIdea?.title === idea.title;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setRepurposedResult(null);
                  }}
                >
                  <Card className={`p-6 h-full flex flex-col transition-all duration-300 group cursor-pointer relative rounded-2xl ${
                    isSelected 
                    ? 'border-purple-500 ring-2 ring-purple-500/10 bg-purple-500/[0.01]' 
                    : 'hover:border-purple-500/40 hover:bg-muted/40 border-border'
                  }`}>
                    {isSelected && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      {(() => {
                        const platLower = idea.platform.toLowerCase();
                        const brand = PLATFORM_BRAND_STYLES[platLower];
                        return (
                          <>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              brand ? `${brand.bg} ${brand.border}` : 'bg-card border-border'
                            }`}>
                              <Icon className={`h-5 w-5 ${brand ? brand.text : 'text-[#818CF8]'}`} />
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] uppercase tracking-wider font-bold ${
                                brand ? `${brand.text} ${brand.bg} ${brand.border}` : ''
                              }`}
                            >
                              {idea.platform}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                    <h4 className="font-bold text-base mb-2 group-hover:text-purple-500 transition-colors text-foreground">{idea.title}</h4>
                    <p className="text-xs text-muted-foreground mb-6 flex-1 text-left leading-relaxed">{idea.description}</p>
                    <div className="pt-4 border-t border-border/60 mt-auto space-y-3 text-left">
                      <div>
                        <p className="text-[10px] uppercase font-mono font-bold text-zinc-500 mb-1">Growth Justification</p>
                        <p className="text-xs italic text-muted-foreground">"{idea.reasoning}"</p>
                      </div>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          const ch = idea.platform.toLowerCase();
                          const pl: Platform = (ch === 'youtube' || ch === 'instagram' || ch === 'tiktok' || ch === 'twitter') ? ch : 'youtube';
                          openNewPostModal(idea.title, pl);
                        }}
                        className="w-full text-[10px] font-bold rounded-lg cursor-pointer h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span>Schedule Draft Idea</span>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* AI Strategy Multi-Platform Repurposing Studio */}
          {selectedIdea && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="pt-6"
            >
              <Card className="p-8 border-purple-500/20 bg-zinc-950/40 rounded-3xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1 rounded-full text-[10px] tracking-wide font-bold">
                      <Layers className="h-3 w-3" />
                      REPURPOSING LAB
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">INTEGRATED GENERATIVE AGENT</span>
                  </div>
                  <h3 className="text-2xl font-bold font-display text-foreground">Cross-Platform Variation Lab</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Repurpose <span className="font-bold text-foreground">"{selectedIdea.title}"</span> from {selectedIdea.platform} into platform-native micro-content automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Core Format</span>
                    <div className="text-xs font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2">
                      {selectedIdea.platform} Concept
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Target Distribution Channel</span>
                    <select
                      value={targetPlatform}
                      onChange={(e) => setTargetPlatform(e.target.value)}
                      className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-1.5 outline-none focus:border-purple-500"
                    >
                      <option value="Twitter/X Thread">X (Twitter) Analytical Thread (5-7 Posts)</option>
                      <option value="LinkedIn Post">LinkedIn Creator Article (Professional)</option>
                      <option value="TikTok Script">TikTok / Reels High-Retention Micro-Script</option>
                      <option value="Newsletter Segment">Substack Newsletter Issue Draft</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Tone Alignment</span>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full text-xs font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-1.5 outline-none"
                    >
                      <option value="punchy & engaging">Punchy & High-hook</option>
                      <option value="educational & deep">Educational & High-fidelity</option>
                      <option value="humorous & witty">Witty & Direct</option>
                      <option value="casual newsletter">Friendly & Casual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleRepurpose} 
                    disabled={isRepurposing}
                    className="rounded-xl h-11 px-6 font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10"
                  >
                    {isRepurposing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Generating platform variants...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Execute AI Repurposing Pipeline</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Show Repurposing Result output */}
                <AnimatePresence mode="wait">
                  {repurposedResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 pt-6 border-t border-border"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground font-display flex items-center gap-2">
                          <Check className="h-4.5 w-4.5 text-green-500" />
                          Generated Variational Output ({repurposedResult.targetPlatform})
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-500">WORDCOUNT: ~250 WORDS</span>
                      </div>

                      <div className="space-y-4">
                        {(repurposedResult.blocks || []).map((block, idx) => (
                           <div key={idx} className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/50 relative group/block">
                            <span className="absolute top-4 left-4 text-[10px] font-mono font-bold text-zinc-500">
                              {block.label || (repurposedResult.targetPlatform.toLowerCase().includes("thread") ? `POST ${idx + 1}` : `SECTION ${idx + 1}`)}
                            </span>
                            <div className="text-xs text-foreground leading-relaxed pl-12 pr-12 text-left whitespace-pre-line mt-4">
                              {block.content}
                            </div>
                            {block.visualCue && (
                              <div className="mt-2.5 ml-12 p-2 bg-muted/40 border border-dashed border-border rounded-lg text-[11px] text-muted-foreground font-mono">
                                <span className="font-bold text-pink-650 dark:text-pink-400">VISUAL:</span> {block.visualCue}
                              </div>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyBlock(block.content, idx)}
                              className="absolute top-4 right-4 h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg opacity-0 group-hover/block:opacity-100 transition-opacity cursor-pointer border border-border"
                            >
                              {copiedIndex === idx ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-4.5 rounded-2xl bg-purple-500/[0.04] border border-purple-500/15">
                        <div className="flex gap-2.5 items-start">
                          <Lightbulb className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Distribution Advice</p>
                            <p className="text-xs text-foreground italic mt-1 font-medium">"{repurposedResult.growthTip || (repurposedResult as any).viralTip}"</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyTip(repurposedResult.growthTip || (repurposedResult as any).viralTip)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg shrink-0 cursor-pointer"
                        >
                          {copiedTip ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            const variationTitle = `Variation Draft (${repurposedResult.targetPlatform}): ${selectedIdea.title}`;
                            const plCh = repurposedResult.targetPlatform.toLowerCase();
                            const destPl: Platform = plCh.includes("twitter") ? "twitter" : plCh.includes("linkedin") ? "twitter" : plCh.includes("tiktok") ? "tiktok" : "instagram";
                            openNewPostModal(variationTitle, destPl);
                          }}
                          className="rounded-xl text-xs h-9"
                        >
                          Schedule Variation Draft
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Optimal Schedule & Trends Sidebar */}
        <div className="space-y-8">
          {/* Optimal Posting Times */}
          <Card className="p-8 rounded-3xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-display">
              <Clock className="h-4.5 w-4.5 text-purple-500" />
              Optimal Post Slots
            </h3>
            <div className="space-y-4">
              {strategy?.optimalSchedule.map((slot, i) => {
                const Icon = PLATFORM_ICONS[slot.platform] || Clock;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-xs text-foreground">{slot.day} at {slot.time}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{slot.platform}</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const recTitle = `Strategy schedule slot matching (${slot.day} / ${slot.platform})`;
                        const ch = slot.platform.toLowerCase();
                        const pl: Platform = (ch === 'youtube' || ch === 'instagram' || ch === 'tiktok' || ch === 'twitter') ? ch : 'youtube';
                        openNewPostModal(recTitle, pl);
                        showToast(`Initiating draft scheduler for ${slot.platform}!`);
                      }}
                      className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-purple-500 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Trending Topics tag cluster */}
          <Card className="p-8 rounded-3xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-display">
              <TrendingUp className="h-4.5 w-4.5 text-purple-500" />
              Surging Tech Topics
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {strategy?.trendingTopics.map((topic, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="px-3.5 py-1.5 rounded-full hover:border-purple-500 text-foreground cursor-pointer transition-colors bg-muted/10 font-bold text-[10px]"
                  onClick={() => {
                    showToast(`Creating trend blueprint: "${topic}"!`, 'info');
                    openNewPostModal(`Deep-dive: Ultimate trends on ${topic}`, 'youtube');
                  }}
                >
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  {topic}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
