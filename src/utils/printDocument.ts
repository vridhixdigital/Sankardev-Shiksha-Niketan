/**
 * Professional Print and PDF Export Utility
 * Sankardev Shiksha Niketan, Gohpur · Smart School ERP
 */

export interface PrintDocumentOptions {
  /** Title of the document to be used as default PDF export filename */
  title: string;
  /** Optional custom filename (without .pdf extension) */
  filename?: string;
  /** Optional orientation preference */
  orientation?: 'portrait' | 'landscape';
  /** Optional element ID to highlight */
  targetId?: string;
}

/**
 * Triggers browser print dialog with optimized document title and cleanup.
 * When the user selects "Save as PDF", the browser uses `document.title`
 * as the default suggested file name.
 */
export function printDocument(options: PrintDocumentOptions | string): void {
  const opts: PrintDocumentOptions =
    typeof options === 'string' ? { title: options } : options;

  const originalTitle = document.title;
  const cleanTitle = (opts.filename || opts.title)
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const pdfDocumentTitle = `${cleanTitle}_SSN_Gohpur`;

  // Set document title so PDF save dialog suggests clean name
  document.title = pdfDocumentTitle;

  // Add print tracking class to body
  document.body.classList.add('is-printing-document');
  if (opts.orientation === 'landscape') {
    document.body.classList.add('print-landscape-mode');
  }

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.title = originalTitle;
    document.body.classList.remove('is-printing-document');
    document.body.classList.remove('print-landscape-mode');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Fallback cleanup in case afterprint does not fire in older engines
  setTimeout(() => {
    cleanup();
  }, 3000);

  // Trigger print after microtask tick to let title update settle
  requestAnimationFrame(() => {
    setTimeout(() => {
      window.print();
    }, 50);
  });
}

/**
 * Convert numerical currency amounts into formal Indian English words
 * e.g. 47850 -> "Rupees Forty-Seven Thousand Eight Hundred and Fifty Only"
 */
export function formatCurrencyToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Rupees Zero Only';

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    const unit = n % 10;
    return `${tens[Math.floor(n / 10)]}${unit ? `-${units[unit]}` : ''}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred && rest) {
      return `${units[hundred]} Hundred and ${convertTwoDigits(rest)}`;
    }
    if (hundred) return `${units[hundred]} Hundred`;
    return convertTwoDigits(rest);
  }

  const rounded = Math.floor(Math.abs(amount));
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  const parts: string[] = [];

  if (crore > 0) parts.push(`${convertThreeDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertThreeDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertThreeDigits(thousand)} Thousand`);
  if (remainder > 0) parts.push(convertThreeDigits(remainder));

  return `Rupees ${parts.join(' ')} Only`;
}

/**
 * Returns formatted current verification timestamp for print stamps
 */
export function getInstitutionalVerificationTimestamp(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} at ${timeStr} IST`;
}
