"use server";

import { BrandAnalysis, analyzeBrand, generateToneOptions, generateFinalAds, refineContent } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function analyzeBrandAction(url: string, goal?: string, context?: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // Credit Guard (Text Action = 2 credits)
        const creditCost = 2;
        const { data: profile } = await supabase.from("user_profiles").select("credits_total, credits_used").eq("id", user.id).single();
        if (profile && (profile.credits_total - profile.credits_used < creditCost)) {
            return { success: false, error: "CREDITS_EXHAUSTED", message: "Insufficient credits for analysis. Please top up." };
        }

        const analysis = await analyzeBrand(url, goal, context);

        // Deduct credits on success
        await supabase
            .from("user_profiles")
            .update({ credits_used: profile!.credits_used + creditCost })
            .eq("id", user.id);

        // Persist campaign and analysis
        const { data: campaign, error } = await supabase
            .from("campaigns")
            .insert({
                user_id: user.id,
                url,
                goal,
                context,
                status: "analyzed",
                analysis_data: analysis
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/history");
        return { success: true, data: analysis, campaignId: campaign.id };
    } catch (error) {
        console.error("Analysis Error:", error);
        return { success: false, error: "Failed to analyze brand." };
    }
}

export async function generateTonesAction(analysis: BrandAnalysis) {
    try {
        const tones = await generateToneOptions(analysis);
        return { success: true, data: tones };
    } catch (error) {
        console.error("Tone Gen Error:", error);
        return { success: false, error: "Failed to generate tones." };
    }
}

export async function generateAdsAction(
    analysis: BrandAnalysis,
    tone: string,
    platforms: string[],
    settings: Record<string, string[]>,
    includeImages: boolean,
    campaignId?: string
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // Credit Guard (Text = 2, Text+Image = 42)
        const creditCost = includeImages ? 42 : 2;
        const { data: profile } = await supabase.from("user_profiles").select("credits_total, credits_used").eq("id", user.id).single();

        if (profile && (profile.credits_total - profile.credits_used < creditCost)) {
            return { success: false, error: "CREDITS_EXHAUSTED", message: "Insufficient credits. Please top up." };
        }

        const ads = await generateFinalAds(analysis, tone, platforms, settings, includeImages);

        // Deduct Credit upon successful generation
        if (profile) {
            await supabase
                .from("user_profiles")
                .update({ credits_used: profile.credits_used + creditCost })
                .eq("id", user.id);
        }

        if (campaignId) {
            // Save assets to database
            // Flatten platform-keyed object into asset entries
            const assetEntries: any[] = [];
            for (const [platform, variants] of Object.entries(ads)) {
                if (platform === 'adImage') continue; // skip the image data
                if (Array.isArray(variants)) {
                    variants.forEach((variant: any) => {
                        assetEntries.push({
                            campaign_id: campaignId,
                            type: 'creative_set',
                            content: JSON.stringify(variant),
                            metadata: { platform, tone }
                        });
                    });
                }
            }

            const { error: assetError } = await supabase
                .from("assets")
                .insert(assetEntries);

            if (assetError) console.error("Asset Storage Error:", assetError);

            // Update campaign status
            await supabase
                .from("campaigns")
                .update({ status: "completed" })
                .eq("id", campaignId);
        }

        revalidatePath("/dashboard/assets");
        revalidatePath("/dashboard/history");
        return { success: true, data: ads };
    } catch (error) {
        console.error("Ad Gen Error:", error);
        return { success: false, error: "Failed to generate ads." };
    }
}

export async function refineContentAction(content: string, prompt: string) {
    try {
        const refined = await refineContent(content, prompt);
        return { success: true, data: refined };
    } catch (error) {
        console.error("Refine Error:", error);
        return { success: false, error: "Failed to refine content." };
    }
}

// Data Fetching Actions
export async function getDashboardStatsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Ensure profile exists and is synced (Upsert-like logic)
        const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const userEmail = user.email || "";

        let profile = profileData;

        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert({
                    id: user.id,
                    credits_total: 100,
                    credits_used: 0,
                    full_name: fullName,
                    email: userEmail
                })
                .select()
                .single();

            if (createError) console.error("Profile Creation Error:", createError);
            profile = newProfile;
        } else if (profile.full_name !== fullName || profile.email !== userEmail) {
            // Sync if data changed
            const { data: updatedProfile, error: updateError } = await supabase
                .from("user_profiles")
                .update({
                    full_name: profile.full_name || fullName,
                    email: profile.email || userEmail
                })
                .eq("id", user.id)
                .select()
                .single();

            if (!updateError) profile = updatedProfile;
        }

        // 2. Fetch Aggregated Stats
        const [campaigns, assets] = await Promise.all([
            supabase.from("campaigns").select("id", { count: "exact" }).eq("user_id", user.id),
            supabase.from("assets").select("id, campaigns!inner(user_id)", { count: "exact" }).eq("campaigns.user_id", user.id)
        ]);

        const { count: campaignCount } = campaigns;
        const { count: assetCount } = assets;

        return {
            success: true,
            data: {
                totalCampaigns: campaignCount || 0,
                activeCampaigns: campaignCount || 0,
                totalAssets: assetCount || 0,
                creditsUsed: profile?.credits_used || 0,
                creditsTotal: profile?.credits_total || 1000,
                planTier: profile?.plan_tier || 'Starter',
                fullName: profile?.full_name || '',
                email: profile?.email || ''
            }
        };
    } catch (error) {
        console.error("Stats Error:", error);
        return { success: false, error: "Failed to fetch stats." };
    }
}

export async function getCampaignHistoryAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("campaigns")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("History Error:", error);
        return { success: false, error: "Failed to fetch history." };
    }
}

export async function getUserAssetsAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("assets")
            .select("*, campaigns(url)")
            .eq("campaigns.user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Assets Error:", error);
        return { success: false, error: "Failed to fetch assets." };
    }
}

export async function getCampaignAssetsAction(campaignId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("assets")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Campaign Assets Error:", error);
        return { success: false, error: "Failed to fetch campaign assets." };
    }
}

export async function getPaymentHistoryAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Payment history error or table missing:", error);
            // Return empty array if table throws error
            return { success: true, data: [] };
        }
        return { success: true, data };
    } catch (error) {
        console.error("History Error:", error);
        return { success: false, error: "Failed to fetch payment history." };
    }
}
