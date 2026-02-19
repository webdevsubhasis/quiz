exports.ok = (res, data) => res.json({ ok: true, ...data });
exports.error = (res, status, message) => res.status(status).json({ ok: false, message });
