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
              <div style={{fontSize:11,color:"#ffffff30",fontFamily:"monospace",letterSpacing:
