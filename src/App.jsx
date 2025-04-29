import { useState } from "react";
import { getIndeedJobCollection } from "../public/indeed/getIndeedJobCollection";
import "./App.css";

function App() {
  const isLogged = true;
  const [error, setError] = useState(null);

  const handleRedirection = async () => {
    let [tab] = await chrome.tabs.query({ active: true });

    if (tab.url?.includes("indeed.com")) {
      getIndeedJobCollection();
    } else {
      if (
        !tab.url?.includes(
          "https://www.linkedin.com/jobs/collections/recommended"
        )
      ) {
        setError("Please go to this path /jobs/collections/recommended");
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          "./linkedin/getJobCollectionScript.js",
          "./linkedin/contentScript.js",
        ],
      });
    }
  };

  return (
    <>
      <div>
        <img
          src={
            "https://master.d337x6ro71a0no.amplifyapp.com/_next/static/media/headerIcon.774021f0.svg"
          }
          className="logo react"
        />
      </div>
      <div className="card">
        <div className="card-buttons">
          {isLogged ? (
            <button onClick={handleRedirection}>Start Auto Applying</button>
          ) : (
            <>
              <button onClick={handleRedirection}>Login</button>
              <button onClick={handleRedirection}>Signup</button>
            </>
          )}
        </div>
        <p>Boost Your Resume With AI And Apply To Jobs In One Click!</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <a
        href="https://master.d337x6ro71a0no.amplifyapp.com/"
        className="read-the-docs"
      >
        Click here to learn more
      </a>
    </>
  );
}

export default App;
