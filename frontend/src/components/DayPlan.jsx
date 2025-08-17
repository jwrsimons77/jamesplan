import React, { useEffect, useState } from 'react'
import { apiGet } from '../services/api'

export default function DayPlan({ day, onPickExercise }) {
  const [exercises, setExercises] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdLogId, setCreatedLogId] = useState(null);

  useEffect(() => {
    if (!open) return;
    apiGet(`/api/plan-days/${day.id}/exercises`).then(setExercises);
  }, [open, day.id]);

  async function startLog() {
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0,10);
      const res = await fetch(localStorage.getItem('apiBase') + '/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_day_id: day.id, date: today })
      });
      const log = await res.json();
      setCreatedLogId(log.id);
    } finally {
      setSaving(false);
    }
  }

  const sections = React.useMemo(() => {
    const group = { warmup: [], strength: [], accessories: [] };
    exercises.forEach((ex) => {
      const name = (ex.name || '').toLowerCase();
      if (ex.modality === 'run' || name.includes('warm')) group.warmup.push(ex);
      else if (name.includes('curl') || name.includes('raise') || name.includes('accessory') || name.includes('fly')) group.accessories.push(ex);
      else group.strength.push(ex);
    })
    return group;
  }, [exercises])

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div>
          <strong>{day.day_number}. {day.name}</strong><br/>
          <small className="muted">{day.focus}</small>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setOpen(v => !v)}>{open ? 'Hide' : 'View'}</button>
          <button className="btn" onClick={startLog} disabled={saving}>{saving ? 'Starting…' : 'Start Today\'s Log'}</button>
        </div>
      </div>

      {open && (
        <div style={{marginTop:12}}>
          {['warmup','strength','accessories'].map((key, idx) => (
            sections[key].length ? (
              <div key={key} className="card" style={{marginBottom:10, background:'#fafafa'}}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="pill">{String.fromCharCode(65+idx)}</div>
                    <strong style={{textTransform:'capitalize'}}>{key.replace('warmup','Warm Up')}</strong>
                  </div>
                </div>
                <div style={{marginTop:8}}>
                  {sections[key].map((ex, i) => (
                    <div key={ex.id} className="card" style={{marginBottom:8}}>
                      <div className="row" style={{justifyContent:'space-between'}}>
                        <div>
                          <strong>{i+1}. {ex.name}</strong><br/>
                          <small className="muted">{ex.notes}</small>
                        </div>
                        <div className="row">
                          <button className="btn" onClick={() => onPickExercise(ex)}>View Progress</button>
                        </div>
                      </div>
                      {createdLogId && <SetQuickAdd logId={createdLogId} exercise={ex} />}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}

function SetQuickAdd({ logId, exercise }) {
  const [setNumber, setSetNumber] = React.useState(1);
  const [weight, setWeight] = React.useState('');
  const [reps, setReps] = React.useState('');
  const [rpe, setRpe] = React.useState('');
  const [distance, setDistance] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(localStorage.getItem('apiBase') + `/api/logs/${logId}/sets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          set_number: Number(setNumber),
          weight: weight ? Number(weight) : null,
          reps: reps ? Number(reps) : null,
          rpe: rpe ? Number(rpe) : null,
          distance_m: distance ? Number(distance) : null,
          duration_sec: duration ? Number(duration) : null,
          notes
        })
      });
      setSetNumber(n => n + 1);
      setWeight(''); setReps(''); setRpe(''); setDistance(''); setDuration(''); setNotes('');
    } finally {
      setSaving(false);
    }
  }

  const isRun = exercise.modality === 'run';
  return (
    <div style={{marginTop:8}}>
      <div className="row">
        <input placeholder="Set #" value={setNumber} onChange={e=>setSetNumber(e.target.value)} style={{width:70}} />
        {!isRun && <input placeholder="Weight (kg)" value={weight} onChange={e=>setWeight(e.target.value)} style={{width:120}} />}
        {!isRun && <input placeholder="Reps" value={reps} onChange={e=>setReps(e.target.value)} style={{width:100}} />}
        <input placeholder="RPE" value={rpe} onChange={e=>setRpe(e.target.value)} style={{width:90}} />
        {isRun && <input placeholder="Distance (m)" value={distance} onChange={e=>setDistance(e.target.value)} style={{width:140}} />}
        {isRun && <input placeholder="Duration (sec)" value={duration} onChange={e=>setDuration(e.target.value)} style={{width:140}} />}
        <input placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} style={{flex:1}} />
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Add Set'}</button>
      </div>
    </div>
  );
}
