import React from 'react'

const sample = [
  { id: 1, name: 'Early Recovery Circle', members: 12, identityLevel: 1, lastActivity: '2h ago' },
  { id: 2, name: 'Trauma Healing Group', members: 8, identityLevel: 2, lastActivity: '47m ago' },
  { id: 3, name: 'Relapse Prevention', members: 21, identityLevel: 1, lastActivity: '5m ago' }
]

export default function Groups() {
  return (
    <div className="stack">
      <div className="card">
        <h1 className="h">Groups</h1>
        <p className="sub">Join or create groups. Each group has a required identity level.</p>
      </div>
      <div className="grid">
        {sample.map(g => (
          <div key={g.id} className="card">
            <div className="row">
              <div style={{fontWeight:700}}>{g.name}</div>
              <div className="spacer" />
              <div className="pill">Members: {g.members}</div>
              <div className="pill">Identity Lvl: {g.identityLevel}</div>
            </div>
            <div className="muted">Last activity: {g.lastActivity}</div>
            <button className="btn" style={{marginTop:12}}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}
