(function(){
  'use strict';
  function install(){
    if(document.querySelector('.collection-preview'))return;
    var style=document.createElement('style');
    style.textContent='.collection-grid img{cursor:zoom-in}.collection-preview{position:fixed;inset:0;z-index:2147483647!important;background:#202331cc;display:grid;place-items:center;padding:24px}.collection-preview img{position:relative;z-index:1;width:min(72vw,420px);height:min(72vw,420px);object-fit:contain;filter:drop-shadow(0 14px 18px #0008)}.collection-preview button{position:absolute;top:20px;right:24px;width:44px;height:44px;border:0;border-radius:50%;background:#fff;color:#596172;font-size:26px;cursor:pointer}';
    document.head.appendChild(style);
    document.addEventListener('click',function(event){
      var image=event.target.closest('.collection-grid img');
      if(!image)return;
      event.preventDefault();
      var overlay=document.createElement('div');
      overlay.className='collection-preview';
      overlay.innerHTML='<button type="button" aria-label="Close preview">×</button><img src="'+image.src+'" alt="'+image.alt+'">';
      overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.tagName==='BUTTON')overlay.remove()});
      document.body.appendChild(overlay);
    });
    document.addEventListener('contextmenu',function(event){
      if(event.target.closest('.cat, .cat img')) event.preventDefault();
    });
    document.addEventListener('dblclick',function(event){
      if(event.target.closest('.cat, .cat img')) event.preventDefault();
    },{passive:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}());
