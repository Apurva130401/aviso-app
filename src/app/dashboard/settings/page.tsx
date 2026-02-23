"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Bell, Shield, Key, Globe, Save, Copy, RefreshCw, CheckCircle2, AlertTriangle, Monitor, Smartphone, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import {
    updateProfileAction,
    updatePasswordAction,
    updateNotificationsAction,
    updateConnectedAppsAction,
    getApiKeysAction,
    generateApiKeyAction,
    revokeApiKeyAction
} from "./actions";

type TabId = "profile" | "security" | "notifications" | "api-keys" | "connected-apps";

export default function SettingsPage() {
    const { profile, loading: userLoading, refreshProfile } = useUser();
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    // Form States
    const [fullName, setFullName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password States
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // API Keys State
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [newRawKey, setNewRawKey] = useState<{ name: string, key: string } | null>(null);

    // Mock UI States overlaying DB Prefs
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        publicProfile: true,
        marketingEmails: false,
        productUpdates: true,
        securityAlerts: true,
        slack: false,
        notion: false,
        drive: false,
    });

    // Populate state when profile loads
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");
            const prefs = (profile as any).preferences || {};
            setToggles(prev => ({
                ...prev,
                publicProfile: prefs.publicProfile ?? true,
                marketingEmails: prefs.marketingEmails ?? false,
                productUpdates: prefs.productUpdates ?? true,
                securityAlerts: prefs.securityAlerts ?? true,
                slack: prefs.slack ?? false,
                notion: prefs.notion ?? false,
                drive: prefs.drive ?? false,
            }));
        }
    }, [profile]);

    // Fetch API keys when tab becomes active
    useEffect(() => {
        if (activeTab === "api-keys") {
            loadApiKeys();
        }
    }, [activeTab]);

    const loadApiKeys = async () => {
        setLoadingKeys(true);
        const res = await getApiKeysAction();
        if (res.success && res.keys) {
            setApiKeys(res.keys);
        }
        setLoadingKeys(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }
        setIsUpdatingPassword(true);
        const res = await updatePasswordAction(newPassword);
        if (res.success) {
            alert("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
        } else {
            alert("Failed to update password: " + res.error);
        }
        setIsUpdatingPassword(false);
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        const res = await updateProfileAction({
            fullName,
            publicProfile: toggles.publicProfile
        });
        if (res.success) {
            await refreshProfile();
        }
        setIsSavingProfile(false);
    };

    const handleToggleSetting = async (category: string, key: string) => {
        const newValue = !toggles[key];

        // Optimistic UI update
        setToggles(prev => ({ ...prev, [key]: newValue }));

        // Persist DB
        if (category === "profile") {
            // Profile is saved on button click, but we persist toggle instantly for UX? 
            // In this UI, letting the 'Save Changes' handle it is better for publicProfile. Wait, for other toggles they are instant.
            if (key !== 'publicProfile') {
                await updateProfileAction({ fullName, publicProfile: newValue });
                refreshProfile();
            }
        } else if (category === "notifications") {
            await updateNotificationsAction({ [key]: newValue });
            refreshProfile();
        } else if (category === "apps") {
            await updateConnectedAppsAction({ [key]: newValue });
            refreshProfile();
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleGenerateKey = async () => {
        setGeneratingKey(true);
        const name = `Key - ${new Date().toLocaleDateString()}`;
        const res = await generateApiKeyAction(name);
        if (res.success && res.key) {
            setNewRawKey({ name: res.key.name, key: res.rawKey! });
            loadApiKeys();
        }
        setGeneratingKey(false);
    };

    const handleRevokeKey = async (id: string) => {
        if (confirm("Are you sure you want to revoke this API Key? Any application using it will immediately lose access.")) {
            const res = await revokeApiKeyAction(id);
            if (res.success) {
                loadApiKeys();
            }
        }
    };

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: "profile" as TabId, label: "Profile", icon: <User size={16} /> },
        { id: "security" as TabId, label: "Security", icon: <Lock size={16} /> },
        { id: "notifications" as TabId, label: "Notifications", icon: <Bell size={16} /> },
        { id: "api-keys" as TabId, label: "API Keys", icon: <Key size={16} /> },
        { id: "connected-apps" as TabId, label: "Connected Apps", icon: <Globe size={16} /> },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    System <span className="text-accent italic">Settings</span>
                </h1>
                <p className="text-sm text-white/40 font-medium tracking-wide">
                    Manage your account preferences, security, and neural engine configurations.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                {/* Navigation Sidebar */}
                <div className="xl:col-span-1 space-y-1 sticky top-8">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group",
                                activeTab === item.id
                                    ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_15px_rgba(255,170,0,0.1)]"
                                    : "text-white/30 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {item.icon}
                                {item.label}
                            </span>
                            {activeTab === item.id && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-3 min-h-[600px]">

                    {/* --- PROFILE TAB --- */}
                    {activeTab === "profile" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[32px] space-y-8 backdrop-blur-xl">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-1">Profile Configuration</h3>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">General information and public identity.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-accent ml-1">Full Name</label>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="h-14 bg-black/60 border-white/[0.08] rounded-2xl focus:ring-accent/40 text-sm font-medium transition-all hover:border-white/[0.15]"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-accent ml-1">Email Address</label>
                                        <Input defaultValue={profile?.email || ""} className="h-14 bg-black/60 border-white/[0.08] rounded-2xl focus:ring-accent/40 text-sm font-medium transition-all hover:border-white/[0.15]" disabled />
                                        <p className="text-[10px] text-white/20 font-bold ml-1">Email changes require support verification.</p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between group">
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">Public Profile</p>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Make your workspace profile visible to others.</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSetting('profile', 'publicProfile')}
                                        className={cn(
                                            "w-12 h-6 rounded-full p-1 flex items-center transition-all duration-300",
                                            toggles.publicProfile ? "bg-accent justify-end shadow-[0_0_10px_rgba(255,170,0,0.3)]" : "bg-white/10 justify-start"
                                        )}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                    </button>
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <Button onClick={() => setFullName(profile?.full_name || "")} variant="ghost" className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white rounded-xl">Cancel</Button>
                                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="h-12 px-8 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,170,0,0.2)]">
                                        {isSavingProfile ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        {isSavingProfile ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </Card>

                            <Card className="p-8 bg-red-500/5 border-red-500/10 rounded-[32px] border-dashed relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black text-red-500/90 tracking-tight mb-1">Danger Zone</h3>
                                        <p className="text-[10px] text-red-500/40 font-black uppercase tracking-widest">Permanent account actions and workspace deletion.</p>
                                    </div>
                                    <Button variant="outline" className="border-red-500/20 text-red-500/80 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all duration-300">
                                        Delete Workspace
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- SECURITY TAB --- */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[32px] space-y-8 backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />

                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-accent" />
                                        Authentication
                                    </h3>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Manage passwords and login methods.</p>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Current Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="h-12 bg-black/60 border-white/[0.05] rounded-xl focus:ring-accent/40 font-mono"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">New Password</label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-12 bg-black/60 border-white/[0.05] rounded-xl focus:ring-accent/40 font-mono"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 flex justify-end">
                                            <Button
                                                onClick={handleUpdatePassword}
                                                disabled={isUpdatingPassword}
                                                className="h-10 px-6 bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                                            >
                                                {isUpdatingPassword ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                                                {isUpdatingPassword ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- NOTIFICATIONS TAB --- */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[32px] space-y-8 backdrop-blur-xl">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-accent" />
                                        Communication Preferences
                                    </h3>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Control what alerts you receive and where.</p>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { id: 'securityAlerts', title: "Security Alerts", desc: "Logins from new devices, password changes, etc.", required: true },
                                        { id: 'productUpdates', title: "Product Updates", desc: "New features, chassis upgrades, and neural weights.", required: false },
                                        { id: 'marketingEmails', title: "Marketing & Offers", desc: "Special credit top-up offers and partner discounts.", required: false },
                                    ].map((notif) => (
                                        <div key={notif.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                                    {notif.title}
                                                    {notif.required && <span className="text-[9px] bg-white/10 text-white/50 px-2 py-0.5 rounded uppercase tracking-widest font-black">Required</span>}
                                                </p>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{notif.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => !notif.required && handleToggleSetting('notifications', notif.id)}
                                                disabled={notif.required}
                                                className={cn(
                                                    "w-12 h-6 rounded-full p-1 flex items-center transition-all duration-300",
                                                    toggles[notif.id] || notif.required ? "bg-accent justify-end" : "bg-white/10 justify-start",
                                                    notif.required && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- API KEYS TAB --- */}
                    {activeTab === "api-keys" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[32px] space-y-8 backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                                    <Key size={300} />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
                                            <Key className="w-5 h-5 text-accent" />
                                            Developer API Keys
                                        </h3>
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed max-w-sm">
                                            Authenticate requests to our Neural Engine. Keep these tokens highly secure.
                                        </p>
                                    </div>
                                    <Button onClick={handleGenerateKey} disabled={generatingKey} className="h-12 border border-white/10 bg-white/5 text-white hover:bg-accent hover:text-black hover:border-accent font-black uppercase tracking-widest text-[10px] rounded-xl px-6 transition-all shadow-lg flex items-center gap-2 shrink-0">
                                        {generatingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        {generatingKey ? "Generating..." : "Generate New Key"}
                                    </Button>
                                </div>

                                {/* Freshly Generated Key Alert */}
                                {newRawKey && (
                                    <div className="relative z-10 bg-accent/10 border border-accent/20 p-6 rounded-3xl mt-4">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h4 className="text-accent font-bold mb-1">Store this key securely!</h4>
                                                <p className="text-xs text-white/70 mb-4">
                                                    This is the only time you will see the full API key. If you lose it, you will need to generate a new one.
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="px-4 py-3 bg-black/40 rounded-xl border border-white/10 font-mono text-sm inline-flex items-center text-accent break-all">
                                                        {newRawKey.key}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleCopy(newRawKey.key, 'new_key')}
                                                        className={cn(
                                                            "h-12 w-12 rounded-xl shrink-0 transition-all",
                                                            copiedKey === 'new_key' ? "bg-green-500/20 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        {copiedKey === 'new_key' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                    <Button onClick={() => setNewRawKey(null)} variant="ghost" className="text-white/40 hover:text-white h-12 px-4 text-xs font-bold uppercase tracking-widest">Done</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 relative z-10">
                                    {loadingKeys ? (
                                        <div className="text-center py-8">
                                            <RefreshCw className="w-6 h-6 text-white/20 animate-spin mx-auto" />
                                        </div>
                                    ) : apiKeys.length === 0 ? (
                                        <div className="text-center py-8 bg-black/20 rounded-3xl border border-dashed border-white/10">
                                            <p className="text-white/30 text-xs font-black uppercase tracking-widest">No API Keys Associated</p>
                                        </div>
                                    ) : apiKeys.map((apiKey) => (
                                        <div key={apiKey.id} className="p-6 border border-white/5 rounded-3xl bg-black/40 hover:border-white/10 transition-colors group">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-2">{apiKey.name}</p>
                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                        <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10 hidden lg:block" />
                                                        <span>Last Used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full lg:w-auto">
                                                    <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 font-mono text-sm text-white/70 w-full lg:w-48 text-center flex-grow">
                                                        {apiKey.key_hint}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleCopy(apiKey.key_hint, apiKey.id)}
                                                        className={cn(
                                                            "h-12 w-12 rounded-xl shrink-0 transition-all",
                                                            copiedKey === apiKey.id ? "bg-green-500/20 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        {copiedKey === apiKey.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                    <Button onClick={() => handleRevokeKey(apiKey.id)} variant="ghost" className="h-12 px-4 rounded-xl shrink-0 bg-red-500/5 text-red-500/60 hover:bg-red-500/20 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all">
                                                        Revoke
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- CONNECTED APPS TAB --- */}
                    {activeTab === "connected-apps" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 bg-[#0a0a0a]/60 border-white/5 rounded-[32px] space-y-8 backdrop-blur-xl">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-accent" />
                                        Integrations & Auth
                                    </h3>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed max-w-sm">
                                        Connect your workspace to external tools to automate workflows and import data.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'slack', name: "Slack", desc: "Send generated ad creatives directly to channels.", connected: toggles.slack, color: "#E01E5A" },
                                        { id: 'notion', name: "Notion", desc: "Import briefs and export generated assets.", connected: toggles.notion, color: "#fff" },
                                        { id: 'drive', name: "Google Drive", desc: "Sync generated images and video automatically.", connected: toggles.drive, color: "#008744" },
                                    ].map((app) => (
                                        <div key={app.id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col h-full group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg"
                                                    style={{ backgroundColor: `${app.color}15`, color: app.color, border: `1px solid ${app.color}30` }}
                                                >
                                                    {app.name.charAt(0)}
                                                </div>
                                                <button
                                                    onClick={() => handleToggleSetting('apps', app.id)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full p-1 flex items-center transition-all duration-300",
                                                        toggles[app.id] ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] justify-end" : "bg-white/10 justify-start hover:bg-white/20"
                                                    )}
                                                >
                                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                                </button>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                                    {app.name}
                                                    {toggles[app.id] && <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-widest font-black">Active</span>}
                                                </p>
                                                <p className="text-xs text-white/40 leading-relaxed font-medium">{app.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

