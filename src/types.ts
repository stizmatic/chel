// types.ts
export interface StatHistory {
    date: string;
    stats: PlayerStats[];
  }
  
  export interface PlayerStats {
    name: string;
    clientPlatform: string;
    favoritePosition: string;
    
    // General Stats
    gp: string;
    wins: string;
    losses: string;
    otl: string;
    winnerByDnf: string;
    record: string;
    winpct: string;
    DNF: string;
  
    // Scoring
    goals: string;
    assists: string;
    points: string;
    pointspg: string;
    gwg: string;
    ppg: string;
    shg: string;
    hattricks: string;
  
    // Shooting
    shots: string;
    shotpct: string;
    shotspg: string;
    shotattempts: string;
    shotonnetpct: string;
    scrnchances: string;
    scrngoals: string;
  
    // Defense
    hits: string;
    hitspg: string;
    bs: string;
    takeaways: string;
    interceptions: string;
    pkclearzone: string;
  
    // Faceoffs
    fo: string;
    fow: string;
    fol: string;
    fop: string;
  
    // Penalties
    pim: string;
    fights: string;
    fightswon: string;
    penaltiesdrawn: string;
  
    // Possession
    possession: string;
    giveaways: string;
    passes: string;
    passattempts: string;
    passpct: string;
    saucerpasses: string;
  
    // Breakaways
    breakaways: string;
    breakawaypct: string;
    brkgoals: string;
    penaltyshotgoals: string;
    penaltyattempts: string;
    penaltyshotpct: string;
  
    // Other
    toi: string;
    plusmin: string;
    dekes: string;
    dekesmade: string;
    offsides: string;
    offsidespg: string;
    deflections: string;
  
    // X-Factor Stats
    xfactor_zoneability_goals: string;
    xfactor_zoneability_assists: string;
    xfactor_zoneability_saves: string;
    xfactor_zoneability_hits: string;
    xfactor_zoneability_stick_checks: string;
    xfactor_zoneability_times_used: string;
    xfactor_superstarability_goals: string;
    xfactor_superstarability_assists: string;
    xfactor_superstarability_saves: string;
    xfactor_superstarability_hits: string;
    xfactor_superstarability_stick_checks: string;
  
    // Additional properties can be added as needed
    [key: string]: string | number;
  }
  
  export interface StatThresholds {
    goals: ThresholdLevels;
    assists: ThresholdLevels;
    points: ThresholdLevels;
    pointspg: ThresholdLevels;
    gwg: ThresholdLevels;
    ppg: ThresholdLevels;
    shg: ThresholdLevels;
    hattricks: ThresholdLevels;
    shotpct: ThresholdLevels;
    shotonnetpct: ThresholdLevels;
    hits: ThresholdLevels;
    bs: ThresholdLevels;
    takeaways: ThresholdLevels;
    interceptions: ThresholdLevels;
    fop: ThresholdLevels;
    passpct: ThresholdLevels;
    winpct: ThresholdLevels;
    plusmin: ThresholdLevels;
  }
  
  interface ThresholdLevels {
    excellent: number;
    good: number;
    average: number;
  }