async function logActivity(db, data) {
  try {
    await db.collection("activities").insertOne({
      actorType: data.actorType,   // ADMIN | USER
      actorId: data.actorId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      message: data.message,
      metadata: data.metadata || {},
      read: false,
      createdAt: new Date()
    });
  } catch (err) {
    console.error("❌ Activity log failed:", err.message);
  }
}

module.exports = logActivity;
