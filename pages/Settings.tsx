import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref, set, onValue } from "firebase/database";
import { db } from "../src/firebase";

export default function Settings() {
  const [amEnabled, setAmEnabled] = useState(false);
  const [amTime, setAmTime] = useState("11:00");
  const [amTemp, setAmTemp] = useState(30);

  const [pmEnabled, setPmEnabled] = useState(false);
  const [pmTime, setPmTime] = useState("22:00");
  const [pmTemp, setPmTemp] = useState(13);

  function saveSchedule() {
    set(ref(db, "React/schedule"), {
      amEnabled,
      amScheduledTime: amTime,
      amTemperature: amTemp,

      pmEnabled,
      pmScheduledTime: pmTime,
      pmTemperature: pmTemp,
      lastUpdated: Date.now(),
    });

    alert("Schedule saved successfully");
  }

  useEffect(() => {
    const scheduleRef = ref(db, "React/schedule");

    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setAmEnabled(data.amEnabled ?? false);
        setAmTime(data.amScheduledTime ?? "07:00");
        setAmTemp(data.amTemperature ?? 28);

        setPmEnabled(data.pmEnabled ?? false);
        setPmTime(data.pmScheduledTime ?? "19:00");
        setPmTemp(data.pmTemperature ?? 27);

        console.log("Loaded schedule from Firebase");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ paddingLeft: "200px", fontFamily: "Arial" }}>
      <Link to="/">Dashboard</Link>
      <div style={{ height: "50px", marginLeft: "50px" }}>
        <h1>Settings</h1>
      </div>
      <div style={{ height: "50px", marginLeft: "50px" }}>
        <h2>Temperature Schedule</h2>
      </div>
      {/* Morning */}
      <div className="card">
        <h3>Morning Schedule</h3>

        <label>
          Enable
          <input
            type="checkbox"
            checked={amEnabled}
            onChange={(e) => setAmEnabled(e.target.checked)}
          />
        </label>

        <div>
          Time:
          <input
            type="time"
            value={amTime}
            disabled={!amEnabled}
            onChange={(e) => setAmTime(e.target.value)}
          />
        </div>

        <div>
          Temperature:
          <input
            type="number"
            value={amTemp}
            disabled={!amEnabled}
            onChange={(e) => setAmTemp(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Evening */}
      <div className="card">
        <h3>Evening Schedule</h3>

        <label>
          Enable
          <input
            type="checkbox"
            checked={pmEnabled}
            onChange={(e) => setPmEnabled(e.target.checked)}
          />
        </label>

        <div>
          Time:
          <input
            type="time"
            value={pmTime}
            disabled={!pmEnabled}
            onChange={(e) => setPmTime(e.target.value)}
          />
        </div>

        <div>
          Temperature:
          <input
            type="number"
            value={pmTemp}
            disabled={!pmEnabled}
            onChange={(e) => setPmTemp(Number(e.target.value))}
          />
        </div>
      </div>

      <button onClick={saveSchedule}>Save Schedule</button>
    </div>
  );
}
