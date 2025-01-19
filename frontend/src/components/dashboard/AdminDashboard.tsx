import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Coins, 
  Settings, 
  TrendingUp, 
  Shield 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Interfaces for Dashboard Data
interface PlatformStats {
  totalUsers: number;
  totalTokens: number;
  totalVolume: number;
  communityRewardPool: number;
}

interface TokenInfo {
  symbol: string;
  name: string;
  creator: string;
  volume: number;
}

interface UserActivity {
  username: string;
  recentAction: string;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  // State Management
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalTokens: 0,
    totalVolume: 0,
    communityRewardPool: 0
  });

  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Placeholder for actual API calls
        const statsResponse = await fetch('/api/platform/stats');
        const tokensResponse = await fetch('/api/tokens');
        const activitiesResponse = await fetch('/api/user-activities');

        const statsData = await statsResponse.json();
        const tokensData = await tokensResponse.json();
        const activitiesData = await activitiesResponse.json();

        setStats(statsData);
        setTokens(tokensData);
        setUserActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Render Methods
  const renderPlatformStats = () => (
    <motion.div 
      className="grid grid-cols-2 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StatCard 
        icon={<Users />} 
        title="Total Users" 
        value={stats.totalUsers} 
      />
      <StatCard 
        icon={<Coins />} 
        title="Total Tokens" 
        value={stats.totalTokens} 
      />
      <StatCard 
        icon={<TrendingUp />} 
        title="Total Volume" 
        value={`$${stats.totalVolume.toLocaleString()}`} 
      />
      <StatCard 
        icon={<Shield />} 
        title="Community Pool" 
        value={`$${stats.communityRewardPool.toLocaleString()}`} 
      />
    </motion.div>
  );

  const renderTokenList = () => (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Recent Tokens</h2>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th>Symbol</th>
            <th>Name</th>
            <th>Creator</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <tr key={index} className="border-b">
              <td>{token.symbol}</td>
              <td>{token.name}</td>
              <td>{token.creator}</td>
              <td>${token.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUserActivities = () => (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
      <ul>
        {userActivities.map((activity, index) => (
          <li key={index} className="mb-2 pb-2 border-b">
            <strong>{activity.username}</strong> {activity.recentAction}
            <span className="text-gray-500 text-sm ml-2">{activity.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <LayoutDashboard className="mr-4" /> EON XRP Admin Dashboard
        </h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          <Settings className="inline mr-2" /> Platform Settings
        </button>
      </header>

      <main className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {renderPlatformStats()}
          {renderTokenList()}
        </div>
        
        <div>
          {renderUserActivities()}
        </div>
      </main>
    </div>
  );
};

// Utility Component for Stat Cards
const StatCard: React.FC<{ 
  icon: React.ReactNode, 
  title: string, 
  value: number | string 
}> = ({ icon, title, value }) => (
  <motion.div 
    className="bg-white shadow rounded-lg p-4 flex items-center"
    whileHover={{ scale: 1.05 }}
  >
    <div className="bg-blue-100 p-3 rounded-full mr-4">
      {icon}
    </div>
    <div>
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </motion.div>
);

export default AdminDashboard;
