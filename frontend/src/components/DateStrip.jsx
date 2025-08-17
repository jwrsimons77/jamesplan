import React from 'react'

function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun..6=Sat
  const diff = (day + 6) % 7 // days since Monday
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() - diff)
  return d
}

export default function DateStrip({ selectedDate, onSelect }) {
  const start = getStartOfWeek(selectedDate || new Date())
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const labels = ['M','T','W','T','F','S','S']

  return (
    <div className="row" style={{gap:10, overflowX:'auto', paddingBottom:8}}>
      {days.map((d, i) => {
        const isActive = selectedDate && d.toDateString() === selectedDate.toDateString()
        return (
          <button
            key={i}
            className={"chip" + (isActive ? ' active' : '')}
            onClick={() => onSelect && onSelect(new Date(d))}
            aria-pressed={isActive}
            style={{minWidth:48}}
          >
            <div style={{fontSize:12, opacity:.8}}>{labels[i]}</div>
            <div style={{fontWeight:700}}>{d.getDate()}</div>
          </button>
        )
      })}
    </div>
  )
}


