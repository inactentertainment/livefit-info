const root=document.documentElement;
const themeToggle=document.getElementById('themeToggle');
const savedTheme=localStorage.getItem('livefit-theme');
if(savedTheme) root.dataset.theme=savedTheme;
themeToggle.addEventListener('click',()=>{
  const next=root.dataset.theme==='dark'?'light':'dark';
  root.dataset.theme=next;
  localStorage.setItem('livefit-theme',next);
});

const menuButton=document.getElementById('menuButton');
const mobileNav=document.getElementById('mobileNav');
menuButton.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(open));
});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
}));

const musicToggle=document.getElementById('musicToggle');
const musicPanel=document.getElementById('musicPanel');
musicToggle.addEventListener('click',()=>{musicPanel.hidden=!musicPanel.hidden;});
document.addEventListener('click',e=>{
  if(!musicPanel.hidden && !musicPanel.contains(e.target) && !musicToggle.contains(e.target)) musicPanel.hidden=true;
});

document.querySelectorAll('.body-card').forEach(card=>card.addEventListener('click',()=>{
  document.querySelectorAll('.body-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');
}));

const modal=document.getElementById('planModal');
const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')};
const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
document.getElementById('startPlan').addEventListener('click',openModal);
document.getElementById('closePlan').addEventListener('click',closeModal);
document.getElementById('modalTools').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

setTimeout(()=>{
  if(!sessionStorage.getItem('livefit-plan-seen')){
    openModal();
    sessionStorage.setItem('livefit-plan-seen','1');
  }
},9000);