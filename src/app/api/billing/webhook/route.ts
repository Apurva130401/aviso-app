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
            case "order.paid": {
                const { notes, amount } = payload.payment.entity;
                const userId = notes.userId;
                const creditsToAdd = parseInt(notes.credits || "0", 10);

                if (!userId || !creditsToAdd) {
                    console.error("Missing userId or credits in webhook notes");
                    break;
                }

                // Fetch current user profile to add to existing balance
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("credits_total")
                    .eq("id", userId)
                    .single();

                if (profile) {
                    await supabase
                        .from("user_profiles")
                        .update({
                            credits_total: profile.credits_total + creditsToAdd
                        })
                        .eq("id", userId);
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
