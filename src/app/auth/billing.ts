"use server";

import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createSubscriptionAction(planName: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Define plan IDs based on planName (These would be created in Razorpay Dashboard)
        const planIds: Record<string, string> = {
            'Pro': 'plan_pro_123', // Placeholder
            'Enterprise': 'plan_ent_456' // Placeholder
        };

        const planId = planIds[planName];
        if (!planId) throw new Error("Invalid plan selection");

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 12, // For 1 year
            quantity: 1,
            customer_notify: 1,
            notes: {
                userId: user.id
            }
        });

        return { success: true, subscriptionId: subscription.id };
    } catch (error: any) {
        console.error("Razorpay Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getRazorpayKeyAction() {
    return { key: process.env.RAZORPAY_KEY_ID };
}

