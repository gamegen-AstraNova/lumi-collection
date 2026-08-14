(function(){
  'use strict';

  var actions=[
    ['open-box','OPEN BOX','openBox'],
    ['auto-merge','AUTO MERGE','toggleAuto'],
    ['speed-up','SPEED UP','speedUp'],
    ['decorate','DECORATE','decorate'],
    ['shop','SHOP','shop']
  ];
  var audio;
  var preview=null;
  var konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiIndex=0;
  window.__lumiSoundEnabled=true;

  function installTouchKonamiPad(feedKey){
    var code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var media=window.matchMedia('(max-width: 900px), (pointer: coarse)');
    var timer=0,pointer=-1,startX=0,startY=0,consumed=false;
    function cancel(){window.clearTimeout(timer);timer=0}
    function open(){
      if(!media.matches||document.querySelector('.touch-konami-pad'))return;
      consumed=true;
      var progress=0,overlay=document.createElement('div');
      overlay.className='touch-konami-pad';
      overlay.innerHTML=`<section class="touch-konami-panel" role="dialog" aria-modal="true" aria-label="Secret code input"><button type="button" class="touch-konami-close" aria-label="Close">×</button><div class="touch-konami-title">SECRET INPUT</div><div class="touch-konami-progress" aria-hidden="true">${code.map(function(){return'<i></i>'}).join('')}</div><div class="touch-konami-controls"><div class="touch-konami-dpad"><button type="button" class="touch-konami-key touch-konami-up" data-konami-key="ArrowUp" aria-label="Up">↑</button><button type="button" class="touch-konami-key touch-konami-left" data-konami-key="ArrowLeft" aria-label="Left">←</button><button type="button" class="touch-konami-key touch-konami-down" data-konami-key="ArrowDown" aria-label="Down">↓</button><button type="button" class="touch-konami-key touch-konami-right" data-konami-key="ArrowRight" aria-label="Right">→</button></div><div class="touch-konami-ab"><button type="button" class="touch-konami-key" data-konami-key="b">B</button><button type="button" class="touch-konami-key" data-konami-key="a">A</button></div></div></section>`;
      function close(){overlay.remove()}
      overlay.addEventListener('click',function(event){
        if(event.target===overlay||event.target.closest('.touch-konami-close')){close();return}
        var button=event.target.closest('[data-konami-key]');if(!button)return;
        var key=button.dataset.konamiKey;feedKey(key);
        progress=key===code[progress]?progress+1:key===code[0]?1:0;
        overlay.querySelectorAll('.touch-konami-progress i').forEach(function(dot,index){dot.classList.toggle('on',index<progress)});
        if(progress===code.length)window.setTimeout(close,420);
      });
      document.body.appendChild(overlay);
    }
    document.addEventListener('pointerdown',function(event){if(!media.matches||event.clientX>72||event.clientY>72)return;pointer=event.pointerId;startX=event.clientX;startY=event.clientY;consumed=false;cancel();timer=window.setTimeout(open,1200)},true);
    document.addEventListener('pointermove',function(event){if(event.pointerId===pointer&&Math.hypot(event.clientX-startX,event.clientY-startY)>14)cancel()},true);
    ['pointerup','pointercancel'].forEach(function(type){document.addEventListener(type,function(event){if(event.pointerId!==pointer)return;cancel();pointer=-1;if(consumed){event.preventDefault();event.stopPropagation()}},true)});
    document.addEventListener('contextmenu',function(event){if(media.matches&&event.clientX<=72&&event.clientY<=72)event.preventDefault()},true);
  }

  function uiSound(){
    if(window.__lumiSoundEnabled===false)return;
    try{
      audio=audio||new AudioContext();
      if(audio.state==='suspended')audio.resume();
      var oscillator=audio.createOscillator(),gain=audio.createGain();
      oscillator.type='sine';
      oscillator.frequency.value=620;
      gain.gain.setValueAtTime(.45,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime+.12);
    }catch(_){ }
  }

  function trackKonamiKey(key){
    if(key!==konami[konamiIndex]){konamiIndex=key===konami[0]?1:0;return}
    konamiIndex++;
    if(konamiIndex!==konami.length)return;
    konamiIndex=0;
    var coins=Number(localStorage.getItem('lumi-coins')||0)+1000;
    localStorage.setItem('lumi-coins',String(coins));
    window.dispatchEvent(new CustomEvent('lumi-coins-changed',{detail:coins}));
    uiSound();
  }

  function listenForKonami(event){trackKonamiKey(event.key.length===1?event.key.toLowerCase():event.key)}

  function callAction(name){
    var gameActions=window.__lumiGameActions;
    if(gameActions&&typeof gameActions[name]==='function')gameActions[name]();
    else window.dispatchEvent(new CustomEvent('lumi-action-'+name));
  }

  function closePreview(){if(preview){preview.remove();preview=null}}

  function openPreview(image){
    closePreview();
    preview=document.createElement('div');
    preview.className='collection-preview-overlay';
    preview.setAttribute('role','dialog');
    preview.setAttribute('aria-modal','true');
    var close=document.createElement('button');
    close.type='button';
    close.className='collection-preview-close';
    close.setAttribute('aria-label','Close preview');
    close.textContent='×';
    var enlarged=document.createElement('img');
    enlarged.className='collection-preview-image';
    enlarged.src=image.currentSrc||image.src;
    enlarged.alt=image.alt||'';
    preview.append(close,enlarged);
    document.body.appendChild(preview);
    close.focus();
  }

  function collectionModal(){
    var old=document.querySelector('.collection-modal');
    if(old){old.remove();return}
    var owned=[];
    try{owned=JSON.parse(localStorage.getItem('lumi-collection')||'[1]')}catch(_){owned=[1]}
    var modal=document.createElement('div');
    modal.className='collection-modal';
    var cards='';
    for(var i=1;i<=10;i++){
      var unlocked=owned.indexOf(i)>=0;
      cards+='<div class="collection-card '+(unlocked?'unlocked':'locked')+'"><span>'+(unlocked?'<img src="./assets/lumi/level-'+i+'.png" alt="Level '+i+'">':'?')+'</span><small>Lv.'+i+'</small></div>';
    }
    modal.innerHTML='<section class="collection-dialog"><button class="collection-close" type="button" aria-label="Close">×</button><div class="collection-dialog-title"><span>COLLECTION</span><b>'+owned.length+'/10</b></div><div class="collection-dialog-grid">'+cards+'</div></section>';
    modal.addEventListener('click',function(event){
      if(event.target===modal||event.target.closest('.collection-close'))modal.remove();
    });
    document.body.appendChild(modal);
  }

  function syncShopWallet(){
    var wallet=document.querySelector('.furniture-modal .shop-wallet');
    if(!wallet)return;
    var source=document.querySelector('.wallet strong');
    var value=wallet.querySelector('strong');
    if(source&&value)value.textContent=source.textContent;
  }

  function install(){
    var room=document.querySelector('.room');
    if(!room){setTimeout(install,100);return}
    if(room.querySelector('.clean-actions'))return;
    var bar=document.createElement('div');
    bar.className='clean-actions';
    actions.forEach(function(item){
      var button=document.createElement('button');
      button.type='button';
      button.className='clean-action clean-'+item[0];
      button.innerHTML='<img src="./assets/ui/'+item[0]+'.png" alt=""><span>'+item[1]+'</span>';
      button.addEventListener('click',function(){uiSound();callAction(item[2])});
      bar.appendChild(button);
    });
    room.appendChild(bar);
    var topbar=document.querySelector('.topbar');
    if(topbar&&topbar.parentElement!==room)room.appendChild(topbar);
    if(topbar&&!topbar.querySelector('.collection-button')){
      var book=document.createElement('button');
      book.type='button';
      book.className='icon-btn collection-button';
      book.textContent=String.fromCodePoint(0x1F4D6);
      book.title='Collection';
      book.setAttribute('aria-label','Collection');
      book.addEventListener('click',function(){uiSound();collectionModal()});
      topbar.insertBefore(book,topbar.querySelector('.wallet'));
    }
    bar.querySelector('.clean-auto-merge').classList.toggle('active',localStorage.getItem('lumi-auto')==='1');
    window.addEventListener('lumi-auto-changed',function(event){bar.querySelector('.clean-auto-merge').classList.toggle('active',!!event.detail)});
    window.addEventListener('lumi-coins-changed',syncShopWallet);
    document.addEventListener('click',function(event){
      if(preview){
        if(event.target===preview||event.target.closest('.collection-preview-close')){
          closePreview();
          return;
        }
        return;
      }
      var image=event.target.closest('.collection-card.unlocked img');
      if(image&&!preview){event.preventDefault();event.stopPropagation();openPreview(image)}
      syncShopWallet();
    },true);
    document.addEventListener('keydown',function(event){if(event.key==='Escape')closePreview()});
    document.addEventListener('contextmenu',function(event){if(event.target.closest('.cat,.cat img'))event.preventDefault()});
    document.addEventListener('dblclick',function(event){if(event.target.closest('.cat,.cat img'))event.preventDefault()},{passive:false});
    document.addEventListener('pointerdown',function(event){
      if(event.target.closest('button')&&!event.target.closest('.cat'))uiSound();
      if(event.target.closest('.room')&&!event.target.closest('.cat,.placed-furniture,button,.furniture-size-control')){
        var gameActions=window.__lumiGameActions;
        if(gameActions&&typeof gameActions.clearSelection==='function')gameActions.clearSelection();
      }
    },{capture:true});
  }

  document.addEventListener('keydown',listenForKonami);
  installTouchKonamiPad(trackKonamiKey);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}());
