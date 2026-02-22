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
            'starter': { amount: 1000, credits: 1000, description: '1000 Credits (Starter)' }, // $10.00
            'growth': { amount: 2500, credits: 3000, description: '3000 Credits (Growth)' }, // $25.00
            'pro': { amount: 5000, credits: 7500, description: '7500 Credits (Pro)' }, // $50.00
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
                receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
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
