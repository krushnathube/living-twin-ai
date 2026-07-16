// Standard API envelope: { success, message, data, errors }.
export const ok = (res, data = {}, message = '', status = 200) =>
  res.status(status).json({ success: true, message, data, errors: [] });

export const fail = (res, message = 'Error', errors = [], status = 400) =>
  res.status(status).json({ success: false, message, data: null, errors });
