import React, { useState } from "react";
import { useHistory } from "react-router";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function CreateTable() {
  const history = useHistory();
  const tableDefault = { table_name: "", capacity: 0 };
  const [tableError, setTableError] = useState(null);
  const [table, setTable] = useState({ ...tableDefault });

  function findErrors(tableName, capacity, errors) {
    if (tableName.length < 2) {
      errors.push(
        <li key="tableName" className="alert alert-danger">
          Table name must be at least 2 characters.
        </li>
      );
    }
    if (capacity < 1) {
      errors.push(
        <li key="capacity" className="alert alert-danger">
          Table must have a capacity of 1 or more.
        </li>
      );
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    const errors = [];
    findErrors(table.table_name, Number(table.capacity), errors);
    if (errors.length) {
      setTableError({ message: errors });
      return;
    }
    try {
      table.capacity = Number(table.capacity);
      await createTable(table, controller.signal);
      history.push("/dashboard");
    } catch (error) {
      setTableError(error);
    }
    return () => controller.abort();
  };

  const handleChange = (e) => {
    setTable({
      ...table,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main>
      <ErrorAlert error={tableError} />
      <h1 className="d-md-flex mb-3 justify-content-center">New Table</h1>
      <div className="card p-2">
        <div className="form">
          <div className="form-group mt-3">
            <input
              name="table_name"
              type="text"
              className="col mr-3"
              placeholder="Table Name"
              value={table.table_name}
              onChange={handleChange}
              required
              min="2"
            />
          </div>
          <div className="form-group">
            <input
              name="capacity"
              type="text"
              className="col mr-3"
              placeholder="Capacity - please enter as a number."
              value={table.capacity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>
        <div className="d-flex justify-content-center ml-0">
          <button
            type="submit"
            className="btn btn-primary mr-2"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            onClick={() => history.goBack()}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

export default CreateTable;
