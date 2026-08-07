# StockFlow AI Features Roadmap

Ideas to make StockFlow more advanced and unique with AI-powered capabilities.

---

## Best Starting Set (MVP)

| Priority | Feature | Why first |
|----------|---------|-----------|
| 1 | **AI Chat Assistant** | Visible, unique, works with current inventory data |
| 2 | **Smart Reorder Suggestions** | Directly improves existing low-stock alerts |
| 3 | **Natural Language Search** | Makes the inventory table feel modern instantly |

---

## High Impact Differentiators

### 1. Smart Reorder Suggestions
AI analyzes quantity, min stock, usage patterns, and activity history to suggest *when* and *how much* to reorder — not just "low stock," but "you'll run out in ~5 days based on recent removals."

### 2. Natural Language Inventory Search
Let users ask things like *"Show me low stock safety items in Warehouse B"* or *"Which user has the most out-of-stock electronics?"* instead of filtering manually.

### 3. AI Inventory Assistant (Chat)
A sidebar chatbot for admins and users:
- **Admin:** *"Summarize today's activity"*, *"Who needs restocking help?"*
- **User:** *"What should I check first today?"*, *"Explain why this item is flagged"*

### 4. Anomaly Detection
Flag unusual behavior automatically:
- Sudden large quantity drops
- Same SKU updated repeatedly
- Items inactive for a long time but still marked in stock

---

## Predictive & Planning

### 5. Demand Forecasting
Replace static trend charts with AI-generated forecasts per category or item — expected usage over the next 30 days based on historical activity.

### 6. Intelligent Min-Stock Recommendations
AI suggests optimal minimum stock thresholds per item based on usage speed, category, and location.

### 7. Seasonal / Trend Insights
Monthly AI summary on Analytics: *"Safety supplies usage up 22% this month"* or *"Electronics restocks slowing down."*

---

## Workflow Automation

### 8. Auto-Categorization & Smart Item Entry
When adding an item, AI suggests category, unit, min stock, and location from the item name or description.

### 9. Duplicate / Similar Item Detection
On create, warn: *"This looks similar to 'Safety Gloves (Large)' — merge or continue?"*

### 10. Smart Notifications Digest
One daily or weekly summary instead of many alerts:
- Top 3 urgent items
- What changed since yesterday
- Suggested actions for admin vs user

---

## Admin-Specific AI

### 11. Workload Balancing
Recommend reassigning items between warehouse users based on volume, alerts, and activity.

### 12. One-Click Executive Summary
Admin dashboard card: *"Organization health: 78% items healthy, 4 critical alerts, Electronics needs attention."*

### 13. Policy-Aware AI Actions
Suggest rules like: *"Auto-flag any Safety item below 10 units"* or *"Notify admin when any user has 3+ out-of-stock items."*

---

## User-Specific AI

### 14. Personal Daily Briefing
When a user opens the dashboard: *"You have 2 low-stock items. Restock Safety Vests first — usage has been steady."*

### 15. Smart Restock Reminders
Contextual nudges based on role and history, not generic alerts.

---

## Unique "Wow" Features

### 16. Voice / Photo Inventory Updates
- Snap a photo of a shelf → AI estimates count or identifies item type
- Voice: *"Remove 5 units from SKU-1042"* → updates inventory

### 17. What-If Simulator
Admin asks: *"If we reduce min stock on all Supplies by 20%, how many alerts would we get?"*

### 18. AI-Generated Reports
Export PDF or email reports with plain-language summaries, charts, and recommendations.

---

## Implementation Notes

- Wire AI through **Vercel AI SDK** + API routes for chat, summaries, and structured output
- Pass structured context from existing items, activity, and user data
- Use **AI Gateway** (`AI_GATEWAY_API_KEY`) for model routing on Vercel
- Add **embeddings** later if inventory scale grows beyond client-side search
- Provide **heuristic fallbacks** when no API key is configured (local dev)

---

## Branch Plan

| Branch | Feature | Status |
|--------|---------|--------|
| `feat/ai-feature-chat-assistant` | AI chat sidebar in dashboard | Done |
| `feat/ai-feature-smart-reorder` | Smart reorder suggestions on dashboard | Done |
| `feat/ai-feature-natural-language-search` | NL search on inventory page | Done |

### Setup

Add `AI_GATEWAY_API_KEY` to `.env.local` (see `.env.example`) for full AI responses. Local heuristic fallbacks work without a key.
