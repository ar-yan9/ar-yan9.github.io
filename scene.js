/* Mountain backdrop: a tall SVG mountain that the page "climbs". Scroll moves the camera up the mountain.
   Only CSS transforms and opacity change while scrolling. No canvas, no blur. */
(function(){
  const host=document.getElementById('scene');if(!host)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const theme=document.body.dataset.theme||'home';
  const MOODS={
    home:{c:[0,1],sky:[['#d7dcf0','#dde1f2'],['#e2e4f1','#d9dbec'],['#e5e4ee','#eaebf3'],['#dbdff2','#edeff8']],lit:'#d4d6e8',shade:'#bdbfd4',snow:'#f0f2f9',snowSh:'#dfdfe7',tree:'#a6a7c6',tree2:'#9293b5',far:'#d5d6e5',far2:'#c9cada',mist:'rgba(255,255,255,.7)',orb:'#6b7cc7',route:'#36468f',line:'rgba(25,20,46,.16)',stars:0,seed:7},
    ragkit:{c:[.14,.46],sky:[['#e6e6ec','#dddde7'],['#eaeaf0','#e2e2eb']],lit:'#dadae3',shade:'#c3c3cf',snow:'#f2f2f7',snowSh:'#dbdbe3',tree:'#b0b0c3',tree2:'#9c9cb1',far:'#d3d3df',far2:'#c6c6d4',mist:'rgba(255,255,255,.92)',orb:'#ecedf4',route:'#514f7a',line:'rgba(25,20,46,.14)',stars:0,seed:11,mistBoost:1},
    kalesh:{c:[.3,.62],sky:[['#c8cfea','#d2d7ee'],['#c0c8e7','#d2d7ee']],lit:'#c6cdea',shade:'#a6b0d8',snow:'#ebeef8',snowSh:'#c6cde9',tree:'#9ca2c7',tree2:'#848ab4',far:'#bfc7e7',far2:'#abb5dd',mist:'rgba(233,236,247,.7)',orb:'#4a64ba',route:'#35498b',line:'rgba(28,37,72,.16)',stars:0,seed:23,bigOrb:1},
    triage:{c:[.55,.88],sky:[['#0d0c1f','#181637'],['#100f27','#1d1b41']],lit:'#312f5c',shade:'#1a183c',snow:'#d0cfe0',snowSh:'#8886a8',tree:'#242250',tree2:'#1a183e',far:'#201e48',far2:'#2a2755',mist:'rgba(161,160,210,.14)',orb:'#cbd0eb',route:'#c4bce5',line:'rgba(221,220,240,.14)',stars:1,seed:31},
    pulse:{c:[.74,1],sky:[['#d1d7ed','#dbdff1'],['#d1d7ee','#e6e8f5']],lit:'#d9dbea',shade:'#c9c9d9',snow:'#f4f5fb',snowSh:'#e3e3e9',tree:'#aeaec6',tree2:'#9b9ab5',far:'#dcdce7',far2:'#cfcfdd',mist:'rgba(255,255,255,.75)',orb:'#7485ca',route:'#3c4f9e',line:'rgba(25,20,46,.15)',stars:0,seed:41},
    pca:{c:[0,.3],sky:[['#e3e3ee','#e6e7f2'],['#e6e6f0','#e7e8f3']],lit:'#d6d7e9',shade:'#c3c4d8',snow:'#f2f3fa',snowSh:'#dfdfe7',tree:'#a8a9c8',tree2:'#9596b7',far:'#d6d7e5',far2:'#cacadb',mist:'rgba(255,255,255,.8)',orb:'#e9ebf6',route:'#2e347b',line:'rgba(25,20,46,.15)',stars:0,seed:53}
  };
  const m=MOODS[theme]||MOODS.home;
  let s=m.seed;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const f=n=>Math.round(n);
  /* ---------- mountain geometry (viewBox 1440 x 3200) ---------- */
  const TIPX=720,TIPY=380,BASE=3200;
  const left=[],right=[];
  for(let y=TIPY;y<=BASE;y+=40){const t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);
    left.push([f(TIPX-half-(rnd()-.5)*34-Math.sin(y*.011)*18*t),y]);
    right.push([f(TIPX+half*.94+(rnd()-.5)*34+Math.sin(y*.009+2)*18*t),y]);}
  const cx=y=>TIPX+30*Math.sin(y*.0035)+70*(y-TIPY)/(BASE-TIPY);
  const P=a=>a.map(p=>p[0]+','+p[1]).join(' ');
  const sil=[[TIPX,TIPY],...right,...left.slice().reverse()];
  const center=[];for(let y=TIPY;y<=BASE;y+=40)center.push([f(cx(y)),y]);
  const litPoly=[[TIPX,TIPY],...center.slice(1),...left.slice().reverse()];
  /* snow cap */
  const snowY=1120,zig=[];
  const edgeAt=(arr,y)=>{for(let i=1;i<arr.length;i++)if(arr[i][1]>=y)return arr[i][0];return arr[arr.length-1][0]};
  const xr=edgeAt(right,snowY),xl=edgeAt(left,snowY);
  for(let x=xr;x>=xl;x-=34)zig.push([f(x),f(snowY+(rnd()*110)-(Math.abs(x-TIPX)<120?60:0))]);
  const snow=[[TIPX,TIPY],...right.filter(p=>p[1]<=snowY),...zig,...left.filter(p=>p[1]<=snowY).reverse()];
  const zigR=zig.filter(p=>p[0]>=cx(snowY));
  const snowSh=[[TIPX,TIPY],...right.filter(p=>p[1]<=snowY),...zigR,[f(cx(snowY)),snowY+40],...center.filter(p=>p[1]<=snowY).reverse().slice(0,-1)];
  /* tree bands (clipped to silhouette) */
  const band=(top,amp,step)=>{const pts=[];for(let x=-40,i=0;x<=1480;x+=step,i++)pts.push([x,f(top+(i%2?-amp:amp*.4)+(rnd()-.5)*amp)]);return [[-40,BASE+40],...pts,[1480,BASE+40]]};
  const trees1=band(1950,34,26),trees2=band(2560,46,32);
  /* facets and ridge lines */
  let facets='';
  for(let i=0;i<16;i++){const y=520+rnd()*2100,side=rnd()<.5?-1:1,t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82),x=TIPX+side*half*(.2+rnd()*.55),w=40+rnd()*110,h=120+rnd()*260;
    facets+=`<polygon points="${f(x)},${f(y)} ${f(x+side*w)},${f(y+h)} ${f(x-side*w*.3)},${f(y+h*.8)}" fill="${rnd()<.5?'rgba(25,20,46,.07)':'rgba(255,255,255,.2)'}"/>`}
  let ridges='';
  for(let k=0;k<6;k++){let x=TIPX,y=TIPY,pts=[[x,y]];const dir=(k-2.5)*.28;
    while(y<2700){y+=90+rnd()*60;x+=dir*(100)+(rnd()-.5)*50;pts.push([f(x),f(y)])}
    ridges+=`<polyline points="${P(pts)}" fill="none" stroke="${m.line}" stroke-width="3" stroke-linejoin="round"/>`}
  /* route + camps */
  const route=[];const N=14;
  for(let k=0;k<=N;k++){const y=3080-k*(2600/N),t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);route.push([f(cx(y)-half*.3+(k%2?half*.45:-half*.12)),f(y)])}
  const tent=(x,y,c)=>`<polygon points="${x-22},${y} ${x},${y-34} ${x+22},${y}" fill="${c}"/><line x1="${x}" y1="${y-34}" x2="${x}" y2="${y}" stroke="rgba(0,0,0,.18)" stroke-width="2"/>`;
  const camps=[[2950],[2350],[1800],[1300]].map(([y])=>{const t=(y-TIPY)/(BASE-TIPY),half=36+830*Math.pow(t,.82);return tent(f(cx(y)-half*.2),y,m.route)}).join('');
  const flag=`<g class="flag"><line x1="${TIPX}" y1="${TIPY-4}" x2="${TIPX}" y2="${TIPY-92}" stroke="${m.route}" stroke-width="5"/><polygon points="${TIPX},${TIPY-92} ${TIPX+64},${TIPY-70} ${TIPX},${TIPY-48}" fill="${m.route}"/></g>`;
  const hills=`<path d="M-40,3240 L-40,2800 L120,2760 L260,2840 L420,2780 L620,3000 L720,3240Z" fill="${m.tree2}"/><path d="M1480,3240 L1480,2820 L1300,2770 L1160,2850 L1000,2790 L820,3010 L720,3240Z" fill="${m.tree2}"/>`;
  const mountain=`<svg viewBox="0 0 1440 3200" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="sc"><polygon points="${P(sil)}"/></clipPath></defs>
  <polygon points="${P(sil)}" fill="${m.shade}"/>
  <polygon points="${P(litPoly)}" fill="${m.lit}"/>${facets}${ridges}
  <g clip-path="url(#sc)"><polygon points="${P(trees1)}" fill="${m.tree}"/><polygon points="${P(trees2)}" fill="${m.tree2}"/></g>
  <polygon points="${P(snow)}" fill="${m.snow}"/><polygon points="${P(snowSh)}" fill="${m.snowSh}"/>
  ${hills}<polyline points="${P(route)}" fill="none" stroke="${m.route}" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" opacity=".4"/><g opacity=".6">${camps}</g>${flag}</svg>`;
  /* distant ranges (separate, slower layer) */
  let far='';
  const peak=(x,top,w,h,c)=>{let d=`M${f(x-w)},${top+h} `;const n=5;for(let i=0;i<=n;i++){const px=x-w+(2*w)*i/n,py=i===Math.round(n/2)?top:top+h*(.35+rnd()*.35);d+=`L${f(px)},${f(py)} `}return `<path d="${d}L${f(x+w)},${top+h}Z" fill="${c}"/>`};
  [[160,150,240,520],[320,620,200,430],[1260,300,260,560],[1130,820,200,420],[220,1050,230,470],[1300,1230,250,460]].forEach(([x,t,w,h],i)=>{far+=peak(x,t,w,h,i%2?m.far2:m.far)});
  const farSvg=`<svg viewBox="0 0 1440 1500" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">${far}</svg>`;
  /* foreground pines + tents at the start (they fall away as you climb) */
  let pines='';for(let x=-20,i=0;x<1480;x+=34+rnd()*20,i++){const h=70+rnd()*80,w=24+rnd()*12;pines+=`<polygon points="${f(x)},240 ${f(x+w/2)},${f(240-h)} ${f(x+w)},240" fill="${i%3?m.tree2:m.tree}"/>`}
  const fgSvg=`<svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><polygon points="-20,240 -20,200 1460,190 1460,240" fill="${m.tree2}"/>${pines}</svg>`;
  let stars='';if(m.stars){for(let i=0;i<60;i++)stars+=`<circle cx="${f(rnd()*1000)}" cy="${f(rnd()*600)}" r="${(.8+rnd()*1.6).toFixed(1)}" ${i%4===0?'class="tw"':''}/>`}
  const mistN=m.mistBoost?5:3,mists=[2380,1760,1250,820,560].slice(0,mistN).map((y,i)=>`<div class="mist" style="top:${(y/3200*100).toFixed(1)}%;animation-duration:${60+i*17}s;animation-delay:-${i*13}s;background:radial-gradient(ellipse 22% 50% at 25% 50%,${m.mist},transparent),radial-gradient(ellipse 26% 50% at 68% 55%,${m.mist},transparent)"></div>`).join('');
  host.innerHTML=
    m.sky.map((c,i)=>`<div class="sky" style="background:linear-gradient(180deg,${c[0]},${c[1]})"></div>`).join('')+
    (m.stars?`<svg class="stars" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMin slice" fill="#dde0f2">${stars}</svg>`:'')+
    `<div class="orb${m.bigOrb?' big':''}" style="background:${m.orb}"></div>`+
    `<div class="far">${farSvg}</div><div class="world"><div class="mt">${mountain}</div>${mists}</div><div class="fg">${fgSvg}</div>`;
  const skyEls=[...host.querySelectorAll('.sky')],orb=host.querySelector('.orb'),flg=host.querySelector('.flag'),far_=host.querySelector('.far'),world=host.querySelector('.world'),fg=host.querySelector('.fg');
  let vh=innerHeight,vw=innerWidth,last=0;
  const vals=p=>{const c=m.c[0]+(m.c[1]-m.c[0])*p,n=skyEls.length,fpos=c*(n-1);
    return{world:'translate3d(0,'+(-(3.2*vh-vh)*(1-c)+c*c*c*vh*(vw<820?.8:.5)).toFixed(1)+'px,0)',far:'translate3d(0,'+(-(1.5*vh-vh)*(1-c)).toFixed(1)+'px,0)',fg:'translate3d(0,'+(c*vh*1.3).toFixed(1)+'px,0)',
      sky:skyEls.map((_,i)=>Math.max(0,1-Math.abs(fpos-i)).toFixed(3)),flag:Math.max(0,Math.min(1,(c-.9)*12)).toFixed(2),
      orb:'translate3d('+(vw*(.76-.2*c)).toFixed(0)+'px,'+(vh*(.74-.58*c)).toFixed(0)+'px,0)'}};
  /* fallback (no scroll-driven animations): JS sets the same values */
  function apply(p){last=p;const v=vals(p);world.style.transform=v.world;far_.style.transform=v.far;fg.style.transform=v.fg;orb.style.transform=v.orb;
    skyEls.forEach((e,i)=>e.style.opacity=v.sky[i]);if(flg)flg.style.opacity=v.flag}
  /* preferred: Web Animations driven by the scroll position. These only touch transform/opacity, so the browser
     runs them on the compositor, in lockstep with native scrolling (no main-thread work per scroll frame). */
  const canTimeline=!reduce&&typeof ScrollTimeline!=='undefined'&&typeof Element.prototype.animate==='function';
  let anims=[];
  function build(){
    anims.forEach(a=>a.cancel());anims=[];
    const tl=new ScrollTimeline({source:document.scrollingElement,axis:'block'}),N=12,S=[];
    for(let i=0;i<=N;i++)S.push(vals(i/N));
    const run=(el,key,fn)=>{if(!el)return;anims.push(el.animate(S.map((v,i)=>({offset:i/N,[key]:fn(v)})),{timeline:tl,fill:'both',easing:'linear'}))};
    run(world,'transform',v=>v.world);run(far_,'transform',v=>v.far);run(fg,'transform',v=>v.fg);run(orb,'transform',v=>v.orb);
    skyEls.forEach((e,i)=>run(e,'opacity',v=>v.sky[i]));run(flg,'opacity',v=>v.flag);
  }
  window.SCENE={update:canTimeline?function(){}:apply,native:canTimeline};
  addEventListener('resize',()=>{vh=innerHeight;vw=innerWidth;canTimeline?build():apply(last)});
  if(canTimeline)build();else apply(reduce?.2:0);
})();
