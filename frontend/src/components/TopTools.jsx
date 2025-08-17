import React from 'react'
import Modal from './Modal.jsx'

export default function TopTools({ rearrange, setRearrange }) {
  const [openGuides, setOpenGuides] = React.useState(false);
  const [openProgram, setOpenProgram] = React.useState(false);

  return (
    <div>
      <div className="row" style={{gap:12, flexWrap:'wrap'}}>
        <button className="btn" style={{minWidth:88, minHeight:44}} onClick={()=>setOpenGuides(true)}>Guides</button>
        <button className="btn" style={{minWidth:88, minHeight:44}} onClick={()=>setRearrange(v=>!v)} aria-pressed={rearrange}>{rearrange? 'Done' : 'Rearrange'}</button>
        <button className="btn" style={{minWidth:88, minHeight:44}} onClick={()=>setOpenProgram(true)}>Program details</button>
      </div>

      <Modal open={openGuides} onClose={()=>setOpenGuides(false)} title="Guides">
        <p className="muted">Tap a day to open the workout. Add sets as you go; they save instantly. Use Rearrange to reorder your week.</p>
      </Modal>
      <Modal open={openProgram} onClose={()=>setOpenProgram(false)} title="Program details">
        <p className="muted">Cycle: 1–4 Accumulation. Emphasis on volume and technique. Progress by +2.5kg where RPE ≤8, or add 1–2 reps.</p>
      </Modal>
    </div>
  )
}


