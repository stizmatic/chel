"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, RefreshCcw, Trophy } from 'lucide-react';

const HockeyStatsDashboard = () => {
  const [stats, setStats] = useState<{ [key: string]: string | number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Header name mappings
  type HeaderNames = { [key: string]: string };
  const headerNames: HeaderNames = {
    name: 'Player Name',
    // General Stats
    gp: 'Games Played',
    wins: 'Wins',
    losses: 'Losses',
    otl: 'Overtime Losses',
    winpct: 'Win %',
    record: 'Record',
    winnerByDnf: 'Wins by DNF',
    DNF: 'DNF',
    // Scoring
    goals: 'Goals',
    assists: 'Assists',
    points: 'Points',
    pointspg: 'Points/Game',
    gwg: 'Game Winning Goals',
    ppg: 'Power Play Goals',
    shg: 'Short Handed Goals',
    hattricks: 'Hat Tricks',
    // Shooting
    shots: 'Shots',
    shotpct: 'Shot %',
    shotspg: 'Shots/Game',
    shotattempts: 'Shot Attempts',
    shotonnetpct: 'Shots on Net %',
    scrnchances: 'Scoring Chances',
    scrngoals: 'Screen Goals',
    // Defense
    hits: 'Hits',
    hitspg: 'Hits/Game',
    bs: 'Blocked Shots',
    takeaways: 'Takeaways',
    interceptions: 'Interceptions',
    pkclearzone: 'PK Clear Zone',
    // Faceoffs
    fo: 'Faceoffs',
    fow: 'Faceoffs Won',
    fol: 'Faceoffs Lost',
    fop: 'Faceoff %',
    // Penalties
    pim: 'Penalty Minutes',
    fights: 'Fights',
    fightswon: 'Fights Won',
    penaltiesdrawn: 'Penalties Drawn',
    // Possession
    possession: 'Possession Time',
    giveaways: 'Giveaways',
    passes: 'Passes',
    passattempts: 'Pass Attempts',
    passpct: 'Pass %',
    saucerpasses: 'Saucer Passes',
    // Breakaways
    breakaways: 'Breakaways',
    breakawaypct: 'Breakaway %',
    brkgoals: 'Breakaway Goals',
    penaltyshotgoals: 'Penalty Shot Goals',
    penaltyattempts: 'Penalty Shot Attempts',
    penaltyshotpct: 'Penalty Shot %',
    // Other
    toi: 'Time on Ice',
    plusmin: 'Plus/Minus',
    dekes: 'Dekes',
    dekesmade: 'Successful Dekes',
    offsides: 'Offsides',
    offsidespg: 'Offsides/Game',
    deflections: 'Deflections',
    // X-Factor Stats
    xfactor_zoneability_goals: 'Zone Ability Goals',
    xfactor_zoneability_assists: 'Zone Ability Assists',
    xfactor_zoneability_saves: 'Zone Ability Saves',
    xfactor_zoneability_hits: 'Zone Ability Hits',
    xfactor_zoneability_stick_checks: 'Zone Ability Stick Checks',
    xfactor_zoneability_times_used: 'Zone Ability Times Used',
    xfactor_superstarability_goals: 'Superstar Ability Goals',
    xfactor_superstarability_assists: 'Superstar Ability Assists',
    xfactor_superstarability_saves: 'Superstar Ability Saves',
    xfactor_superstarability_hits: 'Superstar Ability Hits',
    xfactor_superstarability_stick_checks: 'Superstar Ability Stick Checks',
  };

  // Group stats by category
  const statGroups = {
    general: ['name', 'gp', 'wins', 'losses', 'otl', 'winpct', 'record', 'winnerByDnf', 'DNF'],
    scoring: ['name', 'goals', 'assists', 'points', 'pointspg', 'gwg', 'ppg', 'shg', 'hattricks'],
    shooting: ['name', 'shots', 'shotpct', 'shotspg', 'shotattempts', 'shotonnetpct', 'scrnchances', 'scrngoals'],
    defense: ['name', 'hits', 'hitspg', 'bs', 'takeaways', 'interceptions', 'pkclearzone'],
    faceoffs: ['name', 'fo', 'fow', 'fol', 'fop'],
    penalties: ['name', 'pim', 'fights', 'fightswon', 'penaltiesdrawn'],
    possession: ['name', 'possession', 'giveaways', 'passes', 'passattempts', 'passpct', 'saucerpasses'],
    breakaways: ['name', 'breakaways', 'breakawaypct', 'brkgoals', 'penaltyshotgoals', 'penaltyattempts', 'penaltyshotpct'],
    other: ['name', 'toi', 'plusmin', 'dekes', 'dekesmade', 'offsides', 'offsidespg', 'deflections'],
    xfactor: ['name', 'xfactor_zoneability_goals', 'xfactor_zoneability_assists', 'xfactor_zoneability_saves', 
              'xfactor_zoneability_hits', 'xfactor_zoneability_stick_checks', 'xfactor_zoneability_times_used',
              'xfactor_superstarability_goals', 'xfactor_superstarability_assists', 'xfactor_superstarability_saves',
              'xfactor_superstarability_hits', 'xfactor_superstarability_stick_checks']
  };

  // Stat highlight thresholds
  interface StatThresholds {
    goals: { excellent: number; good: number; average: number };
    assists: { excellent: number; good: number; average: number };
    points: { excellent: number; good: number; average: number };
    pointspg: { excellent: number; good: number; average: number };
    gwg: { excellent: number; good: number; average: number };
    ppg: { excellent: number; good: number; average: number };
    shg: { excellent: number; good: number; average: number };
    hattricks: { excellent: number; good: number; average: number };
    shotpct: { excellent: number; good: number; average: number };
    shotonnetpct: { excellent: number; good: number; average: number };
    hits: { excellent: number; good: number; average: number };
    bs: { excellent: number; good: number; average: number };
    takeaways: { excellent: number; good: number; average: number };
    interceptions: { excellent: number; good: number; average: number };
    fop: { excellent: number; good: number; average: number };
    passpct: { excellent: number; good: number; average: number };
    winpct: { excellent: number; good: number; average: number };
    plusmin: { excellent: number; good: number; average: number };
  }
  
  const statThresholds: StatThresholds = {
    goals: { excellent: 20, good: 10, average: 5 },
    assists: { excellent: 20, good: 10, average: 5 },
    points: { excellent: 40, good: 20, average: 10 },
    pointspg: { excellent: 2.0, good: 1.5, average: 1.0 },
    gwg: { excellent: 5, good: 3, average: 1 },
    ppg: { excellent: 5, good: 3, average: 1 },
    shg: { excellent: 2, good: 1, average: 0 },
    hattricks: { excellent: 2, good: 1, average: 0 },
    shotpct: { excellent: 20, good: 15, average: 10 },
    shotonnetpct: { excellent: 80, good: 70, average: 60 },
    hits: { excellent: 100, good: 50, average: 25 },
    bs: { excellent: 30, good: 20, average: 10 },
    takeaways: { excellent: 50, good: 30, average: 15 },
    interceptions: { excellent: 100, good: 50, average: 25 },
    fop: { excellent: 60, good: 50, average: 45 },
    passpct: { excellent: 85, good: 75, average: 65 },
    winpct: { excellent: 65, good: 50, average: 40 },
    plusmin: { excellent: 15, good: 5, average: 0 }
  };
  
  const getStatColor = (field: string, value: string | number) => {
    // Convert string to number if needed
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
    // If the value isn't a number or the field doesn't have thresholds, return default
    if (isNaN(numValue) || !(field in statThresholds)) {
      return 'text-gray-100';
    }
  
    const thresholds = statThresholds[field as keyof StatThresholds];
  
    // Handle special case for plus/minus
    if (field === 'plusmin') {
      if (numValue >= thresholds.excellent) return 'text-green-300 font-bold';
      if (numValue >= thresholds.good) return 'text-green-400';
      if (numValue >= thresholds.average) return 'text-green-500';
      if (numValue <= -thresholds.excellent) return 'text-red-300 font-bold';
      if (numValue <= -thresholds.good) return 'text-red-400';
      if (numValue < 0) return 'text-red-500';
      return 'text-gray-100';
    }
  
    // For all other stats
    if (numValue >= thresholds.excellent) return 'text-green-300 font-bold';
    if (numValue >= thresholds.good) return 'text-green-400';
    if (numValue >= thresholds.average) return 'text-green-500';
    return 'text-gray-100';
  };

  const formatStatValue = (field: string, value: string | number) => {
    if (value === null || value === undefined) return '-';
  
    // Percentage formatting
    if (field.endsWith('pct') || field === 'winpct') {
      return `${value}%`;
    }
  
    // Time on ice formatting (assumes value is in seconds)
    if (field === 'toi') {
      const minutes = Math.floor(parseInt(value as string) / 60);
      const seconds = parseInt(value as string) % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  
    // Possession time formatting
    if (field === 'possession') {
      const minutes = Math.floor(parseInt(value as string) / 60);
      const seconds = parseInt(value as string) % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  
    return value.toString();
  };
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch data from the local API endpoint instead of an external URL
      const response = await fetch('/api/hockey-stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.members || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };

  const sortedStats = [...stats].sort((a, b) => {
    if (!sortField) return 0;

    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') aVal = parseFloat(aVal) || aVal;
    if (typeof bVal === 'string') bVal = parseFloat(bVal) || bVal;

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Hockey Stats Dashboard</h1>
          </div>
          <Button 
            onClick={fetchStats}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Stats'}
          </Button>
        </div>

        {error && (
          <Card className="bg-red-900/50 border-red-700 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {Object.entries(statGroups).map(([group, fields]) => (
          <Card key={group} className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white capitalize">{group} Statistics</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {fields.map(field => (
                      <th
                        key={field}
                        className="p-2 text-left cursor-pointer hover:bg-slate-700 text-white"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center gap-2">
                          {headerNames[field] || field}
                          {sortField === field && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((player, idx) => (
                    <tr
                      key={`${player.name}-${idx}`}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      {fields.map(field => (
                        <td 
                          key={field} 
                          className={`p-2 ${field === 'name' ? 'text-gray-100' : getStatColor(field, player[field])}`}
                        >
                          {formatStatValue(field, player[field])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Stat Highlighting Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-300"></span>
                <span>Excellent Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-400"></span>
                <span>Good Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500"></span>
                <span>Above Average</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HockeyStatsDashboard;