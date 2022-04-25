import React from "react";
import { useHistory } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";

export default function ReservationForm({
  reservation,
  setReservation,
  handleSubmit,
  error,
}) {
  const history = useHistory();
  const handleChange = ({ target }) => {
    let value = target.value;
    setReservation({ ...reservation, [target.name]: value });
  };
  return (
    <>
      <ErrorAlert error={error} />
      <div className="card d-md-flex p-3">
        <form onSubmit={handleSubmit}>
          <div className="form-group mt-3">
            <input
              name="first_name"
              type="text"
              className="col mr-3"
              placeholder="First Name"
              defaultValue={reservation.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group mt-3">
            <input
              name="last_name"
              type="text"
              className="col mr-3"
              placeholder="Last Name"
              defaultValue={reservation.last_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group mt-3">
            <input
              name="mobile_number"
              className="col mr-3"
              type="text"
              placeholder="Mobile Number"
              defaultValue={reservation.mobile_number}
              onChange={handleChange}
            />
          </div>
          <div className="form-group row mt-3">
            <label htmlFor="reservation_date" className="col">
              Reservation Date:
            </label>
            <input
              name="reservation_date"
              type="date"
              className="mr-3"
              placeholder="YYYY-MM-DD"
              defaultValue={reservation.reservation_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group row mt-3">
            <label htmlFor="reservation_time" className="col">
              Reservation Time:
            </label>
            <input
              name="reservation_time"
              type="time"
              className="mr-3"
              placeholder="HH:MM:SS"
              defaultValue={reservation.reservation_time}
              onChange={handleChange}
            />
          </div>
          <div className="form-group mt-3">
            <input
              name="people"
              type="text"
              className="col mr-3"
              placeholder="Number of People"
              defaultValue={reservation.people}
              onChange={handleChange}
              required
            />
          </div>
          <div className="d-flex justify-content-center ml-0">
            <button type="submit" className="btn btn-primary mr-2">
              Submit
            </button>
            <button
              onClick={() => history.goBack()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
