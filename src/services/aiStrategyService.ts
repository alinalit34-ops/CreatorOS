export interface AIStrategy {
  contentIdeas: {
    title: string;
    description: string;
    platform: string;
    reasoning: string;
  }[];
  optimalSchedule: {
    day: string;
    time: string;
    platform: string;
    reason: string;
  }[];
  trendingTopics: string[];
  performanceInsight: string;
}

export interface GenerateStrategyParams {
  userProfile?: any;
  connectedPlatforms?: string[];
  youtubeChannelInfo?: any;
  tiktokAccountInfo?: any;
  posts?: any[];
}

export async function generateCreatorStrategy(params?: GenerateStrategyParams): Promise<AIStrategy> {
  try {
    const res = await fetch('/api/ai/strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params || {})
    });

    if (!res.ok) {
      throw new Error(`Strategy API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.strategy) {
      return data.strategy as AIStrategy;
    }
    throw new Error('Invalid strategy response structure');
  } catch (error: any) {
    console.warn("Falling back to local strategy builder:", error?.message || error);
    
    const niche = params?.userProfile?.niche || "Product and Creative";
    const ytSubs = typeof params?.youtubeChannelInfo?.metrics?.subscribers === 'number' ? params.youtubeChannelInfo.metrics.subscribers : 0;
    const ytViews = typeof params?.youtubeChannelInfo?.metrics?.views === 'number' ? params.youtubeChannelInfo.metrics.views : 0;
    const ytVideos = typeof params?.youtubeChannelInfo?.metrics?.videos === 'number' ? params.youtubeChannelInfo.metrics.videos : (typeof params?.youtubeChannelInfo?.metrics?.videoCount === 'number' ? params.youtubeChannelInfo.metrics.videoCount : 0);
    const publishedCount = Array.isArray(params?.posts) ? params.posts.filter(p => p.status === 'published').length : 0;

    const isZeroState = ytSubs === 0 && ytViews === 0 && ytVideos === 0 && publishedCount === 0;

    if (isZeroState) {
      return {
        performanceInsight: `You haven't started posting yet, let's brainstorm ideas! I'll help you with production ideas, hook formulas, and building your first 30-day content calendar to establish your brand presence in ${niche} and unlock your first monetization avenues.`,
        contentIdeas: [
          { 
            title: `Why I Decided to Focus on ${niche} in 2026`, 
            description: `A personal, compelling origin story video introducing your unique philosophy and what viewers will learn from your channel.`, 
            platform: "YouTube", 
            reasoning: `Introduction and manifesto videos build deep audience trust and convert viewers into your first 100 core subscribers.` 
          },
          { 
            title: `3 Essential Tools in My ${niche} Stack`, 
            description: `Fast-paced visual breakdown of the top 3 software tools or templates you rely on daily.`, 
            platform: "TikTok", 
            reasoning: `Practical tool stacks have high organic algorithmic discovery for new accounts.` 
          },
          { 
            title: `The Biggest Mistakes Beginners Make in ${niche}`, 
            description: `Educational breakdown of 4 common pitfalls you have observed and the exact frameworks to avoid them.`, 
            platform: "Twitter", 
            reasoning: `Authoritative contrarian advice establishes professional credibility quickly.` 
          }
        ],
        optimalSchedule: [
          { day: "Tuesday", time: "7:00 PM", platform: "YouTube", reason: "Prime evening attention window for comprehensive tutorials." },
          { day: "Thursday", time: "1:00 PM", platform: "TikTok", reason: "Mid-week lunch discovery peak for short visual tips." },
          { day: "Saturday", time: "11:00 AM", platform: "Instagram", reason: "Weekend exploration time for carousel visual guides." }
        ],
        trendingTopics: [
          `AI Workflow Optimization in ${niche}`, 
          "Minimalist Workspace & Tooling", 
          "Zero to First $1k Creator Roadmap", 
          "High-Converting Visual Hierarchy", 
          "Building in Public Strategies"
        ]
      };
    }

    return {
      performanceInsight: `With ${ytViews.toLocaleString()} total views and ${ytSubs.toLocaleString()} subscribers, focus on audience retention in the first 30 seconds. Repurposing your top-performing concepts into interactive short-form reels will accelerate your growth velocity in ${niche}.`,
      contentIdeas: [
        { title: `Deep Dive: Advanced Frameworks in ${niche}`, description: "Step-by-step masterclass analyzing high-leverage workflows.", platform: "YouTube", reasoning: "High watch time boosts channel authority in search indexing." },
        { title: `Quick Tip: How to 10x Your ${niche} Output`, description: "Bite-sized breakdown of your favorite productivity shortcut.", platform: "Instagram", reasoning: "High shareability on Instagram Reels to attract fresh top-of-funnel viewers." },
        { title: `Case Study: Real-World Lessons from ${niche}`, description: "Behind-the-scenes breakdown of actual challenges and how you overcame them.", platform: "Twitter", reasoning: "Builds authentic thought leadership and high quote-tweet engagement." }
      ],
      optimalSchedule: [
        { day: "Tuesday", time: "7:00 PM", platform: "YouTube", reason: "Peak subscriber watch activity." },
        { day: "Friday", time: "12:00 PM", platform: "Instagram", reason: "Highest lunchtime engagement." },
        { day: "Sunday", time: "8:00 PM", platform: "Twitter", reason: "End-of-week planning review." }
      ],
      trendingTopics: [`Next-Gen AI in ${niche}`, "Audience Monetization Funnels", "Design Systems at Scale", "Modern Creator Stack 2026", "Multi-Channel Content Engines"]
    };
  }
}
