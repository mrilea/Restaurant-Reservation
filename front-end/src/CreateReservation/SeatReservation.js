import React, { useEffect, useState } from "react";
import { listTables, seatRes, readReservation } from "../utils/api";
import { useHistory, useParams } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";

export default function SeatReservation() {
  const { reservation_id } = useParams();
  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();

  const initialSeat = {
    table_id: "x",
  };

  const [seat, setSeat] = useState({ ...initialSeat });

  useEffect(loadResAndTables, [reservation_id]);

  function loadResAndTables() {
    const abortController = new AbortController();
    readReservation(reservation_id, abortController.signal).then(
      setReservation
    );
    listTables(abortController.signal).then(setTables);

    return () => abortController.abort();
  }

  const submitHandler = (e) => {
    e.preventDefault();
    const abortController = new AbortController();
    if (error === null) {
      async function updateData() {
        try {
          await seatRes(seat.table_id, reservation_id, abortController.signal);
          history.push(`/dashboard`);
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Aborted");
          } else {
            throw error;
          }
        }
      }
      updateData();
      return () => {
        abortController.abort();
      };
    }
  };

  const changeHandler = ({ target }) => {
    let value = target.value;
    let foundTable = tables.filter((table) => table.table_id === Number(value));

    if (value === "x") {
      setError({ message: "Please select a table" });
    } else {
      if (reservation.people > foundTable[0].capacity) {
        setError({ message: "That table does not have enough room." });
      } else {
        setError(null);
      }
    }
    setSeat({ ...seat, [target.name]: value });
  };

  const options = tables.map((table) => (
    <option
      key={table.table_id}
      value={table.table_id}
    >{`${table.table_name} - ${table.capacity}`}</option>
  ));

  return (
    <>
      <h1 className="d-md-flex justify-content-center">Seat Reservation</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Tables</h4>
      </div>
      <ErrorAlert error={error} />
      <div className="d-md-flex justify-content-center">
        <form onSubmit={(e) => submitHandler(e)} className="">
          <div className="form-group mt-3">
            Seat at:{" "}
            <select
              name="table_id"
              className="p-1"
              onChange={changeHandler}
              value={seat.table_id}
            >
              {" "}
              <option value="x">Select a table</option>
              {options}
            </select>
            <button
              type="button"
              className="btn btn-secondary p-1 ml-1 mb-1"
              onClick={() => history.goBack()}
            >
              Cancel
            </button>
            <button className="btn btn-primary p-1 ml-1 mb-1" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
