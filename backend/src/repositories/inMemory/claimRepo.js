const { v4: uuid } = require("uuid");
const { newClaim } = require("../../models/entities");

const store = new Map();

module.exports = {
  async create(data) {
    const id = uuid();
    const record = newClaim({ id, ...data });
    store.set(id, record);
    return record;
  },
  async findAll() {
    return Array.from(store.values());
  },
  async findById(id) {
    return store.get(id) || null;
  },
  async findByPolicyId(policyId) {
    return Array.from(store.values()).filter((c) => c.policyId === policyId);
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
