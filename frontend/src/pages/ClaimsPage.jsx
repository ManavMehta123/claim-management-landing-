import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";
import SkeletonRows from "../components/SkeletonRows";
import { ClipboardIcon } from "../components/icons";
import { useToast } from "../components/ToastContext";
import { useAuth } from "../auth/AuthContext";

const EMPTY = { claimNumber: "", policyId: "", amountClaimed: "", description: "", status: "Pending" };
const COLUMNS = 6;

export default function ClaimsPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.listClaims(), api.listPolicies()])
      .then(([c, p]) => { setClaims(c); setPolicies(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const policyNumber = (id) => policies.find((p) => p.id === id)?.policyNumber || "—";

  const remainingFor = (policyId, excludeClaimId = null) => {
    const policy = policies.find((p) => p.id === policyId);
    if (!policy) return null;
    const used = claims
      .filter((c) => c.policyId === policyId && c.status !== "Rejected" && c.id !== excludeClaimId)
      .reduce((sum, c) => sum + c.amountClaimed, 0);
    return policy.coverageAmount - used;
  };

  const openCreate = () => {
    setForm({ ...EMPTY, policyId: policies[0]?.id || "" });
    setEditingId(null);
    setFormError(null);
    setModalMode("create");
  };

  const openEdit = (c) => {
    setForm(c);
    setEditingId(c.id);
    setFormError(null);
    setModalMode("edit");
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (modalMode === "create") {
        const payload = { ...form, amountClaimed: Number(form.amountClaimed) };
        await api.createClaim(payload);
        toast.success("Claim filed.");
      } else {
        // Admin review only ever changes the status (approve/reject) - the
        // rest of the claim's data is read-only at this point.
        await api.updateClaim(editingId, { status: form.status });
        toast.success(`Claim marked ${form.status}.`);
      }
      setModalMode(null);
      load();
    } catch (err) {
      setFormError(err.details ? err.details.join(" | ") : err.message);
    }
  };

  const remove = async () => {
    const id = pendingDelete.id;
    setPendingDelete(null);
    try {
      await api.deleteClaim(id);
      toast.success("Claim deleted.");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remaining = form.policyId ? remainingFor(form.policyId, editingId) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Claims</h1>
          <p>Claims filed against active policies, tracked from submission to payout.</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={openCreate} disabled={policies.length === 0}>+ New Claim</button>
        )}
      </div>

      {!isAdmin && policies.length === 0 && !loading && (
        <div className="alert alert-info">Create a policy first before filing a claim.</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Claim #</th><th>Policy</th><th>Amount</th><th>Date</th><th>Status</th>{isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows columns={COLUMNS} />
              ) : (
                claims.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-mono">{c.claimNumber}</td>
                    <td className="cell-mono cell-muted">{policyNumber(c.policyId)}</td>
                    <td className="cell-mono">₹{c.amountClaimed.toLocaleString("en-IN")}</td>
                    <td className="cell-mono cell-muted">{c.dateOfClaim.slice(0, 10)}</td>
                    <td><Badge status={c.status} /></td>
                    {isAdmin && (
                      <td className="cell-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Review</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setPendingDelete(c)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && claims.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardIcon width={20} height={20} /></div>
            <h3>No claims filed yet</h3>
            <p>Claims filed against a policy will show up here.</p>
            {!isAdmin && policies.length > 0 && (
              <button className="btn btn-primary" onClick={openCreate}>+ New Claim</button>
            )}
          </div>
        )}
      </div>

      {modalMode === "create" && (
        <Modal title="New Claim" onClose={() => setModalMode(null)}>
          <form onSubmit={submit}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>Claim Number</label>
                <input required value={form.claimNumber} onChange={(e) => setForm({ ...form, claimNumber: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Policy</label>
                <select required value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })}>
                  {policies.map((p) => <option key={p.id} value={p.id}>{p.policyNumber} ({p.status})</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Amount Claimed (₹)</label>
                <input required type="number" min="1" value={form.amountClaimed} onChange={(e) => setForm({ ...form, amountClaimed: e.target.value })} />
              </div>
              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            {remaining !== null && (
              <p className="muted">Remaining coverage on this policy: ₹{remaining.toLocaleString("en-IN")}</p>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModalMode(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Claim</button>
            </div>
          </form>
        </Modal>
      )}

      {modalMode === "edit" && (
        <Modal title="Review Claim" onClose={() => setModalMode(null)}>
          <form onSubmit={submit}>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>Claim Number</label>
                <p className="cell-mono">{form.claimNumber}</p>
              </div>
              <div className="form-field">
                <label>Policy</label>
                <p className="cell-mono cell-muted">{policyNumber(form.policyId)}</p>
              </div>
              <div className="form-field">
                <label>Amount Claimed (₹)</label>
                <p className="cell-mono">₹{Number(form.amountClaimed).toLocaleString("en-IN")}</p>
              </div>
              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <p className="cell-muted">{form.description}</p>
              </div>
              <div className="form-field">
                <label>Decision</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["Pending", "Approved", "Rejected"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModalMode(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Decision</button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete claim?"
          message={`This will permanently remove claim ${pendingDelete.claimNumber}. This can't be undone.`}
          onConfirm={remove}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
