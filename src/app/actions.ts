"use server";

import { BrandAnalysis, analyzeBrand, generateToneOptions, generateFinalAds, refineContent } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function analyzeBrandAction(url: string, goal?: string, context?: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // Credit Guard
        const { data: profile } = await supabase.from("user_profiles").select("credits_total, credits_used").eq("id", user.id).single();
        if (profile && profile.credits_used >= profile.credits_total) {
            return { success: false, error: "CREDITS_EXHAUSTED", message: "You have exhausted your neural credits. Please upgrade your plan or top up." };
        }

        const analysis = await analyzeBrand(url, goal, context);

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
        const ads = await generateFinalAds(analysis, tone, platforms, settings, includeImages);

        // Deduct Credit (100 credits per successful generation flow)
        const creditCost = 100;
        const { data: profile } = await supabase.from("user_profiles").select("credits_used").eq("id", (await supabase.auth.getUser()).data.user?.id).single();
        if (profile) {
            await supabase
                .from("user_profiles")
                .update({ credits_used: (profile.credits_used || 0) + creditCost })
                .eq("id", (await supabase.auth.getUser()).data.user?.id);
        }

        if (campaignId) {
            // Save assets to database
            const assetEntries = ads.map((ad: any) => ({
                campaign_id: campaignId,
                type: ad.type || 'creative_set',
                content: typeof ad === 'string' ? ad : JSON.stringify(ad),
                metadata: { platform: ad.platform, tone }
            }));

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

        // 1. Ensure profile exists (Upsert logic)
        const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        let profile = profileData;

        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert({
                    id: user.id,
                    credits_total: 1000,
                    credits_used: 0,
                    plan_tier: 'Starter'
                })
                .select()
                .single();

            if (createError) console.error("Profile Creation Error:", createError);
            profile = newProfile;
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
                planTier: profile?.plan_tier || 'Starter'
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
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Assets Error:", error);
        return { success: false, error: "Failed to fetch assets." };
    }
}
