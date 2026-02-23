import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { packages, calculateFinalAmount } from "@/config/billing";
import { validateCouponAction } from "@/app/actions/billing.actions";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, packageId, couponCode } = body;

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

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        let finalAmountInCents = selectedPackage.amount;

        let validCoupon = null;

        // Properly validate coupon via DB and calculate final amount
        if (couponCode) {
            validCoupon = await validateCouponAction(couponCode, selectedPackage.id);
            finalAmountInCents = calculateFinalAmount(selectedPackage.amount, validCoupon);
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

        await supabase.from("payments").insert({
            user_id: user.id,
            razorpay_order_id,
            razorpay_payment_id,
            amount: finalAmountInCents / 100, // log in dollars
            status: "paid",
            credits_added: selectedPackage.credits,
            package_id: packageId
        }).then(res => {
            if (res.error) console.log("Failed to log payment (table might not exist yet)", res.error);
        });

        // Log coupon usage if a valid coupon was applied
        if (validCoupon) {
            await supabase.from("coupon_uses").insert({
                user_id: user.id,
                coupon_code: validCoupon.code
            }).then(res => {
                if (res.error) console.error("Failed to log coupon usage", res.error);
            });
        }

        return NextResponse.json({ success: true, creditsAdded: selectedPackage.credits });
    } catch (error: any) {
        console.error("Verify Payment Error:", error);
        return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
    }
}
