# Pricing & Cost Analysis Strategy

Based on the Gemini API pricing models you provided, here is a breakdown of your application's generation costs, cost-per-action, and recommended pricing plans to ensure profitability.

## 1. Cost Breakdown (API Costs)

### **Text Generation (`gemini-flash-latest`)**
This model will handle brand analysis, tone suggestions, and ad copy generation.
*   **Input Cost:** $0.30 per 1M tokens
*   **Output Cost:** $2.50 per 1M tokens

**Estimated Cost per Action (Text):**
Assuming an average complete campaign generation uses ~2,000 input tokens (prompt + context) and ~1,000 output tokens (the generated ads):
*   Input: (2,000 / 1,000,000) * $0.30 = $0.0006
*   Output: (1,000 / 1,000,000) * $2.50 = $0.0025
*   **Total Text Cost per Campaign: ~$0.0031** (approx. 0.3 cents)

### **Image Generation (`gemini-3-pro-image-preview`)**
This model will handle generating the high-end ad creatives.
*   **Cost:** $0.134 per image generated.
*   **Total Image Cost per Campaign (1 Image): $0.134**

### **Total Combined Cost**
*   **Full Campaign (Text + 1 Image): ~$0.137** per generation.
*   *(Note: Image generation makes up ~98% of the cost of a full campaign).*

---

## 2. Recommended Credit System

To abstract the complex pricing and control your margins, you should use a **Credit System**. 
Since images are significantly more expensive than text, actions should cost a different amount of credits.

**Credit Valuation Baseline:** `1 Credit = $0.01 (1 cent) of retail value.`

| Action | API Cost to You | Credits to Charge User | Retail Value | Gross Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Generate Ad Copy (Text Only)** | $0.003 | **2 Credits** | $0.02 | 85% |
| **Generate Ad Image (Image Only)** | $0.134 | **40 Credits** | $0.40 | 66% |
| **Full Campaign (Text + Image)** | $0.137 | **42 Credits** | $0.42 | 67% |

*By charging 40 credits for an image, you protect yourself against users spamming the expensive image generation endpoint.*

---

## 3. Recommended Pricing Plans

Based on standard SaaS margins (typically targeting 70-80% gross margins to cover hosting, support, and customer acquisition), here are recommended pricing tiers:

### **Tier 1: Starter / Free Trial**
*   **Credits:** 100 Credits (Retail value: $1.00)
*   **Cost to You:** ~$0.33 maximum (if they use it all on images/text)
*   **What it gets them:** ~2 Full Campaigns + a few extra text variations to hook them in.
*   *(Note: The previous codebase had this at 1,000 credits. 1k credits = $3.30 cost to you per free user. To stay profitable, recommend lowering the free tier to 100-200 credits).*

### **Tier 2: Pro Plan ($29 / month)**
*   **Credits Included:** 3,500 Credits per month
*   **What it gets them:** Up to ~80 Full Campaigns (Text + Image) OR 1,750 Text-only campaigns.
*   **Cost to You (Max Usage):** ~$11.50
*   **Profit Margin:** ~60%

### **Tier 3: Agency Plan ($79 / month)**
*   **Credits Included:** 10,000 Credits per month
*   **What it gets them:** Up to ~235 Full Campaigns OR 5,000 Text-only campaigns.
*   **Cost to You (Max Usage):** ~$33.00
*   **Profit Margin:** ~58%

*(Note: In the webhook file you mentioned `plan_pro_123` gave 15,000 credits. If you give 15,000 credits, a user could generate 375 images costing you $50.25. If your plan is only $29/mo, you would lose $21 per heavy user. Be very careful with the 15k credit allocation unless the plan is priced at $99+).*

---

## 4. Additional Credit Purchase (Top-ups)

When users exhaust their monthly plan credits, they should be prompted to recharge. Top-ups should be priced slightly higher than subscription credits to encourage upgrading their monthly plan.

*   **Small Top-up:** $10 for 800 Credits ($0.0125 / credit)
*   **Medium Top-up:** $25 for 2,200 Credits ($0.0113 / credit)
*   **Large Top-up:** $50 for 5,000 Credits ($0.0100 / credit)

### How to Implement This
1.  **Frontend:** Update the `billing/page.tsx` to display these plans and sell the "Top-up" packages via one-time Razorpay links.
2.  **Backend:** In `src/app/actions.ts` or `src/lib/gemini.ts`, deduct the exact amount of credits before generating:
    *   `-2 credits` for text workflows.
    *   `-40 credits` for image workflows.
    *   If `credits_total < credits_used + action_cost`, throw a `Insufficient Credits` error and show a "Recharge" modal.
