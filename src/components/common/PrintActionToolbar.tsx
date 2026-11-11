import React from 'react';
import { Printer, Download, X, HelpCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { printDocument, PrintDocumentOptions } from '../../utils/printDocument';

interface PrintActionToolbarProps {
  documentTitle: string;
  documentSubtitle?: string;
  badgeLabel?: string;
  badgeColor?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  onClose?: () => void;
  onCustomPrint?: () => void;
  showPdfNotice?: boolean;
}

export const PrintActionToolbar: React.FC<PrintActionToolbarProps> = ({
  documentTitle,
  documentSubtitle,
  badgeLabel = 'OFFICIAL INSTITUTIONAL RECORD',
  badgeColor = 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  filename,
  orientation = 'portrait',
  onClose,
  onCustomPrint,
  showPdfNotice = true,
}) => {
  const handlePrint = () => {
    if (onCustomPrint) {
      onCustomPrint();
    } else {
      printDocument({
        title: documentTitle,
        filename: filename || documentTitle,
        orientation,
      });
    }
  };

  return (
    <div className="no-print space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badgeColor}`}>
              {badgeLabel}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Format: {orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'} · High-Resolution Vector
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
            {documentTitle}
          </h3>
          {documentSubtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{documentSubtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
            title="Open Print Dialog (Ctrl/Cmd + P) to Print or Save as PDF"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print / Save as PDF</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-blue-950/60 rounded text-blue-200">
              Ctrl+P
            </kbd>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showPdfNotice && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-900 dark:text-amber-300">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>To export as PDF:</strong> Select <em>"Save as PDF"</em> under Destination in the print prompt. Check <em>"Background graphics"</em> for official colors and crests.
          </span>
        </div>
      )}
    </div>
  );
};
