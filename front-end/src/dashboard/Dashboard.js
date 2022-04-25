import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationsTable from "./ReservationsTable/ReservationsTable";
import TablesTable from "./TablesTable/TablesTable";
import useQuery from "../utils/useQuery";
import { previous, today, next } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const query = useQuery();
  const dateQuery = query.get("date");

  if (dateQuery) date = dateQuery;

  // loads reservations
  useEffect(() => {
    const abortController = new AbortController();

    async function loadReservations() {
      setReservationsError(null);
      try {
        const data = await listReservations({ date }, abortController.signal);
        setReservations(data);
      } catch (error) {
        setReservationsError(error);
      }
    }
    loadReservations();
    return () => abortController.abort();
  }, [date]);

  // loads all tables
  useEffect(() => {
    const abortController = new AbortController();

    async function loadTables() {
      setReservationsError(null);
      try {
        const data = await listTables(abortController.signal);
        setTables(data);
      } catch (error) {
        setTablesError(error);
      }
    }

    loadTables();

    return () => abortController.abort();
  }, []);

  const bookedAndSeated = reservations.filter(
    (reservation) => reservation.status !== "finished"
  );

  return (
    <main>
      <h1 className="d-md-flex justify-content-center">Dashboard</h1>
      <div className="d-md-flex mb-3 justify-content-center">
        <h4 className="mb-0">Reservations for date {date}</h4>
      </div>
      <div className="d-md-flex mb-3 justify-content-center">
      <Link to={`/dashboard?date=${previous(date)}`} className="btn btn-dark m-1" >
          Previous Date
        </Link>
        <Link to={`/dashboard?date=${today(date)}`} className="btn btn-primary m-1" >
          Today
        </Link>
        <Link to={`/dashboard?date=${next(date)}`} className="btn btn-dark m-1" >
          Next Date
        </Link>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />

      <ReservationsTable reservations={bookedAndSeated} />
      <TablesTable tables={tables} />
    </main>
  );
}

export default Dashboard;
