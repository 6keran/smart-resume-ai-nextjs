'use client';

import React from 'react';
import { Download } from 'lucide-react';

export function PrintCertificateButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
    >
      <Download className="w-4 h-4" />
      Download A4 PDF / Print
    </button>
  );
}
