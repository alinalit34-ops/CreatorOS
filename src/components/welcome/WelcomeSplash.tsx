import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Sparkles, 
  Youtube, 
  Instagram, 
  Twitter, 
  Music, 
  X, 
  BarChart3, 
  Calendar, 
  Sparkle,
  Layers
} from 'lucide-react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface WelcomeSplashProps {
  onNext: () => void;
  onSignInSuccess: (user: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function WelcomeSplash({ onNext, onSignInSuccess, showToast }: WelcomeSplashProps) {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const walkthroughData = [
    {
      title: "Consolidated Analytics",
      desc: "Merge YouTube Analytics, Instagram engagement metrics, TikTok statistics, and X outreach into a single, comprehensive dashboard.",
      icon: BarChart3,
      color: "text-blue-400 bg-blue-500/10"
    },
    {
      title: "Cross-Platform Calendar",
      desc: "Drag, drop, schedule and map out your content. Place visual placeholders, link drafts, and queue uploads in perfect sync.",
      icon: Calendar,
      color: "text-emerald-400 bg-emerald-500/10"
    },
    {
      title: "Platform-Native Repurposing Engine",
      desc: "Deploy Gemini to dissect single ideas into high-converting platform variables: Twitter threads, TikTok reels, and LinkedIn stories.",
      icon: Layers,
      color: "text-purple-400 bg-purple-500/10"
    }
  ];

  const handleNextWalkthrough = () => {
    if (walkthroughStep < walkthroughData.length - 1) {
      setWalkthroughStep(walkthroughStep + 1);
    } else {
      setIsWalkthroughOpen(false);
      setWalkthroughStep(0);
      onNext(); // Auto-navigate to Get Started
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 max-w-3xl"
      >
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-4">
            {[Youtube, Instagram, Music, Twitter].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shadow-2xl"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
        >
          Creator OS
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-xl mx-auto font-light leading-relaxed text-center"
        >
          One unified workspace to run your creative career. Planning, analytics, and monetization—all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="rounded-full px-8 h-14 text-lg gap-3 group cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20" 
            onClick={async () => {
              try {
                showToast('Initiating Google Authentication...', 'info');
                const result = await signInWithPopup(auth, googleProvider);
                if (result.user) {
                  showToast(`Welcome ${result.user.displayName || 'Creator'}! Authenticated successfully.`, 'success');
                  onSignInSuccess(result.user);
                }
              } catch (err: any) {
                console.error(err);
                showToast(err?.message || 'Authentication encountered an error.', 'error');
              }
            }}
          >
            <svg className="h-5 w-5 fill-current text-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.6-4.53-2.6-4.53z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full px-8 h-14 text-lg gap-2 cursor-pointer border-zinc-350 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold"
            onClick={() => setIsWalkthroughOpen(true)}
          >
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            See How it Works
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 text-muted-foreground/40 font-mono text-xs tracking-widest uppercase">
        <span>Analytics</span>
        <div className="w-1 h-1 rounded-full bg-border" />
        <span>Calendar</span>
        <div className="w-1 h-1 rounded-full bg-border" />
        <span>Monetization</span>
        <div className="w-1 h-1 rounded-full bg-border" />
        <span>Audience</span>
      </div>

      {/* Walkthrough Interactive Explanatory Modal popup overlay */}
      <AnimatePresence>
        {isWalkthroughOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
              onClick={() => setIsWalkthroughOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 text-left overflow-hidden"
            >
              {/* background decoration glow inside modal */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <button 
                onClick={() => setIsWalkthroughOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Sparkle className="h-4.5 w-4.5 text-yellow-500 animate-spin" />
                <span className="font-mono text-[10px] tracking-widest text-zinc-400 font-bold uppercase">PRODUCT DEMONSTRATION</span>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={walkthroughStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${walkthroughData[walkthroughStep].color}`}>
                      {(() => {
                        const IconComponent = walkthroughData[walkthroughStep].icon;
                        return <IconComponent className="h-6 w-6" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-zinc-100 font-display">
                        {walkthroughData[walkthroughStep].title}
                      </h4>
                      <p className="text-sm text-zinc-400 mt-2.5 leading-relaxed leading-medium text-left">
                        {walkthroughData[walkthroughStep].desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex items-center justify-between pt-6 border-t border-zinc-850">
                  <div className="flex items-center gap-1.5">
                    {walkthroughData.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWalkthroughStep(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === walkthroughStep ? 'w-8 bg-indigo-500' : 'w-2 bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>

                  <Button 
                    onClick={handleNextWalkthrough}
                    className="rounded-xl px-5 gap-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    <span>{walkthroughStep === walkthroughData.length - 1 ? "Let's Onboard!" : "Next feature"}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-90" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
