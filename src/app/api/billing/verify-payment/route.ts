import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, packageId } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error("Missing razorpay secret");

        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const packages: Record<string, { amount: number, credits: number, description: string }> = {
            'starter': { amount: 1000, credits: 1000, description: '1000 Credits (Starter)' }, // $10.00
            'growth': { amount: 2500, credits: 3000, description: '3000 Credits (Growth)' }, // $25.00
            'pro': { amount: 5000, credits: 7500, description: '7500 Credits (Pro)' }, // $50.00
        };

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        // Fetch current user profile to add to existing balance
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("credits_total")
            .eq("id", user.id)
            .single();

        if (profile) {
            await supabase
                .from("user_profiles")
                .update({
                    credits_total: profile.credits_total + selectedPackage.credits
                })
                .eq("id", user.id);
        }

        // We can also try inserting to a payments table if it exists
        // (Silently fail if it doesn't so we don't crash)
        await supabase.from("payments").insert({
            user_id: user.id,
            razorpay_order_id,
            razorpay_payment_id,
            amount: selectedPackage.amount / 100, // back to dollars
            status: "paid",
            credits_added: selectedPackage.credits,
            package_id: packageId
        }).then(res => {
            if (res.error) console.log("Failed to log payment (table might not exist yet)", res.error);
        });

        return NextResponse.json({ success: true, creditsAdded: selectedPackage.credits });
    } catch (error: any) {
        console.error("Verify Payment Error:", error);
        return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
    }
}
