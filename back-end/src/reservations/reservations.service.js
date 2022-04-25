const knex = require("../db/connection");

function list() {
  return knex("reservations as r")
    .select("*")
    .whereNotIn("status", ["finished", "cancelled"])
    .orderBy("r.reservation_date");
}

function search(mobile_number) {
  return knex("reservations as r")
    .select("*")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("r.reservation_date");
}

function listByDate(reservation_date) {
  return knex("reservations as r")
    .select("*")
    .where({ reservation_date })
    .whereNotIn("status", ["finished", "cancelled"])
    .orderBy("r.reservation_time");
}

function create(reservation) {
	return knex("reservations")
		.insert(reservation)
		.returning("*")
		.then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

function update(reservation) {
  return knex("reservations as r")
    .select("*")
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((updated) => updated[0]);
}

function destroy(reservation_id) {
  return knex("reservations").where({ reservation_id }).del();
}

module.exports = {
  list,
  listByDate,
  search,
  create,
  read,
  update,
  delete: destroy,
};
