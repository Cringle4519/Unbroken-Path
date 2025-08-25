import React, { useMemo } from 'react'
import { trustLevelFromScore } from '../utils/revealLogic.js'

// Renders an avatar overlaid by the real image; reveals square cells depending on trust level.
export default function RevealViewer({ avatarUrl, realImageUrl, trustScore, gridSize = 8 }) {
  const level = trustLevelFromScore(trustScore)
  const fraction = [0, 0.25, 0.5, 0.75, 1][level]

  const cellsToReveal = useMemo(() => {
    const total = gridSize * gridSize
    return Math.round(total * fraction)
  }, [gridSize, fraction])

  const revealedIdx = useMemo(() => Array.from({length: cellsToReveal}, (_,i)=>i), [cellsToReveal])

  const containerStyle = { position:'relative', width:'100%', maxWidth: 520, margin:'0 auto' }
  const imgStyle = { width:'100%', borderRadius: 12, display:'block' }
  const overlayStyle = {
    position:'absolute', inset:0, display:'grid',
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
    gap: 0, borderRadius: 12, overflow:'hidden'
  }
  const cellStyle = { position:'relative' }
  const clipStyle = { position:'absolute', inset:0, background:'#0b0b0b', opacity:0.9 }

  return (
    <div className="stack">
      <div style={containerStyle}>
        <img src={avatarUrl} alt="avatar" style={imgStyle} />
        <div style={overlayStyle}>
          {Array.from({length: gridSize * gridSize}).map((_, idx) => (
            <div key={idx} style={cellStyle}>
              <img src={realImageUrl} alt="real"
                style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover'}} />
              {!revealedIdx.includes(idx) && <div style={clipStyle} />}
            </div>
          ))}
        </div>
      </div>
      <div className="muted">Trust score: {trustScore} → reveal fraction {(fraction*100).toFixed(0)}%</div>
    </div>
  )
}
