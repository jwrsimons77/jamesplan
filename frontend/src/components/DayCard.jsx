import React from 'react'

export default function DayCard({ day, index, rearrange, onOpen, metrics, onMoveUp, onMoveDown, canMoveUp, canMoveDown, isToday, hasExercises, completed, onToggleComplete, dateISO, allExercisesCompleted }) {
  const weekday = dateISO ? new Date(dateISO).toLocaleDateString(undefined, { weekday: 'long' }) : '';
  const shortDate = dateISO ? new Date(dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

  return (
    <div 
      className="daycard" 
      style={{
        opacity: day ? 1 : .5, 
        borderColor: isToday ? 'var(--brand)' : (allExercisesCompleted ? 'var(--brand)' : undefined), 
        boxShadow: isToday ? '0 0 0 1px rgba(14,124,102,0.35), 0 8px 24px rgba(0,0,0,0.25)' : (allExercisesCompleted ? '0 0 0 1px rgba(14,124,102,0.2), 0 4px 12px rgba(14,124,102,0.15)' : undefined),
        background: allExercisesCompleted ? 'rgba(14,124,102,0.05)' : undefined
      }}
    >
      {/* Header: Weekday + Date + Today pill */}
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div className="row" style={{gap:8, alignItems:'baseline'}}>
          <div className="muted" style={{fontSize:12, letterSpacing:0.2}}>{weekday}</div>
          <div className="pill" style={{padding:'2px 8px', fontSize:12}}>{shortDate}</div>
        </div>
        {isToday && (
          <span className="pill" style={{padding:'2px 8px', fontSize:12}}>Today</span>
        )}
      </div>

      {/* Title row: workout title (focus) + actions */}
      <div className="row" style={{justifyContent:'space-between', marginTop:8}}>
        <div>
          <div style={{fontWeight:800, fontSize:16}}>{day?.focus || day?.name || '—'}</div>
          <div className="muted" style={{fontSize:12, marginTop:2}}>{day?.name || ''}</div>
        </div>

        {rearrange ? (
          <div className="row" style={{gap:6}}>
            <ArrowButton direction="up" onClick={onMoveUp} disabled={!canMoveUp} />
            <ArrowButton direction="down" onClick={onMoveDown} disabled={!canMoveDown} />
          </div>
        ) : (
          <div className="row" style={{gap:8}}>
            {hasExercises && (
              <button
                className="btn"
                style={{minWidth:96, minHeight:44, fontWeight:700}}
                onClick={() => onOpen(day, dateISO)}
                aria-label={`Open ${weekday} workout`}
              >
                Open
              </button>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="row" style={{gap:16, marginTop:10, alignItems:'center'}}>
        <StatusCircle done={completed} onClick={onToggleComplete} />
        <Metric label="WEIGHT" value={metrics?.maxWeight != null ? String(metrics.maxWeight) : '—'} />
        <Metric label="SETS" value={metrics?.sets != null ? String(metrics.sets) : '—'} />
        <Metric label="TIME" value={formatDuration(metrics?.totalDurationSec)} />
      </div>
    </div>
  )
}

function ArrowButton({ direction, onClick, disabled }){
  const label = direction === 'up' ? 'Move up' : 'Move down';
  const glyph = direction === 'up' ? '▲' : '▼';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="btn"
      style={{
        height:44, width:44, padding:0,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        borderRadius:12,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {glyph}
    </button>
  );
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


