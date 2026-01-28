/**
 * StatsPanel - Dashboard statistics display
 */
import { motion } from 'framer-motion';
import {
    Users,
    AlertTriangle,
    Building2,
    CreditCard,
    Skull,
    TrendingUp
} from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsPanelProps {
    stats: DashboardStats;
    loading?: boolean;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-[#1a1a2e] rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            </div>
        </div>
    </motion.div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-[#1a1a2e] rounded-xl p-4 border border-zinc-800 animate-pulse">
                        <div className="h-12 bg-zinc-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
                icon={<Users className="w-5 h-5 text-emerald-400" />}
                label="Employees"
                value={stats.totalEmployees}
                color="bg-emerald-500/20"
                delay={0}
            />
            <StatCard
                icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                label="Total Flags"
                value={stats.totalFlags}
                color="bg-red-500/20"
                delay={0.1}
            />
            <StatCard
                icon={<CreditCard className="w-5 h-5 text-amber-400" />}
                label="Ghost Families"
                value={stats.ghostFamilies}
                color="bg-amber-500/20"
                delay={0.2}
            />
            <StatCard
                icon={<Building2 className="w-5 h-5 text-purple-400" />}
                label="Identity Theft"
                value={stats.identityTheft}
                color="bg-purple-500/20"
                delay={0.3}
            />
            <StatCard
                icon={<Skull className="w-5 h-5 text-rose-400" />}
                label="Living Dead"
                value={stats.livingDead}
                color="bg-rose-500/20"
                delay={0.4}
            />
            <StatCard
                icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
                label="At Risk (KES)"
                value={`${(stats.totalAtRisk / 1000000).toFixed(1)}M`}
                color="bg-blue-500/20"
                delay={0.5}
            />
        </div>
    );
};

export default StatsPanel;
