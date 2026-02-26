import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

function App() {
  const [heaterTemp, setHeaterTemp] = useState(0);
  const [coolTemp, setCoolTemp] = useState(0);
  const [outsideTemp, setOutsideTemp] = useState(0);

  useEffect(() => {
    const sensorsRef = ref(db, "system/status/sensors");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      //onValue(sensorsRef, (snapshot) => {

      const data = snapshot.val();
      console.log("Firebase data:", data);
      if (data) {
        setHeaterTemp(data.heater);
        setCoolTemp(data.coolside);
        setOutsideTemp(data.outside);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Tortoise Heater Control Panel</h1>

      <h2>Heater: {heaterTemp} °C</h2>
      <h2>Coolside: {coolTemp} °C</h2>
      <h2>Outside: {outsideTemp} °C</h2>
    </div>
  );
}

export default App;
