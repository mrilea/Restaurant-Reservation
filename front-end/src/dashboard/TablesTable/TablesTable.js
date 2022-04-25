import React from "react";
import TablesRow from "./TablesRow";

export default function TablesTable({ tables }) {
  if (!tables) {
    return (
      <div className="alert alert-warning" role="alert">
        There are no saved tables.
      </div>
    );
  }

  const tableData = tables.map((table) => {
    return <TablesRow key={table.table_id} table={table} />;
  });

  return (
    <>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th scope="col">Table Name</th>
            <th scope="col">Capacity</th>
            <th scope="col">Status</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>{tableData}</tbody>
      </table>
    </>
  );
}
