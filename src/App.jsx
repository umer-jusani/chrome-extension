import { useEffect, useState } from "react";
import { getIndeedJobCollection } from "../public/indeed/getIndeedJobCollection";
import "./App.css";
import LinkedInIcon from "../src/assets/linkedinIcon.png";
import IndeedIcon from "../src/assets/indeedIcon.png";

function App() {
  const [platformsActive, setPlatformsActive] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("accessToken", (result) => {
      if (result.accessToken) {
        setIsLogged(true);
      }
    });
  }, []);

  const [error, setError] = useState(null);

  const handleRedirection = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    if (tab.url?.includes("indeed.com")) {
      getIndeedJobCollection();
    } else if (tab.url?.includes("linkedin.com")) {
      if (!tab.url?.includes("https://www.linkedin.com/jobs/collections")) {
        chrome.tabs.update(tab.id, {
          url: "https://www.linkedin.com/jobs/collections",
        });
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          "./linkedin/getJobCollectionScript.js",
          "./linkedin/contentScript.js",
        ],
      });
    } else {
      setPlatformsActive(true);
    }
  };

  const handleLogin = async () => {
    chrome.tabs.create({ url: "http://localhost:3000/login" });
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
              <button onClick={handleLogin}>Login</button>
              <button onClick={handleLogin}>Signup</button>
            </>
          )}
        </div>
        <p>Boost Your Resume With AI And Apply To Jobs In One Click!</p>
      </div>
      <div
        style={{
          display: platformsActive ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p>Apply on!</p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBlock: "10px",
          }}
        >
          <img src={LinkedInIcon} alt="logo" width={30} height={30} />
          <img src={IndeedIcon} alt="logo" width={30} height={30} />
        </div>
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
