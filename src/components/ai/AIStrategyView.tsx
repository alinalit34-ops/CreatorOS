import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCreatorStrategy, AIStrategy } from '@/src/services/aiStrategyService';
import { repurposeContent, RepurposeResult } from '@/src/services/aiRepurposeService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StudioPlaque from '../brand/StudioPlaque';
import StudioCard from '../brand/StudioCard';
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
  userProfile?: any;
  connectedPlatforms?: string[];
  youtubeChannelInfo?: any;
  tiktokAccountInfo?: any;
  posts?: any[];
}

export default function AIStrategyView({ openNewPostModal, showToast, userProfile, connectedPlatforms = [], youtubeChannelInfo, tiktokAccountInfo, posts = [] }: AIStrategyViewProps) {
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
    const data = await generateCreatorStrategy({
      userProfile,
      connectedPlatforms,
      youtubeChannelInfo,
      tiktokAccountInfo,
      posts
    });
    setStrategy(data);
    if (data && data.contentIdeas && data.contentIdeas.length > 0) {
      setSelectedIdea(data.contentIdeas[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStrategy();
  }, [userProfile, connectedPlatforms, youtubeChannelInfo, tiktokAccountInfo, posts]);

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
      <div className="space-y-8 pb-12 select-none font-sans">
        <header className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-muted/60" />
            <Skeleton className="h-4 w-96 bg-muted/40" />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[380px] lg:col-span-2 rounded-2xl bg-muted/30" />
          <Skeleton className="h-[380px] rounded-2xl bg-muted/30" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl bg-muted/30" />
          <Skeleton className="h-28 rounded-2xl bg-muted/30" />
          <Skeleton className="h-28 rounded-2xl bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 text-left select-none font-sans">
      {/* Unified Studio Plaque Header */}
      <StudioPlaque
        nodeId="NODE: 05"
        category="EXECUTIVE AGENT MATRIX"
        status="GEMINI ACTIVE"
        statusColor="purple"
        title="AI Strategy Studio"
        subtitle="Algorithmic distribution recommendations, trend analysis, and kinetic cross-platform repurposing."
        action={
          <Button 
            variant="outline" 
            className="rounded-xl gap-2 border-border hover:bg-muted cursor-pointer text-xs font-mono font-bold h-9 px-4 shrink-0 text-foreground" 
            onClick={fetchStrategy} 
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>RE-ANALYZE</span>
          </Button>
        }
      />

      {/* Performance Insight Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="p-6 sm:p-8 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-card/60 border-purple-500/30 relative overflow-hidden shadow-lg shadow-purple-500/5"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-purple-400">
            <TrendingUp className="h-48 w-48" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              CORE DIRECTIVE
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold leading-snug text-foreground">
              {strategy?.performanceInsight}
            </h2>
            <div className="pt-2">
              <Button 
                onClick={() => {
                  const draftTitle = "Integrated Growth Campaign (Audience Blitz)";
                  openNewPostModal(draftTitle, 'instagram');
                  showToast("Draft pre-filled onto production calendar!");
                }}
                className="rounded-xl gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-4 shadow-md shadow-purple-600/20"
              >
                <span>Deploy Campaign Draft</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </StudioCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Ideas Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-display font-bold flex items-center gap-2 text-foreground">
              <Lightbulb className="h-4.5 w-4.5 text-amber-400" />
              Algorithmic Content Blueprints
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any blueprint below to inspect its growth justification or spin into cross-platform variants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategy?.contentIdeas.map((idea, i) => {
              const Icon = PLATFORM_ICONS[idea.platform] || Sparkles;
              const isSelected = selectedIdea?.title === idea.title;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setRepurposedResult(null);
                  }}
                >
                  <div className={`p-5 h-full flex flex-col transition-all duration-200 cursor-pointer relative rounded-2xl border ${
                    isSelected 
                    ? 'border-purple-500/80 bg-purple-500/10 ring-1 ring-purple-500/30' 
                    : 'bg-card/60 hover:bg-card hover:border-purple-500/40 border-border/80'
                  }`}>
                    {isSelected && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400" />
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                        {idea.platform}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1.5 text-foreground group-hover:text-primary transition-colors">
                      {idea.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4 flex-1 text-left leading-relaxed">
                      {idea.description}
                    </p>
                    <div className="pt-3 border-t border-border/50 mt-auto space-y-2 text-left">
                      <div>
                        <p className="text-[9px] uppercase font-mono font-bold text-muted-foreground mb-0.5">Algorithm Rationale</p>
                        <p className="text-xs italic text-muted-foreground/90">"{idea.reasoning}"</p>
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
                        className="w-full text-[10px] font-mono font-bold rounded-lg cursor-pointer h-7"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span>SCHEDULE THIS BLUEPRINT</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Strategy Multi-Platform Repurposing Studio */}
          {selectedIdea && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-4"
            >
              <StudioCard
                cornerBrackets={true}
                watermark={true}
                className="p-6 sm:p-7 border-purple-500/30 space-y-5"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Layers className="h-2.5 w-2.5" />
                      REPURPOSING PIPELINE
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">GEMINI 2.5 ENGINE</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">Cross-Platform Asset Multiplier</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Convert <span className="font-bold text-foreground">"{selectedIdea.title}"</span> into platform-native micro-content automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/70">
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Source Format</span>
                    <div className="text-xs font-semibold text-foreground bg-background/60 border border-border rounded-lg px-3 py-1.5">
                      {selectedIdea.platform}
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Target Channel</span>
                    <select
                      value={targetPlatform}
                      onChange={(e) => setTargetPlatform(e.target.value)}
                      className="w-full text-xs font-semibold text-foreground bg-background/60 border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-500 font-mono"
                    >
                      <option value="Twitter/X Thread">X (Twitter) Analytical Thread (5-7 Posts)</option>
                      <option value="LinkedIn Post">LinkedIn Creator Article (Executive)</option>
                      <option value="TikTok Script">TikTok / Reels High-Retention Micro-Script</option>
                      <option value="Newsletter Segment">Substack Newsletter Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Tone Vector</span>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full text-xs font-semibold text-foreground bg-background/60 border border-border rounded-lg px-2.5 py-1.5 outline-none font-mono"
                    >
                      <option value="punchy & engaging">Punchy & High-Hook</option>
                      <option value="educational & deep">Educational & High-Fidelity</option>
                      <option value="humorous & witty">Witty & Direct</option>
                      <option value="casual newsletter">Conversational & Candid</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleRepurpose} 
                    disabled={isRepurposing}
                    className="rounded-xl h-10 px-5 font-mono font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    {isRepurposing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Compiling variants...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Execute Multiplier Pipeline</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Repurposing Result output */}
                <AnimatePresence mode="wait">
                  {repurposedResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4 pt-5 border-t border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-foreground font-display flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-400" />
                          Generated Variational Output ({repurposedResult.targetPlatform})
                        </h4>
                        <span className="text-[9px] font-mono text-muted-foreground">READY FOR EXPORT</span>
                      </div>

                      <div className="space-y-3">
                        {(repurposedResult.blocks || []).map((block, idx) => (
                           <div key={idx} className="p-4 rounded-xl bg-card/80 border border-border hover:border-purple-500/50 relative group/block">
                            <span className="text-[9px] font-mono font-bold text-purple-400 block mb-1">
                              {block.label || `SEGMENT ${idx + 1}`}
                            </span>
                            <div className="text-xs text-foreground leading-relaxed text-left whitespace-pre-line pr-8">
                              {block.content}
                            </div>
                            {block.visualCue && (
                              <div className="mt-2 p-2 bg-muted/40 border border-dashed border-border/70 rounded-lg text-[10px] text-muted-foreground font-mono">
                                <span className="font-bold text-pink-400">VISUAL CUE:</span> {block.visualCue}
                              </div>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyBlock(block.content, idx)}
                              className="absolute top-3 right-3 h-6 w-6 text-muted-foreground hover:text-foreground rounded-lg opacity-0 group-hover/block:opacity-100 transition-opacity cursor-pointer border border-border"
                            >
                              {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex gap-2.5 items-start">
                          <Lightbulb className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400">Distribution Directive</p>
                            <p className="text-xs text-foreground italic mt-0.5">"{repurposedResult.growthTip || (repurposedResult as any).viralTip}"</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyTip(repurposedResult.growthTip || (repurposedResult as any).viralTip)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg shrink-0 cursor-pointer"
                        >
                          {copiedTip ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
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
                          className="rounded-xl text-xs h-9 font-mono font-bold"
                        >
                          + SCHEDULE AS CALENDAR DRAFT
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </StudioCard>
            </motion.div>
          )}
        </div>

        {/* Optimal Schedule & Trends Sidebar */}
        <div className="space-y-6">
          {/* Optimal Posting Times */}
          <StudioCard
            cornerBrackets={true}
            watermark={false}
            title="Optimal Timing Matrix"
            className="p-6"
          >
            <div className="space-y-2.5">
              {strategy?.optimalSchedule.map((slot, i) => {
                const Icon = PLATFORM_ICONS[slot.platform] || Clock;
                return (
                  <div key={i} className="p-3 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-xs text-foreground font-mono">{slot.day} • {slot.time}</h4>
                        <span className="text-[9px] text-muted-foreground uppercase font-mono">{slot.platform}</span>
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
                      className="h-6 w-6 rounded-lg hover:bg-muted text-muted-foreground hover:text-purple-400 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </StudioCard>

          {/* Trending Topics tag cluster */}
          <StudioCard
            cornerBrackets={true}
            watermark={true}
            title="Surging Tech Topics"
            className="p-6"
          >
            <div className="flex flex-wrap gap-2">
              {strategy?.trendingTopics.map((topic, i) => (
                <button
                  key={i}
                  className="px-3 py-1 rounded-lg border border-border hover:border-purple-500/60 text-foreground cursor-pointer transition-all bg-muted/20 hover:bg-purple-500/10 font-mono text-[10px] flex items-center gap-1.5"
                  onClick={() => {
                    showToast(`Creating trend blueprint: "${topic}"!`, 'info');
                    openNewPostModal(`Deep-dive: Ultimate trends on ${topic}`, 'youtube');
                  }}
                >
                  <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  <span>{topic}</span>
                </button>
              ))}
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
