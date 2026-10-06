(() => {
  const root=document.documentElement;

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
    (closePlan||modal.querySelector('a,button'))?.focus();
  };
  const closeModal=()=>{
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
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

  // Add a compact legal/data footer to tool and funnel pages that do not already have a footer.
  if(!document.querySelector('footer')&&!document.body.classList.contains('report-page')){
    const prefix=location.pathname.includes('/tools/')?'../':'';
    const footer=document.createElement('footer');
    footer.className='compact-legal-footer';
    footer.innerHTML=
      '<div class="footer-brand"><span class="brand-live">LIVE FIT</span><span class="brand-info">.info</span></div>'+
      '<div class="footer-links">'+
      '<a href="'+prefix+'privacy.html">Privacy</a>'+
      '<a href="'+prefix+'terms.html">Terms</a>'+
      '<a href="'+prefix+'disclaimer.html">Disclaimer</a>'+
      '<a href="'+prefix+'affiliate.html">Affiliate Disclosure</a>'+
      '<a href="'+prefix+'refund.html">Refund Policy</a>'+
      '<a href="'+prefix+'contact.html">Contact</a>'+
      '</div>'+
      '<button class="data-reset-button" type="button">Reset My LiveFit Data</button>'+
      '<p class="umbrella">LiveFit.info is a project of InAct Entertainment LLC.</p>';
    document.body.appendChild(footer);
  }

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
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(()=>{window.location.href=href},330);
  }));
})();