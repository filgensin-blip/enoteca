"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { copy } from "@/data/copy";
import { siteInfo } from "@/data/site-info";
import {
  BOOKING_FIELDS,
  MAX_DAYS_AHEAD,
  MAX_PARTY,
  NOTES_MAX,
  validateBooking,
  validateField,
  type BookingErrors,
  type BookingField,
  type BookingInput,
} from "@/lib/booking";
import { addDaysISO, getNowInZone, getSlots, isClosedDay } from "@/lib/hours";
import { firstName, formatDateLong } from "@/lib/format";

type Values = Omit<BookingInput, "party"> & { party: string };
type Success = { name: string; email: string; date: string; time: string; party: number; emailSent: boolean };

const LABELS: Record<BookingField, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone (optional)",
  date: "Date",
  time: "Time",
  party: "Guests",
  notes: "Notes or allergies (optional)",
};

const initial: Values = { name: "", email: "", phone: "", date: "", time: "", party: "2", notes: "", company: "" };

export function BookingForm() {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [summary, setSummary] = useState<BookingErrors | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Amsterdam "today" is read on the client after mount so min/max are right in any time zone.
  useEffect(() => {
    const id = requestAnimationFrame(() => setToday(getNowInZone().dateISO));
    return () => cancelAnimationFrame(id);
  }, []);

  const slots = useMemo(() => (values.date ? getSlots(values.date) : []), [values.date]);
  const closedDay = Boolean(values.date) && /^\d{4}-\d{2}-\d{2}$/.test(values.date) && isClosedDay(values.date);

  useEffect(() => {
    if (summary && Object.keys(summary).length) summaryRef.current?.focus();
  }, [summary]);
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const asInput = (v: Values): Partial<BookingInput> => ({ ...v, party: Number(v.party) });

  const update = (field: keyof Values, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // A new date may invalidate the chosen time.
      if (field === "date" && prev.time && !getSlots(value).includes(prev.time)) next.time = "";
      return next;
    });
    if (field in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        const msg = validateField(field as BookingField, asInput({ ...values, [field]: value }));
        if (msg) next[field as BookingField] = msg;
        else delete next[field as BookingField];
        return next;
      });
    }
  };

  const onBlur = (field: BookingField) => {
    // Don't nag about empty fields the visitor hasn't reached yet.
    if (!values[field] && field !== "party") return;
    const msg = validateField(field, asInput(values));
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const result = validateBooking(asInput(values));
    if (!result.ok) {
      setErrors(result.errors);
      setSummary({ ...result.errors });
      return;
    }
    setSending(true);
    setSummary(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...asInput(values), company: values.company }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; emailSent?: boolean; errors?: BookingErrors };
      if (res.ok && body.ok) {
        setSuccess({ ...result.data, emailSent: Boolean(body.emailSent) });
        return;
      }
      const errs: BookingErrors =
        body.errors && Object.keys(body.errors).length
          ? body.errors
          : { form: `Something went wrong on our side. Please call us on ${siteInfo.phoneDisplay} and we'll book you in.` };
      setErrors(errs);
      setSummary(errs);
    } catch {
      const errs = { form: `We couldn't reach the server. Please check your connection, or call us on ${siteInfo.phoneDisplay}.` };
      setErrors(errs);
      setSummary(errs);
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div role="status" className="border-t border-line pt-10">
        <h2 ref={successRef} tabIndex={-1} className="h-section text-ink outline-none">
          {copy.book.successTitle}, <span className="italic">{firstName(success.name)}.</span>
        </h2>
        <p className="prose-width mt-6 text-lg text-ink/90">
          {success.emailSent
            ? `We've sent a confirmation to ${success.email}.`
            : `We've received your request. To be sure, please give us a quick call on ${siteInfo.phoneDisplay}.`}
        </p>
        <dl className="mt-10 grid grid-cols-3 border-y border-line">
          {[
            ["Date", formatDateLong(success.date)],
            ["Time", success.time],
            ["Guests", String(success.party)],
          ].map(([k, v], i) => (
            <div key={k} className={clsx("py-6", i > 0 ? "border-l border-line pl-4 md:pl-8" : "pr-4")}>
              <dt className="text-[13px] text-muted">{k}</dt>
              <dd className="mt-2 font-display text-2xl text-ink md:text-3xl">{v}</dd>
            </div>
          ))}
        </dl>
        {!success.emailSent && (
          <p className="mt-6">
            <a href={`tel:${siteInfo.phone}`} className="btn btn-primary">
              Call {siteInfo.phoneDisplay}
            </a>
          </p>
        )}
        <Link href="/menu" className="link mt-8 inline-flex items-center gap-2 font-medium">
          Back to the menu <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const describedBy = (field: BookingField, extra?: string) =>
    clsx(errors[field] && `${field}-error`, extra) || undefined;

  const fieldError = (field: BookingField) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-2 text-[14px] text-error">
        {errors[field]}
      </p>
    ) : null;

  const label = (field: BookingField) => (
    <label htmlFor={field} className="mb-2 block text-[14px] font-medium text-ink">
      {LABELS[field]}
    </label>
  );

  const max = today ? addDaysISO(today, MAX_DAYS_AHEAD) : undefined;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-7" aria-describedby="booking-privacy">
      {summary && Object.keys(summary).length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border border-error/60 bg-bg-alt p-5 outline-none">
          <p className="font-medium text-ink">
            {summary.form ? summary.form : "Please check the following:"}
          </p>
          {BOOKING_FIELDS.some((f) => summary[f]) && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
              {BOOKING_FIELDS.filter((f) => summary[f]).map((f) => (
                <li key={f}>
                  <a href={`#${f}`} className="link link-error" onClick={(e) => { e.preventDefault(); document.getElementById(f)?.focus(); }}>
                    {summary[f]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-7 md:grid-cols-2">
        <div>
          {label("name")}
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            className="field"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => onBlur("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
          />
          {fieldError("name")}
        </div>
        <div>
          {label("email")}
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={120}
            className="field"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => onBlur("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
          />
          {fieldError("email")}
        </div>
      </div>

      <div>
        {label("phone")}
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          className="field md:max-w-[calc(50%-14px)]"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          onBlur={() => onBlur("phone")}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone")}
        />
        {fieldError("phone")}
      </div>

      <div className="grid gap-7 md:grid-cols-3">
        <div>
          {label("date")}
          <input
            id="date"
            name="date"
            type="date"
            required
            min={today ?? undefined}
            max={max}
            className="field"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            onBlur={() => onBlur("date")}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={describedBy("date")}
          />
          {fieldError("date")}
        </div>
        <div>
          {label("time")}
          <select
            id="time"
            name="time"
            required
            className="field tabular"
            value={values.time}
            disabled={!values.date || slots.length === 0}
            onChange={(e) => update("time", e.target.value)}
            onBlur={() => onBlur("time")}
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={describedBy("time")}
          >
            {!values.date ? (
              <option value="">Choose a date first</option>
            ) : slots.length === 0 ? (
              <option value="">{closedDay ? "Closed on this day" : "No times left on this day"}</option>
            ) : (
              <>
                <option value="">Choose a time</option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </>
            )}
          </select>
          {fieldError("time")}
        </div>
        <div>
          {label("party")}
          <select
            id="party"
            name="party"
            className="field"
            value={values.party}
            onChange={(e) => update("party", e.target.value)}
            onBlur={() => onBlur("party")}
            aria-invalid={errors.party ? true : undefined}
            aria-describedby={describedBy("party", "party-help")}
          >
            {Array.from({ length: MAX_PARTY }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
          {fieldError("party")}
        </div>
      </div>
      <p id="party-help" className="-mt-4 text-[14px] text-muted">
        {copy.book.partyHelp}
      </p>

      <div>
        {label("notes")}
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={NOTES_MAX}
          className="field resize-y"
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          onBlur={() => onBlur("notes")}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={describedBy("notes", "notes-count")}
        />
        <p id="notes-count" className="mt-2 text-right text-[13px] text-muted tabular">
          {values.notes.length}/{NOTES_MAX}
        </p>
        {fieldError("notes")}
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto size-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full md:w-auto" disabled={sending} aria-disabled={sending}>
          {sending ? copy.book.sending : copy.book.submit}
        </button>
        <p id="booking-privacy" className="mt-4 text-[14px] text-muted">
          {copy.book.privacy}{" "}
          <Link href="/privacy" className="link">
            Privacy
          </Link>
        </p>
      </div>
    </form>
  );
}
