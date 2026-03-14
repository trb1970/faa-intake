"use client";

import { useState } from "react";
import type { User } from "@/types";

const CATEGORY_OPTIONS = [
  "",
  "Call Back",
  "Estimate for New System",
  "Free 2nd Opinion",
  "Repair Estimate",
  "Other",
  "Maintenance",
];

const HEAR_OPTIONS = [
  "",
  "Google",
  "Yelp",
  "Nextdoor",
  "Referral",
  "Repeat Customer",
  "Other",
];

interface IntakeFormProps {
  user: User;
  selectedSlot: string | null;
  onClearSlot: () => void;
}

interface FormState {
  reason_for_call: string;
  first_name: string;
  last_name: string;
  address: string;
  unit: string;
  zip_code: string;
  phone: string;
  ok_to_text: string;
  gated: string;
  gate_code: string;
  email: string;
  notes_to_tech: string;
  category: string;
  how_did_you_hear: string;
}

const INITIAL_FORM: FormState = {
  reason_for_call: "",
  first_name: "",
  last_name: "",
  address: "",
  unit: "",
  zip_code: "",
  phone: "",
  ok_to_text: "Yes",
  gated: "No",
  gate_code: "",
  email: "",
  notes_to_tech: "",
  category: "",
  how_did_you_hear: "",
};

export default function IntakeForm({ user, selectedSlot, onClearSlot }: IntakeFormProps) {
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.reason_for_call.trim()) errs.reason_for_call = "Reason for the call is required";
    if (!form.first_name.trim()) errs.first_name = "First name is required";
    if (!form.last_name.trim()) errs.last_name = "Last name is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.zip_code.trim()) errs.zip_code = "Zip code is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.how_did_you_hear) errs.how_did_you_hear = "This field is required";
    if (!selectedSlot) errs.selected_slot = "Please select an appointment slot";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        unit: form.unit.trim(),
        zip_code: form.zip_code.trim(),
        email: form.email.trim(),
        ok_to_text: form.ok_to_text,
        gated: form.gated,
        gate_code: form.gated === "Yes" ? form.gate_code.trim() : "",
        reason_for_call: form.reason_for_call.trim(),
        notes_to_tech: form.notes_to_tech.trim(),
        category: form.category,
        how_did_you_hear: form.how_did_you_hear,
        selected_slot: selectedSlot,
        opportunity_owner: user.name,
        intake_source: "live_intake",
      };

      const res = await fetch(process.env.NEXT_PUBLIC_SUBMIT_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      setBanner({ type: "success", message: "Appointment booked! Form has been cleared." });
      setForm({ ...INITIAL_FORM });
      onClearSlot();
      setErrors({});
    } catch {
      setBanner({ type: "error", message: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 bg-[#0d0f14] border border-[#252830] rounded text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 text-sm";
  const labelClass = "block text-sm text-gray-400 mb-1";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <div className="bg-[#161920] border border-[#252830] rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Call Intake</h2>

      {banner && (
        <div
          className={`mb-4 p-3 rounded text-sm font-medium ${
            banner.type === "success"
              ? "bg-green-900/30 border border-green-700 text-green-400"
              : "bg-red-900/30 border border-red-700 text-red-400"
          }`}
        >
          {banner.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Reason for Call */}
        <div>
          <label className={labelClass}>Reason for the Call *</label>
          <textarea
            value={form.reason_for_call}
            onChange={(e) => update("reason_for_call", e.target.value)}
            className={`${inputClass} h-20 resize-none`}
            placeholder="e.g. AC not cooling"
          />
          {errors.reason_for_call && <p className={errorClass}>{errors.reason_for_call}</p>}
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              className={inputClass}
              placeholder="First"
            />
            {errors.first_name && <p className={errorClass}>{errors.first_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className={inputClass}
              placeholder="Last"
            />
            {errors.last_name && <p className={errorClass}>{errors.last_name}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Address *</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            placeholder="Street address"
          />
          {errors.address && <p className={errorClass}>{errors.address}</p>}
        </div>

        {/* Unit + Zip Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Unit #</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              className={inputClass}
              placeholder="Apt, Suite, etc."
            />
          </div>
          <div>
            <label className={labelClass}>Zip Code *</label>
            <input
              type="text"
              value={form.zip_code}
              onChange={(e) => update("zip_code", e.target.value)}
              className={inputClass}
              placeholder="Zip"
            />
            {errors.zip_code && <p className={errorClass}>{errors.zip_code}</p>}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone *</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="Phone number"
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        {/* OK to Text */}
        <div>
          <label className={labelClass}>OK to Text? *</label>
          <div className="flex gap-2">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update("ok_to_text", opt)}
                className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
                  form.ok_to_text === opt
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-[#252830] bg-[#0d0f14] text-gray-400 hover:border-gray-500"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Gated */}
        <div>
          <label className={labelClass}>Gated? *</label>
          <div className="flex gap-2">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update("gated", opt)}
                className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
                  form.gated === opt
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-[#252830] bg-[#0d0f14] text-gray-400 hover:border-gray-500"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Gate Code — conditional */}
        {form.gated === "Yes" && (
          <div>
            <label className={labelClass}>Gate Code</label>
            <input
              type="text"
              value={form.gate_code}
              onChange={(e) => update("gate_code", e.target.value)}
              className={inputClass}
              placeholder="Gate code"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="text"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="Email address"
          />
        </div>

        {/* Notes to Tech */}
        <div>
          <label className={labelClass}>Anything Else / Notes to Tech</label>
          <textarea
            value={form.notes_to_tech}
            onChange={(e) => update("notes_to_tech", e.target.value)}
            className={`${inputClass} h-16 resize-none`}
            placeholder="e.g. Dog in backyard"
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            <option value="">— Select —</option>
            {CATEGORY_OPTIONS.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category}</p>}
        </div>

        {/* How Did You Hear */}
        <div>
          <label className={labelClass}>How Did You Hear About Us *</label>
          <select
            value={form.how_did_you_hear}
            onChange={(e) => update("how_did_you_hear", e.target.value)}
            className={inputClass}
          >
            <option value="">— Select —</option>
            {HEAR_OPTIONS.filter(Boolean).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.how_did_you_hear && <p className={errorClass}>{errors.how_did_you_hear}</p>}
        </div>

        {/* Slot validation error */}
        {errors.selected_slot && (
          <p className={errorClass}>{errors.selected_slot}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
        >
          {submitting ? "Submitting..." : "Submit Intake"}
        </button>
      </form>
    </div>
  );
}
