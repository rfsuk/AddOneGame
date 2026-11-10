/* A small acoustic palette: felt taps, ceramic contacts, and damped mallets. */
(function(root){
  const D=293.6648,A=440,F=369.9944;
  const note=(freq,at,duration,gain)=>({voice:'mallet',freq,at,duration,gain});
  const noise=(at,duration,gain,freq=1100)=>({voice:'noise',at,duration,gain,freq});
  const body=(freq,at,duration,gain)=>({voice:'body',freq,at,duration,gain});
  const chime=(freq,at,duration,gain)=>({voice:'chime',freq,at,duration,gain});
  const cues={
    key:[noise(0,.024,.095,1250),body(210,0,.042,.035)],
    delete:[noise(0,.028,.07,850),body(165,0,.045,.028)],
    word1:[noise(0,.028,.12,920),body(240,0,.055,.045),note(D,.025,.18,.065),note(A,.06,.14,.025)],
    solve:[noise(0,.02,.05,1400),note(D*2,.012,.28,.085),note(A*2,.09,.34,.055),note(F*2,.09,.27,.032)],
    hinted:[note(D,.01,.24,.05),note(A,.09,.28,.035)],
    streak3:[note(D*2,.01,.3,.075),note(F*2,.075,.32,.05),chime(A*2,.14,.4,.045),note(D,.06,.36,.028)],
    streak5:[note(D,.01,.5,.055),note(D*2,.02,.35,.075),note(F*2,.09,.42,.055),note(A*2,.16,.5,.045),chime(D*4,.25,.55,.025),chime(A*4,.34,.38,.012)],
    milestone:[note(D,.01,.5,.055),note(D*2,.02,.35,.075),note(F*2,.09,.42,.055),note(A*2,.16,.5,.045),chime(D*4,.25,.55,.025)],
    stamp:[noise(0,.023,.22,950),body(105,0,.068,.08),noise(.01,.015,.08,1900)],
    wrong:[noise(0,.027,.075,720),body(145,0,.06,.04)],
    hint:[note(A,.005,.16,.045),noise(.01,.03,.045,1800)],
    reveal:[noise(0,.07,.04,1500),note(D,0,.24,.045),note(A,.075,.23,.028)],
    revealEnd:[note(D*2,0,.25,.06),note(F*2,.055,.26,.04),note(A*2,.12,.24,.028)],
    revealStep:[note(D*2,0,.2,.032)],
    unlock:[noise(0,.12,.06,1850),body(165,.06,.09,.035),note(D,.10,.38,.065),note(A,.19,.4,.045),note(D*2,.29,.48,.08),note(F*2,.31,.42,.055),note(A*2,.34,.4,.04),note(D*4,.44,.26,.014)],
    equip:[noise(0,.023,.1,1150),note(D*2,.02,.16,.045)],
    complete:[note(D/2,.01,.8,.04),note(D,.01,.65,.055),note(D*2,.02,.32,.065),note(F*2,.16,.35,.06),note(A*2,.30,.4,.055),chime(D*4,.48,.6,.035),note(A*2,.72,.35,.045),note(F*2,.88,.35,.04),note(D*2,1.04,.75,.065),note(F*2,1.04,.68,.028),note(A*2,1.04,.68,.025),chime(D*4,1.14,.7,.016)],
    best:[note(D*2,0,.27,.06),note(A*2,.09,.28,.04)],
    transition:[noise(0,.055,.05,750)],
    preview:[noise(0,.024,.095,1250),note(D*2,.12,.22,.065),note(F*2,.17,.22,.045),note(A*2,.22,.24,.03)]
  };
  function plan(kind,variation=0){
    const key=kind==='fast'?'solve':kind==='streak'?'streak3':kind;
    const delta=[-.025,.012,0,.022,-.012,.007][Math.abs(variation)%6];
    return (cues[key]||[]).map(event=>({...event,freq:event.freq*(key==='key'?1+delta:1),gain:event.gain*(key==='key'?1+delta*.7:1)}));
  }
  function noiseBuffer(ctx,duration=.25,seed=917){
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
    let value=seed;
    for(let i=0;i<data.length;i++){value=(Math.imul(value,1664525)+1013904223)>>>0;data[i]=(value/4294967296)*2-1;}
    return buffer;
  }
  function createEngine(ctx,{destination=ctx.destination,volume=.68}={}){
    const master=ctx.createGain(),compressor=ctx.createDynamicsCompressor();
    const dry=ctx.createGain(),music=ctx.createGain(),send=ctx.createGain(),room=ctx.createConvolver();
    master.gain.value=volume;compressor.threshold.value=-12;compressor.knee.value=12;compressor.ratio.value=2.5;compressor.attack.value=.003;compressor.release.value=.12;
    dry.connect(master);music.connect(master);music.connect(send);send.gain.value=.10;send.connect(room);room.connect(master);master.connect(compressor);compressor.connect(destination);
    const impulse=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*.19),ctx.sampleRate);
    for(let channel=0;channel<2;channel++){
      const out=impulse.getChannelData(channel),random=noiseBuffer(ctx,.19,312+channel*79).getChannelData(0);
      for(let i=0;i<out.length;i++)out[i]=random[i]*Math.pow(1-i/out.length,4)*.11;
      for(const [seconds,gain] of [[.014,.18],[.029,.10],[.047,.055]])out[Math.floor(seconds*ctx.sampleRate)]+=gain;
    }
    room.buffer=impulse;room.normalize=false;
    const grain=noiseBuffer(ctx);const voices=new Set();let keyNumber=0,lastKey=-Infinity;
    const resolutions=new Set(['solve','fast','hinted','streak3','streak5','milestone']);
    const priority=new Set(['word1',...resolutions,'reveal','revealEnd','unlock','complete','best']);
    function stop({event,group,fade=.012}={}){
      const now=ctx.currentTime;
      for(const voice of [...voices]){
        if(event&&voice.event!==event || group&&voice.group!==group)continue;
        const held=Math.max(.0001,voice.amp.gain.value);
        if(voice.amp.gain.cancelAndHoldAtTime)voice.amp.gain.cancelAndHoldAtTime(now);
        else{voice.amp.gain.cancelScheduledValues(now);voice.amp.gain.setValueAtTime(held,now);}
        voice.amp.gain.linearRampToValueAtTime(.0001,now+fade);
        for(const source of voice.sources){try{source.stop(now+fade+.002);}catch{}}
      }
    }
    function play(kind,{delay=0,isolated=false,soft=false}={}){
      const now=ctx.currentTime;
      if(!isolated && kind==='key' && now-lastKey<.018)return false;
      if(kind==='key')lastKey=now;
      if(!isolated && priority.has(kind))stop({group:'typing',fade:.006});
      if(!isolated && resolutions.has(kind)){stop({event:'word1',fade:.01});stop({event:'hint',fade:.008});stop({group:'reward',fade:.018});}
      if(!isolated && kind==='unlock')stop({group:'reward',fade:.016});
      if(!isolated && voices.size>28)stop({group:'typing',fade:.006});
      const group=['key','delete'].includes(kind)?'typing':['word1','wrong','hint','transition','equip'].includes(kind)?'interaction':'reward';
      for(const event of plan(kind,keyNumber++)){
        const musical=event.voice==='mallet'||event.voice==='chime';
        const at=now+Math.max(0,delay)+event.at,duration=event.duration;
        const amp=ctx.createGain(),sources=[],filters=[];
        amp.gain.setValueAtTime(.0001,now);
        amp.gain.setValueAtTime(.0001,at);
        amp.gain.exponentialRampToValueAtTime(event.gain*(musical?1.35:1)*(soft?.6:1),at+(event.voice==='noise'?.002:.004));
        amp.gain.exponentialRampToValueAtTime(.0001,at+duration);
        amp.connect(musical?music:dry);
        if(event.voice==='noise'){
          const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();
          source.buffer=grain;filter.type='bandpass';filter.frequency.value=event.freq;filter.Q.value=.65;
          source.connect(filter);filter.connect(amp);source.start(at,(keyNumber%5)*.025);source.stop(at+duration+.01);sources.push(source);filters.push(filter);
        }else{
          const modes=event.voice==='body'?[[1,1],[2.32,.12]]:event.voice==='chime'?[[1,1],[2,.14],[3,.04]]:[[1,1],[2.76,.15],[5.4,.045]];
          for(const [ratio,gain] of modes){
            const osc=ctx.createOscillator(),partial=ctx.createGain();osc.type='sine';
            partial.gain.setValueAtTime(gain,at);
            if(ratio>1)partial.gain.exponentialRampToValueAtTime(.0001,at+duration/2.2);
            const freq=event.freq*ratio;
            osc.frequency.setValueAtTime(freq*(event.voice==='body'?1.16:1.006),at);
            osc.frequency.exponentialRampToValueAtTime(freq*(event.voice==='body'?.82:1),at+Math.min(.04,duration));
            osc.connect(partial);partial.connect(amp);osc.start(at);osc.stop(at+duration+.015);sources.push(osc);filters.push(partial);
          }
        }
        const voice={event:kind,group,amp,sources};voices.add(voice);
        let pending=sources.length;
        for(const source of sources)source.onended=()=>{
          if(--pending>0)return;
          voices.delete(voice);amp.disconnect();sources.forEach(s=>s.disconnect());filters.forEach(f=>f.disconnect());
        };
      }
      return true;
    }
    function setVolume(value){master.gain.setTargetAtTime(Math.max(0,Math.min(1,value)),ctx.currentTime,.015);}
    return {play,stop,setVolume,get activeVoices(){return voices.size;}};
  }
  const api={plan,createEngine};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AddOneSound=api;
})(typeof window!=='undefined'?window:globalThis);
