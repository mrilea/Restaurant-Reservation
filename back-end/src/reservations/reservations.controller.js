const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at",
];

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

function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  const test = new Date(reservation_date);

  if (test instanceof Date && isNaN(test)) {
    return next({
      status: 400,
      message: `${reservation_date} is not a valid reservation_date.`,
    });
  }
  return next();
}

function isNotOnTuesday(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const [year, month, day] = reservation_date.split("-");
  const date = new Date(`${month} ${day}, ${year} ${reservation_time}`);
  res.locals.date = date;
  res.locals.time = reservation_time;
  if (date.getDay() === 2) {
    return next({ status: 400, message: "Location is closed on Tuesdays" });
  }
  next();
}

function isInTheFuture(req, res, next) {
  const date = res.locals.date;
  const today = new Date();
  if (date < today) {
    return next({ status: 400, message: "Reservation must be in the future" });
  }
  next();
}

function restaurantNotOpen(req, res, next) {
  const time = res.locals.time;
  const openTime = "10:30";
  const lastRes = "21:30";
  if (time < openTime || time > lastRes) {
    return next({
      status: 400,
      message: "reservation_time must be between 10:30am and 9:30pm",
    });
  }
  next();
}

function isPeopleNaN(req, res, next) {
  const { people } = req.body.data;
  if (typeof people === "number") return next();
  next({
    status: 400,
    message: "people is not a number.",
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ID ${reservation_id} does not exist.`,
  });
}

function hasBookedStatus(req, res, next) {
  const { status } = req.body.data;

  if (!status) return next();

  if (status === "booked") return next();
  next({
    status: 400,
    message: `The reservation status is ${status}.`,
  });
}

function statusIsNotFinished(req, res, next) {
  const { status } = res.locals.reservation;

  if (status !== "finished") return next();

  next({
    status: 400,
    message: `A ${status} reservation cannot be updated.`,
  });
}

function hasValidStatusRequest(req, res, next) {
  const { status } = req.body.data;
  const statusCheck = ["booked", "seated", "finished", "cancelled"];

  if (!statusCheck.includes(status)) {
    next({
      status: 400,
      message: `The reservation status: ${status} is invalid.`,
    });
  }
  next();
}

// CRUD
async function list(req, res) {
  const { date, mobile_number } = req.query;

  if (mobile_number) {
    reservations = await service.search(mobile_number);
  } else {
    reservations = date ? await service.listByDate(date) : await service.list();
  }
  res.json({ data: reservations });
}

async function create(req, res) {
  const { data } = req.body;
  const newReservation = { ...data, status: "booked" };
  const newData = await service.create(newReservation);
  res.status(201).json({ data: newData });
}

async function read(req, res) {
  const { reservation: data } = res.locals;
  res.json({ data });
}

async function update(req, res) {
  const reservation = {
    ...res.locals.reservation,
    ...req.body.data,
  };
  const data = await service.update(reservation);
  res.json({ data });
}

async function destroy(req, res) {
  const { reservation } = res.locals;
  await service.delete(reservation.reservation_id);
  res.sendStatus(204);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    dateIsValid,
    isPeopleNaN,
    isNotOnTuesday,
    isInTheFuture,
    restaurantNotOpen,
    hasBookedStatus,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    hasRequiredProperties,
    dateIsValid,
    isPeopleNaN,
    isNotOnTuesday,
    isInTheFuture,
    restaurantNotOpen,
    hasValidStatusRequest,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    hasProperties('status'),
    asyncErrorBoundary(reservationExists),
    statusIsNotFinished,
    hasValidStatusRequest,
    asyncErrorBoundary(update),
  ],
  delete: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(destroy)],
};
