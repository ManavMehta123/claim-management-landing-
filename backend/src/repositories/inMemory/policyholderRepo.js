const { v4: uuid } = require("uuid");
const { newPolicyholder } = require("../../models/entities");

// In-memory store — resets on server restart. This is Story 1's
// "no persistent storage" requirement.
const store = new Map();

module.exports = {
  async create(data) {
    const id = uuid();
    const record = newPolicyholder({ id, ...data });
    store.set(id, record);
    return record;
  },
  async findAll() {
    return Array.from(store.values());
  },
  async findById(id) {
    return store.get(id) || null;
  },
  async findByEmail(email) {
    return Array.from(store.values()).find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async update(id, data) {
    const existing = store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id };
    store.set(id, updated);
    return updated;
  },
  async remove(id) {
    return store.delete(id);
  },
  async _reset() {
    store.clear();
  },
};
