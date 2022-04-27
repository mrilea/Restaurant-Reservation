const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const hasProperties = require("../errors/hasProperties");

const VALID_PROPERTIES = [
  "table_id",
  "table_name",
  "capacity",
  "reservation_id",
];

/////////////////////
// Validation
/////////////////////

//Validation for the request properties
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasValidInputs(req, res, next) {
  const { table_name, capacity } = req.body.data;
  let invalidInputs = "Invalid input(s):";

  if (table_name.length < 2) {
    invalidInputs = invalidInputs.concat(" table_name");
  }

  if (typeof capacity !== "number") {
    invalidInputs = invalidInputs.concat(" capacity");
  }

  if (invalidInputs !== "Invalid input(s):") {
    next({
      status: 400,
      message: invalidInputs,
    });
  }
  next();
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({ status: 404, message: `Table ID ${table_id} does not exist.` });
}

async function reservationIdExists(req, res, next) {
	let reservation_id = null;
	if (req.body.data) {
		// checks reservation_id before status changes to "seated"
		reservation_id = req.body.data.reservation_id;
	} else if (res.locals.table) {
		// checks reservation_id before status changes to "finished"
		reservation_id = res.locals.table.reservation_id;
	}
	const reservation = await reservationService.read(reservation_id);
	if (reservation) {
    res.locals.resId = reservation_id;
		res.locals.reservation = reservation;
		return next();
	}

	next({
		status: 404,
		message: `Reservation ID ${reservation_id} does not exist.`,
	});
}

function tableHasSufficientCapacity(req, res, next) {
  const { people } = res.locals.reservation;
  const { capacity } = res.locals.table;

  if (capacity >= people) return next();

  next({ status: 400, message: `Table does not have sufficient capacity.` });
}

function tableIsNotOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;

  if (reservation_id) {
    return next({ status: 400, message: `Table is occupied.` });
  }
  next();
}

function tableIsOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;

  if (reservation_id) return next();

  return next({ status: 400, message: `Table is not occupied.` });
}

function reservationStatusIsNotSeated(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "seated") {
    return next({ status: 400, message: `Reservation status is ${status}.` });
  }
  next();
}

async function updateReservationStatusToSeated(req, res, next) {
	const updatedReservation = {
		...res.locals.reservation,
		status: "seated",
	};
	const data = await service.updateReservationStatus(updatedReservation);
  next();
}

async function updateReservationStatusToFinished(req, res, next) {
  const updatedReservation = {
    ...res.locals.reservation,
    status: "finished",
  };
  const data = await service.updateReservationStatus(updatedReservation);
  next();
}

//CRUD
async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function read(req, res) {
  const { table: data } = res.locals;
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function update(req, res) {
  const updatedTable = {
    ...res.locals.table,
    reservation_id: res.locals.resId,
  };
  const data = await service.update(updatedTable);
  res.json({ data });
}

async function deleteReservationId(req, res) {
  const updatedTable = {
    ...res.locals.table,
    reservation_id: null,
  };
  const data = await service.update(updatedTable);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  create: [
    hasOnlyValidProperties,
    hasProperties("table_name", "capacity"),
    hasValidInputs,
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(tableExists),
    hasOnlyValidProperties,
    hasProperties("reservation_id"),
    asyncErrorBoundary(reservationIdExists),
    tableHasSufficientCapacity,
    tableIsNotOccupied,
    reservationStatusIsNotSeated,
    asyncErrorBoundary(updateReservationStatusToSeated),
    asyncErrorBoundary(update),
  ],
  deleteReservationId: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(updateReservationStatusToFinished),
    asyncErrorBoundary(deleteReservationId),
  ],
};
