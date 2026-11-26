// ================= Scroll animation system =================
var prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Split heading words into clip-mask spans (staggered slide-up / pop-in) ----
function splitWords(el,maskCls,innerCls){
  var wi=0;
  function process(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(child){
      if(child.nodeType===3){
        var frag=document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function(part){
          if(!part){return;}
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return;}
          var mask=document.createElement('span');mask.className=maskCls;
          var inner=document.createElement('span');inner.className=innerCls;
          inner.style.setProperty('--wi',wi++);inner.textContent=part;
          mask.appendChild(inner);frag.appendChild(mask);
        });
        node.replaceChild(frag,child);
      }else if(child.nodeType===1&&child.tagName!=='BR'){
        process(child);
      }
    });
  }
  process(el);
}
document.querySelectorAll('.word-reveal').forEach(function(el){splitWords(el,'word-mask','word-inner');});
document.querySelectorAll('.pop-reveal').forEach(function(el){splitWords(el,'pop-mask','pop-inner');});

// ---- Stagger delays: index among animated siblings in the same parent ----
var animSel='.reveal,.fcard,.pcard';
document.querySelectorAll(animSel).forEach(function(el){
  var sibs=Array.prototype.filter.call(el.parentNode.children,function(c){return c.classList&&c.matches(animSel);});
  var i=sibs.indexOf(el);
  if(i>0){el.style.setProperty('--d',(Math.min(i,5)*0.11)+'s');}
});
// ---- Skill tags cascade index ----
document.querySelectorAll('.skills-strip .tag').forEach(function(t,i){t.style.setProperty('--ti',i);});

// ---- Reveal on scroll (IntersectionObserver, with a no-observer fallback) ----
var revealTargets=document.querySelectorAll('.reveal,.fcard,.pcard,.word-reveal,.pop-reveal,.photo-reveal,.cta-reveal');
if(prefersReduced){
  revealTargets.forEach(function(el){el.classList.add('visible');});
}else if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}})},{threshold:.14,rootMargin:'0px 0px -7% 0px'});
  revealTargets.forEach(function(el){io.observe(el);});
  // Safety net: anything already past the viewport after 3.5s is forced visible,
  // so no content can ever stay stuck hidden.
  setTimeout(function(){
    revealTargets.forEach(function(el){
      if(!el.classList.contains('visible')&&el.getBoundingClientRect().top<window.innerHeight){el.classList.add('visible');}
    });
  },3500);
  // Scroll sweep backup: if the observer ever misses a target that is sitting in
  // the viewport (e.g. an element whose own paint effects confuse intersection),
  // reveal it directly. Runs throttled while scrolling.
  var sweepPending=false;
  window.addEventListener('scroll',function(){
    if(sweepPending){return;}
    sweepPending=true;
    setTimeout(function(){
      sweepPending=false;
      revealTargets.forEach(function(el){
        if(el.classList.contains('visible')){return;}
        var r=el.getBoundingClientRect();
        if(r.bottom>0&&r.top<window.innerHeight){el.classList.add('visible');io.unobserve(el);}
      });
    },140);
  },{passive:true});
}else{
  document.documentElement.classList.add('no-io');
  revealTargets.forEach(function(el){el.classList.add('visible');});
}

// ---- Marquee: JS-driven so it can speed up with scroll velocity ----
var track=document.getElementById('marqueeTrack');
var marqueeBoost=0;
if(track){
  track.innerHTML+=track.innerHTML;
  if(!prefersReduced){
    track.style.animation='none';
    var mOffset=0,mHalf=0,mLast=null;
    function measureMarquee(){mHalf=track.scrollWidth/2;}
    measureMarquee();
    window.addEventListener('resize',measureMarquee);
    function marqueeLoop(ts){
      if(mLast===null){mLast=ts;}
      var dt=Math.min(ts-mLast,64);mLast=ts;
      if(mHalf>0){
        var speed=44+marqueeBoost;               // px per second
        mOffset=(mOffset+speed*dt/1000)%mHalf;
        track.style.transform='translateX('+(-mOffset).toFixed(2)+'px)';
        marqueeBoost*=Math.pow(0.94,dt/16.7);    // ease the boost away
        if(marqueeBoost<0.05){marqueeBoost=0;}
      }
      requestAnimationFrame(marqueeLoop);
    }
    requestAnimationFrame(marqueeLoop);
  }
}

// ---- Scroll engine (rAF-throttled): progress bar + About-photo parallax only.
// The hero is deliberately NOT touched here — its approved fit never shifts. ----
var progressBar=document.getElementById('scrollProgress');
var aboutImg=document.getElementById('aboutPhotoImg');
var aboutFrame=aboutImg?aboutImg.closest('.about-photo'):null;
var scrollTicking=false,lastScrollY=window.scrollY;
function onScrollFrame(){
  scrollTicking=false;
  var y=window.scrollY;
  var dy=y-lastScrollY;lastScrollY=y;
  if(Math.abs(dy)>1){marqueeBoost=Math.min(marqueeBoost+Math.abs(dy)*0.55,230);}
  if(progressBar){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    progressBar.style.transform='scaleX('+(max>0?Math.min(y/max,1):0)+')';
  }
  if(aboutImg&&aboutFrame){
    var r=aboutFrame.getBoundingClientRect();
    if(r.bottom>0&&r.top<window.innerHeight){
      var prog=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight; // ~-0.5..0.5
      prog=Math.max(-0.55,Math.min(0.55,prog));
      aboutImg.style.transform='translateY('+(prog*-20).toFixed(2)+'px) scale(1.14)';
    }
  }
}
if(!prefersReduced){
  window.addEventListener('scroll',function(){
    if(!scrollTicking){scrollTicking=true;requestAnimationFrame(onScrollFrame);}
  },{passive:true});
  onScrollFrame();
}
// Copy email
document.getElementById('copyBtn').addEventListener('click',function(){
  var email='sksameerbasha75@gmail.com';
  function done(){var t=document.getElementById('toast');t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2200);}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(email).then(done).catch(done);}else{done();}
});

// ---- Pointer effects: fine-pointer devices only, never with reduced motion ----
var finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
var reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(finePointer&&!reducedMotion){

  // ===== 1) Hero portrait: hover-only tilt + drift toward the cursor =====
  // Transform-only, max ~10px / ~6deg, eases back to the exact centred fit on leave.
  var portrait=document.querySelector('.hero-portrait');
  if(portrait){
    var pTX=0,pTY=0,pRX=0,pRY=0, pCX=0,pCY=0,pCRX=0,pCRY=0, pHover=false, pRaf=null;
    var desktopHero=window.matchMedia('(min-width: 901px)');
    function portraitBase(){return desktopHero.matches?'translateX(-50%) ':'';}
    function applyPortrait(){
      portrait.style.transform=portraitBase()+'perspective(900px) translate('+pCX.toFixed(2)+'px,'+pCY.toFixed(2)+'px) rotateX('+pCRX.toFixed(2)+'deg) rotateY('+pCRY.toFixed(2)+'deg)';
    }
    function portraitLoop(){
      pCX+=(pTX-pCX)*0.12; pCY+=(pTY-pCY)*0.12; pCRX+=(pRX-pCRX)*0.12; pCRY+=(pRY-pCRY)*0.12;
      applyPortrait();
      var settled=Math.abs(pTX-pCX)<0.05&&Math.abs(pTY-pCY)<0.05&&Math.abs(pRX-pCRX)<0.05&&Math.abs(pRY-pCRY)<0.05;
      if(pHover||!settled){pRaf=requestAnimationFrame(portraitLoop);}
      else{pCX=0;pCY=0;pCRX=0;pCRY=0;portrait.style.transform='';pRaf=null;}
    }
    function kickPortrait(){if(!pRaf){pRaf=requestAnimationFrame(portraitLoop);}}
    portrait.addEventListener('mouseenter',function(){pHover=true;kickPortrait();});
    portrait.addEventListener('mousemove',function(e){
      var r=portrait.getBoundingClientRect();
      var nx=(e.clientX-r.left)/r.width-0.5;   // -0.5 .. 0.5
      var ny=(e.clientY-r.top)/r.height-0.5;
      pTX=nx*20;          // up to ±10px toward the cursor
      pTY=ny*14;          // up to ±7px
      pRY=nx*12;          // up to ±6deg
      pRX=-ny*10;         // up to ±5deg
    });
    portrait.addEventListener('mouseleave',function(){pHover=false;pTX=0;pTY=0;pRX=0;pRY=0;kickPortrait();});
  }

  // ===== 1b) Project cards: gentle tilt on hover only (after scroll-in) =====
  document.querySelectorAll('.pcard').forEach(function(card){
    card.addEventListener('mouseenter',function(){
      if(!card.classList.contains('visible')){return;}
      card.style.transition='transform .18s ease-out,box-shadow .3s ease';
    });
    card.addEventListener('mousemove',function(e){
      if(!card.classList.contains('visible')){return;}
      var r=card.getBoundingClientRect();
      var nx=(e.clientX-r.left)/r.width-0.5;
      var ny=(e.clientY-r.top)/r.height-0.5;
      card.style.transform='perspective(950px) rotateX('+(-ny*5).toFixed(2)+'deg) rotateY('+(nx*6).toFixed(2)+'deg) translateY(-5px)';
      card.style.boxShadow='0 34px 64px rgba(0,0,0,.45)';
    });
    card.addEventListener('mouseleave',function(){
      card.style.transform='';
      card.style.boxShadow='';
      setTimeout(function(){card.style.transition='';},200);
    });
  });

  // ===== 2) Single yellow circle cursor (native arrow hidden via CSS) =====
  var circle=document.getElementById('cursorCircle');
  if(circle){
    var moveTimer=null;
    document.addEventListener('mousemove',function(e){
      circle.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';
      circle.style.opacity='1';
      circle.classList.add('moving');
      if(moveTimer){clearTimeout(moveTimer);}
      moveTimer=setTimeout(function(){circle.classList.remove('moving');},160);
    });
    document.addEventListener('mouseover',function(e){
      if(e.target.closest&&e.target.closest('a,button')){circle.classList.add('grow');}
      else{circle.classList.remove('grow');}
    });
    document.addEventListener('mouseleave',function(){circle.style.opacity='0';});
    document.addEventListener('mousedown',function(){circle.style.opacity='1';});
  }
}
