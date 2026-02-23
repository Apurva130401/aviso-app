

export type Package = {
    id: string;
    name: string;
    price: string; // Display price e.g. "$10"
    amount: number; // Price in cents e.g. 1000
    credits: number; // Number of credits
    creditsLabel: string; // Display credits e.g. "1000 Credits"
    description: string;
    features: string[];
    bestValue?: boolean;
};

export type Coupon = {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number; // If percentage, 1-100. If fixed, amount in cents.
    validFor?: string[]; // Array of package IDs this applies to. If undefined, applies to all.
    description: string;
    showOnDashboard?: boolean; // If false, the coupon will be hidden from the billing UI
    maxUsesPerUser?: number;
};

export const packages: Record<string, Package> = {
    'starter': {
        id: 'starter',
        name: 'Starter Refill',
        price: '$10',
        amount: 1000,
        credits: 1000,
        creditsLabel: '1000 Credits',
        description: '1000 Credits (Starter)',
        features: ["1 Text-only Campaign", "Basic Email Support"]
    },
    'growth': {
        id: 'growth',
        name: 'Growth Refill',
        price: '$25',
        amount: 2500,
        credits: 3000,
        creditsLabel: '3000 Credits',
        description: '3000 Credits (Growth)',
        features: ["Ideal for Image Gen", "Priority Queue", "Email Support"],
        bestValue: true
    },
    'pro': {
        id: 'pro',
        name: 'Pro Bulk',
        price: '$50',
        amount: 5000,
        credits: 7500,
        creditsLabel: '7500 Credits',
        description: '7500 Credits (Pro)',
        features: ["Maximum Margin", "Dedicated Rep", "24/7 Support"]
    },
};
/**
 * Calculates the final amount in cents after applying a coupon object.
 */
export function calculateFinalAmount(packageAmount: number, coupon?: Coupon | null): number {
    if (!coupon) return packageAmount;

    if (coupon.discountType === 'percentage') {
        const discount = Math.floor((packageAmount * coupon.discountValue) / 100);
        return Math.max(0, packageAmount - discount);
    } else if (coupon.discountType === 'fixed') {
        return Math.max(0, packageAmount - coupon.discountValue);
    }

    return packageAmount;
}
