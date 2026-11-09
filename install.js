/* A quiet, user-triggered install invitation. Never prompt automatically. */
(()=>{
  const button=document.getElementById('installGame');
  const note=document.getElementById('installNote');
  const help=document.getElementById('installHelp');
  if(!button||!note||!help) return;
  const standalone=window.matchMedia('(display-mode: standalone)');
  const fullscreen=window.matchMedia('(display-mode: fullscreen)');
  const appleMobile=/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  let invitation=null,busy=false,installed=false;
  const isInstalled=()=>installed||standalone.matches||fullscreen.matches||navigator.standalone===true;
  function render(){
    const visible=!isInstalled()&&(!!invitation||appleMobile);
    button.classList.toggle('hidden',!visible);
    note.classList.toggle('hidden',!visible);
    button.disabled=busy;
    if(!visible) help.classList.add('hidden');
  }
  function message(text){help.textContent=text;help.classList.remove('hidden');}
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();invitation=event;render();
  });
  window.addEventListener('appinstalled',()=>{installed=true;invitation=null;render();});
  standalone.addEventListener?.('change',render);
  fullscreen.addEventListener?.('change',render);
  button.addEventListener('click',async()=>{
    if(busy||isInstalled()) return;
    if(!invitation){
      if(appleMobile) message('Tap your browser’s Share button, then Add to Home Screen. You may need to scroll down the share menu.');
      return;
    }
    busy=true;const prompt=invitation;invitation=null;button.disabled=true;
    try{
      await prompt.prompt();
      const choice=await prompt.userChoice;
      if(choice?.outcome==='accepted') installed=true;
      else message('Any time. You can also install from your browser’s menu.');
    }catch{
      message('Open your browser’s menu and choose Install app or Add to Home screen.');
    }finally{
      busy=false;render();
      // Preserve useful instructions after a dismissed or unavailable prompt.
      if(!isInstalled()&&help.textContent) help.classList.remove('hidden');
    }
  });
  render();
})();
