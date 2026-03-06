// Dashboard.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import { connectMQTT } from "./mqtt";
import "./index.css";

export default function Dashboard() {
  const [heaterTemp, setHeaterTemp] = useState(0);
  const [coolsideTemp, setCoolsideTemp] = useState(0);
  const [outsideTemp, setOutsideTemp] = useState(0);
  const [heaterState, setHeaterState] = useState("OFF");
  const [wifiState, setWifiState] = useState("UNKNOWN");
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [firebaseState, setFirebaseState] = useState("UNKNOWN");
  const [targetTemp, setTargetTemp] = useState(0);
  const [rssi, setRssi] = useState(0);

  const getRSSIQuality = (
    rssi: number | undefined,
  ): { label: string; color: "success" | "warning" | "error" } => {
    if (rssi === undefined || rssi === null || isNaN(rssi)) {
      return { label: "Unknown", color: "error" };
    }
    if (rssi > -50) return { label: "Excellent", color: "success" };
    if (rssi > -60) return { label: "Good", color: "success" };
    if (rssi > -70) return { label: "Fair", color: "warning" };
    return { label: "Poor", color: "error" };
  };

  useEffect(() => {
    const heaterTempRef = ref(db, "system/status/heater/currentTemp");
    //  const heaterStateRef = ref(db, "system/status/heater/state");
    const coolsideRef = ref(db, "system/status/sensors/coolside");
    const outsideRef = ref(db, "system/status/sensors/outside");
    const wifiRef = ref(db, "system/status/wifi/state");
    const targetTempRef = ref(db, "system/status/heater/targetTemp");

    onValue(heaterTempRef, (snap) => {
      const val = snap.val() || 0;
      console.log("Heater temp from Firebase:", val);
      setHeaterTemp(val);
    });
    // onValue(heaterStateRef, (snap) => setHeaterState(snap.val() || "OFF"));
    onValue(coolsideRef, (snap) => {
      const val = snap.val() || 0;
      console.log("Coolside temp from Firebase:", val);
      setCoolsideTemp(val);
    });
    onValue(outsideRef, (snap) => {
      const val = snap.val() || 0;
      console.log("Outside temp from Firebase:", val);
      setOutsideTemp(val);
    });
    onValue(wifiRef, (snap) => setWifiState(snap.val() || "UNKNOWN"));
    onValue(targetTempRef, (snap) => setTargetTemp(snap.val() || 0));
    onValue(ref(db, "system/status/wifi/rssi"), (snap) => {
      setRssi(snap.val() || 0);
    });
  }, []);

  useEffect(() => {
    connectMQTT((topic, message) => {
      if (topic === "tortoise/status") {
        // Check if it's a full status message (has system object)
        if (message.system && typeof message.system === "object") {
          // Update MQTT status from ESP32's perspective
          if (message.mqtt && message.mqtt.state === "CONNECTED") {
            setDeviceOnline(true);
          } else {
            setDeviceOnline(false);
          }

          // Update WiFi status from MQTT message if available
          if (message.wifi && message.wifi.state) {
            setWifiState(message.wifi.state);
          }

          // Update RSSI from MQTT message if available
          if (message.wifi && message.wifi.rssi) {
            setRssi(message.wifi.rssi);
            console.log("Received RSSI from MQTT:", message.wifi.rssi);
          }

          // Update Firebase status from MQTT message if available
          if (message.firebase && message.firebase.state) {
            setFirebaseState(message.firebase.state);
          }

          // Update Heater state from MQTT message if available
          if (message.heater && message.heater.state) {
            setHeaterState(message.heater.state);
          }

          // Update Target temperature from MQTT message if available
          if (message.heater && message.heater.targetTempC) {
            setTargetTemp(message.heater.targetTempC);
          }
        } else if (message.online !== undefined) {
          // Simple online/offline message (LWT or heartbeat)
          setDeviceOnline(message.online);
          // If device goes offline, WiFi, Firebase, and Heater are disconnected
          if (!message.online) {
            setWifiState("DISCONNECTED");
            setFirebaseState("DISCONNECTED");
            setHeaterState("OFF");
          }
        }
      }
    });
  }, []);

  return (
    <div style={styles.container}>
      <div
        style={{
          paddingLeft: "100px",
          marginRight: "100px",
          fontFamily: "Arial",
        }}
      >
        <div className="menueBar">
          <Link to="/settings">Settings</Link>
          <Link to="/coolsideChart">Coolside Chart</Link>
        </div>
      </div>
      <div
        style={{ height: "50px", marginLeft: "100px", marginRight: "100px" }}
      >
        <div
          style={{
            fontSize: 24,
            border: "1px solid #8b949e",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#26a61a",
          }}
        >
          Tortoise Heater Control Panel
        </div>
      </div>
      {/* <h1 style={styles.title}>Tortoise Heater Control Panel</h1> */}

      <div style={styles.cardContainer}>
        <TempCard title="Coolside" value={coolsideTemp} />
        <TempCard title="Outside" value={outsideTemp} />
        <div
          style={{
            color: heaterState === "ON" ? "red" : "green",
            padding: 20,
            borderRadius: 50,
            width: 150,
          }}
        >
          <div style={{ fontSize: 18, color: "#8b949e" }}>Heater</div>
          <div style={{ fontSize: 32, marginTop: 10 }}>
            {heaterTemp.toFixed(1)}°
          </div>
        </div>
        {/* <TempCard title="Heater" value={heaterTemp} /> */}
      </div>

      {/* Status indicators box - adjust marginTop to move all indicators up/down together */}
      <div
        style={{
          backgroundColor: "#121314",
          paddingLeft: "90px",
          paddingRight: "20px",
          paddingTop: "20px",
          paddingBottom: "20px",
          borderRadius: "10px",
          marginTop: "20px", // Adjust this to move the entire box up/down
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "30px",
            fontSize: "15px",
            alignItems: "flex-start",
          }}
        >
          {/* Left column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div
              style={{
                fontSize: "20px",
                color: "#f4eeee",
                border: "1px solid #8b949e",
                padding: "5px",
                borderRadius: "15px",
                backgroundColor: heaterState === "ON" ? "red" : "green",
              }}
            >
              Heater Status:
              <span
                style={{
                  color: heaterState === "ON" ? "yellow" : "white",
                  marginLeft: "10px",
                  fontSize: "15px",
                }}
              >
                {heaterState}
              </span>
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#f3f6f8",
                border: "1px solid #8b949e",
                padding: "5px",
                borderRadius: "15px",
                // backgroundColor: deviceOnline "ON" ? "orange" : "green",
                backgroundColor: deviceOnline ? "green" : "orange",
              }}
            >
              MQTT:
              <span
                style={{
                  color: deviceOnline ? "yellow" : "red",
                  marginLeft: "10px",
                }}
              >
                {deviceOnline ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
          </div>

          {/* Right column */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div
              style={{
                fontSize: "20px",
                color: "#f5f7f9",
                border: "1px solid #8b949e",
                padding: "5px",
                borderRadius: "15px",
                backgroundColor: wifiState === "CONNECTED" ? "green" : "orange",
              }}
            >
              WiFi:
              <span
                style={{
                  color: wifiState === "CONNECTED" ? "yellow" : "red",
                  marginLeft: "10px",
                }}
              >
                {wifiState}
              </span>
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#f1f5f9",
                border: "1px solid #8b949e",
                padding: "5px",
                borderRadius: "15px",
                backgroundColor:
                  firebaseState === "CONNECTED" ? "green" : "orange",
              }}
            >
              Firebase:
              <span
                style={{
                  color: firebaseState === "CONNECTED" ? "yellow" : "red",
                  marginLeft: "10px",
                }}
              >
                {firebaseState}
              </span>
            </div>
          </div>
        </div>

        {/* Target temperature display */}
        <div
          style={{
            marginTop: "20px",
            marginLeft: "90px",
            fontSize: "20px",
            color: "#f9fbfd",
            border: "1px solid #8b949e",
            paddingLeft: "50px",
            paddingRight: "50px",
            padding: "5px",
            borderRadius: "15px",
            backgroundColor: heaterState === "ON" ? "red" : "green",
            width: "fit-content",
          }}
        >
          Target Temperature:
          <span
            style={{
              color: heaterState === "ON" ? "yellow" : "white",
              marginLeft: "10px",
              fontSize: "15px",
            }}
          >
            {targetTemp}°
          </span>
        </div>

        {/* WiFi Signal Strength (RSSI) display */}
        <div
          style={{
            marginTop: "20px",
            marginLeft: "30px",
            fontSize: "20px",
            color: "#f6f7f8",
            border: "1px solid #8b949e",
            padding: "5px",
            paddingRight: "10px",
            borderRadius: "15px",
            backgroundColor:
              getRSSIQuality(rssi).color === "success"
                ? "green"
                : getRSSIQuality(rssi).color === "warning"
                  ? "orange"
                  : "red",
            width: "400px",
          }}
        >
          <div>
            WiFi Signal:
            <span
              style={{
                color:
                  getRSSIQuality(rssi).color === "success"
                    ? "yellow"
                    : getRSSIQuality(rssi).color === "warning"
                      ? "white"
                      : "yellow",
                marginLeft: "20px",
                fontSize: "20px",
              }}
            >
              {rssi} dBm ({getRSSIQuality(rssi).label})
            </span>
          </div>

          {/* Signal strength bar */}
          <div
            style={{
              width: "90%",
              height: "20px",
              backgroundColor: "#2d333b",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid #444c56",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(0, Math.min(100, (rssi + 100) * 1.43))}%`,
                backgroundColor:
                  getRSSIQuality(rssi).color === "success"
                    ? "#00ff00"
                    : getRSSIQuality(rssi).color === "warning"
                      ? "#ffaa00"
                      : "#ff0000",
                transition: "width 0.3s ease",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TempCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value.toFixed(1)}°</div>
    </div>
  );
}

const styles = {
  container: {
    border: "1px solid #8b949e",
    backgroundColor: "#0d1117",
    minHeight: "100vh",
    color: "white",
    padding: "100px 0px 100px 0",
    fontFamily: "Arial",
    marginRight: "100px",
  },

  title: {
    marginBottom: 30,
    marginLeft: 50,
  },

  cardContainer: {
    display: "flex",
    marginTop: 60,
    marginLeft: 50,
    gap: 30,
  },

  card: {
    backgroundColor: "#060c18",
    padding: 20,
    borderRadius: 50,
    width: 150,
  },

  cardTitle: {
    fontSize: 18,
    color: "#8b949e",
  },

  cardValue: {
    fontSize: 32,
    marginTop: 10,
  },
};
