/* Pure collection rules, shared by the game and its regression checks. */
(function(root){
  const catalog=[
    {id:'ivory',name:'Paper',group:'Essentials',tier:'Original',description:'Warm paper. The original.',metric:'free',target:1,goal:'Available from the start'},
    {id:'mint',name:'Sea glass',group:'Elements',tier:'Common',description:'Frosted edges. Coastal calm.',metric:'games',target:1,goal:'Complete 1 game'},
    {id:'grass',name:'Grass',group:'Elements',tier:'Common',description:'Fresh green with a cut-grass texture.',metric:'solved',target:10,goal:'Solve 10 puzzles'},
    {id:'rose',name:'Terracotta',group:'Essentials',tier:'Rare',description:'Sun-baked clay with a soft grain.',metric:'perfect',target:1,goal:'Finish a perfect 10-puzzle run'},
    {id:'bronze',name:'Bronze',group:'Metals',tier:'Common',description:'Brushed copper. A proper first trophy.',metric:'solved',target:25,goal:'Solve 25 puzzles'},
    {id:'silver',name:'Silver',group:'Metals',tier:'Rare',description:'Cool silver with a moving reflection.',metric:'solved',target:100,goal:'Solve 100 puzzles'},
    {id:'gold',name:'Gold',group:'Metals',tier:'Epic',description:'Rich gold. Earned one word at a time.',metric:'solved',target:250,goal:'Solve 250 puzzles'},
    {id:'platinum',name:'Platinum',group:'Metals',tier:'Legendary',description:'Ice-white metal with a spectral edge.',metric:'solved',target:1000,goal:'Solve 1,000 puzzles'},
    {id:'cherry',name:'Cherry',group:'Essentials',tier:'Common',description:'Glossy cherry red. Crisp and punchy.',metric:'solved',target:50,goal:'Solve 50 puzzles'},
    {id:'cobalt',name:'Cobalt',group:'Essentials',tier:'Rare',description:'Deep blue ceramic with a glazed finish.',metric:'games',target:10,goal:'Complete 10 games'},
    {id:'marble',name:'Marble',group:'Essentials',tier:'Rare',description:'Ivory stone crossed with fine veins.',metric:'clean',target:5,goal:'Complete 5 perfect runs without hints'},
    {id:'ocean',name:'Ocean',group:'Elements',tier:'Rare',description:'Turquoise water with drifting ripples.',metric:'daily',target:10,goal:'Complete 10 Daily runs'},
    {id:'sakura',name:'Sakura',group:'Elements',tier:'Rare',description:'Blush pink with falling petals.',metric:'dailyStreak',target:3,goal:'Build a 3-day Daily streak'},
    {id:'flurry',name:'Flurry',group:'Elements',tier:'Epic',description:'Icy blue. Snow falls across the tiles.',metric:'dailyStreak',target:7,goal:'Build a 7-day Daily streak'},
    {id:'sunset',name:'Sunset',group:'Elements',tier:'Epic',description:'Peach, coral, and the last light of day.',metric:'solved',target:200,goal:'Solve 200 puzzles'},
    {id:'honeycomb',name:'Honeycomb',group:'Elements',tier:'Rare',description:'Amber honey with a geometric cell pattern.',metric:'streak',target:10,goal:'Solve 10 in a row without hints'},
    {id:'obsidian',name:'Obsidian',group:'After hours',tier:'Epic',description:'Volcanic black. Razor-sharp reflections.',metric:'hardPerfect',target:1,goal:'Finish a perfect Hard run'},
    {id:'neon',name:'Neon',group:'After hours',tier:'Epic',description:'Electric lime on a midnight circuit.',metric:'fast',target:10,goal:'Solve 10 puzzles in under 5 seconds without hints'},
    {id:'lava',name:'Lava',group:'After hours',tier:'Epic',description:'Molten seams beneath dark volcanic rock.',metric:'sudden',target:15,goal:'Solve 15 in one Sudden Death run'},
    {id:'galaxy',name:'Galaxy',group:'After hours',tier:'Epic',description:'Violet nebulae with a field of stars.',metric:'solved',target:500,goal:'Solve 500 puzzles'},
    {id:'rainbow',name:'Rainbow',group:'Spectrum',tier:'Legendary',description:'The full spectrum, always in motion.',metric:'perfect',target:10,goal:'Finish 10 perfect runs'},
    {id:'aurora',name:'Aurora',group:'Spectrum',tier:'Legendary',description:'Green and violet curtains of light.',metric:'streak',target:25,goal:'Solve 25 in a row without hints'},
    {id:'holographic',name:'Holographic',group:'Spectrum',tier:'Legendary',description:'Iridescent foil that shifts as you play.',metric:'hardPerfect',target:3,goal:'Finish 3 perfect Hard runs'},
    {id:'moonstone',name:'Moonstone',group:'Spectrum',tier:'Legendary',description:'Milky opal with a lunar blue sheen.',metric:'dailyStreak',target:30,goal:'Build a 30-day Daily streak'}
  ];
  function metrics(stats={},achievements={},history=[]){
    const perfectHistory=history.filter(r=>r.mode!=='sudden' && r.totalPuzzles===10 && r.correct===10);
    return {
      free:1,
      games:Math.max((stats.runsPlayed||0)+(stats.dailiesPlayed||0)+(stats.quickDailiesPlayed||0)+(stats.archivesPlayed||0)+(stats.suddenPlayed||0)+(stats.chillPlayed||0),achievements.first_finish?1:0),
      solved:(stats.totalRunCorrect||0)+(stats.totalDailyCorrect||0)+(stats.totalSuddenSolved||0)+(stats.totalChillCorrect||0)+(stats.totalArchiveCorrect||0),
      perfect:Math.max(stats.perfectRuns||0,perfectHistory.length,achievements.perfect_ten?1:0),
      hardPerfect:Math.max(stats.hardPerfectRuns||0,perfectHistory.filter(r=>r.diff==='hard').length,achievements.hard_perfect?1:0),
      clean:stats.cleanPerfectRuns||0,
      daily:(stats.dailiesPlayed||0)+(stats.quickDailiesPlayed||0),
      dailyStreak:Math.max(stats.dailyLongestStreak||0,stats.dailyStreak||0),
      streak:stats.longestSolveStreak||0,
      sudden:stats.suddenBestSolved||0,
      fast:stats.fastSolves||0
    };
  }
  function progress(finish,values){
    const value=Math.max(0,Number(values[finish.metric])||0);
    return {value:Math.min(value,finish.target),target:finish.target,unlocked:value>=finish.target};
  }
  function nearest(values,earned={}){
    const units={solved:'solves',games:'games',perfect:'perfect runs',hardPerfect:'perfect Hard runs',clean:'perfect runs without hints',daily:'Daily runs',dailyStreak:'days in a Daily streak',streak:'consecutive solves',sudden:'solves in Sudden Death',fast:'fast solves'};
    return catalog.filter(f=>!earned[f.id] && !progress(f,values).unlocked).map(f=>{
      const p=progress(f,values);
      const remaining=p.target-p.value;
      const unit=units[f.metric]||'steps';
      const singular={solves:'solve',games:'game','perfect runs':'perfect run','perfect Hard runs':'perfect Hard run','perfect runs without hints':'perfect run without hints','Daily runs':'Daily run','fast solves':'fast solve'};
      let remainingText=remaining.toLocaleString()+' '+(remaining===1?(singular[unit]||unit):unit)+' to go';
      if(f.metric==='fast') remainingText=remaining+' more '+(remaining===1?'solve':'solves')+' under 5s, without hints';
      if(f.metric==='dailyStreak') remainingText='Reach a '+f.target+'-day Daily streak';
      if(f.metric==='streak') remainingText='Reach '+f.target+' consecutive solves';
      if(f.metric==='sudden') remainingText='Solve '+f.target+' in one Sudden Death run';
      return {finish:f,...p,remaining,remainingText,ratio:p.value/p.target,unit};
    }).sort((a,b)=>b.ratio-a.ratio || a.remaining-b.remaining || a.target-b.target)[0]||null;
  }
  const api={catalog,metrics,progress,nearest};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.AddOneFinishes=api;
})(typeof window!=='undefined'?window:globalThis);
