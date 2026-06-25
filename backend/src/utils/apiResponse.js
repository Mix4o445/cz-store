export function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function created(res, data, message = 'Created') {
  return ok(res, data, message, 201);
}
