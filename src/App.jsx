import { useState, useEffect, useRef, useCallback } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const USER = {
  name: "Alex",
  avatar: "A",
  tasteScore: 847,
  streak: 12,
  level: "Curator",
  following: 23,
  followers: 141,
  genres: ["Arthouse", "Jazz", "Literary Fiction", "Travel"],
  recentActivity: ["Saved Patagonia trip", "Rated Tarkovsky 5★", "Added 3 books"],
};

const TASTE_DIMS = [
  { label: "Adventurous", val: 82, color: "#FF6B35" },
  { label: "Intellectual", val: 91, color: "#C9B1FF" },
  { label: "Aesthetic", val: 76, color: "#FFE66D" },
  { label: "Social", val: 43, color: "#4ECDC4" },
  { label: "Nostalgic", val: 67, color: "#FFB3BA" },
  { label: "Spontaneous", val: 55, color: "#A8E6CF" },
];

const ALL_RECS = [
  { id:1, cat:"film", title:"Jeanne Dielman", sub:"Chantal Akerman · 1975", match:98, tag:"Radical", color:"#0d1117", accent:"#e94560", icon:"⬡", runtime:"201 min", rating:4.9, reviews:2100, desc:"An exhaustive portrait of domestic routine that shatters the frame of cinema itself.", why:"Your love for slow cinema and feminist narratives.", moods:["focused","contemplative"], similar:["Stalker","Scenes from a Marriage"] },
  { id:2, cat:"music", title:"In a Silent Way", sub:"Miles Davis · 1969", match:96, tag:"Transcendent", color:"#0a1628", accent:"#4ECDC4", icon:"⬡", runtime:"38 min", rating:4.8, reviews:8900, desc:"The electric whisper that launched jazz into the cosmos. Space as instrument.", why:"Your 94% affinity for modal jazz and ambient textures.", moods:["calm","inspired"], similar:["Bitches Brew","Koln Concert"] },
  { id:3, cat:"book", title:"The Unconsoled", sub:"Kazuo Ishiguro · 1995", match:94, tag:"Labyrinthine", color:"#130d1f", accent:"#C9B1FF", icon:"⬡", runtime:"535 pages", rating:4.6, reviews:3400, desc:"A pianist arrives in an unnamed city. Nothing resolves. Everything resonates.", why:"Your completed Ishiguro collection and 89% dream-logic tolerance.", moods:["introspective","focused"], similar:["The Trial","Remainder"] },
  { id:4, cat:"place", title:"Faroe Islands", sub:"North Atlantic · Remote", match:92, tag:"Mythic", color:"#0b1a1a", accent:"#A8E6CF", icon:"⬡", runtime:"Best: Jun–Aug", rating:4.9, reviews:560, desc:"Grass-roofed villages clinging to cliffs above black-sand sea. Fog as architecture.", why:"Your high adventure score and 7 Nordic destinations saved.", moods:["adventurous","awe"], similar:["Lofoten Islands","Scottish Highlands"] },
  { id:5, cat:"food", title:"Cacio e Pepe at Roscioli", sub:"Rome, Trastevere", match:91, tag:"Elemental", color:"#1a1208", accent:"#FFE66D", icon:"⬡", runtime:"Open till 23:00", rating:4.8, reviews:4200, desc:"Three ingredients. Four centuries of technique. The apex of simplicity as mastery.", why:"Your Italy trip board and Italian cuisine as top cuisine preference.", moods:["social","indulgent"], similar:["Tonnarello","Da Enzo al 29"] },
  { id:6, cat:"film", title:"Aftersun", sub:"Charlotte Wells · 2022", match:97, tag:"Haunting", color:"#081520", accent:"#FFB3BA", icon:"⬡", runtime:"101 min", rating:4.7, reviews:12000, desc:"A daughter reconstructs her father through the camcorder footage of a Turkish holiday.", why:"Your 97th percentile emotional resonance rating.", moods:["nostalgic","melancholy"], similar:["C'mon C'mon","45 Years"] },
  { id:7, cat:"music", title:"Vespertine", sub:"Björk · 2001", match:93, tag:"Crystalline", color:"#0d1a2e", accent:"#FFE66D", icon:"⬡", runtime:"48 min", rating:4.8, reviews:15000, desc:"Microscopic beats, harp, choir and intimacy woven into an indoor winter world.", why:"Your experimental pop affinity score: 88%.", moods:["intimate","inspired"], similar:["Homogenic","Vulnicura"] },
  { id:8, cat:"book", title:"Outline Trilogy", sub:"Rachel Cusk · 2014–2018", match:95, tag:"Destabilizing", color:"#1a0d0d", accent:"#FF6B35", icon:"⬡", runtime:"3 volumes", rating:4.7, reviews:7800, desc:"A narrator who disappears into the stories of others. Autofiction at its most radical.", why:"Your affinity for literary autofiction: top 5%.", moods:["introspective","sharp"], similar:["The Years","Speedboat"] },
];

const FRIENDS = [
  { id:1, name:"Mia", avatar:"M", color:"#e94560", shared:14, status:"Saved 'Dune: Messiah' 2h ago" },
  { id:2, name:"Theo", avatar:"T", color:"#4ECDC4", shared:8, status:"Rated Coltrane ★★★★★" },
  { id:3, name:"Nour", avatar:"N", color:"#FFE66D", shared:22, status:"Planning Tokyo trip" },
  { id:4, name:"Priya", avatar:"P", color:"#C9B1FF", shared:17, status:"Finished Outline Trilogy" },
];

const MOODS = [
  { id:"adventurous", label:"Adventurous", emoji:"⚡", color:"#FF6B35", cats:["place","film"] },
  { id:"contemplative", label:"Contemplative", emoji:"◎", color:"#C9B1FF", cats:["book","film"] },
  { id:"inspired", label:"Inspired", emoji:"✦", color:"#FFE66D", cats:["music","book"] },
  { id:"social", label:"Social", emoji:"◈", color:"#4ECDC4", cats:["food","place"] },
  { id:"nostalgic", label:"Nostalgic", emoji:"⬡", color:"#FFB3BA", cats:["film","music"] },
  { id:"indulgent", label:"Indulgent", emoji:"●", color:"#A8E6CF", cats:["food","place"] },
];

const CATEGORIES = [
  { id:"all", label:"All", icon:"✦" },
  { id:"film", label:"Film", icon:"⬡" },
  { id:"music", label:"Music", icon:"◎" },
  { id:"book", label:"Books", icon:"◻" },
  { id:"place", label:"Places", icon:"◆" },
  { id:"food", label:"Food", icon:"●" },
];

const ONBOARDING_STEPS = [
  { title:"What pulls you in?", subtitle:"Select everything that resonates.", type:"taste", options:["Slow cinema","Jazz & blues","Literary fiction","Remote travel","Fine dining","Electronic music","Sci-fi worlds","Art museums","Hiking","Experimental art","World cuisine","Architecture"] },
  { title:"Your pace.", subtitle:"How do you like to discover?", type:"pace", options:["Deep dives","Quick hits","Curated weekly","Daily drip","Serendipity","Themed journeys"] },
  { title:"Mood calibration.", subtitle:"How are you feeling this week?", type:"mood" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function MatchArc({ pct, accent, size=52 }) {
  const r = size/2 - 5;
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff0a" strokeWidth={3.5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeWidth={3.5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={size>50?10:9} fontWeight="800"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,fontFamily:"'Georgia',serif"}}>
        {pct}%
      </text>
    </svg>
  );
}

function TasteBar({ label, val, color, delay=0 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setAnimated(true), delay); return ()=>clearTimeout(t); },[delay]);
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:11,color:"#ffffff50",fontFamily:"monospace",letterSpacing:1}}>{label.toUpperCase()}</span>
        <span style={{fontSize:11,color,fontFamily:"monospace",fontWeight:700}}>{val}</span>
      </div>
      <div style={{height:3,background:"#ffffff08",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:animated?`${val}%`:"0%",background:`linear-gradient(90deg,${color}80,${color})`,borderRadius:2,transition:`width 1s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`}}/>
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{color:"#FFE66D",fontSize:11,letterSpacing:1}}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5-Math.round(rating))}
      <span style={{color:"#ffffff30",marginLeft:5,fontFamily:"monospace"}}>{rating}</span>
    </span>
  );
}

function Toast({ msg, visible }) {
  return (
    <div style={{
      position:"fixed",top:56,left:"50%",transform:`translateX(-50%) translateY(${visible?0:-12}px)`,
      background:"#1c1c1e",border:"1px solid #2a2a2a",borderRadius:12,padding:"10px 18px",
      fontSize:12,color:"#fff",zIndex:999,fontFamily:"monospace",whiteSpace:"nowrap",
      opacity:visible?1:0,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",pointerEvents:"none",
      boxShadow:"0 8px 32px #00000080",
    }}>{msg}</div>
  );
}

function Pill({ children, active, color="#e94560", onClick, style={} }) {
  return (
    <button onClick={onClick} style={{
      padding:"7px 14px",borderRadius:20,border:`1px solid ${active?color:"#2a2a2a"}`,
      background:active?`${color}18`:"#111",color:active?color:"#ffffff40",
      fontSize:11,fontFamily:"monospace",cursor:"pointer",whiteSpace:"nowrap",
      transition:"all 0.2s ease",letterSpacing:0.5,...style
    }}>{children}</button>
  );
}

// ── SWIPE CARDS ───────────────────────────────────────────────────────────────
function SwipeCard({ item, onLike, onDislike, onInfo, isTop, zIndex }) {
  const [drag, setDrag] = useState({x:0,y:0,active:false});
  const [gone, setGone] = useState(null);
  const startRef = useRef({x:0,y:0});

  const down = (e) => {
    const pt = e.touches?.[0] ?? e;
    startRef.current = {x:pt.clientX,y:pt.clientY};
    setDrag({x:0,y:0,active:true});
  };
  const move = (e) => {
    if(!drag.active) return;
    const pt = e.touches?.[0] ?? e;
    setDrag(d=>({...d, x:pt.clientX-startRef.current.x, y:pt.clientY-startRef.current.y}));
  };
  const up = () => {
    if(Math.abs(drag.x)>90) {
      const dir = drag.x>0?"right":"left";
      setGone(dir);
      setTimeout(()=>{ dir==="right"?onLike(item):onDislike(item); }, 350);
    } else {
      setDrag({x:0,y:0,active:false});
    }
  };

  const rot = drag.x*0.06;
  const lift = Math.abs(drag.x)*0.03;
  const tx = gone==="right"?500:gone==="left"?-500:drag.x;
  const ty = gone?-50:drag.y*0.2;
  const op = gone?0: Math.max(0.4, 1-Math.abs(drag.x)/280);

  return (
    <div
      onMouseDown={isTop?down:undefined} onMouseMove={isTop?move:undefined}
      onMouseUp={isTop?up:undefined} onMouseLeave={isTop?up:undefined}
      onTouchStart={isTop?down:undefined} onTouchMove={isTop?move:undefined}
      onTouchEnd={isTop?up:undefined}
      style={{
        position:"absolute",inset:0,borderRadius:28,overflow:"hidden",
        background:`linear-gradient(160deg,${item.color} 0%,#020206 100%)`,
        transform:`translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) translateY(${-lift}px)`,
        opacity:op, zIndex, cursor:isTop?(drag.active?"grabbing":"grab"):"default",
        userSelect:"none", boxShadow:`0 32px 80px ${item.accent}25,inset 0 1px 0 ${item.accent}15`,
        border:`1px solid ${item.accent}12`,
        transition:drag.active?"none":"transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
      }}>

      {/* Noise texture overlay */}
      <div style={{position:"absolute",inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,opacity:0.4,pointerEvents:"none"}}/>

      {/* Accent glow */}
      <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${item.accent}18 0%,transparent 70%)`,pointerEvents:"none"}}/>

      {/* Swipe indicators */}
      {drag.x>50&&<div style={{position:"absolute",top:28,left:24,background:item.accent,color:"#000",borderRadius:8,padding:"4px 12px",fontWeight:800,fontSize:11,fontFamily:"monospace",letterSpacing:2,transform:"rotate(-4deg)"}}>SAVE ✦</div>}
      {drag.x<-50&&<div style={{position:"absolute",top:28,right:24,background:"#1a1a1a",color:"#ffffff70",borderRadius:8,padding:"4px 12px",fontWeight:800,fontSize:11,fontFamily:"monospace",letterSpacing:2,border:"1px solid #333",transform:"rotate(4deg)"}}>SKIP ◌</div>}

      <div style={{padding:28,height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1,paddingRight:12}}>
              <div style={{fontSize:10,color:item.accent,fontWeight:700,letterSpacing:3,marginBottom:8,fontFamily:"monospace"}}>{item.tag.toUpperCase()} · {item.cat.toUpperCase()}</div>
              <div style={{fontSize:26,color:"#fff",fontWeight:900,fontFamily:"Georgia,serif",lineHeight:1.1,marginBottom:6}}>{item.title}</div>
              <div style={{fontSize:12,color:"#ffffff50",fontFamily:"monospace",marginBottom:4}}>{item.sub}</div>
              <StarRating rating={item.rating}/>
            </div>
            <MatchArc pct={item.match} accent={item.accent} size={56}/>
          </div>

          <div style={{marginTop:18,fontSize:14,color:"#ffffffa0",lineHeight:1.7,fontFamily:"Georgia,serif",fontStyle:"italic"}}>"{item.desc}"</div>

          <div style={{marginTop:14,padding:"10px 14px",background:`${item.accent}10`,borderRadius:12,border:`1px solid ${item.accent}20`}}>
            <div style={{fontSize:10,color:item.accent,fontFamily:"monospace",letterSpacing:2,marginBottom:3}}>WHY THIS FOR YOU</div>
            <div style={{fontSize:12,color:"#ffffff60",fontFamily:"Georgia,serif"}}>{item.why}</div>
          </div>
        </div>

        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {item.moods.map(m=><span key={m} style={{background:"#ffffff08",color:"#ffffff40",padding:"3px 10px",borderRadius:10,fontSize:10,fontFamily:"monospace",letterSpacing:0.5}}>{m}</span>)}
            <span style={{background:`${item.accent}15`,color:item.accent,padding:"3px 10px",borderRadius:10,fontSize:10,fontFamily:"monospace",letterSpacing:0.5}}>{item.runtime}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={(e)=>{e.stopPropagation();onDislike(item);}} style={{flex:1,padding:"12px",borderRadius:14,border:"1px solid #2a2a2a",background:"#111",color:"#ffffff40",fontSize:18,cursor:"pointer",transition:"all 0.2s"}}>✕</button>
            <button onClick={(e)=>{e.stopPropagation();onInfo(item);}} style={{flex:1,padding:"12px",borderRadius:14,border:"1px solid #2a2a2a",background:"#111",color:"#ffffff60",fontSize:14,fontFamily:"monospace",cursor:"pointer",transition:"all 0.2s"}}>MORE</button>
            <button onClick={(e)=>{e.stopPropagation();onLike(item);}} style={{flex:1,padding:"12px",borderRadius:14,border:`1px solid ${item.accent}40`,background:`${item.accent}15`,color:item.accent,fontSize:18,cursor:"pointer",transition:"all 0.2s"}}>♥</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onSave }) {
  const [tab, setTab] = useState("overview");
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"#000000e0",backdropFilter:"blur(12px)",display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%",maxWidth:390,margin:"0 auto",background:"#0e0e0e",borderRadius:"28px 28px 0 0",border:"1px solid #1f1f1f",maxHeight:"85vh",overflowY:"auto",scrollbarWidth:"none"}}>
        <div style={{padding:"20px 24px 0"}}>
          <div style={{width:36,height:4,background:"#333",borderRadius:2,margin:"0 auto 20px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{fontSize:10,color:item.accent,fontFamily:"monospace",letterSpacing:3,marginBottom:6}}>{item.tag.toUpperCase()} · {item.cat.toUpperCase()}</div>
              <div style={{fontSize:24,fontWeight:900,fontFamily:"Georgia,serif",lineHeight:1.1,marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:13,color:"#ffffff50",fontFamily:"monospace"}}>{item.sub}</div>
              <div style={{marginTop:8}}><StarRating rating={item.rating}/><span style={{fontSize:11,color:"#ffffff25",fontFamily:"monospace",marginLeft:8}}>{item.reviews.toLocaleString()} ratings</span></div>
            </div>
            <MatchArc pct={item.match} accent={item.accent} size={56}/>
          </div>

          <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:"1px solid #1a1a1a",paddingBottom:16}}>
            {["overview","similar","share"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:tab===t?"#1f1f1f":"transparent",color:tab===t?"#fff":"#ffffff30",fontSize:11,fontFamily:"monospace",letterSpacing:1,cursor:"pointer",transition:"all 0.2s"}}>{t.toUpperCase()}</button>
            ))}
          </div>

          {tab==="overview"&&(
            <div>
              <p style={{fontSize:14,color:"#ffffffa0",lineHeight:1.8,fontFamily:"Georgia,serif",fontStyle:"italic",marginBottom:20}}>"{item.desc}"</p>
              <div style={{background:`${item.accent}10`,border:`1px solid ${item.accent}20`,borderRadius:14,padding:16,marginBottom:16}}>
                <div style={{fontSize:10,color:item.accent,fontFamily:"monospace",letterSpacing:2,marginBottom:6}}>WHY THIS FOR YOU</div>
                <div style={{fontSize:13,color:"#ffffffa0",fontFamily:"Georgia,serif",lineHeight:1.6}}>{item.why}</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {item.moods.map(m=><span key={m} style={{background:"#1a1a1a",color:"#ffffff50",padding:"6px 12px",borderRadius:10,fontSize:11,fontFamily:"monospace"}}>{m}</span>)}
              </div>
              <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:1,marginBottom:8}}>RUNTIME / SIZE</div>
              <div style={{fontSize:14,color:"#ffffff70",fontFamily:"monospace",marginBottom:20}}>{item.runtime}</div>
            </div>
          )}
          {tab==="similar"&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:2,marginBottom:14}}>YOU MIGHT ALSO LOVE</div>
              {item.similar.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${item.accent}15`,border:`1px solid ${item.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:item.accent}}>⬡</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif",color:"#fff"}}>{s}</div>
                    <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",marginTop:2}}>Similar {item.cat}</div>
                  </div>
                  <div style={{fontSize:11,color:item.accent,fontFamily:"monospace",fontWeight:700}}>{85+i*3}%</div>
                </div>
              ))}
            </div>
          )}
          {tab==="share"&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:2,marginBottom:14}}>SEND TO FRIENDS</div>
              {FRIENDS.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:`${f.color}30`,border:`1px solid ${f.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:f.color,fontFamily:"serif"}}>{f.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif",color:"#fff"}}>{f.name}</div>
                    <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",marginTop:1}}>{f.shared} shared picks</div>
                  </div>
                  <button style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${f.color}40`,background:"transparent",color:f.color,fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>Send</button>
                </div>
              ))}
            </div>
          )}

          <div style={{display:"flex",gap:10,padding:"16px 0 24px"}}>
            <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,border:"1px solid #2a2a2a",background:"#111",color:"#ffffff50",fontFamily:"monospace",fontSize:12,cursor:"pointer"}}>BACK</button>
            <button onClick={()=>{onSave(item);onClose();}} style={{flex:2,padding:"14px",borderRadius:14,border:`1px solid ${item.accent}40`,background:`${item.accent}20`,color:item.accent,fontFamily:"monospace",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:1}}>✦ SAVE TO COLLECTION</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({});
  const [moodSel, setMoodSel] = useState(null);

  const cur = ONBOARDING_STEPS[step];
  const isLast = step===ONBOARDING_STEPS.length-1;

  const toggle = (k,v) => setSelected(s=>({...s,[k]:s[k]?.includes(v)?s[k].filter(x=>x!==v):[...(s[k]||[]),v]}));

  return (
    <div style={{background:"#080808",minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column",padding:"60px 24px 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,right:-80,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,#e9456015 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:40,left:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,#4ECDC415 0%,transparent 70%)"}}/>

      {/* Progress */}
      <div style={{display:"flex",gap:6,marginBottom:40}}>
        {ONBOARDING_STEPS.map((_,i)=>(
          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#e94560":"#1a1a1a",transition:"background 0.4s ease"}}/>
        ))}
      </div>

      <div style={{fontSize:10,color:"#e94560",fontFamily:"monospace",letterSpacing:3,marginBottom:10}}>STEP {step+1} OF {ONBOARDING_STEPS.length}</div>
      <div style={{fontSize:30,fontWeight:900,fontFamily:"Georgia,serif",lineHeight:1.1,marginBottom:8,color:"#fff"}}>{cur.title}</div>
      <div style={{fontSize:14,color:"#ffffff40",fontFamily:"monospace",marginBottom:32,letterSpacing:0.5}}>{cur.subtitle}</div>

      {cur.type!=="mood"&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:8,flex:1}}>
          {cur.options.map(opt=>{
            const active=(selected[cur.type]||[]).includes(opt);
            return <Pill key={opt} active={active} onClick={()=>toggle(cur.type,opt)} style={{fontSize:12,padding:"9px 16px"}}>{opt}</Pill>;
          })}
        </div>
      )}

      {cur.type==="mood"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,flex:1}}>
          {MOODS.map(m=>(
            <button key={m.id} onClick={()=>setMoodSel(m.id)} style={{
              padding:"20px 16px",borderRadius:18,border:`1px solid ${moodSel===m.id?m.color:"#1a1a1a"}`,
              background:moodSel===m.id?`${m.color}18`:"#111",color:moodSel===m.id?m.color:"#ffffff40",
              textAlign:"left",cursor:"pointer",transition:"all 0.2s ease",
            }}>
              <div style={{fontSize:24,marginBottom:8}}>{m.emoji}</div>
              <div style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"}}>{m.label}</div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={()=>isLast?onComplete({...selected,mood:moodSel}):setStep(s=>s+1)}
        style={{
          marginTop:24,padding:"16px",borderRadius:16,border:"none",
          background:"linear-gradient(135deg,#e94560,#c73050)",
          color:"#fff",fontSize:14,fontWeight:800,fontFamily:"monospace",
          letterSpacing:1,cursor:"pointer",
          boxShadow:"0 8px 32px #e9456040",
        }}
      >{isLast?"ENTER THE FOLD →":"CONTINUE →"}</button>
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────────
function DiscoverScreen({ onSave, onToast }) {
  const [cat, setCat] = useState("all");
  const [cardIdx, setCardIdx] = useState(0);
  const [detail, setDetail] = useState(null);
  const [viewed, setViewed] = useState([]);

  const filtered = cat==="all"?ALL_RECS:ALL_RECS.filter(r=>r.cat===cat);
  const stack = filtered.filter((_,i)=>i>=cardIdx%filtered.length);
  const visible = stack.slice(0,3);

  const handleLike = (item) => { onSave(item); onToast(`✦ Saved "${item.title}"`); setViewed(v=>[...v,item.id]); setCardIdx(i=>i+1); };
  const handleSkip = (item) => { onToast(`◌ Skipped`); setViewed(v=>[...v,item.id]); setCardIdx(i=>i+1); };

  return (
    <div>
      {detail&&<DetailPanel item={detail} onClose={()=>setDetail(null)} onSave={(item)=>{onSave(item);onToast(`✦ Saved "${item.title}"`)}}/>}

      <div style={{padding:"52px 24px 16px"}}>
        <div style={{fontSize:10,color:"#ffffff25",letterSpacing:4,fontFamily:"monospace",marginBottom:4}}>CURATED FOR YOU</div>
        <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif"}}>Discover <span style={{color:"#e94560"}}>↗</span></div>
      </div>

      {/* Cat filters */}
      <div style={{display:"flex",gap:7,padding:"0 24px 20px",overflowX:"auto",scrollbarWidth:"none"}}>
        {CATEGORIES.map(c=><Pill key={c.id} active={cat===c.id} onClick={()=>{setCat(c.id);setCardIdx(0);}}>{c.icon} {c.label}</Pill>)}
      </div>

      {/* Card stack */}
      <div style={{position:"relative",height:380,margin:"0 16px",marginBottom:16}}>
        {visible.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:"#ffffff20",fontFamily:"Georgia,serif",fontSize:16}}>
            <div style={{fontSize:40,marginBottom:16}}>◌</div>All caught up
          </div>
        ):(
          visible.map((item,i)=>(
            <div key={item.id} style={{position:"absolute",inset:0,transform:`scale(${1-i*0.04}) translateY(${i*14}px)`,transition:"transform 0.4s ease",zIndex:visible.length-i}}>
              <SwipeCard item={item} onLike={handleLike} onDislike={handleSkip} onInfo={setDetail} isTop={i===0} zIndex={visible.length-i}/>
            </div>
          ))
        )}
      </div>

      <div style={{textAlign:"center",fontSize:10,color:"#ffffff15",fontFamily:"monospace",letterSpacing:3,marginBottom:20}}>SWIPE OR USE BUTTONS</div>

      {/* Trending rail */}
      <div style={{padding:"0 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:10,color:"#ffffff25",letterSpacing:3,fontFamily:"monospace"}}>TRENDING IN YOUR CIRCLES</div>
          <div style={{fontSize:10,color:"#e94560",fontFamily:"monospace",cursor:"pointer"}}>SEE ALL</div>
        </div>
        <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",paddingBottom:8}}>
          {ALL_RECS.slice(0,5).map(item=>(
            <div key={item.id} onClick={()=>setDetail(item)} style={{flexShrink:0,width:140,borderRadius:16,background:`linear-gradient(160deg,${item.color},#050505)`,border:`1px solid ${item.accent}18`,padding:14,cursor:"pointer"}}>
              <div style={{fontSize:18,marginBottom:8}}>{item.icon}</div>
              <div style={{fontSize:13,fontWeight:800,fontFamily:"Georgia,serif",lineHeight:1.2,marginBottom:4,color:"#fff"}}>{item.title}</div>
              <div style={{fontSize:10,color:"#ffffff30",fontFamily:"monospace"}}>{item.sub.split("·")[0]}</div>
              <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:item.accent,fontFamily:"monospace",fontWeight:700}}>{item.match}%</span>
                <span style={{fontSize:10,color:"#ffffff20",fontFamily:"monospace"}}>{item.reviews>999?(item.reviews/1000).toFixed(1)+"k":item.reviews}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{height:100}}/>
    </div>
  );
}

function CollectionScreen({ saved, onRemove, onToast }) {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const cats = ["all",...new Set(saved.map(s=>s.cat))];
  const shown = filter==="all"?saved:saved.filter(s=>s.cat===filter);

  return (
    <div>
      <div style={{padding:"52px 24px 16px"}}>
        <div style={{fontSize:10,color:"#ffffff25",letterSpacing:4,fontFamily:"monospace",marginBottom:4}}>YOUR CURATION</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif"}}>Collection <span style={{color:"#4ECDC4",fontSize:16,fontFamily:"monospace"}}>{saved.length}</span></div>
          <div style={{display:"flex",gap:6}}>
            {["grid","list"].map(v=><button key={v} onClick={()=>setView(v)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${view===v?"#e94560":"#2a2a2a"}`,background:view===v?"#e9456018":"transparent",color:view===v?"#e94560":"#ffffff30",fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>{v==="grid"?"▦":"≡"}</button>)}
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:7,padding:"0 24px 20px",overflowX:"auto",scrollbarWidth:"none"}}>
        {cats.map(c=><Pill key={c} active={filter===c} onClick={()=>setFilter(c)} style={{textTransform:"capitalize"}}>{c}</Pill>)}
      </div>

      {shown.length===0?(
        <div style={{textAlign:"center",padding:"80px 0",color:"#ffffff15"}}>
          <div style={{fontSize:48,marginBottom:12}}>◌</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:16,color:"#ffffff25"}}>Nothing saved yet</div>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#ffffff15",marginTop:6}}>Discover and save picks</div>
        </div>
      ):view==="grid"?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
          {shown.map(item=>(
            <div key={item.id} style={{borderRadius:18,background:`linear-gradient(160deg,${item.color},#050505)`,border:`1px solid ${item.accent}18`,padding:16,position:"relative"}}>
              <div style={{fontSize:24,marginBottom:10}}>{item.icon}</div>
              <div style={{fontSize:11,color:item.accent,fontFamily:"monospace",letterSpacing:1,marginBottom:4}}>{item.tag.toUpperCase()}</div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:"Georgia,serif",lineHeight:1.2,marginBottom:4,color:"#fff"}}>{item.title}</div>
              <div style={{fontSize:10,color:"#ffffff30",fontFamily:"monospace"}}>{item.sub.split("·")[0]}</div>
              <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:item.accent,fontFamily:"monospace",fontWeight:700}}>{item.match}% match</span>
                <button onClick={()=>{onRemove(item.id);onToast("Removed");}} style={{background:"none",border:"none",color:"#ffffff20",cursor:"pointer",fontSize:14,padding:0}}>×</button>
              </div>
            </div>
          ))}
        </div>
      ):(
        <div style={{padding:"0 24px"}}>
          {shown.map(item=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:"1px solid #141414"}}>
              <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${item.color},${item.accent}20)`,border:`1px solid ${item.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"Georgia,serif",color:"#fff"}}>{item.title}</div>
                <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",marginTop:2}}>{item.sub}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:800,color:item.accent,fontFamily:"monospace"}}>{item.match}%</div>
                <button onClick={()=>{onRemove(item.id);onToast("Removed");}} style={{background:"none",border:"none",color:"#ffffff15",cursor:"pointer",fontSize:12,padding:0,fontFamily:"monospace",marginTop:2}}>remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{height:100}}/>
    </div>
  );
}

function MoodScreen({ onToast }) {
  const [mood, setMood] = useState(null);
  const [intensity, setIntensity] = useState(5);

  const moodRecs = mood ? ALL_RECS.filter(r=>r.moods.some(m=>mood.cats.includes(r.cat))).slice(0,4) : [];

  return (
    <div>
      <div style={{padding:"52px 24px 24px"}}>
        <div style={{fontSize:10,color:"#ffffff25",letterSpacing:4,fontFamily:"monospace",marginBottom:4}}>MOOD ENGINE</div>
        <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif"}}>How are you <span style={{color:"#C9B1FF"}}>now?</span></div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 24px 24px"}}>
        {MOODS.map(m=>(
          <button key={m.id} onClick={()=>setMood(mood?.id===m.id?null:m)} style={{
            padding:"16px 10px",borderRadius:16,border:`1px solid ${mood?.id===m.id?m.color:"#1a1a1a"}`,
            background:mood?.id===m.id?`${m.color}18`:"#111",
            color:mood?.id===m.id?m.color:"#ffffff40",textAlign:"center",cursor:"pointer",transition:"all 0.2s ease",
          }}>
            <div style={{fontSize:20,marginBottom:6}}>{m.emoji}</div>
            <div style={{fontSize:10,fontFamily:"monospace",letterSpacing:0.5,lineHeight:1.3}}>{m.label}</div>
          </button>
        ))}
      </div>

      {mood&&(
        <>
          <div style={{padding:"0 24px 20px"}}>
            <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:2,marginBottom:12}}>INTENSITY</div>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                <button key={n} onClick={()=>setIntensity(n)} style={{
                  flex:1,height:6,borderRadius:3,border:"none",cursor:"pointer",transition:"all 0.2s",
                  background:n<=intensity?mood.color:"#1a1a1a",
                }}/>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:10,color:"#ffffff20",fontFamily:"monospace"}}>subtle</span>
              <span style={{fontSize:10,color:mood.color,fontFamily:"monospace",fontWeight:700}}>{intensity}/10</span>
              <span style={{fontSize:10,color:"#ffffff20",fontFamily:"monospace"}}>intense</span>
            </div>
          </div>

          <div style={{padding:"0 24px"}}>
            <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:2,marginBottom:14}}>CURATED FOR {mood.label.toUpperCase()}</div>
            {moodRecs.map(item=>(
              <div key={item.id} style={{marginBottom:10,borderRadius:16,background:`linear-gradient(135deg,${item.color} 0%,#0a0a0a 100%)`,padding:"16px 18px",border:`1px solid ${item.accent}15`,display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${item.accent}15`,border:`1px solid ${item.accent}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,color:item.accent,fontFamily:"monospace",letterSpacing:1,marginBottom:2}}>{item.cat.toUpperCase()}</div>
                  <div style={{fontSize:15,fontWeight:800,fontFamily:"Georgia,serif",color:"#fff",marginBottom:2}}>{item.title}</div>
                  <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace"}}>{item.sub.split("·")[0].trim()}</div>
                </div>
                <div style={{flexShrink:0}}>
                  <MatchArc pct={item.match} accent={item.accent} size={44}/>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {!mood&&(
        <div style={{textAlign:"center",padding:"40px 0",color:"#ffffff15"}}>
          <div style={{fontSize:40,marginBottom:12}}>◎</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,color:"#ffffff20"}}>Select a mood above</div>
        </div>
      )}
      <div style={{height:100}}/>
    </div>
  );
}

function SocialScreen({ onToast }) {
  const [tab, setTab] = useState("friends");
  return (
    <div>
      <div style={{padding:"52px 24px 16px"}}>
        <div style={{fontSize:10,color:"#ffffff25",letterSpacing:4,fontFamily:"monospace",marginBottom:4}}>SOCIAL</div>
        <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif"}}>Your <span style={{color:"#4ECDC4"}}>Circle</span></div>
      </div>

      <div style={{display:"flex",gap:4,padding:"0 24px 20px"}}>
        {["friends","activity","discover"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px 0",borderRadius:10,border:"none",background:tab===t?"#4ECDC420":"#111",color:tab===t?"#4ECDC4":"#ffffff30",fontSize:11,fontFamily:"monospace",letterSpacing:1,cursor:"pointer",border:`1px solid ${tab===t?"#4ECDC440":"#1f1f1f"}`,transition:"all 0.2s"}}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab==="friends"&&(
        <div style={{padding:"0 24px"}}>
          {FRIENDS.map((f,i)=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:"1px solid #141414",animation:`fadeUp 0.4s ease ${i*0.06}s both`}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:46,height:46,borderRadius:"50%",background:`${f.color}25`,border:`2px solid ${f.color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:f.color,fontFamily:"serif"}}>{f.avatar}</div>
                <div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:"#4ECDC4",border:"2px solid #080808"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",color:"#fff"}}>{f.name}</div>
                <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.status}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,color:f.color,fontFamily:"monospace",fontWeight:700}}>{f.shared}</div>
                <div style={{fontSize:10,color:"#ffffff20",fontFamily:"monospace"}}>shared</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="activity"&&(
        <div style={{padding:"0 24px"}}>
          {[
            {who:"Mia",action:"saved",what:"Dune: Messiah",cat:"book",color:"#e94560",time:"2h"},
            {who:"Theo",action:"rated ★★★★★",what:"A Love Supreme",cat:"music",color:"#4ECDC4",time:"4h"},
            {who:"Nour",action:"planning a trip to",what:"Kyoto",cat:"place",color:"#FFE66D",time:"6h"},
            {who:"Priya",action:"finished",what:"Outline Trilogy",cat:"book",color:"#C9B1FF",time:"1d"},
            {who:"Mia",action:"recommended",what:"Aftersun",cat:"film",color:"#e94560",time:"1d"},
          ].map((ev,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:"1px solid #141414"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${ev.color}20`,border:`1px solid ${ev.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:ev.color,fontFamily:"serif",flexShrink:0}}>{ev.who[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontFamily:"Georgia,serif",lineHeight:1.5}}>
                  <span style={{color:ev.color,fontWeight:700}}>{ev.who}</span>
                  <span style={{color:"#ffffff50"}}> {ev.action} </span>
                  <span style={{color:"#fff",fontWeight:700}}>{ev.what}</span>
                </div>
                <div style={{fontSize:10,color:"#ffffff25",fontFamily:"monospace",marginTop:4}}>{ev.cat.toUpperCase()} · {ev.time} ago</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="discover"&&(
        <div style={{padding:"0 24px"}}>
          <div style={{fontSize:11,color:"#ffffff25",fontFamily:"monospace",letterSpacing:2,marginBottom:16}}>PEOPLE WITH YOUR TASTE</div>
          {[
            {name:"Hana K.",avatar:"H",color:"#FF6B35",affinity:94,common:["Arthouse","Jazz","Japan"]},
            {name:"Louis M.",avatar:"L",color:"#FFE66D",affinity:89,common:["Literary Fiction","Travel","Fine Dining"]},
            {name:"Zara O.",avatar:"Z",color:"#4ECDC4",affinity:85,common:["Experimental Music","Architecture"]},
          ].map((u,i)=>(
            <div key={i} style={{marginBottom:10,borderRadius:16,background:"#111",border:"1px solid #1a1a1a",padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:`${u.color}25`,border:`2px solid ${u.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:u.color,fontFamily:"serif",flexShrink:0}}>{u.avatar}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",color:"#fff",marginBottom:6}}>{u.name}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {u.common.map(c=><span key={c} style={{background:"#1a1a1a",color:"#ffffff40",padding:"2px 8px",borderRadius:6,fontSize:10,fontFamily:"monospace"}}>{c}</span>)}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:14,color:u.color,fontFamily:"monospace",fontWeight:800}}>{u.affinity}%</div>
                <button onClick={()=>onToast(`Following ${u.name}`)} style={{marginTop:6,padding:"4px 10px",borderRadius:6,border:`1px solid ${u.color}40`,background:"transparent",color:u.color,fontSize:10,fontFamily:"monospace",cursor:"pointer"}}>follow</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{height:100}}/>
    </div>
  );
}

function ProfileScreen() {
  const [aiExpanded, setAiExpanded] = useState(false);
  return (
    <div>
      <div style={{padding:"52px 24px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#e94560,#0f3460)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,fontFamily:"Georgia,serif",border:"2px solid #333"}}>{USER.avatar}</div>
          <div>
            <div style={{fontSize:22,fontWeight:900,fontFamily:"Georgia,serif"}}>{USER.name}</div>
            <div style={{fontSize:11,color:"#e94560",fontFamily:"monospace",letterSpacing:2,marginTop:2}}>{USER.level.toUpperCase()} · {USER.streak}d streak 🔥</div>
            <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",marginTop:4}}>{USER.following} following · {USER.followers} followers</div>
          </div>
        </div>

        {/* Taste score */}
        <div style={{background:"linear-gradient(135deg,#1a0a0a,#0a0a1a)",borderRadius:20,padding:20,marginBottom:20,border:"1px solid #2a1a2a"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:"#e94560",fontFamily:"monospace",letterSpacing:3,marginBottom:4}}>TASTE SCORE</div>
              <div style={{fontSize:36,fontWeight:900,fontFamily:"Georgia,serif",color:"#e94560"}}>{USER.tasteScore}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"#ffffff25",fontFamily:"monospace",letterSpacing:2}}>TOP</div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>8%</div>
            </div>
          </div>
          <div style={{height:1,background:"#2a1a2a",marginBottom:14}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {USER.genres.map(g=><span key={g} style={{background:"#e9456015",color:"#e94560",padding:"4px 10px",borderRadius:8,fontSize:10,fontFamily:"monospace",border:"1px solid #e9456030"}}>{g}</span>)}
          </div>
        </div>

        {/* Taste DNA */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#ffffff25",letterSpacing:3,fontFamily:"monospace",marginBottom:14}}>TASTE DNA</div>
          {TASTE_DIMS.map((d,i)=><TasteBar key={d.label} label={d.label} val={d.val} color={d.color} delay={i*80}/>)}
        </div>

        {/* AI Insights */}
        <div style={{background:"#0d1117",borderRadius:16,border:"1px solid #1f2937",overflow:"hidden",marginBottom:20}}>
          <button onClick={()=>setAiExpanded(!aiExpanded)} style={{width:"100%",padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",color:"#fff"}}>
            <div>
              <div style={{fontSize:10,color:"#4ECDC4",fontFamily:"monospace",letterSpacing:2,marginBottom:3,textAlign:"left"}}>AI INSIGHTS</div>
              <div style={{fontSize:14,fontFamily:"Georgia,serif",textAlign:"left"}}>Your taste profile analysis</div>
            </div>
            <div style={{color:"#4ECDC4",fontSize:16,transform:aiExpanded?"rotate(180deg)":"none",transition:"transform 0.3s"}}>↓</div>
          </button>
          {aiExpanded&&(
            <div style={{padding:"0 18px 18px"}}>
              {[
                "You lean toward slow, contemplative works that reward patience — you're in the top 5% for arthouse consumption.",
                "Your music taste bridges jazz and experimental electronics, suggesting you value texture over melody.",
                "You save 3× more international travel content than the average user, with a strong Nordic bias.",
                "Literary fiction accounts for 68% of your book saves — particularly autofiction and unreliable narrators.",
              ].map((insight,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#4ECDC4",flexShrink:0,marginTop:5}}/>
                  <div style={{fontSize:13,color:"#ffffff60",fontFamily:"Georgia,serif",lineHeight:1.6,fontStyle:"italic"}}>{insight}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div style={{fontSize:10,color:"#ffffff25",letterSpacing:3,fontFamily:"monospace",marginBottom:12}}>RECENT ACTIVITY</div>
        {USER.recentActivity.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #0f0f0f"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#e94560",flexShrink:0}}/>
            <div style={{fontSize:13,color:"#ffffff50",fontFamily:"monospace"}}>{a}</div>
          </div>
        ))}
      </div>
      <div style={{height:100}}/>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("splash"); // splash | onboard | main
  const [activeTab, setActiveTab] = useState("discover");
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState({msg:"",vis:false});
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    setTimeout(()=>setLoaded(true),200);
    setTimeout(()=>setPhase("onboard"),2200);
  },[]);

  const showToast = useCallback((msg)=>{
    setToast({msg,vis:true});
    setTimeout(()=>setToast(t=>({...t,vis:false})),2200);
  },[]);

  const handleSave = useCallback((item)=>{
    setSaved(s=>s.find(x=>x.id===item.id)?s:[...s,item]);
  },[]);

  const handleRemove = useCallback((id)=>{
    setSaved(s=>s.filter(x=>x.id!==id));
  },[]);

  const TABS = [
    {id:"discover",icon:"✦",label:"Discover"},
    {id:"collection",icon:"◈",label:`Saved${saved.length?` (${saved.length})`:""}` },
    {id:"mood",icon:"◎",label:"Mood"},
    {id:"social",icon:"◆",label:"Social"},
    {id:"profile",icon:"◉",label:"Profile"},
  ];

  // SPLASH
  if(phase==="splash") return (
    <div style={{background:"#080808",minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,#e9456020 0%,transparent 70%)"}}/>
      <div style={{opacity:loaded?1:0,transform:loaded?"none":"translateY(20px)",transition:"all 0.8s cubic-bezier(0.34,1.56,0.64,1)",textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:16,filter:"drop-shadow(0 0 20px #e9456060)"}}>✦</div>
        <div style={{fontSize:36,fontWeight:900,fontFamily:"Georgia,serif",color:"#fff",letterSpacing:-1}}>fold</div>
        <div style={{fontSize:12,color:"#ffffff30",fontFamily:"monospace",letterSpacing:4,marginTop:6}}>PERSONALIZED TASTE ENGINE</div>
      </div>
      <div style={{position:"absolute",bottom:60,fontSize:11,color:"#ffffff15",fontFamily:"monospace",letterSpacing:2}}>LOADING YOUR WORLD…</div>
    </div>
  );

  // ONBOARD
  if(phase==="onboard") return <Onboarding onComplete={()=>setPhase("main")}/>;

  // MAIN
  return (
    <div style={{background:"#080808",minHeight:"100vh",maxWidth:390,margin:"0 auto",color:"#fff",position:"relative",overflowX:"hidden"}}>
      {/* Global ambient */}
      <div style={{position:"fixed",top:-120,right:-120,width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,#e9456010 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:80,left:-80,width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,#4ECDC410 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      <Toast msg={toast.msg} visible={toast.vis}/>

      <div style={{position:"relative",zIndex:1}}>
        {activeTab==="discover"&&<DiscoverScreen onSave={handleSave} onToast={showToast}/>}
        {activeTab==="collection"&&<CollectionScreen saved={saved} onRemove={handleRemove} onToast={showToast}/>}
        {activeTab==="mood"&&<MoodScreen onToast={showToast}/>}
        {activeTab==="social"&&<SocialScreen onToast={showToast}/>}
        {activeTab==="profile"&&<ProfileScreen/>}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:"#080808f0",backdropFilter:"blur(24px)",borderTop:"1px solid #141414",display:"flex",padding:"10px 0 22px",zIndex:50}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
            flex:1,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            cursor:"pointer",color:activeTab===tab.id?"#e94560":"#ffffff20",transition:"color 0.2s ease",padding:"2px 0",
          }}>
            {activeTab===tab.id&&<div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#e94560",top:-2}}/>}
            <span style={{fontSize:16,transition:"transform 0.2s",transform:activeTab===tab.id?"scale(1.2)":"scale(1)"}}>{tab.icon}</span>
            <span style={{fontSize:9,fontFamily:"monospace",letterSpacing:0.5,lineHeight:1}}>{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        button{outline:none}
      `}</style>
    </div>
  );
}
