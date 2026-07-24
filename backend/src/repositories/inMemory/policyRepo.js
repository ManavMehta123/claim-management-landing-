const { v4: uuid } = require("uuid");
const { newPolicy } = require("../../models/entities");

const store = new Map();

module.exports = {
  async create(data) {
    const id = uuid();
    const record = newPolicy({ id, ...data });
    store.set(id, record);
    return record;
  },
  async findAll() {
    return Array.from(store.values());
  },
  async findById(id) {
    return store.get(id) || null;
  },
  async findByPolicyNumber(policyNumber) {
    return Array.from(store.values()).find((p) => p.policyNumber === policyNumber) || null;
  },
  async findByPolicyholderId(policyholderId) {
    return Array.from(store.values()).filter((p) => p.policyholderId === policyholderId);
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
