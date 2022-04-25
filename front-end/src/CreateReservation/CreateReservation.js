import React, { useState } from "react";
import { useHistory } from "react-router";
import { createReservation } from "../utils/api";
import {
  isNotOnTuesday,
  isInTheFuture,
  restaurantNotOpen,
} from "../utils/date-time";
import ReservationForm from "./ReservationForm";

function CreateReservation() {
  const reservationDefault = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const history = useHistory();
  const [newReservation, setNewReservation] = useState({
    ...reservationDefault,
  });
  const [reservationsError, setReservationsError] = useState(null);

  const findErrors = (resDate, resTime, errors) => {
    isNotOnTuesday(resDate, resTime, errors);
    isInTheFuture(resDate, resTime, errors);
    restaurantNotOpen(resDate, resTime, errors);
  };

  function hasPeople(people, errors) {
    if (Number(people) < 1 || isNaN(people)) {
      errors.push(
        <li key="people" className="alert alert-danger">
          Reservation must have at least 1 person and contain only numbers.
        </li>
      );
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    const errors = [];
    findErrors(
      newReservation.reservation_date,
      newReservation.reservation_time,
      errors
    );
    hasPeople(newReservation.people, errors);
    if (errors.length) {
      setReservationsError({ message: errors });
      return;
    }
    try {
      newReservation.people = Number(newReservation.people);
      await createReservation(newReservation, controller.signal);
      const date = newReservation.reservation_date;
      history.push(`/dashboard?date=${date}`);
    } catch (error) {
      setReservationsError(error);
    }
    return () => controller.abort();
  };

  return (
    <>
      <h1 className="d-md-flex mb-3 justify-content-center">New Reservation</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Reservation Details</h4>
      </div>
      <ReservationForm
        reservation={newReservation}
        setReservation={setNewReservation}
        handleSubmit={handleSubmit}
        error={reservationsError}
      />
    </>
  );
}

export default CreateReservation;
