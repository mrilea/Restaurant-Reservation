import React from "react";
import { useHistory } from "react-router";
import { deleteTableRes } from "../../utils/api";

export default function TablesRow({ table }) {
  const history = useHistory();

  async function finishHandler(e) {
    e.preventDefault();
    const abortController = new AbortController();

    const finishTable = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );

    if (!finishTable) return history.push("/dashboard");

    try {
      await deleteTableRes(table.table_id, abortController.signal);
    } catch (error) {
      console.log(error.message);
    }

    window.location.reload();
    return () => abortController.abort();
  }
  return (
    <>
      <tr>
        <td>{table.table_name}</td>
        <td>{table.capacity}</td>
        <td data-table-id-status={table.table_id}>
          {table.reservation_id ? "occupied" : "free"}
        </td>
        <td>
          {table.reservation_id && (
            <button
              type="button"
              className="btn btn-success"
              data-table-id-finish={table.table_id}
              onClick={(e) => finishHandler(e)}
            >
              Finish
            </button>
          )}
        </td>
      </tr>
    </>
  );
}
