import React, { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://neurocare-production.up.railway.app");

function DoctorPanel() {

  // GET LOGGED IN DOCTOR
  const doctor = JSON.parse(
    localStorage.getItem("doctor")
  );

  useEffect(() => {

    if (doctor) {

      // DOCTOR COMES ONLINE
      socket.emit(
        "doctorOnline",
        doctor.id
      );

      // RECEIVE BOOKING ALERT
      socket.on(
        "newBooking",
        (data) => {

          alert(data.message);

        }
      );
    }

    return () => {

      socket.off("newBooking");

    };

  }, [doctor]);

  return (
    <div style={{ padding: "40px" }}>

      <h1>
        👩‍⚕️ {doctor?.name}
      </h1>

      <h3>
        Welcome to Doctor Dashboard
      </h3>

      <p>
        Waiting for patient bookings...
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "10px",
          background: "#f4f4f4",
        }}
      >

        <h3>Doctor Info</h3>

        <p>
          <strong>Specialization:</strong>{" "}
          {doctor?.specialization}
        </p>

        <p>
          <strong>Experience:</strong>{" "}
          {doctor?.experience}
        </p>

        <p>
          <strong>Available Time:</strong>{" "}
          {doctor?.slots}
        </p>

      </div>

    </div>
  );
}

export default DoctorPanel;