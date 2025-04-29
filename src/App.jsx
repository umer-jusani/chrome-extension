import { getIndeedJobCollection } from "../public/indeed/getIndeedJobCollection";
import "./App.css";

function App() {
  const isLogged = true;

  const handleRedirection = async () => {

    let [tab] = await chrome.tabs.query({ active: true });

    if (tab.url?.includes("indeed.com")) {
      getIndeedJobCollection();
    } else {

      chrome.runtime.sendMessage({ action: "StartFlow" });


      // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // await chrome.scripting.executeScript({
      //   target: { tabId: tab.id },
      // });

      // chrome.runtime.sendMessage({
      //   action: "startFlow",
      // });
      // // await chrome.scripting.executeScript({
      // //   target: { tabId: tab.id },
      // //   files: [
      // //     "./linkedin/getJobCollectionScript.js",
      // //     "./linkedin/contentScript.js",
      // //   ],
      // // });
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
