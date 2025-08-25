import React, { useMemo, useState } from 'react'
import TrustBadge from '../components/TrustBadge.jsx'
import { nextTrustScore } from '../utils/trustScoreEngine.js
export default function Dashboard() {
  const [score, setScore] = useState(42)
  const [actions, setActions] = useState({ daysClean: 47, helpfulVotes: 5, reports: 0, infractions: 0 })
  const predicted = useMemo(() => nextTrustScore(score, actions), [score, actions])

  return (
    <div className="stack">
      <div className="card">
        <h1 className="h">Dashboard</h1>
        <p className="sub">Your privacy, your pace. Improve trust to unlock more identity reveal.</p>
        <div className="row"><TrustBadge score={score} /></div>
      </div>

      <div className="two">
        <div className="card">
          <h3 className="h" style={{fontSize:22}}>Adjust actions</h3>
          <div className="stack">
            <label>Days clean <input className="input" type="number" value={actions.daysClean}
              onChange={e => setActions(a => ({...a, daysClean: +e.target.value}))} /></label>
            <label>Helpful votes <input className="input" type="number" value={actions.helpfulVotes}
              onChange={e => setActions(a => ({...a, helpfulVotes: +e.target.value}))} /></label>
            <label>Reports <input className="input" type="number" value={actions.reports}
              onChange={e => setActions(a => ({...a, reports: +e.target.value}))} /></label>
            <label>Infractions <input className="input" type="number" value={actions.infractions}
              onChange={e => setActions(a => ({...a, infractions: +e.target.value}))} /></label>
            <label>Current score <input className="input" type="number" value={score}
              onChange={e => setScore(+e.target.value)} /></label>
          </div>
        </div>
        <div className="card">
          <h3 className="h" style={{fontSize:22}}>Prediction</h3>
          <p className="sub">Based on the inputs, the projected score would be:</p>
          <div className="h" style={{fontSize:36}}>{predicted}</div>
        </div>
      </div>
    </div>
  )
}
