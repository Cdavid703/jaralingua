/* Inline glossary for The First Visit. Definitions are shown without playing audio. */
(() => {
  'use strict';
  window.FirstVisitVocabulary = function(entries, pronounce) {
    const byTerm = new Map(entries.map(entry => [entry.term.toLowerCase(), entry]));
    const escaped = [...byTerm.keys()].sort((a,b) => b.length-a.length).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp("(^|[^a-zA-Z'’])(" + escaped.join('|') + ")(?=$|[^a-zA-Z'’])", 'gi');
    const tooltip = document.createElement('div');
    tooltip.id = 'fvVocabularyTooltip'; tooltip.className = 'fv-vocab-tooltip';
    tooltip.setAttribute('role', 'tooltip'); tooltip.lang = 'es'; tooltip.hidden = true;
    let active = null, playing = null, hideTimer;
    function hide() {
      clearTimeout(hideTimer);
      active?.removeAttribute('aria-describedby'); active = null; tooltip.hidden = true;
    }
    function position() {
      if (!active || tooltip.hidden) return;
      const anchor = active.getBoundingClientRect(), tip = tooltip.getBoundingClientRect();
      const left = Math.max(12, Math.min(innerWidth-tip.width-12, anchor.left+(anchor.width-tip.width)/2));
      const above = anchor.top-tip.height-10;
      const top = above>=12 ? above : Math.min(innerHeight-tip.height-12, anchor.bottom+10);
      tooltip.style.left = left+'px'; tooltip.style.top = Math.max(12,top)+'px';
    }
    function show(button, entry) {
      clearTimeout(hideTimer); active?.removeAttribute('aria-describedby'); active = button;
      // A dialog is in the browser's top layer; its tooltip must be in that dialog too.
      const host = button.closest('dialog') || document.body;
      if (tooltip.parentElement !== host) host.append(tooltip);
      tooltip.textContent = entry.spanish; tooltip.hidden = false;
      button.setAttribute('aria-describedby', tooltip.id); position();
    }
    function leave() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!tooltip.matches(':hover') && active !== document.activeElement) hide();
      }, 120);
    }
    tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
    tooltip.addEventListener('pointerleave', leave);
    document.addEventListener('pointerdown', event => {
      if (!event.target.closest('.fv-vocab-word, .fv-vocab-tooltip')) hide();
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key==='Escape' && !tooltip.hidden) {
        hide(); event.preventDefault(); event.stopPropagation();
      }
    }, true);
    document.addEventListener('scroll', () => {
      if (!active) return;
      const bounds = active.getBoundingClientRect();
      if (!active.isConnected || bounds.bottom < 0 || bounds.top > innerHeight) hide();
      else position();
    }, true);
    window.addEventListener('resize', hide);
    function setPlaying(button) {
      playing?.classList.remove('is-playing'); playing?.setAttribute('aria-pressed','false');
      playing = button;
      playing?.classList.add('is-playing'); playing?.setAttribute('aria-pressed','true');
    }
    function render(container, text) {
      container.replaceChildren();
      let cursor = 0;
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const start = match.index+match[1].length, term = match[2], entry = byTerm.get(term.toLowerCase());
        container.append(document.createTextNode(text.slice(cursor,start)));
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'fv-vocab-word'; button.textContent = term;
        button.dataset.vocabulary = entry.term.toLowerCase();
        button.setAttribute('aria-label',term+'. Listen to pronunciation'); button.setAttribute('aria-pressed','false');
        button.addEventListener('pointerenter', event => {if(event.pointerType!=='touch') show(button,entry);});
        button.addEventListener('pointerleave', event => {if(event.pointerType!=='touch') leave();});
        button.addEventListener('focus', () => show(button,entry));
        button.addEventListener('blur', leave);
        button.addEventListener('click', () => {show(button,entry); pronounce(entry,button);});
        container.append(button); cursor = start+term.length;
      }
      container.append(document.createTextNode(text.slice(cursor)));
    }
    return {render, hide, setPlaying};
  };
})();
