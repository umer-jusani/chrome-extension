import { useState } from 'react'
import './App.css'

function App() {


  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true })
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const applyButtons = document.getElementById("jobs-apply-button-id");
        let isEasyApply = applyButtons && applyButtons.innerText.includes("Easy Apply");

        if (isEasyApply) {
          applyButtons.click();
          const NextButton = document.querySelector('[data-easy-apply-next-button]');
          console.log(NextButton, "NextButton")
          NextButton.click();
        }
      }
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
