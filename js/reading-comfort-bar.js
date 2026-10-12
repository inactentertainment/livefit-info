(() => {
  const content=document.getElementById('articleContent');
  const article=document.querySelector('.article-reader article');
  if(!content||!article||document.getElementById('livefitReadingBar')) return;

  document.body.classList.add('has-reading-comfort-bar');
  const root=document.documentElement;
  const articleId=new URLSearchParams(location.search).get('id')||'article';
  const prefKey='livefit-reader-preferences';
  const journalKey='livefit-reader-journal-'+articleId;
  const positionKey='livefit-reader-position-'+articleId;
  const memoryStore={};
  let storageOK=true;
  try{
    const probe='__livefit_reader_probe__';
    localStorage.setItem(probe,'1');
    localStorage.removeItem(probe);
  }catch{storageOK=false}

  const readStore=(key,fallback={})=>{
    try{
      const raw=storageOK?localStorage.getItem(key):memoryStore[key];
      return raw?JSON.parse(raw):fallback;
    }catch{return fallback}
  };
  const writeStore=(key,value)=>{
    try{
      const raw=typeof value==='string'?value:JSON.stringify(value);
      if(storageOK)localStorage.setItem(key,raw); else memoryStore[key]=raw;
      return storageOK;
    }catch{return false}
  };
  const removeStore=key=>{
    try{if(storageOK)localStorage.removeItem(key);else delete memoryStore[key]}catch{}
  };

  const prefs=readStore(prefKey,{});
  if(prefs.tone) root.dataset.readerTone=prefs.tone;
  if(prefs.font) root.dataset.readerFont=prefs.font;
  if(prefs.size) content.style.setProperty('--reader-size',prefs.size);
  if(prefs.line) content.style.setProperty('--reader-line-height',prefs.line);
  if(prefs.width){content.style.maxWidth=prefs.width;content.style.marginInline='auto'}
  root.classList.toggle('reader-reduced-motion',!!prefs.reduced);
  root.classList.toggle('reader-quiet',!!prefs.quiet);

  const savePrefs=()=>writeStore(prefKey,{
    tone:root.dataset.readerTone||'',
    font:root.dataset.readerFont||'',
    size:content.style.getPropertyValue('--reader-size')||'',
    line:content.style.getPropertyValue('--reader-line-height')||'',
    width:content.style.maxWidth||'',
    reduced:root.classList.contains('reader-reduced-motion'),
    quiet:root.classList.contains('reader-quiet')
  });

  const icons={
    comfort:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4M8 14c-1.5-1.1-2.5-2.9-2.5-5A6.5 6.5 0 0 1 18.5 9c0 2.1-1 3.9-2.5 5-.8.6-1 1.2-1 2H9c0-.8-.2-1.4-1-2Z"/></svg>',
    text:'<span class="reader-aa" aria-hidden="true">Aa</span>',
    focus:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    break:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 4v6.5c0 1.2-1 2.2-2.2 2.2H5.8A2.8 2.8 0 0 0 3 15.5V20M14.5 4v6.5c0 1.2 1 2.2 2.2 2.2h1.5a2.8 2.8 0 0 1 2.8 2.8V20"/><path d="M9.5 8c1.6 0 2.5.9 2.5 2.5V20M14.5 8c-1.6 0-2.5.9-2.5 2.5V20"/></svg>',
    journal:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h11a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 7h7M8 11h7M8 15h5"/></svg>',
    listen:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5Z"/><path d="M17 9.5c1.3 1.4 1.3 3.6 0 5M19.5 7c2.8 2.8 2.8 7.2 0 10"/></svg>',
    top:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 10 6-6 6 6M12 4v16"/></svg>'
  };

  const tools=[
    ['comfort','Comfort',icons.comfort],
    ['text','Text',icons.text],
    ['focus','Focus',icons.focus],
    ['break','Take a Break',icons.break],
    ['journal','Journal',icons.journal],
    ['listen','Listen',icons.listen]
  ];

  const bar=document.createElement('nav');
  bar.id='livefitReadingBar';
  bar.className='livefit-reading-bar';
  bar.setAttribute('aria-label','Reading and comfort tools');
  bar.innerHTML=tools.map(([id,label,icon])=>
    '<button type="button" class="reader-icon-btn" data-reader-tool="'+id+'" data-tooltip="'+label+'" aria-label="'+label+'" aria-expanded="false">'+icon+'</button>'
  ).join('')+
  '<button type="button" class="reader-icon-btn reader-top-btn" id="readerBackTop" data-tooltip="Back to Top" aria-label="Back to top">'+icons.top+'</button>';
  document.body.appendChild(bar);

  const panel=document.createElement('section');
  panel.className='reader-tool-panel';
  panel.id='readerToolPanel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','false');
  panel.setAttribute('aria-label','Reading tools');
  document.body.appendChild(panel);

  let activeTool='';
  const closePanel=()=>{
    if(activeTool==='break'&&typeof stopBreak==='function')stopBreak(false);
    activeTool='';
    panel.classList.remove('open');
    panel.innerHTML='';
    bar.querySelectorAll('[data-reader-tool]').forEach(b=>b.setAttribute('aria-expanded','false'));
  };
  const openPanel=(button,title,eyebrow,body)=>{
    const same=button.getAttribute('aria-expanded')==='true'&&panel.classList.contains('open');
    closePanel();
    if(same)return false;
    button.setAttribute('aria-expanded','true');
    activeTool=button.dataset.readerTool||'';
    panel.innerHTML='<div class="reader-tool-panel-head"><div><p class="eyebrow">'+eyebrow+'</p><h3>'+title+'</h3></div><button type="button" class="reader-tool-close" aria-label="Close">×</button></div>'+body;
    panel.classList.add('open');
    panel.querySelector('.reader-tool-close')?.addEventListener('click',closePanel);
    panel.querySelector('button,select,textarea,input')?.focus?.({preventScroll:true});
    return true;
  };

  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
  document.addEventListener('click',e=>{
    if(panel.classList.contains('open')&&!panel.contains(e.target)&&!bar.contains(e.target))closePanel();
  });

  const scrollBehavior=()=>root.classList.contains('reader-reduced-motion')?'auto':'smooth';
  document.getElementById('readerBackTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:scrollBehavior()}));

  // Keep the bar above the footer rather than covering it.
  const placeBar=()=>{
    const footer=document.querySelector('footer');
    if(!footer)return;
    const rect=footer.getBoundingClientRect();
    const overlap=Math.max(0,innerHeight-rect.top);
    const lift=Math.min(overlap,footer.offsetHeight);
    bar.style.bottom=lift+'px';
    panel.style.bottom=(56+lift)+'px';
  };
  addEventListener('scroll',placeBar,{passive:true});
  addEventListener('resize',placeBar,{passive:true});
  placeBar();

  const clearTone=()=>{delete root.dataset.readerTone};
  const setTheme=mode=>{
    clearTone();
    if(mode==='warm'||mode==='gray'){
      root.dataset.theme='light';
      root.dataset.readerTone=mode;
      writeStore('livefit-theme','light');
    }else{
      root.dataset.theme=mode;
      writeStore('livefit-theme',mode);
    }
    savePrefs();
  };
  document.getElementById('themeToggle')?.addEventListener('click',()=>setTimeout(()=>{clearTone();savePrefs()},0));

  // Paragraph Focus.
  const focusBlocks=()=>[...content.querySelectorAll('p,li')].filter(el=>{
    if(el.closest('.article-sources,.article-quiz,.article-interactive,.roadmap-inline-cta,.article-related-video,.article-data-visual,button,label,nav,aside'))return false;
    return el.textContent.trim().length>20;
  });
  let focusOn=false;
  let focusIndex=0;
  const refreshFocusClasses=()=>{
    const blocks=focusBlocks();
    blocks.forEach(el=>el.classList.add('lf-focusable'));
    focusIndex=Math.max(0,Math.min(focusIndex,Math.max(0,blocks.length-1)));
    blocks.forEach((el,i)=>el.classList.toggle('lf-focus-current',focusOn&&i===focusIndex));
    document.body.classList.toggle('reader-focus-active',focusOn);
  };
  const focusNearestIndex=()=>{
    const blocks=focusBlocks();
    if(!blocks.length)return 0;
    const marker=innerHeight*.42;
    let best=0,delta=Infinity;
    blocks.forEach((el,i)=>{
      const d=Math.abs(el.getBoundingClientRect().top-marker);
      if(d<delta){delta=d;best=i}
    });
    return best;
  };
  const focusGo=index=>{
    const blocks=focusBlocks();
    if(!blocks.length)return;
    focusOn=true;
    focusIndex=(index+blocks.length)%blocks.length;
    refreshFocusClasses();
    blocks[focusIndex].scrollIntoView({behavior:scrollBehavior(),block:'center'});
  };
  content.addEventListener('click',e=>{
    if(!focusOn)return;
    const block=e.target.closest('.lf-focusable');
    if(!block||!content.contains(block))return;
    const blocks=focusBlocks();
    const i=blocks.indexOf(block);
    if(i>=0){focusIndex=i;refreshFocusClasses()}
  });

  // Read aloud — only article title/deck/body, not sidebar/archive/navigation.
  const speechOK='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
  let speechBlocks=[];
  let speechIndex=0;
  let speaking=false;
  let speechPaused=false;
  let followReading=true;
  let selectedVoiceName='';
  let speechRate=1;

  const readableBlocks=()=>{
    const blocks=[];
    const title=document.getElementById('articleTitle');
    const deck=document.getElementById('articleDeck');
    if(title?.textContent.trim())blocks.push({el:title,text:title.textContent.trim()});
    if(deck?.textContent.trim())blocks.push({el:deck,text:deck.textContent.trim()});
    content.querySelectorAll('h2,h3,p,li').forEach(el=>{
      if(el.closest('.article-sources,.article-quiz,.article-interactive,.roadmap-inline-cta,.article-related-video,.article-data-visual,button,label,nav,aside'))return;
      const text=el.textContent.replace(/\s+/g,' ').trim();
      if(text.length>1)blocks.push({el,text});
    });
    return blocks;
  };
  const voices=()=>speechOK?speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang||'')):[];
  const clearReadingMark=()=>document.querySelectorAll('.lf-reading-current').forEach(el=>el.classList.remove('lf-reading-current'));
  const nearestSpeechIndex=blocks=>{
    if(!blocks.length)return 0;
    const marker=innerHeight*.38;
    let best=0,delta=Infinity;
    blocks.forEach((b,i)=>{
      const d=Math.abs(b.el.getBoundingClientRect().top-marker);
      if(d<delta){delta=d;best=i}
    });
    return best;
  };
  const selectedVoice=()=>voices().find(v=>v.name===selectedVoiceName)||null;
  const updateListenStatus=text=>{
    const el=document.getElementById('readerListenStatus');
    if(el)el.textContent=text;
  };
  const readSpeechBlock=()=>{
    if(!speechOK)return;
    if(!speaking||speechIndex>=speechBlocks.length){
      speaking=false;speechPaused=false;clearReadingMark();
      updateListenStatus('Finished reading this article.');
      return;
    }
    const block=speechBlocks[speechIndex];
    clearReadingMark();
    block.el.classList.add('lf-reading-current');
    if(followReading)block.el.scrollIntoView({behavior:scrollBehavior(),block:'center'});
    const u=new SpeechSynthesisUtterance(block.text);
    u.rate=speechRate;
    const v=selectedVoice();if(v)u.voice=v;
    u.onend=()=>{if(speaking&&!speechPaused){speechIndex++;readSpeechBlock()}};
    u.onerror=()=>{if(speaking&&!speechPaused){speechIndex++;readSpeechBlock()}};
    speechSynthesis.speak(u);
    updateListenStatus('Reading '+(speechIndex+1)+' of '+speechBlocks.length+'.');
  };
  const startReading=fromCurrent=>{
    if(!speechOK){updateListenStatus('Read aloud is not available in this browser. The other reading tools still work.');return}
    speechSynthesis.cancel();clearReadingMark();
    speechBlocks=readableBlocks();
    speechIndex=fromCurrent?nearestSpeechIndex(speechBlocks):0;
    speaking=true;speechPaused=false;
    readSpeechBlock();
  };
  const stopReading=()=>{
    if(speechOK)speechSynthesis.cancel();
    speaking=false;speechPaused=false;speechIndex=0;clearReadingMark();
    updateListenStatus('Stopped.');
  };
  const previewVoice=()=>{
    if(!speechOK){updateListenStatus('Voice preview is not available in this browser.');return}
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance('This is the selected LiveFit reading voice.');
    u.rate=speechRate;
    const v=selectedVoice();if(v)u.voice=v;
    speechSynthesis.speak(u);
    updateListenStatus('Playing voice preview.');
  };

  // Break guide state.
  const breakIcons={
    breathing:'<svg viewBox="0 0 24 24"><path d="M9.5 4v6.5c0 1.2-1 2.2-2.2 2.2H5.8A2.8 2.8 0 0 0 3 15.5V20M14.5 4v6.5c0 1.2 1 2.2 2.2 2.2h1.5a2.8 2.8 0 0 1 2.8 2.8V20"/><path d="M9.5 8c1.6 0 2.5.9 2.5 2.5V20M14.5 8c-1.6 0-2.5.9-2.5 2.5V20"/></svg>',
    eyes:'<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.4"/></svg>',
    movement:'<svg viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="2"/><path d="M12 7v6l-4 4M12 10l5 2M12 13l4 6M8 9l-3 3"/></svg>',
    guided:'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/><path d="m12 7 2 5-5 2 3-7Z"/><path d="M18 3v4h4"/></svg>'
  };
  const breakGuides={
    breathing:[
      ['Breathe in','Let the breath arrive slowly through your nose.'],
      ['Hold gently','Keep the shoulders loose.'],
      ['Breathe out','Exhale slowly and let the jaw soften.'],
      ['Rest','Pause before the next breath.']
    ],
    eyes:[
      ['Look away','Choose a point across the room or farther away.'],
      ['Soften your gaze','Let your eyes stop working so hard.'],
      ['Blink slowly','Blink five times without squeezing.'],
      ['Close and rest','Close your eyes for a few comfortable seconds.']
    ],
    movement:[
      ['Roll the shoulders','Slow circles backward, then forward.'],
      ['Open the hands','Spread the fingers, relax, and repeat.'],
      ['Lengthen up','Sit or stand tall without forcing posture.'],
      ['Move gently','March, shift weight, or take a few easy steps.']
    ],
    guided:[
      ['Reset','Let your shoulders drop and take one easy breath.'],
      ['Look away','Give your eyes a distant focal point.'],
      ['Move','Roll the shoulders and open the hands.'],
      ['Return','Take one calm breath and come back to the article.']
    ]
  };
  let breakType='breathing';
  let breakDuration=60;
  let breakRemaining=0;
  let breakIndex=0;
  let breakTimer=null;
  let breakPaused=false;
  let breakVoice=false;
  let breakReturnY=0;

  const speakBreak=text=>{
    if(!breakVoice||!speechOK)return;
    const u=new SpeechSynthesisUtterance(text);u.rate=.88;
    const v=selectedVoice();if(v)u.voice=v;
    speechSynthesis.speak(u);
  };
  const renderBreakStep=()=>{
    const stage=document.querySelector('.reader-break-stage');
    if(!stage)return;
    const guide=breakGuides[breakType];
    const step=guide[breakIndex%guide.length];
    const visual=stage.querySelector('.reader-break-visual');
    const title=stage.querySelector('strong');
    const copy=stage.querySelector('small');
    const timer=stage.querySelector('.reader-break-timer');
    visual.className='reader-break-visual '+(
      breakType==='breathing'?'breathing-active':
      breakType==='eyes'?'eye-active':
      breakType==='movement'?'move-active':'guided-active'
    );
    visual.innerHTML=breakIcons[breakType];
    title.textContent=step[0];
    copy.textContent=step[1];
    timer.textContent=breakRemaining>0?breakRemaining+' sec':'Ready';
    speakBreak(step[0]+'. '+step[1]);
  };
  const stopBreak=complete=>{
    if(breakTimer)clearInterval(breakTimer);
    breakTimer=null;breakPaused=false;
    const pause=document.getElementById('readerBreakPause');
    if(pause)pause.textContent='Pause';
    const status=document.getElementById('readerBreakStatus');
    if(status)status.textContent=complete?'Break complete. Return when you are ready.':'Break stopped.';
    const timer=document.querySelector('.reader-break-timer');
    if(timer&&complete)timer.textContent='Done';
  };
  const advanceBreak=()=>{
    const guide=breakGuides[breakType];
    breakIndex=(breakIndex+1)%guide.length;
    renderBreakStep();
  };
  const startBreak=()=>{
    if(breakTimer)clearInterval(breakTimer);
    breakRemaining=breakDuration;
    breakIndex=0;
    breakPaused=false;
    renderBreakStep();
    const segment=Math.max(4,Math.floor(breakDuration/breakGuides[breakType].length));
    breakTimer=setInterval(()=>{
      if(breakPaused)return;
      breakRemaining--;
      const timer=document.querySelector('.reader-break-timer');
      if(timer)timer.textContent=breakRemaining+' sec';
      if(breakRemaining<=0){stopBreak(true);return}
      if((breakDuration-breakRemaining)%segment===0)advanceBreak();
    },1000);
    const status=document.getElementById('readerBreakStatus');
    if(status)status.textContent='Break started. Pause, skip, or return whenever you want.';
  };

  bar.querySelectorAll('[data-reader-tool]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.readerTool;

    if(id==='comfort'){
      if(!openPanel(button,'Comfort','READ YOUR WAY',
        '<div class="reader-panel-grid">'+
          '<button data-tone="dark">Lights Off</button><button data-tone="light">Lights On</button>'+
          '<button data-tone="warm">Warm Paper</button><button data-tone="gray">Soft Gray</button>'+
        '</div>'+
        '<label class="reader-toggle-line"><input id="readerReduceMotion" type="checkbox"> Reduce decorative motion</label>'+
        '<label class="reader-toggle-line"><input id="readerQuiet" type="checkbox"> Quiet Everything</label>'+
        '<p class="reader-panel-note">The light/dark control at the top still works. These settings only adjust your reading experience.</p>'))return;
      panel.querySelectorAll('[data-tone]').forEach(b=>{
        const tone=root.dataset.readerTone||root.dataset.theme||'dark';
        b.classList.toggle('active',b.dataset.tone===tone);
        b.addEventListener('click',()=>{
          setTheme(b.dataset.tone);
          panel.querySelectorAll('[data-tone]').forEach(x=>x.classList.toggle('active',x===b));
        });
      });
      const reduce=panel.querySelector('#readerReduceMotion');
      reduce.checked=root.classList.contains('reader-reduced-motion');
      reduce.addEventListener('change',()=>{root.classList.toggle('reader-reduced-motion',reduce.checked);savePrefs()});
      const quiet=panel.querySelector('#readerQuiet');
      quiet.checked=root.classList.contains('reader-quiet');
      quiet.addEventListener('change',()=>{
        root.classList.toggle('reader-quiet',quiet.checked);
        if(quiet.checked){
          stopReading();stopBreak(false);
          document.querySelectorAll('audio,video').forEach(media=>{try{media.pause()}catch{}});
          document.querySelectorAll('iframe[src*="youtube.com"],iframe[src*="youtu.be"]').forEach(frame=>{
            try{frame.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),'*')}catch{}
          });
        }
        savePrefs();
      });
    }

    if(id==='text'){
      if(!openPanel(button,'Text','READING SETTINGS',
        '<div class="reader-panel-row"><button id="readerTextDown">A−</button><button id="readerTextReset">Reset</button><button id="readerTextUp">A+</button></div>'+
        '<label>Font<select id="readerFont"><option value="">LiveFit default</option><option value="georgia">Georgia</option><option value="sans">Clean sans-serif</option><option value="system">System font</option></select></label>'+
        '<label>Line spacing<select id="readerLine"><option value="1.55">Tight</option><option value="1.8">Comfortable</option><option value="2.05">Relaxed</option></select></label>'+
        '<label>Reading width<select id="readerWidth"><option value="">Default</option><option value="660px">Narrow</option><option value="800px">Medium</option><option value="960px">Wide</option></select></label>'))return;
      const getSize=()=>parseFloat(getComputedStyle(content).fontSize)||17;
      panel.querySelector('#readerTextDown').addEventListener('click',()=>{content.style.setProperty('--reader-size',Math.max(15,getSize()-1)+'px');savePrefs()});
      panel.querySelector('#readerTextUp').addEventListener('click',()=>{content.style.setProperty('--reader-size',Math.min(24,getSize()+1)+'px');savePrefs()});
      panel.querySelector('#readerTextReset').addEventListener('click',()=>{
        content.style.removeProperty('--reader-size');content.style.removeProperty('--reader-line-height');
        content.style.maxWidth='';content.style.marginInline='';delete root.dataset.readerFont;
        removeStore(prefKey);closePanel();
      });
      const font=panel.querySelector('#readerFont');font.value=root.dataset.readerFont||'';
      font.addEventListener('change',()=>{if(font.value)root.dataset.readerFont=font.value;else delete root.dataset.readerFont;savePrefs()});
      const line=panel.querySelector('#readerLine');line.value=content.style.getPropertyValue('--reader-line-height')||'1.8';
      line.addEventListener('change',()=>{content.style.setProperty('--reader-line-height',line.value);savePrefs()});
      const width=panel.querySelector('#readerWidth');width.value=content.style.maxWidth||'';
      width.addEventListener('change',()=>{content.style.maxWidth=width.value;content.style.marginInline=width.value?'auto':'';savePrefs()});
    }

    if(id==='focus'){
      if(!openPanel(button,'Focus','PARAGRAPH FOCUS',
        '<div class="reader-panel-row"><button id="readerFocusToggle">Start Focus</button><button id="readerFocusPrev">← Previous</button><button id="readerFocusNext">Next →</button></div>'+
        '<p class="reader-status" id="readerFocusStatus">Highlight one paragraph at a time. While focus is on, you can also tap any article paragraph to select it.</p>'))return;
      const toggle=panel.querySelector('#readerFocusToggle');
      const sync=()=>{
        toggle.textContent=focusOn?'Turn Focus Off':'Start Focus';
        panel.querySelector('#readerFocusStatus').textContent=focusOn?'Paragraph '+(focusIndex+1)+' of '+focusBlocks().length+'. Tap another paragraph to jump to it.':'Focus is off.';
      };
      toggle.addEventListener('click',()=>{
        if(focusOn){focusOn=false;refreshFocusClasses()}
        else{focusIndex=focusNearestIndex();focusGo(focusIndex)}
        sync();
      });
      panel.querySelector('#readerFocusPrev').addEventListener('click',()=>{if(!focusOn)focusIndex=focusNearestIndex();focusGo(focusIndex-1);sync()});
      panel.querySelector('#readerFocusNext').addEventListener('click',()=>{if(!focusOn)focusIndex=focusNearestIndex();focusGo(focusIndex+1);sync()});
      sync();
    }

    if(id==='break'){
      breakReturnY=scrollY;
      if(!openPanel(button,'Take a Break','RESET FOR A MOMENT',
        '<div class="reader-break-types">'+
          '<button class="reader-break-type active" data-break-type="breathing">'+breakIcons.breathing+'<span>Breathing</span></button>'+
          '<button class="reader-break-type" data-break-type="eyes">'+breakIcons.eyes+'<span>Eye Rest</span></button>'+
          '<button class="reader-break-type" data-break-type="movement">'+breakIcons.movement+'<span>Gentle Movement</span></button>'+
          '<button class="reader-break-type" data-break-type="guided">'+breakIcons.guided+'<span>Guided Reset</span></button>'+
        '</div>'+
        '<div class="reader-break-stage"><div class="reader-break-visual">'+breakIcons.breathing+'</div><strong>Ready</strong><small>Choose a break, choose a time, then press Start.</small><div class="reader-break-timer">Ready</div></div>'+
        '<div class="reader-panel-row"><button data-break-time="30">30 sec</button><button data-break-time="60" class="active">1 min</button><button data-break-time="120">2 min</button></div>'+
        '<label class="reader-toggle-line"><input id="readerBreakVoice" type="checkbox"> Optional spoken instructions</label>'+
        '<div class="reader-panel-row"><button id="readerBreakStart">Start</button><button id="readerBreakPause">Pause</button><button id="readerBreakSkip">Skip</button><button id="readerBreakReturn">Return to Reading</button></div>'+
        '<p class="reader-status" id="readerBreakStatus">Nothing starts automatically. Spoken instructions only begin after you press Start.</p>'))return;
      panel.querySelectorAll('[data-break-type]').forEach(b=>b.addEventListener('click',()=>{
        breakType=b.dataset.breakType;breakIndex=0;
        panel.querySelectorAll('[data-break-type]').forEach(x=>x.classList.toggle('active',x===b));
        renderBreakStep();
      }));
      panel.querySelectorAll('[data-break-time]').forEach(b=>b.addEventListener('click',()=>{
        breakDuration=Number(b.dataset.breakTime)||60;
        panel.querySelectorAll('[data-break-time]').forEach(x=>x.classList.toggle('active',x===b));
      }));
      const voice=panel.querySelector('#readerBreakVoice');
      voice.disabled=!speechOK;
      if(!speechOK)voice.parentElement.append(' (speech unavailable)');
      voice.addEventListener('change',()=>breakVoice=voice.checked);
      panel.querySelector('#readerBreakStart').addEventListener('click',startBreak);
      panel.querySelector('#readerBreakPause').addEventListener('click',e=>{
        if(!breakTimer)return;
        breakPaused=!breakPaused;
        e.currentTarget.textContent=breakPaused?'Continue':'Pause';
        panel.querySelector('#readerBreakStatus').textContent=breakPaused?'Paused.':'Continuing.';
      });
      panel.querySelector('#readerBreakSkip').addEventListener('click',()=>advanceBreak());
      panel.querySelector('#readerBreakReturn').addEventListener('click',()=>{
        stopBreak(false);closePanel();scrollTo({top:breakReturnY,behavior:scrollBehavior()});
      });
      renderBreakStep();
    }

    if(id==='journal'){
      const saved=readStore(journalKey,{note:'',quotes:[]});
      const quoteMarkup=(saved.quotes||[]).map(q=>'<div class="reader-journal-quote">“'+String(q).replace(/</g,'&lt;').replace(/>/g,'&gt;')+'”</div>').join('');
      if(!openPanel(button,'Journal','SAVE WHAT MATTERS',
        '<label>My note<textarea id="readerJournalNote" placeholder="Write a quick note about this article…"></textarea></label>'+
        '<div class="reader-panel-row"><button id="readerJournalSave">Save Note</button><button id="readerQuoteSave">Save Selected Quote</button><button id="readerSavePlace">Save My Place</button><button id="readerReturnPlace">Return to Saved Place</button><button id="readerJournalTop">Back to Top</button><button id="readerJournalDownload">Download Journal</button></div>'+
        '<div class="reader-journal-quotes" id="readerJournalQuotes">'+quoteMarkup+'</div>'+
        '<p class="reader-status" id="readerJournalStatus">'+(storageOK?'Notes and reading position stay in this browser only. They are not cloud-synced.':'Browser storage is unavailable. Notes will work for this session and can still be downloaded, but they cannot be saved permanently here.')+'</p>'))return;
      const note=panel.querySelector('#readerJournalNote');note.value=saved.note||'';
      const status=panel.querySelector('#readerJournalStatus');
      const refreshQuotes=()=>{
        const data=readStore(journalKey,{note:'',quotes:[]});
        panel.querySelector('#readerJournalQuotes').innerHTML=(data.quotes||[]).map(q=>'<div class="reader-journal-quote">“'+String(q).replace(/</g,'&lt;').replace(/>/g,'&gt;')+'”</div>').join('');
      };
      panel.querySelector('#readerJournalSave').addEventListener('click',()=>{
        const data=readStore(journalKey,{quotes:[]});data.note=note.value;
        const persisted=writeStore(journalKey,data);
        status.textContent=persisted?'✓ Note saved in this browser.':'Saved for this session only; browser storage is unavailable.';
      });
      panel.querySelector('#readerQuoteSave').addEventListener('click',()=>{
        const q=String(getSelection()?.toString()||'').trim();
        if(!q){status.textContent='Select text in the article first, then choose Save Selected Quote.';return}
        const data=readStore(journalKey,{note:'',quotes:[]});
        data.quotes=[...(data.quotes||[]),q].slice(-30);data.note=note.value;
        writeStore(journalKey,data);refreshQuotes();status.textContent='✓ Selected quotation saved.';
      });
      panel.querySelector('#readerSavePlace').addEventListener('click',()=>{
        writeStore(positionKey,String(scrollY));status.textContent='✓ Reading position saved.';
      });
      panel.querySelector('#readerReturnPlace').addEventListener('click',()=>{
        const y=Number(storageOK?localStorage.getItem(positionKey):memoryStore[positionKey]||0);
        if(y>0){closePanel();scrollTo({top:y,behavior:scrollBehavior()})}else status.textContent='No saved reading position yet.';
      });
      panel.querySelector('#readerJournalTop').addEventListener('click',()=>{closePanel();scrollTo({top:0,behavior:scrollBehavior()})});
      panel.querySelector('#readerJournalDownload').addEventListener('click',()=>{
        const data=readStore(journalKey,{note:'',quotes:[]});
        const title=document.getElementById('articleTitle')?.textContent||'LiveFit article';
        const text=[title,'','LIVEFIT READING JOURNAL','',data.note||'',...(data.quotes||[]).flatMap((q,i)=>['','Saved quotation '+(i+1)+':',q]),'','Saved locally in the browser; not cloud-synced.'].join('\n');
        const blob=new Blob([text],{type:'text/plain'});
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='livefit-'+articleId+'-journal.txt';a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
        status.textContent='Journal download started.';
      });
    }

    if(id==='listen'){
      const fallback=!speechOK?'<p class="reader-panel-note">Read aloud is not supported in this browser. Comfort, Text, Focus, Break, Journal, and Back to Top remain available.</p>':'';
      if(!openPanel(button,'Listen','READ THIS ARTICLE',
        '<label>Voice<select id="readerListenVoice" '+(!speechOK?'disabled':'')+'></select></label>'+
        '<div class="reader-panel-row"><button id="readerVoicePreview" '+(!speechOK?'disabled':'')+'>Preview Voice</button></div>'+
        '<label>Reading speed<select id="readerListenRate" '+(!speechOK?'disabled':'')+'><option value=".8">Relaxed • 0.8×</option><option value="1" selected>Normal • 1×</option><option value="1.15">Brisk • 1.15×</option><option value="1.3">Fast • 1.3×</option><option value="1.5">Very Fast • 1.5×</option></select></label>'+
        '<label class="reader-toggle-line"><input id="readerFollow" type="checkbox" checked '+(!speechOK?'disabled':'')+'> Follow the reading</label>'+
        '<div class="reader-panel-row"><button id="readerListenStart" '+(!speechOK?'disabled':'')+'>▶ Start</button><button id="readerListenCurrent" '+(!speechOK?'disabled':'')+'>▶ From Here</button><button id="readerListenPause" '+(!speechOK?'disabled':'')+'>Ⅱ Pause</button><button id="readerListenStop" '+(!speechOK?'disabled':'')+'>■ Stop</button></div>'+
        '<p class="reader-status" id="readerListenStatus">Reads the article itself — not the “On This Page” sidebar, archive, navigation, or references.</p>'+fallback))return;
      if(!speechOK)return;
      const voiceSelect=panel.querySelector('#readerListenVoice');
      const fillVoices=()=>{
        const list=voices();
        voiceSelect.innerHTML=list.length?list.map(v=>'<option value="'+v.name.replace(/"/g,'&quot;')+'">'+v.name+' • '+v.lang+'</option>').join(''):'<option value="">Default browser voice</option>';
        if(selectedVoiceName)voiceSelect.value=selectedVoiceName;
      };
      fillVoices();
      speechSynthesis.addEventListener?.('voiceschanged',fillVoices,{once:true});
      voiceSelect.addEventListener('change',()=>selectedVoiceName=voiceSelect.value);
      const rate=panel.querySelector('#readerListenRate');rate.value=String(speechRate);
      rate.addEventListener('change',()=>speechRate=Number(rate.value)||1);
      const follow=panel.querySelector('#readerFollow');follow.checked=followReading;
      follow.addEventListener('change',()=>followReading=follow.checked);
      panel.querySelector('#readerVoicePreview').addEventListener('click',previewVoice);
      panel.querySelector('#readerListenStart').addEventListener('click',()=>startReading(false));
      panel.querySelector('#readerListenCurrent').addEventListener('click',()=>startReading(true));
      panel.querySelector('#readerListenPause').addEventListener('click',e=>{
        if(!speaking)return;
        if(!speechPaused){speechSynthesis.pause();speechPaused=true;e.currentTarget.textContent='▶ Resume';updateListenStatus('Paused.')}
        else{speechSynthesis.resume();speechPaused=false;e.currentTarget.textContent='Ⅱ Pause';updateListenStatus('Reading resumed.')}
      });
      panel.querySelector('#readerListenStop').addEventListener('click',stopReading);
    }
  }));

  // Offer saved-position return once per article/session without interrupting every visit.
  let savedPosition=0;
  try{savedPosition=Number(storageOK?localStorage.getItem(positionKey):memoryStore[positionKey]||0)}catch{}
  if(savedPosition>120&&!sessionStorage.getItem('livefit-position-prompt-'+articleId)){
    sessionStorage.setItem('livefit-position-prompt-'+articleId,'1');
    setTimeout(()=>{
      if(confirm('Return to your saved place in this article?'))scrollTo({top:savedPosition,behavior:scrollBehavior()});
    },500);
  }

  addEventListener('beforeunload',()=>{
    if(breakTimer)clearInterval(breakTimer);
    if(speechOK)speechSynthesis.cancel();
  });
})();