const COST_RECOVERY_CENTS_PER_KM = 22;

export const DRIVER_POST_LIMITS = {
  perDay: 2,
  perWeek: 8,
};

export function contributionCapInCents(distanceKm: number) {
  return distanceKm * COST_RECOVERY_CENTS_PER_KM;
}

export function normalizeContributionInCents(input: number, distanceKm: number) {
  const cap = contributionCapInCents(distanceKm);
  if (Number.isNaN(input) || input < 0) {
    return 0;
  }

  return Math.min(Math.round(input), cap);
}

export const platformDisclaimer =
  "SpareSeat connects independent people who share seats on trips they are already taking. SpareSeat does not provide transportation services. Users are responsible for safety checks, identity checks, licenses, insurance, and legal compliance. SpareSeat is not liable for accidents, delays, or user conduct.";

export const insuranceGuidance =
  "Drivers must confirm that their personal auto policy allows cost sharing rides before posting.";
