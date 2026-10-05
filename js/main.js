const root=document.documentElement;
const themeToggle=document.getElementById('themeToggle');
const savedTheme=localStorage.getItem('livefit-theme');
if(savedTheme) root.dataset.theme=savedTheme;
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
const openModal=()=>{if(modal){modal.classList.add('open');modal.setAttribute('aria-hidden','false')}};
const closeModal=()=>{if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}};
if(closePlan) closePlan.addEventListener('click',closeModal);
if(modalTools) modalTools.addEventListener('click',closeModal);
if(modal) modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

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

document.querySelectorAll('a.page-link').forEach(link=>link.addEventListener('click',e=>{
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
  const href=link.getAttribute('href');
  if(!href||href.startsWith('#')||href.startsWith('http')) return;
  e.preventDefault();
  document.body.classList.add('page-leaving');
  setTimeout(()=>{window.location.href=href},330);
}));