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

(() => {
  const articleContent=document.getElementById('articleContent');
  if(!articleContent || document.querySelector('.listen-launch')) return;

  const launch=document.createElement('button');
  launch.className='listen-launch';
  launch.type='button';
  launch.innerHTML='<span>▶</span> Listen';
  document.body.appendChild(launch);

  const drawer=document.createElement('aside');
  drawer.className='listen-drawer';
  drawer.setAttribute('aria-label','Listen to this article');
  drawer.innerHTML=
    '<div class="listen-head"><div><span class="eyebrow">LISTEN TO THIS ARTICLE</span><h3>Read it to me</h3></div><button type="button" aria-label="Close listener">×</button></div>'+
    '<div class="listen-controls">'+
      '<label>Voice<select id="listenVoice"></select></label>'+
      '<label>Speed<select id="listenRate"><option value=".8">Relaxed • 0.8×</option><option value="1" selected>Normal • 1×</option><option value="1.15">Brisk • 1.15×</option><option value="1.3">Fast • 1.3×</option><option value="1.5">Very fast • 1.5×</option></select></label>'+
      '<label>What to read<select id="listenScope"><option value="full">Full article</option><option value="section">Current section</option><option value="summary">Title + introduction</option></select></label>'+
      '<div class="listen-buttons"><button type="button" class="primary" id="listenPlay">▶ Play</button><button type="button" id="listenPause">Ⅱ Pause</button><button type="button" id="listenStop">■ Stop</button></div>'+
      '<p class="listen-status" id="listenStatus">Uses the voices available on your device or browser. You can keep reading while it plays.</p>'+
    '</div>';
  document.body.appendChild(drawer);

  const close=drawer.querySelector('.listen-head button');
  const voiceSelect=drawer.querySelector('#listenVoice');
  const rateSelect=drawer.querySelector('#listenRate');
  const scopeSelect=drawer.querySelector('#listenScope');
  const play=drawer.querySelector('#listenPlay');
  const pause=drawer.querySelector('#listenPause');
  const stop=drawer.querySelector('#listenStop');
  const status=drawer.querySelector('#listenStatus');
  let active=null;

  const voices=()=>speechSynthesis.getVoices().filter(v=>v.lang && v.lang.toLowerCase().startsWith('en'));
  const loadVoices=()=>{
    if(!voiceSelect) return;
    const list=voices();
    voiceSelect.innerHTML=list.length?list.map((v,i)=>'<option value="'+i+'">'+v.name+' • '+v.lang+'</option>').join(''):'<option value="">Default device voice</option>';
  };
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged',loadVoices);

  const cleanText=el=>{
    const clone=el.cloneNode(true);
    clone.querySelectorAll('button,input,select,textarea,script,style,.article-sources,.ad-art-marker,.article-checklist,.article-interactive').forEach(n=>n.remove());
    return clone.innerText.replace(/\s+/g,' ').trim();
  };
  const currentSectionText=()=>{
    const sections=[...articleContent.querySelectorAll('section')];
    if(!sections.length) return cleanText(articleContent);
    const y=window.scrollY+window.innerHeight*.3;
    let chosen=sections[0];
    for(const s of sections){ if(s.getBoundingClientRect().top+window.scrollY<=y) chosen=s; }
    return cleanText(chosen);
  };
  const getText=()=>{
    if(scopeSelect.value==='section') return currentSectionText();
    if(scopeSelect.value==='summary'){
      const title=document.getElementById('articleTitle')?.innerText||'';
      const deck=document.getElementById('articleDeck')?.innerText||'';
      const first=articleContent.querySelector('section');
      return [title,deck,first?cleanText(first):''].join('. ');
    }
    return cleanText(articleContent);
  };
  const start=()=>{
    speechSynthesis.cancel();
    const text=getText();
    if(!text){status.textContent='Nothing to read yet.';return}
    active=new SpeechSynthesisUtterance(text);
    active.rate=Number(rateSelect.value)||1;
    const list=voices();
    if(list.length && voiceSelect.value!=='') active.voice=list[Number(voiceSelect.value)]||list[0];
    active.onstart=()=>{status.textContent='Reading now. You can scroll and follow along.';play.textContent='▶ Restart'};
    active.onend=()=>{status.textContent='Finished reading this selection.';play.textContent='▶ Play'};
    active.onerror=()=>{status.textContent='The browser voice stopped. Try another voice or press Play again.'};
    speechSynthesis.speak(active);
  };

  launch.addEventListener('click',()=>drawer.classList.add('open'));
  close.addEventListener('click',()=>drawer.classList.remove('open'));
  play.addEventListener('click',start);
  pause.addEventListener('click',()=>{
    if(speechSynthesis.speaking && !speechSynthesis.paused){speechSynthesis.pause();pause.textContent='▶ Resume';status.textContent='Paused.'}
    else if(speechSynthesis.paused){speechSynthesis.resume();pause.textContent='Ⅱ Pause';status.textContent='Reading resumed.'}
  });
  stop.addEventListener('click',()=>{speechSynthesis.cancel();pause.textContent='Ⅱ Pause';play.textContent='▶ Play';status.textContent='Stopped.'});
  window.addEventListener('beforeunload',()=>speechSynthesis.cancel());
})();


/* Article archive rail: all LiveFit guides stay visible in the natural page scroll. */
(() => {
  const side=document.querySelector('.article-side-panel');
  if(!side || !window.LiveFitArticles || side.querySelector('.article-archive-card')) return;
  const current=new URLSearchParams(location.search).get('id');
  const archive=document.createElement('div');
  archive.className='article-side-card article-archive-card';
  archive.innerHTML='<span class="eyebrow">ARTICLE ARCHIVE</span>'+
    '<div class="article-archive-list">'+
    window.LiveFitArticles.map((a,i)=>
      '<a class="'+(a.id===current?'active':'')+'" href="article.html?id='+encodeURIComponent(a.id)+'">'+
      '<span>'+String(i+1).padStart(2,'0')+'</span><b>'+a.title+'</b></a>').join('')+
    '</div>';
  side.appendChild(archive);
})();