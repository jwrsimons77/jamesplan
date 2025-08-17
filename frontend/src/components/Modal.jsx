import React from 'react'

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed', inset:0, zIndex:50}} aria-modal="true" role="dialog">
      <div onClick={onClose} style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.25)'}}></div>
      <div className="card" style={{position:'absolute', left:12, right:12, bottom:12, borderRadius:16, padding:16, background:'#fff'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <strong>{title}</strong>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div style={{marginTop:8}}>
          {children}
        </div>
      </div>
    </div>
  )
}


