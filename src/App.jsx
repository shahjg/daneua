import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// Dark mode context
const DarkCtx = createContext(false);
const useDark = () => useContext(DarkCtx);

// User context — who's logged in (shah or dane)
const UserCtx = createContext(null);
const useUser = () => useContext(UserCtx);

// localStorage helpers
const local={get(k,f=null){try{const v=localStorage.getItem('dc_'+k);return v?JSON.parse(v):f;}catch{return f;}},set(k,v){try{localStorage.setItem('dc_'+k,JSON.stringify(v));}catch{}}};

// PIN Login Screen
function Login({onLogin}){
  const [who,setWho]=useState(null);const [pin,setPin]=useState("");const [error,setError]=useState(false);const [shake,setShake]=useState(false);const [splash,setSplash]=useState(true);
  const PINS={shah:"1234",dane:"5678"};// Change these
  const tryPin=(digit)=>{
    const next=pin+digit;
    if(next.length<4){setPin(next);setError(false);return;}
    if(next===PINS[who]){local.set('user',who);onLogin(who);}
    else{setError(true);setShake(true);setTimeout(()=>{setPin("");setShake(false);},500);}
  };
  const del=()=>{setPin(pin.slice(0,-1));setError(false);};

  // Splash screen — like D(ane)ua
  if(splash)return(<div onClick={()=>setSplash(false)} style={{height:"100%",background:"linear-gradient(160deg,#0B3D2E 0%,#0A2E22 40%,#071A14 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"15%",left:"10%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(29,185,84,0.08),transparent)",filter:"blur(40px)"}}/>
    <div style={{position:"absolute",bottom:"20%",right:"5%",width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,168,75,0.06),transparent)",filter:"blur(30px)"}}/>
    <div style={{textAlign:"center",position:"relative",zIndex:1}}>
      <Sy mood="happy" size={72}/>
      <h1 style={{color:"#fff",fontSize:36,fontWeight:300,margin:"20px 0 8px",letterSpacing:2,fontFamily:"Georgia,serif"}}>Dane's Chai</h1>
      <div style={{width:40,height:1.5,background:"#D4A84B",margin:"0 auto 16px",borderRadius:2}}/>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,fontWeight:400,letterSpacing:1}}>made by Shah, for Dane</p>
    </div>
    <p style={{position:"absolute",bottom:40,color:"rgba(255,255,255,0.15)",fontSize:12}}>tap anywhere</p>
  </div>);

  // Who's drinking?
  if(!who)return(<div style={{height:"100%",background:"linear-gradient(160deg,#0B3D2E 0%,#0A2E22 40%,#071A14 100%)",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"10%",right:"15%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(29,185,84,0.06),transparent)",filter:"blur(50px)"}}/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <Sy mood="thinking" size={56}/>
      <h2 style={{color:"#fff",fontSize:24,fontWeight:300,margin:"16px 0 4px",letterSpacing:1}}>Who's drinking?</h2>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:13,margin:"0 0 36px"}}>Pick your cup</p>
      <div style={{display:"flex",gap:20,width:"100%",maxWidth:300}}>
        {[{id:"shah",name:"Shah",color:"#1DB954",sub:"The one who made it"},{id:"dane",name:"Dane",color:"#E8115B",sub:"The one it's for"}].map(u=>(<button key={u.id} onClick={()=>setWho(u.id)} style={{flex:1,padding:"32px 16px",borderRadius:24,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)",cursor:"pointer",transition:"all 0.2s",backdropFilter:"blur(10px)"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:u.color,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 4px 20px "+u.color+"40"}}><span style={{color:"#fff",fontSize:20,fontWeight:700}}>{u.name[0]}</span></div>
          <p style={{color:"#fff",fontSize:17,fontWeight:500,margin:"0 0 4px"}}>{u.name}</p>
          <p style={{color:"rgba(255,255,255,0.2)",fontSize:11,margin:0}}>{u.sub}</p>
        </button>))}
      </div>
    </div>
  </div>);

  // PIN entry
  return(<div style={{height:"100%",background:"linear-gradient(160deg,#0B3D2E 0%,#0A2E22 40%,#071A14 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <button onClick={()=>{setWho(null);setPin("");}} style={{position:"absolute",top:16,left:16,background:"none",border:"none",cursor:"pointer",padding:12}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div style={{width:52,height:52,borderRadius:"50%",background:who==="shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:"0 4px 20px "+(who==="shah"?"#1DB95440":"#E8115B40")}}><span style={{color:"#fff",fontSize:20,fontWeight:700}}>{who==="shah"?"S":"D"}</span></div>
    <p style={{color:"#fff",fontSize:18,fontWeight:400,margin:"0 0 4px"}}>{who==="shah"?"Shah":"Dane"}</p>
    <p style={{color:"rgba(255,255,255,0.25)",fontSize:13,margin:"0 0 36px"}}>Enter your PIN</p>
    <div className={shake?"dc-shake":""} style={{display:"flex",gap:16,marginBottom:12}}>
      {[0,1,2,3].map(i=>(<div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?(error?"#E74C3C":"#1DB954"):"transparent",border:"1.5px solid "+(i<pin.length?(error?"#E74C3C":"#1DB954"):"rgba(255,255,255,0.15)"),transition:"all 0.15s"}}/>))}
    </div>
    {error&&<p style={{color:"#E74C3C",fontSize:12,margin:"0 0 8px",fontWeight:500}}>Wrong PIN</p>}
    <div style={{height:error?0:20}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,maxWidth:264}}>
      {[1,2,3,4,5,6,7,8,9,null,0,"del"].map((d,i)=>(<button key={i} onClick={d==="del"?del:d!==null?()=>tryPin(String(d)):undefined} style={{width:74,height:74,borderRadius:"50%",border:d!==null?"1px solid rgba(255,255,255,0.08)":"none",background:d!==null?"rgba(255,255,255,0.03)":"transparent",color:"#fff",fontSize:d==="del"?14:26,fontWeight:300,cursor:d!==null?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:1}}>{d==="del"?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>:d}</button>))}
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
const S={black:"#121212",card:"#1E1E1E",pill:"#2A2A2A",green:"#1DB954",white:"#FFF",sub:"#A7A7A7",muted:"#6A6A6A",faint:"#333",bar:"#4D4D4D",rose:"#E8115B",gold:"#D4A84B",purple:"#8D67AB",blue:"#4B9CD3",teal:"#1ED760"};
const WL={bg:"#FFFCF7",card:"#FFF",cardAlt:"#F7F3ED",forest:"#1A3D34",accent:"#D4A574",text:"#1A3D34",textMuted:"#7A8B84",border:"#E8E2D9",cream:"#F5F0E8",error:"#E57373",success:"#4CAF50"};
const WD={bg:"#121212",card:"#1E1E1E",cardAlt:"#252525",forest:"#A8D5BA",accent:"#D4A574",text:"#E8E8E8",textMuted:"#888",border:"#333",cream:"#1A3D34",error:"#E57373",success:"#4CAF50"};
const useW=()=>{const d=useDark();return d?WD:WL;};

const CSS=`*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{height:100%;width:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","SF Pro Display",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}input,textarea,button{font-family:inherit}::-webkit-scrollbar{width:0;display:none}*{scrollbar-width:none}@supports(height:100dvh){.dc-shell{height:100dvh!important}}.dc-fade-in{animation:dcFadeIn .25s ease}.dc-slide-up{animation:dcSlideUp .3s ease}@keyframes dcFadeIn{from{opacity:0}to{opacity:1}}@keyframes dcSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`;

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
],quiz:[
{q:"What direction is Urdu written?",opts:["Right-to-left","Both directions","Top-to-bottom","Diagonal"],ans:0},
{q:"What letter makes the \"ch\" sound?",opts:["A feeling","To sleep","To clean","Chay چ"],ans:3},
{q:"What's special about the Ṭay (ٹ) sound?",opts:["Retroflex — tongue curled back","The k sound","The r sound","The t sound"],ans:0},
{q:"اب means?",opts:["Thank you","Welcome","No","Father"],ans:3},
{q:"How many letters does the Urdu alphabet have?",opts:["39","29","30","114"],ans:0},
]},
{id:"u2",title:"The Urdu Alphabet (Part 2)",desc:"Learn the remaining 20 letters and understand letter connections.",xp:20,unlockAfter:"u1",content:[
{title:"Seen, Sheen, Suad, Zuad (س ش ص ض)",text:"Seen (س) — Makes an \"s\" sound, looks like a wavy line with teeth. Sheen (ش) — Makes a \"sh\" sound, same as Seen but with 3 dots above. Suad (ص) — An emphatic \"s\" (heavier, from further back in the mouth). Zuad (ض) — An emphatic \"z.\" The emphatic letters come from Arabic and give Urdu words a deeper, fuller sound."},
{title:"Toy, Zoy, Ain, Ghain (ط ظ ع غ)",text:"Toy (ط) — An emphatic \"t.\" Zoy (ظ) — An emphatic \"z.\" Ain (ع) — This is the letter with NO English equivalent. It's a deep throat sound, like the beginning of \"uh-oh\" but from way back. It's the hardest letter for English speakers. Ghain (غ) — A gargling \"gh\" sound. Shah will appreciate you even attempting Ain correctly."},
{title:"Fay, Qaaf, Kaaf, Gaaf (ف ق ک گ)",text:"Fay (ف) — \"f\" sound, easy. Qaaf (ق) — A deep \"q\" from the back of the throat. Different from Kaaf. Kaaf (ک) — Regular \"k\" sound. Gaaf (گ) — \"g\" as in \"go.\" Fun fact: Gaaf doesn't exist in Arabic. It was added specifically for Urdu and other South Asian languages."},
{title:"Laam, Meem, Noon (ل م ن)",text:"Laam (ل) — \"l\" sound. Meem (م) — \"m\" sound. Noon (ن) — \"n\" sound. These three are the easy ones — they sound exactly like their English counterparts. Bonus: Noon with no dot (ں) is a nasal N, like the \"n\" in French. You'll hear it in words like \"main\" (مَیں) = \"I/me.\""},
{title:"Wow, Hey, Hamza, Yay (و ہ ء ی)",text:"Wow (و) — Makes \"w,\" \"v,\" \"oo,\" or \"o\" sound depending on position. Very versatile. Hey (ہ) — Breathy \"h\" sound. Hamza (ء) — A glottal stop (like the pause in \"uh-oh\"). Yay (ی) — Makes \"y\" or \"ee\" sound. These are the final four. You now know all 39 letters."},
{title:"How Letters Connect",text:"Most Urdu letters connect to the next letter in a word, which changes their shape. Some letters (like Alif, Daal, Ray, Wow) only connect to the letter before them but NOT the letter after. This is why Urdu words look like flowing connected script rather than individual letters. Reading takes practice, but the pattern becomes clear with exposure."},
{title:"Practice: Common Words",text:"Now you can decode: نام (naam) = name. دل (dil) = heart. گھر (ghar) = home. محبت (mohabbat) = love. شکریہ (shukriya) = thank you. These all use the letters you just learned. You're reading Urdu."},
],quiz:[
{q:"Which letter has no English equivalent?",opts:["Ain ع","Alif ا","Wow و","Yay ی"],ans:0},
{q:"Gaaf (گ) was added for which languages?",opts:["English","Spanish","South Asian / Urdu","Arabic"],ans:2},
{q:"What does ں represent?",opts:["Nasal N","Alif ا","Kaaf ک","Daal د"],ans:0},
{q:"Which letters only connect to the previous letter?",opts:["Sheen ش","Alif, Daal, Ray, Wow","Seen س","Pay پ"],ans:1},
{q:"نام means?",opts:["How are you","Name","Thank you","Excuse me"],ans:1},
]},
{id:"u3",title:"Numbers 0-100",desc:"Count in Urdu, recognize number words, use them in daily life.",xp:20,unlockAfter:"u2",content:[
{title:"0 to 10",text:"0 = sifr (صفر). 1 = aik (ایک). 2 = do (دو). 3 = teen (تین). 4 = chaar (چار). 5 = paanch (پانچ). 6 = chay (چھ — NOT like chai). 7 = saat (سات). 8 = aath (آٹھ). 9 = nau (نَو). 10 = das (دس). Practice: Count Shah's nihari ingredients — \"aik kilo gosht\" (1 kilo meat)."},
{title:"11 to 20",text:"11 = gyarah. 12 = baarah. 13 = terah. 14 = chaudah. 15 = pandrah. 16 = solah. 17 = satrah. 18 = athaarah. 19 = unees. 20 = bees. Unlike English where teens follow a pattern, Urdu numbers 11-20 are each unique words. Memorize them as a set."},
{title:"Tens: 20 to 100",text:"20 = bees. 30 = tees. 40 = chaalees. 50 = pachaas. 60 = saath. 70 = sattar. 80 = assi. 90 = nabbe. 100 = sau (سَو). Pattern: 20 and 30 rhyme (bees/tees). After that each ten is its own word. Sau (100) is important — \"sau baar shukriya\" means \"thank you a hundred times.\""},
{title:"In-Between Numbers",text:"For 21-99, Urdu puts the ones digit first, then the tens. 21 = ikkees (not \"bees aik\"). 25 = pachchees. 32 = battees. 45 = paintaalees. 58 = athaawen. Each compound number has its own pronunciation. You won't memorize them all now, but recognizing the pattern is enough. Use \"aur\" (and) if you forget: \"paanch aur bees\" = 25."},
{title:"Numbers in Daily Life",text:"Phone numbers are read digit by digit: \"paanch, teen, saat, nau...\" Money uses numbers constantly: \"do sau rupay\" = 200 rupees. Time: \"teen baj gaye\" = it's 3 o'clock. Age: \"meri umar sattaees saal hai\" = my age is 27 years. At a desi grocery, you'll hear \"paanch kilo\" (5 kilos) or \"ek dozen\" (borrowed from English)."},
{title:"Urdu Number Script",text:"Urdu can also use its own numerals instead of 0-9: ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹. You'll see these on Pakistani currency, sign boards, and religious texts. Shah's parents might use them. The shapes are different from Arabic numerals but follow the same 0-9 system. Recognizing them is a bonus skill."},
],quiz:[
{q:"What is 7 in Urdu?",opts:["12","saat","A food item","Something different"],ans:1},
{q:"What is 50 in Urdu?",opts:["pachaas","nau","tees","teen"],ans:0},
{q:"How are compound numbers structured?",opts:["tees","Ones first, then tens","sau","paanch"],ans:1},
{q:"\"Sau\" means?",opts:["Something different","A food item","Sad","100"],ans:3},
{q:"How are phone numbers read?",opts:["Digit by digit","bees","gyarah","nau"],ans:0},
{q:"What does \"do sau rupay\" mean?",opts:["The opposite","To cook","200 rupees","To pray"],ans:2},
]},
{id:"u4",title:"Essential Phrases for Every Day",desc:"Navigate daily conversations with must-know expressions.",xp:20,unlockAfter:"u3",content:[
{title:"Please and Thank You",text:"Shukriya (shook-REE-yah) = thank you. Bohot shukriya = thank you very much. Meherbani (meh-her-BAH-nee) = kindness/please, used formally. In casual speech, Urdu doesn't use \"please\" as much as English — the politeness is built into the verb form instead. But \"shukriya\" after everything is always welcome."},
{title:"Sorry and Excuse Me",text:"Maaf kijiye (MAHF kee-jee-YAY) = excuse me / I'm sorry (formal). Maafi (mah-FEE) = forgiveness. \"Mujhe maaf karo\" = forgive me (casual). If you bump into someone: \"maaf kijiye.\" If you're genuinely sorry: \"mujhe bohot afsos hai\" (I have a lot of regret). Afsos is a heavy word — only use for real apologies."},
{title:"I Don't Understand",text:"Mujhe samajh nahi aaya (MOO-jay SAH-maj nah-HEE AH-yah) = I didn't understand. Shorter version: \"samajh nahi aayi.\" Thora thora samajh aata hai = I understand a little bit. Kya aap English bol sakte hain? = Can you speak English? These are your survival phrases when you're lost in conversation."},
{title:"Where, When, How Much",text:"Kahan (kah-HAHN) = where. Kab (KUB) = when. Kitna/Kitne (kit-NAH/kit-NAY) = how much/how many. Kyun (kee-YOON) = why. Kaun (KOWN) = who. Kaise (KAY-say) = how. These question words are the foundation of asking anything: \"Ye kitne ka hai?\" = How much is this? \"Tum kab aaoge?\" = When will you come?"},
{title:"Time Expressions",text:"Aaj (AHJ) = today. Kal (KUL) = tomorrow AND yesterday (same word, context tells you which). Parso = day after tomorrow / day before yesterday. Abhi (AH-bee) = right now. Baad mein (BAHD mayn) = later. Jaldi (JUL-dee) = quickly/soon. Desi time warning: when someone says \"abhi aata hoon\" (coming right now), add 30 minutes minimum."},
{title:"Agreement and Disagreement",text:"Haan (HAHN) = yes. Nahi (nah-HEE) = no. Ji haan = respectful yes. Ji nahi = respectful no. Bilkul (bil-KOOL) = absolutely. Theek hai (TEEK hay) = okay/fine. Zaroor (zah-ROOR) = definitely/of course. Shaayad (SHAH-yud) = maybe. \"Chalo theek hai\" = okay let's go with it — you'll use this one constantly."},
],quiz:[
{q:"How do you say \"I didn't understand\"?",opts:["Hello","To clean","Mujhe samajh nahi aaya","To run"],ans:2},
{q:"\"Kal\" can mean?",opts:["A food item","Thank you","A greeting","Both tomorrow AND yesterday"],ans:3},
{q:"\"Kitna\" means?",opts:["How much","To clean","To cook","Happy"],ans:0},
{q:"What does \"bilkul\" mean?",opts:["To cook","Absolutely","Welcome","Good morning"],ans:1},
{q:"\"Maaf kijiye\" is used for?",opts:["A place","The opposite","Excuse me / Sorry — formal","An action"],ans:2},
{q:"When someone says \"abhi aata hoon,\" you should?",opts:["Expect them in 30+ minutes","To sing","To write","To speak"],ans:0},
]},
{id:"u5",title:"Emotions and Feelings",desc:"Express how you feel and understand emotional expressions.",xp:20,unlockAfter:"u4",content:[
{title:"Happy and Sad",text:"Khush (KHOOSH) = happy. Khushi = happiness. \"Main bohot khush hoon\" = I am very happy. Udaas (oo-DAHS) = sad. \"Dil udaas hai\" = the heart is sad (poetic way to say I'm down). Rona (ROH-nah) = to cry. Muskurana (mus-koo-RAH-nah) = to smile. Desi culture note: men don't usually express sadness openly. If Shah says \"kuch nahi\" (nothing) when he's clearly upset, just be there."},
{title:"Anger and Frustration",text:"Gussa (GUS-sah) = anger. \"Mujhe gussa aa raha hai\" = I'm getting angry. Naraz (nah-RAHZ) = upset/offended, softer than gussa. \"Tum mujhse naraz ho?\" = Are you upset with me? Pareshaan (pah-ray-SHAHN) = worried/stressed. Tang (TAHNG) = annoyed/fed up. \"Mujhe tang mat karo\" = Don't annoy me. Know the difference between gussa (hot anger) and naraz (cold hurt feelings)."},
{title:"Love and Affection Beyond Romance",text:"Izzat (IZ-zut) = respect/honor. Huge in desi culture. Khayal (KHAH-yaal) = thought/care. \"Mera khayal rakho\" = take care of me / keep me in your thoughts. Fikr (FIK-er) = concern/worry about someone. \"Mujhe tumhari fikr hoti hai\" = I worry about you. Dua = prayer/blessing. \"Meri duaein tumhare saath hain\" = my prayers are with you."},
{title:"Surprise and Excitement",text:"Hairaan (hay-RAHN) = surprised/amazed. \"Main hairaan hoon\" = I'm amazed. Kamaal (kah-MAHL) = amazing/wonderful. \"Kamaal hai!\" = That's amazing! Josh (JOHSH) = excitement/enthusiasm. Waah! = Wow! (used constantly). \"Kya baat hai!\" (kee-YAH BAHT hay) = What a thing! — used to express being impressed. You'll hear Shah's family say \"waah waah\" when food is good."},
{title:"Comfort and Care",text:"Fikar mat karo (FIK-er mutt KAH-roh) = Don't worry. Sab theek ho jayega = Everything will be okay. \"Main hoon na\" = I'm here (literally \"I am, right?\") — this is what Shah says when he wants to reassure you. \"Apna khayal rakhna\" = Take care of yourself. \"Dil se\" = from the heart — when something is genuine and sincere."},
],quiz:[
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
],quiz:[
{q:"How many letters in the Filipino alphabet?",opts:["28","26","A food item","39"],ans:0},
{q:"What's special about \"NG\"?",opts:["Good morning","One letter, can start words","To write","To sleep"],ans:1},
{q:"Tagalog vowels are?",opts:["Alif ا","Pure and consistent","Noon ن","Laam ل"],ans:1},
{q:"What is a glottal stop?",opts:["A rolled r sound","A nasal hum","A sharp click","A tiny pause mid-word"],ans:3},
{q:"Tagalog spelling is?",opts:["Phonetic — spelled how it sounds","Kaaf ک","Laam ل","Seen س"],ans:0},
]},
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
],quiz:[
{q:"Kamusta comes from which language?",opts:["Arabic","Spanish","Chinese","Japanese"],ans:1},
{q:"Adding \"po\" shows?",opts:["Good night","A feeling","Respect","To cook"],ans:2},
{q:"\"Hindi\" means?",opts:["Angry","A place","Sad","No"],ans:3},
{q:"What is \"mano po\"?",opts:["100","Taking elder's hand to forehead","42","39"],ans:1},
{q:"\"Mabuti naman\" means?",opts:["To run","A person","A place","I'm good"],ans:3},
]},
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
],quiz:[
{q:"Arabic is written in which direction?",opts:["Right-to-left","Both directions","Left-to-right","Top-to-bottom"],ans:0},
{q:"How many letters in the Arabic alphabet?",opts:["42","10","114","28"],ans:3},
{q:"Ba, Ta, Tha differ by?",opts:["Seen س","Laam ل","Yay ی","Number of dots"],ans:3},
{q:"What are \"emphatic\" letters?",opts:["A person","Deeper, fuller versions of regular consonants","A place","The opposite"],ans:1},
{q:"Which letters don't connect forward?",opts:["Dal, Dhal, Ra, Zay","To sleep","Thank you","Something different"],ans:0},
]},
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
],quiz:[
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
],quiz:[
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

function NavBar({active,go}){const W=useW();const warm=["learn","us"].includes(active);const items=[{id:"home",label:"Home",d:"M13 3L3 9v12h7v-7h4v7h7V9z"},{id:"browse",label:"Browse",d:"M10 3H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm10 0h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zM10 13H4a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm10 0h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1z"},{id:"learn",label:"Learn",d:"M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"},{id:"us",label:"Us",d:"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"}];return(<div style={{position:"absolute",bottom:0,left:0,right:0,paddingBottom:"max(16px, env(safe-area-inset-bottom))",paddingTop:12,background:warm?`linear-gradient(transparent,${W.bg}ee 20%)`:"linear-gradient(transparent,rgba(0,0,0,0.95) 20%)",display:"flex",alignItems:"center",justifyContent:"space-around",zIndex:40,transition:"background 0.3s"}}>{items.map(({id,label,d})=>{const a=active===id;const col=a?(warm?W.forest:S.white):(warm?W.textMuted:S.muted);return(<button key={id} onClick={()=>go(id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:col,padding:"6px 16px",minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill={col}><path d={d}/></svg><span style={{fontSize:10,fontWeight:a?700:400}}>{label}</span></button>);})}</div>);}

function Home({go}){
  const {user}=useUser()||{user:'shah'};const name=user==='shah'?'Shah':'Dane';
  const xp=local.get(user+'_xp',0);const completed=local.get(user+'_completed',[]);const streak=local.get(user+'_streak',0);
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

  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}>
    {/* Header gradient */}
    <div style={{background:"linear-gradient(180deg,#0B3D2E 0%,#121212 70%)",padding:"max(14px, env(safe-area-inset-top)) 16px 0"}}>
      {/* Greeting row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:user==='shah'?S.green:S.rose,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:S.white,fontSize:14,fontWeight:800}}>{name[0]}</span></div>
          <div>
            <p style={{color:S.white,fontSize:20,fontWeight:700,margin:0}}>{greeting}, {name}</p>
          </div>
        </div>
        <Sy mood="happy" size={32}/>
      </div>

      {/* Ramadan card */}
      <div onClick={()=>go("browse")} style={{background:"linear-gradient(135deg,#1A3352,#0D1F33)",borderRadius:14,padding:"16px 18px",marginBottom:12,cursor:"pointer",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(212,168,75,0.06)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{color:S.gold,fontSize:11,fontWeight:700,letterSpacing:1.5,margin:"0 0 4px"}}>RAMADAN 1447</p>
            <p style={{color:S.white,fontSize:26,fontWeight:300,margin:"0 0 2px"}}>Day {dayNum}</p>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:0}}>{td.dt}, 2026</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:10,fontWeight:600,margin:"0 0 4px"}}>SUHOOR ENDS</p>
            <p style={{color:S.white,fontSize:18,fontWeight:500,margin:"0 0 8px"}}>{td.fajr}</p>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:10,fontWeight:600,margin:"0 0 4px"}}>IFTAR</p>
            <p style={{color:S.gold,fontSize:18,fontWeight:500,margin:0}}>{td.mag}</p>
          </div>
        </div>
      </div>

      {/* Quick access grid — Spotify style compact cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
        {[
          {label:"Learn",sub:completed.length>0?completed.length+" done":"Start here",icon:"📚",ck:"learn",bg:"#1DB954"},
          {label:"Our Ramadan",sub:"Day "+dayNum+" · "+td.fajr,icon:"☽",ck:"browse",bg:"#1A3352"},
          {label:"Ask Anything",sub:"Q&A",icon:"💬",ck:"browse",bg:"#5C1A6E"},
          {label:"Tea Sessions",sub:"Episodes",icon:"☕",ck:"series",bg:"#E13300"},
        ].map((c,i)=>(<div key={i} onClick={()=>go(c.ck)} style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.07)",borderRadius:6,overflow:"hidden",height:52,cursor:"pointer"}}>
          <div style={{width:52,height:52,background:c.bg+"25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:18}}>{c.icon}</span></div>
          <div style={{padding:"0 10px",minWidth:0}}>
            <p style={{color:S.white,fontSize:13,fontWeight:600,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.label}</p>
          </div>
        </div>))}
      </div>
    </div>

    <div style={{padding:"16px 16px 0"}}>
      {/* Progress — only show if they've started */}
      {(xp>0||completed.length>0)?<div style={{marginBottom:20}}>
        <h2 style={{color:S.white,fontSize:19,fontWeight:700,margin:"0 0 12px"}}>Your progress</h2>
        <div style={{display:"flex",gap:10}}>
          {[{v:xp,l:"XP",c:S.green},{v:completed.length+"/45",l:"Lessons",c:S.gold},{v:streak||"—",l:"Day streak",c:S.rose}].map((s,i)=>(<div key={i} style={{flex:1,background:S.card,borderRadius:12,padding:"14px 12px",textAlign:"center"}}>
            <p style={{color:s.c,fontSize:22,fontWeight:700,margin:"0 0 2px"}}>{s.v}</p>
            <p style={{color:S.sub,fontSize:11,margin:0}}>{s.l}</p>
          </div>))}
        </div>
      </div>
      :<button onClick={()=>go("learn")} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"18px 16px",background:"linear-gradient(135deg,#1A3D34,#2D5A4A)",borderRadius:14,border:"none",cursor:"pointer",marginBottom:20}}>
        <Sy mood="thinking" size={40}/>
        <div style={{flex:1,textAlign:"left"}}>
          <p style={{color:S.white,fontSize:15,fontWeight:600,margin:"0 0 2px"}}>Start your first lesson</p>
          <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,margin:0}}>Learn Urdu, Tagalog, or Arabic</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={S.sub}><path d="M9 18l6-6-6-6"/></svg>
      </button>}

      {/* Browse sections as Spotify-style horizontal scroll */}
      <h2 style={{color:S.white,fontSize:19,fontWeight:700,margin:"0 0 12px"}}>Made for you</h2>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:16,marginRight:-16,WebkitOverflowScrolling:"touch"}}>
        {[
          {id:"steps",t:"First Steps",s:"Video guides from Shah",c:"#0B4D3A",ic:"▶"},
          {id:"stories",t:"Storytime",s:"Prophets' stories",c:"#4A2068",ic:"📖"},
          {id:"food",t:"Soul Food",s:"Recipes from both worlds",c:"#8C1D3F",ic:"🍳"},
          {id:"words",t:"Our Words",s:"A love archive",c:"#1A4A5C",ic:"✎"},
          {id:"growth",t:"Looking Forward",s:"Things we can't wait for",c:"#2A4A8C",ic:"★"},
        ].map(cat=>(<div key={cat.id} onClick={()=>go("browse")} style={{width:"40vw",maxWidth:160,flexShrink:0,cursor:"pointer"}}>
          <div style={{aspectRatio:"1",borderRadius:8,background:"linear-gradient(160deg,"+cat.c+","+cat.c+"88)",display:"flex",alignItems:"flex-end",padding:12,marginBottom:8,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:10,right:10,fontSize:24,opacity:0.3}}>{cat.ic}</div>
            <p style={{color:"#fff",fontSize:15,fontWeight:700,margin:0,lineHeight:1.2,position:"relative",zIndex:1}}>{cat.t}</p>
          </div>
          <p style={{color:S.sub,fontSize:12,margin:0,lineHeight:1.3}}>{cat.s}</p>
        </div>))}
      </div>
    </div>
  </div>);
}

// Location component — shows on Home and Us tab

function Browse({go}){
  const {user}=useUser()||{user:'shah'};const isShah=user==='shah';
  const [sel,setSel]=useState(null);const [askQ,setAskQ]=useState("");const [asked,setAsked]=useState(()=>local.get('browse_asked',[]));
  const [ms,setMs]=useState(()=>local.get('browse_ms',[]));
  const [addingM,setAddingM]=useState(false);const [newM,setNewM]=useState("");const [newD,setNewD]=useState("");const [playVid,setPlayVid]=useState(null);
  // Editable Browse content — stored in localStorage
  const [bVids,setBVids]=useState(()=>local.get('browse_vids',[]));
  const [bStories,setBStories]=useState(()=>local.get('browse_stories',[]));
  const [bRecipes,setBRecipes]=useState(()=>local.get('browse_recipes',[]));
  const [bQA,setBQA]=useState(()=>local.get('browse_qa',[]));
  const [bWords,setBWords]=useState(()=>local.get('browse_words',[]));
  const [addForm,setAddForm]=useState(null);const [formData,setFormData]=useState({});
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
    return(<div style={{padding:"0 24px"}}>
      {items.length===0&&<div style={{textAlign:"center",padding:"40px 0"}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:"1px solid rgba(255,255,255,0.06)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div>
        <p style={{color:"rgba(255,255,255,0.2)",fontSize:14}}>{emptyMsg}</p>
      </div>}
      {items.map((item,i)=>(<div key={i} style={{padding:"14px 0",borderBottom:i<items.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {item.url&&(item.type||'').startsWith('video/')?
            <div style={{width:64,height:48,borderRadius:8,background:"#1E1E1E",overflow:"hidden",flexShrink:0,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <video src={item.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
          :item.url&&(item.type||'').startsWith('audio/')?
            <div style={{width:40,height:40,borderRadius:10,background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z"/></svg>
            </div>
          :null}
          <div style={{flex:1,minWidth:0}}>
            <p style={{color:"#fff",fontSize:15,fontWeight:500,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.t}</p>
            {item.s&&<p style={{color:"rgba(255,255,255,0.3)",fontSize:12,margin:0}}>{item.s}</p>}
            {item.dur&&<span style={{color:"rgba(255,255,255,0.2)",fontSize:11}}>{item.dur}</span>}
          </div>
        </div>
        {item.url&&<div style={{marginTop:8}}>
          {(item.type||'').startsWith('audio/')&&<audio src={item.url} controls style={{width:"100%",height:32,borderRadius:8}}/>}
          {(item.type||'').startsWith('video/')&&<video src={item.url} controls style={{width:"100%",borderRadius:8,marginTop:4,maxHeight:200}}/>}
        </div>}
        {item.comment&&<div style={{background:"rgba(232,17,91,0.06)",borderRadius:10,padding:"8px 12px",marginTop:8}}><p style={{color:"#E8115B",fontSize:12,margin:0}}><span style={{fontWeight:600}}>Dane:</span> {item.comment}</p></div>}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          {!isShah&&<button onClick={()=>{const c=prompt("Add a comment:");if(c){const n=[...items];n[i]={...n[i],comment:c};setItems(n);}}} style={{padding:"5px 14px",borderRadius:12,border:"1px solid rgba(232,17,91,0.2)",background:"transparent",color:"#E8115B",fontSize:11,cursor:"pointer"}}>Reply</button>}
          {isShah&&<button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{padding:"5px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.2)",fontSize:11,cursor:"pointer"}}>Remove</button>}
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
  // Real Ramadan 1447 timetable — Jamia Riyadhul Jannah, Edmonton
  const R=[
    {d:1,dt:"Feb 18",day:"Wed",fajr:"5:49",sun:"7:45",zuhr:"12:47",asr:"3:59",mag:"5:53",isha:"7:42"},
    {d:2,dt:"Feb 19",day:"Thu",fajr:"5:47",sun:"7:43",zuhr:"12:52",asr:"3:59",mag:"5:55",isha:"7:43"},
    {d:3,dt:"Feb 20",day:"Fri",fajr:"5:45",sun:"7:41",zuhr:"12:52",asr:"4:01",mag:"5:57",isha:"7:45"},
    {d:4,dt:"Feb 21",day:"Sat",fajr:"5:43",sun:"7:39",zuhr:"12:52",asr:"4:03",mag:"5:59",isha:"7:47"},
    {d:5,dt:"Feb 22",day:"Sun",fajr:"5:41",sun:"7:37",zuhr:"12:52",asr:"4:04",mag:"6:01",isha:"7:49"},
    {d:6,dt:"Feb 23",day:"Mon",fajr:"5:39",sun:"7:34",zuhr:"12:52",asr:"4:06",mag:"6:03",isha:"7:51"},
    {d:7,dt:"Feb 24",day:"Tue",fajr:"5:37",sun:"7:32",zuhr:"12:52",asr:"4:08",mag:"6:05",isha:"7:53"},
    {d:8,dt:"Feb 25",day:"Wed",fajr:"5:35",sun:"7:30",zuhr:"12:51",asr:"4:10",mag:"6:07",isha:"7:55"},
    {d:9,dt:"Feb 26",day:"Thu",fajr:"5:33",sun:"7:28",zuhr:"12:51",asr:"4:11",mag:"6:09",isha:"7:56"},
    {d:10,dt:"Feb 27",day:"Fri",fajr:"5:30",sun:"7:25",zuhr:"12:51",asr:"4:13",mag:"6:11",isha:"7:58"},
    {d:11,dt:"Feb 28",day:"Sat",fajr:"5:28",sun:"7:23",zuhr:"12:51",asr:"4:15",mag:"6:13",isha:"8:00"},
    {d:12,dt:"Mar 1",day:"Sun",fajr:"5:26",sun:"7:21",zuhr:"12:51",asr:"4:16",mag:"6:15",isha:"8:02"},
    {d:13,dt:"Mar 2",day:"Mon",fajr:"5:24",sun:"7:18",zuhr:"12:51",asr:"4:18",mag:"6:17",isha:"8:04"},
    {d:14,dt:"Mar 3",day:"Tue",fajr:"5:21",sun:"7:16",zuhr:"12:50",asr:"4:20",mag:"6:18",isha:"8:06"},
    {d:15,dt:"Mar 4",day:"Wed",fajr:"5:19",sun:"7:14",zuhr:"12:50",asr:"4:21",mag:"6:20",isha:"8:08"},
    {d:16,dt:"Mar 5",day:"Thu",fajr:"5:17",sun:"7:11",zuhr:"12:50",asr:"4:23",mag:"6:22",isha:"8:10"},
    {d:17,dt:"Mar 6",day:"Fri",fajr:"5:14",sun:"7:09",zuhr:"12:50",asr:"4:25",mag:"6:24",isha:"8:12"},
    {d:18,dt:"Mar 7",day:"Sat",fajr:"5:12",sun:"7:07",zuhr:"12:49",asr:"4:26",mag:"6:26",isha:"8:14"},
    {d:19,dt:"Mar 8",day:"Sun",fajr:"6:09",sun:"8:04",zuhr:"1:49",asr:"5:30",mag:"7:28",isha:"9:16"},
    {d:20,dt:"Mar 9",day:"Mon",fajr:"6:07",sun:"8:02",zuhr:"1:49",asr:"5:31",mag:"7:30",isha:"9:18"},
    {d:21,dt:"Mar 10",day:"Tue",fajr:"6:04",sun:"8:00",zuhr:"1:49",asr:"5:33",mag:"7:32",isha:"9:20"},
    {d:22,dt:"Mar 11",day:"Wed",fajr:"6:02",sun:"7:57",zuhr:"1:48",asr:"5:34",mag:"7:34",isha:"9:22"},
    {d:23,dt:"Mar 12",day:"Thu",fajr:"5:59",sun:"7:55",zuhr:"1:48",asr:"5:36",mag:"7:35",isha:"9:24"},
    {d:24,dt:"Mar 13",day:"Fri",fajr:"5:56",sun:"7:52",zuhr:"1:48",asr:"5:37",mag:"7:37",isha:"9:26"},
    {d:25,dt:"Mar 14",day:"Sat",fajr:"5:54",sun:"7:50",zuhr:"1:48",asr:"5:39",mag:"7:39",isha:"9:28"},
    {d:26,dt:"Mar 15",day:"Sun",fajr:"5:51",sun:"7:48",zuhr:"1:47",asr:"5:40",mag:"7:41",isha:"9:30"},
    {d:27,dt:"Mar 16",day:"Mon",fajr:"5:48",sun:"7:45",zuhr:"1:47",asr:"5:42",mag:"7:43",isha:"9:32"},
    {d:28,dt:"Mar 17",day:"Tue",fajr:"5:46",sun:"7:43",zuhr:"1:47",asr:"5:44",mag:"7:45",isha:"9:34"},
    {d:29,dt:"Mar 18",day:"Wed",fajr:"5:43",sun:"7:40",zuhr:"1:46",asr:"5:44",mag:"7:47",isha:"9:36"},
    {d:30,dt:"Mar 19",day:"Thu",fajr:"5:40",sun:"7:38",zuhr:"1:46",asr:"5:45",mag:"7:48",isha:"9:38"},
  ];
  const ramStart=new Date(2026,1,18);// Feb 18, 2026 = Ramadan Day 1
  const TODAY=Math.max(1,Math.min(30,Math.floor((new Date()-ramStart)/(1000*60*60*24))+1));
  const td=R[Math.min(TODAY-1,R.length-1)];
  const cats=[
    {id:"tea",t:"Tea\nSessions",c:"#E13300",ic:"☕",sub:"Gen Z convos over chai",eps:8,act:"series"},
    {id:"ramadan",t:"Our\nRamadan",c:"#1A3352",ic:"☽",sub:"Day "+TODAY+" · Suhoor "+td.fajr,eps:30},
    {id:"steps",t:"First\nSteps",c:"#0B4D3A",ic:"▶",sub:"Shah's video guides",eps:8},
    {id:"stories",t:"Storytime",c:"#4A2068",ic:"📖",sub:"Prophets' stories, Shah's voice",eps:7},
    {id:"food",t:"Soul\nFood",c:"#8C1D3F",ic:"🍳",sub:"Recipes from both worlds",eps:10},
    {id:"ask",t:"Ask\nAnything",c:"#5C1A6E",ic:"💬",sub:"Dane asks, Shah answers",eps:0},
    {id:"words",t:"Our\nWords",c:"#1A4A5C",ic:"✎",sub:"A love archive",eps:0},
    {id:"growth",t:"Looking\nForward",c:"#2A4A8C",ic:"★",sub:"Things we can't wait for",eps:0},
  ];
  const back=<div style={{padding:"max(12px,env(safe-area-inset-top)) 16px 6px"}}><button onClick={()=>setSel(null)} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44,display:"flex",alignItems:"center",gap:6}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg><span style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:500}}>Back</span></button></div>;

  // ── OUR RAMADAN — Live prayer tracker ──
  if(sel==="ramadan"){
    const prayers=[{n:"Fajr",t:td.fajr,note:"Suhoor ends"},{n:"Zuhr",t:td.zuhr,note:""},{n:"Asr",t:td.asr,note:""},{n:"Maghrib",t:td.mag,note:"Iftar"},{n:"Isha",t:td.isha,note:"Taraweeh"}];
    // Simulate "next prayer" based on current time
    const nextPrayer=prayers[4]; // Maghrib for demo (iftar)
    const fastHrs=Math.round((parseFloat(td.mag.replace(":","."))-parseFloat(td.fajr.replace(":","."))))||12;
    return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#0A1225",WebkitOverflowScrolling:"touch"}}>
      {back}
      {/* Hero — Crescent and day counter */}
      <div style={{padding:"0 24px 24px",textAlign:"center"}}>
        <div style={{position:"relative",width:120,height:120,margin:"0 auto 16px"}}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#D4A84B" strokeWidth="4" strokeDasharray={2*Math.PI*52} strokeDashoffset={2*Math.PI*52*(1-TODAY/30)} strokeLinecap="round" transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 1s"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#D4A84B",fontSize:36,fontWeight:200,lineHeight:1}}>{TODAY}</span>
            <span style={{color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:500,letterSpacing:1}}>OF 30</span>
          </div>
        </div>
        <h1 style={{color:"#fff",fontSize:24,fontWeight:300,margin:"0 0 2px",letterSpacing:1}}>Ramadan Mubarak</h1>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"0 0 20px",fontWeight:400}}>{td.day}, {td.dt} · Ramadan {TODAY}, 1447</p>
        {/* Next prayer card */}
        <div style={{background:"linear-gradient(135deg,#D4A84B22,#D4A84B08)",border:"1px solid #D4A84B30",borderRadius:16,padding:"18px 20px",textAlign:"left"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{color:"#D4A84B",fontSize:10,fontWeight:600,letterSpacing:1.5,margin:"0 0 4px"}}>NEXT — IFTAR</p>
              <p style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0",letterSpacing:1}}>{nextPrayer.t} <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>PM</span></p>
            </div>
          </div>
          <div style={{marginTop:10,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
            <div style={{width:"65%",height:"100%",background:"linear-gradient(90deg,#D4A84B,#E8C44B)",borderRadius:2}}/>
          </div>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:11,margin:"6px 0 0"}}>Fasting {fastHrs}h today · You got this</p>
        </div>
      </div>

      {/* Today's prayer times */}
      <div style={{padding:"0 24px",marginBottom:24}}>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:600,letterSpacing:1.5,margin:"0 0 12px"}}>TODAY'S TIMES</p>
        <div style={{display:"flex",gap:0,background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.05)",overflow:"hidden"}}>
          {prayers.map((p,i)=>{const isNext=p.n==="Maghrib";return(<div key={i} style={{flex:1,padding:"14px 6px",textAlign:"center",background:isNext?"rgba(212,168,75,0.08)":"transparent",borderRight:i<prayers.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
            <p style={{color:isNext?"#D4A84B":"rgba(255,255,255,0.35)",fontSize:10,fontWeight:600,margin:"0 0 4px",letterSpacing:0.5}}>{p.n}</p>
            <p style={{color:isNext?"#D4A84B":"#fff",fontSize:15,fontWeight:500,margin:"0 0 2px"}}>{p.t}</p>
            {p.note&&<p style={{color:isNext?"#D4A84B60":"rgba(255,255,255,0.15)",fontSize:9,margin:0}}>{p.note}</p>}
          </div>);})}
        </div>
      </div>

      {/* 30-day grid */}
      <div style={{padding:"0 24px",marginBottom:20}}>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:600,letterSpacing:1.5,margin:"0 0 10px"}}>30 DAYS</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:4}}>
          {R.map((r,i)=>{const done=r.d<TODAY;const cur=r.d===TODAY;return(<div key={i} style={{aspectRatio:"1",borderRadius:6,background:cur?"#D4A84B":done?"#4CAF5025":"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:cur?"#0A1225":done?"#4CAF50":"rgba(255,255,255,0.2)",fontSize:10,fontWeight:cur?700:500}}>{r.d}</span></div>);})}
        </div>
      </div>

      {/* Week preview */}
      <div style={{padding:"0 24px"}}>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,fontWeight:600,letterSpacing:1.5,margin:"0 0 10px"}}>THIS WEEK</p>
        {R.slice(Math.max(0,TODAY-1),TODAY+4).map((r,i)=>{const isCur=r.d===TODAY;return(<div key={i} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",opacity:r.d<TODAY?0.4:1}}>
          <div style={{width:28,textAlign:"center",marginRight:12}}><span style={{color:isCur?"#D4A84B":"rgba(255,255,255,0.5)",fontSize:13,fontWeight:isCur?700:400}}>{r.d}</span></div>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:11,width:32}}>{r.day}</span>
          <div style={{flex:1,display:"flex",justifyContent:"space-between",fontSize:12}}>
            <span style={{color:"#6BA8CC"}}>{r.fajr}</span>
            <span style={{color:"rgba(255,255,255,0.25)"}}>{r.zuhr}</span>
            <span style={{color:"rgba(255,255,255,0.25)"}}>{r.asr}</span>
            <span style={{color:"#D4A84B"}}>{r.mag}</span>
            <span style={{color:"rgba(255,255,255,0.25)"}}>{r.isha}</span>
          </div>
        </div>);})}
        <p style={{color:"rgba(255,255,255,0.15)",fontSize:10,marginTop:8,textAlign:"center"}}>Jamia Riyadhul Jannah · Edmonton, AB</p>
      </div>
    </div>);}

  // ── FIRST STEPS — Shah's video guides ──
  if(sel==="steps"){return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#071A14",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 20px"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5}}>First Steps</h1>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,margin:"0 0 4px"}}>Videos from Shah</p>
      <p style={{color:"rgba(255,255,255,0.15)",fontSize:12,margin:"0 0 20px",fontStyle:"italic"}}>I made these just for you. No judgment, no rush.</p>
    </div>
    <EditList items={bVids} setItems={setBVids} fields={[{k:"t",ph:"Video title"},{k:"s",ph:"Description"}]} emptyMsg="No videos yet — Shah will upload them" color="#0B6B48" mediaType="video"/>
  </div>);}

  // ── STORYTIME ──
  if(sel==="stories"){return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#0E0A18",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 20px"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5}}>Storytime</h1>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,margin:"0 0 4px"}}>Narrated by Shah</p>
      <p style={{color:"rgba(255,255,255,0.15)",fontSize:12,margin:"0 0 20px",fontStyle:"italic"}}>The way I heard them growing up, now for you</p>
    </div>
    <EditList items={bStories} setItems={setBStories} fields={[{k:"t",ph:"Story title"},{k:"s",ph:"Description"}]} emptyMsg="No stories yet — Shah will record them" color="#4A2068" mediaType="audio"/>
  </div>);}

  // ── SOUL FOOD ──
  if(sel==="food"){return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#140A10",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 20px"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5}}>Soul Food</h1>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,margin:"0 0 20px"}}>Recipes from both worlds</p>
    </div>
    <EditList items={bRecipes} setItems={setBRecipes} fields={[{k:"t",ph:"Recipe name"},{k:"s",ph:"Short description"},{k:"origin",ph:"Origin (e.g. Pakistani, Filipino)"}]} emptyMsg="No recipes yet — add your favourites" color="#8C1D3F"/>
  </div>);}

  // ── ASK ANYTHING ──
  if(sel==="ask"){return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#100818",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 20px"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5}}>Ask Anything</h1>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,margin:"0 0 20px"}}>No question is too small</p>
    </div>
    <div style={{padding:"0 24px"}}>
      <div style={{marginBottom:20}}>
        <textarea value={askQ} onChange={e=>setAskQ(e.target.value)} placeholder="What do you want to know?" style={{width:"100%",minHeight:80,padding:14,borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",color:"#fff",fontSize:14,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <button onClick={()=>{if(askQ.trim()){setAsked([{q:askQ.trim(),from:user==='shah'?'Shah':'Dane',dt:new Date().toLocaleDateString()},...asked]);setAskQ("");}}} style={{width:"100%",marginTop:8,padding:"12px",borderRadius:14,border:"none",background:askQ.trim()?"#8D67AB":"rgba(255,255,255,0.04)",color:askQ.trim()?"#fff":"rgba(255,255,255,0.2)",fontSize:14,fontWeight:600,cursor:askQ.trim()?"pointer":"default"}}>Send</button>
      </div>
      {asked.map((a,i)=>(<div key={i} style={{padding:"14px 0",borderBottom:i<asked.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:a.from==="Shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:8,fontWeight:700}}>{a.from[0]}</span></div>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{a.from}</span>
          {a.dt&&<span style={{color:"rgba(255,255,255,0.15)",fontSize:11}}>{a.dt}</span>}
        </div>
        <p style={{color:"rgba(255,255,255,0.7)",fontSize:14,margin:"0 0 6px"}}>{a.q}</p>
        {a.a&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px",marginTop:6}}>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:13,margin:0}}>{a.a}</p>
        </div>}
        {!a.a&&isShah&&<button onClick={()=>{const ans=prompt("Your answer:");if(ans){const n=[...asked];n[i]={...n[i],a:ans};setAsked(n);}}} style={{padding:"4px 12px",borderRadius:12,border:"1px solid rgba(141,103,171,0.3)",background:"transparent",color:"#8D67AB",fontSize:11,cursor:"pointer",marginTop:4}}>Answer</button>}
      </div>))}
    </div>
  </div>);}

  // ── OUR WORDS ──
  if(sel==="words"){return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#0A1A24",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 20px"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5,fontStyle:"italic"}}>Our Words</h1>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:13,margin:"0 0 20px"}}>Things we never want to forget</p>
    </div>
    <div style={{padding:"0 24px"}}>
      {bWords.map((e,i)=>(<div key={i} style={{marginBottom:20}}>
        <p style={{color:"rgba(255,255,255,0.85)",fontSize:17,fontWeight:300,margin:"0 0 10px",lineHeight:1.65,fontStyle:"italic",letterSpacing:0.3}}>{e.t}</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:e.from==="Shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:8,fontWeight:700}}>{(e.from||"S")[0]}</span></div>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>{e.from||"Shah"}</span>
        </div>
        {isShah&&<button onClick={()=>setBWords(bWords.filter((_,j)=>j!==i))} style={{padding:"4px 12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.15)",fontSize:11,cursor:"pointer",marginTop:6}}>Remove</button>}
      </div>))}
      <button onClick={()=>{const txt=prompt("Something beautiful:");if(txt){setBWords([...bWords,{t:txt,from:user==='shah'?'Shah':'Dane'}]);}}} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.25)",fontSize:13,cursor:"pointer"}}>+ add something beautiful</button>
    </div>
  </div>);}

  if(sel==="growth"){
  const toggle=(i)=>{const n=[...ms];n[i]={...n[i],done:!n[i].done};setMs(n);};
  const addMilestone=()=>{if(newM.trim()){setMs([...ms,{t:newM.trim(),d:newD.trim()||"TBD",done:false}]);setNewM("");setNewD("");setAddingM(false);}};
  const doneCount=ms.filter(m=>m.done).length;
  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"#0A1224",WebkitOverflowScrolling:"touch"}}>
    {back}
    <div style={{padding:"0 24px 24px",textAlign:"center"}}>
      <h1 style={{color:"#fff",fontSize:28,fontWeight:300,margin:"0 0 4px",letterSpacing:1}}>Looking Forward</h1>
      <p style={{color:"rgba(255,255,255,0.25)",fontSize:12,margin:"0 0 16px"}}>Things we can't wait for</p>
      <div style={{display:"inline-block",background:"rgba(212,168,75,0.08)",border:"1px solid rgba(212,168,75,0.15)",borderRadius:20,padding:"6px 18px"}}>
        <span style={{color:"#D4A84B",fontSize:13,fontWeight:500}}>{doneCount} of {ms.length} done</span>
      </div>
    </div>
    <div style={{padding:"0 24px 0 44px"}}>{ms.map((m,i)=>(<div key={i} onClick={()=>toggle(i)} style={{display:"flex",gap:16,paddingBottom:i<ms.length-1?28:0,position:"relative",minHeight:20,cursor:"pointer"}}>
      {i<ms.length-1&&<div style={{position:"absolute",left:6,top:14,bottom:-14,width:1,background:m.done?"rgba(74,175,80,0.15)":"rgba(255,255,255,0.04)"}}/>}
      <div style={{width:14,height:14,borderRadius:"50%",background:m.done?"#4CAF50":"transparent",border:m.done?"none":"1.5px solid rgba(255,255,255,0.15)",flexShrink:0,marginTop:2,transition:"all 0.2s"}}/>
      <div>
        <p style={{color:m.done?"#fff":"rgba(255,255,255,0.3)",fontSize:14,fontWeight:m.done?500:400,margin:"0 0 1px",transition:"color 0.2s"}}>{m.t}</p>
        <p style={{color:m.done?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.12)",fontSize:11,margin:0}}>{m.d}</p>
      </div>
    </div>))}</div>
    <div style={{padding:"20px 24px"}}>
      {addingM?<div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:16,border:"1px solid rgba(255,255,255,0.06)"}}>
        <input value={newM} onChange={e=>setNewM(e.target.value)} placeholder="Milestone name" style={{width:"100%",padding:"10px 0",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:8}}/>
        <input value={newD} onChange={e=>setNewD(e.target.value)} placeholder="When? (e.g. Summer 2026)" style={{width:"100%",padding:"10px 0",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={addMilestone} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:newM.trim()?"#4CAF50":"rgba(255,255,255,0.06)",color:newM.trim()?"#fff":"rgba(255,255,255,0.2)",fontSize:13,fontWeight:600,cursor:newM.trim()?"pointer":"default"}}>Add</button>
          <button onClick={()=>setAddingM(false)} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
      :<button onClick={()=>setAddingM(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.25)",fontSize:13,cursor:"pointer"}}>+ add a milestone</button>}
    </div>
  </div>);}

  // Fallback
  if(sel)return(<div className="dc-fade-in" style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:S.black}}><Sy mood="thinking" size={80} msg="Coming soon!"/></div>);

  // ── Browse grid ──
  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:S.black,WebkitOverflowScrolling:"touch"}}><div style={{padding:"max(12px, env(safe-area-inset-top)) 16px 0"}}><h1 style={{color:S.white,fontSize:22,fontWeight:300,margin:"0 0 4px",letterSpacing:0.5}}>Browse</h1><p style={{color:S.muted,fontSize:12,margin:"0 0 16px",fontWeight:400}}>Everything in one place</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{cats.map(c=>(<div key={c.id} onClick={c.act?()=>go(c.act):()=>setSel(c.id)} style={{height:100,borderRadius:10,padding:"14px",background:`linear-gradient(155deg,${c.c},${c.c}99)`,position:"relative",overflow:"hidden",cursor:"pointer"}}>
    <div style={{position:"absolute",right:-6,bottom:-6,width:48,height:48,borderRadius:24,background:"rgba(255,255,255,0.05)"}}/>
    <p style={{color:"#fff",fontSize:15,fontWeight:600,margin:0,lineHeight:1.2,whiteSpace:"pre-line",position:"relative",zIndex:1}}>{c.t}</p>
    <p style={{color:"rgba(255,255,255,0.4)",fontSize:10,margin:"4px 0 0",position:"relative",zIndex:1}}>{c.sub}</p>
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

  const answer=(idx)=>{if(sel!==null)return;setSel(idx);const c=idx===lesson.quiz[qIdx].ans;setOk(c);if(!c)setHearts(h=>Math.max(0,h-1));else setScore(s=>s+1);setTimeout(()=>{if(qIdx<lesson.quiz.length-1){setQIdx(qIdx+1);setSel(null);setOk(null);}else{setDone(true);setXp(x=>x+(lesson.xp||15));if(!completed.includes(lesson.id))setCompleted([...completed,lesson.id]);}},900);};
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
      <div style={{flex:1,padding:"16px 24px",display:"flex",flexDirection:"column",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
        {isFirst&&<div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Sy mood="happy" size={60} msg="Let's learn!"/></div>}
        <div style={{background:`linear-gradient(135deg,${lc}10,${lc}05)`,borderRadius:16,padding:"20px",border:`1px solid ${lc}15`,flex:isFirst?undefined:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:40,height:40,borderRadius:10,background:lc+"18",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:lc,fontSize:18,fontWeight:800}}>{step+1}</span></div>
            <h2 style={{color:W.forest,fontSize:20,fontWeight:700,margin:0,flex:1,lineHeight:1.2}}>{ct.title}</h2>
          </div>
          <p style={{color:W.text,fontSize:15.5,lineHeight:1.75,margin:0}}>{ct.text}</p>
        </div>
      </div>
      <div style={{padding:"12px 24px 32px"}}><button onClick={()=>setStep(step+1)} style={{width:"100%",padding:"16px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${W.forest},${lc})`,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${lc}30`}}>{step===lesson.content.length-1?"Start Quiz \u2192":"Continue"}</button></div>
    </div>);}
    const q=lesson.quiz[qIdx];return(<div className="dc-fade-in" style={{height:"100%",display:"flex",flexDirection:"column",background:W.bg,padding:"12px 20px"}}>
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
    {!isW&&!isAlpha&&!isNums&&l.lessons.map((ls,i)=>{const unlocked=isUnlocked(ls);const comp=completed.includes(ls.id);return(<button key={ls.id} onClick={unlocked&&!comp?()=>{setLesson(ls);setStep(0);setQIdx(0);setSel(null);setOk(null);setScore(0);setDone(false);setHearts(5);}:comp?()=>{}:undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px",background:W.card,borderRadius:14,marginBottom:8,border:"1px solid "+(comp?W.success+"40":W.border),cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.35,textAlign:"left",boxShadow:unlocked?"0 1px 4px rgba(0,0,0,0.04)":"none",position:"relative"}}><div style={{width:44,height:44,borderRadius:12,background:comp?W.success+"20":!unlocked?W.cardAlt:l.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{comp?<Ic d={checkD} c={W.success} sz={20}/>:!unlocked?<Ic d={lockD} c={W.textMuted} sz={18}/>:<span style={{color:l.color,fontSize:16,fontWeight:800}}>{i+1}</span>}</div><div style={{flex:1}}><p style={{color:W.forest,fontSize:15,fontWeight:600,margin:0}}>{ls.title}</p><p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{comp?"Completed ✓":!unlocked?"Complete "+l.lessons[i-1]?.title+" first":ls.desc}</p></div>{comp&&<span style={{color:W.textMuted,fontSize:11}}>+{ls.xp} XP</span>}</button>);})}
    {isW&&(()=>{const cats=WORD_CATS[lang]||["All"];const grouped={};l.words.forEach(w=>{const c=wordCat(lang,w);if(!grouped[c])grouped[c]=[];grouped[c].push(w);});
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
            <button title="Shah records" style={{width:30,height:30,borderRadius:"50%",background:WL.forest+"12",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:"none"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={WL.forest}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
            <button title="Dane records" style={{width:30,height:30,borderRadius:"50%",background:"#E8115B10",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:"none"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#E8115B"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
            <button title="Play" style={{width:30,height:30,borderRadius:"50%",background:W.cardAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,border:"none"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={W.textMuted}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            </button>
          </div>
        </div>))}
      </>);})()}</div></div>);}

  // Learn home
  const syMsgs=["Meow! Ready to learn?","Sy believes in you!","Let's get those XP!","Purrfect day to study!","You're doing amazing!"];
  const syMsg=syMsgs[Math.floor(Date.now()/86400000)%syMsgs.length];
  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:W.bg,WebkitOverflowScrolling:"touch"}}>
    <div style={{background:dark?WD.cardAlt:`linear-gradient(145deg,${WL.forest},#0A5C40)`,padding:"12px 16px 24px",borderRadius:"0 0 28px 28px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:22,fontWeight:800,margin:0,letterSpacing:-0.5}}>Learn</h1>
        <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 12px"}}>
          <span style={{fontSize:14}}>🔥</span>
          <span style={{color:"#FF9500",fontSize:15,fontWeight:800}}>{streak}</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <Sy mood="happy" size={64}/>
        <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 14px"}}>
          <p style={{color:"rgba(255,255,255,0.95)",fontSize:14,fontWeight:600,margin:0,lineHeight:1.4}}>{syMsg}</p>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}>{[{v:xp,lb:"Total XP",c:"#4CAF50",ic:"⭐"},{v:hearts,lb:"Hearts",c:"#E74C3C",ic:"❤️"},{v:Object.keys(LANGS).reduce((a,k)=>a+LANGS[k].lessons.filter(l2=>completed.includes(l2.id)).length,0),lb:"Lessons",c:"#FF9500",ic:"📚"}].map((s,i)=>(<div key={i} style={{flex:1,background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
        <p style={{fontSize:12,margin:"0 0 2px"}}>{s.ic}</p>
        <p style={{color:"#fff",fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:10,margin:"2px 0 0"}}>{s.lb}</p>
      </div>))}</div>
    </div>
    <div style={{padding:"16px"}}>
    {/* Motivation */}
    <div style={{background:"linear-gradient(135deg,"+S.green+"15,"+S.gold+"10)",borderRadius:14,padding:"16px",marginBottom:16,border:"1px solid "+S.green+"15"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Sy mood={xp>50?"proud":"happy"} size={36}/><div><p style={{color:W.forest,fontSize:14,fontWeight:600,margin:"0 0 2px"}}>{xp>100?"You're on fire!":xp>50?"Great progress!":"Let's get started!"}</p><p style={{color:W.textMuted,fontSize:12,margin:0}}>{completed.length} of 45 lessons completed</p></div></div></div>
    {/* Progress summary */}
    <div style={{background:W.card,borderRadius:14,padding:"14px",marginBottom:16,border:"1px solid "+W.border}}><p style={{color:W.forest,fontSize:15,fontWeight:700,margin:"0 0 10px"}}>Your Progress</p><div style={{display:"flex",gap:16}}>{[{v:xp,l:"XP",c:S.green},{v:completed.length,l:"Lessons Done",c:S.gold},{v:hearts,l:"Hearts",c:S.rose}].map((s,i)=>(<div key={i} style={{flex:1,textAlign:"center"}}><p style={{color:s.c,fontSize:22,fontWeight:700,margin:"0 0 2px"}}>{s.v}</p><p style={{color:W.textMuted,fontSize:11,margin:0}}>{s.l}</p></div>))}</div></div>
    {/* Language cards with progress */}
    {Object.entries(LANGS).map(([key,l])=>{const prog=langProgress(key);const r=20,circ=2*Math.PI*r,offset=circ-(prog/100)*circ;return(<button key={key} onClick={()=>{setLang(key);setView("browse");}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px",background:W.card,borderRadius:16,marginBottom:10,border:"1px solid "+W.border,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"transform 0.15s"}}><div style={{width:52,height:52,position:"relative",flexShrink:0}}><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r={r} fill="none" stroke={W.border} strokeWidth="3"/><circle cx="26" cy="26" r={r} fill="none" stroke={l.color} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 26 26)" style={{transition:"stroke-dashoffset 0.5s"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:l.color,fontSize:20,fontWeight:800}}>{l.char}</span></div></div><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><p style={{color:W.forest,fontSize:16,fontWeight:700,margin:0}}>{l.label}</p><span style={{color:l.color,fontSize:13,fontWeight:700}}>{prog}%</span></div><p style={{color:W.textMuted,fontSize:13,margin:"2px 0 0"}}>{l.sub} · {l.lessons.length} lessons</p></div><svg width="16" height="16" viewBox="0 0 24 24" fill={W.textMuted}><path d="M9 18l6-6-6-6"/></svg></button>);})}
  </div></div>);
}

// Logout button for Settings

// Logout button for Settings
function LogoutBtn(){
  const {logout}=useUser()||{};const W=useW();
  return(<button onClick={logout} style={{width:"100%",marginTop:24,padding:"15px",borderRadius:14,border:"1px solid #E74C3C30",background:"#E74C3C08",color:"#E74C3C",fontSize:15,fontWeight:600,cursor:"pointer"}}>Log Out</button>);
}

function Us({onDark,isDark}){
  const W=useW();const dark=useDark();const {user,logout}=useUser()||{user:'shah'};
  const [events,setEvents]=useState(()=>local.get('us_events',[]));
  useEffect(()=>{local.set('us_events',events);},[events]);
  const [addEvt,setAddEvt]=useState(false);const [ne,setNe]=useState({t:"",d:"",tm:""});
  const [tab,setTab]=useState("cal");const [calMonth,setCalMonth]=useState(new Date().getMonth());const [calYear,setCalYear]=useState(new Date().getFullYear());
  const [settings,setSettings]=useState({notif:true,alarms:true,sounds:false});
  const [notes,setNotes]=useState(()=>local.get('us_notes',[]));const [addNote,setAddNote]=useState(false);const [noteText,setNoteText]=useState("");
  useEffect(()=>{local.set('us_notes',notes);},[notes]);

  // Gym tracker
  const [gym,setGym]=useState(()=>local.get(user+'_gym',[])); // array of {date,exercises:[{name,sets:[{reps,weight}]}],cardio:{type,duration,distance}}
  useEffect(()=>{local.set(user+'_gym',gym);},[gym]);
  const [gymView,setGymView]=useState("log"); // log | add | history
  const [gymDate,setGymDate]=useState(new Date().toISOString().split('T')[0]);
  const [gymExercises,setGymExercises]=useState([]);
  const [gymCardio,setGymCardio]=useState({type:"",duration:"",distance:""});
  const [selExercise,setSelExercise]=useState("");const [quickMode,setQuickMode]=useState(true);const [quickReps,setQuickReps]=useState("8");const [quickSets,setQuickSets]=useState("3");
  const [manualSets,setManualSets]=useState([{reps:"",weight:""}]);
  const EXERCISES={
    "Push":[
      "Bench Press","Incline Bench Press","Dumbbell Press","Dumbbell Flyes","Overhead Press","Lateral Raises","Tricep Pushdown","Tricep Dips","Cable Crossover","Push Ups"
    ],
    "Pull":[
      "Deadlift","Barbell Row","Dumbbell Row","Lat Pulldown","Pull Ups","Chin Ups","Face Pulls","Bicep Curls","Hammer Curls","Cable Row"
    ],
    "Legs":[
      "Squat","Leg Press","Romanian Deadlift","Lunges","Leg Extension","Leg Curl","Calf Raises","Hip Thrust","Bulgarian Split Squat","Goblet Squat"
    ],
    "Core":[
      "Plank","Crunches","Leg Raises","Russian Twists","Ab Rollout","Cable Woodchops","Dead Bug","Mountain Climbers"
    ],
    "Cardio":[
      "Treadmill","Stairmaster","Elliptical","Bike","Rowing","Jump Rope","Walking","Running"
    ]
  };
  const todayStr=new Date().toISOString().split('T')[0];
  const todayWorkout=gym.find(g=>g.date===todayStr);
  const hasGymDay=(day)=>{if(!day)return false;const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");return gym.some(g=>g.date===ds);};

  const addExerciseToWorkout=()=>{
    if(!selExercise)return;
    let sets=[];
    if(quickMode){
      const r=parseInt(quickReps)||8;const s=parseInt(quickSets)||3;
      for(let i=0;i<s;i++)sets.push({reps:r,weight:""});
    }else{
      sets=manualSets.filter(s=>s.reps).map(s=>({reps:parseInt(s.reps)||0,weight:s.weight}));
    }
    if(sets.length===0)return;
    setGymExercises([...gymExercises,{name:selExercise,sets}]);
    setSelExercise("");setManualSets([{reps:"",weight:""}]);
  };

  const saveWorkout=()=>{
    if(gymExercises.length===0&&!gymCardio.type)return;
    const existing=gym.findIndex(g=>g.date===gymDate);
    const entry={date:gymDate,exercises:gymExercises,cardio:gymCardio.type?gymCardio:null,user};
    if(existing>=0){const n=[...gym];n[existing]=entry;setGym(n);}
    else setGym([...gym,entry]);
    setGymExercises([]);setGymCardio({type:"",duration:"",distance:""});setGymView("log");
  };

  const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dim=new Date(calYear,calMonth+1,0).getDate();const fd=new Date(calYear,calMonth,1).getDay();const calDays=[];for(let i=0;i<fd;i++)calDays.push(null);for(let i=1;i<=dim;i++)calDays.push(i);
  const today=new Date();const isToday=(day)=>day&&calMonth===today.getMonth()&&calYear===today.getFullYear()&&day===today.getDate();
  const hasEvent=(day)=>{if(!day)return null;const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");return events.find(e=>e.d===ds);};
  const upcomingEvents=events.filter(e=>e.d>=today.toISOString().split('T')[0]).sort((a,b)=>a.d.localeCompare(b.d));

  // Add event form
  if(addEvt)return(<div className="dc-slide-up" style={{height:"100%",background:W.bg,padding:"14px 16px"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><button onClick={()=>setAddEvt(false)} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={W.forest} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1 style={{color:W.forest,fontSize:21,fontWeight:700,margin:0}}>New event</h1></div>{[{l:"Title",k:"t",ph:"Iftar at mom's...",ty:"text"},{l:"Date",k:"d",ph:"",ty:"date"},{l:"Time",k:"tm",ph:"",ty:"time"}].map(f=>(<div key={f.k} style={{marginBottom:16}}><p style={{color:W.textMuted,fontSize:12,fontWeight:600,margin:"0 0 6px"}}>{f.l}</p><input type={f.ty} value={ne[f.k]} onChange={e=>setNe({...ne,[f.k]:e.target.value})} placeholder={f.ph} style={{width:"100%",padding:"14px",borderRadius:12,background:W.card,border:"1px solid "+W.border,color:W.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>))}<div style={{display:"flex",gap:8,marginBottom:16}}>{["#D4A84B","#E8115B","#1DB954","#8D67AB","#4B9CD3"].map(c=>(<button key={c} onClick={()=>setNe({...ne,c})} style={{width:32,height:32,borderRadius:"50%",background:c,border:ne.c===c?"3px solid "+W.text:"3px solid transparent",cursor:"pointer"}}/>))}</div><button onClick={()=>{if(ne.t){setEvents([...events,{id:Date.now(),t:ne.t,d:ne.d||"",tm:ne.tm||"",c:ne.c||"#D4A84B"}]);setNe({t:"",d:"",tm:""});setAddEvt(false);}}} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:ne.t?W.forest:W.border,color:ne.t?(dark?"#000":WL.cream):W.textMuted,fontSize:16,fontWeight:700,cursor:ne.t?"pointer":"not-allowed"}}>Save</button></div>);

  // Settings
  if(tab==="settings")return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:W.bg}}><div style={{background:dark?WD.cardAlt:WL.forest,padding:"12px 16px 20px",borderRadius:"0 0 24px 24px"}}><div style={{display:"flex",alignItems:"center",gap:12}}><button onClick={()=>setTab("cal")} style={{background:"none",border:"none",cursor:"pointer",minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dark?"#E8E8E8":WL.cream} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:21,fontWeight:700,margin:0}}>Settings</h1></div></div><div style={{padding:"16px"}}>{[{k:"notif",l:"Push Notifications",desc:"Get notified for events"},{k:"alarms",l:"Event Alarms",desc:"Reminders before events"},{k:"sounds",l:"Sounds",desc:"Notification sounds"},{k:"dark",l:"Dark Mode",desc:"Switch theme"}].map(s=>{const on=s.k==="dark"?isDark:settings[s.k];return(<div key={s.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid "+W.border}}><div style={{flex:1}}><p style={{color:W.forest,fontSize:15,fontWeight:600,margin:0}}>{s.l}</p><p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{s.desc}</p></div><button onClick={()=>s.k==="dark"?onDark(!isDark):setSettings({...settings,[s.k]:!on})} style={{width:48,height:28,borderRadius:14,background:on?W.forest:W.border,border:"none",padding:2,cursor:"pointer",transition:"background 0.2s",display:"flex",alignItems:on?"flex-end":"flex-start",justifyContent:on?"flex-end":"flex-start"}}><div style={{width:24,height:24,borderRadius:12,background:S.white,boxShadow:"0 1px 3px rgba(0,0,0,0.15)",transition:"all 0.2s"}}/></button></div>);})}<LogoutBtn/></div></div>);

  return(<div className="dc-fade-in" style={{height:"100%",display:"flex",flexDirection:"column",background:W.bg}}>
    {/* Header */}
    <div style={{background:dark?WD.cardAlt:WL.forest,padding:"max(12px,env(safe-area-inset-top)) 16px 16px",borderRadius:"0 0 24px 24px",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h1 style={{color:dark?"#E8E8E8":WL.cream,fontSize:22,fontWeight:700,margin:0}}>Us</h1>
        <button onClick={()=>setTab("settings")} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.12)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><svg width="16" height="16" viewBox="0 0 24 24" fill={dark?"#E8E8E8":WL.cream}><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg></button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginTop:14}}>{[{k:"cal",l:"Calendar"},{k:"upcoming",l:"Upcoming"},{k:"gym",l:"Gym"},{k:"notes",l:"Notes"}].map(t=>(<button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"8px 18px",borderRadius:20,border:"none",background:tab===t.k?"rgba(255,255,255,0.2)":"transparent",color:dark?"#E8E8E8":WL.cream,fontSize:13,fontWeight:tab===t.k?700:500,cursor:"pointer"}}>{t.l}</button>))}</div>
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
          <p style={{color:W.forest,fontSize:14,fontWeight:700,margin:"0 0 8px"}}>Coming up</p>
          {upcomingEvents.slice(0,5).map(ev=>(<div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:"1px solid "+W.border}}>
            <div style={{width:4,height:36,borderRadius:2,background:ev.c||W.forest,flexShrink:0}}/>
            <div style={{flex:1}}><p style={{color:W.forest,fontSize:14,fontWeight:600,margin:0}}>{ev.t}</p><p style={{color:W.textMuted,fontSize:12,margin:"2px 0 0"}}>{ev.d}{ev.tm?" · "+ev.tm:""}</p></div>
            <button onClick={()=>setEvents(events.filter(e=>e.id!==ev.id))} style={{background:"none",border:"none",cursor:"pointer",padding:4,minWidth:36,minHeight:36}}><svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
          </div>))}
        </div>}
      </div>}

      {/* UPCOMING TAB */}
      {tab==="upcoming"&&<div style={{padding:"16px"}}>
        {upcomingEvents.length===0?<div style={{textAlign:"center",padding:"40px 0"}}><p style={{color:W.textMuted,fontSize:14}}>No upcoming events</p><button onClick={()=>{setTab("cal");setTimeout(()=>setAddEvt(true),100);}} style={{padding:"10px 24px",borderRadius:20,border:"1px solid "+W.border,background:"transparent",color:W.forest,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:8}}>Add one</button></div>
        :upcomingEvents.map((ev,i)=>{
          const d=new Date(ev.d+"T12:00:00");const diff=Math.ceil((d-today)/(1000*60*60*24));
          return(<div key={ev.id} style={{background:W.card,borderRadius:14,padding:16,marginBottom:10,borderLeft:"4px solid "+(ev.c||W.forest)}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><p style={{color:W.forest,fontSize:16,fontWeight:600,margin:"0 0 2px"}}>{ev.t}</p><p style={{color:W.textMuted,fontSize:12,margin:0}}>{ev.d}{ev.tm?" at "+ev.tm:""}</p></div>
              <div style={{background:(ev.c||W.forest)+"15",borderRadius:10,padding:"6px 12px"}}><p style={{color:ev.c||W.forest,fontSize:13,fontWeight:700,margin:0}}>{diff===0?"Today":diff===1?"Tomorrow":diff+" days"}</p></div>
            </div>
          </div>);
        })}
      </div>}

      {/* NOTES TAB */}
      {tab==="notes"&&<div style={{padding:"16px"}}>
        {addNote?<div style={{background:W.card,borderRadius:14,padding:16,border:"1px solid "+W.border,marginBottom:12}}>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Write something..." autoFocus style={{width:"100%",minHeight:100,padding:0,background:"transparent",border:"none",color:W.text,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={()=>{if(noteText.trim()){setNotes([{text:noteText.trim(),from:user==='shah'?'Shah':'Dane',dt:new Date().toLocaleDateString(),id:Date.now()},...notes]);setNoteText("");setAddNote(false);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:13,fontWeight:600,cursor:"pointer"}}>Save</button>
            <button onClick={()=>{setAddNote(false);setNoteText("");}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
        :<button onClick={()=>setAddNote(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid "+W.border,background:W.card,color:W.textMuted,fontSize:14,cursor:"pointer",marginBottom:12,textAlign:"left"}}>+ Write a note...</button>}
        {notes.length===0&&!addNote&&<div style={{textAlign:"center",padding:"30px 0"}}><p style={{color:W.textMuted,fontSize:13}}>No notes yet — leave each other little messages</p></div>}
        {notes.map((n,i)=>(<div key={n.id} style={{background:W.card,borderRadius:14,padding:"14px 16px",marginBottom:8,border:"1px solid "+W.border}}>
          <p style={{color:W.text,fontSize:14,margin:"0 0 8px",lineHeight:1.5}}>{n.text}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:n.from==="Shah"?"#1DB954":"#E8115B",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:7,fontWeight:700}}>{n.from[0]}</span></div>
              <span style={{color:W.textMuted,fontSize:11}}>{n.from} · {n.dt}</span>
            </div>
            <button onClick={()=>setNotes(notes.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
          </div>
        </div>))}
      </div>}

      {/* GYM TAB */}
      {tab==="gym"&&<div style={{padding:"16px"}}>
        {/* Quick stats */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {[{v:gym.length,l:"Workouts",c:S.green},{v:gym.filter(g=>{const d=new Date(g.date);const n=new Date();return d>=new Date(n.getFullYear(),n.getMonth(),n.getDate()-7);}).length,l:"This week",c:S.gold},{v:todayWorkout?"✓":"—",l:"Today",c:todayWorkout?S.green:S.muted}].map((s,i)=>(<div key={i} style={{flex:1,background:W.card,borderRadius:12,padding:"12px 10px",textAlign:"center",border:"1px solid "+W.border}}>
            <p style={{color:s.c,fontSize:20,fontWeight:700,margin:"0 0 2px"}}>{s.v}</p>
            <p style={{color:W.textMuted,fontSize:10,margin:0}}>{s.l}</p>
          </div>))}
        </div>

        {/* Gym month view — dots for workout days */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:16}}>
          {Array.from({length:new Date(calYear,calMonth+1,0).getDate()}).map((_,i)=>{
            const day=i+1;const ds=calYear+"-"+String(calMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
            const worked=gym.some(g=>g.date===ds);const isT=isToday(day);
            return(<div key={day} style={{textAlign:"center",padding:"4px 0"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:worked?S.green+"20":isT?W.forest+"15":"transparent",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
                <span style={{color:worked?S.green:isT?W.forest:W.textMuted,fontSize:11,fontWeight:worked||isT?700:400}}>{day}</span>
              </div>
              {worked&&<div style={{width:4,height:4,borderRadius:2,background:S.green,margin:"2px auto 0"}}/>}
            </div>);
          })}
        </div>

        {gymView==="log"&&<div>
          {/* Today's workout summary */}
          {todayWorkout&&<div style={{background:W.card,borderRadius:14,padding:14,marginBottom:12,border:"1px solid "+W.border}}>
            <p style={{color:W.forest,fontSize:14,fontWeight:700,margin:"0 0 8px"}}>Today's Workout</p>
            {todayWorkout.exercises.map((ex,i)=>(<div key={i} style={{marginBottom:6}}>
              <p style={{color:W.text,fontSize:13,fontWeight:600,margin:"0 0 2px"}}>{ex.name}</p>
              <p style={{color:W.textMuted,fontSize:11,margin:0}}>{ex.sets.map((s,j)=>(s.weight?s.reps+"×"+s.weight+"lb":s.reps+" reps")).join(" · ")}</p>
            </div>))}
            {todayWorkout.cardio&&<div style={{marginTop:6,padding:"8px 10px",background:S.rose+"10",borderRadius:8}}>
              <p style={{color:S.rose,fontSize:12,fontWeight:600,margin:0}}>{todayWorkout.cardio.type} — {todayWorkout.cardio.duration} min{todayWorkout.cardio.distance?" · "+todayWorkout.cardio.distance+" km":""}</p>
            </div>}
          </div>}
          <button onClick={()=>setGymView("add")} style={{width:"100%",padding:"14px",background:W.forest,border:"none",borderRadius:50,color:dark?"#000":WL.cream,fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44,marginBottom:12}}>+ Log Workout</button>

          {/* History */}
          {gym.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map((g,i)=>(<div key={i} style={{background:W.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:"1px solid "+W.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <p style={{color:W.forest,fontSize:13,fontWeight:700,margin:0}}>{new Date(g.date+"T12:00:00").toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</p>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{color:W.textMuted,fontSize:11}}>{g.exercises.length} exercises</span>
                <button onClick={()=>setGym(gym.filter((_,j)=>j!==gym.indexOf(g)))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="12" height="12" viewBox="0 0 24 24" fill={W.textMuted}><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              </div>
            </div>
            {g.exercises.map((ex,j)=>(<p key={j} style={{color:W.textMuted,fontSize:12,margin:"2px 0"}}>{ex.name} — {ex.sets.length} sets</p>))}
            {g.cardio&&<p style={{color:S.rose,fontSize:11,margin:"4px 0 0"}}>{g.cardio.type} {g.cardio.duration}min</p>}
          </div>))}
        </div>}

        {gymView==="add"&&<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h3 style={{color:W.forest,fontSize:17,fontWeight:700,margin:0}}>Log Workout</h3>
            <button onClick={()=>setGymView("log")} style={{padding:"6px 14px",borderRadius:12,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:12,cursor:"pointer"}}>Cancel</button>
          </div>

          <input type="date" value={gymDate} onChange={e=>setGymDate(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,background:W.card,border:"1px solid "+W.border,color:W.text,fontSize:14,marginBottom:14,boxSizing:"border-box",fontFamily:"inherit"}}/>

          {/* Added exercises */}
          {gymExercises.map((ex,i)=>(<div key={i} style={{background:W.card,borderRadius:10,padding:"10px 12px",marginBottom:6,border:"1px solid "+W.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{color:W.text,fontSize:13,fontWeight:600,margin:0}}>{ex.name}</p><p style={{color:W.textMuted,fontSize:11,margin:0}}>{ex.sets.map(s=>(s.weight?s.reps+"×"+s.weight:s.reps)).join(", ")}</p></div>
            <button onClick={()=>setGymExercises(gymExercises.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
          </div>))}

          {/* Exercise selector */}
          <div style={{background:W.card,borderRadius:14,padding:14,border:"1px solid "+W.border,marginBottom:12}}>
            <p style={{color:W.forest,fontSize:13,fontWeight:700,margin:"0 0 8px"}}>Add Exercise</p>
            {/* Category buttons */}
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
              {Object.keys(EXERCISES).map(cat=>(<button key={cat} onClick={()=>setSelExercise("")} style={{padding:"5px 12px",borderRadius:10,border:"1px solid "+W.border,background:"transparent",color:W.text,fontSize:11,fontWeight:600,cursor:"pointer"}}>{cat}</button>))}
            </div>
            {/* Exercise dropdown */}
            <select value={selExercise} onChange={e=>setSelExercise(e.target.value)} style={{width:"100%",padding:"10px",borderRadius:10,background:W.card,border:"1px solid "+W.border,color:W.text,fontSize:14,marginBottom:10,fontFamily:"inherit"}}>
              <option value="">Select exercise...</option>
              {Object.entries(EXERCISES).map(([cat,exs])=>(<optgroup key={cat} label={cat}>{exs.map(ex=>(<option key={ex} value={ex}>{ex}</option>))}</optgroup>))}
            </select>

            {selExercise&&<div>
              {/* Quick vs Manual toggle */}
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <button onClick={()=>setQuickMode(true)} style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:quickMode?W.forest:"transparent",color:quickMode?(dark?"#000":WL.cream):W.textMuted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{selExercise.includes("Treadmill")||selExercise.includes("Stairmaster")||selExercise.includes("Elliptical")||selExercise.includes("Bike")||selExercise.includes("Rowing")||selExercise.includes("Jump Rope")||selExercise.includes("Walking")||selExercise.includes("Running")?"Cardio":"Same reps"}</button>
                <button onClick={()=>setQuickMode(false)} style={{flex:1,padding:"8px",borderRadius:8,border:"none",background:!quickMode?W.forest:"transparent",color:!quickMode?(dark?"#000":WL.cream):W.textMuted,fontSize:12,fontWeight:600,cursor:"pointer"}}>Per set</button>
              </div>

              {EXERCISES["Cardio"].includes(selExercise)?
                /* Cardio entry */
                <div style={{display:"flex",gap:8}}>
                  <input value={gymCardio.duration} onChange={e=>setGymCardio({...gymCardio,type:selExercise,duration:e.target.value})} placeholder="Minutes" type="number" style={{flex:1,padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontFamily:"inherit"}}/>
                  <input value={gymCardio.distance} onChange={e=>setGymCardio({...gymCardio,distance:e.target.value})} placeholder="km (optional)" type="number" step="0.1" style={{flex:1,padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:14,fontFamily:"inherit"}}/>
                </div>
              :quickMode?
                /* Quick mode: same reps × sets */
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>REPS</p><input value={quickReps} onChange={e=>setQuickReps(e.target.value)} type="number" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:16,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                  <div style={{display:"flex",alignItems:"flex-end",paddingBottom:10,color:W.textMuted,fontSize:14,fontWeight:700}}>×</div>
                  <div style={{flex:1}}><p style={{color:W.textMuted,fontSize:10,fontWeight:600,margin:"0 0 4px"}}>SETS</p><input value={quickSets} onChange={e=>setQuickSets(e.target.value)} type="number" style={{width:"100%",padding:"10px",borderRadius:8,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:16,fontWeight:700,textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                </div>
              :
                /* Manual mode: per-set entry */
                <div>
                  {manualSets.map((s,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                    <span style={{color:W.textMuted,fontSize:11,width:20}}>S{i+1}</span>
                    <input value={s.reps} onChange={e=>{const n=[...manualSets];n[i]={...n[i],reps:e.target.value};setManualSets(n);}} placeholder="Reps" type="number" style={{flex:1,padding:"8px",borderRadius:6,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:13,fontFamily:"inherit"}}/>
                    <input value={s.weight} onChange={e=>{const n=[...manualSets];n[i]={...n[i],weight:e.target.value};setManualSets(n);}} placeholder="lbs" type="number" style={{flex:1,padding:"8px",borderRadius:6,background:W.bg,border:"1px solid "+W.border,color:W.text,fontSize:13,fontFamily:"inherit"}}/>
                    {manualSets.length>1&&<button onClick={()=>setManualSets(manualSets.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",padding:2}}><svg width="14" height="14" viewBox="0 0 24 24" fill={W.textMuted}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>}
                  </div>))}
                  <button onClick={()=>setManualSets([...manualSets,{reps:"",weight:""}])} style={{width:"100%",padding:"6px",borderRadius:6,border:"1px solid "+W.border,background:"transparent",color:W.textMuted,fontSize:11,cursor:"pointer"}}>+ Add set</button>
                </div>
              }
              <button onClick={()=>{if(EXERCISES["Cardio"].includes(selExercise)){if(gymCardio.duration)setGymView("log");}else addExerciseToWorkout();}} style={{width:"100%",marginTop:10,padding:"10px",borderRadius:10,border:"none",background:W.forest,color:dark?"#000":WL.cream,fontSize:13,fontWeight:600,cursor:"pointer"}}>Add {selExercise}</button>
            </div>}
          </div>

          {(gymExercises.length>0||gymCardio.type)&&<button onClick={saveWorkout} style={{width:"100%",padding:"14px",background:S.green,border:"none",borderRadius:50,color:"#000",fontSize:15,fontWeight:700,cursor:"pointer",minHeight:44}}>Save Workout</button>}
        </div>}
      </div>}
    </div>
  </div>);
}{const[p,setP]=useState(false);const[pr,setPr]=useState(0);const[t,setT]=useState(0);const r=useRef(null);useEffect(()=>{if(p){r.current=setInterval(()=>{setT(v=>{const n=v+1;setPr((n/804)*100);if(n>=804){clearInterval(r.current);setP(false);setTimeout(()=>go("hw"),400);}return n;});},40);}else if(r.current)clearInterval(r.current);return()=>{if(r.current)clearInterval(r.current);};},[p]);const f=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#1E3264 0%,#15244A 25%,#0D0D0D 55%)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"max(8px, env(safe-area-inset-top)) 20px 8px"}}><button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div style={{textAlign:"center"}}><p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1.5,margin:0}}>PLAYING FROM</p><p style={{color:S.white,fontSize:13,fontWeight:600,margin:"2px 0 0"}}>Tea Sessions</p></div><div style={{width:38}}/></div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}><div style={{width:"70%",maxWidth:320,aspectRatio:"1"}}><Cv size={999} r={8} v="ep1" sh/></div></div><div style={{padding:"0 24px 40px"}}><h2 style={{color:S.white,fontSize:21,fontWeight:700,margin:"0 0 3px"}}>So... What Is Ramadan?</h2><p style={{color:S.sub,fontSize:13,margin:"0 0 20px"}}>Episode 1</p><div style={{marginBottom:8}}><div style={{height:4,background:S.bar,borderRadius:2}}><div style={{width:Math.max(pr,0.5)+"%",height:"100%",background:S.white,borderRadius:2,position:"relative"}}><div style={{position:"absolute",right:-6,top:-4,width:12,height:12,borderRadius:"50%",background:S.white}}/></div></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:S.sub,fontSize:11}}>{f(t)}</span><span style={{color:S.sub,fontSize:11}}>13:24</span></div></div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:28}}><button onClick={()=>setT(v=>Math.max(0,v-15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg></button><button onClick={()=>setP(!p)} style={{width:64,height:64,borderRadius:"50%",border:"none",cursor:"pointer",background:S.white,display:"flex",alignItems:"center",justifyContent:"center"}}>{p?<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>:<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><path d="M8 5v14l11-7z"/></svg>}</button><button onClick={()=>setT(v=>Math.min(804,v+15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></button></div><button onClick={()=>go("hw")} style={{width:"100%",marginTop:14,padding:"10px",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:20,color:S.sub,fontSize:13,fontWeight:600,cursor:"pointer",minHeight:44}}>Skip to reflection</button></div></div>);}

function NP({go}){const[p,setP]=useState(false);const[pr,setPr]=useState(0);const[t,setT]=useState(0);const r=useRef(null);useEffect(()=>{if(p){r.current=setInterval(()=>{setT(v=>{const n=v+1;setPr((n/804)*100);if(n>=804){clearInterval(r.current);setP(false);setTimeout(()=>go("hw"),400);}return n;});},40);}else if(r.current)clearInterval(r.current);return()=>{if(r.current)clearInterval(r.current);};},[p]);const f=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#1E3264 0%,#15244A 25%,#0D0D0D 55%)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"max(8px, env(safe-area-inset-top)) 20px 8px"}}><button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div style={{textAlign:"center"}}><p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1.5,margin:0}}>PLAYING FROM</p><p style={{color:S.white,fontSize:13,fontWeight:600,margin:"2px 0 0"}}>Tea Sessions</p></div><div style={{width:38}}/></div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 32px"}}><div style={{width:"70%",maxWidth:320,aspectRatio:"1"}}><Cv size={999} r={8} v="ep1" sh/></div></div><div style={{padding:"0 24px 40px"}}><h2 style={{color:S.white,fontSize:21,fontWeight:700,margin:"0 0 3px"}}>So... What Is Ramadan?</h2><p style={{color:S.sub,fontSize:13,margin:"0 0 20px"}}>Episode 1</p><div style={{marginBottom:8}}><div style={{height:4,background:S.bar,borderRadius:2}}><div style={{width:Math.max(pr,0.5)+"%",height:"100%",background:S.white,borderRadius:2,position:"relative"}}><div style={{position:"absolute",right:-6,top:-4,width:12,height:12,borderRadius:"50%",background:S.white}}/></div></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:S.sub,fontSize:11}}>{f(t)}</span><span style={{color:S.sub,fontSize:11}}>13:24</span></div></div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:28}}><button onClick={()=>setT(v=>Math.max(0,v-15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg></button><button onClick={()=>setP(!p)} style={{width:64,height:64,borderRadius:"50%",border:"none",cursor:"pointer",background:S.white,display:"flex",alignItems:"center",justifyContent:"center"}}>{p?<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>:<svg width="26" height="26" viewBox="0 0 24 24" fill={S.black}><path d="M8 5v14l11-7z"/></svg>}</button><button onClick={()=>setT(v=>Math.min(804,v+15))} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="26" height="26" viewBox="0 0 24 24" fill={S.white}><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></button></div><button onClick={()=>go("hw")} style={{width:"100%",marginTop:14,padding:"10px",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:20,color:S.sub,fontSize:13,fontWeight:600,cursor:"pointer",minHeight:44}}>Skip to reflection</button></div></div>);}

function HW({go}){const[a,setA]=useState({});const[d,setD]=useState(false);const ok=a[1]&&a[1].length>5;if(d)return(<div className="dc-slide-up" style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:S.black}}><div style={{width:72,height:72,borderRadius:"50%",background:S.green,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}><svg width="36" height="36" viewBox="0 0 24 24" fill={S.black}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div><h2 style={{color:S.white,fontSize:24,fontWeight:700,margin:"0 0 6px"}}>Saved</h2><p style={{color:S.sub,fontSize:15,margin:"0 0 28px"}}>Episode 2 unlocked</p><button onClick={()=>go("home")} style={{padding:"14px 48px",borderRadius:50,border:"none",background:S.white,color:S.black,fontSize:16,fontWeight:700,cursor:"pointer",minHeight:44}}>Done</button></div>);return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",background:"linear-gradient(180deg,#1E3264 0%,#0D0D0D 25%)",WebkitOverflowScrolling:"touch"}}><div style={{padding:"12px 20px"}}><button onClick={()=>go("np")} style={{background:"none",border:"none",cursor:"pointer",padding:8,minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></button></div><div style={{padding:"0 24px 120px"}}><h1 style={{color:S.white,fontSize:22,fontWeight:700,margin:"0 0 4px"}}>Time to reflect</h1><p style={{color:S.sub,fontSize:14,margin:"0 0 20px"}}>Episode 1</p>{[{id:1,p:"What surprised you most about Ramadan?",req:true},{id:2,p:"Any questions? I got you.",req:false}].map(h=>(<div key={h.id} style={{marginBottom:18}}>{h.req&&<p style={{color:S.green,fontSize:11,fontWeight:700,margin:"0 0 6px"}}>REQUIRED</p>}<p style={{color:S.white,fontSize:15,lineHeight:1.5,margin:"0 0 8px"}}>{h.p}</p><textarea value={a[h.id]||""} onChange={e=>setA({...a,[h.id]:e.target.value})} placeholder="Type here..." style={{width:"100%",minHeight:75,padding:14,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.06)",color:S.white,fontSize:14,lineHeight:1.6,resize:"vertical",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>))}<button onClick={ok?()=>setD(true):undefined} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:ok?S.green:S.faint,color:ok?S.black:S.muted,fontSize:16,fontWeight:700,cursor:ok?"pointer":"not-allowed",minHeight:44}}>{ok?"Submit":"Write a reflection to continue"}</button></div></div>);}

function Series({go}){
  const {user}=useUser()||{user:'shah'};const isShah=user==='shah';
  const [eps,setEps]=useState(()=>local.get('tea_eps',[
    {id:1,t:"So... What Is Ramadan?",s:"available",v:"ep1"},
    {id:2,t:"Why You Already Feel It",s:"locked",v:"ep2"},
    {id:3,t:"Who Is Allah?",s:"locked",v:"ep3"},
    {id:4,t:"The Quran Explained",s:"locked",v:"main"},
  ]));
  const [addEp,setAddEp]=useState(false);const [newEp,setNewEp]=useState("");
  const [comments,setComments]=useState(()=>local.get('tea_comments',{}));
  useEffect(()=>{local.set('tea_eps',eps);},[eps]);
  useEffect(()=>{local.set('tea_comments',comments);},[comments]);

  return(<div className="dc-fade-in" style={{height:"100%",overflowY:"auto",paddingBottom:92,background:"linear-gradient(180deg,#1E3264 0%,#121212 35%)",WebkitOverflowScrolling:"touch"}}>
    <div style={{padding:"max(8px, env(safe-area-inset-top)) 16px 0"}}><button onClick={()=>go("home")} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 0",minWidth:44,minHeight:44}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.white} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></button></div>
    <div style={{display:"flex",gap:16,padding:"4px 20px 18px"}}><Cv size={125} r={6} v="ep1" sh/><div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><p style={{color:S.sub,fontSize:11,fontWeight:600,letterSpacing:1,margin:0}}>SERIES</p><h1 style={{color:S.white,fontSize:22,fontWeight:700,margin:"4px 0 0",lineHeight:1.1}}>Tea Sessions</h1><p style={{color:S.sub,fontSize:13,margin:"6px 0 0"}}>{eps.length} episodes</p></div></div>
    <div style={{padding:"0 20px"}}>{eps.map((ep,i)=>(<div key={ep.id} style={{marginBottom:2}}>
      <div onClick={ep.s!=="locked"?()=>go("np"):undefined} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:ep.s!=="locked"?"pointer":"default",opacity:ep.s==="locked"?0.3:1}}>
        <Cv size={42} r={4} v={ep.v||"main"}/>
        <div style={{flex:1,minWidth:0}}><p style={{color:ep.s==="available"?S.green:S.white,fontSize:15,fontWeight:500,margin:0}}>{ep.t}</p><p style={{color:S.muted,fontSize:12,margin:"2px 0 0"}}>Episode {i+1}</p></div>
        {ep.s==="locked"&&<svg width="14" height="14" viewBox="0 0 24 24" fill={S.muted}><path d="M18 8h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3-9H9V6a3 3 0 016 0v2z"/></svg>}
        {isShah&&<button onClick={e=>{e.stopPropagation();setEps(eps.filter((_,j)=>j!==i));}} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>}
      </div>
      {/* Dane's comment/reflection */}
      {comments[ep.id]&&<div style={{marginLeft:54,padding:"8px 12px",background:"rgba(232,17,91,0.06)",borderRadius:10,marginBottom:6}}><p style={{color:"#E8115B",fontSize:12,margin:0}}><span style={{fontWeight:600}}>Dane:</span> {comments[ep.id]}</p></div>}
      {!isShah&&ep.s!=="locked"&&<button onClick={()=>{const c=prompt("Your thoughts on this episode:");if(c)setComments({...comments,[ep.id]:c});}} style={{marginLeft:54,padding:"4px 12px",borderRadius:12,border:"1px solid rgba(232,17,91,0.15)",background:"transparent",color:"rgba(232,17,91,0.5)",fontSize:11,cursor:"pointer",marginBottom:6}}>Reflect</button>}
    </div>))}
    {/* Shah: add episode */}
    {isShah&&<div style={{marginTop:12}}>
      {addEp?<div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:16,border:"1px solid rgba(255,255,255,0.06)"}}>
        <input value={newEp} onChange={e=>setNewEp(e.target.value)} placeholder="Episode title" style={{width:"100%",padding:"10px 0",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{if(newEp.trim()){setEps([...eps,{id:Date.now(),t:newEp.trim(),s:"locked",v:"main"}]);setNewEp("");setAddEp(false);}}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#E13300",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add Episode</button>
          <button onClick={()=>{setAddEp(false);setNewEp("");}} style={{padding:"10px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
      :<button onClick={()=>setAddEp(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(255,255,255,0.06)",background:"transparent",color:"rgba(255,255,255,0.25)",fontSize:13,cursor:"pointer"}}>+ add episode</button>}
    </div>}
    </div>
  </div>);
}

export default function App(){
  const[user,setUser]=useState(()=>local.get('user',null));
  const[s,setS]=useState(()=>local.get('lastScreen','home'));
  const[tab,setTab]=useState(()=>local.get('lastTab','home'));
  const[dark,setDark]=useState(()=>local.get('dark',false));
  const go=t=>{setS(t);local.set('lastScreen',t);if(["home","browse","learn","us"].includes(t)){setTab(t);local.set('lastTab',t);}};
  const setDarkMode=(v)=>{setDark(v);local.set('dark',v);};
  const logout=()=>{setUser(null);local.set('user',null);setS('home');setTab('home');};
  const nav=["home","browse","learn","us","series"].includes(s);

  if(!user)return(<><style>{`
    .dc-shake{animation:shake 0.4s ease-in-out;}
    @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  `}</style><Login onLogin={(u)=>setUser(u)}/></>);

  return(<UserCtx.Provider value={{user,logout}}>
    <DarkCtx.Provider value={dark}><Shell dark={dark}>
      {s==="home"&&<Home go={go}/>}
      {s==="browse"&&<Browse go={go}/>}
      {s==="learn"&&<Learn/>}
      {s==="us"&&<Us onDark={setDarkMode} isDark={dark}/>}
      {s==="np"&&<NP go={go}/>}
      {s==="hw"&&<HW go={go}/>}
      {s==="series"&&<Series go={go}/>}
      {nav&&<NavBar active={tab} go={go}/>}
    </Shell></DarkCtx.Provider>
  </UserCtx.Provider>);
}
