import React from "react";
import { Link } from "react-router-dom";
import CancelReservation from "../../CreateReservation/CancelReservation";

export default function ReservationRow({ res }) {
  return (
    <>
      <tr>
        <th scope="row">{res.first_name}</th>
        <td>{res.last_name}</td>
        <td>{res.mobile_number}</td>
        <td>{res.reservation_date}</td>
        <td>{res.reservation_time}</td>
        <td>{res.people}</td>
        <td data-reservation-id-status={res.reservation_id}>{res.status}</td>
        <td>
          {res.status === "booked" ? (
            <>
              <div className="">
                <Link
                  to={`/reservations/${res.reservation_id}/seat`}
                  className="btn btn-primary btn-block p-1"
                >
                  Seat
                </Link>
                <Link
                  to={`/reservations/${res.reservation_id}/edit`}
                  className="btn btn-warning btn-block p-1"
                >
                  Edit
                </Link>
                <CancelReservation reservation={res} />
              </div>
            </>
          ) : (
            ""
          )}
        </td>
      </tr>
    </>
  );
}
