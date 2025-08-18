import React from 'react'

const USERS_KEY = 'users:list';
const CURRENT_KEY = 'users:currentId';

function readUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') || []; } catch { return []; }
}
function writeUsers(arr){ localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
function readCurrent(){ const v = localStorage.getItem(CURRENT_KEY); return v ? Number(v) : null; }
function writeCurrent(id){ localStorage.setItem(CURRENT_KEY, String(id)); }

export default function UserSwitcher({ currentUserId, onChange }){
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState(() => {
    const list = readUsers();
    if (!list.length) {
      const seed = [{ id: 1, name: 'J Faye 247' }, { id: 2, name: 'P B 247' }];
      writeUsers(seed);
      if (readCurrent() == null) writeCurrent(1);
      return seed;
    }
    return list;
  });

  const current = users.find(u => u.id === currentUserId) || users[0];
  const boxRef = React.useRef(null);

  React.useEffect(() => {
    function onDocClick(e){
      if (!open) return;
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e){ if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onEsc); };
  }, [open]);

  function selectUser(id){
    writeCurrent(id);
    onChange && onChange(id);
    setOpen(false);
  }

  function addUser(){
    const name = prompt('New user name');
    if (!name) return;
    const nextId = users.length ? Math.max(...users.map(u=>u.id)) + 1 : 1;
    const next = [...users, { id: nextId, name: name.trim() }];
    setUsers(next); writeUsers(next); selectUser(nextId);
  }

  return (
    <div style={{position:'relative'}} ref={boxRef}>
      <button className="btn" onClick={()=>setOpen(o=>!o)} aria-haspopup="listbox" aria-expanded={open} style={{minHeight:44, fontWeight:700}}>
        {current ? current.name : 'Select user'}
      </button>
      {open && (
        <div role="listbox" className="card" style={{ position:'absolute', top:'calc(100% + 8px)', left:0, minWidth:200, zIndex:60 }}>
          {users.map(u => (
            <button key={u.id} className="btn" style={{display:'block', width:'100%', textAlign:'left', marginBottom:6}} onClick={()=>selectUser(u.id)}>
              {u.name}
            </button>
          ))}
          <button className="btn" onClick={addUser} style={{width:'100%'}}>+ Add user</button>
        </div>
      )}
    </div>
  )
}

export function getCurrentUserId(){
  const v = readCurrent();
  if (v != null) return v;
  const list = readUsers();
  const id = list.length ? list[0].id : 1;
  writeCurrent(id);
  return id;
}


