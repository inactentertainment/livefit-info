/* LiveFit Phase 3 — magazine signup and offer coordination.
 * Intentionally dormant until publication name, approved cover and tested
 * submission endpoint are supplied. No checkout/report/assessment modifications.
 */
(() => {
  'use strict';
  const settings = Object.freeze({
    magazineEnabled: false,
    publicationName: '',
    coverImageUrl: '',
    verifiedSubmissionEndpoint: '',
    recipientEmail: 'livefitinformation@gmail.com',
    magazineActiveMs: 120000,
    dismissalGapMs: 60000
  });
  if (!document.getElementById('planModal')) return; // homepage only

  const STORE = 'livefit-offer-last-dismissed';
  const PLAN = document.getElementById('planModal');
  const recordDismissal = () => sessionStorage.setItem(STORE, String(Date.now()));
  const isBlocking = () =>
    PLAN.classList.contains('open') ||
    !!document.querySelector('.lf-gift-layer, .lf-magazine-overlay, [aria-modal="true"]:not(#planModal)');
  const allowedBySpacing = () =>
    Date.now() - Number(sessionStorage.getItem(STORE) || 0) >= settings.dismissalGapMs;

  // Observe the EXISTING assessment invitation rather than changing its code.
  let wasOpen = PLAN.classList.contains('open');
  new MutationObserver(() => {
    const nowOpen = PLAN.classList.contains('open');
    if (wasOpen && !nowOpen) recordDismissal();
    wasOpen = nowOpen;
  }).observe(PLAN, { attributes: true, attributeFilter: ['class'] });

  // Never activate the magazine before the name, genuine cover, and delivery exist.
  if (!settings.magazineEnabled || !settings.publicationName ||
      !settings.coverImageUrl || !settings.verifiedSubmissionEndpoint) return;
  if (sessionStorage.getItem('livefit-magazine-dismissed')) return;

  const css = document.createElement('style');
  css.textContent = `
    .lf-magazine-overlay{position:fixed;inset:0;z-index:10020;background:#000c;display:grid;place-items:center;padding:16px}
    .lf-magazine-card{width:min(720px,100%);max-height:92vh;overflow:auto;background:#151515;color:#f7f1eb;border:1px solid #bf6b39;border-radius:18px;padding:26px;box-shadow:0 24px 80px #000c;position:relative;font-family:Georgia,serif;display:grid;grid-template-columns:minmax(140px,230px) 1fr;gap:25px}
    .lf-magazine-card img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:5px;box-shadow:8px 11px 24px #0009}
    .lf-magazine-card h2{font-size:clamp(24px,4vw,34px);margin:8px 0;color:#f1a56e}
    .lf-magazine-card label{display:block;margin:12px 0 5px}
    .lf-magazine-card input[type=text],.lf-magazine-card input[type=email]{width:100%;box-sizing:border-box;padding:10px;border-radius:7px;border:1px solid #9f928a;background:#fff;color:#222}
    .lf-magazine-card button[type=submit]{background:#b75c29;border:0;color:#fff;border-radius:8px;padding:12px 18px;margin-top:14px;font:700 16px Georgia,serif}
    .lf-magazine-close{position:absolute;top:8px;right:12px;background:transparent;border:0;color:#fff;font-size:29px;cursor:pointer}
    .lf-magazine-consent{display:flex!important;align-items:start;gap:8px;line-height:1.45;font-size:13px}
    .lf-magazine-consent input{margin-top:4px}
    @media(max-width:560px){.lf-magazine-card{grid-template-columns:1fr;padding:20px}.lf-magazine-card img{max-width:155px;aspect-ratio:3/4}}
  `;
  document.head.append(css);

  let activeMs = 0, lastTick = Date.now(), lastActivity = Date.now(), shown = false;
  ['pointerdown','keydown','scroll','touchstart'].forEach(type =>
    document.addEventListener(type, () => { lastActivity = Date.now(); }, {passive:true}));
  function close(layer) {
    layer.remove();
    sessionStorage.setItem('livefit-magazine-dismissed', '1');
    recordDismissal();
  }
  function show() {
    if (shown || isBlocking() || !allowedBySpacing()) return;
    shown = true;
    const layer = document.createElement('div');
    layer.className = 'lf-magazine-overlay';
    const article = document.createElement('section');
    article.className = 'lf-magazine-card';
    article.setAttribute('role','dialog');
    article.setAttribute('aria-modal','true');
    article.setAttribute('aria-labelledby','lf-magazine-heading');
    article.innerHTML = `
      <button class="lf-magazine-close" type="button" aria-label="Close magazine invitation">&times;</button>
      <img class="lf-magazine-cover" alt="Live Fit seasonal magazine cover" />
      <div><p style="color:#f1a56e;letter-spacing:.1em">SEASONAL WELLNESS READING</p>
      <h2 id="lf-magazine-heading"></h2>
      <p>Get seasonal fitness, movement, and wellness inspiration by email.</p>
      <form><label for="lf-magazine-name">Name</label><input id="lf-magazine-name" name="name" type="text" autocomplete="name" maxlength="120" required>
      <label for="lf-magazine-email">Email</label><input id="lf-magazine-email" name="email" type="email" autocomplete="email" maxlength="254" required>
      <label class="lf-magazine-consent"><input name="consent" type="checkbox" required>
      <span>Yes, email me seasonal Live Fit magazine issues. I can unsubscribe at any time.</span></label>\n      <label class="lf-magazine-consent"><input name="promotions" type="checkbox">\n      <span>Optional: I also agree to occasional Live Fit promotional emails.</span></label>
      <button type="submit">Sign Me Up</button>
      <p class="lf-magazine-status" role="status" aria-live="polite"></p></form></div>`;
    article.querySelector('h2').textContent = settings.publicationName;
    article.querySelector('img').src = settings.coverImageUrl;
    layer.append(article);
    document.body.append(layer);
    const closeButton = article.querySelector('.lf-magazine-close');
    closeButton.addEventListener('click', () => close(layer));
    layer.addEventListener('click', e => {if(e.target===layer)close(layer);});
    document.addEventListener('keydown', function escapeListener(e){
      if (e.key==='Escape' && layer.isConnected){close(layer);document.removeEventListener('keydown',escapeListener);}
    });
    const form=article.querySelector('form'), button=form.querySelector('[type=submit]');
    const status=article.querySelector('.lf-magazine-status');
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!form.reportValidity()) return;
      button.disabled=true;
      status.textContent='Submitting your request…';
      try {
        const res=await fetch(settings.verifiedSubmissionEndpoint,{
          method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify({
            offer_type:'livefit_seasonal_magazine',
            publication:settings.publicationName,
            name:form.elements.name.value.trim(),
            email:form.elements.email.value.trim(),
            magazine_consent:true,
            occasional_promotions_consent:form.elements.promotions.checked,
            consent_text:'Yes, email me seasonal Live Fit magazine issues. I can unsubscribe at any time.',
            consent_timestamp:new Date().toISOString(),
            _subject:'LiveFit Seasonal Magazine Signup'
          })
        });
        const data=await res.json();
        if(!res.ok || !(data.success===true || data.success==='true')) throw Error('Not accepted');
        form.replaceChildren();
        status.textContent='You are subscribed. Thank you!';
        form.append(status);
        sessionStorage.setItem('livefit-magazine-dismissed','1');
      }catch{
        status.textContent='Your signup could not be accepted. Please try again; your entries have been retained.';
        button.disabled=false;
      }
    });
    closeButton.focus();
  }
  window.setInterval(()=>{
    const now=Date.now();
    const delta=Math.max(0,Math.min(1000,now-lastTick));
    lastTick=now;
    if(document.visibilityState==='visible' && now-lastActivity<30000 && !isBlocking()) activeMs+=delta;
    if(activeMs>=settings.magazineActiveMs && !shown) show();
  },1000);
})();
