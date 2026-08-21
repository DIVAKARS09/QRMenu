import { useState, useEffect, useRef } from 'react';
import { Download, Printer, Copy, Check, QrCode, ExternalLink, Sparkles, UtensilsCrossed, Globe, Info, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';
import { Shop } from '../types';

interface QRPosterModalProps {
  shop: Shop;
  onClose?: () => void;
}

export function QRPosterModal({ shop, onClose }: QRPosterModalProps) {
  const [customOrigin, setCustomOrigin] = useState<string>(() => {
    // If running in development inside Google AI Studio, try to default or allow custom
    return window.location.origin;
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const isInternalAiStudioUrl =
    window.location.hostname.includes('aistudio.google.com') ||
    window.location.hostname.includes('googleusercontent.com');

  const cleanOrigin = customOrigin.trim().replace(/\/+$/, '');
  const menuUrl = `${cleanOrigin}/menu/${shop.slug}`;

  useEffect(() => {
    if (!cleanOrigin) return;
    QRCode.toDataURL(menuUrl, {
      width: 720,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation failed', err));
  }, [menuUrl, cleanOrigin]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      prompt('Copy menu link:', menuUrl);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${shop.slug}-digital-menu-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 403 / Private Workspace Notice if on aistudio domain */}
      {isInternalAiStudioUrl && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-amber-950 text-sm">
              Why other phones show "403 Forbidden"
            </h4>
            <p className="leading-relaxed text-amber-800">
              You are currently viewing this inside the <strong>Google AI Studio developer preview</strong> (<code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-[11px]">aistudio.google.com</code>). That private link requires your developer login session, so other phones cannot open it.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-amber-950">To test on another phone:</span>
              <span>1. Click <strong>Share</strong> (top-right of AI Studio) or deploy to Cloud Run to get your public link.</span>
              <span>2. Click <strong>"Change Menu URL"</strong> below and paste the public link.</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-500" />
            Digital Menu QR Code
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Display this QR standee on your food truck counter, tables, or vehicle body.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setIsEditingUrl(!isEditingUrl)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>{isEditingUrl ? 'Close URL Config' : 'Change Menu URL / Domain'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Menu URL'}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Standee</span>
          </button>
        </div>
      </div>

      {/* Optional Custom Base URL Configuration Input */}
      {isEditingUrl && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-500" />
              Public Base URL / Domain
            </h3>
            <button
              onClick={() => setCustomOrigin(window.location.origin)}
              className="text-[11px] font-semibold text-orange-600 hover:underline"
            >
              Reset to Current Host
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Paste your <strong>Shared App URL</strong> (from AI Studio's Share menu) or your custom production domain (e.g. <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono">https://my-food-truck.app</code>) so customers on any mobile phone can scan and order without authentication issues.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://ais-pre-...run.app or https://yourdomain.com"
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>
          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
            <span className="truncate"><strong>Generated Target:</strong> {menuUrl}</span>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-semibold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Test Open</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Printable Poster Container */}
      <div className="flex justify-center p-2 sm:p-6 bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden">
        <div
          ref={posterRef}
          id="printable-poster"
          className="w-full max-w-sm bg-white rounded-3xl shadow-lg border-4 border-orange-500 p-6 sm:p-8 text-center flex flex-col items-center relative overflow-hidden"
        >
          {/* Decorative Corner Badges */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full pointer-events-none" />

          {/* Shop Logo & Name */}
          <div className="w-16 h-16 rounded-2xl bg-orange-500 p-0.5 shadow-sm mb-3 flex items-center justify-center overflow-hidden">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <UtensilsCrossed className="w-8 h-8 text-white" />
            )}
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-0.5 rounded-full border border-orange-200 mb-1">
            DIGITAL MENU
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {shop.name}
          </h1>

          <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
            {shop.customTagline || 'Scan • Explore • Choose freshly prepared hot food'}
          </p>

          {/* QR Code Container */}
          <div className="my-5 p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-md ring-4 ring-orange-100">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR Code for ${shop.name}`} className="w-52 h-52 sm:w-56 sm:h-56 object-contain" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-slate-100 animate-pulse text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Scan Instructions Callout */}
          <div className="w-full bg-slate-900 text-white rounded-2xl p-3 shadow-xs space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Phone Camera & Scan</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              View live prices, today's specials & place hot orders
            </p>
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center space-y-0.5">
            <p className="text-[11px] font-bold text-slate-700 truncate">{shop.address}, {shop.location}</p>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">{menuUrl}</p>
          </div>
        </div>
      </div>

      {/* Print-specific style block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-poster, #printable-poster * {
            visibility: visible;
          }
          #printable-poster {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none;
            border-width: 3px;
            width: 80% !important;
            max-width: 480px !important;
          }
        }
      `}</style>
    </div>
  );
}
