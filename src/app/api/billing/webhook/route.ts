import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get("x-razorpay-signature");
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret!)
            .update(JSON.stringify(body))
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const supabase = await createClient();
        const event = body.event;
        const payload = body.payload;

        switch (event) {
            case "subscription.activated":
            case "subscription.charged": {
                const userId = payload.subscription.entity.notes.userId;
                const planId = payload.subscription.entity.plan_id;

                // Map planId back to tier and credits
                let tier = 'Starter';
                let creditsTotal = 1000;

                if (planId === 'plan_pro_123') {
                    tier = 'Pro';
                    creditsTotal = 15000;
                }

                await supabase
                    .from("user_profiles")
                    .update({
                        plan_tier: tier,
                        credits_total: creditsTotal,
                        subscription_id: payload.subscription.entity.id,
                        subscription_status: 'active'
                    })
                    .eq("id", userId);
                break;
            }
            case "subscription.halted":
            case "subscription.cancelled": {
                const userId = payload.subscription.entity.notes.userId;
                await supabase
                    .from("user_profiles")
                    .update({ subscription_status: 'inactive' })
                    .eq("id", userId);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
