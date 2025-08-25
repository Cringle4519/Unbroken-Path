import React from 'react'
import { trustLevelFromScore } from '../utils/revealLogic.js'

export default function TrustBadge({ score }) {
  const lvl = trustLevelFromScore(score)
  const labels = ['0%', '25%', '50%', '75%', '100%']
  const label = labels[lvl] || '0%'
  return (
    <div className="row" style={{gap:10,alignItems:'center'}}>
      <div className="badge">Trust: {score}</div>
      <div className="pill">Reveal level: {label}</div>
    </div>
  )
}
