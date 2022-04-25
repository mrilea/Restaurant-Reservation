import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { readReservation, updateReservation } from "../utils/api";
import {
  isNotOnTuesday,
  isInTheFuture,
  restaurantNotOpen,
} from "../utils/date-time";
import ReservationForm from "./ReservationForm";

export default function EditReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [error, setError] = useState(null);

  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const [reservation, setReservation] = useState({ ...initialState });

  useEffect(() => {
    const abortController = new AbortController();

    async function loadReservation() {
      try {
        const data = await readReservation(
          reservation_id,
          abortController.signal
        );
        setReservation(data);
      } catch (error) {
        return <ErrorAlert error={error} />;
      }
    }
    loadReservation();

    return () => abortController.abort();
  }, [reservation_id]);

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
        reservation.reservation_date,
        reservation.reservation_time,
      errors
    );
    hasPeople(reservation.people, errors);
    if (errors.length) {
        setError({ message: errors });
      return;
    }
    try {
        reservation.people = Number(reservation.people);
      await updateReservation(reservation, controller.signal);
      const date = reservation.reservation_date;
      history.push(`/dashboard?date=${date}`);
    } catch (error) {
        setError(error);
    }
    return () => controller.abort();
  };

  return (
    <>
      <h1 className="d-md-flex justify-content-center">Edit Reservation</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Fill out the adjusted information</h4>
      </div>
      <ReservationForm
        reservation={reservation}
        setReservation={setReservation}
        handleSubmit={handleSubmit}
        error={error}
      />
    </>
  );
}
