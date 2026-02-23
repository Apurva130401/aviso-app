"use server";

import { createClient } from "@/lib/supabase/server";
import { Coupon } from "@/config/billing";

/**
 * Validates a coupon code and returns the coupon object if valid.
 * This runs securely on the server.
 */
export async function validateCouponAction(code: string, packageId: string): Promise<Coupon | null> {
    if (!code) return null;

    const supabase = await createClient();
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

    if (error || !coupon) {
        return null;
    }

    // Map database fields to our internal Coupon type
    const parsedCoupon: Coupon = {
        code: coupon.code,
        discountType: coupon.discount_type as 'percentage' | 'fixed',
        discountValue: coupon.discount_value,
        description: coupon.description,
        validFor: coupon.valid_for || undefined,
        showOnDashboard: coupon.show_on_dashboard,
        maxUsesPerUser: coupon.max_uses_per_user
    };

    // Enforce max uses conditionally if it is > 0 (0 means unlimited)
    if (parsedCoupon.maxUsesPerUser && parsedCoupon.maxUsesPerUser > 0) {
        // Find if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Count how many times they have used this code
            const { count, error: countError } = await supabase
                .from('coupon_uses')
                .select('*', { count: 'exact', head: true })
                .eq('coupon_code', parsedCoupon.code)
                .eq('user_id', user.id);

            if (!countError && count !== null && count >= parsedCoupon.maxUsesPerUser) {
                return null; // They have maxed out their uses!
            }
        }
    }

    // Check if valid for this package
    if (parsedCoupon.validFor && !parsedCoupon.validFor.includes(packageId)) {
        return null;
    }

    return parsedCoupon;
}

/**
 * Fetches all available coupons for display on the frontend.
 */
export async function getAvailableCouponsAction(): Promise<Coupon[]> {
    const supabase = await createClient();
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .eq('show_on_dashboard', true);

    if (error || !coupons) {
        return [];
    }

    return coupons.map(c => ({
        code: c.code,
        discountType: c.discount_type as 'percentage' | 'fixed',
        discountValue: c.discount_value,
        description: c.description,
        validFor: c.valid_for || undefined,
        showOnDashboard: c.show_on_dashboard,
        maxUsesPerUser: c.max_uses_per_user
    }));
}
