/* Mobile layer: phones (up to 767px wide) get their own layout values; laptops and desktops keep the originals.
   The CSS half is css/mobile.css (loaded only on phones). Other scripts ask MOBILE.on() and use these values. */
window.MOBILE=(function(){
  var mq=matchMedia('(max-width: 767px)'),root=document.documentElement;
  function on(){return mq.matches}
  function mark(){root.classList.toggle('is-mobile',on())}
  mark();
  // switching between phone and desktop sizes (rotating a tablet, resizing a window): re-run every layout
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(){mark();dispatchEvent(new Event('resize'))});
  return {
    on:on,
    // first page: Hawa Mahal's width on a phone - about a third smaller than before, so more of the building shows
    hawaW:function(W,H){return Math.max(W*1.4,H*.82)}
  };
})();
