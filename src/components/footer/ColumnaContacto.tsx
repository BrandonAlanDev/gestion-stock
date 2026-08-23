"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";

interface ColumnaContactoProps {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
}

export default function ColumnaContacto({ phone, whatsapp, email }: ColumnaContactoProps) {
  if (!phone && !whatsapp && !email) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">
        Contacto
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {phone && (
          <li>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              <Phone size={14} />
              {phone}
            </a>
          </li>
        )}
        {whatsapp && (
          <li>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </li>
        )}
        {email && (
          <li>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 break-all opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              <Mail size={14} />
              {email}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
