import "./App.css";

function App() {
  const isLogged = true;

  const onClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"],
    });
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
            <button onClick={onClick}>Start Auto Applying</button>
          ) : (
            <>
              <button onClick={onClick}>Login</button>
              <button onClick={onClick}>Signup</button>
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
