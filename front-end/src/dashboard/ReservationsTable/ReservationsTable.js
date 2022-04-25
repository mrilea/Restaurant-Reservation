import React from "react";
import ReservationRow from "./ReservationsRow";

export default function ReservationsTable({ reservations = [] }) {
  if (!reservations) {
    return null;
  }
  const resData = reservations.map((res) => {
    return <ReservationRow key={res.reservation_id} res={res} />;
  });

  return (
    <>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Reservation Date</th>
            <th scope="col">Reservation Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>{resData}</tbody>
      </table>
    </>
  );
}
