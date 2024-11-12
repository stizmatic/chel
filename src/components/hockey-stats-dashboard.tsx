// hockey-stats-dashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, RefreshCcw, Trophy, Upload } from 'lucide-react';
import { StatHistory, PlayerStats, StatThresholds } from '../types';

const HockeyStatsDashboard = () => {
  const [currentStats, setCurrentStats] = useState<StatHistory | null>(null);
  const [previousStats, setPreviousStats] = useState<StatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showComparison, setShowComparison] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Header name mappings
  const headerNames: { [key: string]: string } = {
    name: 'Player Name',
    gp: 'Games Played',
    wins: 'Wins',
    losses: 'Losses',
    otl: 'Overtime Losses',
    winpct: 'Win %',
    record: 'Record',
    winnerByDnf: 'Wins by DNF',
    DNF: 'DNF',
    goals: 'Goals',
    assists: 'Assists',
    points: 'Points',
    pointspg: 'Points/Game',
    gwg: 'Game Winning Goals',
    ppg: 'Power Play Goals',
    shg: 'Short Handed Goals',
    hattricks: 'Hat Tricks',
    shots: 'Shots',
    shotpct: 'Shot %',
    shotspg: 'Shots/Game',
    shotattempts: 'Shot Attempts',
    shotonnetpct: 'Shots on Net %',
    scrnchances: 'Scoring Chances',
    scrngoals: 'Screen Goals',
    hits: 'Hits',
    hitspg: 'Hits/Game',
    bs: 'Blocked Shots',
    takeaways: 'Takeaways',
    interceptions: 'Interceptions',
    pkclearzone: 'PK Clear Zone',
    fo: 'Faceoffs',
    fow: 'Faceoffs Won',
    fol: 'Faceoffs Lost',
    fop: 'Faceoff %',
    pim: 'Penalty Minutes',
    fights: 'Fights',
    fightswon: 'Fights Won',
    penaltiesdrawn: 'Penalties Drawn',
    possession: 'Possession Time',
    giveaways: 'Giveaways',
    passes: 'Passes',
    passattempts: 'Pass Attempts',
    passpct: 'Pass %',
    saucerpasses: 'Saucer Passes',
    breakaways: 'Breakaways',
    breakawaypct: 'Breakaway %',
    brkgoals: 'Breakaway Goals',
    penaltyshotgoals: 'Penalty Shot Goals',
    penaltyattempts: 'Penalty Shot Attempts',
    penaltyshotpct: 'Penalty Shot %',
    toi: 'Time on Ice',
    plusmin: 'Plus/Minus',
    dekes: 'Dekes',
    dekesmade: 'Successful Dekes',
    offsides: 'Offsides',
    offsidespg: 'Offsides/Game',
    deflections: 'Deflections'
  };

  // Stat groups for table organization
  const statGroups: { [key: string]: string[] } = {
    general: ['name', 'gp', 'wins', 'losses', 'otl', 'winpct', 'record', 'winnerByDnf', 'DNF'],
    scoring: ['name', 'goals', 'assists', 'points', 'pointspg', 'gwg', 'ppg', 'shg', 'hattricks'],
    shooting: ['name', 'shots', 'shotpct', 'shotspg', 'shotattempts', 'shotonnetpct', 'scrnchances', 'scrngoals'],
    defense: ['name', 'hits', 'hitspg', 'bs', 'takeaways', 'interceptions', 'pkclearzone'],
    faceoffs: ['name', 'fo', 'fow', 'fol', 'fop'],
    penalties: ['name', 'pim', 'fights', 'fightswon', 'penaltiesdrawn'],
    possession: ['name', 'possession', 'giveaways', 'passes', 'passattempts', 'passpct', 'saucerpasses'],
    breakaways: ['name', 'breakaways', 'breakawaypct', 'brkgoals', 'penaltyshotgoals', 'penaltyattempts', 'penaltyshotpct'],
    other: ['name', 'toi', 'plusmin', 'dekes', 'dekesmade', 'offsides', 'offsidespg', 'deflections']
  };

  // Stat highlight thresholds
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

  const getStatColor = (field: string, value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue) || !(field in statThresholds)) {
      return 'text-gray-100';
    }

    const thresholds = statThresholds[field as keyof StatThresholds];

    if (field === 'plusmin') {
      if (numValue >= thresholds.excellent) return 'text-green-300 font-bold';
      if (numValue >= thresholds.good) return 'text-green-400';
      if (numValue >= thresholds.average) return 'text-green-500';
      if (numValue <= -thresholds.excellent) return 'text-red-300 font-bold';
      if (numValue <= -thresholds.good) return 'text-red-400';
      if (numValue < 0) return 'text-red-500';
      return 'text-gray-100';
    }

    if (numValue >= thresholds.excellent) return 'text-green-300 font-bold';
    if (numValue >= thresholds.good) return 'text-green-400';
    if (numValue >= thresholds.average) return 'text-green-500';
    return 'text-gray-100';
  };

  const formatStatValue = (field: string, value: string | number): string => {
    if (value === null || value === undefined) return '-';

    if (field.endsWith('pct') || field === 'winpct') {
      return `${value}%`;
    }

    if (field === 'toi' || field === 'possession') {
      const seconds = parseInt(value as string);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return value.toString();
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/hockey-stats');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setCurrentStats(data.current);
      setPreviousStats(data.previous);
      setAvailableDates(data.dates);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setLoading(true);
    setError('');
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('/api/hockey-stats', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setCurrentStats(data.current);
      setPreviousStats(data.previous);
      setAvailableDates(data.dates);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const getStatDifference = (current: PlayerStats, previousStats: StatHistory | null, field: string): string | null => {
  if (!showComparison || !previousStats) return null;
  
  const previousPlayer = previousStats.stats.find(p => p.name === current.name);
  if (!previousPlayer) return null;

  const currentVal = parseFloat(current[field] as string);
  const previousVal = parseFloat(previousPlayer[field] as string);
  
  if (isNaN(currentVal) || isNaN(previousVal)) return null;
  
  const diff = currentVal - previousVal;
  return diff === 0 ? null : diff.toFixed(1);
};

const formatStatWithDifference = (field: string, value: string | number, player: PlayerStats) => {
  const formattedValue = formatStatValue(field, value);
  if (!showComparison) return formattedValue;

  const diff = getStatDifference(player, previousStats, field);
  
  if (!diff) return formattedValue;
  
  const diffNum = parseFloat(diff);
  const diffClass = diffNum > 0 ? 'text-green-400' : 'text-red-400';
  return (
    <span>
      {formattedValue}{' '}
      <span className={diffClass}>
        ({diffNum > 0 ? '+' : ''}{diff})
      </span>
    </span>
  );
};

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };

  const sortedStats = [...(currentStats?.stats || [])].sort((a, b) => {
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

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Hockey Stats Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
  <Checkbox
    id="comparison"
    checked={showComparison}
    onCheckedChange={(checked) => setShowComparison(!!checked)}
    className="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
  />
  <label 
    htmlFor="comparison" 
    className="text-gray-200 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Show Changes
  </label>
</div>
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Stats
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              onClick={fetchStats}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Stats'}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-900/50 border-red-700 mb-8">
            <CardContent className="pt-6">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {availableDates.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Available Dates:</span>
                {availableDates.map((date, index) => (
                  <span key={date} className={index === 0 ? 'text-green-400' : 'text-gray-400'}>
                    {date}
                    {index < availableDates.length - 1 && ', '}
                  </span>
                ))}
              </div>
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
                          {formatStatWithDifference(field, player[field], player)}
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