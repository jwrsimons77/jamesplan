import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, PlanApi } from '../services/api'

const QUEUE_KEY = 'queuedSets';
function readQueue(){ try { return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')||[] } catch { return [] } }
function writeQueue(arr){ localStorage.setItem(QUEUE_KEY, JSON.stringify(arr)); }

export default function WorkoutSheet({ day, logId: initialLogId, onClose, onSetAdded, onEnsureLog, userId, selectedDateISO }){
  const [exercises, setExercises] = useState([]);
  const [logId, setLogId] = useState(initialLogId || null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const [savedExIds, setSavedExIds] = useState(() => new Set());
  const [restSec, setRestSec] = useState(90);
  const [timer, setTimer] = useState(0);
  

  useEffect(() => { setLogId(initialLogId || null); }, [initialLogId]);
  useEffect(() => { if (!day) return; apiGet(`/api/plan-days/${day.id}/exercises`).then(setExercises); }, [day?.id]);

  useEffect(() => {
    const flush = async () => {
      const q = readQueue();
      if (!q.length) return;
      const rest = [];
      for (const item of q) {
        try { await PlanApi.addSet(item.logId, item.payload); } catch { rest.push(item); }
      }
      writeQueue(rest);
    };
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') flush(); });
    flush();
    return () => { window.removeEventListener('online', flush); };
  }, []);

  const letters = useMemo(() => exercises.map((_, i) => String.fromCharCode(65+i)), [exercises]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const cards = Array.from(el.querySelectorAll('[id^="ex-"]'));
      const top = el.scrollTop;
      let idx = 0;
      for (let i=0;i<cards.length;i++){
        const c = cards[i];
        if ((c.offsetTop - 24) <= top) idx = i; else break;
      }
      setActiveIndex(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [exercises]);

  async function ensureLog() {
    if (logId) return logId;
    if (onEnsureLog) {
      const id = await onEnsureLog();
      setLogId(id);
      return id;
    }
    const dateISO = selectedDateISO || new Date().toISOString().slice(0,10);
    const log = await PlanApi.startLog(day.id, dateISO, userId);
    setLogId(log.id);
    return log.id;
  }

  async function saveRow(ex, setNumber, fields){
    const id = await ensureLog();
    const payload = {
      exercise_id: ex.id,
      set_number: setNumber,
      weight: fields.weight ?? null,
      reps: fields.reps ?? null,
      rpe: fields.rpe ?? null,
      distance_m: fields.distance_m ?? null,
      duration_sec: fields.duration_sec ?? null,
      notes: fields.notes ?? ''
    };
    try {
      await PlanApi.addSet(id, payload);
    } catch {
      const q = readQueue();
      q.push({ logId: id, payload });
      writeQueue(q);
    }
    onSetAdded && onSetAdded();
  }

  async function saveExercise(ex, rows){
    // Save all non-empty rows for a given exercise
    const id = await ensureLog();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const has = !!(r.weight||r.reps||r.rpe||r.distance_m||r.duration_sec||r.notes);
      if (!has) continue;
      await saveRow(ex, i+1, r);
    }
    setSavedExIds(prev => {
      const next = new Set(prev);
      next.add(ex.id);
      return next;
    });
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:50}}>
      <div className="card workout-modal">
        {/* Top bar with section chips, timer and Finish */}
        <div className="row topbar" style={{justifyContent:'space-between', alignItems:'center', gap:8}}>
          <div className="row" style={{gap:6, overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
            {letters.map((ch, i) => (
              <button key={i} className="pill" style={{padding:'4px 8px', fontSize:12}} onClick={()=>{
                const el = document.getElementById('ex-'+i);
                el && el.scrollIntoView({ behavior:'smooth', block:'start' });
              }} aria-label={`Jump to section ${ch}`}>
                {ch}
              </button>
            ))}
          </div>
          <div className="row" style={{gap:8}}>
            <div className="pill" style={{padding:'4px 8px', fontSize:12}}>{formatMMSS(timer)}</div>
            <button className="btn" onClick={()=>setTimer(restSec)} style={{minWidth:64}} aria-label="Start rest timer">Rest</button>
            <button className="btn" onClick={onClose} style={{minWidth:88}} aria-label="Finish workout">Finish</button>
          </div>
        </div>
        {/* subtle progress */}
        <div style={{height:6, background:'#eef2f7', borderRadius:9999, marginTop:8}}>
          <div style={{height:'100%', width: `${progressPct(exercises, savedExIds)}%`, background:'linear-gradient(90deg, var(--brand), #12b886)', transition:'width .2s'}}></div>
        </div>

        <div ref={listRef} className="sheet-body">
          {exercises.map((ex, i) => (
            <div key={ex.id} id={'ex-'+i} className="card" style={{marginBottom:10, background:'var(--surface)'}}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <strong>{String.fromCharCode(65+i)}. {ex.name}</strong><br/>
                  <small className="muted">{ex.notes || ''}</small>
                </div>
                {savedExIds.has(ex.id) && (
                  <span className="pill" style={{padding:'2px 8px', fontSize:12, background:'rgba(14,124,102,0.15)'}}>✓ Saved</span>
                )}
              </div>
              <SetTable
                exercise={ex}
                userId={userId}
                onSaveRows={(rows)=>saveExercise(ex, rows)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SetTable({ exercise, onSaveRows, userId }){
  const [rows, setRows] = useState([{},{},{},{}]);
  const [saved, setSaved] = useState({}); // {rowIndex: true}
  const isRun = exercise.modality === 'run';
  // Prefill from last set (user scoped)
  useEffect(() => {
    let mounted = true;
    Promise.all([
      PlanApi.getLastSet(exercise.id, userId),
      PlanApi.getRecentSets(exercise.id, userId, 2)
    ]).then(([last, recent]) => {
      if (!mounted) return;
      if (last) setRows(prev => prev.map((r, i) => i===0 ? prefillFrom(last, r, isRun) : r));
      // compute suggestion
      if (recent && recent.length) {
        const hint = computeSuggestion(recent, isRun);
        if (hint) setRows(prev => prev.map((r, i) => i===0 ? { ...r, _suggest: hint } : r));
      }
    }).catch(()=>{});
    return () => { mounted = false; }
  }, [exercise.id, userId, isRun]);
  function update(i, patch){
    setRows(prev => {
      const next = prev.map((r, idx) => idx===i ? { ...r, ...patch } : r);
      return next;
    });
  }
  return (
    <div style={{marginTop:8}}>
      {rows.map((r, i) => {
        const has = !!(r.weight||r.reps||r.rpe||r.distance_m||r.duration_sec||r.notes);
        const hint = i===0 ? rows[0]._suggest : null;
        return (
          <React.Fragment key={i}>
            <div className="row" style={{gap:3, alignItems:'center', marginBottom:6, flexWrap:'nowrap', width:'100%', maxWidth:'100%'}}>
              <div style={{width:24, flex:'0 0 auto', fontSize:'12px', fontWeight:'600'}}>#{i+1}</div>
              {!isRun ? (
                <>
                  <input className="soft-input" style={{flex:'2 1 0', width:'auto', minWidth:0, maxWidth:'35%', fontSize:'16px', padding:'8px 6px'}} placeholder="Kg" value={r.weight||''} onChange={e=>update(i, {weight: e.target.value ? Number(e.target.value) : null})} />
                  <input className="soft-input" style={{flex:'2 1 0', width:'auto', minWidth:0, maxWidth:'35%', fontSize:'16px', padding:'8px 6px'}} placeholder="Reps" value={r.reps||''} onChange={e=>update(i, {reps: e.target.value ? Number(e.target.value) : null})} />
                  <input className="soft-input" style={{flex:'1 1 0', width:'auto', minWidth:0, maxWidth:'20%', fontSize:'16px', padding:'8px 4px'}} placeholder="RPE" value={r.rpe||''} onChange={e=>update(i, {rpe: e.target.value ? Number(e.target.value) : null})} />
                </>
              ) : (
                <>
                  <input className="soft-input" style={{flex:'2 1 0', width:'auto', minWidth:0, maxWidth:'40%', fontSize:'16px', padding:'8px 6px'}} placeholder="Distance" value={r.distance_m||''} onChange={e=>update(i, {distance_m: e.target.value ? Number(e.target.value) : null})} />
                  <input className="soft-input" style={{flex:'2 1 0', width:'auto', minWidth:0, maxWidth:'35%', fontSize:'16px', padding:'8px 6px'}} placeholder="Time" value={r.duration_sec||''} onChange={e=>update(i, {duration_sec: e.target.value ? Number(e.target.value) : null})} />
                  <input className="soft-input" style={{flex:'1 1 0', width:'auto', minWidth:0, maxWidth:'20%', fontSize:'16px', padding:'8px 4px'}} placeholder="RPE" value={r.rpe||''} onChange={e=>update(i, {rpe: e.target.value ? Number(e.target.value) : null})} />
                </>
              )}
              <div style={{width:12, flex:'0 0 auto', textAlign:'center', fontSize:'10px', color:'var(--ok)'}}>{has ? '✓' : ''}</div>
            </div>
            {/* Show suggestion hint below the row for better mobile layout */}
            {i===0 && hint && (
              <div style={{marginBottom:8, fontSize:'12px', color:'var(--muted)', paddingLeft:'40px'}}>
                {hint.type==='strength' && hint.deltaKg ? `Try ${formatKg((Number(r.weight)||0)+hint.deltaKg)} (+${hint.deltaKg}kg)` : null}
                {hint.type==='run' && hint.pct ? `Try ${Math.round((Number(r.distance_m)||0) * (1+hint.pct))}m (+${Math.round(hint.pct*100)}%)` : null}
              </div>
            )}
          </React.Fragment>
        )
      })}
      <div className="row workout-actions" style={{gap:8, marginTop:8}}>
        <button className="btn" onClick={()=>setRows(prev => [...prev, {}])} style={{minWidth:60}}>Add</button>
        <button className="btn" onClick={()=>setRows(prev => prev.length > 1 ? prev.slice(0,-1) : prev)} style={{minWidth:70}}>Remove</button>
        <button className="btn" onClick={()=>onSaveRows(rows)} style={{minWidth:60}}>Save</button>
      </div>
    </div>
  )
}

function prefillFrom(last, row, isRun){
  const r = { ...row };
  if (isRun) {
    r.distance_m = last.distance_m ?? r.distance_m;
    r.duration_sec = last.duration_sec ?? r.duration_sec;
    r.rpe = last.rpe ?? r.rpe;
  } else {
    r.weight = last.weight ?? r.weight;
    r.reps = last.reps ?? r.reps;
    r.rpe = last.rpe ?? r.rpe;
  }
  return r;
}

function progressPct(exercises, savedExIds){
  if (!exercises?.length) return 0;
  const n = exercises.length;
  const saved = Array.from(savedExIds || []).length;
  return Math.round((saved / n) * 100);
}

function formatMMSS(s){
  const x = Math.max(0, Number(s||0));
  const m = Math.floor(x/60); const ss = x%60;
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function computeSuggestion(recent, isRun){
  // recent is array sorted desc by date; use up to 2 items
  const a = recent[0];
  const b = recent[1];
  if (!a) return null;
  if (!isRun) {
    // strength logic
    const hitTarget = (r) => (r.reps != null && r.reps >= 5); // simple heuristic; can be tuned per exercise later
    const avgRpe = b ? ((Number(a.rpe||0)+Number(b.rpe||0))/2) : Number(a.rpe||0);
    if (hitTarget(a) && (!b || hitTarget(b)) && avgRpe && avgRpe <= 8) return { type:'strength', deltaKg: 2.5 };
    if ((a.rpe && a.rpe >= 9 && a.reps && a.reps < 5) || (b && b.rpe && b.rpe >= 9 && b.reps && b.reps < 5)) return { type:'strength', deltaKg: -2.5 };
    return null;
  }
  // run logic
  if (a.rpe != null) {
    if (a.rpe <= 7) return { type:'run', pct: 0.05 };
    if (a.rpe >= 9) return { type:'run', pct: -0.05 };
  }
  return null;
}

function formatKg(v){
  const n = Number(v||0);
  return (Math.round(n*10)/10).toFixed(1) + 'kg';
}


