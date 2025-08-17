import React from 'react'

export default function DayCard({ day, index, rearrange, onOpen, metrics, draggableProps, isToday, hasExercises, completed, onToggleComplete }) {
  const dragHandle = rearrange ? (
    <span {...(draggableProps?.handleProps||{})} aria-hidden style={{cursor:'grab', userSelect:'none', marginRight:8}}>⠿</span>
  ) : null;

  return (
    <div className="card" style={{opacity: day ? 1 : .5, borderColor: isToday ? 'var(--brand)' : undefined, boxShadow: isToday ? '0 0 0 2px rgba(14,124,102,0.15)' : undefined}} {...(draggableProps?.containerProps||{})}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center'}}>
          {dragHandle}
          <div>
            <strong>{index+1}. {day?.name || '—'}</strong><br/>
            <small className="muted">{day?.focus || ''}</small>
            {isToday && (
              <div style={{marginTop:4}}>
                <button className="pill" onClick={() => onOpen(day)} style={{padding:'2px 8px', fontSize:12}}>Today</button>
              </div>
            )}
          </div>
        </div>
        {!rearrange && (
          <div className="row" style={{gap:8}}>
            {hasExercises && <button className="btn" style={{minWidth:88, minHeight:44}} onClick={() => onOpen(day)}>Open</button>}
          </div>
        )}
      </div>

      <div className="row" style={{gap:16, marginTop:8, alignItems:'center'}}>
        <StatusCircle done={completed} onClick={onToggleComplete} />
        <Metric label="WEIGHT" value={metrics?.maxWeight != null ? String(metrics.maxWeight) : '—'} />
        <Metric label="SETS" value={metrics?.sets != null ? String(metrics.sets) : '—'} />
        <Metric label="TIME" value={formatDuration(metrics?.totalDurationSec)} />
      </div>
    </div>
  )
}

function Metric({ label, value }){
  return (
    <div>
      <div className="muted" style={{fontSize:12}}>{label}</div>
      <div style={{fontWeight:700}}>{value}</div>
    </div>
  )
}

function StatusCircle({ done, onClick }){
  const style = {
    height: 24,
    width: 24,
    borderRadius: '50%',
    border: done ? '2px solid var(--brand)' : '2px solid var(--line)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: done ? 'rgba(14,124,102,0.15)' : 'transparent',
    color: done ? 'var(--brand-ink)' : 'transparent',
    cursor: 'pointer'
  };
  return <div role="button" onClick={onClick} aria-label={done ? 'Completed' : 'Not completed'} style={style}>{done ? '✓' : '✓'}</div>;
}

function formatDuration(totalSeconds){
  const s = Number(totalSeconds || 0);
  if (!s) return '—';
  const m = Math.round(s / 60);
  return `${m}m`;
}


