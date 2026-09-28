"use client";

import { useState } from "react";

type Props = { query: string; address: string; buttonLabel: string; note: string };

/** No iframe (and no Google request) until the visitor asks for the map. */
export function MapClickToLoad({ query, address, buttonLabel, note }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-line bg-bg-alt">
      {loaded ? (
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          title="Map showing Enoteca Ombra, Wolfstraat, Maastricht"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
          <p className="font-display text-2xl text-ink md:text-3xl">{address}</p>
          <button type="button" className="btn btn-outline" onClick={() => setLoaded(true)}>
            {buttonLabel}
          </button>
          <p className="text-[13px] text-muted">{note}</p>
        </div>
      )}
    </div>
  );
}
