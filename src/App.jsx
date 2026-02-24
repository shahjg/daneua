import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// Supabase — dynamic import so artifact preview doesn't crash
let supabase = null;
const initSupabase = import("./supabase").then(m => { supabase = m.supabase; }).catch(() => {});

// Supabase sync helpers — write to both localStorage + Supabase
const sync={
  async loadWords(){if(!supabase)return null;try{const{data}=await supabase.from('dc_words').select('*').order('created_at',{ascending:false});return data;}catch{return null;}},
  async addWord(text,from){if(!supabase)return;try{await supabase.from('dc_words').insert({text,from_name:from});}catch{}},
  async deleteWord(id){if(!supabase)return;try{await supabase.from('dc_words').delete().eq('id',id);}catch{}},
  async loadEvents(){if(!supabase)return null;try{const{data}=await supabase.from('dc_events').select('*').order('date',{ascending:true});return data;}catch{return null;}},
  async addEvent(evt){if(!supabase)return;try{await supabase.from('dc_events').insert(evt);}catch{}},
  async deleteEvent(id){if(!supabase)return;try{await supabase.from('dc_events').delete().eq('id',id);}catch{}},
  async loadNotes(){if(!supabase)return null;try{const{data}=await supabase.from('dc_notes').select('*').order('created_at',{ascending:false});return data;}catch{return null;}},
  async addNote(text,from){if(!supabase)return;try{await supabase.from('dc_notes').insert({text,from_name:from});}catch{}},
  async deleteNote(id){if(!supabase)return;try{await supabase.from('dc_notes').delete().eq('id',id);}catch{}},
  async loadRecs(dayIdx){if(!supabase)return null;try{const{data}=await supabase.from('dc_wotd_recs').select('*').eq('day_idx',dayIdx);return data;}catch{return null;}},
  async saveRec(dayIdx,langKey,userName,audioData){if(!supabase)return;try{await supabase.from('dc_wotd_recs').upsert({day_idx:dayIdx,lang_key:langKey,user_name:userName,audio_data:audioData},{onConflict:'day_idx,lang_key,user_name'});}catch{}},
  async deleteRec(dayIdx,langKey,userName){if(!supabase)return;try{await supabase.from('dc_wotd_recs').delete().eq('day_idx',dayIdx).eq('lang_key',langKey).eq('user_name',userName);}catch{}},
  async loadGym(user){if(!supabase)return null;try{const{data}=await supabase.from('dc_gym').select('*').eq('user_name',user).order('date',{ascending:false});return data;}catch{return null;}},
  async saveGymEntry(entry){if(!supabase)return;try{await supabase.from('dc_gym').upsert(entry,{onConflict:'user_name,date'});}catch{}},
};

// Dark mode context
const DarkCtx = createContext(false);
const useDark = () => useContext(DarkCtx);

// User context — who's logged in (shah or dane)
const UserCtx = createContext(null);
const useUser = () => useContext(UserCtx);

// localStorage helpers
const local={get(k,f=null){try{const v=localStorage.getItem('dc_'+k);return v?JSON.parse(v):f;}catch{return f;}},set(k,v){try{localStorage.setItem('dc_'+k,JSON.stringify(v));}catch{}}};

// Push notifications
const notif={
  supported:typeof window!=='undefined'&&'Notification' in window,
  _toastCb:null,
  async requestPermission(){
    if(!this.supported)return false;
    const perm=await Notification.requestPermission();
    return perm==='granted';
  },
  send(title,body,options={}){
    // Native notification (works even when app is backgrounded on mobile)
    if(!this.supported||Notification.permission!=='granted')return;
    try{
      if('serviceWorker' in navigator&&navigator.serviceWorker.controller){
        navigator.serviceWorker.ready.then(reg=>{
          reg.showNotification(title,{body,icon:'/icon-192.png',badge:'/icon-192.png',vibrate:[200,100,200],tag:options.tag||'dc-notif',renotify:true,...options});
        });
      }else{
        new Notification(title,{body,icon:'/icon-192.png',...options});
      }
    }catch(e){}
  },
  show(title,body){
    // In-app toast only
    if(this._toastCb)try{this._toastCb({title,body,id:Date.now()});}catch(e){}
  },
  notify(title,body,options={}){
    // Both native + in-app
    this.show(title,body);
    this.send(title,body,options);
  },
  // Schedule a notification at a specific time today using setTimeout
  scheduleAt(hour,minute,title,body,tag){
    if(!this.supported||Notification.permission!=='granted')return;
    const now=new Date();
    const target=new Date();target.setHours(hour,minute,0,0);
    const ms=target-now;
    if(ms>0&&ms<24*60*60*1000){
      setTimeout(()=>this.send(title,body,{tag}),ms);
      return true;
    }
    return false;
  },
  // Check and fire Fajr/Iftar notifications
  checkRamadan(fajrTime,magTime,dayNum){
    if(!this.supported||Notification.permission!=='granted')return;
    const today=new Date().toISOString().split('T')[0];

    // Fajr — 30 min before suhoor ends
    const fajrSent=local.get('fajrNotif_'+today,false);
    if(!fajrSent){
      const [fh,fm]=fajrTime.split(':').map(Number);
      const now=new Date();const fajr=new Date();fajr.setHours(fh,fm,0,0);
      const minsBefore=(fajr-now)/(1000*60);
      // Send if within 30 min before fajr or up to 5 min after
      if(minsBefore>=-5&&minsBefore<=30){
        this.send('Suhoor Ends Soon ☽',`Ramadan Day ${dayNum} — Fajr at ${fajrTime}. Eat & drink before then!`,{tag:'fajr'});
        local.set('fajrNotif_'+today,true);
      }
      // Schedule if fajr is later today
      if(minsBefore>30){
        const warnH=fm>=30?fh:fh-1;const warnM=fm>=30?fm-30:fm+30;
        this.scheduleAt(warnH,warnM,'Suhoor Ends in 30min ☽',`Ramadan Day ${dayNum} — Fajr at ${fajrTime}`,'fajr');
      }
    }

    // Iftar — notify at maghrib time
    const iftarSent=local.get('iftarNotif_'+today,false);
    if(!iftarSent&&magTime){
      const [mh,mm]=magTime.split(':').map(Number);
      const now=new Date();const mag=new Date();mag.setHours(mh,mm,0,0);
      const minsTil=(mag-now)/(1000*60);
      if(minsTil>=-2&&minsTil<=5){
        this.send('Iftar Time! 🌙',`Ramadan Day ${dayNum} — Maghrib at ${magTime}. Bismillah!`,{tag:'iftar'});
        local.set('iftarNotif_'+today,true);
      }
      if(minsTil>5){
        this.scheduleAt(mh,mm,'Iftar Time! 🌙',`Ramadan Day ${dayNum} — Maghrib at ${magTime}. Bismillah!`,'iftar');
      }
    }
  }
};

// PIN Login Screen
function Login({onLogin}){
  const [who,setWho]=useState(null);const [pin,setPin]=useState("");const [error,setError]=useState(false);const [shake,setShake]=useState(false);const [splash,setSplash]=useState(true);const [fadeOut,setFadeOut]=useState(false);
  const PINS={shah:"0953",dane:"2202"};
  const tryPin=(digit)=>{
    const next=pin+digit;
    if(next.length<4){setPin(next);setError(false);return;}
    if(next===PINS[who]){setFadeOut(true);setTimeout(()=>{local.set('user',who);onLogin(who);},600);}
    else{setError(true);setShake(true);setTimeout(()=>{setPin("");setShake(false);},500);}
  };
  const del=()=>{setPin(pin.slice(0,-1));setError(false);};

  // Animated floating hearts CSS
  const heartCSS=`
    @keyframes floatHeart{0%{transform:translateY(0) scale(0);opacity:0}10%{opacity:1;transform:translateY(-10vh) scale(1)}90%{opacity:0.6}100%{transform:translateY(-100vh) scale(0.5) rotate(25deg);opacity:0}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
    @keyframes glow{0%,100%{opacity:0.04}50%{opacity:0.08}}
    @keyframes catBlink{0%,42%,46%,100%{transform:scaleY(1)}44%{transform:scaleY(0.1)}}
    @keyframes splashFade{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}
    .dc-heart{position:absolute;bottom:-20px;animation:floatHeart linear infinite;pointer-events:none}
    .dc-splash-exit{animation:splashFade 0.5s ease forwards}
  `;
  const hearts=Array.from({length:12},(_,i)=>({
    left:Math.random()*100,size:12+Math.random()*18,delay:Math.random()*8,dur:6+Math.random()*6,
    color:['rgba(232,17,91,0.3)','rgba(201,168,76,0.25)','rgba(29,185,84,0.25)','rgba(232,17,91,0.15)','rgba(255,255,255,0.08)'][Math.floor(Math.random()*5)]
  }));

  // Splash screen
  if(splash)return(<div onClick={()=>{setFadeOut(true);setTimeout(()=>{setSplash(false);setFadeOut(false);},500);}} className={fadeOut?"dc-splash-exit":""} style={{height:"100%",background:"linear-gradient(160deg,#072E22 0%,#041A12 50%,#03120D 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",overflow:"hidden"}}>
    <style>{heartCSS}</style>
    {/* Floating hearts */}
    {hearts.map((h,i)=>(<div key={i} className="dc-heart" style={{left:h.left+"%",animationDuration:h.dur+"s",animationDelay:h.delay+"s"}}>
      <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </div>))}
    {/* Ambient glow */}
    <div style={{position:"absolute",top:"12%",left:"5%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(29,185,84,0.06),transparent)",filter:"blur(60px)",animation:"glow 4s ease infinite"}}/>
    <div style={{position:"absolute",bottom:"15%",right:"0%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(232,17,91,0.04),transparent)",filter:"blur(50px)",animation:"glow 5s ease infinite 1s"}}/>
    <div style={{position:"absolute",top:"40%",right:"20%",width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.04),transparent)",filter:"blur(40px)",animation:"glow 6s ease infinite 2s"}}/>
    {/* Main content */}
    <div style={{textAlign:"center",position:"relative",zIndex:1}}>
      <div style={{animation:"pulse 3s ease infinite",marginBottom:24}}>
        <Sy mood="happy" size={88}/>
      </div>
      <h1 style={{color:"#fff",fontSize:42,fontWeight:200,margin:"0 0 6px",letterSpacing:4,fontFamily:"Georgia,'Times New Roman',serif",animation:"fadeUp 1s ease 0.2s both"}}>Dane's Chai</h1>
      <div style={{width:48,height:1.5,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",margin:"0 auto 14px",borderRadius:2,animation:"fadeUp 1s ease 0.4s both"}}/>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:12,fontWeight:400,letterSpacing:2,textTransform:"uppercase",animation:"fadeUp 1s ease 0.6s both"}}>made by Shah, for Dane</p>
    </div>
    <p style={{position:"absolute",bottom:40,color:"rgba(255,255,255,0.12)",fontSize:11,letterSpacing:1,animation:"pulse 2s ease infinite"}}>tap anywhere</p>
  </div>);

  // Who's drinking?
  if(!who)return(<div style={{height:"100%",background:"linear-gradient(160deg,#072E22 0%,#041A12 50%,#03120D 100%)",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <style>{heartCSS}</style>
    {hearts.slice(0,6).map((h,i)=>(<div key={i} className="dc-heart" style={{left:h.left+"%",animationDuration:h.dur+"s",animationDelay:h.delay+"s"}}>
      <svg width={h.size*0.7} height={h.size*0.7} viewBox="0 0 24 24" fill={h.color}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </div>))}
    <div style={{position:"absolute",top:"8%",right:"10%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(29,185,84,0.04),transparent)",filter:"blur(50px)"}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{animation:"fadeUp 0.6s ease both"}}><Sy mood="thinking" size={56}/></div>
      <h2 style={{color:"#fff",fontSize:26,fontWeight:200,margin:"18px 0 4px",letterSpacing:1.5,fontFamily:"Georgia,serif",animation:"fadeUp 0.6s ease 0.1s both"}}>Who's drinking?</h2>
      <p style={{color:"rgba(255,255,255,0.2)",fontSize:12,margin:"0 0 40px",letterSpacing:1,animation:"fadeUp 0.6s ease 0.2s both"}}>Pick your cup</p>
      <div style={{display:"flex",gap:20,width:"100%",maxWidth:320,animation:"fadeUp 0.6s ease 0.3s both"}}>
        {[{id:"shah",name:"Shah",color:"#1DB954",sub:"The one who made it",emoji:"☕"},{id:"dane",name:"Dane",color:"#E8115B",sub:"The one it's for",emoji:"🫖"}].map(u=>(<button key={u.id} onClick={()=>setWho(u.id)} style={{flex:1,padding:"28px 16px",borderRadius:24,border:"1px solid rgba(255,255,255,0.04)",background:"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.25s",backdropFilter:"blur(10px)"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${u.color},${u.color}BB)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:`0 6px 24px ${u.color}30`}}><span style={{color:"#fff",fontSize:22,fontWeight:800}}>{u.name[0]}</span></div>
          <p style={{color:"#fff",fontSize:18,fontWeight:500,margin:"0 0 4px",letterSpacing:0.5}}>{u.name}</p>
          <p style={{color:"rgba(255,255,255,0.18)",fontSize:11,margin:0,letterSpacing:0.3}}>{u.sub}</p>
        </button>))}
      </div>
    </div>
  </div>);

  // PIN entry
  return(<div className={fadeOut?"dc-splash-exit":""} style={{height:"100%",background:"linear-gradient(160deg,#072E22 0%,#041A12 50%,#03120D 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
    <style>{heartCSS}</style>
    {hearts.slice(0,4).map((h,i)=>(<div key={i} className="dc-heart" style={{left:h.left+"%",animationDuration:h.dur+"s",animationDelay:h.delay+"s"}}>
      <svg width={h.size*0.5} height={h.size*0.5} viewBox="0 0 24 24" fill={h.color}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </div>))}
    <button onClick={()=>{setWho(null);setPin("");}} style={{position:"absolute",top:16,left:16,background:"none",border:"none",cursor:"pointer",padding:12,zIndex:2}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div style={{animation:"fadeUp 0.4s ease both"}}>
      <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${who==="shah"?"#1DB954":"#E8115B"},${who==="shah"?"#169C46":"#C70F4E"})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 6px 24px ${who==="shah"?"#1DB95430":"#E8115B30"}`}}><span style={{color:"#fff",fontSize:22,fontWeight:800}}>{who==="shah"?"S":"D"}</span></div>
    </div>
    <p style={{color:"#fff",fontSize:18,fontWeight:400,margin:"0 0 4px",letterSpacing:0.5,animation:"fadeUp 0.4s ease 0.1s both"}}>{who==="shah"?"Shah":"Dane"}</p>
    <p style={{color:"rgba(255,255,255,0.2)",fontSize:12,margin:"0 0 32px",letterSpacing:1,animation:"fadeUp 0.4s ease 0.15s both"}}>Enter your PIN</p>
    <div className={shake?"dc-shake":""} style={{display:"flex",gap:18,marginBottom:14,animation:"fadeUp 0.4s ease 0.2s both"}}>
      {[0,1,2,3].map(i=>(<div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?(error?"#D94F4F":who==="shah"?"#1DB954":"#E8115B"):"transparent",border:"1.5px solid "+(i<pin.length?(error?"#D94F4F":who==="shah"?"#1DB954":"#E8115B"):"rgba(255,255,255,0.1)"),transition:"all 0.15s",boxShadow:i<pin.length&&!error?`0 0 8px ${who==="shah"?"#1DB95440":"#E8115B40"}`:"none"}}/>))}
    </div>
    {error&&<p style={{color:"#D94F4F",fontSize:12,margin:"0 0 8px",fontWeight:500}}>Wrong PIN</p>}
    <div style={{height:error?0:20}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,maxWidth:264,animation:"fadeUp 0.4s ease 0.25s both"}}>
      {[1,2,3,4,5,6,7,8,9,null,0,"del"].map((d,i)=>(<button key={i} onClick={d==="del"?del:d!==null?()=>tryPin(String(d)):undefined} style={{width:72,height:72,borderRadius:"50%",border:d!==null?"1px solid rgba(255,255,255,0.06)":"none",background:d!==null?"rgba(255,255,255,0.02)":"transparent",color:"#fff",fontSize:d==="del"?14:24,fontWeight:300,cursor:d!==null?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:0.5,transition:"background 0.15s"}}>{d==="del"?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>:d}</button>))}
    </div>
  </div>);
}

// Sy the Cat mascot — Siamese Ragdoll mix (JAHAAN CO mascot)
function Sy({mood="happy",size=80,msg}){
  const sz=size;
  // Dark seal point Siamese Ragdoll — burnt/darker variant
  const cream="#E8D5C0",dark2="#3D2418",mid="#6B4A38",blue="#5B9BD5",pink="#D4908A",inner="#C49A7C";
  const moods={happy:{mouth:"M"+(sz*.42)+" "+(sz*.52)+"Q"+(sz*.5)+" "+(sz*.57)+" "+(sz*.58)+" "+(sz*.52),eyes:"open",tail:15,brow:0},
    proud:{mouth:"M"+(sz*.4)+" "+(sz*.51)+"Q"+(sz*.5)+" "+(sz*.58)+" "+(sz*.6)+" "+(sz*.51),eyes:"open",tail:22,brow:-1},
    sad:{mouth:"M"+(sz*.44)+" "+(sz*.55)+"Q"+(sz*.5)+" "+(sz*.52)+" "+(sz*.56)+" "+(sz*.55),eyes:"half",tail:-5,brow:2},
    thinking:{mouth:"M"+(sz*.45)+" "+(sz*.53)+"L"+(sz*.55)+" "+(sz*.54),eyes:"half",tail:5,brow:1},
    celebrate:{mouth:"M"+(sz*.4)+" "+(sz*.5)+"Q"+(sz*.5)+" "+(sz*.59)+" "+(sz*.6)+" "+(sz*.5),eyes:"wide",tail:28,brow:-1},
    sleeping:{mouth:"M"+(sz*.46)+" "+(sz*.53)+"Q"+(sz*.5)+" "+(sz*.55)+" "+(sz*.54)+" "+(sz*.53),eyes:"closed",tail:0,brow:0},
  };
  const m=moods[mood]||moods.happy;
  const eyeH=m.eyes==="wide"?sz*.05:m.eyes==="half"?sz*.028:sz*.04;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:msg?6:0}}>
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {/* Tail — curves up behind body */}
      <path d={`M${sz*.7} ${sz*.62}Q${sz*.88} ${sz*(.5-m.tail*.004)} ${sz*.82} ${sz*(.35-m.tail*.004)}Q${sz*.78} ${sz*(.28-m.tail*.003)} ${sz*.75} ${sz*(.3-m.tail*.003)}`} stroke={dark2} strokeWidth={sz*.035} fill="none" strokeLinecap="round"/>
      {/* Ears — tall pointed triangles */}
      <polygon points={`${sz*.32},${sz*.24} ${sz*.22},${sz*.02} ${sz*.42},${sz*.14}`} fill={dark2}/>
      <polygon points={`${sz*.68},${sz*.24} ${sz*.58},${sz*.14} ${sz*.78},${sz*.02}`} fill={dark2}/>
      {/* Inner ears */}
      <polygon points={`${sz*.33},${sz*.23} ${sz*.26},${sz*.08} ${sz*.4},${sz*.16}`} fill={inner}/>
      <polygon points={`${sz*.67},${sz*.23} ${sz*.6},${sz*.16} ${sz*.74},${sz*.08}`} fill={inner}/>
      {/* Head — slightly oval, cat-shaped */}
      <ellipse cx={sz*.5} cy={sz*.33} rx={sz*.23} ry={sz*.2} fill={cream}/>
      {/* Dark face mask — prominent Siamese pattern, darker/burnt */}
      <ellipse cx={sz*.5} cy={sz*.36} rx={sz*.16} ry={sz*.11} fill={dark2} opacity="0.45"/>
      {/* Forehead lighter patch */}
      <ellipse cx={sz*.5} cy={sz*.27} rx={sz*.08} ry={sz*.05} fill={cream} opacity="0.6"/>
      {/* Eyes — large almond shaped, bright blue */}
      {m.eyes==="closed"?<>
        <path d={`M${sz*.38} ${sz*.33}Q${sz*.42} ${sz*.35} ${sz*.47} ${sz*.33}`} stroke={dark2} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
        <path d={`M${sz*.53} ${sz*.33}Q${sz*.58} ${sz*.35} ${sz*.62} ${sz*.33}`} stroke={dark2} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      </>:<>
        <ellipse cx={sz*.42} cy={sz*.33+m.brow} rx={sz*.045} ry={eyeH} fill={blue}/>
        <ellipse cx={sz*.58} cy={sz*.33+m.brow} rx={sz*.045} ry={eyeH} fill={blue}/>
        {/* Pupils — vertical slit like a real cat */}
        <ellipse cx={sz*.42} cy={sz*.33+m.brow} rx={sz*.015} ry={eyeH*.7} fill={dark2}/>
        <ellipse cx={sz*.58} cy={sz*.33+m.brow} rx={sz*.015} ry={eyeH*.7} fill={dark2}/>
        {/* Eye shine */}
        <circle cx={sz*.44} cy={sz*.31+m.brow} r={sz*.01} fill="white" opacity="0.8"/>
        <circle cx={sz*.6} cy={sz*.31+m.brow} r={sz*.01} fill="white" opacity="0.8"/>
      </>}
      {/* Nose — small triangle */}
      <path d={`M${sz*.5} ${sz*.39}L${sz*.48} ${sz*.42}L${sz*.52} ${sz*.42}Z`} fill={pink}/>
      {/* Mouth */}
      <path d={m.mouth} stroke={dark2} strokeWidth={sz*.012} fill="none" strokeLinecap="round"/>
      {/* Whiskers — longer, thinner */}
      <line x1={sz*.2} y1={sz*.38} x2={sz*.38} y2={sz*.4} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      <line x1={sz*.18} y1={sz*.42} x2={sz*.38} y2={sz*.42} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      <line x1={sz*.22} y1={sz*.46} x2={sz*.38} y2={sz*.44} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      <line x1={sz*.62} y1={sz*.4} x2={sz*.8} y2={sz*.38} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      <line x1={sz*.62} y1={sz*.42} x2={sz*.82} y2={sz*.42} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      <line x1={sz*.62} y1={sz*.44} x2={sz*.78} y2={sz*.46} stroke={mid} strokeWidth={0.6} opacity="0.35"/>
      {/* Body — sleek, elongated cat shape */}
      <ellipse cx={sz*.5} cy={sz*.6} rx={sz*.2} ry={sz*.17} fill={cream}/>
      {/* Dark body shading — burnt Siamese coloring on body too */}
      <ellipse cx={sz*.5} cy={sz*.62} rx={sz*.15} ry={sz*.12} fill={mid} opacity="0.15"/>
      {/* Front legs/paws — dark */}
      <rect x={sz*.38} y={sz*.7} width={sz*.06} height={sz*.14} rx={sz*.03} fill={dark2}/>
      <rect x={sz*.56} y={sz*.7} width={sz*.06} height={sz*.14} rx={sz*.03} fill={dark2}/>
      {/* Paw pads */}
      <ellipse cx={sz*.41} cy={sz*.84} rx={sz*.04} ry={sz*.025} fill={dark2}/>
      <ellipse cx={sz*.59} cy={sz*.84} rx={sz*.04} ry={sz*.025} fill={dark2}/>
      {/* Thobe collar when celebrating */}
      {mood==="celebrate"&&<>
        <path d={`M${sz*.35} ${sz*.48}Q${sz*.5} ${sz*.52} ${sz*.65} ${sz*.48}`} stroke="#D4A84B" strokeWidth={1.5} fill="none"/>
        <circle cx={sz*.5} cy={sz*.505} r={sz*.012} fill="#D4A84B"/>
      </>}
    </svg>
    {msg&&<div style={{background:"rgba(61,36,24,0.08)",borderRadius:12,padding:"6px 12px",maxWidth:sz*2.2}}>
      <p style={{fontSize:Math.max(11,sz*.14),color:"#3D2418",margin:0,textAlign:"center",fontWeight:600,lineHeight:1.3}}>{msg}</p>
    </div>}
  </div>);
}

// Word categories - extracted directly from vocab tables
const WORD_CATS={
  urdu:["Greetings & Basics","People & Family","Love & Emotions","Food & Drink","Home & Daily Life","Descriptive Words","Slang & Casual"],
  tagalog:["Greetings & Basics","People & Family","Love & Emotions","Food & Drink","Home & Daily Life","Descriptive Words","Slang & Casual"],
  arabic:["Religious Terms","Prayer & Worship","Quran & Knowledge","Calendar & Events","Daily Arabic","Character & Values"]
};
function wordCat(lang,w){return w.cat||"General";}
const S={black:"#121212",card:"#181818",pill:"#1F1F1F",green:"#1DB954",white:"#FAFAFA",sub:"#9A9A9A",muted:"#555",faint:"#252525",bar:"#383838",rose:"#E8115B",gold:"#C9A84C",purple:"#8D67AB",blue:"#4B9CD3",teal:"#1ED760"};
const WL={bg:"#FDFAF5",card:"#FFFFFF",cardAlt:"#F5F0E8",forest:"#1A3D34",accent:"#C9A067",text:"#1A3D34",textMuted:"#8A9B94",border:"#E5DDD2",cream:"#F2EDE4",error:"#D94F4F",success:"#3D9B5A"};
const WD={bg:"#121212",card:"#181818",cardAlt:"#1E1E1E",forest:"#A8D5BA",accent:"#C9A067",text:"#E5E5E5",textMuted:"#707070",border:"#222",cream:"#1A3D34",error:"#D94F4F",success:"#3D9B5A"};
const useW=()=>{const d=useDark();return d?WD:WL;};

const CSS=`*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{height:100%;width:100%;overflow:hidden;font-family:'Inter',-apple-system,BlinkMacSystemFont,'SF Pro Display',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;letter-spacing:-0.011em}input,textarea,button{font-family:inherit;letter-spacing:inherit}::-webkit-scrollbar{width:0;display:none}*{scrollbar-width:none}@supports(height:100dvh){.dc-shell{height:100dvh!important}}.dc-fade-in{animation:dcFadeIn .3s cubic-bezier(.16,1,.3,1)}.dc-slide-up{animation:dcSlideUp .35s cubic-bezier(.16,1,.3,1)}@keyframes dcFadeIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:scale(1)}}@keyframes dcSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes dcSlideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`;

const LANGS={
urdu:{color:"#E67E22",label:"Urdu",char:"\u0627",sub:"Shah's language",
lessons:[
{id:"u1",title:"The Urdu Alphabet (Part 1)",desc:"Learn the first 19 letters of the Urdu alphabet, their shapes, and sounds.",xp:20,content:[
{title:"How Urdu Works",text:"Urdu is written right-to-left using a modified Arabic script called Nastaliq. It has 39 letters. Most letters change shape depending on where they appear in a word — beginning, middle, or end. Don't panic. You'll learn to recognize the shapes over time. For now, focus on sounds and romanized spelling."},
{title:"Alif to Bay (ا ب)",text:"Alif (ا) — The first letter. Makes an \"ah\" or \"uh\" sound. It's a tall vertical stroke. Think of it as the \"A\" of Urdu. Bay (ب) — Makes a \"b\" sound, just like English. It looks like a boat with one dot under it. Together: اب (Ab) means \"father\" — your first Urdu word from just two letters."},
{title:"Pay, Tay, Ṭay (پ ت ٹ)",text:"Pay (پ) — Makes a \"p\" sound. Looks like Bay but with 3 dots underneath. Tay (ت) — Makes a \"t\" sound (soft, tongue behind teeth). Two dots on top. Ṭay (ٹ) — Makes a hard \"T\" sound (tongue curled back, hits the roof of mouth). This \"retroflex T\" doesn't exist in English. Listen for the difference when Shah speaks."},
{title:"Say, Jeem, Chay (ث ج چ)",text:"Say (ث) — Makes an \"s\" sound (originally \"th\" in Arabic). Three dots on top. Jeem (ج) — Makes a \"j\" sound. Chay (چ) — Makes a \"ch\" sound like \"chair.\" These three are your first group of similar-looking letters with different dot patterns."},
{title:"Hey, Khay, Daal, Ḍaal (ح خ د ڈ)",text:"Hey (ح) — A breathy \"h\" from deep in the throat. Khay (خ) — Like clearing your throat, a guttural \"kh.\" Daal (د) — A soft \"d\" sound. Ḍaal (ڈ) — A hard retroflex \"D\" (tongue curled back). Again, this retroflex sound is uniquely South Asian."},
{title:"Zaal, Ray, Ṛay, Zay, Zhay (ذ ر ڑ ز ژ)",text:"Zaal (ذ) — \"z\" sound. Ray (ر) — Rolling \"r\" sound. Ṛay (ڑ) — A flapped \"R\" unique to Urdu/Hindi, tongue flicks the roof of the mouth. Zay (ز) — Another \"z\" sound. Zhay (ژ) — \"zh\" like the \"s\" in \"measure.\" That's 5 letters in one card — all short, simple shapes."},
{title:"Practice: Sound It Out",text:"Try reading these simple combinations: بابا (baba) = grandfather/old man. پانی (paani) = water. دال (daal) = lentils. چائے (chai) = tea. Don't worry about perfection — just connect the sounds to what you already know from speaking with Shah."},

{title:"Pronunciation Guide: Retroflex Sounds",text:"Urdu has sounds English doesn't. The key ones are retroflex consonants: T (ٹ), D (ڈ), and R (ڑ). Curl your tongue backwards so the underside touches the roof of your mouth, then release. Try saying 'tamaatar' (tomato). English speakers say 't' with tongue behind teeth. Urdu retroflex T hits the palate further back. Ask Shah to say 'paani' vs 'tamaatar' and you'll hear the difference."},
{title:"Memory Trick: Dot Patterns",text:"Many Urdu letters are the same shape with different dots. Bay (ب) = 1 dot below = Below. Pay (پ) = 3 dots below = Plenty below. Tay (ت) = 2 dots above = Two on Top. Say (ث) = 3 dots above = Say has three. The dot pattern IS the letter. Same shape, different dots = different letter. Think of them as families."},
{title:"Mini Conversation: Your First Words",text:"Try with Shah: You: Assalamu alaikum! (Peace be upon you). Shah: Wa alaikum assalam! (And upon you peace). You: Chai? (Tea?). Shah: Haan, chai! (Yes, tea!). Three words and you can greet Shah and ask for tea. Assalamu alaikum is the universal Muslim greeting. Haan means yes."},
{title:"Cultural Context: Why Urdu Matters",text:"About 230 million people speak Urdu worldwide. It's deeply intertwined with poetry — Urdu shayari is one of the richest literary traditions in the world. Poets like Mirza Ghalib, Faiz Ahmed Faiz, and Allama Iqbal are cultural icons. When Shah quotes a couplet, he's drawing from centuries of tradition. Learning Urdu connects you to this."},
{title:"Writing Practice: Core Letters",text:"These 5 letters appear in almost every Urdu word: ا (Alif) a vertical line. ب (Bay) a boat with 1 dot under. م (Meem) like a circle. ن (Noon) like Bay but dot on top. ی (Yay) curves down with 2 dots under. Together: نام (naam) = name. You can trace these shapes with your finger."},],quiz:[
{q:"What direction is Urdu written?",opts:["Right-to-left","Both directions","Top-to-bottom","Diagonal"],ans:0},
{q:"What letter makes the \"ch\" sound?",opts:["A feeling","To sleep","To clean","Chay چ"],ans:3},
{q:"What's special about the Ṭay (ٹ) sound?",opts:["Retroflex — tongue curled back","The k sound","The r sound","The t sound"],ans:0},
{q:"اب means?",opts:["Thank you","Welcome","No","Father"],ans:3},
{q:"How many letters does the Urdu alphabet have?",opts:["39","29","30","114"],ans:0},

{q:"What does بابا (baba) mean?",opts:["Water","Grandfather/old man","Tea","Hello"],ans:1},
{q:"How do you greet someone in Urdu?",opts:["Shukriya","Assalamu alaikum","Khuda hafiz","Theek hai"],ans:1},
{q:"Urdu shares its script with which language?",opts:["Arabic","Hindi","English","Chinese"],ans:0},]},
{id:"u2",title:"The Urdu Alphabet (Part 2)",desc:"Learn the remaining 20 letters and understand letter connections.",xp:20,unlockAfter:"u1",content:[
{title:"Seen, Sheen, Suad, Zuad (س ش ص ض)",text:"Seen (س) — Makes an \"s\" sound, looks like a wavy line with teeth. Sheen (ش) — Makes a \"sh\" sound, same as Seen but with 3 dots above. Suad (ص) — An emphatic \"s\" (heavier, from further back in the mouth). Zuad (ض) — An emphatic \"z.\" The emphatic letters come from Arabic and give Urdu words a deeper, fuller sound."},
{title:"Toy, Zoy, Ain, Ghain (ط ظ ع غ)",text:"Toy (ط) — An emphatic \"t.\" Zoy (ظ) — An emphatic \"z.\" Ain (ع) — This is the letter with NO English equivalent. It's a deep throat sound, like the beginning of \"uh-oh\" but from way back. It's the hardest letter for English speakers. Ghain (غ) — A gargling \"gh\" sound. Shah will appreciate you even attempting Ain correctly."},
{title:"Fay, Qaaf, Kaaf, Gaaf (ف ق ک گ)",text:"Fay (ف) — \"f\" sound, easy. Qaaf (ق) — A deep \"q\" from the back of the throat. Different from Kaaf. Kaaf (ک) — Regular \"k\" sound. Gaaf (گ) — \"g\" as in \"go.\" Fun fact: Gaaf doesn't exist in Arabic. It was added specifically for Urdu and other South Asian languages."},
{title:"Laam, Meem, Noon (ل م ن)",text:"Laam (ل) — \"l\" sound. Meem (م) — \"m\" sound. Noon (ن) — \"n\" sound. These three are the easy ones — they sound exactly like their English counterparts. Bonus: Noon with no dot (ں) is a nasal N, like the \"n\" in French. You'll hear it in words like \"main\" (مَیں) = \"I/me.\""},
{title:"Wow, Hey, Hamza, Yay (و ہ ء ی)",text:"Wow (و) — Makes \"w,\" \"v,\" \"oo,\" or \"o\" sound depending on position. Very versatile. Hey (ہ) — Breathy \"h\" sound. Hamza (ء) — A glottal stop (like the pause in \"uh-oh\"). Yay (ی) — Makes \"y\" or \"ee\" sound. These are the final four. You now know all 39 letters."},
{title:"How Letters Connect",text:"Most Urdu letters connect to the next letter in a word, which changes their shape. Some letters (like Alif, Daal, Ray, Wow) only connect to the letter before them but NOT the letter after. This is why Urdu words look like flowing connected script rather than individual letters. Reading takes practice, but the pattern becomes clear with exposure."},
{title:"Practice: Common Words",text:"Now you can decode: نام (naam) = name. دل (dil) = heart. گھر (ghar) = home. محبت (mohabbat) = love. شکریہ (shukriya) = thank you. These all use the letters you just learned. You're reading Urdu."},

{title:"The Hardest Sound: Ain",text:"Ain is famously difficult. Say uh-oh and feel that catch in your throat between uh and oh? Thats a glottal stop. Ain is similar but deeper. Open your mouth wide and make an aaa sound from deep in your THROAT, not your mouth. Try ilm (knowledge) with the initial vowel from deep in your throat. Even native speakers pronounce Ain differently by region."},
{title:"Letter Groups: The Family System",text:"Urdu letters come in families — same basic shape, different dots: Family 1: ب پ ت ٹ ث (boat-shaped). Family 2: ج چ ح خ (hook-shaped). Family 3: د ڈ ذ (short curves). Family 4: ر ڑ ز ژ (tails). Family 5: س ش (teeth shapes). Learning 8-10 shapes is much easier than 39 individual letters."},
{title:"Common Word Patterns",text:"Decode real words: محبت (mohabbat) = love. دوست (dost) = friend. خوبصورت (khoobsurat) = beautiful. زندگی (zindagi) = life. Notice how each letter maps to a sound you know. Reading Urdu is just connecting these sounds together."},
{title:"Nastaliq vs Naskh",text:"Urdu uses Nastaliq — letters flow diagonally from upper-right to lower-left, giving it an elegant calligraphic look. Arabic uses Naskh — more horizontal. On phones you often see Naskh (easier to render digitally), but books and newspapers in Pakistan use Nastaliq. This is why Urdu looks slanted compared to Arabic."},
{title:"Word Building Exercise",text:"Build words: ن + ا + م = نام (naam) = name. د + ل = دل (dil) = heart. گ + ھ + ر = گھر (ghar) = home. پ + ا + ک = پاک (paak) = pure/clean — where Pakistan comes from (Land of the Pure). ش + ک + ر + ی + ہ = شکریہ (shukriya) = thank you."},],quiz:[
{q:"Which letter has no English equivalent?",opts:["Ain ع","Alif ا","Wow و","Yay ی"],ans:0},
{q:"Gaaf (گ) was added for which languages?",opts:["English","Spanish","South Asian / Urdu","Arabic"],ans:2},
{q:"What does ں represent?",opts:["Nasal N","Alif ا","Kaaf ک","Daal د"],ans:0},
{q:"Which letters only connect to the previous letter?",opts:["Sheen ش","Alif, Daal, Ray, Wow","Seen س","Pay پ"],ans:1},
{q:"نام means?",opts:["How are you","Name","Thank you","Excuse me"],ans:1},

{q:"What is Nastaliq?",opts:["A font","Diagonal flowing script style","A greeting","A food"],ans:1},
{q:"What does دل (dil) mean?",opts:["Home","Name","Heart","Life"],ans:2},
{q:"Pakistan comes from پاک meaning?",opts:["Pure","Great","Land","River"],ans:0},]},
{id:"u3",title:"Numbers 0-100",desc:"Count in Urdu, recognize number words, use them in daily life.",xp:20,unlockAfter:"u2",content:[
{title:"0 to 10",text:"0 = sifr (صفر). 1 = aik (ایک). 2 = do (دو). 3 = teen (تین). 4 = chaar (چار). 5 = paanch (پانچ). 6 = chay (چھ — NOT like chai). 7 = saat (سات). 8 = aath (آٹھ). 9 = nau (نَو). 10 = das (دس). Practice: Count Shah's nihari ingredients — \"aik kilo gosht\" (1 kilo meat)."},
{title:"11 to 20",text:"11 = gyarah. 12 = baarah. 13 = terah. 14 = chaudah. 15 = pandrah. 16 = solah. 17 = satrah. 18 = athaarah. 19 = unees. 20 = bees. Unlike English where teens follow a pattern, Urdu numbers 11-20 are each unique words. Memorize them as a set."},
{title:"Tens: 20 to 100",text:"20 = bees. 30 = tees. 40 = chaalees. 50 = pachaas. 60 = saath. 70 = sattar. 80 = assi. 90 = nabbe. 100 = sau (سَو). Pattern: 20 and 30 rhyme (bees/tees). After that each ten is its own word. Sau (100) is important — \"sau baar shukriya\" means \"thank you a hundred times.\""},
{title:"In-Between Numbers",text:"For 21-99, Urdu puts the ones digit first, then the tens. 21 = ikkees (not \"bees aik\"). 25 = pachchees. 32 = battees. 45 = paintaalees. 58 = athaawen. Each compound number has its own pronunciation. You won't memorize them all now, but recognizing the pattern is enough. Use \"aur\" (and) if you forget: \"paanch aur bees\" = 25."},
{title:"Numbers in Daily Life",text:"Phone numbers are read digit by digit: \"paanch, teen, saat, nau...\" Money uses numbers constantly: \"do sau rupay\" = 200 rupees. Time: \"teen baj gaye\" = it's 3 o'clock. Age: \"meri umar sattaees saal hai\" = my age is 27 years. At a desi grocery, you'll hear \"paanch kilo\" (5 kilos) or \"ek dozen\" (borrowed from English)."},
{title:"Urdu Number Script",text:"Urdu can also use its own numerals instead of 0-9: ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹. You'll see these on Pakistani currency, sign boards, and religious texts. Shah's parents might use them. The shapes are different from Arabic numerals but follow the same 0-9 system. Recognizing them is a bonus skill."},

{title:"Counting Like a Native",text:"Numbers 1-10: aik, do, teen, chaar, paanch, chhe, saat, aath, nau, das. The rhythm matters — Pakistanis count with a musical bounce. Practice counting while tapping fingers. Shah probably counts this way when cooking."},
{title:"Number Patterns: 11-100",text:"11-19: gyaarah, baarah, terah, chaudah, pandrah, solah, satrah, aathaarah, unees. Decades: bees (20), tees (30), chaalees (40), pachaas (50), saath (60), sattar (70), assi (80), nabbe (90), sau (100). 50+ dont follow obvious patterns — memorize them like phone numbers."},
{title:"Numbers in Real Life",text:"Youll hear: Do chai lao (Bring 2 teas). Kitne ka hai? (How much?) → Teen sau rupay (300 rupees). Paanch minute (5 minutes — in desi time this means 15-30 min). Aath baje (At 8 oclock). Try saying your phone number in Urdu."},
{title:"The Desi Number System",text:"South Asians group large numbers differently: 1,00,000 = 1 Lakh (not 100,000). 1,00,00,000 = 1 Crore (not 10 million). So das lakh = 1 million. This system is used across Pakistan, India, Bangladesh, Nepal, and Sri Lanka."},
{title:"Practice: Haggling",text:"Role play at a bazaar: Shopkeeper: Yeh paanch sau ka hai (This is 500). You: Bahut zyada! Teen sau? (Too much! 300?). Shopkeeper: Chaar sau, final (400, final). You: Theek hai (OK). Key phrases: bahut zyada = too much, theek hai = OK, kitne ka = how much."},],quiz:[
{q:"What is 7 in Urdu?",opts:["12","saat","A food item","Something different"],ans:1},
{q:"What is 50 in Urdu?",opts:["pachaas","nau","tees","teen"],ans:0},
{q:"How are compound numbers structured?",opts:["tees","Ones first, then tens","sau","paanch"],ans:1},
{q:"\"Sau\" means?",opts:["Something different","A food item","Sad","100"],ans:3},
{q:"How are phone numbers read?",opts:["Digit by digit","bees","gyarah","nau"],ans:0},
{q:"What does \"do sau rupay\" mean?",opts:["The opposite","To cook","200 rupees","To pray"],ans:2},

{q:"How do you say 50 in Urdu?",opts:["Chaalees","Pachaas","Saath","Tees"],ans:1},
{q:"1 Lakh equals?",opts:["10,000","100,000","1,000,000","10"],ans:1},
{q:"Kitne ka hai means?",opts:["How are you?","How much?","Where is it?","Who?"],ans:1},]},
{id:"u4",title:"Essential Phrases for Every Day",desc:"Navigate daily conversations with must-know expressions.",xp:20,unlockAfter:"u3",content:[
{title:"Please and Thank You",text:"Shukriya (shook-REE-yah) = thank you. Bohot shukriya = thank you very much. Meherbani (meh-her-BAH-nee) = kindness/please, used formally. In casual speech, Urdu doesn't use \"please\" as much as English — the politeness is built into the verb form instead. But \"shukriya\" after everything is always welcome."},
{title:"Sorry and Excuse Me",text:"Maaf kijiye (MAHF kee-jee-YAY) = excuse me / I'm sorry (formal). Maafi (mah-FEE) = forgiveness. \"Mujhe maaf karo\" = forgive me (casual). If you bump into someone: \"maaf kijiye.\" If you're genuinely sorry: \"mujhe bohot afsos hai\" (I have a lot of regret). Afsos is a heavy word — only use for real apologies."},
{title:"I Don't Understand",text:"Mujhe samajh nahi aaya (MOO-jay SAH-maj nah-HEE AH-yah) = I didn't understand. Shorter version: \"samajh nahi aayi.\" Thora thora samajh aata hai = I understand a little bit. Kya aap English bol sakte hain? = Can you speak English? These are your survival phrases when you're lost in conversation."},
{title:"Where, When, How Much",text:"Kahan (kah-HAHN) = where. Kab (KUB) = when. Kitna/Kitne (kit-NAH/kit-NAY) = how much/how many. Kyun (kee-YOON) = why. Kaun (KOWN) = who. Kaise (KAY-say) = how. These question words are the foundation of asking anything: \"Ye kitne ka hai?\" = How much is this? \"Tum kab aaoge?\" = When will you come?"},
{title:"Time Expressions",text:"Aaj (AHJ) = today. Kal (KUL) = tomorrow AND yesterday (same word, context tells you which). Parso = day after tomorrow / day before yesterday. Abhi (AH-bee) = right now. Baad mein (BAHD mayn) = later. Jaldi (JUL-dee) = quickly/soon. Desi time warning: when someone says \"abhi aata hoon\" (coming right now), add 30 minutes minimum."},
{title:"Agreement and Disagreement",text:"Haan (HAHN) = yes. Nahi (nah-HEE) = no. Ji haan = respectful yes. Ji nahi = respectful no. Bilkul (bil-KOOL) = absolutely. Theek hai (TEEK hay) = okay/fine. Zaroor (zah-ROOR) = definitely/of course. Shaayad (SHAH-yud) = maybe. \"Chalo theek hai\" = okay let's go with it — you'll use this one constantly."},

{title:"The Music of Urdu Phrases",text:"Urdu has natural melody. Greetings rise and fall: As-sa-LAA-mu a-LAI-kum — stress on LAA and LAI. Shu-KRI-ya — stress on KRI. Kya HAAL hai? — stress on HAAL. Mimicking this rhythm makes you sound more natural than getting every consonant perfect."},
{title:"The Respect System: Tum vs Aap",text:"Tum = informal you (friends, younger people). Aap = formal you (elders, strangers, respect). ALWAYS use Aap with Shahs parents, older relatives, anyone youve just met. Using tum with an elder is rude. With Shah you can use tum since youre partners."},
{title:"Essential Daily Phrases",text:"Morning: Subah bakhair (Good morning). Naashta ho gaya? (Had breakfast?). Chai banaaun? (Should I make tea?). Main jaa raha hoon (Im leaving). Allah hafiz (Goodbye). Evening: Ghar aa gaye? (Youre home?). Khaana kha liya? (Have you eaten?). Neend aa rahi hai (Im sleepy)."},
{title:"Urdus Hindi Connection",text:"Urdu and Hindi are mutually intelligible in everyday speech. The difference is mainly formal vocabulary (Urdu borrows from Persian/Arabic, Hindi from Sanskrit) and script. By learning Urdu youre also learning to understand Hindi movies, songs, and 600+ million speakers across South Asia."},
{title:"Sentence Structure: SOV",text:"Urdu is Subject-Object-Verb: English I eat food → Urdu Main khaana khaata hoon (I food eat). She speaks Urdu → Woh Urdu bolti hai (She Urdu speaks). We go home → Hum ghar jaate hain (We home go). The verb always goes at the end."},],quiz:[
{q:"How do you say \"I didn't understand\"?",opts:["Hello","To clean","Mujhe samajh nahi aaya","To run"],ans:2},
{q:"\"Kal\" can mean?",opts:["A food item","Thank you","A greeting","Both tomorrow AND yesterday"],ans:3},
{q:"\"Kitna\" means?",opts:["How much","To clean","To cook","Happy"],ans:0},
{q:"What does \"bilkul\" mean?",opts:["To cook","Absolutely","Welcome","Good morning"],ans:1},
{q:"\"Maaf kijiye\" is used for?",opts:["A place","The opposite","Excuse me / Sorry — formal","An action"],ans:2},
{q:"When someone says \"abhi aata hoon,\" you should?",opts:["Expect them in 30+ minutes","To sing","To write","To speak"],ans:0},

{q:"Urdu sentence structure is?",opts:["SVO","SOV","VSO","OVS"],ans:1},
{q:"When do you use Aap?",opts:["With friends","With pets","With elders","With children"],ans:2},
{q:"Main hoon na means?",opts:["I am hungry","I am here for you","I am going","I am fine"],ans:1},]},
{id:"u5",title:"Emotions and Feelings",desc:"Express how you feel and understand emotional expressions.",xp:20,unlockAfter:"u4",content:[
{title:"Happy and Sad",text:"Khush (KHOOSH) = happy. Khushi = happiness. \"Main bohot khush hoon\" = I am very happy. Udaas (oo-DAHS) = sad. \"Dil udaas hai\" = the heart is sad (poetic way to say I'm down). Rona (ROH-nah) = to cry. Muskurana (mus-koo-RAH-nah) = to smile. Desi culture note: men don't usually express sadness openly. If Shah says \"kuch nahi\" (nothing) when he's clearly upset, just be there."},
{title:"Anger and Frustration",text:"Gussa (GUS-sah) = anger. \"Mujhe gussa aa raha hai\" = I'm getting angry. Naraz (nah-RAHZ) = upset/offended, softer than gussa. \"Tum mujhse naraz ho?\" = Are you upset with me? Pareshaan (pah-ray-SHAHN) = worried/stressed. Tang (TAHNG) = annoyed/fed up. \"Mujhe tang mat karo\" = Don't annoy me. Know the difference between gussa (hot anger) and naraz (cold hurt feelings)."},
{title:"Love and Affection Beyond Romance",text:"Izzat (IZ-zut) = respect/honor. Huge in desi culture. Khayal (KHAH-yaal) = thought/care. \"Mera khayal rakho\" = take care of me / keep me in your thoughts. Fikr (FIK-er) = concern/worry about someone. \"Mujhe tumhari fikr hoti hai\" = I worry about you. Dua = prayer/blessing. \"Meri duaein tumhare saath hain\" = my prayers are with you."},
{title:"Surprise and Excitement",text:"Hairaan (hay-RAHN) = surprised/amazed. \"Main hairaan hoon\" = I'm amazed. Kamaal (kah-MAHL) = amazing/wonderful. \"Kamaal hai!\" = That's amazing! Josh (JOHSH) = excitement/enthusiasm. Waah! = Wow! (used constantly). \"Kya baat hai!\" (kee-YAH BAHT hay) = What a thing! — used to express being impressed. You'll hear Shah's family say \"waah waah\" when food is good."},
{title:"Comfort and Care",text:"Fikar mat karo (FIK-er mutt KAH-roh) = Don't worry. Sab theek ho jayega = Everything will be okay. \"Main hoon na\" = I'm here (literally \"I am, right?\") — this is what Shah says when he wants to reassure you. \"Apna khayal rakhna\" = Take care of yourself. \"Dil se\" = from the heart — when something is genuine and sincere."},

{title:"Expressing Emotions with Tone",text:"In Urdu HOW you say something matters: Acha flat = OK. Achaaaa? rising = Really? ACHA! sharp = I see! acha acha repeated = OK OK (dismissive). Similarly Haan (yes) can be enthusiastic, reluctant, or sarcastic. Shah probably uses acha 50 times a day with different meanings."},
{title:"The Feeling Vocabulary",text:"Core emotions: Khushi (happiness), Gham/Dukh (sadness), Gussa (anger), Dar (fear), Pyaar (love), Hairat (surprise), Sharam (shame/shyness), Fiqr (worry), Umeed (hope), Mayoosi (disappointment). Desi culture expresses emotions through care — khaana kha lo (eat food) is how a Pakistani mom says I love you."},
{title:"How to Check In",text:"Kya haal hai? = How are you? Tabiyat theek hai? = Are you feeling OK? Kuch pareshaan lag rahe ho = You seem worried. Koi baat nahi = No worries. Sab theek ho jaayega = Everything will be OK. Main hoon na = Im here for you — this is a powerful phrase in Urdu relationships."},],quiz:[
{q:"\"Naraz\" vs \"Gussa\" — which is softer?",opts:["Naraz","Sorry","To pray","Welcome"],ans:0},
{q:"\"Kya baat hai!\" expresses?",opts:["Being impressed","Bored","Tired","Confused"],ans:0},
{q:"\"Main hoon na\" means?",opts:["Nervous","Scared","I'm here for you","To speak"],ans:2},
{q:"What does Izzat mean?",opts:["Excited","Grateful","Happy","Respect/honor"],ans:3},
{q:"\"Fikar mat karo\" means?",opts:["Don't worry","Scared","To run","A greeting"],ans:0},
]},
{id:"u6",title:"Compliments and Sweet Talk",desc:"Know how to compliment and flatter in Urdu.",xp:20,unlockAfter:"u5",content:[
{title:"Physical Compliments",text:"Khoobsurat (KHOOB-soo-rut) = beautiful (for anything). Haseen (hah-SEEN) = gorgeous (more poetic). Sundar (SOON-dar) = pretty (Hindi influence). \"Bohot khoobsurat lag rahi ho\" = You look very beautiful. \"Aaj tum bohat pyari lag rahi ho\" = You look really lovely today. The \"rahi ho\" ending is feminine."},
{title:"Personality Compliments",text:"Samajhdar (sah-MAHJ-dar) = wise/understanding. Dilchasp (dil-CHAHSP) = interesting. \"Tum bohot acchi ho\" = You're really good/nice (feminine). Shareef (shah-REEF) = decent/noble. \"Tum mein aik alag baat hai\" = There's something different about you — classic desi compliment line."},
{title:"Praising Skills and Effort",text:"Zabardast (zah-bar-DUST) = fantastic/powerful. Shandar (SHAHN-dar) = magnificent. Lajawab (lah-jah-WAHB) = speechless/matchless. \"Khana lajawab tha!\" = The food was matchless! \"Tum zabardast ho\" = You're amazing. Use lajawab for food and shandar for events/occasions."},
{title:"Responses to Compliments",text:"Shukriya = thank you (simple). \"Aap bhi\" = you too. \"Nahi nahi\" = no no (the classic desi deflection of compliments — everyone does it even when they're pleased). \"Allah ka shukar hai\" = Thanks to God — the humble religious response. In desi culture, accepting a compliment directly is seen as slightly arrogant, so deflection is normal. If Shah's mom compliments you, smile and deflect graciously."},
{title:"Flirting in Urdu",text:"\"Tumhari ankhon mein kho gaya/gayi\" = I got lost in your eyes (m/f). \"Tum mere liye sab kuch ho\" = You are everything to me. \"Dil dhadakta hai tumhare liye\" = My heart beats for you. \"Bohot yaad aati ho\" = I miss you so much. Fair warning: using these on Shah will either make him melt or laugh uncontrollably. Both are wins."},
],quiz:[
{q:"\"Lajawab\" means?",opts:["To sing","Speechless/matchless","An action","To dance"],ans:1},
{q:"Best word to compliment food?",opts:["Tea","Rice","Lajawab or Zabardast","Bread"],ans:2},
{q:"Why do desis deflect compliments?",opts:["Jealous","Happy","Proud","Accepting directly seems arrogant"],ans:3},
{q:"\"Khoobsurat\" means?",opts:["Scared","Beautiful","A person","Sad"],ans:1},
{q:"\"Tumhari ankhon mein kho gaya\" means?",opts:["Got lost in your eyes","Excited","To dance","Bored"],ans:0},
]},
{id:"u7",title:"Around the House",desc:"Household items, rooms, and domestic vocabulary.",xp:20,unlockAfter:"u6",content:[
{title:"Rooms of the House",text:"Ghar (GHER) = home/house. Kamra (KAHM-rah) = room. Baithak (BAY-thuk) = living room / sitting room. Rasoi (rah-SOH-ee) = kitchen. Ghusal Khana (ghoo-SUL KHAH-nah) = bathroom. Soney ka kamra = bedroom (literally \"sleeping room\"). Chhat (CHUHT) = roof/terrace — in South Asia, the rooftop is a social hangout spot, especially in summer."},
{title:"Furniture and Items",text:"Kursi (KOOR-see) = chair. Mez (MAYZ) = table. Bistar (bis-TAR) = bed/bedding. Almari (al-MAH-ree) = wardrobe/closet. Aaina (ah-EE-nah) = mirror. Taaliyaan (tah-lee-YAHN) = shelves. Pankha (PUN-khah) = fan. In desi homes, the \"drawing room\" (living room for guests) is always kept immaculate. The family hangs out in a different room."},
{title:"Kitchen Items",text:"Bartan (BAR-tun) = dishes/utensils. Degchi (DEG-chee) = cooking pot. Karahi (kah-RAH-hee) = wok (where \"karahi chicken\" gets its name). Chamach (chah-MUCH) = spoon. Churi (CHOO-ree) = knife. Gilaas (gee-LAHS) = glass (for drinking). Plate (PLAYT) = yes, it's the English word, used as-is. Urdu borrows many everyday words from English."},
{title:"Household Actions",text:"Saaf karna (SAHF KAR-nah) = to clean. Dhona (DHO-nah) = to wash. Jhaaṛu lagana (JHAH-roo lah-GAH-nah) = to sweep. Kapṛay dhona = to wash clothes. Khana banana = to make food (remember, banana = to make, not the fruit). \"Kamra saaf karo\" = clean the room. \"Bartan dho do\" = wash the dishes."},
{title:"Coming and Going",text:"Andar (AHN-dar) = inside. Baahar (BAH-har) = outside. Upar (OO-par) = upstairs/above. Neeche (NEE-chay) = downstairs/below. \"Andar aao\" = come inside. \"Baahar jao\" = go outside. \"Darwaza kholo\" = open the door. \"Darwaza band karo\" = close the door. Darwaza (dar-WAH-zah) = door. Khidki (KHID-kee) = window."},
],quiz:[
{q:"\"Ghar\" means?",opts:["An action","Angry","Scared","Home/house"],ans:3},
{q:"What is a \"karahi\"?",opts:["A wok","Something different","An action","A food item"],ans:0},
{q:"\"Saaf karna\" means?",opts:["To eat","To write","Scared","To clean"],ans:3},
{q:"\"Andar aao\" means?",opts:["A greeting","A person","Happy","Come inside"],ans:3},
{q:"What is the \"drawing room\" in desi culture?",opts:["Living room kept for guests","A food item","36","A feeling"],ans:0},
]},
{id:"u8",title:"Shopping and Money",desc:"Navigate stores, bargain, and talk about money.",xp:20,unlockAfter:"u7",content:[
{title:"Money Basics",text:"Paisa (PAY-sah) = money (general). Rupay (roo-PAY) = rupees (Pakistani currency). Qeemat (kee-MUHT) = price. Mehnga (MAYN-gah) = expensive. Sasta (SUS-tah) = cheap. \"Ye bohot mehnga hai\" = This is very expensive (your opening move in bargaining). \"Thora kam karo\" = reduce it a little."},
{title:"At the Store",text:"Dukaan (doo-KAHN) = shop. Bazaar (bah-ZAHR) = market. \"Ye dikhao\" = show me this. \"Aur dikhao\" = show me more. \"Pack kar do\" = pack it up. \"Bill kitna hua?\" = What's the bill? \"Rakhiye\" (ruh-KHEE-yay) = keep it (politely declining). At desi stores, touching and examining items before buying is expected and normal."},
{title:"Bargaining Culture",text:"Bargaining (mol tol) is expected at most desi markets and street shops. Never pay the first price. Start at 50-60% of what they ask. \"Yaar bohot mehnga hai, thora kam karo\" = Friend, it's too expensive, bring it down. \"Pehle waali qeemat batao\" = tell me the real price. If they won't budge, start walking away. They'll usually call you back with a lower price."},
{title:"Clothing Shopping",text:"Kapṛay (KUP-ṛay) = clothes. Jora (JOH-rah) = suit/outfit (a matched set). Dupatta (doo-PUT-tah) = scarf/shawl. Shalwar Kameez = the traditional outfit (loose pants + tunic). Chhota (CHO-tah) = small. Baṛa (BAH-rah) = big. \"Ye meri size mein hai?\" = Is this in my size? \"Aur rang dikhao\" = show me more colors. Rang = color."},
{title:"Grocery Shopping",text:"Sabzi (SUB-zee) = vegetables. Phal (PHUL) = fruit. Gosht (GOSHT) = meat. Murgi (MOOR-ghee) = chicken. Machli (MUCH-lee) = fish. Anda (UN-dah) = egg. \"Aik kilo gosht dena\" = give me one kilo of meat. \"Ye taaza hai?\" = Is this fresh? Taaza = fresh. In desi grocery stores, you pick the item and they weigh it in front of you."},
],quiz:[
{q:"What is the opening move in bargaining?",opts:["36","100","An action","\"Ye bohot mehnga hai\""],ans:3},
{q:"\"Sasta\" means?",opts:["A feeling","A food item","Cheap","To eat"],ans:2},
{q:"What is \"Shalwar Kameez\"?",opts:["A feeling","A food item","A greeting","Traditional outfit — loose pants + tunic"],ans:3},
{q:"\"Ye taaza hai?\" means?",opts:["Is this fresh?","A greeting","Something different","Nervous"],ans:0},
{q:"What should you do if a vendor won't lower the price?",opts:["Walk away — they'll call you back","Maaf kijiye","Shukriya","Achha"],ans:0},
]},
{id:"u9",title:"Getting Around",desc:"Directions, transportation, and navigating places.",xp:25,unlockAfter:"u8",content:[
{title:"Directions",text:"Seedha (SEE-dhah) = straight. Daayein (DAH-yayn) = right. Baayein (BAH-yayn) = left. Aagay (AH-gay) = ahead/forward. Peechay (PEE-chay) = behind/back. Qareeb (kah-REEB) = nearby. Door (DOOR) = far. \"Seedha jao, phir daayein mudo\" = go straight, then turn right."},
{title:"Transportation",text:"Gaari (GAH-ree) = car (also used generically for vehicle). Bus = bus (same word). Riksha (RIK-shah) = rickshaw/auto. Train = train. Hawai Jahaz (hah-WAH-ee jah-HAHZ) = airplane. Taxi = taxi. \"Gaari rok do\" = stop the car. \"Kitni door hai?\" = How far is it?"},
{title:"Places in a City",text:"Bazaar = market. Masjid = mosque. Hospital (same word). School (same word). Park (same word). Daftar (DUF-tar) = office. Station = station. \"Bazaar kahan hai?\" = Where is the market? \"Masjid kitni door hai?\" = How far is the mosque? Lots of English loanwords in modern Urdu for buildings and institutions."},
{title:"In a Taxi/Rickshaw",text:"\"Bhai sahab, [location] chalein?\" = Brother, shall we go to [location]? \"Kitna lagega?\" = How much will it cost? \"Meter se chalo\" = go by meter. \"Yahan rok do\" = stop here. \"Wapas aana hai\" = I need to come back. \"Jaldi chalo\" = go quickly. Always agree on a price before getting into a rickshaw without a meter."},
{title:"Asking for Help",text:"\"Maaf kijiye, ye rasta kahan jaata hai?\" = Excuse me, where does this road go? \"Kya aap meri madad kar sakte hain?\" = Can you help me? \"Mujhe [place] jaana hai\" = I need to go to [place]. \"Main kho gaya/gayi hoon\" = I am lost (m/f). In South Asian cities, people are generally very helpful with directions, sometimes walking you there personally."},
],quiz:[
{q:"\"Seedha\" means?",opts:["Tired","To cook","A greeting","Straight"],ans:3},
{q:"\"Gaari\" means?",opts:["To dance","To pray","Car/vehicle","To sleep"],ans:2},
{q:"What do you say before getting in a rickshaw?",opts:["\"Kitna lagega?\" — how much?","Thank you","Sorry","Hello"],ans:0},
{q:"\"Main kho gayi hoon\" means?",opts:["I am lost — female","Bored","A place","To dance"],ans:0},
{q:"\"Daayein\" means?",opts:["Angry","Right","Surprised","A feeling"],ans:1},
]},
{id:"u10",title:"Desi Slang and Casual Talk",desc:"Sound natural with slang, fillers, and casual expressions Shah actually uses.",xp:25,unlockAfter:"u9",content:[
{title:"The Everyday Fillers",text:"Yaar (YAHR) = friend/dude — used constantly between friends. \"Yaar, sun na\" = dude, listen. Achha (ACH-chah) = okay/good/really? — depends on tone. Rising tone = \"really?\" Flat tone = \"okay.\" Bas (BUS) = enough/that's it. \"Bus yaar, bohot ho gaya\" = enough dude, that's too much."},
{title:"Expressing Disbelief",text:"Kya baat kar rahe/rahi ho = What are you talking about (m/f). \"Hain?!\" (HAYN) = Huh?!/What?! — the classic desi shock expression. \"Sach mein?\" = Really/Seriously? \"Jhoot mat bolo\" = don't lie. \"Pagal hai kya?\" = Are you crazy? (used casually between friends, not actually calling someone insane)."},
{title:"Approval and Hype",text:"Kamaal (kah-MAHL) = amazing. Shandar = magnificent. \"Maza aa gaya!\" = That was so fun/satisfying! \"Kya cheez hai!\" = What a thing! (high praise). \"Fire hai!\" = It's fire! (yes, desi youth use English slang too). \"Sahi hai\" (sah-HEE hay) = that's right / that's cool. \"Jannat hai\" = this is heaven — for food, places, or moments."},
{title:"Annoyance and Frustration (Clean)",text:"\"Chor yaar\" = leave it, man. \"Dimagh mat khao\" = don't eat my brain (don't annoy me — classic Urdu expression). \"Sar pe chadh gaye\" = they've climbed on my head (they're being too much). \"Bohot drama hai\" = too much drama. \"Band karo\" = stop it. \"Chalo chalo\" = let's go let's go (impatient)."},
{title:"Text Speak and Online",text:"Young Pakistanis mix Urdu and English constantly (called \"Urdish\"). Common text abbreviations: \"Kia\" = kya (what). \"Acha\" = achha (okay). \"Kn\" = kaun (who). \"Phr\" = phir (then). \"Agr\" = agar (if). Shah might text \"kia kr rhe ho?\" = what are you doing? Don't stress about spelling — Urdu in Roman letters has no standard spelling."},
{title:"Shah's Probable Catchphrases",text:"Based on common desi guy talk: \"Chal be\" = come on / go on (very casual). \"Kya scene hai?\" = What's the scene/situation? \"Tension na le\" = don't take tension (don't stress). \"Solid hai\" = that's solid/cool. \"Bhool ja\" = forget about it. If Shah uses any of these, now you know exactly what he means."},
],quiz:[
{q:"\"Yaar\" means?",opts:["Friend/dude","To eat","An action","Confused"],ans:0},
{q:"\"Dimagh mat khao\" literally means?",opts:["The opposite","To speak","Don't eat my brain","To write"],ans:2},
{q:"\"Achha\" with rising tone means?",opts:["Really?","A person","To pray","A feeling"],ans:0},
{q:"\"Maza aa gaya\" means?",opts:["That was so fun","The opposite","To cook","To sing"],ans:0},
{q:"What is \"Urdish\"?",opts:["A food item","28","Mixing Urdu and English","55"],ans:2},
{q:"\"Tension na le\" means?",opts:["Nervous","Surprised","Don't stress","To run"],ans:2},
]},
{id:"u11",title:"Bad Words & What NOT to Say",desc:"Understand inappropriate language so you recognize it and know what to avoid.",xp:25,unlockAfter:"u10",content:[
{title:"Why This Lesson Exists",text:"This is not about teaching you to swear. It's about awareness. If you hear these words in Bollywood movies, desi arguments, or even casually among friends, you should know what they mean so you're never caught off guard. Also important: knowing what NOT to say in front of Shah's parents. Ever."},
{title:"Mild Expressions (PG-13)",text:"Kamina/Kamini (kah-MEE-nah/nee) = scoundrel/lowlife (m/f). Bewakoof (bay-wah-KOOF) = idiot/fool. Paagal (PAH-gul) = crazy. Ullu ka patha (OOL-loo kah PUH-thah) = son of an owl (calling someone stupid — owls are considered dumb in desi culture). Gadha (GUH-dhah) = donkey (calling someone a donkey = calling them dumb)."},
{title:"Moderate Expressions (R-Rated)",text:"Haramzada/Haramzadi (hah-RAHM-zah-dah) = literally illegitimate child, used as a strong insult. Kutta/Kutti (KUT-tah) = dog (calling someone a dog is very offensive in South Asian Muslim culture). Badtameez (bad-tah-MEEZ) = ill-mannered/rude — this one parents actually use on their kids. Saala/Saali = brother/sister-in-law but used as a curse word meaning something like jerk."},
{title:"Nuclear Level (NC-17) — Recognize Only",text:"These exist in every language and Urdu is no exception. The most common ones involve mothers and sisters (like many cultures). If you hear \"teri...\" followed by an angry tone and family words, that's the nuclear zone. \"BC\" and \"MC\" are abbreviations you'll see online — they're the most common desi swears in text form. You'll know them when you hear them. Never repeat them in front of elders. Ever."},
{title:"Cultural Insults (Worse Than Swearing)",text:"In desi culture, some things are more offensive than swear words. Insulting someone's mother = fighting words. Calling someone \"besharam\" (shameless) = questioning their honor. Saying someone has \"no izzat\" (no respect/honor) cuts deep. Disrespecting elders in any way. Not removing shoes inside someone's home. These \"insults\" don't have swear words but cause way more damage."},
{title:"The Golden Rules",text:"Never swear in front of anyone's parents, ever. \"Bhai/Baji\" before any criticism softens it. If someone insults you in Urdu, staying calm is the power move. \"Koi baat nahi\" (no worries) in response to an insult completely disarms the situation. And the most important rule: if Shah's mom is present, you are the most polite, refined version of yourself. Save the yaar talk for when you're alone."},
],quiz:[
{q:"\"Bewakoof\" means?",opts:["Confused","Idiot/fool","To run","Tired"],ans:1},
{q:"Why is calling someone a \"kutta\" very offensive?",opts:["A feeling","To run","A place","Dogs are considered unclean in Muslim culture"],ans:3},
{q:"What is more offensive than swear words in desi culture?",opts:["100","A greeting","36","Insulting someone's mother or their honor/izzat"],ans:3},
{q:"\"Koi baat nahi\" means?",opts:["A greeting","Something different","No worries — used to disarm","An action"],ans:2},
{q:"When should you NEVER use casual/bad language?",opts:["In front of elders, especially parents","Korean","English","Hindi"],ans:0},
]},
{id:"u12",title:"Urdu Grammar Basics (Part 1)",desc:"Understand sentence structure, gender, and basic verb forms.",xp:25,unlockAfter:"u11",content:[
{title:"Sentence Structure: SOV",text:"Urdu follows Subject-Object-Verb order, the opposite of English. English: \"I eat food.\" Urdu: \"Main khana khata hoon\" (I food eat). English: \"She reads a book.\" Urdu: \"Woh kitaab parhti hai\" (She book reads). The verb always goes at the end. Once you internalize this flip, Urdu grammar clicks into place."},
{title:"Gender in Urdu",text:"Every noun in Urdu is either masculine or feminine. Most masculine nouns end in \"a\" sound: larka (boy), kamra (room), khana (food). Most feminine nouns end in \"i\" or \"ee\" sound: larki (girl), kursi (chair), roti (bread). Exceptions exist everywhere. Gender matters because it changes the verb ending and adjectives too."},
{title:"Verb Basics: Present Tense",text:"The base verb is called the \"infinitive\" and ends in \"na.\" Khana = to eat. Bolna = to speak. Jana = to go. To conjugate, you drop \"na\" and add endings. Main (I): -ta hoon (m) / -ti hoon (f). Tum (you casual): -te ho (m) / -ti ho (f). Woh (he/she/they): -ta/-ti hai. Example: \"Main bolta hoon\" = I speak (male). \"Main bolti hoon\" = I speak (female)."},
{title:"Pronouns",text:"Main (MAYN) = I/me. Tum = you (casual). Aap = you (respectful). Woh = he/she/they/that. Ye = this. Hum = we. Using \"tum\" vs \"aap\" is important. \"Tum\" is for friends, partners, kids. \"Aap\" is for elders, strangers, showing respect. Using \"tum\" with Shah's parents would be considered disrespectful. Always \"aap\" with elders."},
{title:"Postpositions (Not Prepositions)",text:"English uses prepositions (before the noun): \"in the house.\" Urdu uses postpositions (after the noun): \"ghar mein\" = house in. Ka/Ki/Ke = of (changes with gender). \"Shah ka ghar\" = Shah's house. Mein = in. Par = on. Se = from/with. Ko = to. \"Dukaan se\" = from the shop. \"Mez par\" = on the table."},
{title:"Putting It Together",text:"\"Main ghar mein khana khata hoon\" = I eat food in the house (I / house in / food / eat). \"Dane bazaar se phal lati hai\" = Dane brings fruit from the market (Dane / market from / fruit / brings). See the SOV + postposition pattern? Subject, then location/details with postpositions, then object, then verb last. Practice rearranging English sentences and it'll become natural."},
],quiz:[
{q:"Urdu sentence order is?",opts:["Noun","Pronoun","Adjective","Subject-Object-Verb"],ans:3},
{q:"Most masculine nouns end in?",opts:["The i sound","The u sound","The e sound","The a sound"],ans:3},
{q:"\"Tum\" vs \"Aap\" — which is respectful?",opts:["To sing","To eat","To clean","Aap"],ans:3},
{q:"\"Ghar mein\" means?",opts:["To cook","In the house","The opposite","A person"],ans:1},
{q:"What ending does the infinitive verb have?",opts:["Suffix","-na","Adjective","Pronoun"],ans:1},
{q:"\"Main bolti hoon\" — who is speaking?",opts:["Cousin","A female saying \"I speak\"","A friend","A stranger"],ans:1},
]},
{id:"u13",title:"Urdu Grammar Basics (Part 2)",desc:"Past tense, future tense, asking questions, and negation.",xp:25,unlockAfter:"u12",content:[
{title:"Past Tense",text:"Drop the \"na\" from the infinitive and add \"a/i/e\" based on gender of the SUBJECT. Khana → Khaya (he ate). Khaayi (she ate). Khaaye (they ate / respect). \"Maine khana khaya\" = I ate food (male). \"Maine khana khaya\" = I ate food (also — the \"maine\" form is the same). \"Usne bola\" = he said. \"Usne boli\" = she said."},
{title:"Future Tense",text:"Drop \"na\" and add: -unga/-ungi (I will, m/f). -oge/-ogi (you will, m/f). -ega/-egi (he/she will). \"Main aaunga\" = I will come (male). \"Main aaungi\" = I will come (female). \"Tum kab aaoge?\" = When will you come? \"Woh kal aayegi\" = She will come tomorrow. The future is actually one of the easier tenses in Urdu."},
{title:"Asking Questions",text:"Add \"kya\" at the beginning of any statement to make it a question. \"Tum jaate ho\" = you go. \"Kya tum jaate ho?\" = do you go? Or just raise your tone at the end, like English. Question words always come before the verb: \"Tum kahan jaate ho?\" = Where do you go? \"Ye kya hai?\" = What is this? \"Kaun aaya?\" = Who came?"},
{title:"Negation — Saying No/Not",text:"Add \"nahi\" before the verb. \"Main jaata hoon\" = I go. \"Main nahi jaata\" = I don't go. \"Woh nahi aayi\" = She didn't come. \"Mat\" is used for commands: \"Mat jao!\" = Don't go! \"Mat karo!\" = Don't do it! Nahi = general negation. Mat = commanding someone not to. \"Kabhi nahi\" = never."},
{title:"The \"Wala\" Construction",text:"One of Urdu's most useful tools. Add \"wala/wali/walay\" to nouns to mean \"the one of\" or \"the one who.\" Doodh wala = the milk man. Ghar wali = the woman of the house (wife). Kal wali baat = yesterday's matter. Aglay walay = the next one. \"Us wali\" = that one (feminine). It's like adding \"-er\" or \"the ___ one\" in English but way more flexible."},
{title:"Common Mistakes to Avoid",text:"Gender agreement: Don't say \"achha larki\" (good-masculine girl). It's \"achhi larki\" (good-feminine girl). Tum vs Aap verb forms: \"Aap jaate hain\" (you go — respect), NOT \"Aap jaate ho.\" Forgetting \"ne\" in past tense: \"Maine kiya\" not \"Main kiya\" (I did). Using \"hai\" vs \"hain\": hai = is (singular), hain = are (plural/respect). These mistakes are okay while learning — people will understand you."},
],quiz:[
{q:"\"Main aaungi\" means?",opts:["I will come — said by a female","A person","The opposite","A feeling"],ans:0},
{q:"How do you make a statement into a question?",opts:["Change the verb","Remove the subject","Raise your voice at the end","Add na at the start"],ans:2},
{q:"\"Nahi\" vs \"Mat\" — which is for commands?",opts:["To cook","Mat","A greeting","Sorry"],ans:1},
{q:"\"Doodh wala\" means?",opts:["The milk man","To run","Sad","The opposite"],ans:0},
{q:"\"Kabhi nahi\" means?",opts:["To pray","Tired","Never","A place"],ans:2},
{q:"\"Aap\" takes which verb ending?",opts:["To sleep","Please","hain, not ho","A place"],ans:2},
]},
{id:"u14",title:"Religion and Respect",desc:"Understand Islamic terms and cultural practices you'll encounter.",xp:25,unlockAfter:"u13",content:[
{title:"Core Terms You'll Hear",text:"Allah = God. Nabi/Rasool = Prophet. Quran = Holy Book. Hadith = Sayings of the Prophet. Sunnah = practices of the Prophet. Iman = faith. Deen = religion/way of life. \"Deen mein\" = in the religion. These aren't just vocabulary — they're part of Shah's worldview and daily conversation."},
{title:"The Five Pillars",text:"Shahadah = declaration of faith. Salah = prayer (5 daily). Zakat = charity (2.5% of savings annually). Sawm = fasting (Ramadan). Hajj = pilgrimage to Mecca. You don't need to practice these, but understanding them shows you understand what matters to Shah. Each pillar represents a core value: faith, discipline, generosity, empathy, unity."},
{title:"Common Islamic Phrases in Daily Life",text:"JazakAllah (jah-ZAK-al-lah) = may God reward you (thank you in religious context). BarakAllah (bah-RAK-al-lah) = may God bless. La ilaha illallah = there is no god but God. Wallahi (wah-LAH-hee) = I swear by God (used very casually, like \"I promise\"). \"Tawba\" (TOW-bah) = repentance (often said like \"God forbid\" when hearing something bad)."},
{title:"Mosque Etiquette",text:"Masjid = mosque. Remove shoes before entering. Women and men pray in separate areas. Friday (Jummah) is the most important prayer day. Wudu (washing) is done before prayer. Keep your voice low inside. You don't need to be Muslim to visit — just be respectful, dress modestly, and follow Shah's lead. Many mosques welcome visitors."},
{title:"Navigating Religious Conversations",text:"You will hear \"InshaAllah\" in every future plan. \"MashaAllah\" with every compliment. \"Alhamdulillah\" with every blessing. These are not just phrases, they're a constant awareness of God. You don't need to use them yourself (unless you want to), but acknowledging them — \"that's beautiful\" or \"I love that you do that\" — means everything to someone who practices."},
],quiz:[
{q:"What are the Five Pillars?",opts:["Shahadah, Salah, Zakat, Sawm, Hajj","Dhikr","Hadith","Sunnah"],ans:0},
{q:"\"JazakAllah\" means?",opts:["A feeling","May God reward you","To run","An action"],ans:1},
{q:"What day is Jummah?",opts:["Friday","Dhikr","Tawhid","Dua"],ans:0},
{q:"\"Wallahi\" is used as?",opts:["Sorry","I swear/I promise — casual","Something different","A feeling"],ans:1},
{q:"What should you do when entering a Masjid?",opts:["Sunnah","Iman","Hadith","Remove shoes, be quiet, be respectful"],ans:3},
]},
],
words:[{w:"Assalamu Alaikum",m:"Peace be upon you",cat:"Greetings & Basics"},{w:"Wa Alaikum Assalam",m:"And peace upon you",cat:"Greetings & Basics"},{w:"Shukriya",m:"Thank you",cat:"Greetings & Basics"},{w:"Meherbani",m:"Please/Kindness",cat:"Greetings & Basics"},{w:"Haan",m:"Yes",cat:"Greetings & Basics"},{w:"Ji haan",m:"Yes (respectful)",cat:"Greetings & Basics"},{w:"Nahi",m:"No",cat:"Greetings & Basics"},{w:"Theek hai",m:"Okay/Fine",cat:"Greetings & Basics"},{w:"Achha",m:"Good/Okay/Really?",cat:"Greetings & Basics"},{w:"Bilkul",m:"Absolutely",cat:"Greetings & Basics"},{w:"Zaroor",m:"Definitely",cat:"Greetings & Basics"},{w:"Bas",m:"Enough/Stop",cat:"Greetings & Basics"},{w:"Chalo",m:"Let\'s go",cat:"Greetings & Basics"},{w:"Aao",m:"Come",cat:"Greetings & Basics"},{w:"Jao",m:"Go",cat:"Greetings & Basics"},{w:"Ruko",m:"Wait/Stop",cat:"Greetings & Basics"},{w:"Maaf kijiye",m:"Excuse me/Sorry",cat:"Greetings & Basics"},{w:"Khuda Hafiz",m:"Goodbye",cat:"Greetings & Basics"},{w:"Alvida",m:"Farewell",cat:"Greetings & Basics"},{w:"Ammi",m:"Mother",cat:"People & Family"},{w:"Abbu",m:"Father",cat:"People & Family"},{w:"Bhai",m:"Brother",cat:"People & Family"},{w:"Behan",m:"Sister",cat:"People & Family"},{w:"Baji",m:"Older sister (respectful)",cat:"People & Family"},{w:"Dada",m:"Paternal grandfather",cat:"People & Family"},{w:"Dadi",m:"Paternal grandmother",cat:"People & Family"},{w:"Nana",m:"Maternal grandfather",cat:"People & Family"},{w:"Nani",m:"Maternal grandmother",cat:"People & Family"},{w:"Beta",m:"Son (also used lovingly for any younger person)",cat:"People & Family"},{w:"Beti",m:"Daughter",cat:"People & Family"},{w:"Chacha",m:"Paternal uncle",cat:"People & Family"},{w:"Phuppo",m:"Paternal aunt",cat:"People & Family"},{w:"Mamu",m:"Maternal uncle",cat:"People & Family"},{w:"Khala",m:"Maternal aunt",cat:"People & Family"},{w:"Dost",m:"Friend",cat:"People & Family"},{w:"Rishtedaar",m:"Relative",cat:"People & Family"},{w:"Pyar",m:"Love (casual)",cat:"Love & Emotions"},{w:"Mohabbat",m:"Love (deep/poetic)",cat:"Love & Emotions"},{w:"Jaan",m:"Life/Soul/My love",cat:"Love & Emotions"},{w:"Jaanu",m:"Babe",cat:"Love & Emotions"},{w:"Dil",m:"Heart",cat:"Love & Emotions"},{w:"Khushi",m:"Happiness",cat:"Love & Emotions"},{w:"Udaas",m:"Sad",cat:"Love & Emotions"},{w:"Gussa",m:"Anger",cat:"Love & Emotions"},{w:"Naraz",m:"Upset/Offended",cat:"Love & Emotions"},{w:"Pareshaan",m:"Worried",cat:"Love & Emotions"},{w:"Hairaan",m:"Surprised",cat:"Love & Emotions"},{w:"Izzat",m:"Respect/Honor",cat:"Love & Emotions"},{w:"Fikr",m:"Concern/Worry",cat:"Love & Emotions"},{w:"Yaad",m:"Memory/Missing",cat:"Love & Emotions"},{w:"Dua",m:"Prayer/Blessing",cat:"Love & Emotions"},{w:"Umeed",m:"Hope",cat:"Love & Emotions"},{w:"Vishwaas",m:"Trust",cat:"Love & Emotions"},{w:"Wafa",m:"Loyalty",cat:"Love & Emotions"},{w:"Khana",m:"Food / To eat",cat:"Food & Drink"},{w:"Paani",m:"Water",cat:"Food & Drink"},{w:"Chai",m:"Tea",cat:"Food & Drink"},{w:"Doodh",m:"Milk",cat:"Food & Drink"},{w:"Roti",m:"Flatbread",cat:"Food & Drink"},{w:"Chawal",m:"Rice",cat:"Food & Drink"},{w:"Daal",m:"Lentil curry",cat:"Food & Drink"},{w:"Salan",m:"Curry/Gravy",cat:"Food & Drink"},{w:"Gosht",m:"Meat",cat:"Food & Drink"},{w:"Murgi",m:"Chicken",cat:"Food & Drink"},{w:"Machli",m:"Fish",cat:"Food & Drink"},{w:"Sabzi",m:"Vegetables",cat:"Food & Drink"},{w:"Phal",m:"Fruit",cat:"Food & Drink"},{w:"Anda",m:"Egg",cat:"Food & Drink"},{w:"Masala",m:"Spice mix",cat:"Food & Drink"},{w:"Mirch",m:"Chili",cat:"Food & Drink"},{w:"Namak",m:"Salt",cat:"Food & Drink"},{w:"Cheeni",m:"Sugar",cat:"Food & Drink"},{w:"Ghee",m:"Clarified butter",cat:"Food & Drink"},{w:"Biryani",m:"Spiced rice dish",cat:"Food & Drink"},{w:"Nihari",m:"Slow-cooked stew",cat:"Food & Drink"},{w:"Haleem",m:"Thick meat-lentil dish",cat:"Food & Drink"},{w:"Kebab",m:"Grilled meat",cat:"Food & Drink"},{w:"Naan",m:"Oven-baked bread",cat:"Food & Drink"},{w:"Ghar",m:"Home/House",cat:"Home & Daily Life"},{w:"Kamra",m:"Room",cat:"Home & Daily Life"},{w:"Darwaza",m:"Door",cat:"Home & Daily Life"},{w:"Khidki",m:"Window",cat:"Home & Daily Life"},{w:"Kursi",m:"Chair",cat:"Home & Daily Life"},{w:"Mez",m:"Table",cat:"Home & Daily Life"},{w:"Bistar",m:"Bed",cat:"Home & Daily Life"},{w:"Kapray",m:"Clothes",cat:"Home & Daily Life"},{w:"Joota",m:"Shoe",cat:"Home & Daily Life"},{w:"Paisa",m:"Money",cat:"Home & Daily Life"},{w:"Kaam",m:"Work",cat:"Home & Daily Life"},{w:"Waqt",m:"Time",cat:"Home & Daily Life"},{w:"Din",m:"Day",cat:"Home & Daily Life"},{w:"Raat",m:"Night",cat:"Home & Daily Life"},{w:"Subah",m:"Morning",cat:"Home & Daily Life"},{w:"Shaam",m:"Evening",cat:"Home & Daily Life"},{w:"Aaj",m:"Today",cat:"Home & Daily Life"},{w:"Kal",m:"Tomorrow/Yesterday",cat:"Home & Daily Life"},{w:"Abhi",m:"Right now",cat:"Home & Daily Life"},{w:"Jaldi",m:"Quickly",cat:"Home & Daily Life"},{w:"Acha/Achi",m:"Good (m/f)",cat:"Descriptive Words"},{w:"Bura/Buri",m:"Bad (m/f)",cat:"Descriptive Words"},{w:"Bara/Bari",m:"Big (m/f)",cat:"Descriptive Words"},{w:"Chhota/Chhoti",m:"Small (m/f)",cat:"Descriptive Words"},{w:"Garam",m:"Hot",cat:"Descriptive Words"},{w:"Thanda",m:"Cold",cat:"Descriptive Words"},{w:"Naya/Nayi",m:"New (m/f)",cat:"Descriptive Words"},{w:"Purana/Purani",m:"Old (m/f)",cat:"Descriptive Words"},{w:"Saaf",m:"Clean",cat:"Descriptive Words"},{w:"Ganda/Gandi",m:"Dirty (m/f)",cat:"Descriptive Words"},{w:"Mushkil",m:"Difficult",cat:"Descriptive Words"},{w:"Aasaan",m:"Easy",cat:"Descriptive Words"},{w:"Khoobsurat",m:"Beautiful",cat:"Descriptive Words"},{w:"Zabardast",m:"Fantastic",cat:"Descriptive Words"},{w:"Lajawab",m:"Matchless",cat:"Descriptive Words"},{w:"Yaar",m:"Friend/Dude",cat:"Slang & Casual"},{w:"Chal be",m:"Come on (very casual)",cat:"Slang & Casual"},{w:"Sahi hai",m:"That\'s right/cool",cat:"Slang & Casual"},{w:"Maza",m:"Fun/Enjoyment",cat:"Slang & Casual"},{w:"Scene",m:"Situation (borrowed from English)",cat:"Slang & Casual"},{w:"Solid",m:"Cool/good (English slang used in Urdu)",cat:"Slang & Casual"},{w:"Tension",m:"Stress (English word used in Urdu)",cat:"Slang & Casual"},{w:"Bakwas",m:"Nonsense",cat:"Slang & Casual"},{w:"Faltu",m:"Useless/Pointless",cat:"Slang & Casual"},{w:"Jugaad",m:"Creative hack/workaround",cat:"Slang & Casual"},{w:"Panga",m:"Trouble/Beef with someone",cat:"Slang & Casual"},{w:"Mast",m:"Cool/Chill/Awesome",cat:"Slang & Casual"}],
},
tagalog:{color:"#E8115B",label:"Tagalog",char:"T",sub:"Dane's language",
lessons:[
{id:"t1",title:"The Tagalog Alphabet & Pronunciation",desc:"Understand how Tagalog sounds work and the Filipino alphabet.",xp:20,content:[
{title:"Good News: It Uses the Latin Alphabet",text:"Unlike Urdu or Arabic, Tagalog uses the same A-Z letters you already know, plus NG (treated as one letter). The Filipino alphabet has 28 letters. Most letters sound exactly like English. You can read Tagalog out loud on day one."},
{title:"The Vowels",text:"A = \"ah\" (like father). E = \"eh\" (like bed). I = \"ee\" (like feet). O = \"oh\" (like go). U = \"oo\" (like food). Tagalog vowels are pure and consistent, unlike English where \"a\" sounds ten different ways. Every vowel always sounds the same."},
{title:"Tricky Consonants",text:"NG = a single sound, the \"ng\" in \"singing\" but it can START a word. \"Ngayon\" (now) = \"ngah-YOHN.\" This trips up English speakers because we never start words with \"ng.\" Practice by saying \"singing\" then dropping the \"si.\" R is always rolled/tapped. T and D are dental (tongue touches teeth)."},
{title:"The Glottal Stop",text:"Tagalog has a glottal stop — the pause in \"uh-oh.\" \"Oo\" (yes) is actually \"oh-OH\" with a tiny catch. \"Bata\" (child) vs \"bata\" (robe) differ only by where the glottal stop falls. You'll pick this up naturally by listening to Dane speak."},
{title:"Stress Changes Meaning",text:"\"Basa\" (BAH-sah) = wet. \"Basa\" (bah-SAH) = to read. \"Gabi\" (GAH-bee) = night. \"Gabi\" (gah-BEE) = taro root. When in doubt, stress the second-to-last syllable. That's correct about 70% of the time."},
{title:"Spelling is Phonetic",text:"Tagalog is spelled exactly how it sounds. No silent letters, no weird rules. \"Mahal\" = \"mah-HAHL.\" \"Salamat\" = \"sah-LAH-mat.\" Every letter pulls its weight. Coming from English with its \"through/though/thought\" chaos, this is a gift."},

{title:"Filipino vs Tagalog",text:"Filipino is the national language based on Tagalog — about 95% the same. Tagalog is the ethnic language of Manila. Filipino includes more loanwords from English and Spanish. When Dane speaks Tagalog shes really speaking Filipino. Taglish (mixing both) is completely normal."},
{title:"Good News: Pronunciation is Easy",text:"Unlike Urdu or Arabic, Tagalog is mostly phonetic. Vowels: A (ah), E (eh), I (ee), O (oh), U (oo) — these NEVER change. Consonants are almost all English. Only tricky ones: ng is one sound (like sing but at the START of words). R is always rolled. Thats it."},
{title:"Taglish in Action",text:"Real conversations mix languages: Mag-lunch na tayo? = Lets have lunch? Na-late ako = I was late. I-send mo na = Just send it. Nag-shopping kami = We went shopping. This is normal — not bad Tagalog. Dane probably speaks Taglish naturally."},
{title:"Philippine Language Landscape",text:"The Philippines has 180+ languages. Tagalog is most widespread but many Filipinos also speak Cebuano, Ilocano, Hiligaynon, Waray, and more. Danes family might speak another language at home. Asking What languages does your family speak? shows real interest."},],quiz:[
{q:"How many letters in the Filipino alphabet?",opts:["28","26","A food item","39"],ans:0},
{q:"What's special about \"NG\"?",opts:["Good morning","One letter, can start words","To write","To sleep"],ans:1},
{q:"Tagalog vowels are?",opts:["Alif ا","Pure and consistent","Noon ن","Laam ل"],ans:1},
{q:"What is a glottal stop?",opts:["A rolled r sound","A nasal hum","A sharp click","A tiny pause mid-word"],ans:3},
{q:"Tagalog spelling is?",opts:["Phonetic — spelled how it sounds","Kaaf ک","Laam ل","Seen س"],ans:0},

{q:"What is Taglish?",opts:["A dialect","Mixing Tagalog and English","Formal Tagalog","A food"],ans:1},
{q:"How many languages in the Philippines?",opts:["2","50","180+","500"],ans:2},]},
{id:"t2",title:"Numbers 0-100",desc:"Count in Tagalog, use numbers for money, time, and daily life.",xp:20,unlockAfter:"t1",content:[
{title:"0 to 10 — Native Tagalog",text:"0 = wala. 1 = isa. 2 = dalawa. 3 = tatlo. 4 = apat. 5 = lima. 6 = anim. 7 = pito. 8 = walo. 9 = siyam. 10 = sampu. These are the original Tagalog numbers. But most Filipinos actually use Spanish numbers in daily life, especially for money and time."},
{title:"0 to 10 — Spanish Numbers (Used Daily)",text:"1 = uno. 2 = dos. 3 = tres. 4 = kuwatro. 5 = singko. 6 = sais. 7 = siyete. 8 = otso. 9 = nuwebe. 10 = diyes. From 333 years of Spanish colonization. Money is almost always in Spanish: \"singkuwenta pesos\" (50 pesos), not \"limampung piso.\""},
{title:"11 to 20",text:"Tagalog: 11 = labing-isa. 12 = labindalawa. Pattern is \"labing\" + ones digit. Spanish (more common): 11 = onse. 12 = dose. 13 = trese. 14 = katorse. 15 = kinse. 20 = beynte."},
{title:"Tens: 20 to 100",text:"Tagalog: 20 = dalawampu. 30 = tatlumpu. 40 = apatnapu. 50 = limampu. 100 = isang daan. Spanish (daily use): 20 = beynte. 30 = treynta. 40 = kuwarenta. 50 = singkuwenta. 100 = siyento."},
{title:"Numbers in Daily Life",text:"Money: \"Magkano?\" (How much?) \"Beynte pesos.\" Time: \"A las dos\" = at 2 o'clock. Age: \"Ilang taon ka na?\" (How old are you?). Phone numbers use English digits because of American influence. Three number systems in one country. Welcome to the Philippines."},
{title:"The \"Ilan\" Question",text:"\"Ilan?\" (ee-LAHN) = How many? \"Isa lang\" = just one. \"Dalawa lang\" = just two. \"Lang\" means \"just/only\" and softens everything. \"Konti lang\" = just a little. \"Kaunti lang ang pagkain\" = there's just a little food (there's actually a feast)."},
],quiz:[
{q:"What number system do Filipinos use for money?",opts:["do","Spanish","aath","aik"],ans:1},
{q:"\"Magkano?\" means?",opts:["A place","To sing","How much?","A person"],ans:2},
{q:"What does \"lang\" mean?",opts:["To clean","To dance","The opposite","Just/Only"],ans:3},
{q:"\"Sampu\" is?",opts:["10 in Tagalog","Good night","To write","To run"],ans:0},
{q:"Why three number systems?",opts:["aath","teen","aik","Spanish colonization + American influence + native Tagalog"],ans:3},
]},
{id:"t3",title:"Greetings and Basics",desc:"Essential greetings, respect, and first conversations.",xp:20,unlockAfter:"t2",content:[
{title:"The Main Greeting",text:"Kamusta (kah-MOO-stah) means \"How are you?\" from Spanish \"como esta.\" Typical reply: \"Mabuti naman\" (mah-BOO-tee nah-MAHN) = I'm good. You can use it casually or formally."},
{title:"Thank You and Respect",text:"Salamat (sah-LAH-mat) = thank you. Add \"po\" for respect: \"Salamat po.\" The word \"po\" signals respect and good upbringing. Using it with Dane's parents or grandparents earns instant points."},
{title:"Yes, No, and Maybe",text:"Oo (OH-oh) = yes. Hindi (HIN-dee) = no. Siguro (see-GOO-roh) = maybe. Filipinos often avoid direct \"hindi\" to be polite. They say \"siguro hindi\" or change the subject. Reading between the lines is a skill."},
{title:"Polite Expressions",text:"Paumanhin (pow-mahn-HEEN) = excuse me/sorry. \"Opo\" is respectful yes. The gesture \"mano po\" — taking an elder's hand to your forehead — is the ultimate sign of respect."},
{title:"Common Quick Phrases",text:"Tara (TAH-rah) = let's go. \"Sige\" (SEE-geh) = okay/go ahead, the most used filler word. \"Ano?\" (ah-NO) = what? \"Hala!\" (HAH-lah) = expression of surprise."},
{title:"Practice Dialogue",text:"You see Dane's lola: \"Kamusta po!\" and do mano. She says \"Mabuti naman, ikaw?\" You say \"Mabuti rin po, salamat po.\" She smiles because you used \"po\" three times and did mano. You're now the favorite."},

{title:"The Tagalog Po",text:"Adding po to ANY sentence makes it respectful: Oo → Opo (yes respectfully). Salamat → Salamat po. ALWAYS use po with Danes parents, older relatives, anyone older. This is non-negotiable in Filipino culture. Danes family will love you for it."},
{title:"The Mano Gesture",text:"When greeting Filipino elders, mano po means taking their right hand and pressing the back of it to your forehead. Not all modern families practice this but many do. Ask Dane if her family does mano. Practicing it before meeting them makes an incredible impression."},
{title:"Everyday Greetings Timeline",text:"Morning: Magandang umaga po! Late morning: Magandang tanghali po! Afternoon: Magandang hapon po! Evening: Magandang gabi po! Leaving: Paalam na po. Pattern: Magandang + time + po. Maganda means beautiful — youre saying Beautiful morning!"},
{title:"Filipino Hospitality",text:"When visiting a Filipino home: You WILL be offered food. Refusing is rude — at least try. Kain tayo! (Lets eat!) means accept. Busog na po (Im full respectfully) to politely decline. Kumain ka na? (Have you eaten?) is a greeting, not just a question."},],quiz:[
{q:"Kamusta comes from which language?",opts:["Arabic","Spanish","Chinese","Japanese"],ans:1},
{q:"Adding \"po\" shows?",opts:["Good night","A feeling","Respect","To cook"],ans:2},
{q:"\"Hindi\" means?",opts:["Angry","A place","Sad","No"],ans:3},
{q:"What is \"mano po\"?",opts:["100","Taking elder's hand to forehead","42","39"],ans:1},
{q:"\"Mabuti naman\" means?",opts:["To run","A person","A place","I'm good"],ans:3},

{q:"What does po do?",opts:["Makes a question","Makes past tense","Makes it respectful","Makes negative"],ans:2},
{q:"Magandang umaga literally means?",opts:["Good morning","Beautiful morning","New morning","Happy morning"],ans:1},]},
{id:"t4",title:"Essential Phrases for Every Day",desc:"Navigate daily conversations with must-know expressions.",xp:20,unlockAfter:"t3",content:[
{title:"Please and Thank You",text:"Salamat = thank you. Maraming salamat = thank you very much. \"Paki-\" is the closest to \"please\" as a prefix: \"Pakiabot\" = please hand over. \"Pakitawag\" = please call. Filipinos show politeness through tone and \"po/opo\" more than a direct \"please\" word."},
{title:"Sorry and Excuse Me",text:"Pasensya na (pah-SEN-shah nah) = sorry/patience please. Paumanhin = formal apology. \"Sorry\" (English) is used constantly in casual speech. For a real apology: \"Pasensya ka na, hindi ko sinasadya\" = Sorry, I didn't mean to."},
{title:"I Don't Understand",text:"\"Hindi ko maintindihan\" = I don't understand. Shorter: \"Hindi ko gets\" (using English \"gets\" — very common). \"Puwede mo bang ulitin?\" = Can you repeat that? \"Dahan-dahan lang\" = slowly please."},
{title:"Where, When, How",text:"Saan = where. Kailan = when. Paano = how. Bakit = why. Sino = who. Ano = what. Alin = which. \"Saan ka pupunta?\" = Where are you going? \"Kailan tayo kakain?\" = When are we eating?"},
{title:"Time Expressions",text:"Ngayon = now. Mamaya = later. Kanina = earlier. Kahapon = yesterday. Bukas = tomorrow. Lagi = always. Minsan = sometimes. Filipino time warning: \"mamaya\" can mean 10 minutes or 3 hours. \"On the way\" might mean they haven't left yet."},
{title:"Agreement and Reactions",text:"Oo = yes. Hindi = no. Opo = yes (respectful). Sige = okay/sure (the MOST used word). Talaga? = really? \"Naman\" adds warmth: \"Oo naman\" = of course. \"Sige na\" = okay fine (giving in). \"Ay!\" = the universal Filipino surprise sound."},
],quiz:[
{q:"\"Pasensya na\" means?",opts:["Bored","A person","Sorry/patience please","Angry"],ans:2},
{q:"\"Sige\" means?",opts:["A person","To eat","To sleep","Okay/go ahead/sure"],ans:3},
{q:"\"Saan\" means?",opts:["To sing","Where","Sad","A feeling"],ans:1},
{q:"What does \"mamaya\" actually mean?",opts:["Something different","To dance","Thank you","Later — 10 minutes to 3 hours"],ans:3},
{q:"\"Hindi ko gets\" means?",opts:["I don't understand","Bored","To eat","Excited"],ans:0},
{q:"Most used Filipino filler word?",opts:["Assalamu Alaikum","Theek hai","Maaf kijiye","Sige"],ans:3},
]},
{id:"t5",title:"Love in Tagalog",desc:"Romantic words and how Filipinos express love.",xp:20,unlockAfter:"t4",content:[
{title:"I Love You",text:"Mahal kita (mah-HAHL kee-TAH) = I love you. Fun fact: \"mahal\" means both \"love\" and \"expensive.\" Filipinos joke that love is expensive. \"Kita\" = you. This is THE phrase. Memorize it."},
{title:"Levels of Affection",text:"\"Gusto kita\" = I like you (early stages). \"Iniibig kita\" = poetic I love you (classic movie style). \"Miss na kita\" = I miss you already. Each has its place depending on how deep you're in."},
{title:"Pet Names",text:"Mahal ko = my love. \"Sinta\" = beloved (old-school). \"Pangga\" = dear one (Visayan). Filipinos freely mix English and Tagalog pet names. \"Babe,\" \"baby,\" and \"love\" are all used as-is."},
{title:"Sweet Nothings",text:"Maganda ka = you're beautiful. \"Ang gwapo mo\" = you're handsome. \"Ikaw lang\" = only you. \"Ikaw ang buhay ko\" = you are my life. Filipinos are not shy about being cheesy. Lean into it."},
{title:"Family Love Culture",text:"Filipino families are extremely close. Meeting the family is a Big Deal. Expect to be fed and questioned. Do \"mano po\" to every elder. If her mom cooks, eat everything and say \"ang sarap po!\" That's the way in."},
],quiz:[
{q:"\"Mahal\" means both love and?",opts:["Angry","Surprised","Expensive","Sad"],ans:2},
{q:"Early stages \"I like you\" is?",opts:["Good night","Something different","To eat","Gusto kita"],ans:3},
{q:"\"Maganda ka\" means?",opts:["Angry","To sleep","Surprised","You're beautiful"],ans:3},
{q:"When her mom cooks, say?",opts:["Ang sarap po","Meat","Water","Bread"],ans:0},
{q:"\"Ikaw lang\" means?",opts:["To cook","Only you","To sing","Surprised"],ans:1},
]},
{id:"t6",title:"Family and Relationships",desc:"Family titles, dynamics, and the Filipino family structure.",xp:20,unlockAfter:"t5",content:[
{title:"Immediate Family",text:"Nanay/Mama = Mother. Tatay/Papa = Father. Kuya (KOO-yah) = older brother. Ate (AH-teh) = older sister. Bunso = youngest child. These titles are mandatory. You NEVER call an older sibling by first name alone. It's always \"Kuya [name]\" or \"Ate [name].\""},
{title:"Extended Family",text:"Lolo = grandfather. Lola = grandmother. Tito = uncle. Tita = aunt. Pinsan = cousin. Every older family friend becomes Tito or Tita. \"Ninong\" = godfather. \"Ninang\" = godmother. Filipinos take godparent relationships seriously."},
{title:"The Ate/Kuya System",text:"ANY older person can be called Ate or Kuya as respect. The cashier? \"Kuya, paki-abot po.\" Birth order matters enormously. The panganay (firstborn) carries responsibility. The bunso gets spoiled. It's law."},
{title:"Family Dynamics",text:"Filipino families are tight. Adult children often live with parents until marriage. Sunday lunch at Lola's is non-negotiable. The family group chat has 47 members. \"Chismis\" (gossip) is the family's unofficial sport. The Titas will ask when you're getting married 4 minutes after meeting you."},
{title:"In-Law and Partner Terms",text:"Biyenan = parent-in-law. Manugang = child-in-law. \"Jowa\" (JOH-wah) = boyfriend/girlfriend (slang). \"Syota\" = another partner slang. \"Ligawan\" = courtship. Traditional Filipino courtship means impressing the entire family, not just Dane."},
],quiz:[
{q:"\"Ate\" is used for?",opts:["Older sister / any older female as respect","Welcome","To cook","A place"],ans:0},
{q:"\"Bunso\" means?",opts:["Tired","Nervous","To speak","Youngest child"],ans:3},
{q:"What is \"chismis\"?",opts:["The opposite","28","Gossip","A person"],ans:2},
{q:"\"Jowa\" means?",opts:["Bored","Happy","To sing","Boyfriend/Girlfriend"],ans:3},
{q:"Who are \"Ninong\" and \"Ninang\"?",opts:["Grandmother","Godfather and Godmother","A child","Brother"],ans:1},
]},
{id:"t7",title:"Emotions and Expressing Yourself",desc:"Say how you feel and understand Filipino emotional expressions.",xp:20,unlockAfter:"t6",content:[
{title:"Happy and Excited",text:"Masaya = happy. \"Masaya ako\" = I'm happy. Natutuwa = delighted. \"Kilig\" (KEE-lig) = giddy butterflies-in-stomach feeling from romance. This is uniquely Filipino with no English translation. It's what you feel when your crush texts back."},
{title:"Sad and Hurt",text:"Malungkot = sad. \"Nalulungkot ako\" = I'm sad. Nasaktan = hurt emotionally or physically. Iyak = cry. Filipinos hide sadness behind smiles. \"Okay lang ako\" often means the opposite."},
{title:"Anger and Annoyance",text:"Galit = angry. \"Nagagalit ako\" = I'm getting angry. Inis = annoyed. Badtrip = bad mood (English slang in Tagalog). \"Suplada/Suplado\" = someone who acts cold or stuck-up. Being called suplada is a mild but real insult."},
{title:"Surprise and Confusion",text:"\"Ay!\" = surprise. \"Hala!\" = oh no. \"Naku!\" = oh my. Nagulat = startled. \"Ano ba?!\" = What the?! These reaction sounds are 50% of Filipino conversation."},
{title:"Comfort and Reassurance",text:"\"Huwag kang mag-alala\" = don't worry. \"Andito lang ako\" = I'm right here. \"Kaya mo yan\" = you can do it. \"Laban!\" = fight! (encouragement). \"Yakap\" = hug. \"Kailangan mo ba ng yakap?\" = Do you need a hug?"},
],quiz:[
{q:"What is \"kilig\"?",opts:["42","26","Giddy romantic feeling — no English translation","Something different"],ans:2},
{q:"\"Galit\" means?",opts:["A person","Angry","The opposite","Surprised"],ans:1},
{q:"\"Hala!\" expresses?",opts:["Tired","Happy","Nervous","Mild shock"],ans:3},
{q:"\"Kaya mo yan\" means?",opts:["You can do it","To speak","Happy","Something different"],ans:0},
{q:"\"Okay lang ako\" often means?",opts:["The opposite — they're not okay","A greeting","Surprised","A food item"],ans:0},
]},
{id:"t8",title:"Compliments and Sweet Talk",desc:"Flatter, compliment, and charm in Tagalog.",xp:20,unlockAfter:"t7",content:[
{title:"Appearance Compliments",text:"Maganda = beautiful (women/things). Gwapo = handsome. \"Ang ganda mo!\" = You're so beautiful! Pogi = handsome (casual). \"Bagay sa'yo\" = it suits you."},
{title:"Personality Compliments",text:"Matalino = smart. Mabait = kind (one of the highest compliments). Matiyaga = patient. Masipag = hardworking. \"Ang bait mo\" = You're so kind."},
{title:"Food Compliments (Essential)",text:"\"Ang sarap!\" = So delicious! \"Ang sarap ng luto mo!\" = Your cooking is so delicious! \"Busog na busog ako\" = I'm so full (compliment to cook). Complimenting cooking is the fastest way into the family. Every. Single. Time."},
{title:"The \"Naman\" Softener",text:"\"Naman\" adds warmth to anything. \"Ang ganda mo naman!\" = You're so beautiful! (warmer). \"Salamat naman\" = Thank you (with feeling). Without naman, compliments sound flat. With it, everything is warmer."},
{title:"Flirting",text:"\"May forever ba?\" = Is there a forever? (classic Filipino romantic question). \"Type kita\" = I like you / you're my type. \"Ikaw na ikaw\" = it's you, only you. Filipinos are world-class cheesy romantics. Match the energy."},
],quiz:[
{q:"\"Maganda\" means?",opts:["Bored","Nervous","Beautiful","A feeling"],ans:2},
{q:"Highest character compliment?",opts:["Scared","Grateful","Mabait","Sad"],ans:2},
{q:"Always compliment?",opts:["The furniture","The car","The garden","The cooking"],ans:3},
{q:"\"Naman\" does what?",opts:["Adds warmth and softness","To run","Good morning","To eat"],ans:0},
{q:"\"Type kita\" means?",opts:["A greeting","The opposite","Happy","I like you / you're my type"],ans:3},
]},
{id:"t9",title:"Filipino Food Talk",desc:"Eating culture and essential food words.",xp:25,unlockAfter:"t8",content:[
{title:"The Invitation",text:"\"Kain tayo!\" = Let's eat! Filipinos share food constantly. If someone is eating, they'll say \"kain?\" to invite you. Refusing too quickly is rude. Say \"salamat, busog pa ako\" (thanks, still full)."},
{title:"Rice is Life",text:"Kanin = cooked rice. Non-negotiable at every meal. \"Walang kanin, hindi kumain\" = no rice means you didn't eat. Even if you had pasta, bread, and dessert. No rice? Didn't eat."},
{title:"The Classics",text:"Adobo = national dish (meat in vinegar, soy, garlic). Sinigang = sour tamarind soup. Lumpia = spring rolls. Lechon = roasted pig for celebrations. Name these four and you pass the basic test."},
{title:"Taste Words",text:"Masarap = delicious (most important food word). Matamis = sweet. Maasim = sour. Maanghang = spicy. Filipinos generally like sweet food. Their spaghetti has sugar. Don't question it."},
{title:"Mealtime Culture",text:"Merienda = afternoon snack tradition. Filipinos eat 5-6 times a day. Busog = full. Gutom = hungry. \"Kain tayo\" is said as a greeting, not just an invitation."},
],quiz:[
{q:"\"Kain tayo\" means?",opts:["A place","Sad","Let's eat","Surprised"],ans:2},
{q:"Filipino national dish?",opts:["Adobo","Bread","Tea","Soup"],ans:0},
{q:"\"Masarap\" means?",opts:["To pray","Angry","Delicious","To dance"],ans:2},
{q:"\"Merienda\" is?",opts:["Afternoon snack","To cook","Something different","To sing"],ans:0},
{q:"No rice means?",opts:["You didn't really eat","Tinola","Sinigang","Halo-halo"],ans:0},
]},
{id:"t10",title:"Around the House",desc:"Household vocabulary and domestic life.",xp:25,unlockAfter:"t9",content:[
{title:"Rooms and Spaces",text:"Bahay = house. Kuwarto = room/bedroom. Sala = living room. Kusina = kitchen. Banyo = bathroom. \"Tabi-tabi po\" = excuse me, spirits — said when passing dark areas. Filipinos are superstitious. Don't laugh, just say it."},
{title:"Furniture and Items",text:"Kama = bed. Upuan = chair. Lamesa = table. Salamin = mirror. Telebisyon = TV. In many Filipino homes, the TV is on 24/7 even if nobody's watching. Background comfort."},
{title:"Cleaning and Chores",text:"Linis = clean. Maglinis = to clean. Walis = broom/to sweep. Laba = laundry. Hugas = wash. \"Mag-hugas ng pinggan\" = wash dishes. Walis-tambo (soft broom) and walis-ting-ting (stiff broom) are household essentials."},
{title:"Coming and Going",text:"Pasok = enter. Labas = outside. Pinto = door. Bintana = window. \"Pasok ka\" = come in. Taas = upstairs. Baba = downstairs. Always remove shoes before entering a Filipino home. Always."},
{title:"Filipino Home Culture",text:"Shoes off at the door. Tsinelas = house slippers (every home has guest pairs). The family altar with saints and rosaries is standard. \"Balikbayan box\" = care package from relatives abroad. If you stay for dinner, you're staying. Not a question."},
],quiz:[
{q:"\"Bahay\" means?",opts:["House","Excited","To sing","To sleep"],ans:0},
{q:"\"Walis\" means?",opts:["Excited","Broom / to sweep","Tired","Bored"],ans:1},
{q:"What is \"tsinelas\"?",opts:["A person","House slippers","The opposite","A food item"],ans:1},
{q:"Always do before entering?",opts:["Remove shoes","Khuda Hafiz","Mujhe samajh nahi aaya","Maaf kijiye"],ans:0},
{q:"What is a \"balikbayan box\"?",opts:["42","The opposite","A food item","Care package from abroad"],ans:3},
]},
{id:"t11",title:"Shopping and Money",desc:"Navigate stores, markets, and money conversations.",xp:25,unlockAfter:"t10",content:[
{title:"Money Basics",text:"Pera = money. Piso = peso. \"Magkano?\" = How much? Mahal = expensive. Mura = cheap. \"Ang mahal naman!\" = So expensive! \"May tawad ba?\" = Is there a discount?"},
{title:"At the Palengke (Wet Market)",text:"Palengke = traditional market. Tindahan = small store. \"Pabili po\" = I'd like to buy. \"Isang kilo\" = one kilo. Vendors shout \"Mura na!\" and you haggle back."},
{title:"At the Mall",text:"Filipinos LOVE malls — they're social hubs. \"Punta tayo sa mall\" = let's go to the mall. \"Window shopping lang\" = just looking (before buying everything). \"Naka-sale\" = on sale. \"Libre\" = free. \"Libre mo ako\" = treat me."},
{title:"The Sari-Sari Store",text:"Tiny store in someone's house selling everything in small quantities. One candy, one shampoo sachet. \"Pabili po ng...\" = I'd like to buy... \"Tingian\" = buying single items. How millions of Filipinos shop daily."},
{title:"Pasalubong Culture",text:"Pasalubong = gifts from a trip. NOT optional. \"Ano ang pasalubong mo?\" = What did you bring me? Even a short trip requires pasalubong. Budget for this. Always."},
],quiz:[
{q:"\"Magkano\" means?",opts:["Excited","How much?","A greeting","Sad"],ans:1},
{q:"What is a sari-sari store?",opts:["55","Something different","28","Tiny store selling small quantities"],ans:3},
{q:"\"Pasalubong\" means?",opts:["To speak","To write","Scared","Gifts from a trip"],ans:3},
{q:"\"May tawad ba?\" means?",opts:["Is there a discount?","Nervous","The opposite","To cook"],ans:0},
{q:"\"Libre mo ako\" means?",opts:["A place","Something different","Treat me","To pray"],ans:2},
]},
{id:"t12",title:"Getting Around",desc:"Navigate transportation and directions.",xp:25,unlockAfter:"t11",content:[
{title:"Directions",text:"Kanan = right. Kaliwa = left. Diretso = straight. \"Kumanan ka\" = turn right. Malapit = near. Malayo = far. Filipino \"malapit lang\" could mean a 30-minute walk."},
{title:"The Jeepney",text:"The icon of Filipino transport. \"Para!\" = Stop! (shout to get off). \"Bayad po!\" = paying! (pass money forward through passengers). \"Magkano po ang pamasahe?\" = How much is the fare? Chaotic, colorful, 100% Filipino."},
{title:"Other Transportation",text:"Tricycle = motorcycle with sidecar. \"Grab\" = ride-hailing app. FX = shared vans. MRT/LRT = metro. \"Sakay tayo\" = let's ride. \"Baba na ako\" = I'm getting off. \"Traffic\" isn't just a word, it's a lifestyle."},
{title:"Asking for Help",text:"\"Paano pumunta sa...?\" = How do I get to...? \"Naliligaw ako\" = I'm lost. Filipinos will walk you there personally. If directions are confusing, they'll flag a tricycle for you."},
{title:"Manila vs Province",text:"\"Probinsya\" = countryside. Manila traffic is legendary. In the province, everything is \"walking distance.\" \"Uwi na tayo\" = let's go home. \"Byahe\" = journey."},
],quiz:[
{q:"Shout to stop a jeepney?",opts:["Tara","Ingat","Para","Salamat"],ans:2},
{q:"\"Malapit lang\" probably means?",opts:["Could be a 30-minute walk","Tired","To cook","To clean"],ans:0},
{q:"\"Bayad po\" means?",opts:["A place","A food item","Paying!","To eat"],ans:2},
{q:"\"Naliligaw ako\" means?",opts:["To speak","To pray","I'm lost","A food item"],ans:2},
{q:"What is a tricycle?",opts:["Motorcycle with sidecar","The opposite","Something different","12"],ans:0},
]},
{id:"t13",title:"Filipino Slang and Casual Talk",desc:"Sound natural with slang, fillers, and expressions Filipinos actually use.",xp:25,unlockAfter:"t12",content:[
{title:"The Essential Slang",text:"Lodi = idol (reversed syllables) = someone you admire. Petmalu = malupet reversed = cool/intense. Werpa = power reversed. Filipinos love reversing syllables. \"G\" (the letter) = game/down for it. \"G ka ba?\" = Are you game? \"Awit\" = disappointment/disbelief reaction."},
{title:"Taglish (Tagalog + English)",text:"Filipinos constantly mix Tagalog and English. \"Nag-shopping ako kanina\" = I went shopping earlier. \"Ang init, let's go na\" = It's hot, let's go. Don't try pure Tagalog. Taglish IS modern Filipino communication."},
{title:"Reaction Words",text:"\"Uy!\" = hey! \"Ay!\" = oh! \"Naks!\" = wow, fancy! (teasing). \"Sana all\" = wish that was me. \"Charot!\" = just kidding. \"Chos!\" = same as charot. \"Eme\" = drama/exaggeration. \"Teh\" = girl (between female friends). \"Mare\" = girlfriend (platonic)."},
{title:"Text Speak",text:"\"Po\" becomes \"poh.\" \"Ako\" becomes \"aq.\" \"Haha\" has levels: \"ha\" = annoyed. \"Haha\" = fake laugh. \"Hahaha\" = actually funny. \"HAHAHAHA\" = dying. Using just \"ha\" in a group chat is a declaration of war."},
{title:"Food Slang",text:"\"Kain tayo\" = greeting and invitation. \"Busog na busog\" = super full. \"Takaw!\" = greedy (teasing). \"Lasang lupa\" = tastes like dirt. \"Ano ulam?\" = What's the main dish? Asked daily in every Filipino household."},
{title:"Barkada Culture",text:"\"Barkada\" = friend group/squad. \"Tropa\" = same thing. \"Tambay\" = hang out doing nothing. \"Walang forever\" = there's no forever (joke). \"Hugot\" = deep emotional quote about love/heartbreak. Filipinos are masters of hugot."},
],quiz:[
{q:"What is Taglish?",opts:["12","A greeting","39","Mixing Tagalog and English"],ans:3},
{q:"\"Charot\" means?",opts:["Surprised","To pray","Scared","Just kidding"],ans:3},
{q:"\"Sana all\" means?",opts:["Wish that was me","Something different","To clean","A place"],ans:0},
{q:"What does \"ha\" mean in text?",opts:["To sing","A feeling","Annoyed — dangerous","To cook"],ans:2},
{q:"\"Barkada\" means?",opts:["A feeling","Friend group","Sad","To pray"],ans:1},
{q:"\"Hugot\" means?",opts:["The opposite","To speak","A person","Deep emotional quote"],ans:3},
]},
{id:"t14",title:"Bad Words and What NOT to Say",desc:"Recognize inappropriate language and cultural taboos.",xp:25,unlockAfter:"t13",content:[
{title:"Why This Lesson Exists",text:"Awareness, not instruction. Know what these mean so you're never caught off guard. And know what never to say in front of Dane's parents, lola, or any elder."},
{title:"Mild (PG-13)",text:"Gago/Gaga = stupid/fool (m/f). Tanga = dumb. Bobo/Boba = dumb (softer). Ulol = crazy/fool. \"Bwisit!\" = annoying/cursed. Used casually between friends, never toward elders."},
{title:"Moderate (R-Rated)",text:"Leche = from Spanish, used like \"damn.\" \"Punyeta\" = strong curse from Spanish. \"Hayop ka!\" = You're an animal! These escalate tension fast."},
{title:"Nuclear Level — Recognize Only",text:"The most common strong swears involve \"ina\" (mother). \"P.I.\" is the abbreviation online. \"Putcha\" is the softened version. Regional Visayan and Ilokano curses can be even stronger. If Dane's family switches dialect and gets loud, they're probably swearing without you knowing."},
{title:"Cultural Insults (Worse Than Swearing)",text:"\"Walang hiya\" (shameless) = nuclear. \"Walang galang\" = no respect. Pointing with your finger (use lips/chin instead). Not saying \"po\" to elders. Refusing food. Not bringing pasalubong. These cause more drama than actual cursing."},
{title:"The Golden Rules",text:"Always use \"po\" and \"opo\" with elders. Do \"mano po.\" Never raise your voice at an elder. Filipinos value \"pakikisama\" (getting along). Causing public scenes is worse than the actual problem."},
],quiz:[
{q:"\"Gago\" means?",opts:["Happy","To eat","Scared","Stupid/fool"],ans:3},
{q:"\"Walang hiya\" means?",opts:["To sing","A feeling","To speak","Shameless — severe insult"],ans:3},
{q:"How should you point?",opts:["Chalo","Bilkul","With lips/chin, not finger","Theek hai"],ans:2},
{q:"What is \"pakikisama\"?",opts:["A place","A food item","36","Getting along / group harmony"],ans:3},
{q:"Never do at an elder's home?",opts:["Arrive early","Refuse food or leave early","Bring a gift","Kya baat hai"],ans:1},
]},
{id:"t15",title:"Tagalog Grammar Basics (Part 1)",desc:"Understand verb focus, sentence structure, and basic grammar.",xp:25,unlockAfter:"t14",content:[
{title:"Verb-First Language",text:"Tagalog starts with the verb. English: \"I eat rice.\" Tagalog: \"Kumakain ako ng kanin\" (Eating I of rice). Feels backwards but becomes natural. Think of answering \"what's happening?\" first."},
{title:"The Focus System",text:"Verbs change form based on focus. \"Bumili ako ng libro\" = I bought a book (focus: I). \"Binili ko ang libro\" = I bought THE book (focus: book). Same event, different emphasis. Use the simplest form for now."},
{title:"Pronouns",text:"Ako = I/me. Ikaw/Ka = you. Siya = he/she (gender-neutral!). Kami = we (excluding you). Tayo = we (including you). Kayo = you (plural/respectful). Sila = they. \"Kakain kami\" = we're eating (you're not invited). \"Kakain tayo\" = we're eating (join us)."},
{title:"Ang, Ng, Sa — The Markers",text:"\"Ang\" marks the topic. \"Ng\" (NAHNG) marks doer or object. \"Sa\" marks location. \"Binigay ng nanay ang pagkain sa bata\" = The mother gave the food to the child."},
{title:"Negation",text:"Hindi = not/no. Huwag = don't (commands). Wala = none/nothing. \"Hindi ako kumain\" = I didn't eat. \"Huwag kang umalis!\" = Don't leave! \"Wala akong pera\" = I don't have money."},
{title:"Useful Starters",text:"\"Gusto ko...\" = I want. \"Kailangan ko...\" = I need. \"Puwede ba...\" = Can I / Is it okay? \"May...\" = There is. \"Wala...\" = There isn't. These let you build sentences immediately."},
],quiz:[
{q:"Tagalog starts sentences with?",opts:["Root word","The verb","Suffix","Noun"],ans:1},
{q:"\"Tayo\" vs \"Kami\" — includes listener?",opts:["Thank you","Tayo","A place","Good morning"],ans:1},
{q:"\"Siya\" can mean?",opts:["To speak","To clean","He or she — gender-neutral","To sleep"],ans:2},
{q:"\"Huwag\" is for?",opts:["To pray","The opposite","Commands — don't","To sleep"],ans:2},
{q:"\"Gusto ko\" means?",opts:["Scared","I want","A feeling","A greeting"],ans:1},
{q:"\"Wala\" means?",opts:["A person","To clean","To write","None/Nothing"],ans:3},
]},
{id:"t16",title:"Tagalog Grammar Basics (Part 2)",desc:"Verb tenses, adjectives, and connecting sentences.",xp:25,unlockAfter:"t15",content:[
{title:"Verb Tenses: \"-um-\" Verbs",text:"Root: kain (eat). Past: Kumain (ate). Present: Kumakain (eating). Future: Kakain (will eat). Pattern: Past = insert \"-um-.\" Present = \"-um-\" + repeat first syllable. Future = repeat first syllable. These cover most daily conversation."},
{title:"\"Mag-\" Verbs",text:"Magluto (to cook). Past: Nagluto. Present: Nagluluto. Future: Magluluto. Pattern: Past = \"Nag-.\" Present = \"Nag-\" + repeat. Future = \"Mag-\" + repeat. Between \"-um-\" and \"mag-\" verbs, you cover 70% of conversation."},
{title:"Adjectives with \"Ma-\"",text:"Maganda = beautiful. Malaki = big. Maliit = small. Mainit = hot. Malamig = cold. Masaya = happy. Mabilis = fast. To intensify: \"Napakaganda!\" = Very beautiful!"},
{title:"Connecting Words",text:"At = and. O = or. Pero = but. Kaya = so. Dahil = because. Kapag/Kung = if/when. Para = for. \"Kumain ako dahil gutom ako\" = I ate because I was hungry."},
{title:"The \"Na\" and \"Pa\" Words",text:"\"Na\" = already. \"Pa\" = still. \"Kumain ka na?\" = Have you eaten already? \"Hindi pa\" = not yet. \"Gutom pa ako\" = I'm still hungry. Mastering these makes you 50% more fluent instantly."},
{title:"Common Mistakes That Are Okay",text:"Mixing \"ang\" and \"ng\" — people understand. Using English words when you forget Tagalog — Filipinos do this too. Nobody expects perfect grammar. Effort and warmth matter more than accuracy."},
],quiz:[
{q:"Past of \"kain\" with \"-um-\"?",opts:["Kumain","To run","To sleep","Goodbye"],ans:0},
{q:"\"Nagluto\" means?",opts:["Cooked","Scared","Tired","To pray"],ans:0},
{q:"\"Mabilis\" means?",opts:["An action","Fast","A place","To pray"],ans:1},
{q:"\"Na\" means?",opts:["To pray","Something different","Already","The opposite"],ans:2},
{q:"\"Kumain ka na?\" means?",opts:["Have you eaten already?","Bored","A food item","Tired"],ans:0},
{q:"Most important thing about speaking Tagalog?",opts:["Effort matters more than perfect grammar","Grandmother","Anyone","Brother"],ans:0},
]},
{id:"t17",title:"Filipino Culture and Values",desc:"Understand the values that shape Filipino behavior.",xp:25,unlockAfter:"t16",content:[
{title:"Utang na Loob — Debt of Gratitude",text:"A deep, sometimes lifelong sense of gratitude and obligation. If someone helps you in a major way, you carry that gratitude and find ways to repay through loyalty and reciprocity. It shapes family, friendships, and even politics."},
{title:"Hiya — Shame/Social Awareness",text:"Not just shyness — a deep awareness of how your actions reflect on your family. \"Nakakahiya\" = embarrassing. Filipinos go to great lengths to avoid embarrassing themselves or their family. Not accepting help? Hiya. Declining food? Causes hiya for the host. Understanding hiya explains 80% of Filipino social behavior."},
{title:"Bayanihan — Community Spirit",text:"From \"bayani\" (hero). Originally the tradition of neighbors literally carrying a house to a new location. Now means community cooperation. During typhoons, everyone helps. During fiestas, the whole street cooks. The social glue that holds everything together."},
{title:"Pakikisama — Getting Along",text:"Going along with the group for smooth relations. Sometimes yielding your preference for harmony. Being \"madaling pakisamahan\" (easy to get along with) is a top compliment. It's not being fake — it's valuing relationships over being right."},
{title:"Resilience and Joy",text:"Filipinos survived colonization, typhoons, poverty, and political chaos with humor and community intact. \"Bahala na\" (BAH-hah-lah nah) = whatever happens, happens (leaving it to God/fate). It's not giving up, it's trusting that things will work out while doing your best. Filipinos smile through hardship not because they're naive, but because joy is an act of resistance."},
{title:"How These Values Affect You",text:"As Shah entering Dane's family: show utang na loob by remembering favors and being grateful. Avoid causing hiya by being respectful and gracious. Practice bayanihan by helping without being asked. Master pakikisama by being flexible and warm. And match Filipino resilience with your own humor and optimism. Do these five things and you're family."},
],quiz:[
{q:"What is \"utang na loob\"?",opts:["36","55","Something different","Debt of gratitude"],ans:3},
{q:"\"Nakakahiya\" means?",opts:["Embarrassing/shameful","To write","Nervous","An action"],ans:0},
{q:"\"Bayanihan\" originally meant?",opts:["Neighbors carrying a house to new location","A food item","Hello","To write"],ans:0},
{q:"\"Bahala na\" means?",opts:["Bored","Whatever happens — trusting fate","Sad","Excited"],ans:1},
{q:"What is \"pakikisama\"?",opts:["A place","A food item","36","Getting along / group harmony"],ans:3},
]},
],
words:[{w:"Kamusta",m:"How are you",cat:"Greetings & Basics"},{w:"Mabuti",m:"Good/Fine",cat:"Greetings & Basics"},{w:"Salamat",m:"Thank you",cat:"Greetings & Basics"},{w:"Maraming salamat",m:"Thank you very much",cat:"Greetings & Basics"},{w:"Oo",m:"Yes",cat:"Greetings & Basics"},{w:"Opo",m:"Yes (respectful)",cat:"Greetings & Basics"},{w:"Hindi",m:"No",cat:"Greetings & Basics"},{w:"Sige",m:"Okay/Sure",cat:"Greetings & Basics"},{w:"Tara",m:"Let\'s go",cat:"Greetings & Basics"},{w:"Paumanhin",m:"Excuse me/Sorry",cat:"Greetings & Basics"},{w:"Pasensya na",m:"Sorry",cat:"Greetings & Basics"},{w:"Ingat",m:"Take care",cat:"Greetings & Basics"},{w:"Paalam",m:"Goodbye",cat:"Greetings & Basics"},{w:"Tuloy",m:"Come in/Continue",cat:"Greetings & Basics"},{w:"Sandali lang",m:"Just a moment",cat:"Greetings & Basics"},{w:"Nanay/Mama",m:"Mother",cat:"People & Family"},{w:"Tatay/Papa",m:"Father",cat:"People & Family"},{w:"Kuya",m:"Older brother",cat:"People & Family"},{w:"Ate",m:"Older sister",cat:"People & Family"},{w:"Bunso",m:"Youngest child",cat:"People & Family"},{w:"Lolo",m:"Grandfather",cat:"People & Family"},{w:"Lola",m:"Grandmother",cat:"People & Family"},{w:"Tito",m:"Uncle",cat:"People & Family"},{w:"Tita",m:"Aunt",cat:"People & Family"},{w:"Pinsan",m:"Cousin",cat:"People & Family"},{w:"Anak",m:"Child",cat:"People & Family"},{w:"Kapatid",m:"Sibling",cat:"People & Family"},{w:"Asawa",m:"Spouse",cat:"People & Family"},{w:"Jowa",m:"Partner (slang)",cat:"People & Family"},{w:"Kaibigan",m:"Friend",cat:"People & Family"},{w:"Kapitbahay",m:"Neighbor",cat:"People & Family"},{w:"Barkada",m:"Friend group",cat:"People & Family"},{w:"Mahal",m:"Love / Expensive",cat:"Love & Emotions"},{w:"Mahal kita",m:"I love you",cat:"Love & Emotions"},{w:"Gusto kita",m:"I like you",cat:"Love & Emotions"},{w:"Miss na kita",m:"I miss you",cat:"Love & Emotions"},{w:"Masaya",m:"Happy",cat:"Love & Emotions"},{w:"Malungkot",m:"Sad",cat:"Love & Emotions"},{w:"Galit",m:"Angry",cat:"Love & Emotions"},{w:"Takot",m:"Scared",cat:"Love & Emotions"},{w:"Kilig",m:"Romantic butterflies",cat:"Love & Emotions"},{w:"Nasaktan",m:"Hurt",cat:"Love & Emotions"},{w:"Inis",m:"Annoyed",cat:"Love & Emotions"},{w:"Nagulat",m:"Surprised",cat:"Love & Emotions"},{w:"Pag-asa",m:"Hope",cat:"Love & Emotions"},{w:"Tiwala",m:"Trust",cat:"Love & Emotions"},{w:"Yakap",m:"Hug",cat:"Love & Emotions"},{w:"Halik",m:"Kiss",cat:"Love & Emotions"},{w:"Pagkain",m:"Food",cat:"Food & Drink"},{w:"Kanin",m:"Cooked rice",cat:"Food & Drink"},{w:"Tubig",m:"Water",cat:"Food & Drink"},{w:"Kape",m:"Coffee",cat:"Food & Drink"},{w:"Ulam",m:"Main dish/Viand",cat:"Food & Drink"},{w:"Adobo",m:"Vinegar-soy braised meat",cat:"Food & Drink"},{w:"Sinigang",m:"Sour soup",cat:"Food & Drink"},{w:"Lumpia",m:"Spring rolls",cat:"Food & Drink"},{w:"Lechon",m:"Roast pig",cat:"Food & Drink"},{w:"Pancit",m:"Noodles",cat:"Food & Drink"},{w:"Kare-kare",m:"Peanut stew",cat:"Food & Drink"},{w:"Halo-halo",m:"Shaved ice dessert",cat:"Food & Drink"},{w:"Masarap",m:"Delicious",cat:"Food & Drink"},{w:"Matamis",m:"Sweet",cat:"Food & Drink"},{w:"Maasim",m:"Sour",cat:"Food & Drink"},{w:"Maanghang",m:"Spicy",cat:"Food & Drink"},{w:"Gutom",m:"Hungry",cat:"Food & Drink"},{w:"Busog",m:"Full",cat:"Food & Drink"},{w:"Bahay",m:"House",cat:"Home & Daily Life"},{w:"Kuwarto",m:"Room",cat:"Home & Daily Life"},{w:"Kusina",m:"Kitchen",cat:"Home & Daily Life"},{w:"Banyo",m:"Bathroom",cat:"Home & Daily Life"},{w:"Pinto",m:"Door",cat:"Home & Daily Life"},{w:"Bintana",m:"Window",cat:"Home & Daily Life"},{w:"Kama",m:"Bed",cat:"Home & Daily Life"},{w:"Upuan",m:"Chair",cat:"Home & Daily Life"},{w:"Tsinelas",m:"House slippers",cat:"Home & Daily Life"},{w:"Damit",m:"Clothes",cat:"Home & Daily Life"},{w:"Sapatos",m:"Shoes",cat:"Home & Daily Life"},{w:"Pera",m:"Money",cat:"Home & Daily Life"},{w:"Trabaho",m:"Work",cat:"Home & Daily Life"},{w:"Oras",m:"Time/Hour",cat:"Home & Daily Life"},{w:"Araw",m:"Day/Sun",cat:"Home & Daily Life"},{w:"Gabi",m:"Night",cat:"Home & Daily Life"},{w:"Umaga",m:"Morning",cat:"Home & Daily Life"},{w:"Hapon",m:"Afternoon",cat:"Home & Daily Life"},{w:"Maganda",m:"Beautiful",cat:"Descriptive Words"},{w:"Gwapo",m:"Handsome",cat:"Descriptive Words"},{w:"Malaki",m:"Big",cat:"Descriptive Words"},{w:"Maliit",m:"Small",cat:"Descriptive Words"},{w:"Mainit",m:"Hot",cat:"Descriptive Words"},{w:"Malamig",m:"Cold",cat:"Descriptive Words"},{w:"Bago",m:"New",cat:"Descriptive Words"},{w:"Luma",m:"Old (things)",cat:"Descriptive Words"},{w:"Matanda",m:"Old (people)",cat:"Descriptive Words"},{w:"Bata",m:"Young",cat:"Descriptive Words"},{w:"Mabilis",m:"Fast",cat:"Descriptive Words"},{w:"Mabagal",m:"Slow",cat:"Descriptive Words"},{w:"Malapit",m:"Near",cat:"Descriptive Words"},{w:"Malayo",m:"Far",cat:"Descriptive Words"},{w:"Madali",m:"Easy",cat:"Descriptive Words"},{w:"Mahirap",m:"Difficult/Poor",cat:"Descriptive Words"},{w:"Mabait",m:"Kind",cat:"Descriptive Words"},{w:"Masipag",m:"Hardworking",cat:"Descriptive Words"},{w:"Lodi",m:"Idol (reversed)",cat:"Slang & Casual"},{w:"Petmalu",m:"Cool/Intense",cat:"Slang & Casual"},{w:"Charot",m:"Just kidding",cat:"Slang & Casual"},{w:"Sana all",m:"Wish that was me",cat:"Slang & Casual"},{w:"Awit",m:"Disappointment",cat:"Slang & Casual"},{w:"G",m:"Game/Down for it",cat:"Slang & Casual"},{w:"Hugot",m:"Deep emotional quote",cat:"Slang & Casual"},{w:"Tambay",m:"Hang out",cat:"Slang & Casual"},{w:"Chismis",m:"Gossip",cat:"Slang & Casual"},{w:"Pasalubong",m:"Gifts from a trip",cat:"Slang & Casual"},{w:"Badtrip",m:"Bad mood",cat:"Slang & Casual"},{w:"Walang forever",m:"There\'s no forever (joke)",cat:"Slang & Casual"}],
},
arabic:{color:"#3D7CE0",label:"Arabic",char:"\u0639",sub:"Shared faith",
lessons:[
{id:"a1",title:"The Arabic Alphabet (Part 1)",desc:"Learn the first 14 letters, their sounds, and how Arabic writing works.",xp:20,content:[
{title:"How Arabic Works",text:"Arabic is written right-to-left using a cursive script where most letters connect. It has 28 letters, all consonants. Vowels are shown as small marks above/below letters (but are often omitted in everyday writing). The script looks intimidating but there are only 28 shapes to learn, and many look similar with just different dot patterns."},
{title:"Alif, Ba, Ta, Tha (ا ب ت ث)",text:"Alif (ا) = a tall vertical stroke, makes \"ah\" or acts as a vowel carrier. Ba (ب) = \"b\" sound, one dot below. Ta (ت) = \"t\" sound, two dots above. Tha (ث) = \"th\" as in \"think,\" three dots above. Notice the pattern: same base shape, different dots. This pattern repeats throughout Arabic."},
{title:"Jim, Ha, Kha (ج ح خ)",text:"Jim (ج) = \"j\" sound, one dot below. Ha (ح) = a breathy \"h\" from deep in the throat. Kha (خ) = like clearing your throat, a guttural \"kh.\" Ha and Kha look identical except for one dot. These throat sounds don't exist in English but you'll hear them constantly in Islamic phrases."},
{title:"Dal, Dhal, Ra, Zay (د ذ ر ز)",text:"Dal (د) = \"d\" sound. Dhal (ذ) = \"th\" as in \"this\" (voiced). Ra (ر) = rolled \"r.\" Zay (ز) = \"z\" sound. These four are \"non-connecting\" letters, meaning they connect to the letter before them but NOT the one after. This creates natural breaks within words."},
{title:"Sin, Shin, Sad, Dad (س ش ص ض)",text:"Sin (س) = \"s\" sound, looks like a wavy line with teeth. Shin (ش) = \"sh\" sound, same shape with three dots. Sad (ص) = emphatic \"s\" (heavier, fuller). Dad (ض) = emphatic \"d.\" The emphatic letters give Arabic its deep, resonant quality. They don't exist in English but are key to correct Quran recitation."},
{title:"Practice: Recognize These Words",text:"Allah (الله) — you'll see this everywhere. Bismillah (بسم الله) — the most written Arabic phrase. Quran (قرآن). Salah (صلاة). Even without reading fluently, recognizing these common words connects you to the visual language of Islam."},

{title:"Arabic Sounds That Dont Exist in English",text:"Several Arabic sounds have no English equivalent: Ain — deep throat vowel. Ghain — like gargling softly. Ha — breathy H from the throat. Kha — like Scottish loch. Qaf — deep K from very back of throat. Sad — emphatic S. Start with easy letters and add these gradually."},
{title:"Arabic Letter Forms",text:"Each letter has up to 4 forms: Isolated, Initial, Medial, Final. Example Baa (ب): Isolated ب, Initial بـ, Medial ـبـ, Final ـب. Dont memorize all 4 at once. Letters keep their main shape but change connections — like cursive English."},
{title:"Letters You Already Know",text:"If Shah taught you Urdu, you already know most Arabic letters! Arabic has 28. Urdu has 39. The 11 extra Urdu letters were added for South Asian sounds. So Urdus alphabet IS Arabic plus extras. Youre already ahead."},
{title:"Arabics Global Reach",text:"Arabic is spoken by 420+ million people in 25+ countries. Spoken Arabic varies hugely: Egyptian, Gulf, Levantine, Moroccan — these can be mutually unintelligible. MSA is the formal written version everyone understands. For Islamic purposes we focus on Quranic Arabic vocabulary."},],quiz:[
{q:"Arabic is written in which direction?",opts:["Right-to-left","Both directions","Left-to-right","Top-to-bottom"],ans:0},
{q:"How many letters in the Arabic alphabet?",opts:["42","10","114","28"],ans:3},
{q:"Ba, Ta, Tha differ by?",opts:["Seen س","Laam ل","Yay ی","Number of dots"],ans:3},
{q:"What are \"emphatic\" letters?",opts:["A person","Deeper, fuller versions of regular consonants","A place","The opposite"],ans:1},
{q:"Which letters don't connect forward?",opts:["Dal, Dhal, Ra, Zay","To sleep","Thank you","Something different"],ans:0},

{q:"How many Arabic letters?",opts:["28","39","26","32"],ans:0},
{q:"What is Hamza?",opts:["A vowel","A glottal stop","A consonant","A number"],ans:1},]},
{id:"a2",title:"The Arabic Alphabet (Part 2)",desc:"Learn the remaining 14 letters and understand vowel marks.",xp:20,unlockAfter:"a1",content:[
{title:"Ta, Za, Ain, Ghain (ط ظ ع غ)",text:"Ta (ط) = emphatic \"t.\" Za (ظ) = emphatic \"z/th.\" Ain (ع) = the hardest letter for English speakers, a deep throat sound with no equivalent. Ghain (غ) = a gargling \"gh.\" Ain appears in \"Arabic\" itself (Arabi = عربي). Mastering Ain takes time but even attempting it earns respect."},
{title:"Fa, Qaf, Kaf, Lam (ف ق ك ل)",text:"Fa (ف) = \"f\" sound. Qaf (ق) = deep \"q\" from the back of the throat, deeper than Kaf. Kaf (ك) = regular \"k\" sound. Lam (ل) = \"l\" sound. Qaf vs Kaf: Qaf is further back, almost uvular. \"Quran\" starts with Qaf, not Kaf. The difference matters in religious recitation."},
{title:"Mim, Nun, Ha, Waw, Ya (م ن ه و ي)",text:"Mim (م) = \"m.\" Nun (ن) = \"n.\" Ha (ه) = light \"h\" (different from the throat Ha ح). Waw (و) = \"w\" or \"oo\" vowel sound. Ya (ي) = \"y\" or \"ee\" vowel sound. These are the final five. Waw and Ya double as long vowels, which is why Arabic can seem to have missing vowels."},
{title:"The Vowel Marks (Harakat)",text:"Fatha (َ) = small line above, makes \"ah.\" Kasra (ِ) = small line below, makes \"ee.\" Damma (ُ) = small curl above, makes \"oo.\" Sukun (ْ) = small circle above, means no vowel. Shadda (ّ) = small w above, doubles the consonant. These marks appear in the Quran and children's books but are dropped in everyday Arabic writing."},
{title:"Hamza and Special Letters",text:"Hamza (ء) = glottal stop (the catch in \"uh-oh\"). It sits on Alif, Waw, or Ya depending on surrounding vowels. Alif Maqsura (ى) looks like Ya but acts as Alif at the end of words. Ta Marbuta (ة) = a special \"h/t\" ending that marks feminine nouns. These details matter for reading the Quran correctly."},
{title:"Connecting It All",text:"Arabic letters have up to 4 forms: isolated, initial (beginning), medial (middle), final (end). Example: Ba (ب) isolated looks different from Ba at the start of a word (بـ) vs middle (ـبـ) vs end (ـب). It sounds complex but your brain starts pattern-matching quickly. Focus on the Islamic phrases you already know — that's your entry point."},
],quiz:[
{q:"Which letter has no English equivalent?",opts:["Ain ع","Alif ا","Wow و","Yay ی"],ans:0},
{q:"Qaf vs Kaf — which is deeper?",opts:["Jeem ج","Qaf","Daal د","Kaaf ک"],ans:1},
{q:"What is Fatha?",opts:["12","100","Short \"ah\" vowel mark above a letter","26"],ans:2},
{q:"Ta Marbuta marks what?",opts:["Jeem ج","Feminine nouns","Daal د","Wow و"],ans:1},
{q:"How many forms can an Arabic letter have?",opts:["42","4 — isolated, initial, medial, final","36","100"],ans:1},
]},
{id:"a3",title:"Numbers 0-20 and Basics",desc:"Count in Arabic and recognize Arabic numerals.",xp:20,unlockAfter:"a2",content:[
{title:"A Surprising Fact",text:"The \"Arabic numerals\" we use in English (0, 1, 2, 3...) actually came from India through the Arab world. Arabic-speaking countries use a DIFFERENT set of numerals: ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩. You'll see these on clocks in mosques, in Quran page numbers, and on Pakistani/Arab currency."},
{title:"0 to 5",text:"0 = sifr (صفر) — \"sifr\" is where our word \"zero\" comes from. 1 = wahid (واحد). 2 = ithnayn (اثنان). 3 = thalatha (ثلاثة). 4 = arba'a (أربعة). 5 = khamsa (خمسة). Fun fact: Arabic numbers influenced the entire world. \"Algorithm\" comes from the Arabic mathematician Al-Khwarizmi."},
{title:"6 to 10",text:"6 = sitta (ستة). 7 = sab'a (سبعة). 8 = thamaniya (ثمانية). 9 = tis'a (تسعة). 10 = 'ashara (عشرة). The most important number in Islamic context: 5 (khamsa) — the five daily prayers, the five pillars. Khamsa also refers to the protective hand symbol."},
{title:"11 to 20",text:"11 = ahada 'ashar. 12 = ithna 'ashar. 13 = thalathata 'ashar. 14 = arba'ata 'ashar. 15 = khamsata 'ashar. 16 = sittata 'ashar. 17 = sab'ata 'ashar. 18 = thamaniyata 'ashar. 19 = tis'ata 'ashar. 20 = 'ishrun. Pattern: number + 'ashar (ten) for 11-19."},
{title:"Numbers in Islamic Context",text:"1 (wahid) = Tawhid, the oneness of God, the central concept of Islam. 5 = five prayers, five pillars. 7 = circling the Kaaba 7 times during Hajj. 12 = twelve months in the Islamic calendar. 30 = days of Ramadan. 33 = SubhanAllah, Alhamdulillah, and Allahu Akbar each said 33 times after prayer. 99 = the 99 names of Allah."},
{title:"Ordinal Numbers",text:"First = awwal (أول). Second = thani. Third = thalith. Fourth = rabi'. Fifth = khamis. These appear in Islamic terms: Rabi' al-Awwal = the third month (the Prophet's birth month). Jumu'ah = Friday (from \"jama'a\" meaning gathering). Knowing these helps with the Islamic calendar."},
],quiz:[
{q:"Where does the word \"zero\" come from?",opts:["Sorry","To speak","Arabic \"sifr\"","A feeling"],ans:2},
{q:"\"Khamsa\" means?",opts:["Sad","A feeling","5","The opposite"],ans:2},
{q:"What is Tawhid?",opts:["100","A place","Oneness of God — from wahid/one","12"],ans:2},
{q:"How many times is each dhikr phrase said after prayer?",opts:["bees","pachaas","teen","33"],ans:3},
{q:"\"Awwal\" means?",opts:["Scared","First","To clean","To dance"],ans:1},
]},
{id:"a4",title:"Essential Phrases for Daily Life",desc:"Common Arabic phrases beyond religious context.",xp:20,unlockAfter:"a3",content:[
{title:"Greetings Beyond Salam",text:"Marhaba (MAHR-hah-bah) = hello/welcome (non-religious greeting). Ahlan wa sahlan (AH-lahn wah SAH-lahn) = welcome (literally: you've found family and ease). Sabah al-khayr (sah-BAH al-KHEYR) = good morning. Masa al-khayr = good evening. Kayf halak/halik? (KAYF HAH-lak) = How are you? (m/f). Bikhair (bee-KHEYR) = I'm well."},
{title:"Please, Thank You, Sorry",text:"Shukran (SHOOK-rahn) = thank you. Shukran jazilan = thank you very much. Min fadlak/fadlik (min FAHD-lak) = please (m/f). Afwan (AHF-wahn) = you're welcome / excuse me. Ana asif/asifa (AH-nah AH-sif) = I'm sorry (m/f). La (LAH) = no. Na'am (NAH-ahm) = yes."},
{title:"I Don't Understand",text:"La afham (lah AF-ham) = I don't understand. Takallam bi-but' (tah-KAL-lam bee-BUHT) = speak slowly. Hal tatakallam al-Ingliziyya? = Do you speak English? A'id min fadlak = repeat please. Ma ma'na...? = What does ... mean? These survival phrases work across the entire Arab world."},
{title:"Common Conversational Phrases",text:"Ma sha' Allah = God has willed it (admiration). Yalla (YAL-lah) = let's go / come on (possibly the most used Arabic word globally). Khalas (KHAH-lahs) = enough / done / finished. Insha'Allah = God willing. Habibi/Habibti (hah-BEE-bee) = my love / darling (m/f). \"Yalla habibi\" = come on, dear — used constantly."},
{title:"Questions",text:"Ma (MAH) = what. Man = who. Ayna (AY-nah) = where. Mata = when. Kayfa = how. Limadha = why. Kam = how much/many. \"Ayna al-masjid?\" = Where is the mosque? \"Kam al-sa'a?\" = What time is it? \"Ma hadha?\" = What is this?"},
{title:"Useful Short Phrases",text:"Tayyib (TAYY-ib) = okay/good. Mumtaz (moom-TAHZ) = excellent. Jamil/Jamila = beautiful (m/f). Kabir/Kabira = big. Saghir/Saghira = small. Jadid = new. Qadim = old. \"Hadha jamil!\" = This is beautiful!"},
],quiz:[
{q:"\"Yalla\" means?",opts:["Excited","Let's go / come on","An action","A greeting"],ans:1},
{q:"\"Khalas\" means?",opts:["Sad","A feeling","To sleep","Enough / done / finished"],ans:3},
{q:"\"Habibi\" means?",opts:["To dance","Happy","To run","My love — masculine"],ans:3},
{q:"\"La afham\" means?",opts:["To sleep","Surprised","I don't understand","Happy"],ans:2},
{q:"\"Shukran\" means?",opts:["To sleep","Excited","Thank you","A food item"],ans:2},
{q:"\"Ayna al-masjid?\" means?",opts:["A person","Angry","To run","Where is the mosque?"],ans:3},
]},
{id:"a5",title:"The Quran — A Beginner's Guide",desc:"Understand what the Quran is, how it's structured, and key surahs.",xp:20,unlockAfter:"a4",content:[
{title:"What is the Quran?",text:"The Quran (qur-AHN) is the holy book of Islam, believed to be the literal word of God revealed to Prophet Muhammad (peace be upon him) over 23 years through the angel Jibreel (Gabriel). It's written in Classical Arabic and has remained unchanged since its compilation. Every Muslim, regardless of native language, learns to recite it in Arabic."},
{title:"Structure",text:"The Quran has 114 chapters called Surahs (SOO-rahs). Each surah has verses called Ayahs (AH-yahs), meaning \"signs.\" The longest surah is Al-Baqarah (286 ayahs). The shortest is Al-Kawthar (3 ayahs). Surahs are roughly ordered by length (longest to shortest), not chronologically. The Quran is also divided into 30 equal parts called Juz (JOOZ), used to read the entire Quran during Ramadan (one juz per night)."},
{title:"Al-Fatiha — The Opening",text:"Surah Al-Fatiha is the first chapter and the most recited passage in Islam — it's said in every single unit of every prayer. It's 7 verses long. It praises God, asks for guidance, and declares reliance on God alone. If you learn ONE thing in Arabic, let it be Al-Fatiha. Shah recites this at least 17 times daily across his five prayers."},
{title:"Key Short Surahs",text:"Al-Ikhlas (112) = pure monotheism, 4 verses — \"Say: He is God, the One.\" Al-Falaq (113) = seeking refuge from evil. An-Nas (114) = seeking refuge in God from whispers. These three short surahs are recited frequently and are usually the first ones children memorize. They're the \"starter pack\" for Quran learning."},
{title:"Ayat al-Kursi — The Throne Verse",text:"Ayat al-Kursi (Surah 2, Verse 255) is considered the most powerful single verse of the Quran. It describes God's sovereignty over everything. Many Muslims recite it before sleep, after prayers, and for protection. Shah likely has this memorized by heart. It's about 2 minutes long when recited."},
{title:"How to Interact with the Quran",text:"The Quran should be handled with respect. Perform wudu (washing) before touching it. Place it on a clean, elevated surface, never on the floor. When someone is reciting, listen quietly. You don't need to be Muslim to read a translation, and asking questions about it shows genuine interest. Many translations with commentary (tafsir) are available."},

{title:"What IS the Quran?",text:"The central text of Islam — believed to be the literal word of God revealed to Prophet Muhammad over 23 years. It has 114 chapters (surahs), 6,236 verses (ayaat), about 77,000 words. Muslims believe every letter is divine and unchanged. Someone who memorizes the entire Quran is called a Hafiz."},
{title:"Structure of the Quran",text:"114 Surahs organized roughly by length. Each has a name: Al-Fatiha (The Opening), Al-Baqara (The Cow). Divided into 30 Juz for reading 1/30th per day during Ramadan. The first revealed verses were Surah Al-Alaq 96:1-5: Read! In the name of your Lord who created."},
{title:"Surahs Youll Hear Most",text:"Al-Fatiha — recited in EVERY prayer, most repeated passage. Al-Ikhlas — Say He is Allah, the One (summarizes monotheism). Al-Falaq and An-Nas — seeking protection. Ayat al-Kursi (2:255) — The Throne Verse, considered most powerful single verse. Shah likely recites these daily."},
{title:"How to Approach the Quran Respectfully",text:"Handle a physical copy with clean hands. Its kept on the highest shelf. Listen quietly during recitation. Sadaqallahul Azeem means God Almighty has spoken the truth — said after recitation. You can read English translations. Asking Shah to recite for you would be meaningful."},],quiz:[
{q:"How many surahs in the Quran?",opts:["36","100","28","114"],ans:3},
{q:"What is an Ayah?",opts:["42","100","A verse — literally \"sign\"","A feeling"],ans:2},
{q:"What is Al-Fatiha?",opts:["42","The opening chapter, recited in every prayer","28","A food item"],ans:1},
{q:"How many Juz is the Quran divided into?",opts:["A greeting","30","36","28"],ans:1},
{q:"Ayat al-Kursi is?",opts:["Sawm","The Throne Verse — considered most powerful single verse","Iman","Hadith"],ans:1},
{q:"Before touching the Quran, you should?",opts:["Sawm","Zakat","Perform wudu","Sunnah"],ans:2},
]},
{id:"a6",title:"The Islamic Calendar and Holidays",desc:"Understand the Islamic calendar, major holidays, and their significance.",xp:20,unlockAfter:"a5",content:[
{title:"The Hijri Calendar",text:"The Islamic calendar is lunar, based on moon sightings, not the sun. It has 12 months but is about 11 days shorter than the Gregorian calendar. This is why Ramadan \"moves\" each year — it shifts backward through the seasons. The calendar starts from the Hijra (the Prophet's migration from Mecca to Medina in 622 CE)."},
{title:"The 12 Months",text:"1. Muharram (sacred month). 2. Safar. 3. Rabi al-Awwal (Prophet's birth month). 4. Rabi al-Thani. 5. Jumada al-Ula. 6. Jumada al-Thani. 7. Rajab (sacred). 8. Sha'ban. 9. Ramadan (fasting month). 10. Shawwal (Eid al-Fitr). 11. Dhul Qi'dah (sacred). 12. Dhul Hijjah (Hajj month, sacred)."},
{title:"Eid al-Fitr — End of Ramadan",text:"The celebration marking the end of Ramadan fasting. Special morning prayer. New clothes, big meals, family visits. Children receive Eidi (money gifts). \"Eid Mubarak!\" = Blessed Eid. Lasts 1-3 days depending on the country. It's pure joy after 30 days of discipline. Everyone eats. A lot."},
{title:"Eid al-Adha — Festival of Sacrifice",text:"The bigger Eid, commemorating Prophet Ibrahim's willingness to sacrifice his son in obedience to God. Animals (usually goat, sheep, or cow) are sacrificed and the meat is divided into thirds: family, friends, and the poor. Occurs during the Hajj pilgrimage month. \"Eid Mubarak\" is the greeting for this too."},
{title:"Other Significant Dates",text:"Laylat al-Qadr = the Night of Power during last 10 days of Ramadan, when the Quran was first revealed. Worth more than 1,000 months of worship. Mawlid an-Nabi = the Prophet's birthday (celebrated by many, debated by some). Isra and Mi'raj = the Prophet's night journey to Jerusalem and ascension to heaven. 1st Muharram = Islamic New Year."},
{title:"How the Calendar Affects Daily Life",text:"New months start with actual moon sightings, so exact dates aren't known until the night before. This is why Ramadan and Eid dates are \"estimated\" — the community watches for the crescent moon. Fridays (Jumu'ah) are the weekly holy day with a special congregational prayer at noon. Shah adjusts his schedule around prayer times, which shift daily with the sun."},
],quiz:[
{q:"Why does Ramadan move each year?",opts:["Islamic calendar is lunar, 11 days shorter","To speak","Something different","Good morning"],ans:0},
{q:"What is Eid al-Adha?",opts:["12","Festival of Sacrifice","Something different","A greeting"],ans:1},
{q:"Laylat al-Qadr is?",opts:["Shawwal","Rabi al-Awwal","Muharram","Night of Power — worth 1,000+ months"],ans:3},
{q:"What starts the Islamic calendar?",opts:["Safar","Sha'ban","The Hijra — Prophet's migration","Ramadan"],ans:2},
{q:"Which month is Ramadan?",opts:["9th month","Thank you","Sorry","To pray"],ans:0},
{q:"How are new months determined?",opts:["Actual moon sighting","Ramadan","Sha'ban","Safar"],ans:0},
]},
{id:"a7",title:"The Five Pillars in Depth",desc:"Understand each pillar of Islam beyond just naming them.",xp:20,unlockAfter:"a6",content:[
{title:"Shahadah — Declaration of Faith",text:"\"La ilaha illallah, Muhammadur rasulullah\" = There is no god but God, and Muhammad is the messenger of God. This single sentence is the foundation of Islam. Saying it sincerely with understanding is what makes someone Muslim. It's whispered into a newborn's ear and is the last thing said to someone dying. Two concepts: God's oneness (Tawhid) and the Prophet's message."},
{title:"Salah — Prayer (Beyond the Basics)",text:"Five daily prayers are Fajr (dawn, 2 units), Dhuhr (noon, 4), Asr (afternoon, 4), Maghrib (sunset, 3), Isha (night, 4). A \"unit\" (rak'ah) is one cycle of standing, bowing, prostrating. Total: 17 rak'ahs per day. Each prayer has a window of time, not a fixed minute. Shah plans his day around these windows."},
{title:"Zakat — Charity",text:"Zakat is mandatory giving of 2.5% of your savings annually to those in need. It's not a donation, it's an obligation. The money belongs to the poor. Categories of recipients include the poor, those in debt, travelers in need, and new Muslims. Sadaqah is voluntary charity on top of Zakat. Islam views wealth as a trust from God, not personal property."},
{title:"Sawm — Fasting",text:"Fasting during Ramadan: no food, water, or intimate relations from Fajr (dawn) to Maghrib (sunset). But it goes deeper: fasting from gossip, anger, bad thoughts. Some Muslims also fast Mondays and Thursdays throughout the year, or 3 days each Islamic month, following the Prophet's practice. Fasting builds empathy, discipline, and gratitude."},
{title:"Hajj — Pilgrimage",text:"Every Muslim who is physically and financially able must perform Hajj at least once in their lifetime. It involves traveling to Mecca, wearing simple white garments (ihram), circling the Kaaba 7 times, standing at Arafat, and other rites over 5 days. Over 2 million people gather annually. It represents equality before God — kings and laborers wear the same white cloth."},

{title:"The Five Pillars Complete",text:"1. Shahada — Declaration of faith. 2. Salah — 5 daily prayers. 3. Zakat — 2.5% of wealth to those in need. 4. Sawm — Fasting during Ramadan. 5. Hajj — Pilgrimage to Mecca at least once if able. These arent optional — theyre the minimum requirements of Muslim life."},
{title:"Salah: The Daily Prayers",text:"5 prayers: Fajr (before sunrise ~5:30AM), Zuhr (after midday ~1PM), Asr (late afternoon ~4PM), Maghrib (after sunset ~6PM), Isha (nighttime ~8PM). Each takes 5-10 minutes. Involves standing, bowing, prostrating. Fajr 2 rakahs, Zuhr 4, Asr 4, Maghrib 3, Isha 4."},
{title:"How to Be Supportive During Prayer",text:"When Shah prays: dont walk in front of him, keep noise down, dont interrupt. He faces Qibla (direction of Mecca — roughly southeast from Edmonton). Before prayer he does Wudu (ritual washing). You dont need to join but quietly respecting the space is deeply appreciated."},
{title:"Zakat and Islamic Charity",text:"2.5% of qualifying wealth given annually to 8 categories including the poor and those in debt. Beyond Zakat theres Sadaqah (voluntary charity) — money, time, even a smile counts. During Ramadan giving increases dramatically. Shah might calculate his Zakat carefully — its taken very seriously."},],quiz:[
{q:"What is the Shahadah?",opts:["Something different","A feeling","42","Declaration that there is no god but God and Muhammad is His messenger"],ans:3},
{q:"How many rak'ahs total per day?",opts:["A food item","28","17","39"],ans:2},
{q:"Zakat is what percentage?",opts:["2.5% of savings","Sawm (fasting)","Shahada (declaration)","Hajj (pilgrimage)"],ans:0},
{q:"What does Hajj represent?",opts:["Shahada (declaration)","Salah (prayer)","Equality before God","Sawm (fasting)"],ans:2},
{q:"Sawm goes beyond food — what else?",opts:["Dessert","Gossip, anger, bad thoughts","Spice mix","Meat"],ans:1},
]},
{id:"a8",title:"Prophets and Key Figures",desc:"Know the major prophets mentioned in the Quran and why they matter.",xp:20,unlockAfter:"a7",content:[
{title:"Prophets Shared with Christianity and Judaism",text:"Islam recognizes 25 prophets by name in the Quran, many familiar from the Bible. Adam (Adam), Nuh (Noah), Ibrahim (Abraham), Musa (Moses), Isa (Jesus), Dawud (David), Sulayman (Solomon), Yusuf (Joseph), Yunus (Jonah). Muslims believe in ALL of them. The Quran tells many of the same stories with Islamic perspective."},
{title:"Ibrahim (Abraham) — The Father",text:"Ibrahim is central to Islam, Christianity, and Judaism. He's called \"Khalilullah\" (Friend of God). He built the Kaaba in Mecca with his son Ismail. The Hajj pilgrimage retraces his family's journey. Eid al-Adha commemorates his willingness to sacrifice his son. When you hear \"Ibrahimi\" tradition, it refers to the shared roots of all three faiths."},
{title:"Musa (Moses)",text:"Musa is mentioned more than any other prophet in the Quran (136 times). His story of confronting Pharaoh, parting the sea, receiving the Torah — all in the Quran with extensive detail. Muslims fast on Ashura (10th of Muharram) partly to commemorate Musa's liberation from Pharaoh. His story is about justice against tyranny."},
{title:"Isa (Jesus) in Islam",text:"Muslims believe Isa was a prophet and the Messiah, born of the Virgin Maryam (Mary) through a miracle. He performed miracles — healing the sick, raising the dead. However, Muslims do not believe he is the son of God or that he was crucified (believing God raised him to heaven). Mary (Maryam) has an entire surah named after her. She's the most honored woman in the Quran."},
{title:"Muhammad — The Final Prophet",text:"Muhammad (peace be upon him) is considered the last prophet, sent to all of humanity. Born in Mecca around 570 CE. Received the first Quran revelation at age 40 in the Cave of Hira. His character, sayings (hadith), and practices (sunnah) form the second source of Islamic guidance after the Quran. Saying \"peace be upon him\" (sallallahu alayhi wa sallam) after his name is a sign of respect."},
{title:"Why This Matters For You",text:"Understanding the prophets helps you understand Shah's worldview. When he says \"InshaAllah\" he's echoing Ibrahim's trust in God. The Ramadan fast connects to Musa's story. The Quran's emphasis on Jesus shows Islam's respect for other faiths. These aren't just historical figures — they're living examples that shape daily Muslim life."},
],quiz:[
{q:"How many prophets are named in the Quran?",opts:["A greeting","28","25","36"],ans:2},
{q:"Who built the Kaaba?",opts:["Ibrahim and his son Ismail","A stranger","Cousin","Uncle"],ans:0},
{q:"Which prophet is mentioned most in the Quran?",opts:["Musa/Moses — 136 times","Dawud","Sulayman","Nuh"],ans:0},
{q:"What do Muslims believe about Isa/Jesus?",opts:["Yusuf","A prophet and Messiah, not son of God","Maryam","Musa"],ans:1},
{q:"\"Sallallahu alayhi wa sallam\" means?",opts:["A greeting","A food item","Peace be upon him — said after Prophet Muhammad's name","Confused"],ans:2},
]},
{id:"a9",title:"Halal, Haram, and Islamic Ethics",desc:"Understand what these terms mean and how they shape daily decisions.",xp:25,unlockAfter:"a8",content:[
{title:"Halal and Haram — The Basics",text:"Halal (حلال) = permissible. Haram (حرام) = forbidden. These aren't just about food. Everything in life has a halal/haram dimension: business dealings, relationships, speech, entertainment, clothing. Between the two extremes is Makruh (discouraged but not sinful) and Mustahabb (encouraged but not required). Most of life falls in the permissible middle."},
{title:"Halal Food Rules",text:"Meat must be from an animal slaughtered in God's name (Bismillah), with a sharp knife cutting the throat, allowing blood to drain. Pork is completely haram. Alcohol is haram. Seafood is generally halal. Fruits, vegetables, grains are all halal. \"Zabiha\" refers to the specific Islamic slaughter method. When dining out, Shah looks for halal-certified restaurants or orders seafood/vegetarian as a safe option."},
{title:"Beyond Food",text:"Halal income means money earned through honest work, not fraud, exploitation, or dealing in haram products. Interest (riba) on loans is haram, which is why Islamic banking exists. Modest dress is expected. Gossip (gheebah) is considered haram — talking about someone behind their back in a way they'd dislike. Honesty in business and relationships is a religious obligation, not just a preference."},
{title:"The Gray Areas",text:"Many modern issues don't have clear-cut rulings. Music, photography, cryptocurrency, gelatin in food — scholars debate these. Shah might follow one scholarly opinion while another Muslim follows a different one. Both can be valid. \"Ikhtilaf\" (scholarly disagreement) is normal and respected in Islam. Never assume all Muslims follow the same rules on gray-area topics."},
{title:"Common Misconceptions",text:"Not all Arabic food is halal (many Arab Christians eat pork). Not all halal food is Arabic (Malaysian, Turkish, Pakistani food can all be halal). \"Halal\" on a label doesn't mean the food is special or blessed — it means it meets permissibility standards. And halal extends to how animals are treated in life, not just at slaughter. Animal welfare is an Islamic value."},
],quiz:[
{q:"What does \"Halal\" mean?",opts:["To run","A food item","To clean","Permissible"],ans:3},
{q:"What is \"Makruh\"?",opts:["A place","100","42","Discouraged but not sinful"],ans:3},
{q:"Why is Islamic banking different?",opts:["Makruh","Mubah","Interest/riba is haram","Sunnah"],ans:2},
{q:"Gheebah means?",opts:["Gossip/backbiting — considered haram","Makruh","Fard","Halal"],ans:0},
{q:"Do all Muslims follow the same rules on gray areas?",opts:["Fard","Makruh","No — scholarly disagreement is normal","Mustahabb"],ans:2},
]},
{id:"a10",title:"Arabic Grammar Basics (Part 1)",desc:"Understand Arabic sentence structure, root system, and basic grammar.",xp:25,unlockAfter:"a9",content:[
{title:"The Root System — Arabic's Superpower",text:"Almost every Arabic word comes from a 3-letter root that carries a core meaning. Root: ك-ت-ب (K-T-B) = related to writing. Kitab (كتاب) = book. Kataba = he wrote. Maktub = written/destiny. Maktaba = library. Katib = writer. One root, dozens of words. Once you know the root, you can guess related words. This system makes Arabic vocabulary incredibly logical."},
{title:"Sentence Types",text:"Arabic has two sentence types. Nominal (starts with a noun): \"Al-walad kabir\" = The boy is big. No \"is\" needed. Verbal (starts with a verb): \"Kataba al-walad\" = The boy wrote. Nominal sentences are for describing states. Verbal sentences are for actions. Simple rule: if it starts with \"Al-\" (the), it's probably nominal."},
{title:"Definite and Indefinite",text:"Al- (الـ) = \"the.\" Kitab = A book. Al-kitab = THE book. Adding \"Al-\" makes any noun definite. Indefinite nouns get tanwin (double vowel marks): kitabun = a book. This is simpler than it sounds: just add or remove \"Al-\" to switch between \"a\" and \"the.\""},
{title:"Gender in Arabic",text:"Arabic nouns are masculine or feminine. Most feminine nouns end in ta marbuta (ة): madrasa (school-f), jamila (beautiful-f). Masculine: walad (boy), kabir (big-m). Adjectives must match the noun's gender: walad kabir (big boy), bint kabira (big girl). Countries, cities, and body parts that come in pairs are usually feminine."},
{title:"Pronouns",text:"Ana (أنا) = I. Anta/Anti = you (m/f). Huwa = he. Hiya = she. Nahnu = we. Antum = you all. Hum = they. Arabic distinguishes between \"you\" for a male and \"you\" for a female. Every verb and adjective changes based on who you're talking to or about. This takes practice but makes Arabic very precise."},
{title:"Your First Arabic Sentences",text:"\"Ana muslim/muslima\" = I am Muslim (m/f). \"Hadha kitab\" = This is a book. \"Hal anta tayyib?\" = Are you well? \"Al-masjid kabir\" = The mosque is big. \"Uridu ma'\" = I want water. Notice: no \"is/am/are\" in present tense Arabic. \"Ana tayyib\" = I (am) fine. The verb \"to be\" is implied."},
],quiz:[
{q:"The root K-T-B relates to?",opts:["Root word","Writing","Suffix","Verb"],ans:1},
{q:"\"Al-\" means?",opts:["To sleep","Something different","The","To speak"],ans:2},
{q:"Most feminine nouns end in?",opts:["Suffix","Adjective","Subject","Ta marbuta ة"],ans:3},
{q:"\"Ana\" means?",opts:["Confused","Sad","I","An action"],ans:2},
{q:"Arabic has how many sentence types?",opts:["Two — nominal and verbal","28","39","12"],ans:0},
{q:"\"Hadha kitab\" means?",opts:["An action","Surprised","This is a book","To sing"],ans:2},
]},
{id:"a11",title:"Arabic Grammar Basics (Part 2)",desc:"Verb conjugation basics, plurals, and practical grammar.",xp:25,unlockAfter:"a10",content:[
{title:"Past Tense Verbs",text:"Arabic past tense adds suffixes to the root. Kataba = he wrote. Katabat = she wrote. Katabtu = I wrote. Katabta = you wrote (male). Katabti = you wrote (female). Katabna = we wrote. Pattern: root stays the same, endings change for who did the action. This is consistent across almost all Arabic verbs."},
{title:"Present Tense Verbs",text:"Present tense adds prefixes AND suffixes. Yaktub = he writes. Taktub = she writes / you write (m). Taktubeen = you write (f). Aktub = I write. Naktub = we write. Prefix tells you who: Ya- (he), Ta- (she/you), A- (I), Na- (we). With past and present tense, you can describe 90% of daily actions."},
{title:"Plurals — It Gets Creative",text:"Arabic has regular plurals (add suffix) and \"broken\" plurals (the word pattern changes internally). Kitab (book) becomes kutub (books). Walad (boy) becomes awlad (boys). Madrasa (school) becomes madaris (schools). There's no simple rule for broken plurals — you learn them with each word. The upside: once you know the pattern, it's very satisfying."},
{title:"Possessives",text:"Add suffixes to show possession. Kitabi = my book. Kitabuka = your book (m). Kitabuha = her book. Kitabuhu = his book. Kitabuna = our book. The same suffixes work on any noun: bayti = my house. Ismi = my name. \"Ma ismuka?\" = What is your name? \"Ismi Shah\" = My name is Shah."},
{title:"Prepositions",text:"Fi (في) = in. Min (من) = from. Ila (إلى) = to. Ma'a (مع) = with. 'Ala (على) = on. 'Ind (عند) = at/with (possession). \"Ana fi al-bayt\" = I am in the house. \"Min ayna anta?\" = Where are you from? \"'Indi su'al\" = I have a question (literally: \"at me is a question\")."},
{title:"Numbers with Nouns",text:"Arabic number-noun agreement is famously complex. The short version: 1-2 agree with gender, 3-10 take the OPPOSITE gender, 11+ get simpler. \"Thalath kutub\" (3 books — thalath is feminine even though kutub is masculine). Don't stress this. Even native speakers sometimes pause on number agreement. Use the number and the noun and you'll be understood."},
],quiz:[
{q:"\"Katabat\" means?",opts:["Surprised","She wrote","A place","A feeling"],ans:1},
{q:"Present tense prefix \"Ya-\" means?",opts:["He","A place","Happy","A greeting"],ans:0},
{q:"\"Kutub\" is the plural of?",opts:["Sorry","Kitab — books","To speak","To run"],ans:1},
{q:"\"Ismi\" means?",opts:["Tired","Something different","My name","To dance"],ans:2},
{q:"\"Fi\" means?",opts:["To eat","Scared","In","To cook"],ans:2},
{q:"\"'Indi\" means?",opts:["I have / at me","A feeling","Sad","An action"],ans:0},
]},
{id:"a12",title:"Common Arabic Expressions and Slang",desc:"Everyday Arabic beyond religious phrases.",xp:25,unlockAfter:"a11",content:[
{title:"The Must-Know Casual Words",text:"Yalla (YAL-lah) = let's go / come on / hurry up — the Swiss Army knife of Arabic. Khalas (KHAH-lahs) = done / enough / stop. Habibi/Habibti = my love (m/f) — used for everyone, not just romantic partners. \"Yalla khalas\" = come on, let's finish this. \"Yalla habibi, yalla\" = the most Arab sentence ever constructed."},
{title:"Expressions of Amazement",text:"Wallahi (wah-LAH-hee) = I swear by God — used casually ALL the time. \"Wallahi?\" = Really? Ya salaam = oh peace (wow). \"Mashallah\" for admiration. \"Ajib\" (ah-JEEB) = amazing/weird (context dependent). Allah akbar = God is greatest (used in prayer AND casually for surprise, amazement, or distress)."},
{title:"Food and Hospitality",text:"Sahtain (sahh-TAYN) = literally \"two healths,\" said like \"bon appetit.\" Yislamu ideik/ideiki = bless your hands (m/f) (complimenting the cook). Tafaddal/Tafaddali = please, go ahead, help yourself (m/f). \"Tafaddal, kul\" = please, eat. Arabs will insist you eat. Refusing three times is the minimum before they'll accept your \"no\" (and they still might not)."},
{title:"Frustration and Annoyance",text:"Ya'ni (YAH-nee) = means/like/I mean (the ultimate filler word). Bas (BAHS) = enough/stop. \"Haram\" (in casual use) = that's wrong/unfair/poor thing (not always the religious meaning). \"Ya haram\" = oh poor thing. \"Mish mumkin\" = not possible / unbelievable. \"Shu hal qissa?\" = What is this story/situation?"},
{title:"Agreement and Feelings",text:"Inshallah = God willing (also: maybe/probably not, depending on tone). Tamam (tah-MAHM) = perfect/good. Mazbut (mahz-BOOT) = correct/exactly. \"Ahlan\" = welcome/hey. \"Kifak/Kifik?\" = How are you? (Levantine Arabic, m/f). \"Mnih/Mniha\" = good/fine (m/f). These are Levantine (Syrian/Lebanese) versions — Arabic varies heavily by region."},
{title:"A Note on Dialects",text:"Modern Standard Arabic (MSA/Fusha) is what's in the Quran and news. But nobody speaks it casually. Every Arab country has its own dialect. Egyptian, Levantine (Syrian/Lebanese), Gulf, North African — they can be as different as Spanish and Italian. The religious Arabic you're learning (Quranic) is Fusha. Casual phrases above are mostly Levantine/Gulf. Shah's family likely uses Urdu for daily talk and Arabic only for religious context."},
],quiz:[
{q:"\"Yalla\" means?",opts:["Excited","Let's go / come on","An action","A greeting"],ans:1},
{q:"\"Wallahi\" is used as?",opts:["A feeling","Sorry","I swear — casual emphasis","Something different"],ans:2},
{q:"\"Sahtain\" means?",opts:["A person","Confused","To eat","Bon appetit — two healths"],ans:3},
{q:"\"Ya'ni\" means?",opts:["Scared","An action","Means / like / I mean — filler word","Surprised"],ans:2},
{q:"What's the difference between MSA and dialects?",opts:["Assalamu Alaikum","Achha","Chalo","MSA is formal/religious, dialects are spoken daily"],ans:3},
]},
{id:"a13",title:"Islamic Etiquette and Manners (Adab)",desc:"The Islamic code of manners that shapes Muslim daily life.",xp:25,unlockAfter:"a12",content:[
{title:"Greeting Etiquette",text:"Always initiate the salam (Assalamu Alaikum). The one who greets first is considered better. Respond with equal or greater greeting. Handshakes are common between same gender. Cross-gender contact varies by individual/culture — follow the other person's lead. Shah's family may or may not shake hands with the opposite gender. Don't be offended either way."},
{title:"Eating Etiquette",text:"Eat with the right hand (the left hand is considered unclean in Islamic and South Asian culture). Say Bismillah before eating. Eat from what's directly in front of you, not from the middle or others' sides. Don't waste food. Say Alhamdulillah after finishing. If eating from a shared plate (common in desi culture), these rules matter even more."},
{title:"Home Etiquette",text:"Remove shoes when entering. Say Assalamu Alaikum when entering, even your own home. Ask permission before entering someone's room (knock three times, if no answer, leave). The right side is preferred: enter with the right foot, eat with the right hand, give and receive with the right. Guests are honored — the Prophet said a guest has rights for three days."},
{title:"Mosque Etiquette",text:"Enter with the right foot, say the dua for entering the masjid. Keep your voice low. Phones on silent. Don't walk in front of someone praying. Sit quietly if you're waiting. Friday (Jumu'ah) prayers are congregational and the khutbah (sermon) should be listened to in silence. Women and men have separate prayer areas. Both areas should be respected equally."},
{title:"Speech and Social Manners",text:"Avoid gossip (gheebah), lying, and backbiting — all explicitly forbidden. Keep promises. Lower your gaze (don't stare). Say \"yarhamukallah\" (God have mercy on you) when someone sneezes and they say Alhamdulillah. Cover your mouth when yawning. Visit the sick. Attend funerals. These aren't just nice things — they're considered religious obligations."},
{title:"How This Shapes Shah's Behavior",text:"If Shah eats with his right hand, now you know why. If he says Bismillah automatically, it's not performative — it's habitual from childhood. If he avoids certain social situations, it might be religious boundaries, not antisocial behavior. If he's generous with guests, it's prophetic tradition. Understanding the WHY behind his habits deepens your connection."},
],quiz:[
{q:"Which hand should you eat with?",opts:["Rice","Tea","Right","Bread"],ans:2},
{q:"What do you say when entering a home?",opts:["Taqwa (God-consciousness)","Shukr (gratitude)","Assalamu Alaikum","Sabr (patience)"],ans:2},
{q:"What is \"gheebah\"?",opts:["A greeting","An action","The opposite","Gossip/backbiting — forbidden"],ans:3},
{q:"What do you say when someone sneezes?",opts:["Taqwa (God-consciousness)","Tawakkul (trust in God)","Ihsan (excellence)","Yarhamukallah"],ans:3},
{q:"Guests have rights for how long?",opts:["Tawakkul (trust in God)","Sabr (patience)","Shukr (gratitude)","Three days, per the Prophet's teaching"],ans:3},
]},
{id:"a14",title:"Building Bridges — Islam and Other Faiths",desc:"Understand how Islam relates to other religions and how to navigate interfaith relationships.",xp:25,unlockAfter:"a13",content:[
{title:"People of the Book",text:"The Quran refers to Jews and Christians as \"Ahl al-Kitab\" (People of the Book), recognizing that they received earlier revelations from God. Muslims believe the Torah, Psalms, and Gospel were all divine in origin. Islam sees itself as a continuation and completion of the Abrahamic tradition, not a replacement."},
{title:"No Compulsion in Religion",text:"\"La ikraha fi al-deen\" (Quran 2:256) = There is no compulsion in religion. This verse is foundational. Shah's relationship with Dane across faith backgrounds is supported by this principle. Islam requires respect for others' beliefs. Forced conversion is explicitly forbidden. Learning about each other's traditions is encouraged, not discouraged."},
{title:"Common Ground",text:"Islam shares core values with many faiths: monotheism, charity, honesty, family, community, justice, care for the vulnerable, gratitude, humility. The Quran tells stories of the same prophets revered in Judaism and Christianity. Finding common ground isn't about erasing differences — it's about building understanding on shared values."},
{title:"Navigating Differences",text:"You don't need to agree on theology to respect each other's practice. Shah prays five times — you can support that without praying yourself. You might celebrate different holidays — celebrate both. Dietary differences (halal) are practical to navigate with communication. \"I respect this\" is always the right response, even if you don't fully understand yet."},
{title:"What \"Support\" Looks Like",text:"Learn the basics of what Shah practices (you're doing this right now). Ask questions with genuine curiosity, not interrogation. Attend an iftar if invited. Learn to say Bismillah before meals together. Respect prayer times. Don't apologize for being who you are. A healthy interfaith relationship is two people growing together, not one person converting."},
{title:"The Big Picture",text:"The Quran says \"We made you into nations and tribes so you may know one another\" (49:13). Diversity is intentional. Your relationship across cultures and faith backgrounds is exactly what this verse describes. Every lesson you learn, every phrase you practice, every effort you make to understand — that's the knowing one another part. That's the whole point."},
],quiz:[
{q:"\"Ahl al-Kitab\" means?",opts:["People of the Book — Jews and Christians","Something different","To pray","Excited"],ans:0},
{q:"\"La ikraha fi al-deen\" means?",opts:["An action","Happy","To run","No compulsion in religion"],ans:3},
{q:"What prophets are shared?",opts:["Salah","Tawhid","Dua","Adam, Noah, Abraham, Moses, Jesus, and others"],ans:3},
{q:"What does support look like?",opts:["Sunnah","Learn, ask questions, respect practices, be yourself","Ihsan","Tawhid"],ans:1},
{q:"Quran 49:13 says diversity exists so people may?",opts:["Salah","Know one another","Shahada","Dua"],ans:1},
]},
],
words:[{w:"Allah",m:"God",cat:"Religious Terms"},{w:"Bismillah",m:"In the name of God",cat:"Religious Terms"},{w:"Alhamdulillah",m:"Praise God",cat:"Religious Terms"},{w:"InshaAllah",m:"God willing",cat:"Religious Terms"},{w:"MashaAllah",m:"God has willed it",cat:"Religious Terms"},{w:"SubhanAllah",m:"Glory to God",cat:"Religious Terms"},{w:"Astaghfirullah",m:"I seek forgiveness",cat:"Religious Terms"},{w:"Allahu Akbar",m:"God is Greatest",cat:"Religious Terms"},{w:"JazakAllah khayr",m:"May God reward you with good",cat:"Religious Terms"},{w:"BarakAllah feek",m:"May God bless you",cat:"Religious Terms"},{w:"La ilaha illallah",m:"No god but God",cat:"Religious Terms"},{w:"Sallallahu alayhi wa sallam",m:"Peace be upon him",cat:"Religious Terms"},{w:"Ameen",m:"Amen",cat:"Religious Terms"},{w:"Tawba",m:"Repentance",cat:"Religious Terms"},{w:"Wallahi",m:"I swear by God",cat:"Religious Terms"},{w:"Salah",m:"Prayer",cat:"Prayer & Worship"},{w:"Wudu",m:"Ablution/Washing",cat:"Prayer & Worship"},{w:"Qibla",m:"Direction of Mecca",cat:"Prayer & Worship"},{w:"Rak\'ah",m:"Prayer unit",cat:"Prayer & Worship"},{w:"Ruku",m:"Bowing",cat:"Prayer & Worship"},{w:"Sujud",m:"Prostration",cat:"Prayer & Worship"},{w:"Fajr",m:"Dawn prayer",cat:"Prayer & Worship"},{w:"Zuhr",m:"Noon prayer",cat:"Prayer & Worship"},{w:"Asr",m:"Afternoon prayer",cat:"Prayer & Worship"},{w:"Maghrib",m:"Sunset prayer",cat:"Prayer & Worship"},{w:"Isha",m:"Night prayer",cat:"Prayer & Worship"},{w:"Jumu\'ah",m:"Friday prayer",cat:"Prayer & Worship"},{w:"Khutbah",m:"Sermon",cat:"Prayer & Worship"},{w:"Dua",m:"Supplication/Personal prayer",cat:"Prayer & Worship"},{w:"Dhikr",m:"Remembrance of God",cat:"Prayer & Worship"},{w:"Tasbih",m:"Prayer beads/Glorification",cat:"Prayer & Worship"},{w:"Masjid",m:"Mosque",cat:"Prayer & Worship"},{w:"Imam",m:"Prayer leader",cat:"Prayer & Worship"},{w:"Quran",m:"Holy Book",cat:"Quran & Knowledge"},{w:"Surah",m:"Chapter",cat:"Quran & Knowledge"},{w:"Ayah",m:"Verse (literally \"sign\")",cat:"Quran & Knowledge"},{w:"Juz",m:"One-thirtieth of Quran",cat:"Quran & Knowledge"},{w:"Al-Fatiha",m:"Opening chapter",cat:"Quran & Knowledge"},{w:"Hadith",m:"Prophetic saying",cat:"Quran & Knowledge"},{w:"Sunnah",m:"Prophet\'s practice",cat:"Quran & Knowledge"},{w:"Tafsir",m:"Quran interpretation",cat:"Quran & Knowledge"},{w:"Ilm",m:"Knowledge",cat:"Quran & Knowledge"},{w:"Hikmah",m:"Wisdom",cat:"Quran & Knowledge"},{w:"Fiqh",m:"Islamic jurisprudence",cat:"Quran & Knowledge"},{w:"Fatwa",m:"Religious ruling",cat:"Quran & Knowledge"},{w:"Halal",m:"Permissible",cat:"Quran & Knowledge"},{w:"Haram",m:"Forbidden",cat:"Quran & Knowledge"},{w:"Makruh",m:"Discouraged",cat:"Quran & Knowledge"},{w:"Ramadan",m:"Fasting month",cat:"Calendar & Events"},{w:"Eid",m:"Celebration",cat:"Calendar & Events"},{w:"Eid Mubarak",m:"Blessed celebration",cat:"Calendar & Events"},{w:"Iftar",m:"Breaking fast meal",cat:"Calendar & Events"},{w:"Suhoor",m:"Pre-dawn meal",cat:"Calendar & Events"},{w:"Hajj",m:"Pilgrimage to Mecca",cat:"Calendar & Events"},{w:"Umrah",m:"Minor pilgrimage",cat:"Calendar & Events"},{w:"Hijra",m:"Migration",cat:"Calendar & Events"},{w:"Laylat al-Qadr",m:"Night of Power",cat:"Calendar & Events"},{w:"Taraweeh",m:"Ramadan night prayers",cat:"Calendar & Events"},{w:"Mawlid",m:"Prophet\'s birthday",cat:"Calendar & Events"},{w:"Muharram",m:"First Islamic month",cat:"Calendar & Events"},{w:"Marhaba",m:"Hello",cat:"Daily Arabic"},{w:"Shukran",m:"Thank you",cat:"Daily Arabic"},{w:"Afwan",m:"You\'re welcome",cat:"Daily Arabic"},{w:"Na\'am",m:"Yes",cat:"Daily Arabic"},{w:"La",m:"No",cat:"Daily Arabic"},{w:"Min fadlak",m:"Please (m)",cat:"Daily Arabic"},{w:"Yalla",m:"Let\'s go",cat:"Daily Arabic"},{w:"Khalas",m:"Done/Enough",cat:"Daily Arabic"},{w:"Habibi/Habibti",m:"My love (m/f)",cat:"Daily Arabic"},{w:"Tamam",m:"Perfect/Good",cat:"Daily Arabic"},{w:"Ya\'ni",m:"Means/Like",cat:"Daily Arabic"},{w:"Sahtain",m:"Bon appetit",cat:"Daily Arabic"},{w:"Tafaddal",m:"Go ahead/Help yourself",cat:"Daily Arabic"},{w:"Mazbut",m:"Correct/Exactly",cat:"Daily Arabic"},{w:"Iman",m:"Faith",cat:"Character & Values"},{w:"Taqwa",m:"God-consciousness",cat:"Character & Values"},{w:"Sabr",m:"Patience",cat:"Character & Values"},{w:"Shukr",m:"Gratitude",cat:"Character & Values"},{w:"Tawakkul",m:"Trust in God",cat:"Character & Values"},{w:"Ihsan",m:"Excellence/Beauty",cat:"Character & Values"},{w:"Adl",m:"Justice",cat:"Character & Values"},{w:"Rahma",m:"Mercy",cat:"Character & Values"},{w:"Ummah",m:"Muslim community",cat:"Character & Values"},{w:"Deen",m:"Religion/Way of life",cat:"Character & Values"},{w:"Akhlaq",m:"Character/Ethics",cat:"Character & Values"},{w:"Adab",m:"Manners/Etiquette",cat:"Character & Values"},{w:"Hayaa",m:"Modesty",cat:"Character & Values"},{w:"Sidq",m:"Truthfulness",cat:"Character & Values"},{w:"Amanah",m:"Trust/Trustworthiness",cat:"Character & Values"}],
},
};

// Distinct cover art — each episode gets unique visual
function Cv({size=48,v="main",r=4,sh}){
  const designs={
    main:{bg:["#0A3D2B","#14724A"],icon:"☕",label:"Tea Sessions"},
    ep1:{bg:["#1E3264","#3D7CE0"],icon:"☽",label:"Ramadan"},
    ep2:{bg:["#5B2C6F","#A569BD"],icon:"\u2764",label:"Feelings"},
    ep3:{bg:["#7D3C0A","#E67E22"],icon:"✧",label:"Allah"},
    shah:{bg:["#922B21","#E74C3C"],icon:"\u2661",label:"From Shah",ck:"ramadan_browse"},
    ramadan:{bg:["#7D5A1A","#D4A84B"],icon:"\u2606",label:"Day 14"},
  };
  const d=designs[v]||designs.main;const full=size>=999;
  const sz=full?999:size;const showLabel=sz>80;const showIcon=sz>30;
  return(<div style={{width:full?"100%":size,height:full?"100%":size,borderRadius:r,flexShrink:0,background:`linear-gradient(145deg,${d.bg[0]},${d.bg[1]})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:showLabel?4:0,boxShadow:sh?"0 8px 30px rgba(0,0,0,0.4)":"none",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"-20%",right:"-15%",width:"60%",height:"60%",borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
    <div style={{position:"absolute",bottom:"-10%",left:"-10%",width:"40%",height:"40%",borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
    {showIcon&&<span style={{fontSize:sz>200?48:sz>100?28:sz>55?16:12,filter:"brightness(1.1)",position:"relative",zIndex:1}}>{d.icon}</span>}
    {showLabel&&<p style={{color:"rgba(255,255,255,0.9)",fontSize:sz>200?14:sz>100?10:8,fontWeight:700,letterSpacing:0.5,margin:0,position:"relative",zIndex:1,textTransform:"uppercase"}}>{d.label}</p>}
  </div>);
}

function Shell({children,dark}){return(<div className="dc-shell" style={{width:"100%",maxWidth:480,height:"100vh",margin:"0 auto",overflow:"hidden",position:"relative",background:dark?WD.bg:S.black,transition:"background 0.3s"}}><style>{CSS}</style>{children}</div>);}

function NavBar({active,go}){const W=useW();const warm=["learn","us"].includes(active);const items=[{id:"home",label:"Home",d:"M13 3L3 9v12h7v-7h4v7h7V9z"},{id:"browse",label:"Tea",d:"M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm10 0h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm10 0h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1z"},{id:"learn",label:"Learn",d:"M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"},{id:"us",label:"Us",d:"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"}];return(<div style={{position:"absolute",bottom:0,left:0,right:0,paddingBottom:"max(16px, env(safe-area-inset-bottom))",paddingTop:12,background:warm?`linear-gradient(transparent,${W.bg}ee 20%)`:"linear-gradient(transparent,rgba(0,0,0,0.95) 20%)",display:"flex",alignItems:"center",justifyContent:"space-around",zIndex:40,transition:"background 0.3s"}}>{items.map(({id,label,d})=>{const a=active===id;const col=a?(warm?W.forest:S.white):(warm?W.textMuted:S.muted);return(<button key={id} onClick={()=>go(id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:col,padding:"6px 16px",minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill={col}><path d={d}/></svg><span style={{fontSize:10,fontWeight:a?700:400}}>{label}</span></button>);})}</div>);}

function Home({go}){
  const {user}=useUser()||{user:'shah'};const name=user==='shah'?'Shah':'Dane';const partner=user==='shah'?'Dane':'Shah';
  const xp=local.get(user+'_xp',0);const completed=local.get(user+'_completed',[]);const streak=local.get(user+'_streak',0);
  // Thinking of you — Supabase realtime with localStorage fallback
  const [vibes,setVibes]=useState(()=>local.get('dc_vibes',[]));
  const [vibesLoaded,setVibesLoaded]=useState(false);

  useEffect(()=>{
    let channel;
    initSupabase.then(()=>{
      if(!supabase){setVibesLoaded(true);return;}
      // Load from Supabase
      supabase.from('dc_vibes').select('*').order('created_at',{ascending:false}).limit(20)
        .then(({data})=>{if(data&&data.length)setVibes(data);setVibesLoaded(true);})
        .catch(()=>setVibesLoaded(true));
      // Realtime
      try{
        channel=supabase.channel('vibes-realtime')
          .on('postgres_changes',{event:'INSERT',schema:'public',table:'dc_vibes'},payload=>{
            const nv=payload.new;
            setVibes(prev=>[nv,...prev]);
            if(nv.to_user===user){
              notif.notify(nv.from_user==='shah'?'Shah':'Dane',nv.emoji+' '+nv.label,{tag:'vibe-'+nv.id});
            }
          })
          .on('postgres_changes',{event:'UPDATE',schema:'public',table:'dc_vibes'},payload=>{
            setVibes(prev=>prev.map(v=>v.id===payload.new.id?payload.new:v));
          })
          .subscribe();
      }catch(e){}
    });
    return()=>{if(channel)try{supabase.removeChannel(channel);}catch(e){}};
  },[user]);

  const lastVibe=vibes.find(v=>v.to_user===user&&!v.read);

  const sendVibe=async(emoji,label,custom)=>{
    const msg=custom||label;
    const v={id:Date.now(),from_user:user,to_user:user==='shah'?'dane':'shah',emoji,label:msg,read:false,created_at:new Date().toISOString()};
    if(supabase){
      try{await supabase.from('dc_vibes').insert({from_user:v.from_user,to_user:v.to_user,emoji,label:msg,read:false});}
      catch(e){/* fallback below */setVibes(prev=>[v,...prev]);local.set('dc_vibes',[v,...vibes]);}
    }else{
      setVibes(prev=>[v,...prev]);local.set('dc_vibes',[v,...vibes]);
    }
    setShowSend(false);setCustomMsg("");
  };

  const markRead=async()=>{
    if(!lastVibe)return;
    if(supabase)try{await supabase.from('dc_vibes').update({read:true}).eq('id',lastVibe.id);}catch(e){}
    setVibes(prev=>prev.map(v=>v.id===lastVibe.id?{...v,read:true}:v));
    local.set('dc_vibes',vibes.map(v=>v.id===lastVibe.id?{...v,read:true}:v));
  };
  const [showSend,setShowSend]=useState(false);const [customMsg,setCustomMsg]=useState("");
  const QUICK_VIBES=[
    {emoji:"🤲",label:"Made dua for you"},
    {emoji:"💛",label:"Thinking of you"},
    {emoji:"🌙",label:"Ramadan Mubarak"},
    {emoji:"💪",label:"You got this"},
    {emoji:"🫂",label:"Sending a hug"},
    {emoji:"📿",label:"Praying for us"},
    {emoji:"☀️",label:"Good morning habibi"},
    {emoji:"🌸",label:"You make me proud"},
  ];
  // Ramadan data
  const R=[
    {d:1,dt:"Feb 18",fajr:"5:49",mag:"5:53"},{d:2,dt:"Feb 19",fajr:"5:47",mag:"5:55"},
    {d:3,dt:"Feb 20",fajr:"5:45",mag:"5:57"},{d:4,dt:"Feb 21",fajr:"5:43",mag:"5:59"},
    {d:5,dt:"Feb 22",fajr:"5:41",mag:"6:01"},{d:6,dt:"Feb 23",fajr:"5:39",mag:"6:03"},
    {d:7,dt:"Feb 24",fajr:"5:37",mag:"6:05"},{d:8,dt:"Feb 25",fajr:"5:35",mag:"6:07"},
    {d:9,dt:"Feb 26",fajr:"5:33",mag:"6:09"},{d:10,dt:"Feb 27",fajr:"5:30",mag:"6:11"},
    {d:11,dt:"Feb 28",fajr:"5:28",mag:"6:13"},{d:12,dt:"Mar 1",fajr:"5:26",mag:"6:15"},
    {d:13,dt:"Mar 2",fajr:"5:24",mag:"6:17"},{d:14,dt:"Mar 3",fajr:"5:21",mag:"6:18"},
    {d:15,dt:"Mar 4",fajr:"5:19",mag:"6:20"},{d:16,dt:"Mar 5",fajr:"5:17",mag:"6:22"},
    {d:17,dt:"Mar 6",fajr:"5:14",mag:"6:24"},{d:18,dt:"Mar 7",fajr:"5:12",mag:"6:26"},
    {d:19,dt:"Mar 8",fajr:"6:09",mag:"7:28"},{d:20,dt:"Mar 9",fajr:"6:07",mag:"7:30"},
    {d:21,dt:"Mar 10",fajr:"6:04",mag:"7:32"},{d:22,dt:"Mar 11",fajr:"6:02",mag:"7:34"},
    {d:23,dt:"Mar 12",fajr:"5:59",mag:"7:35"},{d:24,dt:"Mar 13",fajr:"5:56",mag:"7:37"},
    {d:25,dt:"Mar 14",fajr:"5:54",mag:"7:39"},{d:26,dt:"Mar 15",fajr:"5:51",mag:"7:41"},
    {d:27,dt:"Mar 16",fajr:"5:48",mag:"7:43"},{d:28,dt:"Mar 17",fajr:"5:46",mag:"7:45"},
    {d:29,dt:"Mar 18",fajr:"5:43",mag:"7:47"},{d:30,dt:"Mar 19",fajr:"5:40",mag:"7:48"},
  ];
  const ramStart=new Date(2026,1,18);
  const dayNum=Math.max(1,Math.min(30,Math.floor((new Date()-ramStart)/(1000*60*60*24))+1));
  const td=R[dayNum-1]||R[0];
  const hr=new Date().getHours();
  const greeting=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  // Additional prayer times for Edmonton (approximate for late Feb - mid March 2026)
  const prayers=[
    {name:"Fajr",time:td.fajr,active:hr<6},{name:"Zuhr",time:"12:45",active:hr>=6&&hr<13},
    {name:"Asr",time:"3:45",active:hr>=13&&hr<16},{name:"Maghrib",time:td.mag,active:hr>=16&&hr<19},
    {name:"Isha",time:"8:45",active:hr>=19}
  ];
  const nextPrayer=prayers.find(p=>p.active)||prayers[0];

  // Words of the Day — one from each language
  const URDU_W=[
    {w:"Shukriya",m:"Thank you",r:"shuk-REE-ya"},{w:"Dil",m:"Heart",r:"dil"},
    {w:"Kya haal hai?",m:"How are you?",r:"kya HAAL hai"},{w:"Chai",m:"Tea",r:"chai"},
    {w:"Meri jaan",m:"My life (endearment)",r:"ME-ri jaan"},{w:"Acha",m:"OK / Really?",r:"a-CHA"},
    {w:"Khush",m:"Happy",r:"khush"},{w:"Mohabbat",m:"Love",r:"mo-HAB-bat"},
    {w:"Ghar",m:"Home",r:"ghar"},{w:"Paani",m:"Water",r:"PAA-ni"},
    {w:"Theek hai",m:"It's fine",r:"THEEK hai"},{w:"Bohut acha",m:"Very good",r:"bo-HUT a-CHA"},
    {w:"Khaana",m:"Food",r:"KHAA-na"},{w:"Suno",m:"Listen",r:"su-NO"},
    {w:"Pyaar",m:"Love",r:"pyaar"},
  ];
  const TAGALOG_W=[
    {w:"Mahal kita",m:"I love you",r:"ma-HAL kee-TA"},{w:"Magandang umaga",m:"Beautiful morning",r:"ma-gan-DANG oo-MA-ga"},
    {w:"Salamat po",m:"Thank you (respectful)",r:"sa-LA-mat po"},{w:"Kumain ka na?",m:"Have you eaten?",r:"ku-MA-in ka na"},
    {w:"Mahal",m:"Love / Expensive",r:"ma-HAL"},{w:"Ingat",m:"Take care",r:"i-NGAT"},
    {w:"Miss na kita",m:"I miss you",r:"miss na kee-TA"},{w:"Opo",m:"Yes (respectful)",r:"o-PO"},
    {w:"Mabuhay",m:"Long live / Welcome",r:"ma-BU-hai"},{w:"Masarap",m:"Delicious",r:"ma-sa-RAP"},
    {w:"Maganda",m:"Beautiful",r:"ma-gan-DA"},{w:"Gutom na ako",m:"I'm hungry",r:"gu-TOM na a-KO"},
    {w:"Tara",m:"Let's go",r:"ta-RA"},{w:"Sige",m:"OK / Go ahead",r:"si-GE"},
    {w:"Tulog na",m:"Sleep now",r:"tu-LOG na"},
  ];
  const ARABIC_W=[
    {w:"Bismillah",m:"In the name of God",r:"bis-MIL-lah"},{w:"Assalamu alaikum",m:"Peace be upon you",r:"as-sa-LAA-mu a-LAI-kum"},
    {w:"Alhamdulillah",m:"Praise God",r:"al-HAM-du-LIL-lah"},{w:"InshaAllah",m:"God willing",r:"in-SHA-al-lah"},
    {w:"SubhanAllah",m:"Glory to God",r:"sub-HAN-al-lah"},{w:"JazakAllah",m:"May God reward you",r:"ja-ZAK-al-lah"},
    {w:"MashaAllah",m:"God has willed it",r:"MA-sha-al-lah"},{w:"Tawakkul",m:"Trust in God",r:"ta-WAK-kul"},
    {w:"Sabr",m:"Patience",r:"sa-br"},{w:"Shukr",m:"Gratitude",r:"shukr"},
    {w:"Hayati",m:"My life",r:"ha-YA-ti"},{w:"Yalla",m:"Let's go",r:"YAL-la"},
    {w:"Habibi",m:"My love (m)",r:"ha-BEE-bi"},{w:"Khalas",m:"Done / Enough",r:"KHA-las"},
    {w:"Tamam",m:"Perfect",r:"ta-MAM"},
  ];
  const todayIdx=Math.floor(Date.now()/86400000);
  const wotdU=URDU_W[todayIdx%URDU_W.length];
  const wotdT=TAGALOG_W[todayIdx%TAGALOG_W.length];
  const wotdA=ARABIC_W[todayIdx%ARABIC_W.length];
  const todayWords=[{...wotdU,lang:"Urdu",color:"#1DB954"},{...wotdT,lang:"Tagalog",color:"#E8115B"},{...wotdA,lang:"Arabic",color:"#C9A84C"}];
  const [wotdRecs,setWotdRecs]=useState(()=>({u:local.get('wotd_'+todayIdx+'_u_'+user,null),t:local.get('wotd_'+todayIdx+'_t_'+user,null),a:local.get('wotd_'+todayIdx+'_a_'+user,null)}));
  const [partnerRecs,setPartnerRecs]=useState({u:null,t:null,a:null});
  const [recording,setRecording]=useState(null);
  const [playing,setPlaying]=useState(null);
  const [wotdSlide,setWotdSlide]=useState(0);
  const [duaOpen,setDuaOpen]=useState(true);
  const pName=user==='shah'?'dane':'shah';
  useEffect(()=>{initSupabase.then(()=>{sync.loadRecs(todayIdx).then(data=>{if(!data)return;const pr={};data.forEach(r=>{if(r.user_name!==user)pr[r.lang_key]=r.audio_data;});if(pr.u||pr.t||pr.a)setPartnerRecs(p=>({...p,...pr}));});});},[]);

  // Dua of the Day
  const DUAS=[
    {ar:"رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",en:"Our Lord, give us good in this world and the Hereafter, and protect us from the Fire",pr:"Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'adhaab an-naar",ref:"2:201"},
    {ar:"رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",en:"My Lord, expand my chest and ease my task for me",pr:"Rabbi-shrah lee sadree wa yassir lee amree",ref:"20:25-26"},
    {ar:"رَبِّ زِدْنِي عِلْمًا",en:"My Lord, increase me in knowledge",pr:"Rabbi zidnee 'ilmaa",ref:"20:114"},
    {ar:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",en:"Allah is sufficient for us, and He is the best disposer of affairs",pr:"Hasbunallahu wa ni'mal wakeel",ref:"3:173"},
    {ar:"رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",en:"Our Lord, do not hold us accountable if we forget or make mistakes",pr:"Rabbanaa laa tu'aakhidhnaa in naseenaa aw akhta'naa",ref:"2:286"},
    {ar:"رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",en:"Our Lord, grant us from our spouses and offspring comfort to our eyes",pr:"Rabbanaa hab lanaa min azwaajinaa wa dhurriyaatinaa qurrata a'yun",ref:"25:74"},
    {ar:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",en:"O Allah, I ask You for well-being",pr:"Allaahumma innee as'alukal 'aafiyah",ref:"Hadith"},
    {ar:"رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي",en:"My Lord, make me steadfast in prayer, and my descendants too",pr:"Rabbij-'alnee muqeemas-salaati wa min dhurriyyatee",ref:"14:40"},
  ];
  const dua=DUAS[dayNum%DUAS.length];

  const recordWord=async(langKey)=>{
    const recKey='wotd_'+todayIdx+'_'+langKey+'_'+user;
    const existing=wotdRecs[langKey];
    if(existing){try{setPlaying(langKey);const a=new Audio(existing);a.onended=()=>setPlaying(null);a.onerror=()=>setPlaying(null);a.play();}catch(e){setPlaying(null);}return;}
    try{
      setRecording(langKey);
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mr=new MediaRecorder(stream);const chunks=[];
      mr.ondataavailable=e=>chunks.push(e.data);
      mr.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(chunks,{type:'audio/webm'});
        const reader=new FileReader();
        reader.onload=()=>{
          const ad=reader.result;
          local.set(recKey,ad);setWotdRecs(p=>({...p,[langKey]:ad}));setRecording(null);
          sync.saveRec(todayIdx,langKey,user,ad);
        };
        reader.readAsDataURL(blob);
      };
      mr.start();setTimeout(()=>mr.stop(),4000);
    }catch(e){setRecording(null);}
  };
  const deleteRecording=(langKey)=>{
    local.set('wotd_'+todayIdx+'_'+langKey+'_'+user,null);
    setWotdRecs(p=>({...p,[langKey]:null}));
    sync.deleteRec(todayIdx,langKey,user);
  };
  const playPartnerWord=(langKey)=>{
    const audio=partnerRecs[langKey];
    if(audio){try{setPlaying('p_'+langKey);const a=new Audio(audio);a.onended=()=>setPlaying(null);a.onerror=()=>setPlaying(null);a.play();}catch(e){setPlaying(null);}}
  };
  const hasPartnerWord=(langKey)=>!!partnerRecs[langKey];

  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}>
    <div style={{background:"linear-gradient(180deg,#072E22 0%,#121212 75%)",padding:"max(12px, env(safe-area-inset-top)) 16px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:user==='shah'?"linear-gradient(135deg,#1DB954,#169C46)":"linear-gradient(135deg,#E8115B,#C70F4E)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:13,fontWeight:800}}>{name[0]}</span></div>
          <p style={{color:S.white,fontSize:20,fontWeight:700,margin:0,letterSpacing:-0.4}}>{greeting}, {name}</p>
        </div>
        <Sy mood="happy" size={28}/>
      </div>

      {/* Ramadan + Prayer Schedule */}
      <div style={{background:"linear-gradient(135deg,#152A45,#0C1A30)",borderRadius:18,padding:"16px",marginBottom:12,position:"relative",overflow:"hidden",border:"1px solid rgba(201,168,76,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
            <p style={{color:S.white,fontSize:28,fontWeight:300,margin:0,letterSpacing:-0.5,lineHeight:1}}>Day {dayNum}</p>
            <p style={{color:S.gold,fontSize:9,fontWeight:700,letterSpacing:1.5,margin:0}}>RAMADAN</p>
          </div>
          <div style={{textAlign:"right",display:"flex",alignItems:"baseline",gap:6}}>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:600,margin:0}}>{nextPrayer.name}</p>
            <p style={{color:S.gold,fontSize:17,fontWeight:600,margin:0}}>{nextPrayer.time}</p>
          </div>
        </div>
        {/* 5 prayer times row */}
        <div style={{display:"flex",justifyContent:"space-between",gap:4}}>
          {prayers.map(p=>{const isNext=p.name===nextPrayer.name;const isPast=prayers.indexOf(p)<prayers.indexOf(nextPrayer);return(
            <div key={p.name} style={{flex:1,textAlign:"center",padding:"6px 2px",borderRadius:10,background:isNext?"rgba(201,168,76,0.12)":"transparent"}}>
              <p style={{color:isNext?S.gold:isPast?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.45)",fontSize:9,fontWeight:700,letterSpacing:0.5,margin:"0 0 2px"}}>{p.name}</p>
              <p style={{color:isNext?S.white:isPast?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.35)",fontSize:12,fontWeight:isNext?700:500,margin:0}}>{p.time}</p>
            </div>
          );})}
        </div>
      </div>
    </div>

    <div style={{padding:"12px 16px 0"}}>

      {/* Word of the Day — carousel */}
      <div style={{background:S.card,borderRadius:18,padding:"16px",marginBottom:12,border:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{color:S.muted,fontSize:9,fontWeight:700,letterSpacing:2,margin:0}}>WORDS OF THE DAY</p>
          <div style={{display:"flex",gap:5}}>{todayWords.map((tw,i)=>(<div key={i} onClick={()=>setWotdSlide(i)} style={{width:7,height:7,borderRadius:4,background:wotdSlide===i?tw.color:"rgba(255,255,255,0.12)",cursor:"pointer",transition:"background 0.2s"}}/>))}</div>
        </div>
        {(()=>{const tw=todayWords[wotdSlide];const lk=["u","t","a"][wotdSlide];const hasRec=!!wotdRecs[lk];const isRec=recording===lk;const isPlay=playing===lk;const hasPart=hasPartnerWord(lk);const isPlayPart=playing==='p_'+lk;return(
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{flex:1,minWidth:0}} onClick={()=>setWotdSlide((wotdSlide+1)%3)}>
              <p style={{color:tw.color,fontSize:10,fontWeight:700,letterSpacing:1,margin:"0 0 4px"}}>{tw.lang.toUpperCase()}</p>
              <p style={{color:S.white,fontSize:22,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.3}}>{tw.w}</p>
              <p style={{color:S.sub,fontSize:13,margin:"0 0 2px"}}>{tw.m}</p>
              <p style={{color:S.muted,fontSize:11,margin:0}}>{tw.r}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
              {hasRec?<div style={{display:"flex",gap:4}}>
                <button onClick={()=>recordWord(lk)} style={{padding:"8px 12px",borderRadius:10,border:"none",background:isPlay?tw.color+"20":tw.color+"12",color:tw.color,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                  {isPlay?<><span style={{width:6,height:6,borderRadius:3,background:tw.color,animation:"dcFadeIn 0.5s infinite alternate"}}/>▶</>:<>▶ Play</>}
                </button>
                <button onClick={()=>deleteRecording(lk)} style={{padding:"8px",borderRadius:10,border:"none",background:"rgba(217,79,79,0.1)",color:"#D94F4F",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center"}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#D94F4F"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>
              :<button onClick={()=>recordWord(lk)} style={{padding:"8px 14px",borderRadius:10,border:"none",background:isRec?S.rose+"20":"rgba(255,255,255,0.04)",color:isRec?S.rose:S.muted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                {isRec?<><span style={{width:6,height:6,borderRadius:3,background:S.rose,animation:"dcFadeIn 0.5s infinite alternate"}}/>Rec</>:<>🎙 Record</>}
              </button>}
              {hasPart&&<button onClick={()=>playPartnerWord(lk)} style={{padding:"8px 14px",borderRadius:10,border:"none",background:S.rose+"10",color:S.rose,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                {isPlayPart?"▶ Playing":"▶ "+partner}
              </button>}
            </div>
          </div>
        );})()}
      </div>

      {/* Dua of the Day — tap to expand */}
      <div onClick={()=>setDuaOpen(!duaOpen)} style={{background:"linear-gradient(135deg,rgba(201,168,76,0.06),rgba(201,168,76,0.02))",borderRadius:16,padding:"14px 16px",marginBottom:12,border:"1px solid rgba(201,168,76,0.08)",cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
            <p style={{color:S.gold,fontSize:9,fontWeight:700,letterSpacing:2,margin:0,flexShrink:0}}>DUA</p>
            <p style={{color:S.sub,fontSize:13,margin:0,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:duaOpen?"normal":"nowrap"}}>{dua.en}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={S.muted} style={{transform:duaOpen?"rotate(180deg)":"none",transition:"transform 0.2s",flexShrink:0,marginLeft:8}}><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        {duaOpen&&<div style={{marginTop:10}}>
          <p style={{color:S.white,fontSize:16,fontWeight:400,margin:"0 0 8px",lineHeight:1.6,direction:"rtl",textAlign:"right",fontFamily:"serif"}}>{dua.ar}</p>
          <p style={{color:S.gold,fontSize:12,margin:"0 0 6px",lineHeight:1.4,fontStyle:"italic",opacity:0.7}}>{dua.pr}</p>
          <p style={{color:S.muted,fontSize:11,margin:0}}>Quran {dua.ref}</p>
        </div>}
      </div>

      {/* Thinking of You */}
      <div style={{marginBottom:12}}>
        {lastVibe&&<div onClick={markRead} style={{background:"linear-gradient(135deg,rgba(232,17,91,0.08),rgba(141,103,171,0.08))",borderRadius:16,padding:"14px 16px",marginBottom:10,border:"1px solid rgba(232,17,91,0.08)",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:24}}>{lastVibe.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:S.white,fontSize:15,fontWeight:600,margin:"0 0 2px"}}>{lastVibe.label}</p>
              <p style={{color:"rgba(255,255,255,0.25)",fontSize:11,margin:0}}>from {lastVibe.from_user} · tap to dismiss</p>
            </div>
          </div>
        </div>}

        {!showSend?<button onClick={()=>setShowSend(true)} style={{width:"100%",padding:"14px",background:S.card,borderRadius:16,border:"1px solid rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer"}}>
          <span style={{fontSize:16}}>💛</span>
          <span style={{color:S.sub,fontSize:14,fontWeight:500,letterSpacing:-0.2}}>Send {partner} something</span>
        </button>

        :<div style={{background:S.card,borderRadius:20,padding:"20px",border:"1px solid rgba(255,255,255,0.03)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{color:S.white,fontSize:16,fontWeight:700,margin:0,letterSpacing:-0.3}}>Send to {partner}</p>
            <button onClick={()=>setShowSend(false)} style={{background:"none",border:"none",color:S.muted,fontSize:12,cursor:"pointer",padding:"4px 8px"}}>Cancel</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:14}}>
            {QUICK_VIBES.map((v,i)=>(<button key={i} onClick={()=>sendVibe(v.emoji,v.label)} style={{padding:"14px 12px",borderRadius:14,border:"1px solid rgba(255,255,255,0.03)",background:"rgba(255,255,255,0.02)",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{v.emoji}</span>
              <span style={{color:S.white,fontSize:12,fontWeight:500}}>{v.label}</span>
            </button>))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={customMsg} onChange={e=>setCustomMsg(e.target.value)} placeholder="Write your own..." style={{flex:1,padding:"14px 16px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",color:S.white,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{if(customMsg.trim())sendVibe("💌",customMsg.trim(),customMsg.trim());}} disabled={!customMsg.trim()} style={{padding:"14px 18px",borderRadius:14,border:"none",background:customMsg.trim()?S.rose:"rgba(255,255,255,0.03)",color:customMsg.trim()?"#fff":S.muted,fontSize:13,fontWeight:700,cursor:customMsg.trim()?"pointer":"not-allowed"}}>Send</button>
          </div>
        </div>}
      </div>

      {/* Progress */}
      {(xp>0||completed.length>0)&&<div style={{display:"flex",gap:8,marginBottom:10}}>
        {[{v:xp,l:"XP",c:S.green},{v:completed.length+"/45",l:"Lessons",c:S.gold},{v:streak||"—",l:"Streak",c:S.rose}].map((s,i)=>(<div key={i} style={{flex:1,background:S.card,borderRadius:14,padding:"12px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,0.03)"}}>
          <p style={{color:s.c,fontSize:18,fontWeight:800,margin:"0 0 2px",letterSpacing:-0.5}}>{s.v}</p>
          <p style={{color:S.muted,fontSize:9,margin:0,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase"}}>{s.l}</p>
        </div>))}
      </div>}


    </div>
  </div>);
}

// Location component — shows on Home and Us tab

function Browse({go}){
  const {user}=useUser()||{user:'shah'};const isShah=user==='shah';
  const [sel,setSel]=useState(null);const [askQ,setAskQ]=useState("");const [asked,setAsked]=useState(()=>local.get('browse_asked',[]));
  const [editId,setEditId]=useState(null);const [editText,setEditText]=useState("");
  const [addingWord,setAddingWord]=useState(false);const [newWord,setNewWord]=useState("");
  const [ms,setMs]=useState(()=>local.get('browse_ms',[]));
  const [addingM,setAddingM]=useState(false);const [newM,setNewM]=useState("");const [newD,setNewD]=useState("");const [playVid,setPlayVid]=useState(null);
  // Editable Browse content — stored in localStorage
  const [bVids,setBVids]=useState(()=>local.get('browse_vids',[]));
  const [bStories,setBStories]=useState(()=>local.get('browse_stories',[]));
  const [bRecipes,setBRecipes]=useState(()=>local.get('browse_recipes',[]));
  const [bQA,setBQA]=useState(()=>local.get('browse_qa',[]));
  const [bWords,setBWords]=useState(()=>local.get('browse_words',[]));
  // Persist on change
  useEffect(()=>{local.set('browse_vids',bVids);},[bVids]);
  useEffect(()=>{local.set('browse_stories',bStories);},[bStories]);
  useEffect(()=>{local.set('browse_recipes',bRecipes);},[bRecipes]);
  useEffect(()=>{local.set('browse_qa',bQA);},[bQA]);
  useEffect(()=>{local.set('browse_words',bWords);},[bWords]);
  useEffect(()=>{local.set('browse_ms',ms);},[ms]);
  useEffect(()=>{local.set('browse_asked',asked);},[asked]);
  // Helper: editable list with add/delete for Shah, view-only + comment for Dane
  const EditList=({items,setItems,fields,emptyMsg,color="#0B6B48",mediaType})=>{
    const fileRef=React.useRef(null);
    const [addForm,setAddForm]=useState(null);const [formData,setFormData]=useState({});
    const handleFile=(file)=>{
      if(!file)return;
      const url=URL.createObjectURL(file);
      const item={t:formData.t||file.name.replace(/\.[^.]+$/,''),s:formData.s||'',file:file.name,url,type:file.type};
      // Auto-detect duration
      if(file.type.startsWith('video/')||file.type.startsWith('audio/')){
        const el=document.createElement(file.type.startsWith('video/')?'video':'audio');
        el.src=url;el.onloadedmetadata=()=>{
          const m=Math.floor(el.duration/60);const s=Math.floor(el.duration%60);
          item.dur=m+":"+String(s).padStart(2,'0');
          setItems([...items,item]);setFormData({});setAddForm(null);
        };
      }else{
        setItems([...items,item]);setFormData({});setAddForm(null);
      }
    };
    const [playItem,setPlayItem]=useState(null);
    const playerRef=React.useRef(null);
    const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);const [duration,setDuration]=useState(0);

    // Player overlay
    if(playItem)return(<div style={{position:"fixed",inset:0,zIndex:100,background:"linear-gradient(180deg,"+color+" 0%,#0D0D0D 50%)",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",padding:"max(12px,env(safe-area-inset-top)) 20px 8px"}}>
        <button onClick={()=>{setPlayItem(null);setPlaying(false);if(playerRef.current){playerRef.current.pause();playerRef.current=null;}}} style={{background:"none",border:"none",cursor:"pointer",padding:8}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:600,letterSpacing:1.5,margin:0,alignSelf:"center"}}>PLAYING FROM</p>
        <div style={{width:38}}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
        {(playItem.type||"").startsWith("video/")?
          <video ref={el=>{if(el&&!playerRef.current){playerRef.current=el;el.ontimeupdate=()=>{setProgress(el.currentTime);setDuration(el.duration||0);};el.onended=()=>setPlaying(false);}}} src={playItem.url} playsInline style={{width:"100%",maxHeight:"60vh",borderRadius:12,background:"#000"}}/>
        :<div style={{width:"80%",maxWidth:300,aspectRatio:"1",borderRadius:20,background:"linear-gradient(135deg,"+color+","+color+"80)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>
        </div>}
      </div>
      <div style={{padding:"0 24px 40px"}}>
        <h2 style={{color:"#fff",fontSize:20,fontWeight:700,margin:"0 0 3px"}}>{playItem.t}</h2>
        {playItem.s&&<p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:"0 0 16px"}}>{playItem.s}</p>}
        <div style={{marginBottom:8}}>
          <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,cursor:"pointer"}} onClick={e=>{if(playerRef.current&&duration){const rect=e.currentTarget.getBoundingClientRect();const pct=(e.clientX-rect.left)/rect.width;playerRef.current.currentTime=pct*duration;}}}>
            <div style={{width:(duration?Math.min((progress/duration)*100,100):0)+"%",height:"100%",background:"#fff",borderRadius:2,transition:"width 0.1s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{Math.floor(progress/60)+":"+String(Math.floor(progress%60)).padStart(2,"0")}</span>
            <span style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{duration?Math.floor(duration/60)+":"+String(Math.floor(duration%60)).padStart(2,"0"):playItem.dur||"--:--"}</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:28}}>
          <button onClick={()=>{if(playerRef.current)playerRef.current.currentTime=Math.max(0,playerRef.current.currentTime-15);}} style={{background:"none",border:"none",cursor:"pointer",padding:8}}><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg></button>
          <button onClick={()=>{
            if(!playerRef.current){
              if((playItem.type||"").startsWith("video/")){/* video ref set above */}
              else{const a=new Audio(playItem.url);a.ontimeupdate=()=>{setProgress(a.currentTime);setDuration(a.duration||0);};a.onended=()=>setPlaying(false);playerRef.current=a;}
            }
            if(playing){playerRef.current.pause();setPlaying(false);}
            else{playerRef.current.play();setPlaying(true);}
          }} style={{width:64,height:64,borderRadius:32,border:"none",cursor:"pointer",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {playing?<svg width="26" height="26" viewBox="0 0 24 24" fill="#000"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            :<svg width="26" height="26" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={()=>{if(playerRef.current)playerRef.current.currentTime=Math.min(playerRef.current.duration||999,playerRef.current.currentTime+15);}} style={{background:"none",border:"none",cursor:"pointer",padding:8}}><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></button>
        </div>
      </div>
    </div>);

    return(<div style={{padding:"0 24px"}}>
      {items.length===0&&<div style={{textAlign:"center",padding:"40px 0"}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:"1px solid rgba(255,255,255,0.06)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div>
        <p style={{color:"rgba(255,255,255,0.2)",fontSize:14}}>{emptyMsg}</p>
      </div>}
      {items.map((item,i)=>(<div key={i} style={{padding:"10px 0",borderBottom:i<items.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
        <div onClick={item.url?()=>setPlayItem(item):undefined} style={{display:"flex",alignItems:"center",gap:12,cursor:item.url?"pointer":"default"}}>
          {/* Thumbnail */}
          {item.url&&(item.type||'').startsWith('video/')?
            <div style={{width:52,height:52,borderRadius:8,background:color+"20",overflow:"hidden",flexShrink:0,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video src={item.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.35)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
          :<div style={{width:52,height:52,borderRadius:item.url?26:8,background:item.url?color+"20":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {item.url?<svg width="16" height="16" viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z"/></svg>
            :<span style={{color:"rgba(255,255,255,0.15)",fontSize:18}}>📝</span>}
          </div>}
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:"#fff",fontSize:14,fontWeight:500,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.t}</p>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {item.s&&<span style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{item.s}</span>}
              {item.dur&&<span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>· {item.dur}</span>}
            </div>
          </div>
        </div>
        {item.comment&&<div style={{background:"rgba(232,17,91,0.06)",borderRadius:10,padding:"8px 12px",marginTop:8,marginLeft:64}}><p style={{color:"#E8115B",fontSize:12,margin:0}}><span style={{fontWeight:600}}>Dane:</span> {item.comment}</p></div>}
        <div style={{display:"flex",gap:8,marginTop:6,marginLeft:64}}>
          {!isShah&&<button onClick={e=>{e.stopPropagation();setAddForm("comment_"+i);}} style={{padding:"4px 12px",borderRadius:12,border:"1px solid rgba(232,17,91,0.2)",background:"transparent",color:"#E8115B",fontSize:11,cursor:"pointer"}}>Reply</button>}
          {addForm==="comment_"+i&&<div style={{display:"flex",gap:4,flex:1}}>
            <input value={formData.c||""} onChange={e=>setFormData({c:e.target.value})} placeholder="Your reply..." autoFocus style={{flex:1,padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{if(formData.c){const n=[...items];n[i]={...n[i],comment:formData.c};setItems(n);setFormData({});setAddForm(null);}}} style={{padding:"6px 10px",borderRadius:8,border:"none",background:color,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Send</button>
          </div>}
          {isShah&&<button onClick={e=>{e.stopPropagation();setItems(items.filter((_,j)=>j!==i));}} style={{padding:"4px 12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.2)",fontSize:11,cursor:"pointer"}}>Remove</button>}
        </div>
      </div>))}
      {isShah&&<div style={{marginTop:12}}>
        <input ref={fileRef} type="file" accept={mediaType==="video"?"video/*":mediaType==="audio"?"audio/*":"*/*"} style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleFile(e.target.files[0]);}}/>
        {addForm===fields[0]?.k?<div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:16,border:"1px solid rgba(255,255,255,0.06)"}}>
          {fields.map(f=>(<input key={f.k} value={formData[f.k]||""} onChange={e=>setFormData({...formData,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",padding:"10px 0",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:8}}/>))}
          <div style={{display:"flex",gap:8}}>
            {mediaType&&<button onClick={()=>fileRef.current?.click()} style={{flex:1,padding:"10px",borderRadius:10,border:"1px dashed rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
              Upload {mediaType}
            </button>}
            {!mediaType&&<button onClick={()=>{if(formData.t){setItems([...items,{...formData}]);setFormData({});setAddForm(null);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:color,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add</button>}
            <button onClick={()=>{setAddForm(null);setFormData({});}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
          {mediaType&&<button onClick={()=>{if(formData.t){setItems([...items,{...formData}]);setFormData({});setAddForm(null);}}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:10,border:"none",background:color,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add without file</button>}
        </div>
        :<button onClick={()=>setAddForm(fields[0]?.k)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.25)",fontSize:13,cursor:"pointer"}}>+ add</button>}
      </div>}
    </div>);
  };
  const cats=[
    {id:"tea",t:"Tea\nSessions",c:"#E13300",ic:"☕",sub:"Gen Z convos over chai",eps:8,act:"series"},
    {id:"steps",t:"First\nSteps",c:"#0B4D3A",ic:"▶",sub:"Shah's video guides",eps:8},
    {id:"stories",t:"Storytime",c:"#4A2068",ic:"📖",sub:"Prophets' stories",eps:7},
    {id:"ask",t:"Ask\nAnything",c:"#5C1A6E",ic:"💬",sub:"Dane asks, Shah answers",eps:0},
  ];
  const back=<div style={{padding:"max(12px,env(safe-area-inset-top)) 16px 6px"}}><button onClick={()=>setSel(null)} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44,display:"flex",alignItems:"center",gap:6}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg><span style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:500}}>Back</span></button></div>;

  // First Steps — Shah's video guides
  if(sel==="steps")return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}>
    {back}<div style={{padding:"0 16px"}}><h2 style={{color:S.white,fontSize:22,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.3}}>First Steps</h2><p style={{color:S.muted,fontSize:13,margin:"0 0 16px"}}>Shah's video guides for Dane</p></div>
    <EditList items={bVids} setItems={setBVids} fields={[{k:"t",ph:"Title"},{k:"s",ph:"Description (optional)"}]} emptyMsg="No videos yet — Shah will add them" color="#0B6B48" mediaType="video"/>
  </div>);

  // Storytime — Prophets' stories
  if(sel==="stories")return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}>
    {back}<div style={{padding:"0 16px"}}><h2 style={{color:S.white,fontSize:22,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.3}}>Storytime</h2><p style={{color:S.muted,fontSize:13,margin:"0 0 16px"}}>Stories of the Prophets</p></div>
    <EditList items={bStories} setItems={setBStories} fields={[{k:"t",ph:"Title"},{k:"s",ph:"Description (optional)"}]} emptyMsg="No stories yet" color="#4A2068" mediaType="audio"/>
  </div>);

  // Ask Anything — Q&A
  if(sel==="ask")return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}>
    {back}<div style={{padding:"0 16px"}}><h2 style={{color:S.white,fontSize:22,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.3}}>Ask Anything</h2><p style={{color:S.muted,fontSize:13,margin:"0 0 16px"}}>Dane asks, Shah answers</p></div>
    <div style={{padding:"0 24px"}}>
      {/* Ask input for Dane */}
      {!isShah&&<div style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8}}>
          <input value={askQ} onChange={e=>setAskQ(e.target.value)} placeholder="Ask Shah anything..." style={{flex:1,padding:"12px 16px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",color:S.white,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <button onClick={()=>{if(askQ.trim()){setAsked([{q:askQ.trim(),a:"",from:"Dane",id:Date.now()},...asked]);setAskQ("");}}} style={{padding:"12px 16px",borderRadius:14,border:"none",background:S.green,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Ask</button>
        </div>
      </div>}
      {asked.length===0&&<div style={{textAlign:"center",padding:"32px 0"}}><p style={{color:S.muted,fontSize:13}}>No questions yet</p></div>}
      {asked.map((q,i)=>(<div key={q.id||i} style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:16,marginBottom:10,border:"1px solid rgba(255,255,255,0.04)"}}>
        <p style={{color:S.white,fontSize:15,fontWeight:600,margin:"0 0 8px"}}>{q.q}</p>
        {q.a?<p style={{color:S.sub,fontSize:13,margin:0,lineHeight:1.5}}>{q.a}</p>
        :isShah?<div>
          {editId===q.id?<div style={{display:"flex",gap:8}}>
            <input value={editText} onChange={e=>setEditText(e.target.value)} placeholder="Your answer..." autoFocus style={{flex:1,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:S.white,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{const n=[...asked];n[i]={...n[i],a:editText};setAsked(n);setEditId(null);setEditText("");}} style={{padding:"8px 14px",borderRadius:10,border:"none",background:S.green,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save</button>
          </div>
          :<button onClick={()=>{setEditId(q.id);setEditText("");}} style={{padding:"6px 14px",borderRadius:10,border:"1px solid rgba(29,185,84,0.3)",background:"transparent",color:S.green,fontSize:12,cursor:"pointer"}}>Answer this</button>}
        </div>
        :<p style={{color:S.muted,fontSize:12,fontStyle:"italic",margin:0}}>Waiting for Shah's answer...</p>}
      </div>))}
    </div>
  </div>);

  // Fallback
  if(sel)return(<div className="dc-fade-in" style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:S.black}}><Sy mood="thinking" size={80} msg="Coming soon!"/></div>);

  // ── Browse grid ──
  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}><div style={{padding:"max(14px, env(safe-area-inset-top)) 16px 0"}}><h1 style={{color:S.white,fontSize:24,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.5}}>Tea</h1><p style={{color:S.muted,fontSize:13,margin:"0 0 20px",fontWeight:400}}>Learn, listen, explore</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{cats.map(c=>(<div key={c.id} onClick={c.act?()=>go(c.act):()=>setSel(c.id)} style={{height:180,borderRadius:20,padding:"22px",background:`linear-gradient(155deg,${c.c},${c.c}80)`,position:"relative",overflow:"hidden",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
    <div style={{position:"absolute",right:-10,bottom:-10,width:64,height:64,borderRadius:32,background:"rgba(255,255,255,0.04)"}}/>
    <p style={{color:"#fff",fontSize:18,fontWeight:800,margin:0,lineHeight:1.2,whiteSpace:"pre-line",position:"relative",zIndex:1,letterSpacing:-0.3}}>{c.t}</p>
    <p style={{color:"rgba(255,255,255,0.4)",fontSize:11,margin:"6px 0 0",position:"relative",zIndex:1,fontWeight:500}}>{c.sub}</p>
  </div>))}</div></div></div>);
}

function Learn(){
  const W=useW();const dark=useDark();
  const {user}=useUser()||{user:'shah'};
  const [lang,setLang]=useState(null);const [view,setView]=useState("home");const [lesson,setLesson]=useState(null);const [step,setStep]=useState(0);const [qIdx,setQIdx]=useState(0);const [sel,setSel]=useState(null);const [ok,setOk]=useState(null);const [xp,setXp]=useState(()=>local.get(user+'_xp',0));const [hearts,setHearts]=useState(()=>local.get(user+'_hearts',5));const [score,setScore]=useState(0);const [done,setDone]=useState(false);const [completed,setCompleted]=useState(()=>local.get(user+'_completed',[]));const [streak]=useState(()=>local.get(user+'_streak',0));const [wCat,setWCat]=useState(null);
  useEffect(()=>{local.set(user+'_xp',xp);},[xp]);useEffect(()=>{local.set(user+'_hearts',hearts);},[hearts]);useEffect(()=>{local.set(user+'_completed',completed);},[completed]);
  const [goalTab,setGoalTab]=useState("self");

  const isUnlocked=(ls)=>{if(!ls.unlockAfter)return true;return completed.includes(ls.unlockAfter);};
  const langProgress=(key)=>{const l=LANGS[key];const total=l.lessons.length;const done2=l.lessons.filter(ls=>completed.includes(ls.id)).length;return Math.round((done2/total)*100);};

  const answer=(idx)=>{if(sel!==null)return;setSel(idx);const c=idx===lesson.quiz[qIdx].ans;setOk(c);if(!c)setHearts(h=>Math.max(0,h-1));else setScore(s=>s+1);setTimeout(()=>{if(qIdx<lesson.quiz.length-1){setQIdx(qIdx+1);setSel(null);setOk(null);}else{
    setDone(true);setXp(x=>x+(lesson.xp||15));
    if(!completed.includes(lesson.id)){
      setCompleted([...completed,lesson.id]);
      // Send notification to partner about lesson completion
      const langName=lang==='urdu'?'Urdu':lang==='tagalog'?'Tagalog':'Arabic';
      const partnerUser=user==='shah'?'dane':'shah';
      const displayName=user==='shah'?'Shah':'Dane';
      const vibeMsg=displayName+" just completed a "+langName+" lesson: "+lesson.t+" 🎉";
      if(supabase){
        supabase.from('dc_vibes').insert({from_user:user,to_user:partnerUser,emoji:"📚",label:vibeMsg,read:false}).then(()=>{}).catch(()=>{});
      }
    }
  }},900);};
  const reset=()=>{setLesson(null);setStep(0);setQIdx(0);setSel(null);setOk(null);setScore(0);setDone(false);setHearts(5);setView(lang?"browse":"home");};
  const Ic=({d,c,sz=22})=>(<svg width={sz} height={sz} viewBox="0 0 24 24" fill={c}><path d={d}/></svg>);
  const lockD="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3-9H9V6a3 3 0 016 0v2z";
  const heartD="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  const checkD="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";

  // Lesson complete — with Sy celebration
  if(done&&lesson){const lc=LANGS[lang].color;return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg,${W.bg} 0%,${lc}08 100%)`,padding:32}}>
    <Sy mood="celebrate" size={100} msg={score===lesson.quiz.length?"Purr-fect score!":"Great job, keep going!"}/>
    <div style={{height:16}}/>
    <h2 style={{color:W.forest,fontSize:26,fontWeight:800,margin:"0 0 4px",letterSpacing:-0.5}}>Lesson Complete!</h2>
    <p style={{color:W.textMuted,fontSize:15,margin:"0 0 24px"}}>{score}/{lesson.quiz.length} correct</p>
    <div style={{display:"flex",gap:32,marginBottom:36}}>
      <div style={{textAlign:"center"}}><p style={{color:lc,fontSize:32,fontWeight:800,margin:0}}>+{lesson.xp||15}</p><p style={{color:W.textMuted,fontSize:12,margin:0}}>XP earned</p></div>
      <div style={{textAlign:"center"}}><p style={{color:"#FF9500",fontSize:32,fontWeight:800,margin:0}}>{streak}</p><p style={{color:W.textMuted,fontSize:12,margin:0}}>Day streak</p></div>
    </div>
    <button onClick={reset} style={{padding:"16px 56px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${W.forest},${lc})`,color:"#fff",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${lc}40`}}>Continue</button>
  </div>);}

  // Active lesson — teaching or quiz
  if(lesson){const lc=LANGS[lang].color;const total=lesson.content.length+lesson.quiz.length;const cur=step<lesson.content.length?step:lesson.content.length+qIdx+(sel!==null?1:0);const prog=(cur/total)*100;
    if(step<lesson.content.length){const ct=lesson.content[step];const isFirst=step===0;return(<div className="dc-fade-in" style={{height:"100%",display:"flex",flexDirection:"column",background:W.bg}}>
      <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={reset} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={W.textMuted} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <div style={{flex:1,height:8,background:W.border,borderRadius:4,overflow:"hidden"}}><div style={{width:prog+"%",height:"100%",background:lc,borderRadius:4,transition:"width 0.3s"}}/></div>
        <span style={{color:lc,fontSize:12,fontWeight:700}}>{step+1}/{lesson.content.length}</span>
      </div>
      <div style={{flex:1,padding:"20px 20px",display:"flex",flexDirection:"column",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {isFirst&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Sy mood="happy" size={60} msg="Let's learn!"/></div>}
        <div style={{background:`linear-gradient(135deg,${lc}10,${lc}05)`,borderRadius:20,padding:"24px 22px",border:`1px solid ${lc}15`,flex:isFirst?undefined:1,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:44,height:44,borderRadius:12,background:lc+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:lc,fontSize:18,fontWeight:800}}>{step+1}</span></div>
            <h2 style={{color:W.forest,fontSize:19,fontWeight:700,margin:0,flex:1,lineHeight:1.25}}>{ct.title}</h2>
          </div>
          <p style={{color:W.text,fontSize:16,lineHeight:1.85,margin:0,letterSpacing:0.1}}>{ct.text}</p>
        </div>
      </div>
      <div style={{padding:"12px 24px 32px",paddingBottom:"max(32px, calc(env(safe-area-inset-bottom) + 16px))"}}><button onClick={()=>setStep(step+1)} style={{width:"100%",padding:"16px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${W.forest},${lc})`,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${lc}30`}}>{step===lesson.content.length-1?"Start Quiz \u2192":"Continue"}</button></div>
    </div>);}
    const q=lesson.quiz[qIdx];return(<div className="dc-fade-in" style={{height:"100%",display:"flex",flexDirection:"column",background:W.bg,padding:"12px 20px",paddingBottom:"max(20px, env(safe-area-inset-bottom))"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={reset} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={W.textMuted} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <div style={{flex:1,height:8,background:W.border,borderRadius:4,overflow:"hidden"}}><div style={{width:prog+"%",height:"100%",background:lc,borderRadius:4,transition:"width 0.3s"}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:3}}><Ic d={heartD} c={W.error} sz={16}/><span style={{color:W.error,fontSize:15,fontWeight:800}}>{hearts}</span></div>
      </div>
      {sel!==null&&<div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Sy mood={ok?"proud":"sad"} size={56}/></div>}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:sel!==null?"flex-start":"center"}}>
        <p style={{color:W.forest,fontSize:21,fontWeight:700,margin:"0 0 24px",lineHeight:1.35}}>{q.q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{q.opts.map((opt,idx)=>{let bg=W.card,bdr="2px solid "+W.border,col=W.text;if(sel!==null){if(idx===q.ans){bg=dark?"#1B3A1B":"#E8F5E9";bdr="2px solid "+W.success;col=W.success;}else if(idx===sel&&!ok){bg=dark?"#3A1B1B":"#FFEBEE";bdr="2px solid "+W.error;col=W.error;}}return(<button key={idx} onClick={()=>answer(idx)} style={{padding:"15px 16px",borderRadius:14,background:bg,border:bdr,color:col,fontSize:16,fontWeight:600,cursor:sel!==null?"default":"pointer",textAlign:"left",transition:"all 0.15s",minHeight:44}}>{opt}</button>);})}</div>
      </div>
      {sel!==null&&<div style={{padding:"14px 0",textAlign:"center"}}><p style={{color:ok?W.success:W.error,fontSize:17,fontWeight:700,margin:0}}>{ok?"\u2713 Correct!":"\u2717 It's: "+q.opts[q.ans]}</p></div>}
    </div>);
  }

  // Language browse
  if((view==="browse"||view==="words"||view==="alpha"||view==="nums")&&lang){const l=LANGS[lang];const isW=view==="words";const isAlpha=view==="alpha";const isNums=view==="nums";const prog=langProgress(lang);return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:W.bg,WebkitOverflowScrolling:"touch"}}><div style={{background:dark?WD.cardAlt:WL.forest,padding:"12px 16px 20px",borderRadius:"0 0 24px 24px"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><button onClick={()=>{setLang(null);setView("home");setWCat(null);}} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dark?"#E8E8E8":WL.cream} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:21,fontWeight:700,margin:0}}>{l.label}{isW?" — Words":isAlpha?" — Alphabet":isNums?" — Numbers":""}</h1></div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1,height:6,background:"rgba(255,255,255,0.15)",borderRadius:3,overflow:"hidden"}}><div style={{width:prog+"%",height:"100%",background:l.color,borderRadius:3,transition:"width 0.3s"}}/></div><span style={{color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:700}}>{prog}%</span></div><div style={{display:"flex",gap:14,marginTop:10}}>{[{v:xp,lb:"XP",c:l.color},{v:streak,lb:"Streak",c:"#FF9500"},{v:hearts,lb:"Hearts",c:"#E74C3C"}].map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",background:s.c}}/><span style={{color:dark?"#E8E8E8":WL.cream,fontSize:14,fontWeight:700}}>{s.v}</span><span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>{s.lb}</span></div>))}</div></div><div style={{padding:"16px"}}><div style={{display:"flex",gap:6,marginBottom:16}}>{["Lessons","Words","Alphabet","Numbers"].map(t=>{const v2=t==="Words"?"words":t==="Alphabet"?"alpha":t==="Numbers"?"nums":"browse";const active=view===v2;return(<button key={t} onClick={()=>setView(v2)} style={{padding:"8px 18px",borderRadius:20,border:"1.5px solid "+(active?W.forest:W.border),background:active?W.forest:"transparent",color:active?(dark?"#000":WL.cream):W.text,fontSize:13,fontWeight:600,cursor:"pointer",minHeight:44}}>{t}</button>);})}</div>
    {isAlpha&&(()=>{
      const alphabets={urdu:["ا Alif (a)","ب Bay (b)","پ Pay (p)","ت Tay (t)","ٹ Ṭay (ṭ)","ث Say (s)","ج Jeem (j)","چ Chay (ch)","ح Ḥey (ḥ)","خ Khay (kh)","د Daal (d)","ڈ Ḍaal (ḍ)","ذ Zaal (z)","ر Ray (r)","ڑ Ṛay (ṛ)","ز Zay (z)","ژ Zhay (zh)","س Seen (s)","ش Sheen (sh)","ص Ṣuad (ṣ)","ض Ḍuad (ḍ)","ط Ṭoy (ṭ)","ظ Ẓoy (ẓ)","ع Ain (ʿ)","غ Ghain (gh)","ف Fay (f)","ق Qaaf (q)","ک Kaaf (k)","گ Gaaf (g)","ل Laam (l)","م Meem (m)","ن Noon (n)","ں Noon Ghunna (ñ)","و Wow (w/o)","ہ Hey (h)","ء Hamza (ʾ)","ی Yay (y)","ے Bari Yay (e)"],
      tagalog:["A (ah)","B (bah)","C (see)","D (dee)","E (eh)","F (ef)","G (jee)","H (aych)","I (ee)","J (jay)","K (kay)","L (el)","M (em)","N (en)","NG (eng) — one letter!","O (oh)","P (pee)","Q (kyu)","R (ar) — rolled","S (es)","T (tee)","U (oo)","V (vee)","W (dobolyou)","X (eks)","Y (way)","Z (zee)"],
      arabic:["ا Alif","ب Ba","ت Ta","ث Tha","ج Jim","ح Ha","خ Kha","د Dal","ذ Dhal","ر Ra","ز Zay","س Sin","ش Shin","ص Sad","ض Dad","ط Ta","ظ Za","ع Ain","غ Ghain","ف Fa","ق Qaf","ك Kaf","ل Lam","م Mim","ن Nun","ه Ha","و Waw","ي Ya"]};
      const alpha=alphabets[lang]||[];
      return(<div>
        <p style={{color:W.forest,fontSize:16,fontWeight:700,margin:"0 0 4px"}}>{l.label} Alphabet</p>
        <p style={{color:W.textMuted,fontSize:12,margin:"0 0 12px"}}>{alpha.length} letters{lang==="urdu"?" · Right-to-left script":lang==="arabic"?" · Right-to-left script":" · Latin alphabet + NG"}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {alpha.map((a,i)=>{const parts=a.split(" ");const letter=parts[0];const name=parts.slice(1).join(" ");return(<div key={i} style={{background:W.card,border:"1px solid "+W.border,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <p style={{color:l.color,fontSize:lang==="tagalog"?16:22,fontWeight:700,margin:"0 0 2px",fontFamily:lang==="tagalog"?"inherit":"serif"}}>{letter}</p>
            <p style={{color:W.textMuted,fontSize:9,margin:0,lineHeight:1.2}}>{name}</p>
          </div>);})}
        </div>
      </div>);})()}
    {isNums&&(()=>{
      const numbers={
        urdu:[["0","sifr"],["1","aik"],["2","do"],["3","teen"],["4","chaar"],["5","paanch"],["6","chay"],["7","saat"],["8","aath"],["9","nau"],["10","das"],["11","gyarah"],["12","baarah"],["13","terah"],["14","chaudah"],["15","pandrah"],["16","solah"],["17","satrah"],["18","athaarah"],["19","unees"],["20","bees"],["30","tees"],["40","chaalees"],["50","pachaas"],["60","saath"],["70","sattar"],["80","assi"],["90","nabbe"],["100","sau"],["1000","hazaar"]],
        tagalog:[["0","wala / zero"],["1","isa / uno"],["2","dalawa / dos"],["3","tatlo / tres"],["4","apat / kuwatro"],["5","lima / singko"],["6","anim / sais"],["7","pito / siyete"],["8","walo / otso"],["9","siyam / nuwebe"],["10","sampu / diyes"],["11","labing-isa / onse"],["12","labindalawa / dose"],["15","labinlima / kinse"],["20","dalawampu / beynte"],["30","tatlumpu / treynta"],["50","limampu / singkuwenta"],["100","isang daan / siyento"],["1000","isang libo / mil"]],
        arabic:[["٠ 0","sifr"],["١ 1","wahid"],["٢ 2","ithnayn"],["٣ 3","thalatha"],["٤ 4","arba'a"],["٥ 5","khamsa"],["٦ 6","sitta"],["٧ 7","sab'a"],["٨ 8","thamaniya"],["٩ 9","tis'a"],["١٠ 10","'ashara"],["11","ahada 'ashar"],["12","ithna 'ashar"],["15","khamsata 'ashar"],["20","'ishrun"],["30","thalathun"],["50","khamsun"],["100","mi'a"],["1000","alf"]]
      };
      const nums=numbers[lang]||[];
      return(<div>
        <p style={{color:W.forest,fontSize:16,fontWeight:700,margin:"0 0 4px"}}>Numbers</p>
        <p style={{color:W.textMuted,fontSize:12,margin:"0 0 12px"}}>{lang==="tagalog"?"Tagalog / Spanish — both used daily":lang==="arabic"?"Arabic numerals + words":"Urdu number words"}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {nums.map(([num,word],i)=>(<div key={i} style={{background:W.card,border:"1px solid "+W.border,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
            <p style={{color:l.color,fontSize:18,fontWeight:800,margin:"0 0 2px"}}>{num}</p>
            <p style={{color:W.text,fontSize:11,margin:0,fontWeight:500}}>{word}</p>
          </div>))}
        </div>
      </div>);})()}
    {!isW&&!isAlpha&&!isNums&&(()=>{
      // Group lessons into units
      const units={
        urdu:[
          {name:"Unit 1: Foundations",desc:"Learn the alphabet, numbers, and how Urdu works",range:[0,3]},
          {name:"Unit 2: Everyday Talk",desc:"Phrases, emotions, and daily conversations",range:[4,8]},
          {name:"Unit 3: Culture & Style",desc:"Slang, taboos, and social skills",range:[9,10]},
          {name:"Unit 4: Grammar & Faith",desc:"Sentence structure and Islamic terms",range:[11,13]},
        ],
        tagalog:[
          {name:"Unit 1: Foundations",desc:"Alphabet, numbers, and greetings",range:[0,2]},
          {name:"Unit 2: Connecting",desc:"Phrases, love, family, and emotions",range:[3,7]},
          {name:"Unit 3: Daily Life",desc:"Food, home, shopping, and getting around",range:[8,11]},
          {name:"Unit 4: Going Deeper",desc:"Slang, taboos, grammar, and culture",range:[12,16]},
        ],
        arabic:[
          {name:"Unit 1: The Script",desc:"Arabic alphabet, numbers, and basic phrases",range:[0,3]},
          {name:"Unit 2: Islamic Knowledge",desc:"Quran, calendar, pillars, and prophets",range:[4,8]},
          {name:"Unit 3: Language & Life",desc:"Grammar, expressions, etiquette, and bridges",range:[9,13]},
        ],
      };
      const myUnits=units[lang]||[{name:"All Lessons",desc:"",range:[0,l.lessons.length-1]}];
      return myUnits.map((unit,ui)=>{
        const unitLessons=l.lessons.slice(unit.range[0],unit.range[1]+1);
        const unitDone=unitLessons.filter(ls=>completed.includes(ls.id)).length;
        const unitTotal=unitLessons.length;
        return(<div key={ui} style={{marginBottom:24}}>
          {/* Unit header */}
          <div style={{marginBottom:12,padding:"16px",background:`linear-gradient(135deg,${l.color}08,${l.color}04)`,borderRadius:16,border:`1px solid ${l.color}12`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{color:l.color,fontSize:11,fontWeight:700,letterSpacing:1.2,margin:"0 0 4px",textTransform:"uppercase"}}>{unit.name}</p>
                <p style={{color:W.textMuted,fontSize:12,margin:0}}>{unit.desc}</p>
              </div>
              <div style={{background:unitDone===unitTotal&&unitTotal>0?W.success+"20":W.cardAlt,borderRadius:10,padding:"6px 10px",textAlign:"center"}}>
                <p style={{color:unitDone===unitTotal&&unitTotal>0?W.success:W.textMuted,fontSize:13,fontWeight:700,margin:0}}>{unitDone}/{unitTotal}</p>
              </div>
            </div>
          </div>
          {/* Lessons in this unit */}
          {unitLessons.map((ls,i)=>{
            const globalIdx=unit.range[0]+i;
            const unlocked=isUnlocked(ls);
            const comp=completed.includes(ls.id);
            return(<button key={ls.id} onClick={unlocked&&!comp?()=>{setLesson(ls);setStep(0);setQIdx(0);setSel(null);setOk(null);setScore(0);setDone(false);setHearts(5);}:comp?()=>{setLesson(ls);setStep(0);setQIdx(0);setSel(null);setOk(null);setScore(0);setDone(false);setHearts(5);}:undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px",background:W.card,borderRadius:16,marginBottom:10,border:comp?"1.5px solid "+W.success+"40":"1px solid "+W.border,cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.3,textAlign:"left",boxShadow:unlocked?"0 2px 8px rgba(0,0,0,0.04)":"none",transition:"all 0.15s"}}>
              <div style={{width:48,height:48,borderRadius:14,background:comp?W.success+"15":!unlocked?W.cardAlt:l.color+"12",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {comp?<Ic d={checkD} c={W.success} sz={22}/>:!unlocked?<Ic d={lockD} c={W.textMuted} sz={18}/>:<span style={{color:l.color,fontSize:17,fontWeight:800}}>{globalIdx+1}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:W.forest,fontSize:15,fontWeight:600,margin:"0 0 3px"}}>{ls.title}</p>
                <p style={{color:W.textMuted,fontSize:12,margin:0,lineHeight:1.3}}>{comp?"Completed ✓ — Tap to review":!unlocked?"Complete previous lesson first":ls.desc}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
                {comp?<span style={{color:W.success,fontSize:11,fontWeight:600}}>+{ls.xp} XP</span>
                :unlocked?<span style={{color:l.color,fontSize:11,fontWeight:600}}>{ls.content.length} cards</span>
                :null}
              </div>
            </button>);
          })}
        </div>);
      });
    })()}    {isW&&(()=>{const cats=WORD_CATS[lang]||["All"];const grouped={};l.words.forEach(w=>{const c=wordCat(lang,w);if(!grouped[c])grouped[c]=[];grouped[c].push(w);});
      const activeCat=wCat&&cats.includes(wCat)?wCat:cats[0];
      const ws=grouped[activeCat]||[];
      return(<>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:8,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
          {cats.map(cat=>{const active=activeCat===cat;const count=(grouped[cat]||[]).length;return(<button key={cat} onClick={()=>setWCat(cat)} style={{padding:"6px 14px",borderRadius:16,border:"1.5px solid "+(active?l.color:W.border),background:active?l.color+"15":"transparent",color:active?l.color:W.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,minHeight:36}}>{cat} ({count})</button>);})}
        </div>
        <p style={{color:W.forest,fontSize:16,fontWeight:700,margin:"0 0 8px"}}>{activeCat} <span style={{color:W.textMuted,fontWeight:500,fontSize:13}}>({ws.length} words)</span></p>
        {ws.map((w,i)=>(<div key={i} style={{padding:"10px 0",borderBottom:i<ws.length-1?"1px solid "+W.border+"40":"none",display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:W.forest,fontSize:15,fontWeight:600,margin:0}}>{w.w}</p>
            <p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{w.m}</p>
          </div>
          <div style={{display:"flex",gap:4}}>
            {/* Record button — records audio and saves to localStorage */}
            <button onClick={async()=>{
              const key='rec_'+lang+'_'+w.w.replace(/[^a-zA-Z]/g,'');
              const existing=local.get(key,null);
              if(existing){
                // Play existing recording
                try{const a=new Audio(existing);a.play();}catch(e){}
                return;
              }
              try{
                const stream=await navigator.mediaDevices.getUserMedia({audio:true});
                const mr=new MediaRecorder(stream);const chunks=[];
                mr.ondataavailable=e=>chunks.push(e.data);
                mr.onstop=()=>{
                  stream.getTracks().forEach(t=>t.stop());
                  const blob=new Blob(chunks,{type:'audio/webm'});
                  const reader=new FileReader();
                  reader.onload=()=>{local.set(key,reader.result);};
                  reader.readAsDataURL(blob);
                };
                mr.start();
                setTimeout(()=>mr.stop(),3000); // Record 3 seconds
              }catch(e){console.log('Mic error:',e);}
            }} title={local.get('rec_'+lang+'_'+w.w.replace(/[^a-zA-Z]/g,''),null)?"Tap to play":"Tap to record (3s)"} style={{width:30,height:30,borderRadius:"50%",background:local.get('rec_'+lang+'_'+w.w.replace(/[^a-zA-Z]/g,''),null)?W.success+"20":user==='shah'?WL.forest+"12":"#E8115B10",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:"none"}}>
              {local.get('rec_'+lang+'_'+w.w.replace(/[^a-zA-Z]/g,''),null)?
                <svg width="11" height="11" viewBox="0 0 24 24" fill={W.success}><path d="M8 5v14l11-7z"/></svg>
              :<svg width="11" height="11" viewBox="0 0 24 24" fill={user==='shah'?WL.forest:"#E8115B"}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
            </button>
            <button title="Play" style={{width:30,height:30,borderRadius:"50%",background:W.cardAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:"none"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={W.textMuted}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            </button>
          </div>
        </div>))}
      </>);})()}</div></div>);}

  // Learn home — Sy messages
  const syMsgs=["Ready to learn?","Sy believes in you!","Let's get those XP!","Purrfect day to study!","You're doing amazing!"];
  const syMsg=syMsgs[Math.floor(Date.now()/86400000)%syMsgs.length];
  // Leaderboard — both users' progress
  const partnerUser=user==='shah'?'dane':'shah';
  const myXp=xp;const partnerXp=local.get(partnerUser+'_xp',0);
  const myLessons=completed.length;const partnerLessons=local.get(partnerUser+'_completed',[]).length;
  const myName=user==='shah'?'Shah':'Dane';const partnerName=user==='shah'?'Dane':'Shah';
  const iWin=myXp>=partnerXp;

  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:W.bg,WebkitOverflowScrolling:"touch"}}>
    <div style={{background:dark?WD.cardAlt:`linear-gradient(155deg,#0F3329,#072E22)`,padding:"max(14px,env(safe-area-inset-top)) 20px 28px",borderRadius:"0 0 28px 28px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h1 style={{color:dark?"#E5E5E5":"#F2EDE4",fontSize:24,fontWeight:800,margin:0,letterSpacing:-0.5}}>Learn</h1>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {xp>0&&<div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"5px 12px"}}><span style={{color:"#1DB954",fontSize:13,fontWeight:800}}>{xp}</span><span style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>XP</span></div>}
          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",borderRadius:20,padding:"5px 12px"}}><span style={{fontSize:12}}>🔥</span><span style={{color:"#FF9500",fontSize:13,fontWeight:800}}>{streak}</span></div>
        </div>
      </div>
      {/* Sy mascot */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <Sy mood={xp>100?"proud":xp>30?"happy":"thinking"} size={52}/>
        <div style={{flex:1,background:"rgba(255,255,255,0.08)",borderRadius:14,padding:"10px 14px"}}>
          <p style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:600,margin:0,lineHeight:1.4}}>{syMsg}</p>
        </div>
      </div>
      <p style={{color:"rgba(255,255,255,0.45)",fontSize:12,margin:"0 0 4px",fontWeight:500}}>{completed.length} of 45 lessons completed</p>
      <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden",marginTop:6}}><div style={{width:Math.round((completed.length/45)*100)+"%",height:"100%",background:"rgba(255,255,255,0.4)",borderRadius:2,transition:"width 0.5s"}}/></div>
    </div>

    <div style={{padding:"20px 16px"}}>

    {/* Leaderboard */}
    <div style={{background:W.card,borderRadius:18,padding:"16px",marginBottom:16,border:"1px solid "+W.border}}>
      <p style={{color:W.forest,fontSize:13,fontWeight:700,margin:"0 0 12px",letterSpacing:-0.2}}>Leaderboard</p>
      {[{name:iWin?myName:partnerName,xp:iWin?myXp:partnerXp,lessons:iWin?myLessons:partnerLessons,color:iWin?(user==='shah'?S.green:S.rose):(user==='shah'?S.rose:S.green),rank:1},
        {name:iWin?partnerName:myName,xp:iWin?partnerXp:myXp,lessons:iWin?partnerLessons:myLessons,color:iWin?(user==='shah'?S.rose:S.green):(user==='shah'?S.green:S.rose),rank:2}
      ].map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:i>0?"1px solid "+W.border:"none"}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:i===0?S.gold+"20":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:i===0?S.gold:W.textMuted,fontSize:13,fontWeight:800}}>{p.rank}</span>
        </div>
        <div style={{width:32,height:32,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#fff",fontSize:12,fontWeight:800}}>{p.name[0]}</span>
        </div>
        <div style={{flex:1}}>
          <p style={{color:W.forest,fontSize:14,fontWeight:600,margin:0}}>{p.name}</p>
          <p style={{color:W.textMuted,fontSize:11,margin:0}}>{p.lessons} lessons</p>
        </div>
        <span style={{color:S.green,fontSize:16,fontWeight:800}}>{p.xp} <span style={{fontSize:11,fontWeight:500,color:W.textMuted}}>XP</span></span>
      </div>))}
    </div>

    {Object.entries(LANGS).map(([key,l])=>{const prog=langProgress(key);const doneLessons=l.lessons.filter(ls=>completed.includes(ls.id)).length;return(<button key={key} onClick={()=>{setLang(key);setView("browse");}} style={{width:"100%",display:"flex",alignItems:"center",gap:16,padding:"20px",background:W.card,borderRadius:20,marginBottom:12,border:"1px solid "+W.border,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
      <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${l.color}15,${l.color}08)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${l.color}20`}}><span style={{color:l.color,fontSize:24,fontWeight:800}}>{l.char}</span></div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{color:W.forest,fontSize:17,fontWeight:700,margin:"0 0 3px",letterSpacing:-0.3}}>{l.label}</p>
        <p style={{color:W.textMuted,fontSize:12,margin:"0 0 8px"}}>{l.sub}</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,height:3,background:W.border,borderRadius:2,overflow:"hidden"}}><div style={{width:prog+"%",height:"100%",background:l.color,borderRadius:2,transition:"width 0.5s"}}/></div>
          <span style={{color:W.textMuted,fontSize:11,fontWeight:600,flexShrink:0}}>{doneLessons}/{l.lessons.length}</span>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted} style={{flexShrink:0}}><path d="M9 18l6-6-6-6"/></svg>
    </button>);})}

    {(xp>0||completed.length>0)&&<button onClick={()=>{setXp(0);setCompleted([]);setHearts(5);local.set(user+'_xp',0);local.set(user+'_completed',[]);local.set(user+'_hearts',5);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1px solid "+W.error+"15",background:"transparent",color:W.error,fontSize:12,cursor:"pointer",fontWeight:500}}>Reset all progress</button>}
  </div></div>);
}

// Logout button for Settings
function LogoutBtn(){
  const {logout}=useUser()||{};const W=useW();
  return(<button onClick={logout} style={{width:"100%",marginTop:24,padding:"15px",borderRadius:14,border:"1px solid #E74C3C30",background:"#E74C3C08",color:"#E74C3C",fontSize:15,fontWeight:600,cursor:"pointer"}}>Log Out</button>);
}

function Us({onDark,isDark}){
  const W=useW();const dark=useDark();const {user,logout}=useUser()||{user:'shah'};
  const [events,setEvents]=useState(()=>local.get('us_events',[]));
  useEffect(()=>{local.set('us_events',events);},[events]);
  // Sync events from Supabase on mount
  useEffect(()=>{initSupabase.then(()=>{sync.loadEvents().then(d=>{if(d&&d.length)setEvents(d);});});},[]);
  const [addEvt,setAddEvt]=useState(false);const [ne,setNe]=useState({t:"",d:"",tm:""});
  const [tab,setTab]=useState("cal");const [calMonth,setCalMonth]=useState(new Date().getMonth());const [calYear,setCalYear]=useState(new Date().getFullYear());
  const [settings,setSettings]=useState({notif:true,alarms:true,sounds:false});
  const [notes,setNotes]=useState(()=>local.get('us_notes',[]));const [addNote,setAddNote]=useState(false);const [noteText,setNoteText]=useState("");
  const [addingWord,setAddingWord]=useState(false);const [newWord,setNewWord]=useState("");
  const [goals,setGoals]=useState(()=>local.get('us_goals',[
    {t:"Learn 100 words in each language",done:false,id:1},{t:"First Eid together",done:false,id:2},
    {t:"Cook Nihari together",done:false,id:3},{t:"Visit a masjid together",done:false,id:4},
    {t:"Meet each other's families",done:false,id:5}
  ]));const [addGoal,setAddGoal]=useState(false);const [newGoalText,setNewGoalText]=useState("");
  useEffect(()=>{local.set('us_goals',goals);},[goals]);
  // Sync notes from Supabase on mount
  useEffect(()=>{initSupabase.then(()=>{sync.loadNotes().then(d=>{if(d&&d.length)setNotes(d.map(n=>({text:n.text,from:n.from_name,dt:new Date(n.created_at).toLocaleDateString(),id:n.id})));});});},[]);
  useEffect(()=>{local.set('us_notes',notes);},[notes]);

  // Gym tracker
  const [gym,setGym]=useState(()=>local.get(user+'_gym',[]));
  useEffect(()=>{local.set(user+'_gym',gym);},[gym]);
  const [routines,setRoutines]=useState(()=>local.get(user+'_routines',[]));
  useEffect(()=>{local.set(user+'_routines',routines);},[routines]);
  const [gymView,setGymView]=useState("home"); // home | log | newRoutine | editRoutine | history
  const [gymDate,setGymDate]=useState(new Date().toISOString().split('T')[0]);
  const [activeRoutine,setActiveRoutine]=useState(null);
  const [logWeights,setLogWeights]=useState({});
  const [logCardio,setLogCardio]=useState({type:"",duration:"",incline:"",speed:"",distance:""});
  const [buildExercises,setBuildExercises]=useState([]);
  const [buildName,setBuildName]=useState("");
  const [buildCardio,setBuildCardio]=useState(null);
  const [exCat,setExCat]=useState("Push");
  const [selExercise,setSelExercise]=useState("");
  const [buildSets,setBuildSets]=useState("3");const [buildReps,setBuildReps]=useState("8");
  const [selDay,setSelDay]=useState(null); // selected calendar day
  const EXERCISES={
    "Push":["Bench Press","Incline Bench Press","Dumbbell Press","Dumbbell Flyes","Overhead Press","Lateral Raises","Tricep Pushdown","Tricep Dips","Cable Crossover","Push Ups","Close Grip Bench","Skull Crushers"],
    "Pull":["Deadlift","Barbell Row","Dumbbell Row","Lat Pulldown","Pull Ups","Chin Ups","Face Pulls","Bicep Curls","Hammer Curls","Cable Row","Shrugs","Reverse Flyes"],
    "Legs":["Squat","Leg Press","Romanian Deadlift","Lunges","Leg Extension","Leg Curl","Calf Raises","Hip Thrust","Bulgarian Split Squat","Goblet Squat","Hack Squat","Glute Kickback"],
    "Core":["Plank","Crunches","Leg Raises","Russian Twists","Ab Rollout","Cable Woodchops","Dead Bug","Mountain Climbers","Hanging Knee Raises","Pallof Press"]
  };
  const CARDIO_TYPES=["Treadmill","Stairmaster","Elliptical","Bike","Rowing","Jump Rope","Walking","Running","Incline Walk"];
  const todayStr=new Date().toISOString().split('T')[0];
  const todayWorkout=gym.find(g=>g.date===todayStr);
  const weekCount=gym.filter(g=>{const d=new Date(g.date);const n=new Date();return d>=new Date(n.getFullYear(),n.getMonth(),n.getDate()-7);}).length;
  const fmtSets=(sets)=>{
    if(!sets||!sets.length)return"";
    const allSame=sets.every(s=>s.reps===sets[0].reps&&s.weight===sets[0].weight);
    if(allSame){const s=sets[0];const n=sets.length;return(s.weight?s.weight+"lb — ":"")+n+(n===1?" set":" sets")+" of "+s.reps+" reps";}
    return sets.map((s,i)=>"S"+(i+1)+": "+(s.weight?s.weight+"lb×":"" )+s.reps).join(", ");
  };
  const saveLog=()=>{
    if(!activeRoutine)return;
    const exercises=activeRoutine.exercises.map((ex,i)=>{
      const w=logWeights[i]||"";
      const sets=[];for(let s=0;s<ex.sets;s++)sets.push({reps:ex.reps,weight:w});
      return{name:ex.name,sets};
    });
    const cardio=logCardio.type?logCardio:activeRoutine.cardio||null;
    const existing=gym.findIndex(g=>g.date===gymDate);
    const entry={date:gymDate,exercises,cardio,user,routine:activeRoutine.name};
    if(existing>=0){const n=[...gym];n[existing]=entry;setGym(n);}
    else setGym([...gym,entry]);
    setActiveRoutine(null);setLogWeights({});setLogCardio({type:"",duration:"",incline:"",speed:"",distance:""});setGymView("home");
  };
  const saveRoutine=()=>{
    if(!buildName.trim()||buildExercises.length===0)return;
    const r={name:buildName.trim(),exercises:buildExercises,cardio:buildCardio};
    setRoutines([...routines,r]);
    setBuildName("");setBuildExercises([]);setBuildCardio(null);setGymView("home");
  };

      const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dim=new Date(calYear,calMonth+1,0).getDate();const fd=new Date(calYear,calMonth,1).getDay();const calDays=[];for(let i=0;i<fd;i++)calDays.push(null);for(let i=1;i<=dim;i++)calDays.push(i);
  const today=new Date();const isToday=(day)=>day&&calMonth===today.getMonth()&&calYear===today.getFullYear()&&day===today.getDate();
  const hasEvent=(day)=>{if(!day)return null;const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");return events.find(e=>e.d===ds);};
  const upcomingEvents=events.filter(e=>e.d>=today.toISOString().split('T')[0]).sort((a,b)=>a.d.localeCompare(b.d));

  // Add event form
  if(addEvt)return(<div className="dc-slide-up" style={{height:"100%",background:W.bg,padding:"14px 16px"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><button onClick={()=>setAddEvt(false)} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={W.forest} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1 style={{color:W.forest,fontSize:21,fontWeight:700,margin:0}}>New event</h1></div>{[{l:"Title",k:"t",ph:"Iftar at mom's...",ty:"text"},{l:"Date",k:"d",ph:"",ty:"date"},{l:"Time",k:"tm",ph:"",ty:"time"}].map(f=>(<div key={f.k} style={{marginBottom:16}}><p style={{color:W.textMuted,fontSize:12,fontWeight:600,margin:"0 0 6px"}}>{f.l}</p><input type={f.ty} value={ne[f.k]} onChange={e=>setNe({...ne,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",padding:"14px",borderRadius:12,background:W.card,border:"1px solid "+W.border,color:W.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>))}<div style={{display:"flex",gap:8,marginBottom:16}}>{["#D4A84B","#E8115B","#1DB954","#8D67AB","#4B9CD3"].map(c=>(<button key={c} onClick={()=>setNe({...ne,c})} style={{width:32,height:32,borderRadius:"50%",background:c,border:ne.c===c?"3px solid "+W.text:"3px solid transparent",cursor:"pointer"}}/>))}</div><button onClick={()=>{if(ne.t){setEvents([...events,{id:Date.now(),t:ne.t,d:ne.d||"",tm:ne.tm||"",c:ne.c||"#D4A84B"}]);setNe({t:"",d:"",tm:""});setAddEvt(false);}}} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:ne.t?W.forest:W.border,color:ne.t?(dark?"#000":WL.cream):W.textMuted,fontSize:16,fontWeight:700,cursor:ne.t?"pointer":"not-allowed"}}>Save</button></div>);

  // Settings
  if(tab==="settings")return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:W.bg}}><div style={{background:dark?WD.cardAlt:WL.forest,padding:"12px 16px 20px",borderRadius:"0 0 24px 24px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><button onClick={()=>setTab("cal")} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dark?"#E8E8E8":WL.cream} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:21,fontWeight:700,margin:0}}>Settings</h1></div></div><div style={{padding:"16px"}}>
    {/* Push notifications - real */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid "+W.border}}>
      <div style={{flex:1}}><p style={{color:W.forest,fontSize:15,fontWeight:600,margin:0}}>Push Notifications</p><p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{!notif.supported?"Not supported on this browser":Notification.permission==="granted"?"Enabled — you'll get Fajr reminders":Notification.permission==="denied"?"Blocked — enable in browser settings":"Tap to enable"}</p></div>
      <button onClick={async()=>{if(notif.supported&&Notification.permission!=='granted'){const ok=await notif.requestPermission();if(ok){notif.send("Dane's Chai","Notifications are on! You'll get Fajr reminders during Ramadan.",{tag:"test"});}}}} style={{width:48,height:28,borderRadius:14,background:Notification.permission==="granted"?W.forest:W.border,border:"none",padding:2,cursor:"pointer",transition:"background 0.2s",display:"flex",alignItems:Notification.permission==="granted"?"flex-end":"flex-start",justifyContent:Notification.permission==="granted"?"flex-end":"flex-start"}}><div style={{width:24,height:24,borderRadius:12,background:S.white,boxShadow:"0 1px 3px rgba(0,0,0,0.15)",transition:"all 0.2s"}}/></button>
    </div>
    {/* Test notification button */}
    {notif.supported&&Notification.permission==="granted"&&<button onClick={()=>notif.send("Test from Dane's Chai","If you see this, notifications are working!",{tag:"test"})} style={{width:"100%",marginTop:12,padding:"12px",borderRadius:12,border:"1px solid "+W.border,background:"transparent",color:W.forest,fontSize:13,fontWeight:600,cursor:"pointer"}}>Send Test Notification</button>}
    {[{k:"dark",l:"Dark Mode",desc:"Switch theme"}].map(s=>{const on=isDark;return(<div key={s.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid "+W.border}}><div style={{flex:1}}><p style={{color:W.forest,fontSize:15,fontWeight:600,margin:0}}>{s.l}</p><p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{s.desc}</p></div><button onClick={()=>onDark(!isDark)} style={{width:48,height:28,borderRadius:14,background:on?W.forest:W.border,border:"none",padding:2,cursor:"pointer",transition:"background 0.2s",display:"flex",alignItems:on?"flex-end":"flex-start",justifyContent:on?"flex-end":"flex-start"}}><div style={{width:24,height:24,borderRadius:12,background:S.white,boxShadow:"0 1px 3px rgba(0,0,0,0.15)",transition:"all 0.2s"}}/></button></div>);})}
    <LogoutBtn/></div></div>);

  return(<div className="dc-fade-in" style={{height:"100%",display:"flex",flexDirection:"column",background:W.bg}}>
    {/* Header */}
    <div style={{background:dark?WD.cardAlt:WL.forest,padding:"max(12px,env(safe-area-inset-top)) 16px 16px",borderRadius:"0 0 24px 24px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:22,fontWeight:700,margin:0}}>Us</h1>
        <button onClick={()=>setTab("settings")} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.12)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><svg width="16" height="16" viewBox="0 0 24 24" fill={dark?"#E8E8E8":WL.cream}><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg></button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginTop:14,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>{[{k:"cal",l:"Calendar"},{k:"ourwords",l:"Our Words"},{k:"goals",l:"Goals"},{k:"gym",l:"Gym"},{k:"ideas",l:"Ideas"}].map(t=>(<button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 16px",borderRadius:20,border:"none",background:tab===t.k?"rgba(255,255,255,0.2)":"transparent",color:dark?"#E5E5E5":WL.cream,fontSize:12,fontWeight:tab===t.k?700:500,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t.l}</button>))}</div>
    </div>

    <div style={{flex:1,overflowY:"auto",paddingBottom:92,WebkitOverflowScrolling:"touch"}}>
      {/* CALENDAR TAB */}
      {tab==="cal"&&<div style={{padding:"16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(calYear-1);}else setCalMonth(calMonth-1);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,minWidth:44,minHeight:44}}><svg width="20" height="20" viewBox="0 0 24 24" fill={W.textMuted}><path d="M15 18l-6-6 6-6"/></svg></button>
          <h2 style={{color:W.forest,fontSize:17,fontWeight:700,margin:0}}>{months[calMonth]} {calYear}</h2>
          <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(calYear+1);}else setCalMonth(calMonth+1);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,minWidth:44,minHeight:44}}><svg width="20" height="20" viewBox="0 0 24 24" fill={W.textMuted}><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(<div key={d} style={{textAlign:"center",padding:"4px 0",color:W.textMuted,fontSize:11,fontWeight:600}}>{d}</div>))}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:16}}>{calDays.map((day,i)=>{const ev=hasEvent(day);const tod=isToday(day);return(<div key={"d"+i} style={{textAlign:"center",padding:"8px 0",borderRadius:10,background:tod?W.forest+"20":ev?ev.c+"15":"transparent",cursor:day?"pointer":"default"}}><span style={{color:day?(tod?W.forest:ev?ev.c:W.text):"transparent",fontSize:14,fontWeight:tod||ev?700:500}}>{day||""}</span>{ev&&<div style={{width:4,height:4,borderRadius:2,background:ev.c,margin:"2px auto 0"}}/>}{tod&&!ev&&<div style={{width:4,height:4,borderRadius:2,background:W.forest,margin:"2px auto 0"}}/>}</div>);})}</div>
        <button onClick={()=>setAddEvt(true)} style={{width:"100%",padding:"13px",background:W.forest,border:"none",borderRadius:50,color:dark?"#000":WL.cream,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>+ Add Event</button>
        {upcomingEvents.length>0&&<div style={{marginTop:16}}>
          <p style={{color:W.forest,fontSize:15,fontWeight:700,margin:"0 0 10px"}}>Upcoming</p>
          {upcomingEvents.slice(0,8).map(ev=>{
            const d=new Date(ev.d+"T12:00:00");const diff=Math.ceil((d-today)/(1000*60*60*24));
            return(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid "+W.border}}>
              <div style={{width:4,height:40,borderRadius:2,background:ev.c||W.forest,flexShrink:0}}/>
              <div style={{flex:1}}><p style={{color:W.forest,fontSize:14,fontWeight:600,margin:"0 0 2px"}}>{ev.t}</p><p style={{color:W.textMuted,fontSize:12,margin:0}}>{ev.d}{ev.tm?" · "+ev.tm:""}</p></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{background:(ev.c||W.forest)+"12",borderRadius:8,padding:"4px 8px"}}><span style={{color:ev.c||W.forest,fontSize:11,fontWeight:700}}>{diff===0?"Today":diff===1?"Tmrw":diff+"d"}</span></div>
                <button onClick={()=>setEvents(events.filter(e=>e.id!==ev.id))} style={{background:"none",border:"none",cursor:"pointer",padding:4,minWidth:32,minHeight:32}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              </div>
            </div>);
          })}
        </div>}
      </div>}

      {/* OUR WORDS TAB */}
      {tab==="ourwords"&&<div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <p style={{color:W.forest,fontSize:16,fontWeight:700,margin:"0 0 4px"}}>Our Words</p>
            <p style={{color:W.textMuted,fontSize:12,margin:0}}>Beautiful things we say to each other</p>
          </div>
        </div>
        {(()=>{
          const bWords=local.get('browse_bwords',[]);
          const setBWords=(v)=>{local.set('browse_bwords',v);};
          return(<>
            {addingWord?<div style={{background:W.card,borderRadius:14,padding:16,border:"1px solid "+W.border,marginBottom:12}}>
              <textarea value={newWord} onChange={e=>setNewWord(e.target.value)} placeholder="Something beautiful..." autoFocus style={{width:"100%",minHeight:60,padding:0,background:"transparent",border:"none",color:W.text,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{if(newWord.trim()){const w={t:newWord.trim(),from:user==='shah'?'Shah':'Dane',dt:new Date().toLocaleDateString(),id:Date.now()};setBWords([w,...bWords]);sync.addWord(w.t,w.from);setNewWord("");setAddingWord(false);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:13,fontWeight:600,cursor:"pointer"}}>Save</button>
                <button onClick={()=>{setAddingWord(false);setNewWord("");}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
            :<button onClick={()=>setAddingWord(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid "+W.border,background:W.card,color:W.textMuted,fontSize:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>+ Add something beautiful</button>}
            {bWords.map((b,i)=>(<div key={i} style={{background:W.card,borderRadius:14,padding:"14px 16px",marginBottom:8,border:"1px solid "+W.border,position:"relative"}}>
              <p style={{color:W.text,fontSize:14,fontWeight:500,margin:"0 0 6px",lineHeight:1.5}}>&ldquo;{b.t}&rdquo;</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:b.from==="Shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:7,fontWeight:700}}>{b.from[0]}</span></div>
                  <span style={{color:W.textMuted,fontSize:11}}>{b.from}{b.dt?" · "+b.dt:""}</span>
                </div>
                <button onClick={()=>{const w=bWords[i];sync.deleteWord(w.id);setBWords(bWords.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              </div>
            </div>))}
            {bWords.length===0&&!addingWord&&<div style={{textAlign:"center",padding:"32px 0"}}><p style={{color:W.textMuted,fontSize:13}}>Nothing yet — add something beautiful</p></div>}
          </>);
        })()}
      </div>}

      {/* IDEAS TAB */}
      {tab==="ideas"&&<div style={{padding:"16px"}}>
        {addNote?<div style={{background:W.card,borderRadius:14,padding:16,border:"1px solid "+W.border,marginBottom:12}}>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="What's the idea..." autoFocus style={{width:"100%",minHeight:100,padding:0,background:"transparent",border:"none",color:W.text,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>{if(noteText.trim()){const n={text:noteText.trim(),from:user==='shah'?'Shah':'Dane',dt:new Date().toLocaleDateString(),id:Date.now()};setNotes([n,...notes]);sync.addNote(n.text,n.from);setNoteText("");setAddNote(false);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:13,fontWeight:600,cursor:"pointer"}}>Save</button>
            <button onClick={()=>{setAddNote(false);setNoteText("");}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
        :<button onClick={()=>setAddNote(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid "+W.border,background:W.card,color:W.textMuted,fontSize:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>+ Drop an idea...</button>}
        {notes.length===0&&!addNote&&<div style={{textAlign:"center",padding:"30px 0"}}><p style={{color:W.textMuted,fontSize:13}}>No ideas yet — drop something here</p></div>}
        {notes.map((n,i)=>(<div key={n.id} style={{background:W.card,borderRadius:14,padding:"14px 16px",marginBottom:8,border:"1px solid "+W.border}}>
          <p style={{color:W.text,fontSize:14,margin:"0 0 8px",lineHeight:1.5}}>{n.text}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:n.from==="Shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:7,fontWeight:700}}>{n.from[0]}</span></div>
              <span style={{color:W.textMuted,fontSize:11}}>{n.from} · {n.dt}</span>
            </div>
            <button onClick={()=>{const n=notes[i];sync.deleteNote(n.id);setNotes(notes.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
          </div>
        </div>))}
      </div>}

      {/* GOALS TAB */}
      {tab==="goals"&&<div style={{padding:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <p style={{color:W.forest,fontSize:16,fontWeight:700,margin:"0 0 4px"}}>Goals</p>
            <p style={{color:W.textMuted,fontSize:12,margin:0}}>Things we're working toward together</p>
          </div>
          <div style={{background:W.success+"12",borderRadius:12,padding:"4px 12px"}}>
            <span style={{color:W.success,fontSize:12,fontWeight:600}}>{goals.filter(g=>g.done).length}/{goals.length}</span>
          </div>
        </div>
        {addGoal?<div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border,marginBottom:12}}>
          <input value={newGoalText} onChange={e=>setNewGoalText(e.target.value)} placeholder="New goal..." autoFocus style={{width:"100%",padding:"8px 0",background:"transparent",border:"none",color:W.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>{if(newGoalText.trim()){setGoals([...goals,{t:newGoalText.trim(),done:false,id:Date.now()}]);setNewGoalText("");setAddGoal(false);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:13,fontWeight:600,cursor:"pointer"}}>Add</button>
            <button onClick={()=>{setAddGoal(false);setNewGoalText("");}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
        :<button onClick={()=>setAddGoal(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid "+W.border,background:W.card,color:W.textMuted,fontSize:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>+ Add a goal</button>}
        {/* Progress bar */}
        {goals.length>0&&<div style={{marginBottom:16}}>
          <div style={{height:6,background:W.border,borderRadius:3,overflow:"hidden"}}><div style={{width:Math.round((goals.filter(g=>g.done).length/goals.length)*100)+"%",height:"100%",background:W.success,borderRadius:3,transition:"width 0.4s"}}/></div>
        </div>}
        {goals.map((g,i)=>(<div key={g.id} onClick={()=>{const n=[...goals];n[i]={...n[i],done:!n[i].done};setGoals(n);}} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:i<goals.length-1?"1px solid "+W.border:"none",cursor:"pointer",alignItems:"center"}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:g.done?W.success:"transparent",border:g.done?"none":"2px solid "+W.border,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
            {g.done&&<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
          </div>
          <p style={{flex:1,color:g.done?W.success:W.text,fontSize:14,fontWeight:g.done?600:400,margin:0,textDecoration:g.done?"line-through":"none",transition:"all 0.2s"}}>{g.t}</p>
          <button onClick={e=>{e.stopPropagation();setGoals(goals.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
        </div>))}
        {goals.length===0&&!addGoal&&<div style={{textAlign:"center",padding:"32px 0"}}><p style={{color:W.textMuted,fontSize:13}}>No goals yet — let's set some together</p></div>}
      </div>}

      {/* GYM TAB */}
      {tab==="gym"&&<div style={{padding:"16px 16px 20px"}}>

        {/* HOME VIEW */}
        {gymView==="home"&&<>
          {/* Stats row */}
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            {[{v:gym.length,l:"Total",c:W.forest},{v:weekCount,l:"This week",c:S.gold},{v:todayWorkout?"✓":"—",l:"Today",c:todayWorkout?S.green:W.textMuted}].map((s,i)=>(<div key={i} style={{flex:1,background:W.card,borderRadius:14,padding:"14px 8px",textAlign:"center",border:"1px solid "+W.border}}>
              <p style={{color:s.c,fontSize:22,fontWeight:800,margin:"0 0 2px"}}>{s.v}</p>
              <p style={{color:W.textMuted,fontSize:10,fontWeight:600,letterSpacing:0.5,margin:0}}>{s.l}</p>
            </div>))}
          </div>

          {/* Calendar mini — tap a day to see/log */}
          <div style={{background:W.card,borderRadius:16,padding:"14px",border:"1px solid "+W.border,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <button onClick={()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--;}setCalMonth(m);setCalYear(y);}} style={{background:"none",border:"none",cursor:"pointer",color:W.textMuted,fontSize:18,padding:"4px 8px"}}>‹</button>
              <p style={{color:W.text,fontSize:14,fontWeight:700,margin:0}}>{months[calMonth]} {calYear}</p>
              <button onClick={()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++;}setCalMonth(m);setCalYear(y);}} style={{background:"none",border:"none",cursor:"pointer",color:W.textMuted,fontSize:18,padding:"4px 8px"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
              {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} style={{textAlign:"center",padding:"2px 0"}}><span style={{color:W.textMuted,fontSize:9,fontWeight:600}}>{d}</span></div>))}
              {calDays.map((day,i)=>{
                if(!day)return <div key={i}/>;
                const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
                const workout=gym.find(g=>g.date===ds);
                const isSel=selDay===ds;const isT=isToday(day);
                return(<div key={i} onClick={()=>{setSelDay(isSel?null:ds);setGymDate(ds);}} style={{textAlign:"center",padding:"3px 0",cursor:"pointer"}}>
                  <div style={{width:30,height:30,borderRadius:15,background:isSel?W.forest:workout?W.forest+"18":isT?"rgba(255,255,255,0.06)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",transition:"all 0.15s"}}>
                    <span style={{color:isSel?(dark?"#000":"#fff"):workout?W.forest:isT?W.text:W.textMuted,fontSize:12,fontWeight:workout||isT||isSel?700:400}}>{day}</span>
                  </div>
                </div>);
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selDay&&<div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <p style={{color:W.forest,fontSize:14,fontWeight:700,margin:0}}>{new Date(selDay+"T12:00:00").toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</p>
              <button onClick={()=>{setGymDate(selDay);setGymView("log");}} style={{padding:"6px 14px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Log</button>
            </div>
            {(()=>{const w=gym.find(g=>g.date===selDay);if(!w)return <p style={{color:W.textMuted,fontSize:12,margin:0}}>Rest day</p>;return(<div>
              {w.routine&&<p style={{color:W.forest,fontSize:11,fontWeight:600,margin:"0 0 6px",opacity:0.7}}>{w.routine}</p>}
              {w.exercises.map((ex,j)=>(<p key={j} style={{color:W.text,fontSize:13,margin:"3px 0"}}>{ex.name} <span style={{color:W.textMuted,fontSize:11}}>— {fmtSets(ex.sets)}</span></p>))}
              {w.cardio&&<p style={{color:S.rose,fontSize:12,margin:"6px 0 0"}}>{w.cardio.type} — {w.cardio.duration}min{w.cardio.incline?" · "+w.cardio.incline+"% incline":""}{w.cardio.speed?" · "+w.cardio.speed+"mph":""}{w.cardio.distance?" · "+w.cardio.distance+"km":""}</p>}
              <button onClick={()=>setGym(gym.filter(g=>g.date!==selDay))} style={{marginTop:8,padding:"4px 12px",borderRadius:8,border:"1px solid rgba(229,57,53,0.2)",background:"transparent",color:"#E53935",fontSize:11,cursor:"pointer"}}>Delete</button>
            </div>);})()}
          </div>}

          {/* My Routines */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{color:W.text,fontSize:16,fontWeight:700,margin:0}}>My Routines</p>
              <button onClick={()=>setGymView("newRoutine")} style={{padding:"6px 14px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.forest,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ New</button>
            </div>
            {routines.length===0&&<p style={{color:W.textMuted,fontSize:13,margin:0}}>Create your first routine to get started</p>}
            {routines.map((r,ri)=>(<div key={ri} style={{background:W.card,borderRadius:14,padding:"14px 16px",marginBottom:8,border:"1px solid "+W.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <p style={{color:W.text,fontSize:15,fontWeight:700,margin:"0 0 4px"}}>{r.name}</p>
                  <p style={{color:W.textMuted,fontSize:11,margin:0}}>{r.exercises.length} exercises{r.cardio?" + cardio":""}</p>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={()=>{setActiveRoutine(r);setLogWeights({});setLogCardio(r.cardio||{type:"",duration:"",incline:"",speed:"",distance:""});setGymView("log");}} style={{padding:"8px 16px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start</button>
                  <button onClick={()=>setRoutines(routines.filter((_,j)=>j!==ri))} style={{padding:"8px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
                </div>
              </div>
              <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>{r.exercises.map((ex,i)=>(<span key={i} style={{padding:"3px 8px",borderRadius:6,background:W.forest+"12",color:W.forest,fontSize:10,fontWeight:600}}>{ex.name}</span>))}</div>
            </div>))}
          </div>

          {/* Recent workouts */}
          {gym.length>0&&<div>
            <p style={{color:W.text,fontSize:16,fontWeight:700,margin:"0 0 10px"}}>Recent</p>
            {gym.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map((g,i)=>(<div key={i} style={{background:W.card,borderRadius:12,padding:"12px 14px",marginBottom:6,border:"1px solid "+W.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{color:W.text,fontSize:13,fontWeight:600,margin:0}}>{new Date(g.date+"T12:00:00").toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</p>
                  {g.routine&&<p style={{color:W.forest,fontSize:10,fontWeight:600,margin:"2px 0 0"}}>{g.routine}</p>}
                </div>
                <span style={{color:W.textMuted,fontSize:11}}>{g.exercises.length} exercises</span>
              </div>
            </div>))}
          </div>}
        </>}

        {/* LOG VIEW — fill in weights for a routine */}
        {gymView==="log"&&<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <button onClick={()=>{setGymView("home");setActiveRoutine(null);}} style={{background:"none",border:"none",cursor:"pointer",minWidth:36,minHeight:36,display:"flex",alignItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={W.forest} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
            <h3 style={{color:W.text,fontSize:18,fontWeight:700,margin:0}}>{activeRoutine?activeRoutine.name:"Log Workout"}</h3>
          </div>

          {/* Date quick pick */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {[0,-1,-2,-3].map(offset=>{
              const d=new Date();d.setDate(d.getDate()+offset);const ds=d.toISOString().split('T')[0];
              const label=offset===0?"Today":offset===-1?"Yesterday":d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'});
              return(<button key={offset} onClick={()=>setGymDate(ds)} style={{padding:"7px 14px",borderRadius:10,border:gymDate===ds?"2px solid "+W.forest:"1px solid "+W.border,background:gymDate===ds?W.forest+"12":"transparent",color:gymDate===ds?W.forest:W.textMuted,fontSize:12,fontWeight:gymDate===ds?700:500,cursor:"pointer"}}>{label}</button>);
            })}
            <input type="date" value={gymDate} onChange={e=>setGymDate(e.target.value)} style={{padding:"7px 10px",borderRadius:10,background:"transparent",border:"1px solid "+W.border,color:W.textMuted,fontSize:11,fontFamily:"inherit"}}/>
          </div>

          {activeRoutine?<>
            {/* Exercises from routine */}
            {activeRoutine.exercises.map((ex,i)=>(<div key={i} style={{background:W.card,borderRadius:14,padding:"14px",marginBottom:8,border:"1px solid "+W.border}}>
              <p style={{color:W.text,fontSize:14,fontWeight:700,margin:"0 0 2px"}}>{ex.name}</p>
              <p style={{color:W.textMuted,fontSize:11,margin:"0 0 10px"}}>{ex.sets} sets × {ex.reps} reps</p>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:W.textMuted,fontSize:12,fontWeight:600}}>Weight:</span>
                <input value={logWeights[i]||""} onChange={e=>setLogWeights({...logWeights,[i]:e.target.value})} placeholder="lbs" type="number" style={{width:80,padding:"10px 12px",borderRadius:10,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:16,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                <span style={{color:W.textMuted,fontSize:12}}>lb</span>
              </div>
            </div>))}

            {/* Cardio section */}
            {activeRoutine.cardio?<div style={{background:W.card,borderRadius:14,padding:14,marginBottom:8,border:"1px solid "+S.rose+"25"}}>
              <p style={{color:S.rose,fontSize:14,fontWeight:700,margin:"0 0 10px"}}>{activeRoutine.cardio.type}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>MINUTES</p><input value={logCardio.duration||activeRoutine.cardio.duration||""} onChange={e=>setLogCardio({...logCardio,type:activeRoutine.cardio.type,duration:e.target.value})} type="number" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>INCLINE %</p><input value={logCardio.incline||""} onChange={e=>setLogCardio({...logCardio,incline:e.target.value})} type="number" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>SPEED (mph)</p><input value={logCardio.speed||""} onChange={e=>setLogCardio({...logCardio,speed:e.target.value})} type="number" step="0.1" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>DISTANCE (km)</p><input value={logCardio.distance||""} onChange={e=>setLogCardio({...logCardio,distance:e.target.value})} type="number" step="0.1" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
              </div>
            </div>:null}

            <button onClick={saveLog} style={{width:"100%",padding:"15px",background:W.forest,border:"none",borderRadius:50,color:dark?"#000":WL.cream,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44,marginTop:8}}>Save Workout</button>
          </>:
          /* No routine — standalone cardio log */
          <div>
            <p style={{color:W.text,fontSize:15,fontWeight:700,margin:"0 0 12px"}}>Quick Cardio Log</p>
            <div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {CARDIO_TYPES.map(ct=>(<button key={ct} onClick={()=>setLogCardio({...logCardio,type:ct})} style={{padding:"6px 12px",borderRadius:8,border:logCardio.type===ct?"2px solid "+S.rose:"1px solid "+W.border,background:logCardio.type===ct?S.rose+"12":"transparent",color:logCardio.type===ct?S.rose:W.textMuted,fontSize:11,fontWeight:logCardio.type===ct?700:500,cursor:"pointer"}}>{ct}</button>))}
              </div>
              {logCardio.type&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>MINUTES</p><input value={logCardio.duration} onChange={e=>setLogCardio({...logCardio,duration:e.target.value})} type="number" placeholder="30" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>INCLINE %</p><input value={logCardio.incline} onChange={e=>setLogCardio({...logCardio,incline:e.target.value})} type="number" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>SPEED (mph)</p><input value={logCardio.speed} onChange={e=>setLogCardio({...logCardio,speed:e.target.value})} type="number" step="0.1" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>DISTANCE (km)</p><input value={logCardio.distance} onChange={e=>setLogCardio({...logCardio,distance:e.target.value})} type="number" step="0.1" placeholder="—" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
              </div>}
            </div>
            {logCardio.type&&logCardio.duration&&<button onClick={()=>{
              const existing=gym.findIndex(g=>g.date===gymDate);
              const entry={date:gymDate,exercises:[],cardio:logCardio,user};
              if(existing>=0){const n=[...gym];n[existing]={...n[existing],cardio:logCardio};setGym(n);}
              else setGym([...gym,entry]);
              setLogCardio({type:"",duration:"",incline:"",speed:"",distance:""});setGymView("home");
            }} style={{width:"100%",padding:"15px",background:S.rose,border:"none",borderRadius:50,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44,marginTop:12}}>Save Cardio</button>}
          </div>}
        </div>}

        {/* NEW ROUTINE BUILDER */}
        {gymView==="newRoutine"&&<div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <button onClick={()=>{setGymView("home");setBuildExercises([]);setBuildName("");setBuildCardio(null);}} style={{background:"none",border:"none",cursor:"pointer",minWidth:36,minHeight:36,display:"flex",alignItems:"center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={W.forest} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
            <h3 style={{color:W.text,fontSize:18,fontWeight:700,margin:0}}>New Routine</h3>
          </div>

          <input value={buildName} onChange={e=>setBuildName(e.target.value)} placeholder="Routine name (e.g. Push Day)" style={{width:"100%",padding:"14px 16px",borderRadius:14,background:W.card,border:"1px solid "+W.border,color:W.text,fontSize:16,fontWeight:600,marginBottom:16,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>

          {/* Added exercises */}
          {buildExercises.length>0&&<div style={{marginBottom:14}}>
            <p style={{color:W.textMuted,fontSize:11,fontWeight:600,margin:"0 0 8px"}}>EXERCISES ({buildExercises.length})</p>
            {buildExercises.map((ex,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:W.card,borderRadius:10,marginBottom:4,border:"1px solid "+W.border}}>
              <span style={{color:W.textMuted,fontSize:11,fontWeight:700,width:18}}>{i+1}</span>
              <p style={{color:W.text,fontSize:13,fontWeight:600,margin:0,flex:1}}>{ex.name}</p>
              <span style={{color:W.textMuted,fontSize:11}}>{ex.sets}×{ex.reps}</span>
              <button onClick={()=>setBuildExercises(buildExercises.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </div>))}
          </div>}

          {/* Exercise picker */}
          <div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border,marginBottom:14}}>
            <p style={{color:W.text,fontSize:13,fontWeight:700,margin:"0 0 8px"}}>Add Exercise</p>
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {Object.keys(EXERCISES).map(cat=>(<button key={cat} onClick={()=>setExCat(cat)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:exCat===cat?W.forest:"transparent",color:exCat===cat?(dark?"#000":WL.cream):W.textMuted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{cat}</button>))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {EXERCISES[exCat].map(ex=>{
                const isSel=selExercise===ex;
                return(<div key={ex}>
                  <button onClick={()=>setSelExercise(isSel?"":ex)} style={{width:"100%",padding:"10px 8px",borderRadius:10,border:isSel?"2px solid "+W.forest:"1px solid "+W.border,background:isSel?W.forest+"12":"transparent",color:isSel?W.forest:W.text,fontSize:12,fontWeight:isSel?700:500,cursor:"pointer",textAlign:"left"}}>{ex}</button>
                  {isSel&&<div style={{display:"flex",gap:4,padding:"6px 0"}}>
                    <input value={buildSets} onChange={e=>setBuildSets(e.target.value)} type="number" placeholder="3" style={{flex:1,padding:"8px",borderRadius:6,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                    <span style={{color:W.textMuted,fontSize:11,alignSelf:"center"}}>×</span>
                    <input value={buildReps} onChange={e=>setBuildReps(e.target.value)} type="number" placeholder="8" style={{flex:1,padding:"8px",borderRadius:6,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:13,fontWeight:700,textAlign:"center",fontFamily:"inherit"}}/>
                    <button onClick={()=>{setBuildExercises([...buildExercises,{name:ex,sets:parseInt(buildSets)||3,reps:parseInt(buildReps)||8}]);setSelExercise("");setBuildSets("3");setBuildReps("8");}} style={{padding:"8px 12px",borderRadius:6,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:11,fontWeight:700,cursor:"pointer"}}>Add</button>
                  </div>}
                </div>);
              })}
            </div>
          </div>

          {/* Cardio option */}
          <div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border,marginBottom:16}}>
            <p style={{color:S.rose,fontSize:13,fontWeight:700,margin:"0 0 8px"}}>Add Cardio</p>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {CARDIO_TYPES.map(ct=>(<button key={ct} onClick={()=>setBuildCardio(buildCardio?.type===ct?null:{type:ct,duration:"20"})} style={{padding:"6px 12px",borderRadius:8,border:buildCardio?.type===ct?"2px solid "+S.rose:"1px solid "+W.border,background:buildCardio?.type===ct?S.rose+"12":"transparent",color:buildCardio?.type===ct?S.rose:W.textMuted,fontSize:11,fontWeight:buildCardio?.type===ct?700:500,cursor:"pointer"}}>{ct}</button>))}
            </div>
            {buildCardio&&<input value={buildCardio.duration} onChange={e=>setBuildCardio({...buildCardio,duration:e.target.value})} placeholder="Default minutes" type="number" style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>}
          </div>

          <button onClick={saveRoutine} disabled={!buildName.trim()||buildExercises.length===0} style={{width:"100%",padding:"15px",background:buildName.trim()&&buildExercises.length>0?W.forest:W.border,border:"none",borderRadius:50,color:buildName.trim()&&buildExercises.length>0?(dark?"#000":WL.cream):W.textMuted,fontSize:15,fontWeight:700,cursor:buildName.trim()&&buildExercises.length>0?"pointer":"not-allowed",minHeight:44}}>Save Routine</button>
        </div>}
      </div>}
    </div>
  </div>);
}

function NP({go}){const[p,setP]=useState(false);const[pr,setPr]=useState(0);const[t,setT]=useState(0);const r=useRef(null);
  const eps=local.get('tea_eps',[]);const curEp=eps.find(e=>e.s==='available')||eps[0]||{t:"Episode",id:1};
  const dur=curEp.duration?curEp.duration.split(':').reduce((a,b)=>a*60+Number(b),0):804;
  useEffect(()=>{if(p){r.current=setInterval(()=>{setT(v=>{const n=v+1;setPr((n/dur)*100);if(n>=dur){clearInterval(r.current);setP(false);setTimeout(()=>go("hw"),400);}return n;});},40);}else if(r.current)clearInterval(r.current);return()=>{if(r.current)clearInterval(r.current);};},[p]);const f=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#1E3264 0%,#15244A 25%,#0D0D0D 55%)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"max(8px, env(safe-area-inset-top)) 20px 8px"}}><button onClick={()=>go("series")} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div style={{textAlign:"center"}}><p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1.5,margin:0}}>PLAYING FROM</p><p style={{color:S.white,fontSize:13,fontWeight:600,margin:"2px 0 0"}}>Tea Sessions</p></div><div style={{width:38}}/></div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}><div style={{width:"70%",maxWidth:320,aspectRatio:"1"}}><Cv size={999} r={8} v={curEp.v||"main"} sh/></div></div><div style={{padding:"0 24px 40px"}}><h2 style={{color:S.white,fontSize:21,fontWeight:700,margin:"0 0 3px"}}>{curEp.t}</h2><p style={{color:S.sub,fontSize:13,margin:"0 0 20px"}}>Episode {curEp.id}</p><div style={{marginBottom:8}}><div style={{height:4,background:S.bar,borderRadius:2}}><div style={{width:Math.max(pr,0.5)+"%",height:"100%",background:S.white,borderRadius:2,position:"relative"}}><div style={{position:"absolute",right:-6,top:-4,width:12,height:12,borderRadius:"50%",background:S.white}}/></div></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:S.sub,fontSize:11}}>{f(t)}</span><span style={{color:S.sub,fontSize:11}}>{curEp.duration||f(dur)}</span></div></div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:28}}><button onClick={()=>setT(v=>Math.max(0,v-15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg></button><button onClick={()=>setP(!p)} style={{width:64,height:64,borderRadius:"50%",border:"none",cursor:"pointer",background:S.white,display:"flex",alignItems:"center",justifyContent:"center"}}>{p?<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>:<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><path d="M8 5v14l11-7z"/></svg>}</button><button onClick={()=>setT(v=>Math.min(dur,v+15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></button></div><button onClick={()=>go("hw")} style={{width:"100%",marginTop:14,padding:"10px",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:20,color:S.sub,fontSize:13,fontWeight:600,cursor:"pointer",minHeight:44}}>Skip to reflection</button></div></div>);}

function HW({go}){const[a,setA]=useState({});const[d,setD]=useState(false);const ok=a[1]&&a[1].length>5;
  const eps=local.get('tea_eps',[]);const curEp=eps.find(e=>e.s==='available')||eps[0]||{t:"Episode",id:1};
  const nextEp=eps.find(e=>e.id===curEp.id+1);
  if(d)return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:S.black}}><div style={{width:72,height:72,borderRadius:"50%",background:S.green,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}><svg width="36" height="36" viewBox="0 0 24 24" fill={S.black}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div><h2 style={{color:S.white,fontSize:24,fontWeight:700,margin:"0 0 6px"}}>Saved</h2><p style={{color:S.sub,fontSize:15,margin:"0 0 28px"}}>{nextEp?`Episode ${nextEp.id} unlocked`:"All caught up!"}</p><button onClick={()=>go("series")} style={{padding:"14px 48px",borderRadius:50,border:"none",background:S.white,color:S.black,fontSize:16,fontWeight:700,cursor:"pointer",minHeight:44}}>Done</button></div>);return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",background:"linear-gradient(180deg,#1E3264 0%,#0D0D0D 25%)",WebkitOverflowScrolling:"touch"}}><div style={{padding:"12px 20px"}}><button onClick={()=>go("np")} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button></div><div style={{padding:"0 24px 120px"}}><h1 style={{color:S.white,fontSize:22,fontWeight:700,margin:"0 0 4px"}}>Time to reflect</h1><p style={{color:S.sub,fontSize:14,margin:"0 0 20px"}}>{curEp.t} · Episode {curEp.id}</p>{[{id:1,p:"What stood out to you most?",req:true},{id:2,p:"Any questions? I got you.",req:false}].map(h=>(<div key={h.id} style={{marginBottom:18}}>{h.req&&<p style={{color:S.green,fontSize:11,fontWeight:700,margin:"0 0 6px"}}>REQUIRED</p>}<p style={{color:S.white,fontSize:15,lineHeight:1.5,margin:"0 0 8px"}}>{h.p}</p><textarea value={a[h.id]||""} onChange={e=>setA({...a,[h.id]:e.target.value})} placeholder="Type here..." style={{width:"100%",minHeight:75,padding:14,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.06)",color:S.white,fontSize:14,lineHeight:1.6,resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>))}<button onClick={ok?()=>{setD(true);const saved=local.get('tea_comments',{});saved[curEp.id]={1:a[1],2:a[2]||""};local.set('tea_comments',saved);if(nextEp){const updEps=eps.map(e=>e.id===nextEp.id?{...e,s:"available"}:e);local.set('tea_eps',updEps);}}:undefined} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:ok?S.green:S.faint,color:ok?S.black:S.muted,fontSize:16,fontWeight:700,cursor:ok?"pointer":"not-allowed",minHeight:44}}>{ok?"Submit":"Write a reflection to continue"}</button></div></div>);}

function Series({go}){
  const {user}=useUser()||{user:'shah'};const isShah=user==='shah';
  const [eps,setEps]=useState(()=>local.get('tea_eps',[
    {id:1,t:"So... What Is Ramadan?",s:"available",desc:"An intro to what Ramadan actually is, why Muslims fast, and what it means to Shah.",v:"ep1"},
    {id:2,t:"Why You Already Feel It",s:"locked",desc:"",v:"ep2"},
    {id:3,t:"Who Is Allah?",s:"locked",desc:"",v:"ep3"},
    {id:4,t:"The Quran Explained",s:"locked",desc:"",v:"main"},
  ]));
  const [addEp,setAddEp]=useState(false);const [newEp,setNewEp]=useState({t:"",desc:""});
  const [comments,setComments]=useState(()=>local.get('tea_comments',{}));
  const [reflectId,setReflectId]=useState(null);const [reflectText,setReflectText]=useState("");
  const [editId,setEditId]=useState(null);
  const [playingId,setPlayingId]=useState(null);
  const audioRef=useRef(null);
  useEffect(()=>{local.set('tea_eps',eps);},[eps]);
  useEffect(()=>{local.set('tea_comments',comments);},[comments]);

  const handleFile=(epId,file)=>{
    if(!file)return;
    const url=URL.createObjectURL(file);
    const mediaType=file.type.startsWith("video")?"video":file.type.startsWith("audio")?"audio":"file";
    // Get duration
    if(mediaType==="audio"||mediaType==="video"){
      const el=document.createElement(mediaType);
      el.src=url;el.onloadedmetadata=()=>{
        const dur=Math.floor(el.duration);const m=Math.floor(dur/60);const s=dur%60;
        setEps(prev=>prev.map(ep=>ep.id===epId?{...ep,mediaUrl:url,mediaType,duration:m+":"+String(s).padStart(2,"0"),fileName:file.name}:ep));
      };
    }else{
      setEps(prev=>prev.map(ep=>ep.id===epId?{...ep,mediaUrl:url,mediaType,fileName:file.name}:ep));
    }
  };

  const togglePlay=(epId)=>{
    const ep=eps.find(e=>e.id===epId);
    if(!ep?.mediaUrl)return;
    if(playingId===epId){
      if(audioRef.current){audioRef.current.pause();audioRef.current=null;}
      setPlayingId(null);
    }else{
      if(audioRef.current)audioRef.current.pause();
      const el=new Audio(ep.mediaUrl);
      el.play();el.onended=()=>setPlayingId(null);
      audioRef.current=el;setPlayingId(epId);
    }
  };

  // Add episode form
  if(addEp)return(<div className="dc-slide-up" style={{height:"100%",overflowY:"auto",background:"linear-gradient(180deg,#1E3264 0%,#0D0D0D 25%)",padding:"max(12px,env(safe-area-inset-top)) 20px 40px"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
      <button onClick={()=>{setAddEp(false);setNewEp({t:"",desc:""});}} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <h1 style={{color:S.white,fontSize:21,fontWeight:700,margin:0}}>New Episode</h1>
    </div>
    <div style={{marginBottom:16}}>
      <p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1,margin:"0 0 6px"}}>TITLE</p>
      <input value={newEp.t} onChange={e=>setNewEp({...newEp,t:e.target.value})} placeholder="Episode title..." style={{width:"100%",padding:"14px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:S.white,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
    <div style={{marginBottom:16}}>
      <p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1,margin:"0 0 6px"}}>DESCRIPTION</p>
      <textarea value={newEp.desc} onChange={e=>setNewEp({...newEp,desc:e.target.value})} placeholder="What's this episode about..." style={{width:"100%",minHeight:80,padding:14,borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:S.white,fontSize:14,lineHeight:1.5,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
    </div>
    <div style={{marginBottom:20}}>
      <p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1,margin:"0 0 6px"}}>UPLOAD AUDIO OR VIDEO</p>
      <p style={{color:S.muted,fontSize:11,margin:"0 0 8px"}}>Record on your phone, then upload the file here</p>
      <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",borderRadius:12,border:"1px dashed rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.02)",cursor:"pointer"}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={S.muted}><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
        <span style={{color:S.muted,fontSize:13}}>{newEp.file?newEp.file.name:"Choose file..."}</span>
        <input type="file" accept="audio/*,video/*" onChange={e=>{if(e.target.files[0])setNewEp({...newEp,file:e.target.files[0]});}} style={{display:"none"}}/>
      </label>
    </div>
    <button onClick={()=>{
      if(newEp.t.trim()){
        const ep={id:Date.now(),t:newEp.t.trim(),desc:newEp.desc.trim(),s:"available",v:"main"};
        if(newEp.file){
          const url=URL.createObjectURL(newEp.file);
          const mt=newEp.file.type.startsWith("video")?"video":"audio";
          ep.mediaUrl=url;ep.mediaType=mt;ep.fileName=newEp.file.name;
          // Detect duration
          const el=document.createElement(mt==="video"?"video":"audio");
          el.src=url;el.onloadedmetadata=()=>{
            const m=Math.floor(el.duration/60);const s=Math.floor(el.duration%60);
            ep.duration=m+":"+String(s).padStart(2,"0");
            setEps([...eps,ep]);setNewEp({t:"",desc:"",file:null});setAddEp(false);
          };
          return; // wait for metadata
        }
        setEps([...eps,ep]);setNewEp({t:"",desc:"",file:null});setAddEp(false);
      }
    }} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:newEp.t.trim()?"#E13300":"rgba(255,255,255,0.06)",color:newEp.t.trim()?"#fff":S.muted,fontSize:16,fontWeight:700,cursor:newEp.t.trim()?"pointer":"not-allowed",minHeight:44}}>Add Episode</button>
  </div>);

  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"linear-gradient(180deg,#1E3264 0%,#121212 35%)",WebkitOverflowScrolling:"touch"}}>
    <div style={{padding:"max(8px, env(safe-area-inset-top)) 16px 0"}}><button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 0",minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button></div>
    <div style={{display:"flex",gap:16,padding:"4px 20px 18px"}}><Cv size={125} r={6} v="ep1" sh/><div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1,margin:0}}>SERIES</p><h1 style={{color:S.white,fontSize:22,fontWeight:700,margin:"4px 0 0",lineHeight:1.1}}>Tea Sessions</h1><p style={{color:S.sub,fontSize:13,margin:"6px 0 0"}}>{eps.length} episodes</p></div></div>
    <div style={{padding:"0 20px"}}>{eps.map((ep,i)=>(<div key={ep.id} style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",opacity:ep.s==="locked"?0.35:1}}>
        {/* Play button or art */}
        {ep.mediaUrl?<button onClick={e=>{e.stopPropagation();togglePlay(ep.id);}} style={{width:42,height:42,borderRadius:ep.mediaType==="video"?4:21,background:playingId===ep.id?S.green+"30":"rgba(255,255,255,0.08)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          {playingId===ep.id?<div style={{display:"flex",gap:2,alignItems:"center"}}><div style={{width:3,height:14,background:S.green,borderRadius:1}}/><div style={{width:3,height:14,background:S.green,borderRadius:1}}/></div>
          :<svg width="16" height="16" viewBox="0 0 24 24" fill={S.white}><path d="M8 5v14l11-7z"/></svg>}
        </button>:<Cv size={42} r={4} v={ep.v||"main"}/>}
        <div style={{flex:1,minWidth:0}} onClick={ep.s!=="locked"&&ep.mediaUrl?()=>togglePlay(ep.id):undefined}>
          <p style={{color:ep.s==="available"?S.green:S.white,fontSize:15,fontWeight:500,margin:0}}>{ep.t}</p>
          <p style={{color:S.muted,fontSize:12,margin:"2px 0 0"}}>
            Episode {i+1}{ep.duration?" · "+ep.duration:""}{ep.mediaType==="video"?" · Video":ep.mediaType==="audio"?" · Audio":""}
          </p>
        </div>
        {ep.s==="locked"&&!isShah&&<svg width="14" height="14" viewBox="0 0 24 24" fill={S.muted}><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3-9H9V6a3 3 0 016 0v2z"/></svg>}
        {/* Shah controls */}
        {isShah&&<div style={{display:"flex",gap:2}}>
          <button onClick={e=>{e.stopPropagation();setEps(eps.map((x,j)=>j===i?{...x,s:x.s==="locked"?"available":"locked"}:x));}} style={{background:"none",border:"none",cursor:"pointer",padding:4}} title={ep.s==="locked"?"Unlock":"Lock"}>
            {ep.s==="locked"?<svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)"><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3-9H9V6a3 3 0 016 0v2z"/></svg>
            :<svg width="14" height="14" viewBox="0 0 24 24" fill={S.green}><path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6A5 5 0 007 6h2a3 3 0 016 0v2H6a2 2 0 00-2 2v10c0 1.1.9 2 2 2h12a2 2 0 002-2V10a2 2 0 00-2-2z"/></svg>}
          </button>
          <button onClick={e=>{e.stopPropagation();setEps(eps.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
        </div>}
      </div>
      {/* Description */}
      {ep.desc&&ep.s!=="locked"&&<p style={{color:S.muted,fontSize:12,margin:"4px 0 4px 54px",lineHeight:1.4}}>{ep.desc}</p>}
      {/* Shah: upload file to existing episode */}
      {isShah&&!ep.mediaUrl&&<label style={{display:"flex",alignItems:"center",gap:6,marginLeft:54,padding:"6px 12px",borderRadius:10,border:"1px dashed rgba(255,255,255,0.1)",cursor:"pointer",marginBottom:6,width:"fit-content"}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
        <span style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>Upload audio/video</span>
        <input type="file" accept="audio/*,video/*" onChange={e=>{if(e.target.files[0])handleFile(ep.id,e.target.files[0]);}} style={{display:"none"}}/>
      </label>}
      {/* Video player */}
      {ep.mediaType==="video"&&ep.mediaUrl&&ep.s!=="locked"&&<div style={{marginLeft:54,marginBottom:8}}>
        <video src={ep.mediaUrl} controls style={{width:"100%",borderRadius:8,maxHeight:200}} playsInline/>
      </div>}
      {/* Dane's comment */}
      {comments[ep.id]&&<div style={{marginLeft:54,padding:"8px 12px",background:"rgba(232,17,91,0.06)",borderRadius:10,marginBottom:6}}><p style={{color:"#E8115B",fontSize:12,margin:0}}><span style={{fontWeight:600}}>Dane:</span> {comments[ep.id]}</p></div>}
      {!isShah&&ep.s!=="locked"&&(reflectId===ep.id?<div style={{display:"flex",gap:4,marginLeft:54,marginBottom:6}}><input value={reflectText} onChange={e=>setReflectText(e.target.value)} autoFocus placeholder="Your thoughts..." style={{flex:1,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(232,17,91,0.12)",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit"}}/><button onClick={()=>{if(reflectText.trim()){setComments({...comments,[ep.id]:reflectText.trim()});setReflectId(null);setReflectText("");}}} style={{padding:"8px 12px",borderRadius:10,border:"none",background:"#E8115B",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Save</button></div>:<button onClick={()=>{setReflectId(ep.id);setReflectText(comments[ep.id]||"");}} style={{marginLeft:54,padding:"6px 14px",borderRadius:12,border:"1px solid rgba(232,17,91,0.15)",background:"transparent",color:"rgba(232,17,91,0.5)",fontSize:11,cursor:"pointer",marginBottom:6}}>{comments[ep.id]?"Edit reflection":"Reflect"}</button>)}
    </div>))}
    {/* Shah: add episode */}
    {isShah&&<div style={{marginTop:16}}>
      <button onClick={()=>setAddEp(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.4)",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Add Episode
      </button>
    </div>}
    </div>
  </div>);
}


class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  render(){
    if(this.state.hasError){
      return React.createElement('div',{style:{padding:40,textAlign:'center',background:'#121212',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}},
        React.createElement('p',{style:{color:'#E8115B',fontSize:18,fontWeight:700,marginBottom:8}},'Something went wrong'),
        React.createElement('p',{style:{color:'#9A9A9A',fontSize:13,marginBottom:16}},String(this.state.error)),
        React.createElement('button',{onClick:()=>{localStorage.clear();window.location.reload();},style:{padding:'12px 24px',borderRadius:20,border:'none',background:'#1DB954',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}},'Reset & Reload')
      );
    }
    return this.props.children;
  }
}

export default function App(){
  const[user,setUser]=useState(()=>local.get('user',null));
  const[s,setS]=useState(()=>{const saved=local.get('lastScreen','home');return["home","browse","learn","us","series","np","hw"].includes(saved)?saved:'home';});
  const[tab,setTab]=useState(()=>{const saved=local.get('lastTab','home');return["home","browse","learn","us"].includes(saved)?saved:'home';});
  const[dark,setDark]=useState(()=>local.get('dark',false));
  const[notifStatus,setNotifStatus]=useState(()=>notif.supported?Notification.permission:'unsupported');
  const go=t=>{setS(t);local.set('lastScreen',t);if(["home","browse","learn","us"].includes(t)){setTab(t);local.set('lastTab',t);}};
  const setDarkMode=(v)=>{setDark(v);local.set('dark',v);};
  const logout=()=>{setUser(null);local.set('user',null);setS('home');setTab('home');};
  const nav=["home","browse","learn","us","series"].includes(s);

  // Don't auto-prompt for notifications — let user enable in settings

  // Ramadan notifications — check on load + every 5 minutes
  useEffect(()=>{
    if(!user)return;
    const R=[
      {d:1,fajr:"5:49",mag:"5:53"},{d:2,fajr:"5:47",mag:"5:55"},{d:3,fajr:"5:45",mag:"5:57"},
      {d:4,fajr:"5:43",mag:"5:59"},{d:5,fajr:"5:41",mag:"6:01"},{d:6,fajr:"5:39",mag:"6:03"},
      {d:7,fajr:"5:37",mag:"6:05"},{d:8,fajr:"5:35",mag:"6:07"},{d:9,fajr:"5:33",mag:"6:09"},
      {d:10,fajr:"5:30",mag:"6:11"},{d:11,fajr:"5:28",mag:"6:13"},{d:12,fajr:"5:26",mag:"6:15"},
      {d:13,fajr:"5:24",mag:"6:17"},{d:14,fajr:"5:21",mag:"6:18"},{d:15,fajr:"5:19",mag:"6:20"},
      {d:16,fajr:"5:17",mag:"6:22"},{d:17,fajr:"5:14",mag:"6:24"},{d:18,fajr:"5:12",mag:"6:26"},
      {d:19,fajr:"6:09",mag:"7:28"},{d:20,fajr:"6:07",mag:"7:30"},{d:21,fajr:"6:04",mag:"7:32"},
      {d:22,fajr:"6:02",mag:"7:34"},{d:23,fajr:"5:59",mag:"7:35"},{d:24,fajr:"5:56",mag:"7:37"},
      {d:25,fajr:"5:54",mag:"7:39"},{d:26,fajr:"5:51",mag:"7:41"},{d:27,fajr:"5:48",mag:"7:43"},
      {d:28,fajr:"5:46",mag:"7:45"},{d:29,fajr:"5:43",mag:"7:47"},{d:30,fajr:"5:40",mag:"7:48"},
    ];
    const ramStart=new Date(2026,1,18);
    const dayNum=Math.max(1,Math.min(30,Math.floor((new Date()-ramStart)/(1000*60*60*24))+1));
    const td=R[dayNum-1];
    const check=()=>{if(td)notif.checkRamadan(td.fajr,td.mag,dayNum);};
    check(); // Check immediately
    const interval=setInterval(check,5*60*1000); // Re-check every 5 min while app is open
    return()=>clearInterval(interval);
  },[user]);

  // In-app toast notifications
  const [toasts,setToasts]=useState([]);
  useEffect(()=>{
    notif._toastCb=(t)=>setToasts(prev=>[...prev,t]);
    return()=>{notif._toastCb=null;};
  },[]);
  useEffect(()=>{
    if(toasts.length>0){const timer=setTimeout(()=>setToasts(prev=>prev.slice(1)),3500);return()=>clearTimeout(timer);}
  },[toasts]);

  if(!user)return(<><style>{`
    .dc-shake{animation:shake 0.4s ease-in-out;}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  `}</style><Login onLogin={(u)=>setUser(u)}/></>);

  return(<UserCtx.Provider value={{user,logout}}>
    <ErrorBoundary><DarkCtx.Provider value={dark}><Shell dark={dark}>
      {s==="home"&&<Home go={go}/>}
      {s==="browse"&&<Browse go={go}/>}
      {s==="learn"&&<Learn/>}
      {s==="us"&&<Us onDark={setDarkMode} isDark={dark}/>}
      {s==="np"&&<NP go={go}/>}
      {s==="hw"&&<HW go={go}/>}
      {s==="series"&&<Series go={go}/>}
      {nav&&<NavBar active={tab} go={go}/>}
      {/* In-app toast notifications */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:9999,padding:"max(env(safe-area-inset-top),8px) 16px 0",pointerEvents:"none"}}>
        {toasts.map((t,i)=>(<div key={t.id} style={{background:"rgba(24,24,24,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:16,padding:"12px 16px",marginBottom:8,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",gap:12,animation:"dcSlideDown 0.3s cubic-bezier(.16,1,.3,1)",pointerEvents:"auto"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1DB954,#169C46)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:"#fff",fontSize:13,fontWeight:700,margin:"0 0 1px",letterSpacing:-0.2}}>{t.title}</p>
            {t.body&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:12,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.body}</p>}
          </div>
          <button onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",padding:4,cursor:"pointer",flexShrink:0,pointerEvents:"auto"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>))}
      </div>
    </Shell></DarkCtx.Provider></ErrorBoundary>
  </UserCtx.Provider>);
}
