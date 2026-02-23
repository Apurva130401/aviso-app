"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from 'crypto';

// --- PROFILE ACTIONS ---
export async function updateProfileAction(data: { fullName: string; publicProfile: boolean; }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // Update auth user full_name
        await supabase.auth.updateUser({
            data: { full_name: data.fullName }
        });

        // Update preferences in user_profiles
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("preferences")
            .eq("id", user.id)
            .single();

        const currentPrefs = profile?.preferences || {};
        const newPrefs = { ...currentPrefs, publicProfile: data.publicProfile };

        const { error } = await supabase
            .from("user_profiles")
            .update({
                full_name: data.fullName,
                preferences: newPrefs
            })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- SECURITY ACTIONS ---
export async function updatePasswordAction(password: string) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) throw new Error("Unauthorized");

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}



// --- NOTIFICATIONS ACTIONS ---
export async function updateNotificationsAction(prefs: { securityAlerts?: boolean; productUpdates?: boolean; marketingEmails?: boolean }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("preferences")
            .eq("id", user.id)
            .single();

        const newPrefs = {
            ...(profile?.preferences || {}),
            ...prefs
        };

        const { error } = await supabase
            .from("user_profiles")
            .update({ preferences: newPrefs })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- CONNECTED APPS ACTIONS ---
export async function updateConnectedAppsAction(apps: { slack?: boolean; notion?: boolean; drive?: boolean }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("preferences")
            .eq("id", user.id)
            .single();

        const newPrefs = {
            ...(profile?.preferences || {}),
            ...apps
        };

        const { error } = await supabase
            .from("user_profiles")
            .update({ preferences: newPrefs })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- API KEYS ACTIONS ---

export async function getApiKeysAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Unauthorized" };

        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return { success: true, keys: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateApiKeyAction(name: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // Generate a secure random string (32 bytes = 64 hex chars)
        const rawKey = crypto.randomBytes(32).toString('hex');
        const fullKey = `sk_live_${rawKey}`;

        // In a real production app, we would hash the key before storing it
        // and only ever show the user the raw key ONCE.
        // Below is a simplified representation:
        const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

        const keyHint = `sk_live_...${fullKey.slice(-4)}`;

        const { data, error } = await supabase
            .from("api_keys")
            .insert({
                user_id: user.id,
                name,
                key_hash: keyHash,
                key_hint: keyHint
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        // We return the raw fullKey only this one time
        return { success: true, key: data, rawKey: fullKey };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function revokeApiKeyAction(keyId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from("api_keys")
            .delete()
            .eq("id", keyId)
            .eq("user_id", user.id); // Security: ensure user owns the key

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
