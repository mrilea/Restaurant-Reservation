import React, { useState } from "react";
import { useHistory } from "react-router";
import { listReservations } from "../utils/api";
import ReservationsTable from "../dashboard/ReservationsTable/ReservationsTable";

export default function Search() {
  const history = useHistory();
  const [reservations, setReservations] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [searchConducted, setSearchConducted] = useState(false);

  const handleChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const abortController = new AbortController();
    async function updateData() {
      try {
        const result = await listReservations(
          { mobile_number: mobileNumber },
          abortController.signal
        );
        setReservations(result);
        setSearchConducted(true);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Aborted");
        } else {
          throw error;
        }
      }
    }
    updateData();
    return () => abortController.abort();
  };

  return (
    <>
      <h1 className="d-md-flex mb-3 justify-content-center">Search</h1>{" "}
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Search for a reservation by mobile number:</h4>
      </div>
      <div>
        <div className="card d-md-flex p-3">
          <form onSubmit={handleSubmit}>
            <div className="d-md-flex justify-content-center">
              <input
                id="mobile_number"
                type="text"
                name="mobile_number"
                onChange={handleChange}
                style={{ width: "230px" }}
                placeholder="Enter a guests's phone number"
                required
              />
              &nbsp; &nbsp;
              <button type="submit" className="btn btn-primary m-1">
                Find
              </button>
              <button
                type="button"
                className="btn btn-secondary m-1"
                onClick={() => history.goBack()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <div className="d-md-flex m-3 justify-content-center">
          {searchConducted === true && (
            <>
              {reservations.length < 1 ? (
                <div>
                  <h4>No reservations found</h4>
                </div>
              ) : (
                <div>
                  <ReservationsTable reservations={reservations} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
