export interface RepurposeResult {
  targetPlatform: string;
  title: string;
  variationType: string;
  intro: string;
  blocks: {
    label?: string;
    content: string;
    visualCue?: string;
  }[];
  hashtags: string[];
  growthTip: string;
}

export async function repurposeContent(
  ideaTitle: string,
  ideaDescription: string,
  originalPlatform: string,
  targetPlatform: string,
  customTone: string = "punchy & engaging"
): Promise<RepurposeResult> {
  try {
    const res = await fetch('/api/ai/repurpose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ideaTitle,
        ideaDescription,
        originalPlatform,
        targetPlatform,
        customTone
      })
    });

    if (!res.ok) {
      throw new Error(`Repurpose API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.result) {
      return data.result as RepurposeResult;
    }
    throw new Error('Invalid repurpose response structure');
  } catch (error: any) {
    console.warn("Falling back to local repurpose builder:", error?.message || error);
    return getFallbackRepurpose(ideaTitle, ideaDescription, targetPlatform);
  }
}

function getFallbackRepurpose(title: string, desc: string, targetPlatform: string): RepurposeResult {
  const normPlatform = targetPlatform.toLowerCase();
  
  if (normPlatform.includes('twitter') || normPlatform.includes('x')) {
    return {
      targetPlatform: "Twitter/X",
      title: title,
      variationType: "Premium Twitter Thread",
      intro: `🧵 Most creators overcomplicate ${title.toLowerCase()}. Here is the exact high-signal breakdown:`,
      blocks: [
        { label: "1/4 Hook", content: `Most creators struggle with ${title.toLowerCase()}. But the secret isn't more hours—it's high-leverage frameworks. Here are 3 rules that changed everything:` },
        { label: "2/4 Core Idea", content: desc ? `Rule 1: ${desc}` : "Rule 1: Focus on extreme clarity before execution. Cut 30% of unnecessary elements to let your core message breathe." },
        { label: "3/4 Workflow", content: "Rule 2: Systematize your production loop. Spend 80% of your energy on high-converting hooks and actionable conclusions." },
        { label: "4/4 Call to Action", content: "If you found this valuable, bookmark this thread and reply with your biggest question on this workflow!" }
      ],
      hashtags: ["#CreatorEconomy", "#Productivity", "#BuildInPublic"],
      growthTip: "Post this thread between 8:00 AM - 10:00 AM EST for highest quote-tweet amplification."
    };
  }

  if (normPlatform.includes('tik') || normPlatform.includes('reel') || normPlatform.includes('short')) {
    return {
      targetPlatform: "Short-Form Video (Reels / TikTok)",
      title: title,
      variationType: "Short Video Script",
      intro: `🎬 45-Second Fast Hook Script for ${title}`,
      blocks: [
        { label: "Hook (0-3s)", content: `"Stop making this huge mistake with ${title.toLowerCase()}..."`, visualCue: "Direct eye-contact camera punch-in with high-contrast text overlay" },
        { label: "Problem (3-12s)", content: `"Most people waste weeks doing this manually, but there's a simple shortcut that top creators use every single day."`, visualCue: "Screen recording / quick b-roll of current chaotic workflow" },
        { label: "Solution (12-35s)", content: desc ? `"${desc}"` : `"Here is the exact 3-step checklist to streamline this immediately."`, visualCue: "Step-by-step UI visual or 3 clear text cards" },
        { label: "CTA (35-45s)", content: `"Save this video for your next workflow session, and follow for daily creator breakdowns."`, visualCue: "Point to bookmark icon on screen" }
      ],
      hashtags: ["#Shorts", "#CreatorTips", "#Productivity"],
      growthTip: "Ensure captions are enabled and high-contrast—over 70% of mobile users watch without audio."
    };
  }

  return {
    targetPlatform: targetPlatform,
    title: title,
    variationType: "Multi-Platform Story",
    intro: `Structured overview tailored for ${targetPlatform}`,
    blocks: [
      { label: "Main Point", content: `Deep dive into ${title}. Key principle: ${desc || "Optimize for genuine audience value and clear delivery."}` },
      { label: "Execution", content: "Apply this framework systematically across your content calendar for compound growth." }
    ],
    hashtags: ["#CreatorGrowth", "#ContentStrategy"],
    growthTip: "Engage with replies within the first 60 minutes of publishing to boost algorithmic velocity."
  };
}
