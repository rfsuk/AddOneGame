/* Shared motion timing and cancellable, real-element animations. */
(function(root){
  const timing=Object.freeze({carry:220,carryStagger:12,carryFinishRate:4,settle:240,stamp:230,stampLead:120,stampDuration:200,score:270,transition:100});
  function createController({reduced=()=>false}={}){
    const active=new Set();
    function animate(element,frames,options,group='detail',onSettle=()=>{}){
      if(!element || reduced() || typeof element.animate!=='function'){onSettle(true);return null;}
      let animation;
      try{animation=element.animate(frames,{fill:'none',...options});}catch{onSettle(true);return null;}
      if(!animation?.finished||typeof animation.finished.then!=='function'){animation?.cancel?.();onSettle(true);return null;}
      const entry={animation,group,done:false};active.add(entry);
      const settle=complete=>{if(entry.done)return;entry.done=true;active.delete(entry);onSettle(complete);};
      entry.cancel=()=>{animation.cancel();settle(false);};
      animation.finished.then(()=>settle(true),()=>settle(false));
      return animation;
    }
    function cancel(group){for(const entry of [...active])if(!group||entry.group===group)entry.cancel();}
    function accelerate(group,rate=timing.carryFinishRate){
      let remaining=0;
      for(const entry of active){
        if(entry.group!==group)continue;
        const animation=entry.animation;
        try{
          const end=animation.effect.getComputedTiming().endTime;
          remaining=Math.max(remaining,Math.max(0,end-(animation.currentTime||0))/rate);
          if(animation.updatePlaybackRate)animation.updatePlaybackRate(rate);else animation.playbackRate=rate;
        }catch{entry.cancel();}
      }
      return Math.ceil(remaining);
    }
    return {animate,cancel,accelerate,get size(){return active.size;}};
  }
  const api={timing,createController};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AddOneMotion=api;
})(typeof window!=='undefined'?window:globalThis);
