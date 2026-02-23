import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { packages, calculateFinalAmount } from "@/config/billing";
import { validateCouponAction } from "@/app/actions/billing.actions";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { packageId, couponCode } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const selectedPackage = packages[packageId];

        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package selected" }, { status: 400 });
        }

        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        let finalAmount = selectedPackage.amount;

        // Properly validate coupon via DB and calculate final amount 
        if (couponCode) {
            const validCoupon = await validateCouponAction(couponCode, selectedPackage.id);
            finalAmount = calculateFinalAmount(selectedPackage.amount, validCoupon);
        }

        // Create Order via Razorpay REST API
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(razorpayKeyId + ":" + razorpayKeySecret).toString("base64")}`,
            },
            body: JSON.stringify({
                amount: finalAmount, // amount in the smallest currency unit (cents, paise)
                currency: "USD",
                receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
                notes: {
                    userId: user.id,
                    packageId: packageId,
                    credits: selectedPackage.credits.toString(),
                    couponApplied: couponCode || 'NONE'
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Razorpay Order Error:", errorData);
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        const order = await response.json();

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: razorpayKeyId
        });

    } catch (error: any) {
        console.error("Create Order Setup Error:", error);
        return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }
}
