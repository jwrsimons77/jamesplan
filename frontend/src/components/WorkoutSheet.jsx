import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiGet, PlanApi } from '../services/api'

const QUEUE_KEY = 'queuedSets';
function readQueue(){ try { return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')||[] } catch { return [] } }
function writeQueue(arr){ localStorage.setItem(QUEUE_KEY, JSON.stringify(arr)); }

export default function WorkoutSheet({ day, logId: initialLogId, onClose, onSetAdded, onEnsureLog }){
  const [exercises, setExercises] = useState([]);
  const [logId, setLogId] = useState(initialLogId || null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const [savedExIds, setSavedExIds] = useState(() => new Set());
  

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
    const today = new Date().toISOString().slice(0,10);
    const log = await PlanApi.startLog(day.id, today);
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
      <div className="card" style={{position:'absolute', left:0, right:0, bottom:0, borderTopLeftRadius:20, borderTopRightRadius:20, padding:12, background:'#fff', maxHeight:'88vh', overflow:'auto', maxWidth:680, margin:'0 auto'}}>
        <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
          <div className="row" style={{gap:10}}>
            {letters.map((ch, i) => (
              <button
                key={i}
                className={'pill'}
                aria-pressed={i===activeIndex}
                style={{
                  background: i===activeIndex ? 'rgba(14,124,102,0.15)' : 'var(--chip)',
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  minWidth:36, minHeight:36, padding:'0 10px',
                  fontSize:13, fontWeight:700, letterSpacing:'0.02em'
                }}
                onClick={()=>{
                  setActiveIndex(i);
                  const el = document.getElementById('ex-'+i);
                  if (el && el.scrollIntoView) el.scrollIntoView({behavior:'smooth', block:'start'});
                }}
              >{ch}</button>
            ))}
          </div>
          <button className="btn" onClick={onClose} style={{minWidth:88}}>Close</button>
        </div>

        <div ref={listRef} style={{marginTop:8, maxHeight:'72vh', overflow:'auto', paddingRight:4}}>
          {exercises.map((ex, i) => (
            <div key={ex.id} id={'ex-'+i} className="card" style={{marginBottom:10, background:'#fafafa'}}>
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
                onSaveRows={(rows)=>saveExercise(ex, rows)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SetTable({ exercise, onSaveRows }){
  const [rows, setRows] = useState([{},{},{},{}]);
  const [saved, setSaved] = useState({}); // {rowIndex: true}
  const isRun = exercise.modality === 'run';
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
        return (
          <div key={i} className="row" style={{gap:8, alignItems:'center', marginBottom:8, flexWrap: isRun ? 'nowrap' : 'wrap'}}>
            <div style={{width:36, flex:'0 0 auto'}}>#{i+1}</div>
            {!isRun && <input className="soft-input" style={{flex:'1 1 0', minWidth:78}} placeholder="Weight (kg)" value={r.weight||''} onChange={e=>update(i, {weight: e.target.value ? Number(e.target.value) : null})} />}
            {!isRun && <input className="soft-input" style={{flex:'1 1 0', minWidth:78}} placeholder="Reps" value={r.reps||''} onChange={e=>update(i, {reps: e.target.value ? Number(e.target.value) : null})} />}
            <input className="soft-input" style={{flex:'1 1 0', minWidth:78}} placeholder="RPE" value={r.rpe||''} onChange={e=>update(i, {rpe: e.target.value ? Number(e.target.value) : null})} />
            {isRun && <input className="soft-input" style={{width:78}} placeholder="Distance (m)" value={r.distance_m||''} onChange={e=>update(i, {distance_m: e.target.value ? Number(e.target.value) : null})} />}
            {isRun && <input className="soft-input" style={{width:78}} placeholder="Duration (sec)" value={r.duration_sec||''} onChange={e=>update(i, {duration_sec: e.target.value ? Number(e.target.value) : null})} />}
            <div style={{marginLeft:8, flex:'0 0 20px', textAlign:'right'}}>{has ? '✓' : ''}</div>
          </div>
        )
      })}
      <div className="row" style={{gap:8, marginTop:8}}>
        <button className="btn" onClick={()=>setRows(prev => [...prev, {}])} style={{minWidth:96}}>Add set</button>
        <button className="btn" onClick={()=>setRows(prev => prev.length > 1 ? prev.slice(0,-1) : prev)} style={{minWidth:96}}>Remove set</button>
        <div style={{flex:1}} />
        <button className="btn" onClick={()=>onSaveRows(rows)} style={{minWidth:120}}>Save exercise</button>
      </div>
    </div>
  )
}


