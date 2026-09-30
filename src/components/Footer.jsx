import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#071A2B] text-white">
      <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#4DA8D8] to-[#BFE8F7]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#071A2B]" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold">Polar<span className="text-[#4DA8D8]">Setu</span></div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">NCPOR · MoES</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link to="/explore" className="hover:text-[#4DA8D8]">Explore Dashboard</Link></li>
              <li><Link to="/search" className="hover:text-[#4DA8D8]">Repository Search</Link></li>
              <li><Link to="/map" className="hover:text-[#4DA8D8]">Interactive Map</Link></li>
              <li><Link to="/learn" className="hover:text-[#4DA8D8]">Education Hub</Link></li>
              <li><Link to="/glossary" className="hover:text-[#4DA8D8]">Glossary</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Institution</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4DA8D8]" /> National Centre for Polar and Ocean Research, Goa</li>
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#4DA8D8]" /> Ministry of Earth Sciences, Government of India</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Policies</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link to="/policies" className="hover:text-[#4DA8D8]">Privacy Policy</Link></li>
              <li><Link to="/policies" className="hover:text-[#4DA8D8]">Accessibility Statement</Link></li>
              <li><Link to="/policies" className="hover:text-[#4DA8D8]">Data Sources & Attribution</Link></li>
              <li><Link to="/policies" className="hover:text-[#4DA8D8]">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} National Centre for Polar and Ocean Research, Ministry of Earth Sciences, Government of India.</p>
            <p className="flex items-center gap-1.5">
              <span className="rounded border border-saffron/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase" style={{ color: "hsl(31 89% 60%)" }}>Prototype</span>
              Demo platform — not production data
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}