'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@/types';

type TabType = 'Been' | 'Influence' | 'Notes' | 'Photos';

interface LeaderboardUser extends User {
  rank: number;
  matchPercentage: number;
  score: number;
}

export default function LeaderboardPage() {
  const { data: allUsersData, isLoading } = useLeaderboard();
  const [selectedTab, setSelectedTab] = useState<TabType>('Been');
  const [memberFilter, setMemberFilter] = useState('All Members');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Memoize leaderboard processing - only recalculate when data or tab changes
  const allUsers = useMemo(() => {
    if (!allUsersData) return [];

    // Sort based on selected tab
    let sortedUsers = [...allUsersData];
    switch (selectedTab) {
      case 'Been':
        sortedUsers.sort((a, b) => b.stats.beenCount - a.stats.beenCount);
        break;
      case 'Influence':
        sortedUsers.sort((a, b) => b.stats.followers - a.stats.followers);
        break;
      case 'Notes':
        sortedUsers.sort((a, b) => (b.stats.totalReviews || 0) - (a.stats.totalReviews || 0));
        break;
      case 'Photos':
        sortedUsers.sort((a, b) => b.stats.beenCount - a.stats.beenCount);
        break;
    }

    return sortedUsers.map((user, index) => {
      let score = 0;
      switch (selectedTab) {
        case 'Been':
          score = user.stats.beenCount;
          break;
        case 'Influence':
          score = user.stats.followers;
          break;
        case 'Notes':
          score = user.stats.totalReviews || 0;
          break;
        case 'Photos':
          score = user.stats.beenCount;
          break;
      }

      return {
        ...user,
        rank: index + 1,
        matchPercentage: Math.floor(Math.random() * 30) + 30, // 30-60%
        score,
      };
    });
  }, [allUsersData, selectedTab]);

  // Memoize filtered users - only recalculate when filters or allUsers change
  const users = useMemo(() => {
    let filtered = [...allUsers];

    // Apply city filter
    if (cityFilter !== 'All Cities') {
      filtered = filtered.filter(user => user.location.city === cityFilter);
    }

    // Apply member filter
    if (memberFilter === 'Friends') {
      // Could filter based on following status
    }

    // Re-rank after filtering
    return filtered.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [allUsers, cityFilter, memberFilter]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(allUsers.map(user => user.location.city));
    return ['All Cities', ...Array.from(cities)];
  }, [allUsers]);

  const memberOptions = ['All Members', 'Friends', 'Following'];

  const getSubtitleText = () => {
    switch (selectedTab) {
      case 'Been':
        return 'Number of places on your been list';
      case 'Influence':
        return 'Number of followers';
      case 'Notes':
        return 'Number of reviews written';
      case 'Photos':
        return 'Number of photos uploaded';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Tab Selector */}
      <div className="flex bg-gray-200 rounded-lg p-[2.5px] mt-1.5 mb-2.5">
        {(['Been', 'Influence', 'Notes', 'Photos'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 px-2.5 rounded-md text-[13px] font-medium transition-all ${
              selectedTab === tab
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subtitle */}
      <p className="text-[13px] text-gray-600 mb-2">{getSubtitleText()}</p>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {/* Member Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMemberDropdown(!showMemberDropdown);
              setShowCityDropdown(false);
            }}
            className="flex items-center py-[7px] px-[13px] rounded-[17px] border-[1.3px] border-gray-900 bg-white text-[13px] font-semibold text-gray-900"
          >
            {memberFilter}
            <span className="ml-1.5 text-[8px]">▼</span>
          </button>
          {showMemberDropdown && (
            <div className="absolute top-9 left-0 bg-white rounded-lg border border-gray-200 min-w-[140px] shadow-lg z-50">
              {memberOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setMemberFilter(option);
                    setShowMemberDropdown(false);
                  }}
                  className={`w-full text-left py-2.5 px-3.5 text-[13px] border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    option === memberFilter ? 'text-[#0B7B7F] font-semibold' : 'text-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCityDropdown(!showCityDropdown);
              setShowMemberDropdown(false);
            }}
            className="flex items-center py-[7px] px-[13px] rounded-[17px] border-[1.3px] border-gray-900 bg-white text-[13px] font-semibold text-gray-900"
          >
            {cityFilter}
            <span className="ml-1.5 text-[8px]">▼</span>
          </button>
          {showCityDropdown && (
            <div className="absolute top-9 left-0 bg-white rounded-lg border border-gray-200 min-w-[140px] shadow-lg z-50">
              {uniqueCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setCityFilter(city);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full text-left py-2.5 px-3.5 text-[13px] border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    city === cityFilter ? 'text-[#0B7B7F] font-semibold' : 'text-gray-600'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="pb-4">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center py-[10px] border-b border-[#E5E5EA] hover:bg-gray-50 -mx-4 px-4 transition-colors"
          >
            {/* Rank */}
            <span className="text-sm font-normal text-gray-600 w-6 mr-2">{user.rank}</span>

            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 ml-2">
              <p className="text-sm font-normal text-gray-600 mb-[2px] leading-tight">@{user.username}</p>
              <p className="text-xs font-normal text-[#22C55E] leading-tight">+{user.matchPercentage}% Match</p>
            </div>

            {/* Score */}
            <span className="text-[17px] font-semibold text-gray-900">{user.score}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
