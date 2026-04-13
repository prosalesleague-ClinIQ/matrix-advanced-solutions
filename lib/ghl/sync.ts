/**
 * Matrix Advanced Solutions — GHL Sync Functions
 *
 * High-level functions that sync app events to GoHighLevel.
 * Each function is fire-and-forget — GHL failures never block
 * core business operations.
 */

import {
  upsertContact,
  findContactByEmail,
  addTag,
  updateCustomFields,
  updateContact,
  addTask,
} from "./client";

// ─── GHL Tags (must match GHL build sheet) ──────────────────────

export const GHL_TAGS = {
  NEW_SIGNUP: "lifecycle__new_signup",
  NEEDS_ADMIN_REVIEW: "action__needs_admin_review",
  ONBOARDING_SUBMITTED: "ops__onboarding_submitted",
  ONBOARDING_APPROVED: "ops__onboarding_approved",
  ONBOARDING_REJECTED: "ops__onboarding_rejected",
  ORDER_PLACED: "behavior__order_placed",
  WIRE_CONFIRMED: "behavior__wire_confirmed",
  INACTIVE_CLINIC: "status__inactive_clinic",
  TIER_NEW: "status__tier_new",
  TIER_RETURNING: "status__tier_returning",
} as const;

// ─── GHL Custom Field Keys ──────────────────────────────────────

const CF = {
  CLINIC_ID: "contact.cf_contact__clinic_id",
  CLINIC_NAME: "contact.cf_contact__clinic_name",
  ONBOARDING_STATUS: "contact.cf_contact__onboarding_status",
  PRACTICE_TYPE: "contact.cf_contact__practice_type",
  MEDICAL_LICENSE: "contact.cf_contact__medical_license",
  NPI_NUMBER: "contact.cf_contact__npi_number",
  ACCOUNT_TIER: "contact.cf_contact__account_tier",
  TOTAL_ORDERS: "contact.cf_contact__total_orders",
  TOTAL_SPEND: "contact.cf_contact__total_spend",
  LAST_ORDER_DATE: "contact.cf_contact__last_order_date",
  WIRE_VERIFIED: "contact.cf_contact__wire_verified",
} as const;

// ─── Practice Type Mapping (internal → GHL dropdown label) ──────

const PRACTICE_TYPE_MAP: Record<string, string> = {
  medical_clinic: "Medical Clinic",
  wellness_center: "Wellness Center",
  anti_aging_clinic: "Anti-Aging Clinic",
  medspa: "Medspa",
  functional_medicine: "Functional Medicine",
  sports_medicine: "Sports Medicine",
  naturopathic_practice: "Naturopathic Practice",
  other: "Other",
};

function mapPracticeType(internal: string): string {
  return PRACTICE_TYPE_MAP[internal] ?? internal;
}

// ─── Helper: safe wrapper (never throws) ────────────────────────

async function safe<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[GHL_SYNC] ${label} failed:`, err);
    return null;
  }
}

// ─── Trigger 1: New Signup ──────────────────────────────────────

export async function syncNewSignup(data: {
  email: string;
  fullName: string;
  clinicName: string;
  clinicId: string;
  assignedRepGhlId?: string;
}) {
  await safe(async () => {
    const [firstName, ...lastParts] = data.fullName.split(" ");
    const lastName = lastParts.join(" ") || "";

    const contactId = await upsertContact({
      email: data.email,
      firstName,
      lastName,
      // NEEDS_ADMIN_REVIEW tag is the trigger a GHL workflow should watch
      // to email/notify internal staff that a new clinic needs approval.
      tags: [GHL_TAGS.NEW_SIGNUP, GHL_TAGS.TIER_NEW, GHL_TAGS.NEEDS_ADMIN_REVIEW],
      customFields: [
        { key: CF.CLINIC_ID, value: data.clinicId },
        { key: CF.CLINIC_NAME, value: data.clinicName },
        { key: CF.ONBOARDING_STATUS, value: "Pending" },
        { key: CF.ACCOUNT_TIER, value: "New" },
        { key: CF.TOTAL_ORDERS, value: 0 },
        { key: CF.TOTAL_SPEND, value: 0 },
        { key: CF.WIRE_VERIFIED, value: false },
      ],
      ...(data.assignedRepGhlId ? { assignedTo: data.assignedRepGhlId } : {}),
    });

    // Create an explicit task for the admin so the approval shows up in
    // their GHL task list, not just tag-based. If GHL_ADMIN_USER_ID is set,
    // the task is assigned directly; otherwise it sits unassigned but still
    // visible via the NEEDS_ADMIN_REVIEW tag.
    if (contactId) {
      const adminUserId = process.env.GHL_ADMIN_USER_ID;
      await addTask(contactId, {
        title: `New clinic signup: ${data.clinicName}`,
        body: [
          `${data.fullName} (${data.email}) just signed up for ${data.clinicName}.`,
          "",
          "Next step: review their onboarding application in the Matrix admin portal",
          "and approve or request changes.",
          "",
          `Clinic ID: ${data.clinicId}`,
        ].join("\n"),
        dueDate: new Date().toISOString(),
        ...(adminUserId ? { assignedTo: adminUserId } : {}),
      });
    }

    return contactId;
  }, "syncNewSignup");
}

// ─── Trigger 2: Onboarding Submitted ───────────────────────────

export async function syncOnboardingSubmitted(data: {
  email: string;
  clinicName: string;
  practiceType: string;
  medicalLicense: string;
  npiNumber: string;
  assignedRepGhlId?: string;
}) {
  await safe(async () => {
    const contactId = await findContactByEmail(data.email);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for onboarding submit:", data.email);
      return;
    }

    await addTag(contactId, GHL_TAGS.ONBOARDING_SUBMITTED);

    await updateCustomFields(contactId, [
      { key: CF.ONBOARDING_STATUS, value: "Submitted" },
      { key: CF.CLINIC_NAME, value: data.clinicName },
      { key: CF.PRACTICE_TYPE, value: mapPracticeType(data.practiceType) },
      { key: CF.MEDICAL_LICENSE, value: data.medicalLicense },
      { key: CF.NPI_NUMBER, value: data.npiNumber },
    ]);

    if (data.assignedRepGhlId) {
      await updateContact(contactId, { assignedTo: data.assignedRepGhlId });
    }
  }, "syncOnboardingSubmitted");
}

// ─── Trigger 3: Onboarding Approved ────────────────────────────

export async function syncOnboardingApproved(data: {
  clinicEmail: string;
  assignedRepGhlId?: string;
}) {
  await safe(async () => {
    const contactId = await findContactByEmail(data.clinicEmail);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for approval:", data.clinicEmail);
      return;
    }

    await addTag(contactId, GHL_TAGS.ONBOARDING_APPROVED);

    await updateCustomFields(contactId, [
      { key: CF.ONBOARDING_STATUS, value: "Approved" },
    ]);

    if (data.assignedRepGhlId) {
      await updateContact(contactId, { assignedTo: data.assignedRepGhlId });
    }
  }, "syncOnboardingApproved");
}

// ─── Trigger 4: Onboarding Rejected ────────────────────────────

export async function syncOnboardingRejected(clinicEmail: string) {
  await safe(async () => {
    const contactId = await findContactByEmail(clinicEmail);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for rejection:", clinicEmail);
      return;
    }

    await addTag(contactId, GHL_TAGS.ONBOARDING_REJECTED);

    await updateCustomFields(contactId, [
      { key: CF.ONBOARDING_STATUS, value: "Rejected" },
    ]);
  }, "syncOnboardingRejected");
}

// ─── Trigger 5: Order Placed ────────────────────────────────────

export async function syncOrderPlaced(data: {
  clinicEmail: string;
  orderNumber: string;
  orderTotal: number;
  totalOrders: number;
  totalSpend: number;
}) {
  await safe(async () => {
    const contactId = await findContactByEmail(data.clinicEmail);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for order:", data.clinicEmail);
      return;
    }

    await addTag(contactId, GHL_TAGS.ORDER_PLACED);

    await updateCustomFields(contactId, [
      { key: CF.TOTAL_ORDERS, value: data.totalOrders },
      { key: CF.TOTAL_SPEND, value: data.totalSpend },
      { key: CF.LAST_ORDER_DATE, value: new Date().toISOString().split("T")[0] },
    ]);
  }, "syncOrderPlaced");
}

// ─── Trigger 6: Wire Confirmed ──────────────────────────────────

export async function syncWireConfirmed(data: {
  clinicEmail: string;
  totalOrders: number;
  totalSpend: number;
  isFirstWire: boolean;
}) {
  await safe(async () => {
    const contactId = await findContactByEmail(data.clinicEmail);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for wire confirm:", data.clinicEmail);
      return;
    }

    await addTag(contactId, GHL_TAGS.WIRE_CONFIRMED);

    const customFields: Array<{ key: string; value: string | number | boolean }> = [
      { key: CF.WIRE_VERIFIED, value: true },
      { key: CF.TOTAL_ORDERS, value: data.totalOrders },
      { key: CF.TOTAL_SPEND, value: data.totalSpend },
      { key: CF.ACCOUNT_TIER, value: data.totalOrders >= 1 ? "Returning" : "New" },
    ];

    await updateCustomFields(contactId, customFields);
  }, "syncWireConfirmed");
}

// ─── Trigger 7: Inactive Clinic (for cron) ──────────────────────

export async function syncInactiveClinic(clinicEmail: string) {
  await safe(async () => {
    const contactId = await findContactByEmail(clinicEmail);
    if (!contactId) {
      console.warn("[GHL_SYNC] Contact not found for inactive:", clinicEmail);
      return;
    }

    await addTag(contactId, GHL_TAGS.INACTIVE_CLINIC);
  }, "syncInactiveClinic");
}
