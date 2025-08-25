import React, { useState } from 'react'
import RevealViewer from '../components/RevealViewer.jsx'

export default function Profile() {
  const [score, setScore] = useState(50)
  const [avatarUrl, setAvatarUrl] = useState('https://picsum.photos/seed/avatar/640/480')
  const [realUrl, setRealUrl] = useState('https://picsum.photos/seed/real/640/480')

  return (
    <div className="stack">
      <div className="card">
        <h1 className="h">Profile</h1>
        <p className="sub">Preview how others see you at your current Trust Score.</p>
        <div className="row">
          <label>Trust Score <input className="input" type="number" value={score} onChange={e => setScore(+e.target.value)} /></label>
        </div>
      </div>
      <div className="two">
        <div className="card">
          <h3 className="h" style={{fontSize:22}}>Images</h3>
          <label>Avatar URL <input className="input" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} /></label>
          <label>Real Image URL <input className="input" value={realUrl} onChange={e=>setRealUrl(e.target.value)} /></label>
        </div>
        <div className="card">
          <RevealViewer avatarUrl={avatarUrl} realImageUrl={realUrl} trustScore={score} gridSize={10} />
        </div>
      </div>
    </div>
  )
}
