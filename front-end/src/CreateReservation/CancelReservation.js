import { useHistory } from "react-router";
import { updateReservationStatus } from "../utils/api";

export default function CancelReservation({ reservation }) {
  const history = useHistory();
  const { reservation_id, reservation_date } = reservation;

  async function handleCancel() {
    const abortController = new AbortController();
    const cancelReservation = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );

    if (!cancelReservation)
      return history.push(`/dashboard?date=${reservation_date}`);

    const updatedReseravtion = {
      reservation_id,
      status: "cancelled",
    };
    try {
      await updateReservationStatus(updatedReseravtion, abortController.signal);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Aborted");
      } else {
        throw error;
      }
    }

    window.location.reload();

    return () => abortController.abort();
  }

  return (
    <>
      <button
        type="button"
        data-reservation-id-cancel={reservation.reservation_id}
        className="btn btn-danger btn-block p-1"
        id={reservation_id}
        onClick={() => handleCancel()}
      >
        Cancel
      </button>
    </>
  );
}
