(() => {
  const root=document.documentElement;
  const prefix=location.pathname.includes('/tools/')?'../':'';
  const enhancementHref=prefix+'css/livefit-enhancements.css';
  if(![...document.styleSheets].some(s=>s.href&&s.href.includes('livefit-enhancements.css'))&&!document.querySelector('link[href$="livefit-enhancements.css"]')){
    const enhancement=document.createElement('link');
    enhancement.rel='stylesheet';
    enhancement.href=enhancementHref;
    document.head.appendChild(enhancement);
  }

  // Keep one familiar navigation system on every LiveFit page.
  const onHome=/\/(?:index\.html)?$/.test(location.pathname);
  const homeAnchor=id=>onHome?'#'+id:prefix+'index.html#'+id;
  const navItems=[
    ['My Plan',homeAnchor('plan'),'<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle>'],
    ['Tools',prefix+'tools.html','<path d="M12 4v16M4 12h16"></path>'],
    ['Workouts',prefix+'workouts.html','<path d="M4 15l5-5 4 4 7-8"></path><path d="M15 6h5v5"></path>'],
    ['Nutrition',homeAnchor('nutrition'),'<path d="M12 20c5-3 7-7 6-12-5-1-9 1-12 6 1 3 3 5 6 6Z"></path><path d="M8 16c3-3 5-5 8-7"></path>'],
    ['Gear',homeAnchor('gear'),'<path d="M6 9v6M18 9v6M3 10v4M21 10v4M6 12h12"></path>'],
    ['Videos',homeAnchor('videos'),'<rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m10 9 5 3-5 3Z"></path>'],
    ['Articles',prefix+'articles.html','<path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>'],
    ['About',prefix+'about.html','<circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7h.01"></path>'],
    ['Contact Us',prefix+'contact.html','<path d="M4 6h16v12H4z"></path><path d="m4 7 8 6 8-6"></path>']
  ];
  const navMarkup=navItems.map(([label,href,svg])=>'<a href="'+href+'" data-label="'+label+'" aria-label="'+label+'"><svg class="nav-svg" viewBox="0 0 24 24">'+svg+'</svg></a>').join('');
  const mobileMarkup=navItems.map(([label,href])=>'<a href="'+href+'">'+(label==='Tools'?'Free Tools':label)+'</a>').join('');
  const header=document.querySelector('.site-header');
  if(header){
    let desktop=header.querySelector('.desktop-nav');
    if(!desktop){
      desktop=document.createElement('nav');
      desktop.className='desktop-nav';
      desktop.setAttribute('aria-label','Main navigation');
      const menuExisting=header.querySelector('.menu-button');
      if(menuExisting) header.insertBefore(desktop,menuExisting); else header.appendChild(desktop);
    }
    desktop.innerHTML=navMarkup;
    let menu=header.querySelector('.menu-button');
    if(!menu){
      menu=document.createElement('button');
      menu.className='menu-button';
      menu.id='menuButton';
      menu.setAttribute('aria-label','Open navigation');
      menu.setAttribute('aria-expanded','false');
      menu.innerHTML='<span></span><span></span><span></span>';
      header.appendChild(menu);
    }
    let mobile=document.getElementById('mobileNav');
    if(!mobile){
      mobile=document.createElement('nav');
      mobile.className='mobile-nav';
      mobile.id='mobileNav';
      mobile.setAttribute('aria-label','Mobile navigation');
      header.insertAdjacentElement('afterend',mobile);
    }
    mobile.innerHTML=mobileMarkup;

    // Keep the same theme + music controls on every normal LiveFit page.
    let controls=header.querySelector('.personal-controls');
    if(!controls){
      controls=document.createElement('div');
      controls.className='personal-controls';
      header.insertBefore(controls,desktop);
    }
    if(!controls.querySelector('#themeToggle')){
      controls.insertAdjacentHTML('afterbegin','<button class="round-control" id="themeToggle" aria-label="Switch light and dark mode" title="Light / dark mode">◐</button>');
    }
    if(!controls.querySelector('#musicToggle')){
      controls.insertAdjacentHTML('beforeend','<button class="round-control music-control" id="musicToggle" aria-label="Open ie Music player" title="Music"><span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>');
    }
  }

  const ensureMusicPanel=()=>{
    if(document.getElementById('musicPanel')||document.body.classList.contains('report-page')) return;
    const logo=prefix+'assets/ie-logo-real.webp';
    const panel=document.createElement('div');
    panel.className='music-panel';
    panel.id='musicPanel';
    panel.hidden=true;
    panel.innerHTML=
      '<div class="music-head">'+
        '<div class="ie-music-mark"><div class="ie-music-logo"><img src="'+logo+'" alt="InAct Entertainment ie logo"></div><div><strong>Music</strong><small>by InAct Entertainment</small></div></div>'+
        '<button class="music-close" id="musicClose" aria-label="Close music player">×</button>'+
      '</div>'+
      '<div class="music-body">'+
        '<div class="music-now"><span>CHOOSE YOUR WORKOUT SOUND</span><strong id="musicNow">Select your vibe</strong><small id="musicStatus">Pick a genre, then choose a track.</small><p class="music-ai-note"><b>ie Music:</b> original AI-assisted workout tracks will be added alongside approved video sources.</p></div>'+
        '<div class="music-genres">'+
          '<button class="music-mode" data-mode="Hip-Hop"><b>Hip-Hop</b><small>Lift / intensity</small></button>'+
          '<button class="music-mode" data-mode="Club / House"><b>Club / House</b><small>Cardio / circuits</small></button>'+
          '<button class="music-mode" data-mode="Run / Cardio"><b>Run / Cardio</b><small>Tempo / endurance</small></button>'+
          '<button class="music-mode" data-mode="Unwind"><b>Unwind</b><small>Cooldown / stretch</small></button>'+
          '<button class="music-mode" data-mode="Meditation"><b>Meditation</b><small>Breathing / reset</small></button>'+
          '<button class="music-mode" data-mode="Chimes"><b>Chimes</b><small>Ambient / calm</small></button>'+
        '</div>'+
        '<div class="music-track-list" id="musicTrackList" aria-live="polite"></div>'+
        '<div class="music-view-toggle" role="group" aria-label="Music player view"><button type="button" class="active" data-player-view="listen">Listen</button><button type="button" data-player-view="video">Watch Video</button></div>'+
        '<div class="music-video-shell audio-focus" id="musicVideoShell"><div id="musicVideo"></div></div>'+
        '<div class="music-player-meta"><strong id="musicTrackTitle">Choose a track</strong><small id="musicTrackArtist">Official YouTube sources where available</small></div>'+
        '<div class="music-transport"><button type="button" id="musicPrev" aria-label="Previous track">◀◀</button><button type="button" class="music-main-play" id="musicPlay" aria-label="Play or pause">▶</button><button type="button" id="musicStop" aria-label="Stop track">■</button><button type="button" id="musicNext" aria-label="Next track">▶▶</button></div>'+
        '<div class="music-progress-wrap"><input id="musicProgress" class="music-progress" type="range" min="0" max="1000" value="0" aria-label="Track progress"><div><span id="musicElapsed">0:00</span><span id="musicDuration">0:00</span></div></div>'+
        '<label class="music-volume-label"><small>Volume</small><input class="music-volume" id="musicVolume" type="range" min="0" max="100" value="70"></label>'+
        '<div class="music-foot">Workout tracks use embedded video sources so playback stays on LiveFit. Recovery categories are ready for original ie Music and approved audio sources.</div>'+
      '</div>';
    document.body.appendChild(panel);
  };
  ensureMusicPanel();

  if(!document.querySelector('link[rel="icon"]')){
    const icon=document.createElement('link');
    icon.rel='icon';
    icon.type='image/svg+xml';
    icon.href=(location.pathname.includes('/tools/')?'../':'')+'assets/favicon.svg';
    document.head.appendChild(icon);
  }

  // Centralized safe local data helpers. A malformed browser value should never break a LiveFit page.
  window.LiveFit={
    safeJSON(key,fallback={}){
      try{
        const raw=localStorage.getItem(key);
        if(!raw) return fallback;
        const parsed=JSON.parse(raw);
        return parsed&&typeof parsed==='object'?parsed:fallback;
      }catch(err){
        console.warn('LiveFit recovered from invalid local data for',key);
        return fallback;
      }
    },
    safePlan(){ return this.safeJSON('livefit-plan',{}); },
    savePlan(value){ localStorage.setItem('livefit-plan',JSON.stringify(value||{})); },
    access(){ return this.safeJSON('livefit-roadmap-access',{}); },
    grantQAPreview(email){
      const access={status:'qa-preview',email:email||'',grantedAt:new Date().toISOString(),version:1};
      localStorage.setItem('livefit-roadmap-access',JSON.stringify(access));
      return access;
    },
    hasRoadmapAccess(){
      const a=this.access();
      return a.status==='qa-preview'||a.status==='paid';
    },
    reset(){
      ['livefit-plan','livefit-roadmap-checkout','livefit-roadmap-access'].forEach(k=>localStorage.removeItem(k));
      sessionStorage.removeItem('livefit-plan-seen');
    }
  };

  const themeToggle=document.getElementById('themeToggle');
  const savedTheme=localStorage.getItem('livefit-theme');
  if(savedTheme==='dark'||savedTheme==='light') root.dataset.theme=savedTheme;
  if(themeToggle) themeToggle.addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    root.dataset.theme=next;
    localStorage.setItem('livefit-theme',next);
  });

  const menuButton=document.getElementById('menuButton');
  const mobileNav=document.getElementById('mobileNav');
  if(menuButton&&mobileNav){
    menuButton.addEventListener('click',()=>{
      const open=mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded',String(open));
    });
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    }));
  }

  const musicToggle=document.getElementById('musicToggle');
  const musicPanel=document.getElementById('musicPanel');
  if(musicToggle&&musicPanel){
    musicToggle.addEventListener('click',()=>{musicPanel.hidden=!musicPanel.hidden;});
    document.addEventListener('click',e=>{
      if(!musicPanel.hidden&&!musicPanel.contains(e.target)&&!musicToggle.contains(e.target)) musicPanel.hidden=true;
    });
  }

  const sexButtons=document.querySelectorAll('.sex-choice');
  const homeProfiles=document.querySelectorAll('#homeBodySelector .body-sprite');
  sexButtons.forEach(btn=>btn.addEventListener('click',()=>{
    sexButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const sex=btn.dataset.sex;
    homeProfiles.forEach(sprite=>{
      sprite.classList.remove('male','female');
      sprite.classList.add(sex);
    });
  }));

  document.querySelectorAll('.profile-card').forEach(card=>card.addEventListener('click',()=>{
    document.querySelectorAll('.profile-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
  }));

  const modal=document.getElementById('planModal');
  const closePlan=document.getElementById('closePlan');
  const modalTools=document.getElementById('modalTools');
  let lastFocused=null;
  const openModal=()=>{
    if(!modal) return;
    lastFocused=document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    (closePlan||modal.querySelector('a,button'))?.focus();
  };
  const closeModal=()=>{
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    lastFocused?.focus?.();
  };
  if(closePlan) closePlan.addEventListener('click',closeModal);
  if(modalTools) modalTools.addEventListener('click',closeModal);
  if(modal) modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeModal();
      if(mobileNav?.classList.contains('open')){
        mobileNav.classList.remove('open');
        menuButton?.setAttribute('aria-expanded','false');
      }
    }
  });

  setTimeout(()=>{
    if(modal&&!sessionStorage.getItem('livefit-plan-seen')){
      openModal();
      sessionStorage.setItem('livefit-plan-seen','1');
    }
  },9000);

  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12});
    reveals.forEach(el=>observer.observe(el));
  }else reveals.forEach(el=>el.classList.add('is-visible'));

  // One footer structure everywhere so navigation never changes between page types.
  if(!document.body.classList.contains('report-page')){
    let footer=document.querySelector('footer');
    if(!footer){ footer=document.createElement('footer'); document.body.appendChild(footer); }
    footer.className='site-footer unified-footer';
    footer.innerHTML=
      '<div class="footer-brand"><span class="brand-live">LIVE FIT</span><span class="brand-info">.info</span><p>Tools. Workouts. Gear. Better everyday fitness.</p></div>'+
      '<div class="footer-links">'+
        '<a href="'+prefix+'tools.html">Tools</a>'+
        '<a href="'+prefix+'workouts.html">Workouts</a>'+
        '<a href="'+prefix+'plan.html">My Plan</a>'+
        '<a href="'+prefix+'articles.html">Articles</a>'+
        '<a href="'+prefix+'about.html">About</a>'+
        '<a href="'+prefix+'contact.html">Contact</a>'+
        '<a href="'+prefix+'privacy.html">Privacy</a>'+
        '<a href="'+prefix+'terms.html">Terms</a>'+
        '<a href="'+prefix+'disclaimer.html">Disclaimer</a>'+
        '<a href="'+prefix+'affiliate.html">Affiliate Disclosure</a>'+
        '<a href="'+prefix+'refund.html">Refund Policy</a>'+
      '</div>'+
      '<button class="data-reset-button" type="button">Reset My LiveFit Data</button>'+
      '<p class="umbrella">LiveFit.info is a project of InAct Entertainment LLC.</p>';
  }

  // Add the five core tool jump cards at the bottom of every tool page.
  if(location.pathname.includes('/tools/')&&!document.querySelector('.tool-jump-bar')){
    const toolMain=document.querySelector('main');
    if(toolMain){
      const jump=document.createElement('section');
      jump.className='tool-jump-bar';
      jump.innerHTML=
        '<div class="tool-jump-head"><p class="eyebrow">KEEP MOVING THROUGH LIVEFIT</p><h2>All five core tools are one tap away.</h2></div>'+
        '<div class="tool-jump-grid">'+
          '<a href="calorie.html"><span>01</span><b>Calorie & TDEE</b><small>Energy needs</small></a>'+
          '<a href="protein.html"><span>02</span><b>Protein Target</b><small>Daily range</small></a>'+
          '<a href="walking.html"><span>03</span><b>Walking & Steps</b><small>Distance + pace</small></a>'+
          '<a href="workout.html"><span>04</span><b>Workout Generator</b><small>Build a session</small></a>'+
          '<a href="equipment.html"><span>05</span><b>Equipment Matcher</b><small>Gear + space</small></a>'+
        '</div>'+
        '<a class="tool-jump-all" href="../tools.html">View the full tools library →</a>';
      toolMain.appendChild(jump);
    }
  }

  // Load the shared enhancement script on pages that do not already include it.
  window.addEventListener('DOMContentLoaded',()=>{
    if(!document.querySelector('script[src$="livefit-enhancements.js"]')){
      const script=document.createElement('script');
      script.src=prefix+'js/livefit-enhancements.js';
      document.body.appendChild(script);
    }
  });

  document.querySelectorAll('.data-reset-button').forEach(btn=>btn.addEventListener('click',()=>{
    if(confirm('Reset your saved LiveFit assessment, tool results, and roadmap preview data on this device?')){
      window.LiveFit.reset();
      location.href=(location.pathname.includes('/tools/')?'../':'')+'plan.html';
    }
  }));

  document.querySelectorAll('a.page-link').forEach(link=>link.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')) return;

    // Mobile browsers were occasionally preserving the transformed page-transition
    // layer during scroll/navigation, which could visually shrink or offset the page.
    // Navigate directly on mobile/coarse-pointer devices; keep the swoop on desktop only.
    const mobileLike=window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    if(mobileLike){
      e.preventDefault();
      window.location.assign(href);
      return;
    }

    e.preventDefault();
    document.body.classList.add('page-leaving');
    const safetyTimer=setTimeout(()=>{window.location.assign(href)},330);
    window.addEventListener('pageshow',()=>{
      clearTimeout(safetyTimer);
      document.body.classList.remove('page-leaving');
    },{once:true});
  }));
})();