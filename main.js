(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  // reveal on view
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal').forEach(el=>{el.style.transitionDelay=(el.dataset.d||0)+'s';io.observe(el)});
  // split hero text into letters
  $$('[data-split]').forEach(el=>{const t=el.textContent;el.textContent='';let d=0;const n=t.replace(/\s/g,'').length;
    t.split('\n').forEach(line=>{const l=document.createElement('span');l.className='ln';
      [...line.trim()].forEach(ch=>{if(ch===' '){l.appendChild(document.createTextNode(' '));return}const s=document.createElement('span');s.className='ch';s.textContent=ch;s.style.animationDelay=(.15+d*.045)+'s';s.style.backgroundPosition=(d++/n*100)+'% 0';l.appendChild(s)});el.appendChild(l)});
    el.setAttribute('aria-label',t.replace(/\n/g,' '))});
  // scroll-linked effects: one cheap update, only when the scroll position changed
  const bar=$('.progress'),tl=$('.tl'),fill=$('.tl .fill'),mqs=$$('.mq');
  let per=[],lastY=-1,vel=0;
  const measure=()=>{per=mqs.map(m=>m.scrollWidth/2||1)};
  let tlTop=0,tlH=1;
  const measureTl=()=>{if(tl){const r=tl.getBoundingClientRect();tlTop=r.top+scrollY;tlH=r.height}};
  const native=()=>window.SCENE&&SCENE.native;
  function update(){
    const y=window.scrollY;if(y===lastY)return;lastY=y;
    const dh=document.documentElement.scrollHeight-innerHeight,p=dh>0?Math.min(1,Math.max(0,y/dh)):0;
    if(!native()){if(bar)bar.style.transform='scaleX('+p+')';if(window.SCENE)SCENE.update(p);hudPos(p)}
    hud(y,dh);
    if(fill&&tl)fill.style.transform='scaleY('+Math.min(1,Math.max(0,(y+innerHeight*.6-tlTop)/tlH))+')';
    for(let i=0;i<mqs.length;i++){const o=(y*.35+i*120)%per[i];mqs[i].style.transform='translate3d('+(i%2?-per[i]+o:-o)+'px,0,0)'}
  }
  // altitude HUD (home only): marker follows scroll, label names the current stage
  const stages=[['top','Start'],['about','Base camp'],['projects','Treeline'],['skills','Ridge'],['experience','High camp'],['contact','Summit']];
  let hudEl=null,dot,lab,tops=[];
  if(document.body.dataset.theme==='home'){hudEl=document.createElement('div');hudEl.className='hud';hudEl.setAttribute('aria-hidden','true');
    hudEl.innerHTML='<i></i><b>Start</b>'+stages.map((s,i)=>'<u style="top:'+(i/(stages.length-1)*100)+'%"></u>').join('');document.body.appendChild(hudEl);dot=hudEl.querySelector('i');lab=hudEl.querySelector('b')}
  const measureTops=()=>{tops=stages.map(s=>{const el=document.getElementById(s[0]);return el?el.getBoundingClientRect().top+scrollY:0})};
  let curStage=-1;
  function hudPos(p){if(!hudEl)return;const t='translateY('+(p*hudEl.clientHeight).toFixed(1)+'px)';dot.style.transform=t;lab.style.transform=t}
  function hud(y,dh){if(!hudEl)return;
    let k=0;const mid=y+innerHeight*.45;for(let i=0;i<tops.length;i++)if(mid>=tops[i])k=i;if(y>=dh-4)k=stages.length-1;
    if(k!==curStage){curStage=k;lab.textContent=stages[k][1]}}
  addEventListener('resize',()=>{measure();measureTops();measureTl();lastY=-1;update()});
  addEventListener('load',()=>{measure();measureTops();measureTl();lastY=-1;update()});
  measure();measureTops();measureTl();
  if(native()){const tlm=new ScrollTimeline({source:document.scrollingElement,axis:'block'});
    const drive=()=>{if(bar)bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{timeline:tlm,fill:'both',easing:'linear'});
      if(hudEl){hudAnim.forEach(a=>a.cancel());hudAnim=[dot,lab].map(e=>e.animate([{transform:'translateY(0px)'},{transform:'translateY('+hudEl.clientHeight+'px)'}],{timeline:tlm,fill:'both',easing:'linear'}))}};
    let hudAnim=[];drive();addEventListener('resize',()=>{hudAnim.forEach(a=>a.cancel());if(hudEl)hudAnim=[dot,lab].map(e=>e.animate([{transform:'translateY(0px)'},{transform:'translateY('+hudEl.clientHeight+'px)'}],{timeline:tlm,fill:'both',easing:'linear'}))})}
  let tick=0;const onScroll=()=>{if(!tick)tick=requestAnimationFrame(()=>{tick=0;update()})};
  update();addEventListener('scroll',onScroll,{passive:true});
  // magnetic buttons
  if(!reduce&&fine)$$('.btn,.mail').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.18+'px,'+(e.clientY-r.top-r.height/2)*.25+'px)'});b.addEventListener('pointerleave',()=>b.style.transform='')});
  const cp=$('#copy');cp&&cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('hey.aryan23@gmail.com');cp.textContent='Copied';setTimeout(()=>cp.textContent='Copy email',1600)}catch(e){}});
  const yr=$('#yr');yr&&(yr.textContent=new Date().getFullYear());
})();
