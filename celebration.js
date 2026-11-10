/* A short perfect-ten finale. Time-based, cancellable, never blocks input. */
(function(root){
  const colours=['#a4dbc0','#f6b48b','#f1ecdf','#d0b8ef','#edcf83'];
  function particles(width,height,{chill=false,random=Math.random}={}){
    const out=[],bursts=chill?1:3;
    for(let b=0;b<bursts;b++){
      const x=width*(bursts===1?.5:(width>650?[.36,.64,.5]:[.25,.73,.5])[b]),y=Math.min(height*.32,260)+b*15;
      for(let i=0;i<(chill?16:22);i++){
        const angle=i/(chill?16:22)*Math.PI*2,speed=75+random()*100;
        out.push({kind:'spark',x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,start:120+b*250,life:650,colour:colours[(i+b)%colours.length],spin:0});
      }
    }
    for(let i=0;i<(chill?24:48);i++)out.push({kind:'paper',x:width*(.12+random()*.76),y:-20-random()*60,vx:(random()-.5)*30,vy:70+random()*70,start:450+random()*200,life:1300,colour:colours[i%colours.length],spin:(random()-.5)*6});
    return out;
  }
  function create({root,reduced=()=>false,request=fn=>requestAnimationFrame(fn),cancel=id=>cancelAnimationFrame(id),now=()=>performance.now(),size=()=>({width:innerWidth,height:innerHeight,dpr:Math.min(2,devicePixelRatio||1)})}){
    let raf=0;
    function stop(){if(raf)cancel(raf);raf=0;if(root){root.replaceChildren();root.classList.add('hidden');}}
    function start(options={}){
      stop();if(!root||reduced())return false;
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return false;
      const {width,height,dpr}=size();canvas.width=width*dpr;canvas.height=height*dpr;canvas.setAttribute('aria-hidden','true');ctx.scale(dpr,dpr);
      root.appendChild(canvas);root.classList.remove('hidden');
      const items=particles(width,height,options),began=now();
      function frame(){
        const elapsed=now()-began;if(elapsed>=2000||reduced()){stop();return;}
        ctx.clearRect(0,0,width,height);
        for(const p of items){
          const age=elapsed-p.start;if(age<0||age>p.life)continue;
          const t=age/1000,fade=Math.min(1,(p.life-age)/250),x=p.x+p.vx*t,y=p.y+p.vy*t+(p.kind==='paper'?45:25)*t*t;
          ctx.save();ctx.globalAlpha=Math.max(0,fade);ctx.fillStyle=p.colour;ctx.translate(x,y);ctx.rotate(t*p.spin);
          if(p.kind==='spark'){ctx.strokeStyle=p.colour;ctx.lineWidth=1.3;ctx.shadowColor=p.colour;ctx.shadowBlur=4;ctx.beginPath();ctx.moveTo(-p.vx*.04,-p.vy*.04);ctx.lineTo(0,0);ctx.stroke();ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();}
          else ctx.fillRect(-3,-5,6,10*Math.cos(t*5));ctx.restore();
        }
        raf=request(frame);
      }
      raf=request(frame);return true;
    }
    return {start,stop};
  }
  const api={particles,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AddOneCelebration=api;
})(typeof window!=='undefined'?window:globalThis);
