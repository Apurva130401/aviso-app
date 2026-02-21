"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Zap, Target, TrendingUp, Users, Plus, ArrowRight,
  BarChart3, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { getDashboardStatsAction, getCampaignHistoryAction } from "@/app/actions";

export default function OverviewPage() {
  const [stats, setStats] = React.useState([
    { label: "Total Campaigns", val: "0", change: "...", icon: <Zap className="text-accent" /> },
    { label: "Active Nodes", val: "0", change: "...", icon: <Target className="text-primary" /> },
    { label: "Avg. Conversion", val: "0%", change: "...", icon: <TrendingUp className="text-accent" /> },
    { label: "Credits Rem.", val: "0", change: "...", icon: <Users className="text-white/40" /> },
  ]);

  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const [statsRes, historyRes] = await Promise.all([
        getDashboardStatsAction(),
        getCampaignHistoryAction()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats([
          { label: "Total Campaigns", val: statsRes.data.totalCampaigns.toString(), change: "+0%", icon: <Zap className="text-accent" /> },
          { label: "Active Nodes", val: statsRes.data.activeCampaigns.toString(), change: "Live", icon: <Target className="text-primary" /> },
          { label: "Avg. Conversion", val: "4.8%", change: "+0.4%", icon: <TrendingUp className="text-accent" /> }, // Keeping mock for now
          { label: "Credits Rem.", val: (statsRes.data.creditsTotal - statsRes.data.creditsUsed).toString(), change: statsRes.data.planTier, icon: <Users className="text-white/40" /> },
        ]);
      }

      if (historyRes.success && historyRes.data) {
        setRecentActivity(historyRes.data.slice(0, 5).map((c: any) => ({
          id: c.id,
          title: c.url,
          status: c.status,
          type: "AI Synthesis",
          time: new Date(c.created_at).toLocaleDateString()
        })));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Workspace <span className="text-accent italic">Overview</span>
          </h1>
          <p className="text-sm text-white/40 font-medium tracking-wide">
            Intelligence performance and operational status for Workspace 01.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button size="lg" className="h-12 bg-accent text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-accent/5">
            <Plus className="mr-2 w-4 h-4" strokeWidth={3} /> New Campaign
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-[#0a0a0a]/40 border-white/5 rounded-[24px] hover:border-accent/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                {(stat.icon as any) && React.cloneElement(stat.icon as React.ReactElement<any>, { size: 16, strokeWidth: 2.5 })}
              </div>
              <span className={cn(
                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                stat.change.startsWith("+") ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40"
              )}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-white tracking-tighter">{stat.val}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Performance Chart Placeholder */}
        <Card className="lg:col-span-2 p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Campaign Velocity</h3>
              <p className="text-xs text-white/30 font-medium tracking-wide">Output metrics over the last 30 days.</p>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D'].map(t => (
                <button key={t} className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", t === '30D' ? "bg-accent text-black" : "bg-white/5 text-white/40 hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <div className="text-center space-y-2">
              <BarChart3 className="w-8 h-8 text-white/10 mx-auto" />
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Analytics Module Loading...</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-8 bg-[#0a0a0a]/40 border-white/5 rounded-[32px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white tracking-tight">Recent Activity</h3>
            <Clock className="w-4 h-4 text-white/20" />
          </div>

          <div className="space-y-6 flex-1">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex gap-4 group cursor-pointer">
                <div className={cn(
                  "mt-1 w-2 h-2 rounded-full ring-4 ring-offset-0 ring-white/[0.02]",
                  act.status === 'completed' ? "bg-primary" : act.status === 'failed' ? "bg-red-500/50" : "bg-accent animate-pulse"
                )} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-white group-hover:text-accent transition-colors">{act.title}</p>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{act.time}</span>
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-black">{act.type}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-8 group text-white/40 hover:text-white font-black uppercase tracking-widest text-[9px]">
            View All History <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
