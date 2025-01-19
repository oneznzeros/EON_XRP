import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  Rocket, 
  TrendingUp, 
  Shield 
} from 'lucide-react';

// Simulated data - will be replaced with actual backend connections
const mockDashboardData = {
  communityStats: {
    totalMembers: 1,
    projectPools: 0,
    totalFundsRaised: 20, // Starting XRP
    potentialRevenue: 0
  },
  recentActivity: [],
  upcomingFeatures: [
    'Meme Coin Launchpad',
    'Community Funding Pools',
    'Skill Matching Network'
  ]
};

export const LeaderDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend 
  }: { 
    icon: React.ElementType, 
    title: string, 
    value: number | string, 
    trend?: 'up' | 'down' | 'neutral' 
  }) => (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10 hover:border-primary/50 transition-all"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Icon className="text-primary w-8 h-8" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {trend && (
          <span className={`
            ${trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'}
          `}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-bold text-white">{value}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          EON XRP Community Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            title="Community Members" 
            value={dashboardData.communityStats.totalMembers} 
            trend="up"
          />
          <StatCard 
            icon={Coins} 
            title="Total Funds" 
            value={`${dashboardData.communityStats.totalFundsRaised} XRP`} 
            trend="neutral"
          />
          <StatCard 
            icon={Rocket} 
            title="Project Pools" 
            value={dashboardData.communityStats.projectPools} 
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-3 text-primary" /> 
              Upcoming Features
            </h2>
            <ul className="space-y-2">
              {dashboardData.upcomingFeatures.map((feature, index) => (
                <li 
                  key={index} 
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <Shield className="mr-2 w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <LayoutDashboard className="mr-3 text-primary" /> 
              Community Roadmap
            </h2>
            <div className="space-y-2 text-white/80">
              <p>🚀 Phase 1: Platform Development</p>
              <p>🤝 Phase 2: Community Onboarding</p>
              <p>💡 Phase 3: First Collaborative Project</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
