const { Claim } = require("../../models/mongoSchemas");

module.exports = {
  async create(data) {
    const doc = await Claim.create(data);
    return doc.toJSON();
  },
  async findAll() {
    const docs = await Claim.find().sort({ createdAt: 1 });
    return docs.map((d) => d.toJSON());
  },
  async findById(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await Claim.findById(id);
    return doc ? doc.toJSON() : null;
  },
  async findByPolicyId(policyId) {
    if (!policyId || !policyId.match(/^[0-9a-fA-F]{24}$/)) return [];
    const docs = await Claim.find({ policyId }).sort({ createdAt: 1 });
    return docs.map((d) => d.toJSON());
  },
  async update(id, data) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;
    const doc = await Claim.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      context: "query",
    });
    return doc ? doc.toJSON() : null;
  },
  async remove(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return false;
    const doc = await Claim.findByIdAndDelete(id);
    return !!doc;
  },
  async _reset() {
    await Claim.deleteMany({});
  },
};
