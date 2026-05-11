# Ideal Client Profiler Guide

## Overview

The **Ideal Client Profiler** is a comprehensive workbook integrated into your co-founder app that helps you deeply understand your ideal customer's journey, motivations, and transformation.

This tool is now available in:

1. **Project Dashboard** - Under "Validation Tools" section
2. **Validation Stage** - As a sidebar card within the validation chat interface
3. **Direct Access** - At `/project/[id]/ideal-client-profiler`

## Structure

The profiler is organized into 4 main sections:

### 1. BEFORE - Current State

Understanding your ideal client's current reality, challenges, and context:

- **Demographics & Interests**: What traits and characteristics define your ideal clients?
  - Example: "Football fans who bet live, Web3-curious users with Phantom/MetaMask wallets, sport.fun users, polymarket/kalshi users"

- **What They Think**: Key concerns around Time, Money, Access, Knowledge, Network, Experience
  - How do they spend their mental energy?

- **How They Feel**: Emotional consequences of their current state
  - Frustration, excitement, confusion, anxiety?

- **Previous Purchases/Actions**: Their sunk costs and existing investments
  - Example: "Already using Polymarket/Kalshi, betting on Bet365/DraftKings"

- **Average Day**: Day-to-day behaviors and routines
  - What does a typical day look like for them?

- **Status**: Life circumstances and transitions
  - Career stage, lifestyle, challenges they're facing

### 2. AFTER - Transformed State

The transformation your solution creates:

- **New Haves**: What changes after using your solution
  - New capabilities, skills, access, or status they gain

- **New Feelings**: Emotional shift post-transformation
  - Confidence, relief, excitement, belonging?

- **New Average Day**: How their daily life improves
  - What activities become possible or easier?

- **New Status**: How their life circumstances improve
  - Career advancement, social standing, financial position?

### 3. Market Narrative

Your brand story and market positioning:

- **Contrarian Narrative**: Market insights others haven't discovered yet
  - Example: "Live betting is shifting from traditional sportsbooks to decentralized platforms. Users want on-chain proof of odds and transparent settlement."
  - Include emerging trends and inflection points

- **Villain**: The external force standing in the way of success
  - Not just a problem, but a **root cause**
  - Should be relatable and singular
  - Example: "Centralized betting platforms that take 5-20% margins and restrict trader freedom"

- **Slogan / Rally Cry**: Community-building messages that resonate
  - What brings your community together?
  - Example: "Fair odds. Every trade. No limits."

### 4. Purchase Drivers

What triggers buying decisions:

- **Key Purchase Drivers**: Conditions that enable action
  - What must be true for them to buy?
  - What are the critical pain points they can't live without solving?
  - Example: "Ability to withdraw winnings instantly, transparent odds display, access to major sporting events"

## How to Use

### 1. Fill Out Your Profile

- Navigate to the Ideal Client Profiler from your project dashboard
- Complete all sections based on your research and customer interviews
- Write in a narrative, descriptive style (not bullet points)
- Be specific with examples from real users you've talked to

### 2. Validate Your Assumptions

- Use your responses to guide customer interviews
- Test whether your "Before" and "After" assumptions match reality
- Refine based on feedback

### 3. Use for Marketing & Messaging

- Use your villain and slogan for marketing copy
- Ground your "After" vision in your product roadmap
- Ensure your solution actually delivers on the transformation

### 4. Reference in Other Stages

- Link your ideal client profile to your Lean Canvas
- Use it when defining feature priorities in the Selection stage
- Reference when crafting your Mafia Offer
- Include insights in your pitch deck

## Integration with Other Tools

- **Validation Stage**: The profiler is prominently displayed in your validation stage chat to keep it top-of-mind
- **Project Dashboard**: Access it anytime from the Validation Tools section
- **Context Panel**: Your profiler definitions appear in the cross-stage context
- **Exports**: Include profiler data when exporting your project

## Tips for Great Responses

### Be Specific

❌ "People interested in crypto"
✅ "Urban males 18-35 with existing crypto wallets, active on Twitter/Discord, already trading on dYdX or Uniswap"

### Ground in Reality

❌ "They want to make money online"
✅ "22-year-old college student living in Nigeria with $200 saved. Trades options on Polymarket for 2-4 hours daily. Wants to turn $200 into $2000 in a month."

### Make It Emotional

❌ "They need faster transactions"
✅ "Watching live game odds change in real-time, they feel FOMO when their bet misses by milliseconds, leading to frustration and a sense of missing out on free money"

### Be Honest About the Villain

- It should be a real force, not imaginary
- It should be something specific (not "competition" or "market conditions")
- It should resonate emotionally with your customer

## Database Schema

The profiler is stored in the `IdealClientProfiler` table with fields for:

- Before context: `beforeHaves`, `beforeThinks`, `beforeFeels`, `previousActionsPurchases`, `beforeAverageDay`, `beforeStatus`
- After context: `afterHaves`, `afterFeels`, `afterAverageDay`, `afterStatus`
- Narrative: `contrarian`, `villain`, `slogan`
- Drivers: `keyPurchaseDrivers`

## Next Steps

1. Complete your Ideal Client Profiler
2. Use it as the foundation for your Lean Canvas
3. Reference it when defining your MVP scope
4. Include insights in your investor pitch
5. Continuously validate and refine as you learn

---

**Last Updated**: April 2026
