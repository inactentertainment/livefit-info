(() => {
  const panel=document.getElementById('musicPanel');
  const toggle=document.getElementById('musicToggle');
  const close=document.getElementById('musicClose');
  const now=document.getElementById('musicNow');
  const status=document.getElementById('musicStatus');
  const play=document.getElementById('musicPlay');
  const audio=document.getElementById('ieAudio');
  const volume=document.getElementById('musicVolume');
  const modes=[...document.querySelectorAll('.music-mode')];

  // main.js owns the music toggle so we do not register a second toggle handler here.
  close?.addEventListener('click',()=>{panel.hidden=true});
  panel?.addEventListener('click',e=>e.stopPropagation());

  modes.forEach(btn=>btn.addEventListener('click',()=>{
    modes.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    if(now) now.textContent=btn.dataset.mode;
    if(status) status.textContent=btn.dataset.note;
    if(play){ play.textContent='▶'; play.dataset.ready='true'; }
    if(audio){ audio.pause(); audio.removeAttribute('src'); audio.load(); }
  }));

  play?.addEventListener('click',()=>{
    const selected=document.querySelector('.music-mode.active');
    if(!selected){
      if(status) status.textContent='Choose a workout sound first.';
      return;
    }
    if(!audio?.src){
      if(status) status.textContent='This mode is ready. Add an approved IE Music track or live stream to activate playback.';
      return;
    }
    if(audio.paused){audio.play();play.textContent='Ⅱ'}else{audio.pause();play.textContent='▶'}
  });

  volume?.addEventListener('input',()=>{ if(audio) audio.volume=Number(volume.value)/100; });

  document.querySelectorAll('.article-filter').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.article-filter').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const filter=btn.dataset.filter;
    document.querySelectorAll('.article-card[data-category]').forEach(card=>{
      const hay=(card.dataset.category+' '+card.dataset.audience).toLowerCase();
      card.hidden=filter!=='all'&&!hay.includes(filter);
    });
  }));
})();