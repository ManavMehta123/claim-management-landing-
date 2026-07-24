/**
 * Domain entity shapes used across both the in-memory (stateless) and
 * MongoDB (stateful) repository implementations. These are plain factory
 * functions rather than classes so the exact same shape can be returned
 * whether the record came from memory or from Mongo (after .toObject()).
 */

const STATUS = {
  POLICY: { ACTIVE: "Active", EXPIRED: "Expired", CANCELLED: "Cancelled" },
  CLAIM: { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" },
};

function newPolicyholder({ id, name, email, phone, address, dateOfBirth }) {
  return { id, name, email, phone, address, dateOfBirth: dateOfBirth || null };
}

function newPolicy({
  id,
  policyNumber,
  policyholderId,
  type,
  coverageAmount,
  premiumAmount,
  startDate,
  endDate,
  status,
}) {
  return {
    id,
    policyNumber,
    policyholderId,
    type,
    coverageAmount,
    premiumAmount,
    startDate,
    endDate,
    status: status || STATUS.POLICY.ACTIVE,
  };
}

function newClaim({ id, claimNumber, policyId, amountClaimed, dateOfClaim, description, status }) {
  return {
    id,
    claimNumber,
    policyId,
    amountClaimed,
    dateOfClaim: dateOfClaim || new Date().toISOString(),
    description,
    status: status || STATUS.CLAIM.PENDING,
  };
}

// Self-registered users (Story 4: real sign-up, distinct from the single
// seeded admin account). passwordHash only — the plaintext password is
// never stored or returned to the client.
function newUser({ id, username, email, passwordHash, role }) {
  return { id, username, email, passwordHash, role: role || "user" };
}

module.exports = { STATUS, newPolicyholder, newPolicy, newClaim, newUser };
