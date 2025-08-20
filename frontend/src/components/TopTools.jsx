import React from 'react'
import Modal from './Modal.jsx'

export default function TopTools({ rearrange, setRearrange, weekOffset, setWeekOffset }) {
  const [openGuides, setOpenGuides] = React.useState(false);
  const [openProgram, setOpenProgram] = React.useState(false);

  return (
    <div>
      <div className="row" style={{gap:8, flexWrap:'wrap'}}>
        <button className="btn" style={{minHeight:44}} onClick={()=>setOpenGuides(true)} aria-label="Guides">Guides</button>
        <button className="btn" style={{minHeight:44}} onClick={()=>setOpenProgram(true)} aria-label="Program details">Program</button>
        <button
          className="btn"
          style={{
            minHeight:44, 
            fontWeight:700,
            ...(rearrange && {
              border: '2px solid var(--brand)',
              background: 'rgba(14, 124, 102, 0.1)',
              color: 'var(--brand)'
            })
          }}
          onClick={()=>setRearrange(v=>!v)}
          aria-pressed={rearrange}
          aria-label={rearrange ? 'Exit Rearrange mode' : 'Enter Rearrange mode'}
        >
          {rearrange ? 'Done' : 'Rearrange'}
        </button>
        {weekOffset !== 0 && (
          <button className="btn" style={{minHeight:44}} onClick={()=>setWeekOffset(0)} aria-label="Go to today">Today</button>
        )}
      </div>

      <Modal open={openGuides} onClose={()=>setOpenGuides(false)} title="Guides">
        <p className="muted">Tap a day to open the workout. Use Rearrange to move workouts with ▲/▼. Dates remain fixed.</p>
      </Modal>
      <Modal open={openProgram} onClose={()=>setOpenProgram(false)} title="Program details">
        <p className="muted">Cycle: 1–4 Accumulation. Emphasis on volume and technique. Progress by +2.5kg where RPE ≤8, or add 1–2 reps.</p>
      </Modal>
    </div>
  )
}


