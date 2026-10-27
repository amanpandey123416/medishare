import React, { useState, useEffect } from 'react';
import { HandoverRecord } from '../types';
import { generateQRCodeDataURL, parseAndValidateQR } from '../utils/qrHelper';
import { useApp } from '../context/AppContext';
import { QrCode, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check, X } from 'lucide-react';

interface QRHandoverModalProps {
  handover: HandoverRecord;
  mode: 'view-qr' | 'verify-code';
  actionType: 'HANDOVER' | 'RETURN';
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRHandoverModal: React.FC<QRHandoverModalProps> = ({
  handover,
  mode: initialMode,
  actionType,
  onClose,
  onSuccess
}) => {
  const { confirmHandover, confirmReturn, currentUser } = useApp();
  const [mode, setMode] = useState<'view-qr' | 'verify-code'>(initialMode);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadQR() {
      const dataUrl = await generateQRCodeDataURL({
        transactionCode: handover.transactionCode,
        equipmentId: handover.equipmentId,
        equipmentName: handover.equipmentName,
        donorId: handover.donorId,
        borrowerId: handover.borrowerId,
        type: handover.type,
        action: actionType,
        timestamp: new Date().toISOString()
      });
      setQrDataUrl(dataUrl);
    }
    loadQR();
  }, [handover, actionType]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(handover.transactionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setInputCode(handover.transactionCode);
  };

  const handleVerify = () => {
    setFeedback(null);
    const parsed = parseAndValidateQR(inputCode);
    if (!parsed.valid || !parsed.payload?.transactionCode) {
      setFeedback({ type: 'error', message: parsed.error || 'Invalid handover code format.' });
      return;
    }

    const codeToVerify = parsed.payload.transactionCode;

    if (actionType === 'HANDOVER') {
      const res = confirmHandover(codeToVerify, verificationNotes);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else {
      const res = confirmReturn(codeToVerify, verificationNotes);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-base">
                {actionType === 'HANDOVER' ? 'Equipment Handover Verification' : 'Equipment Return Verification'}
              </h3>
              <p className="text-xs text-slate-500">
                Transaction: <span className="font-mono font-medium">{handover.transactionCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Show QR vs Verify Code */}
        <div className="flex rounded-lg bg-slate-100 p-1 mt-4 text-xs font-medium">
          <button
            onClick={() => setMode('view-qr')}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'view-qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Display QR Code
          </button>
          <button
            onClick={() => setMode('verify-code')}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'verify-code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scan / Confirm Code
          </button>
        </div>

        {mode === 'view-qr' ? (
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="MediShare Handover QR Code"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                  Generating secure token...
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <code className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                {handover.transactionCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 max-w-sm">
              Present this QR code to the donor or receiving NGO coordinator at the handover location.
            </p>

            <div className="mt-4 w-full bg-slate-50 rounded-xl p-3 border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Equipment:</span>
                <span className="font-semibold text-slate-800">{handover.equipmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Donor:</span>
                <span className="text-slate-700">{handover.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="text-slate-700">{handover.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled:</span>
                <span className="text-slate-700">{handover.scheduledDate}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Handover / Return Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. MS-HO-419024"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer"
                >
                  Autofill Code
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection & Handover Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Physical sanitization verified; operating levers intact..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={!inputCode.trim()}
              className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {actionType === 'HANDOVER' ? 'Confirm & Record Handover' : 'Confirm Return to Inventory'}
              </span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            QR confirmation securely logs chain of custody. It does not certify medical or diagnostic suitability.
          </span>
        </div>
      </div>
    </div>
  );
};
