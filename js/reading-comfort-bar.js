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

  const safeJSON=(key,fallback={})=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const prefs=safeJSON(prefKey,{});
  const savePrefs=()=>localStorage.setItem(prefKey,JSON.stringify({
    tone:root.dataset.readerTone||'',
    font:root.dataset.readerFont||'',
    size:content.style.getPropertyValue('--reader-size')||'',
    line:content.style.getPropertyValue('--reader-line-height')||'',
    width:content.style.maxWidth||'',
    reduced:root.classList.contains('reader-reduced-motion'),
    quiet:root.classList.contains('reader-quiet')
  }));

  if(prefs.tone) root.dataset.readerTone=prefs.tone;
  if(prefs.font) root.dataset.readerFont=prefs.font;
  if(prefs.size) content.style.setProperty('--reader-size',prefs.size);
  if(prefs.line) content.style.setProperty('--reader-line-height',prefs.line);
  if(prefs.width){content.style.maxWidth=prefs.width;content.style.marginInline='auto'}
  root.classList.toggle('reader-reduced-motion',!!prefs.reduced);
  root.classList.toggle('reader-quiet',!!prefs.quiet);

  const bar=document.createElement('nav');
  bar.id='livefitReadingBar';
  bar.className='livefit-reading-bar';
  bar.setAttribute('aria-label','Reading and comfort tools');
  const tools=[
    ['comfort','Comfort'],
    ['text','Text'],
    ['focus','Focus'],
    ['break','Take a Break'],
    ['journal','Journal'],
    ['listen','Listen']
  ];
  bar.innerHTML=tools.map(([id,label])=>'<button type="button" data-reader-tool="'+id+'" aria-expanded="false">'+label+'</button>').join('')+
    '<button type="button" class="reader-top-btn" id="readerBackTop" aria-label="Back to top" title="Back to top">↑</button>';
  document.body.appendChild(bar);

  const panel=document.createElement('section');
  panel.className='reader-tool-panel';
  panel.id='readerToolPanel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','false');
  panel.setAttribute('aria-label','Reading tools');
  document.body.appendChild(panel);

  const closePanel=()=>{
    panel.classList.remove('open');
    panel.innerHTML='';
    bar.querySelectorAll('[data-reader-tool]').forEach(b=>b.setAttribute('aria-expanded','false'));
  };
  const openPanel=(button,title,eyebrow,body)=>{
    const same=button.getAttribute('aria-expanded')==='true'&&panel.classList.contains('open');
    closePanel();
    if(same)return;
    button.setAttribute('aria-expanded','true');
    panel.innerHTML='<div class="reader-tool-panel-head"><div><p class="eyebrow">'+eyebrow+'</p><h3>'+title+'</h3></div><button type="button" class="reader-tool-close" aria-label="Close">×</button></div>'+body;
    panel.classList.add('open');
    panel.querySelector('.reader-tool-close')?.addEventListener('click',closePanel);
  };

  document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
  document.addEventListener('click',e=>{
    if(panel.classList.contains('open')&&!panel.contains(e.target)&&!bar.contains(e.target)) closePanel();
  });
  document.getElementById('readerBackTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:root.classList.contains('reader-reduced-motion')?'auto':'smooth'}));

  // Keep the bar above the footer instead of covering it.
  const footer=document.querySelector('footer');
  const placeBar=()=>{
    if(!footer)return;
    const r=footer.getBoundingClientRect();
    const overlap=Math.max(0,innerHeight-r.top);
    const base=innerWidth<=760?6:10;
    bar.style.bottom=(base+Math.min(overlap,footer.offsetHeight)+ 'px');
    panel.style.bottom=((innerWidth<=760?66:76)+Math.min(overlap,footer.offsetHeight))+'px';
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
      localStorage.setItem('livefit-theme','light');
    }else{
      root.dataset.theme=mode;
      localStorage.setItem('livefit-theme',mode);
    }
    savePrefs();
  };
  document.getElementById('themeToggle')?.addEventListener('click',()=>setTimeout(()=>{clearTone();savePrefs()},0));

  // Focus mode state.
  let focusOn=false;
  let focusIndex=0;
  const focusSections=()=>[...content.querySelectorAll(':scope > section')].filter(s=>!s.classList.contains('article-sources'));
  const showFocus=()=>{
    const sections=focusSections();
    if(!sections.length)return;
    focusIndex=Math.max(0,Math.min(focusIndex,sections.length-1));
    sections.forEach((s,i)=>s.classList.toggle('lf-focus-current',focusOn&&i===focusIndex));
    document.body.classList.toggle('reader-focus-active',focusOn);
    if(focusOn) sections[focusIndex].scrollIntoView({behavior:root.classList.contains('reader-reduced-motion')?'auto':'smooth',block:'center'});
  };
  const nearestFocus=()=>{
    const sections=focusSections();
    if(!sections.length)return 0;
    const marker=scrollY+innerHeight*.4;
    let found=0;
    sections.forEach((s,i)=>{if(s.offsetTop<=marker)found=i});
    return found;
  };

  // Read-aloud state. Only actual article title/deck/content are used — never the sidebar.
  let speechBlocks=[];
  let speechIndex=0;
  let speaking=false;
  let paused=false;
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
      if(el.closest('.article-side-panel,.article-sources,.roadmap-inline-cta'))return;
      const text=el.textContent.replace(/\s+/g,' ').trim();
      if(text.length>1)blocks.push({el,text});
    });
    return blocks;
  };
  const voices=()=>speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang||''));
  const clearReadingMark=()=>document.querySelectorAll('.lf-reading-current').forEach(el=>el.classList.remove('lf-reading-current'));
  const readBlock=()=>{
    if(!speaking||speechIndex>=speechBlocks.length){
      speaking=false;paused=false;clearReadingMark();
      const s=document.getElementById('readerListenStatus');if(s)s.textContent='Finished reading this article.';
      return;
    }
    const block=speechBlocks[speechIndex];
    clearReadingMark();
    block.el.classList.add('lf-reading-current');
    if(followReading)block.el.scrollIntoView({behavior:root.classList.contains('reader-reduced-motion')?'auto':'smooth',block:'center'});
    const u=new SpeechSynthesisUtterance(block.text);
    u.rate=speechRate;
    const list=voices();
    if(selectedVoiceName){
      const v=list.find(x=>x.name===selectedVoiceName);if(v)u.voice=v;
    }
    u.onend=()=>{if(speaking&&!paused){speechIndex++;readBlock()}};
    u.onerror=()=>{if(speaking&&!paused){speechIndex++;readBlock()}};
    speechSynthesis.speak(u);
    const s=document.getElementById('readerListenStatus');if(s)s.textContent='Reading '+(speechIndex+1)+' of '+speechBlocks.length+'.';
  };
  const startReading=()=>{
    speechSynthesis.cancel();clearReadingMark();
    speechBlocks=readableBlocks();
    speechIndex=0;speaking=true;paused=false;
    readBlock();
  };
  const stopReading=()=>{
    speechSynthesis.cancel();speaking=false;paused=false;speechIndex=0;clearReadingMark();
    const s=document.getElementById('readerListenStatus');if(s)s.textContent='Stopped.';
  };

  // Break timer.
  let breakTimer=null;
  let breakRemaining=0;
  const stopBreak=()=>{
    if(breakTimer)clearInterval(breakTimer);breakTimer=null;
    const orb=document.querySelector('.reader-break-orb');orb?.classList.remove('breathe-in','breathe-out');
  };
  const startBreak=(seconds,voiceCue)=>{
    stopBreak();breakRemaining=seconds;
    const orb=document.querySelector('.reader-break-orb');
    const status=document.getElementById('readerBreakStatus');
    let phase=true;
    const cue=()=>{
      if(!orb)return;
      orb.classList.toggle('breathe-in',phase);orb.classList.toggle('breathe-out',!phase);
      orb.textContent=phase?'Breathe in':'Breathe out';
      if(voiceCue&&'speechSynthesis'in window){
        const u=new SpeechSynthesisUtterance(orb.textContent);u.rate=.9;speechSynthesis.speak(u);
      }
      phase=!phase;
    };
    cue();
    if(status)status.textContent=breakRemaining+' seconds remaining.';
    breakTimer=setInterval(()=>{
      breakRemaining--;
      if(status)status.textContent=breakRemaining>0?breakRemaining+' seconds remaining.':'Break complete.';
      if(breakRemaining<=0){stopBreak();if(orb)orb.textContent='Done';return}
      if(breakRemaining%4===0)cue();
    },1000);
  };

  bar.querySelectorAll('[data-reader-tool]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.readerTool;

    if(id==='comfort'){
      openPanel(button,'Comfort','READ YOUR WAY',
        '<div class="reader-panel-grid">'+
          '<button data-tone="dark">Dark</button><button data-tone="light">Light</button>'+
          '<button data-tone="warm">Warm paper</button><button data-tone="gray">Soft gray</button>'+
        '</div>'+
        '<label class="reader-toggle-line"><input id="readerReduceMotion" type="checkbox"> Reduce motion</label>'+
        '<label class="reader-toggle-line"><input id="readerQuiet" type="checkbox"> Quiet Everything</label>'+
        '<p class="reader-panel-note">The top light/dark button still works. These controls use the same LiveFit theme setting.</p>');
      panel.querySelectorAll('[data-tone]').forEach(b=>{
        const tone=root.dataset.readerTone||root.dataset.theme||'dark';
        b.classList.toggle('active',b.dataset.tone===tone);
        b.addEventListener('click',()=>{setTheme(b.dataset.tone);panel.querySelectorAll('[data-tone]').forEach(x=>x.classList.toggle('active',x===b))});
      });
      const reduce=panel.querySelector('#readerReduceMotion');reduce.checked=root.classList.contains('reader-reduced-motion');
      reduce.addEventListener('change',()=>{root.classList.toggle('reader-reduced-motion',reduce.checked);savePrefs()});
      const quiet=panel.querySelector('#readerQuiet');quiet.checked=root.classList.contains('reader-quiet');
      quiet.addEventListener('change',()=>{root.classList.toggle('reader-quiet',quiet.checked);savePrefs()});
    }

    if(id==='text'){
      openPanel(button,'Text','READING SETTINGS',
        '<div class="reader-panel-row"><button id="readerTextDown">A−</button><button id="readerTextReset">Reset</button><button id="readerTextUp">A+</button></div>'+
        '<label>Font<select id="readerFont"><option value="">LiveFit default</option><option value="georgia">Georgia</option><option value="sans">Clean sans-serif</option></select></label>'+
        '<label>Line spacing<select id="readerLine"><option value="1.6">Compact</option><option value="1.8">Comfortable</option><option value="2">Relaxed</option></select></label>'+
        '<label>Reading width<select id="readerWidth"><option value="">Default</option><option value="680px">Narrow</option><option value="820px">Medium</option><option value="980px">Wide</option></select></label>');
      const getSize=()=>parseFloat(getComputedStyle(content).fontSize)||17;
      panel.querySelector('#readerTextDown').addEventListener('click',()=>{content.style.setProperty('--reader-size',Math.max(15,getSize()-1)+'px');savePrefs()});
      panel.querySelector('#readerTextUp').addEventListener('click',()=>{content.style.setProperty('--reader-size',Math.min(23,getSize()+1)+'px');savePrefs()});
      panel.querySelector('#readerTextReset').addEventListener('click',()=>{content.style.removeProperty('--reader-size');content.style.removeProperty('--reader-line-height');content.style.maxWidth='';content.style.marginInline='';delete root.dataset.readerFont;savePrefs();closePanel()});
      const font=panel.querySelector('#readerFont');font.value=root.dataset.readerFont||'';font.addEventListener('change',()=>{if(font.value)root.dataset.readerFont=font.value;else delete root.dataset.readerFont;savePrefs()});
      const line=panel.querySelector('#readerLine');line.value=(content.style.getPropertyValue('--reader-line-height')||'1.8');line.addEventListener('change',()=>{content.style.setProperty('--reader-line-height',line.value);savePrefs()});
      const width=panel.querySelector('#readerWidth');width.value=content.style.maxWidth||'';width.addEventListener('change',()=>{content.style.maxWidth=width.value;content.style.marginInline=width.value?'auto':'';savePrefs()});
    }

    if(id==='focus'){
      openPanel(button,'Focus','PARAGRAPH FOCUS',
        '<div class="reader-panel-row"><button id="readerFocusToggle">Start focus</button><button id="readerFocusPrev">← Previous</button><button id="readerFocusNext">Next →</button></div>'+
        '<p class="reader-status" id="readerFocusStatus">Focus dims the other article sections while keeping the selected section clear.</p>');
      const toggle=panel.querySelector('#readerFocusToggle');
      const syncFocus=()=>{toggle.textContent=focusOn?'End focus':'Start focus';panel.querySelector('#readerFocusStatus').textContent=focusOn?'Focused section '+(focusIndex+1)+' of '+focusSections().length+'.':'Focus is off.'};
      toggle.addEventListener('click',()=>{focusOn=!focusOn;if(focusOn)focusIndex=nearestFocus();showFocus();syncFocus()});
      panel.querySelector('#readerFocusPrev').addEventListener('click',()=>{focusOn=true;focusIndex--;showFocus();syncFocus()});
      panel.querySelector('#readerFocusNext').addEventListener('click',()=>{focusOn=true;focusIndex++;showFocus();syncFocus()});
      syncFocus();
    }

    if(id==='break'){
      openPanel(button,'Take a Break','RESET FOR A MOMENT',
        '<div class="reader-break-orb">Ready</div>'+
        '<div class="reader-panel-row"><button data-break="30">30 sec</button><button data-break="60">1 min</button><button id="readerBreakStop">Stop</button></div>'+
        '<label class="reader-toggle-line"><input id="readerBreakVoice" type="checkbox"> Gentle voice cues</label>'+
        '<p class="reader-status" id="readerBreakStatus">Choose a short breathing break.</p>');
      panel.querySelectorAll('[data-break]').forEach(b=>b.addEventListener('click',()=>startBreak(Number(b.dataset.break),panel.querySelector('#readerBreakVoice').checked)));
      panel.querySelector('#readerBreakStop').addEventListener('click',()=>{stopBreak();panel.querySelector('#readerBreakStatus').textContent='Break stopped.'});
    }

    if(id==='journal'){
      const saved=safeJSON(journalKey,{note:'',quotes:[]});
      openPanel(button,'Journal','SAVE WHAT MATTERS',
        '<label>My note<textarea id="readerJournalNote" placeholder="Write a quick note about this article…"></textarea></label>'+
        '<div class="reader-panel-row"><button id="readerJournalSave">Save note</button><button id="readerQuoteSave">Save selected quote</button><button id="readerSavePlace">Save my place</button><button id="readerJournalDownload">Download notes</button></div>'+
        '<p class="reader-status" id="readerJournalStatus">Notes and reading position are saved only in this browser.</p>');
      const note=panel.querySelector('#readerJournalNote');note.value=saved.note||'';
      panel.querySelector('#readerJournalSave').addEventListener('click',()=>{const data=safeJSON(journalKey,{quotes:[]});data.note=note.value;localStorage.setItem(journalKey,JSON.stringify(data));panel.querySelector('#readerJournalStatus').textContent='✓ Note saved on this device.'});
      panel.querySelector('#readerQuoteSave').addEventListener('click',()=>{const q=String(getSelection()?.toString()||'').trim();if(!q){panel.querySelector('#readerJournalStatus').textContent='Select article text first, then choose Save selected quote.';return}const data=safeJSON(journalKey,{note:'',quotes:[]});data.quotes=[...(data.quotes||[]),q].slice(-20);data.note=note.value;localStorage.setItem(journalKey,JSON.stringify(data));panel.querySelector('#readerJournalStatus').textContent='✓ Selected quote saved.'});
      panel.querySelector('#readerSavePlace').addEventListener('click',()=>{localStorage.setItem(positionKey,String(scrollY));panel.querySelector('#readerJournalStatus').textContent='✓ Reading position saved.'});
      panel.querySelector('#readerJournalDownload').addEventListener('click',()=>{const data=safeJSON(journalKey,{note:'',quotes:[]});const title=document.getElementById('articleTitle')?.textContent||'LiveFit article';const text=[title,'',data.note||'',...(data.quotes||[]).flatMap((q,i)=>['','Saved quote '+(i+1)+':',q])].join('\n');const blob=new Blob([text],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='livefit-'+articleId+'-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
    }

    if(id==='listen'){
      openPanel(button,'Listen','READ THIS ARTICLE',
        '<label>Voice<select id="readerListenVoice"></select></label>'+
        '<label>Speed<select id="readerListenRate"><option value=".8">Relaxed • 0.8×</option><option value="1" selected>Normal • 1×</option><option value="1.15">Brisk • 1.15×</option><option value="1.3">Fast • 1.3×</option><option value="1.5">Very fast • 1.5×</option></select></label>'+
        '<label class="reader-toggle-line"><input id="readerFollow" type="checkbox" checked> Follow the reading</label>'+
        '<div class="reader-panel-row"><button id="readerListenPlay">▶ Play / Restart</button><button id="readerListenPause">Ⅱ Pause</button><button id="readerListenStop">■ Stop</button></div>'+
        '<p class="reader-status" id="readerListenStatus">Reads the article itself — not the “On This Page” sidebar or archive.</p>');
      const voiceSelect=panel.querySelector('#readerListenVoice');
      const fillVoices=()=>{const list=voices();voiceSelect.innerHTML=list.length?list.map(v=>'<option value="'+v.name.replace(/"/g,'&quot;')+'">'+v.name+' • '+v.lang+'</option>').join(''):'<option value="">Default browser voice</option>';if(selectedVoiceName)voiceSelect.value=selectedVoiceName};
      fillVoices();
      speechSynthesis.addEventListener?.('voiceschanged',fillVoices,{once:true});
      voiceSelect.addEventListener('change',()=>selectedVoiceName=voiceSelect.value);
      const rate=panel.querySelector('#readerListenRate');rate.value=String(speechRate);rate.addEventListener('change',()=>speechRate=Number(rate.value)||1);
      const follow=panel.querySelector('#readerFollow');follow.checked=followReading;follow.addEventListener('change',()=>followReading=follow.checked);
      panel.querySelector('#readerListenPlay').addEventListener('click',startReading);
      panel.querySelector('#readerListenPause').addEventListener('click',e=>{
        if(!speaking)return;
        if(!paused){speechSynthesis.pause();paused=true;e.currentTarget.textContent='▶ Resume';panel.querySelector('#readerListenStatus').textContent='Paused.'}
        else{speechSynthesis.resume();paused=false;e.currentTarget.textContent='Ⅱ Pause';panel.querySelector('#readerListenStatus').textContent='Reading resumed.'}
      });
      panel.querySelector('#readerListenStop').addEventListener('click',stopReading);
    }
  }));

  const savedPosition=Number(localStorage.getItem(positionKey)||0);
  if(savedPosition>120&&!sessionStorage.getItem('livefit-position-prompt-'+articleId)){
    sessionStorage.setItem('livefit-position-prompt-'+articleId,'1');
    setTimeout(()=>{
      const resume=confirm('Return to your saved place in this article?');
      if(resume)scrollTo({top:savedPosition,behavior:root.classList.contains('reader-reduced-motion')?'auto':'smooth'});
    },500);
  }

  addEventListener('beforeunload',()=>{stopBreak();speechSynthesis.cancel()});
})();