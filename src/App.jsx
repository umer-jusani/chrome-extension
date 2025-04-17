import { useState } from 'react'
import './App.css'

function App() {

  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    })
  }

  return (
    <>
      <h1>Jobbee</h1>
      <button className="btn" onClick={onClick}>Start Applying Job</button>
    </>
  )
}

export default App
