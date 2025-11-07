'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLeaderboard } from '@/lib/hooks/use-leaderboard';

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
    const sortedUsers = [...allUsersData];
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
      filtered = filtered.filter((user) => user.location.city === cityFilter);
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
    const cities = new Set(allUsers.map((user) => user.location.city));
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
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Tab Selector */}
      <div className="mb-2.5 mt-1.5 flex rounded-lg bg-gray-200 p-[2.5px]">
        {(['Been', 'Influence', 'Notes', 'Photos'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all ${
              selectedTab === tab
                ? 'bg-white font-semibold text-gray-900 shadow-sm'
                : 'text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subtitle */}
      <p className="mb-2 text-[13px] text-gray-800">{getSubtitleText()}</p>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {/* Member Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMemberDropdown(!showMemberDropdown);
              setShowCityDropdown(false);
            }}
            className="flex items-center rounded-[17px] border-[1.3px] border-gray-900 bg-white px-[13px] py-[7px] text-[13px] font-semibold text-gray-900"
          >
            {memberFilter}
            <span className="ml-1.5 text-[8px]">▼</span>
          </button>
          {showMemberDropdown && (
            <div className="absolute left-0 top-9 z-50 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-lg">
              {memberOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setMemberFilter(option);
                    setShowMemberDropdown(false);
                  }}
                  className={`w-full border-b border-gray-100 px-3.5 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-gray-50 ${
                    option === memberFilter ? 'font-semibold text-[#0B7B7F]' : 'text-gray-800'
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
            className="flex items-center rounded-[17px] border-[1.3px] border-gray-900 bg-white px-[13px] py-[7px] text-[13px] font-semibold text-gray-900"
          >
            {cityFilter}
            <span className="ml-1.5 text-[8px]">▼</span>
          </button>
          {showCityDropdown && (
            <div className="absolute left-0 top-9 z-50 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-lg">
              {uniqueCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setCityFilter(city);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full border-b border-gray-100 px-3.5 py-2.5 text-left text-[13px] last:border-b-0 hover:bg-gray-50 ${
                    city === cityFilter ? 'font-semibold text-[#0B7B7F]' : 'text-gray-800'
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
            className="-mx-4 flex items-center border-b border-[#E5E5EA] px-4 py-[10px] transition-colors hover:bg-gray-50"
          >
            {/* Rank */}
            <span className="mr-2 w-6 text-sm font-normal text-gray-800">{user.rank}</span>

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="ml-2 flex-1">
              <p className="mb-[2px] text-sm font-normal leading-tight text-gray-800">
                @{user.username}
              </p>
              <p className="text-xs font-normal leading-tight text-[#22C55E]">
                +{user.matchPercentage}% Match
              </p>
            </div>

            {/* Score */}
            <span className="text-[17px] font-semibold text-gray-900">{user.score}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
