/* Spoiler-free sharing and validated challenge links. */
(function(root){
  const firstDate='2026-07-15';
  const diffs=['easy','medium','hard','mix'];
  function validDate(value,today){
    return /^\d{4}-\d{2}-\d{2}$/.test(value||'') && value>=firstDate && value<=today &&
      !Number.isNaN(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  }
  function readChallenge(search,today){
    const p=new URLSearchParams(search),date=p.get('challenge'),diff=p.get('difficulty');
    if(!validDate(date,today)||!diffs.includes(diff)) return null;
    const length=p.get('length')==='5'?5:10;
    const score=Number(p.get('score')),solved=Number(p.get('solved'));
    const comparison=p.has('score')&&p.has('solved')&&Number.isInteger(score)&&score>=0&&score<=100000&&Number.isInteger(solved)&&solved>=0&&solved<=length;
    return {date,diff,length,friend:comparison?{score,solved}:null};
  }
  function shareResult(result,base='https://rfsuk.github.io/AddOneGame/'){
    const daily=result.mode==='daily'||result.mode==='archive';
    const count=result.results.length,solved=result.results.filter(r=>r.correct).length;
    const label=daily?(count===5?'Quick Daily':'Full Daily')+' · '+result.date:
      ({run:'Classic',chill:'Chill',sudden:'Sudden Death'}[result.mode]||'Practice');
    const url=new URL(base);url.search='';url.hash='';
    if(daily){
      for(const [key,value] of Object.entries({challenge:result.date,difficulty:result.diff,length:count,score:result.score,solved})) url.searchParams.set(key,String(value));
    }
    const cells=result.results.map(r=>r.correct?(r.hinted?'🟨':'🟩'):'⬜');
    const rows=[];for(let i=0;i<cells.length;i+=5) rows.push(cells.slice(i,i+5).join(''));
    const text=['Add One — '+label,`${solved}/${count} solved · ${result.score.toLocaleString('en-GB')} points`,
      ({mix:'Mixed',easy:'Easy',medium:'Medium',hard:'Hard'}[result.diff]||'Mixed')+' · '+(result.mode==='chill'?'No timer':(result.durationMs/1000).toFixed(1)+'s'),
      rows.join('\n'),'🟩 Solved · 🟨 With hint · ⬜ Revealed',daily?'Try the same challenge:':'Play Add One:',url.href].join('\n');
    return {title:'Add One — '+label,text,url:url.href};
  }
  const api={firstDate,validDate,readChallenge,shareResult};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;else root.AddOneSocial=api;
})(typeof window!=='undefined'?window:globalThis);
