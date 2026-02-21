import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { packageId } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Define the packages
        const packages: Record<string, { amount: number, credits: number, description: string }> = {
            'small_topup': { amount: 1000, credits: 800, description: '800 Credits Top-up (Small)' }, // $10.00
            'medium_topup': { amount: 2500, credits: 2200, description: '2200 Credits Top-up (Medium)' }, // $25.00
            'large_topup': { amount: 5000, credits: 5000, description: '5000 Credits Top-up (Large)' }, // $50.00
        };

        const selectedPackage = packages[packageId];

        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package selected" }, { status: 400 });
        }

        const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

        // Create Order via Razorpay REST API
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(razorpayKeyId + ":" + razorpayKeySecret).toString("base64")}`,
            },
            body: JSON.stringify({
                amount: selectedPackage.amount, // amount in the smallest currency unit (cents, paise)
                currency: "USD",
                receipt: `receipt_${user.id}_${Date.now()}`,
                notes: {
                    userId: user.id,
                    packageId: packageId,
                    credits: selectedPackage.credits.toString()
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
