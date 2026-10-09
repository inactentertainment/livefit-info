(() => {
  const panel=document.getElementById('musicPanel');
  const close=document.getElementById('musicClose');
  const now=document.getElementById('musicNow');
  const status=document.getElementById('musicStatus');
  const modes=[...document.querySelectorAll('.music-mode')];
  const list=document.getElementById('musicTrackList');
  const shell=document.getElementById('musicVideoShell');
  const title=document.getElementById('musicTrackTitle');
  const artist=document.getElementById('musicTrackArtist');
  const play=document.getElementById('musicPlay');
  const prev=document.getElementById('musicPrev');
  const next=document.getElementById('musicNext');
  const progress=document.getElementById('musicProgress');
  const elapsed=document.getElementById('musicElapsed');
  const duration=document.getElementById('musicDuration');
  const volume=document.getElementById('musicVolume');
  const viewButtons=[...document.querySelectorAll('[data-player-view]')];

  const tracks={
    'Hip-Hop':[
      {title:'If I Ruled the World',artist:'Nas',videoId:'vvmjZkFcCh0'},
      {title:'Juicy',artist:'The Notorious B.I.G.',videoId:'_JZom_gVfuw'},
      {title:'California Love',artist:'2Pac feat. Dr. Dre',videoId:'iiWoF5tvLG4'}
    ],
    'Club / House':[
      {title:'Gonna Make You Sweat',artist:'C+C Music Factory',videoId:'LaTGrV58wec'},
      {title:'Rhythm Is a Dancer',artist:'SNAP!',videoId:'DMiREvBzGY0'},
      {title:'What Is Love',artist:'Haddaway',videoId:'HEXWRTEbj1I'}
    ],
    'Run / Cardio':[
      {title:'Pump Up the Jam',artist:'Technotronic',videoId:'y_-SP55sRig'},
      {title:'Finally',artist:'CeCe Peniston',videoId:'xk8mm1Qmt-Y'},
      {title:'Show Me Love',artist:'Robin S',videoId:'Ps2Jc28tQrw'}
    ],
    'Unwind':[],
    'Meditation':[],
    'Chimes':[]
  };

  let currentMode='';
  let currentIndex=0;
  let player=null;
  let playerReady=false;
  let ytLoading=false;
  let ytCallbacks=[];

  const fmt=s=>{
    if(!Number.isFinite(s)||s<0)return '0:00';
    const m=Math.floor(s/60),sec=Math.floor(s%60);
    return m+':'+String(sec).padStart(2,'0');
  };

  const ensureYT=cb=>{
    if(window.YT&&window.YT.Player){cb();return}
    ytCallbacks.push(cb);
    if(ytLoading)return;
    ytLoading=true;
    const old=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      try{old?.()}catch{}
      ytCallbacks.splice(0).forEach(fn=>fn());
    };
    const s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    s.async=true;
    document.head.appendChild(s);
  };

  const currentTrack=()=>tracks[currentMode]?.[currentIndex]||null;

  const setMeta=t=>{
    if(!t){title.textContent='Choose a track';artist.textContent='Original ie Music recovery tracks coming next.';return}
    title.textContent=t.title;
    artist.textContent=t.artist+' • embedded video source';
  };

  const createOrCue=t=>{
    if(!t)return;
    ensureYT(()=>{
      if(player&&playerReady){
        player.cueVideoById(t.videoId);
        player.setVolume(Number(volume?.value||70));
        return;
      }
      if(player&&!playerReady)return;
      player=new YT.Player('musicVideo',{
        width:'100%',height:'100%',videoId:t.videoId,
        playerVars:{playsinline:1,rel:0,controls:0,modestbranding:1,origin:location.origin},
        events:{
          onReady:e=>{
            playerReady=true;
            e.target.setVolume(Number(volume?.value||70));
            e.target.cueVideoById(currentTrack()?.videoId||t.videoId);
          },
          onStateChange:e=>{
            if(e.data===YT.PlayerState.PLAYING) play.textContent='Ⅱ';
            if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED) play.textContent='▶';
            if(e.data===YT.PlayerState.ENDED) go(1,true);
          }
        }
      });
    });
  };

  const renderTracks=()=>{
    const set=tracks[currentMode]||[];
    if(!set.length){
      list.innerHTML='<div class="music-empty"><b>ie Music recovery collection</b><span>Three original '+currentMode.toLowerCase()+' selections will be added here next.</span></div>';
      setMeta(null);
      if(status)status.textContent='This recovery channel is ready for original ie Music.';
      return;
    }
    list.innerHTML=set.map((t,i)=>
      '<button type="button" class="music-track '+(i===currentIndex?'active':'')+'" data-track="'+i+'">'+
      '<span class="track-no">'+String(i+1).padStart(2,'0')+'</span><span><b>'+t.title+'</b><small>'+t.artist+'</small></span><i>▶</i></button>'
    ).join('');
    list.querySelectorAll('.music-track').forEach(btn=>btn.addEventListener('click',()=>{
      currentIndex=Number(btn.dataset.track)||0;
      renderTracks();
      const t=currentTrack();setMeta(t);createOrCue(t);
      if(status)status.textContent='Ready. Press play or open the video view.';
    }));
    const t=currentTrack();setMeta(t);createOrCue(t);
  };

  const selectMode=mode=>{
    currentMode=mode;currentIndex=0;
    modes.forEach(x=>x.classList.toggle('active',x.dataset.mode===mode));
    if(now)now.textContent=mode;
    renderTracks();
  };

  const go=(delta,autoplay=false)=>{
    const set=tracks[currentMode]||[];
    if(!set.length)return;
    currentIndex=(currentIndex+delta+set.length)%set.length;
    renderTracks();
    const t=currentTrack();setMeta(t);
    ensureYT(()=>{
      if(player&&playerReady){
        autoplay?player.loadVideoById(t.videoId):player.cueVideoById(t.videoId);
        player.setVolume(Number(volume?.value||70));
      }
    });
  };

  close?.addEventListener('click',()=>{panel.hidden=true});
  panel?.addEventListener('click',e=>e.stopPropagation());

  modes.forEach(btn=>btn.addEventListener('click',()=>selectMode(btn.dataset.mode)));

  play?.addEventListener('click',()=>{
    const t=currentTrack();
    if(!t){status.textContent='Choose Hip-Hop, Club / House, or Run / Cardio for the current music library.';return}
    ensureYT(()=>{
      if(!player||!playerReady){createOrCue(t);return}
      const state=player.getPlayerState();
      if(state===YT.PlayerState.PLAYING)player.pauseVideo();
      else player.playVideo();
    });
  });

  prev?.addEventListener('click',()=>go(-1,false));
  next?.addEventListener('click',()=>go(1,false));
  volume?.addEventListener('input',()=>{if(player&&playerReady)player.setVolume(Number(volume.value))});
  progress?.addEventListener('input',()=>{
    if(!player||!playerReady)return;
    const d=player.getDuration()||0;
    if(d)player.seekTo(d*(Number(progress.value)/1000),true);
  });

  viewButtons.forEach(btn=>btn.addEventListener('click',()=>{
    viewButtons.forEach(x=>x.classList.toggle('active',x===btn));
    shell?.classList.toggle('audio-focus',btn.dataset.playerView==='listen');
  }));

  setInterval(()=>{
    if(!player||!playerReady)return;
    const d=player.getDuration()||0,c=player.getCurrentTime()||0;
    if(progress&&!progress.matches(':active'))progress.value=d?Math.round(c/d*1000):0;
    if(elapsed)elapsed.textContent=fmt(c);
    if(duration)duration.textContent=fmt(d);
  },500);

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