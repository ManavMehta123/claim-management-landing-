const { Policy } = require("../../models/mongoSchemas");

module.exports = {
  async create(data) {
    const doc = await Policy.create(data);
    return doc.toJSON();
  },
  async findAll() {
    const docs = await Policy.find().sort({ createdAt: 1 });
    return docs.map((d) => d.toJSON());
  },
  async findById(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await Policy.findById(id);
    return doc ? doc.toJSON() : null;
  },
  async findByPolicyNumber(policyNumber) {
    const doc = await Policy.findOne({ policyNumber });
    return doc ? doc.toJSON() : null;
  },
  async findByPolicyholderId(policyholderId) {
    if (!policyholderId || !policyholderId.match(/^[0-9a-fA-F]{24}$/)) return [];
    const docs = await Policy.find({ policyholderId }).sort({ createdAt: 1 });
    return docs.map((d) => d.toJSON());
  },
  async update(id, data) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await Policy.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      context: "query",
    });
    return doc ? doc.toJSON() : null;
  },
  async remove(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return false;
    const doc = await Policy.findByIdAndDelete(id);
    return !!doc;
  },
  async _reset() {
    await Policy.deleteMany({});
  },
};
