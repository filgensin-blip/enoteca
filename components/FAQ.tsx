import { faq } from "@/data/faq";

export function FAQ() {
  return (
    <div className="faq border-t border-line">
      {faq.map((item) => (
        <details key={item.q} className="border-b border-line">
          <summary className="flex items-center justify-between gap-6 py-5 text-lg font-medium text-ink">
            <span>{item.q}</span>
            <span className="faq-marker" aria-hidden="true" />
          </summary>
          <p className="prose-width pb-6 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
