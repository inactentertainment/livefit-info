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

(() => {
  // Homepage conversion order: hero -> motivation ticker -> personalized experience -> tools.
  const hero=document.querySelector('.hero');
  const plan=document.querySelector('.plan-section');
  if(hero&&plan){
    const quotes=[
      'Start where you are.','Strong is built one day at a time.','A short workout still counts.','Your next step matters more than your last excuse.','Move today so tomorrow feels easier.',
      'Progress loves consistency.','Ten good minutes can change the day.','Train for the life you want to keep living.','Your body listens to what you repeat.','Small wins build strong routines.',
      'Stand up. Start simple. Keep going.','Strength makes everyday life lighter.','You do not need perfect. You need repeatable.','One walk can change your whole mood.','The best plan is the one you will use.',
      'Move with purpose.','Build strength for real life.','Energy grows when movement becomes a habit.','Today is a good day to begin again.','Your future body is listening.',
      'Strong legs make strong years.','Keep your balance. Keep your freedom.','A little stronger is still stronger.','Do the next useful thing.','Consistency beats intensity you cannot repeat.',
      'Move more. Sit less. Feel the difference.','Make your health part of the schedule.','Train your body to stay ready.','Every rep is a vote for your future.','Walk first. Build from there.',
      'Good form. Good effort. Good day.','Recovery is part of getting stronger.','You are never too old to improve.','Fitness is built in ordinary days.','Make movement normal.',
      'Use what you have. Start now.','Your pace is still progress.','Better balance starts with practice.','Strong muscles support strong living.','Keep showing up for yourself.',
      'One more walk. One more set. One more week.','Simple plans are easier to keep.','Build the habit before you chase the perfect workout.','You can restart today.','Train for stairs, groceries, travel, and life.',
      'Strength is useful at every age.','Move enough to feel alive.','Give your body a reason to adapt.','Make today count without making it complicated.','Stay ready for what life asks of you.'
    ];
    if(!document.querySelector('.motivation-ticker')){
      const ticker=document.createElement('section');
      ticker.className='motivation-ticker';
      ticker.setAttribute('aria-label','LiveFit motivation');
      const run=[...quotes,...quotes].map(q=>'<span>'+q+'</span>').join('');
      ticker.innerHTML='<div class="motivation-track">'+run+'</div>';
      hero.insertAdjacentElement('afterend',ticker);
    }
    const ticker=document.querySelector('.motivation-ticker');
    if(ticker&&ticker.nextElementSibling!==plan) ticker.insertAdjacentElement('afterend',plan);
  }

  // Article reading experience: add a sticky side panel with useful controls and anchors.
  const content=document.getElementById('articleContent');
  const article=document.querySelector('.article-reader article');
  if(content&&article&&!document.querySelector('.article-side-panel')){
    const sections=[...content.querySelectorAll('h2')];
    const side=document.createElement('aside');
    side.className='article-side-panel';
    const links=sections.map((h,i)=>{
      const id='section-'+(i+1);
      h.id=id;
      return '<a href="#'+id+'">'+h.textContent.replace(/^\d+\.\s*/,'')+'</a>';
    }).join('');
    side.innerHTML='<div class="article-side-card"><span class="eyebrow">ON THIS PAGE</span><nav>'+links+'</nav></div>'+
      '<div class="article-side-card action-card"><span class="eyebrow">MAKE IT USEFUL</span><button id="fontDown">A−</button><button id="fontUp">A+</button><button id="markProgress">Mark today complete</button><p id="articleActionStatus">Adjust text size or mark this guide as reviewed.</p></div>'+
      '<div class="article-side-card"><span class="eyebrow">LIVEFIT REMINDER</span><p>Use general fitness guidance as a starting point. Adapt for your health, ability, and medical advice.</p></div>';
    const layout=document.createElement('div');
    layout.className='article-reading-layout';
    content.parentNode.insertBefore(layout,content);
    layout.appendChild(content);
    layout.appendChild(side);
    let size=17;
    document.getElementById('fontDown')?.addEventListener('click',()=>{size=Math.max(15,size-1);content.style.setProperty('--reader-size',size+'px')});
    document.getElementById('fontUp')?.addEventListener('click',()=>{size=Math.min(22,size+1);content.style.setProperty('--reader-size',size+'px')});
    document.getElementById('markProgress')?.addEventListener('click',()=>{
      localStorage.setItem('livefit-article-reviewed-'+location.search,new Date().toISOString());
      document.getElementById('articleActionStatus').textContent='✓ Reviewed today. Keep the useful parts and put one into action.';
    });
  }
})();