const knex = require("../db/connection");

function list() {
  return knex("tables as t").select("*").orderBy("t.table_name");
}

function update(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newTable) => newTable[0]);
}

function updateReservationStatus(updatedReseravtion) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedReseravtion.reservation_id })
    .update({ status: updatedReseravtion.status })
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
  create,
  list,
  update,
  read,
  updateReservationStatus,
};
