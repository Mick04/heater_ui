import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import Dashboard from "./Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sign in anonymously when the app loads
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in anonymously");
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        setError(error.message);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h1>Authenticating...</h1>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;

// import { useEffect, useState } from "react";
// import { db } from "./firebase";
// import { ref, onValue } from "firebase/database";

// function App() {
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     const statusRef = ref(db, "system/status");

//     const unsubscribe = onValue(statusRef, (snapshot) => {
//       const value = snapshot.val();

//       console.log("Firebase update:", value);

//       setData(value);
//     });

//     // Cleanup function to unsubscribe when component unmounts
//     return () => unsubscribe();
//   }, []);

//   if (!data) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div style={styles.container}>
//       <h1>Tortoise Heater Control Panel</h1>

//       <div style={styles.grid}>
//         <StatusCard title="Heater State" value={data.heater.state} />
//         <StatusCard title="WiFi" value={data.wifi.state} />
//         <StatusCard title="MQTT" value={data.mqtt.state} />
//         <StatusCard
//           title="Target Temp"
//           value={data.heater.targetTempC + " °C"}
//         />

//         <StatusCard title="Heater Temp" value={data.sensors.heater + " °C"} />
//         <StatusCard
//           title="Coolside Temp"
//           value={data.sensors.coolside + " °C"}
//         />
//         <StatusCard title="Outside Temp" value={data.sensors.outside + " °C"} />

//         <StatusCard title="System State" value={data.system.state} />
//         <StatusCard title="Last Update" value={data.system.lastUpdate} />
//       </div>
//     </div>
//   );

// }

// export default App;

// function StatusCard({ title, value }: any) {
//   return (
//     <div style={styles.card}>
//       <div style={styles.cardTitle}>{title}</div>

//       <div style={styles.cardValue}>{value}</div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     fontFamily: "Arial",
//     padding: "20px",
//     backgroundColor: "#f4f6f8",
//     minHeight: "100vh",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//     gap: "20px",
//     marginTop: "20px",
//   },

//   card: {
//     backgroundColor: "white",
//     padding: "20px",
//     borderRadius: "10px",
//     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//   },

//   cardTitle: {
//     fontSize: "14px",
//     color: "#666",
//   },

//   cardValue: {
//     fontSize: "24px",
//     fontWeight: "bold",
//     marginTop: "10px",
//   },
// };
