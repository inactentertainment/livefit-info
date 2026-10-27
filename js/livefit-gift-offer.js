/* LiveFit Phase 2: dormant gift-offer framework.
   NEVER enable until an actual approved downloadable file and tested submission delivery exist.
   This module intentionally does nothing with the default configuration.
   The $7 roadmap, payment, assessment and existing popup are not modified. */
(() => {
  'use strict';
  const config = Object.freeze({
    enabled: false,
    approvedGiftTitle: '',
    approvedDownloadUrl: '',
    verifiedSubmissionEndpoint: '',
    recipientEmail: 'livefitinformation@gmail.com',
    minActiveMs: 25000,
    minDismissGapMs: 60000
  });
  if (!config.enabled || !config.approvedGiftTitle || !config.approvedDownloadUrl ||
      !config.verifiedSubmissionEndpoint) return;
  if (!document.body || !document.getElementById('planModal')) return;
  if (sessionStorage.getItem('livefit-gift-dismissed') === '1') return;

  // Home page only; never on the assessment, checkout, payment return, or report.
  const style = document.createElement('style');
  style.textContent = `
    .lf-gift-layer{position:fixed;inset:0;z-index:10010;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:18px}
    .lf-gift-box{background:#151515;color:#f8f5f1;border:1px solid #b95c28;border-radius:18px;max-width:470px;width:100%;padding:30px;box-shadow:0 24px 90px #000b;font-family:Georgia,serif;position:relative}
    .lf-gift-box h2{margin:8px 0 12px;font-size:clamp(24px,5vw,34px);line-height:1.15;color:#f0a56b}
    .lf-gift-box p{line-height:1.5}
    .lf-gift-box label{display:block;margin:16px 0 4px}
    .lf-gift-box input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #b7a79e;border-radius:7px;background:#fff;color:#161616;font:inherit}
    .lf-gift-box button[type=submit],.lf-gift-download{display:inline-block;margin-top:18px;border:0;border-radius:8px;background:#b85c27;color:white;padding:12px 20px;font:700 16px Georgia,serif;cursor:pointer}
    .lf-gift-close{position:absolute;right:12px;top:10px;border:0;background:transparent;color:white;font-size:28px;cursor:pointer}
    .lf-gift-status{min-height:1.4em}
    .lf-gift-box a{color:#ffbd87}
    @media(max-width:480px){.lf-gift-box{padding:20px;max-height:90vh;overflow:auto}}
  `;
  document.head.append(style);
  let activeMs = 0, lastTick = Date.now(), lastInteraction = Date.now(), shown = false;
  const noteInteraction = () => { lastInteraction = Date.now(); };
  ['pointerdown','keydown','scroll','touchstart'].forEach(type =>
    document.addEventListener(type,noteInteraction,{passive:true}));
  function canShow() {
    if (document.visibilityState !== 'visible') return false;
    if (document.querySelector('.plan-modal.open, [aria-modal="true"], dialog[open], .lf-gift-layer')) return false;
    const lastDismiss = Number(sessionStorage.getItem('livefit-last-offer-dismissed')||0);
    return !lastDismiss || Date.now()-lastDismiss >= config.minDismissGapMs;
  }
  function close(layer) {
    layer.remove();
    shown = true;
    sessionStorage.setItem('livefit-gift-dismissed','1');
    sessionStorage.setItem('livefit-last-offer-dismissed',String(Date.now()));
  }
  function show() {
    if (shown || !canShow()) return;
    shown = true;
    const layer=document.createElement('div');
    layer.className='lf-gift-layer';
    layer.innerHTML=`<section class="lf-gift-box" role="dialog" aria-modal="true" aria-labelledby="lf-gift-heading">
      <button type="button" class="lf-gift-close" aria-label="Dismiss free gift">&times;</button>
      <p style="color:#f0a56b;letter-spacing:.12em">A LITTLE SOMETHING FOR YOUR FITNESS JOURNEY</p>
      <h2 id="lf-gift-heading"></h2>
      <p>Request your free LiveFit download. No magazine or marketing signup is included.</p>
      <form><label for="lf-gift-name">Name</label><input id="lf-gift-name" name="name" required autocomplete="name" maxlength="120">
      <label for="lf-gift-email">Email</label><input id="lf-gift-email" name="email" type="email" required autocomplete="email" maxlength="254">
      <button type="submit">Request My Free Download</button><p class="lf-gift-status" role="status" aria-live="polite"></p></form>
      <div class="lf-gift-ready" hidden></div></section>`;
    layer.querySelector('h2').textContent=config.approvedGiftTitle;
    document.body.append(layer);
    const form=layer.querySelector('form'), status=layer.querySelector('.lf-gift-status'), submit=form.querySelector('button');
    layer.querySelector('.lf-gift-close').addEventListener('click',()=>close(layer));
    layer.addEventListener('click',event=>{if(event.target===layer)close(layer);});
    document.addEventListener('keydown',function onEscape(event) {
      if(event.key==='Escape' && layer.isConnected){close(layer);document.removeEventListener('keydown',onEscape);}
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      submit.disabled=true;
      status.textContent='Sending your request…';
      try {
        // Endpoint must be approved and tested before this module is enabled.
        const response=await fetch(config.verifiedSubmissionEndpoint,{
          method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify({
            name:form.elements.name.value.trim(),
            email:form.elements.email.value.trim(),
            offer_type:'livefit_free_gift_request',
            marketing_consent:'no',
            _subject:'LiveFit Free Gift Request'
          })
        });
        const data=await response.json();
        if(!response.ok || !(data.success===true || data.success==='true'))
          throw new Error('Request was not accepted');
        form.hidden=true;
        const ready=layer.querySelector('.lf-gift-ready');
        const link=document.createElement('a');
        link.className='lf-gift-download';
        link.href=config.approvedDownloadUrl;
        link.rel='noopener noreferrer';
        link.textContent='Open My Free Download';
        ready.textContent='Your request was accepted. ';
        ready.append(link);
        ready.hidden=false;
      } catch {
        status.textContent='We could not accept your request. Please try again. Your entries have been kept.';
        submit.disabled=false;
      }
    });
    layer.querySelector('#lf-gift-name').focus();
  }
  window.setInterval(()=>{
    const now=Date.now(), elapsed=Math.min(1000,now-lastTick);
    lastTick=now;
    if (document.visibilityState==='visible' && now-lastInteraction<30000) activeMs+=elapsed;
    if(activeMs>=config.minActiveMs && !shown) show();
  },1000);
})();
