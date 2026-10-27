import QRCode from 'qrcode';

export interface QRHandoverPayload {
  transactionCode: string;
  equipmentId: string;
  equipmentName: string;
  donorId: string;
  borrowerId: string;
  type: 'Lending' | 'Donation';
  action: 'HANDOVER' | 'RETURN';
  timestamp: string;
}

export async function generateQRCodeDataURL(payload: QRHandoverPayload): Promise<string> {
  try {
    const jsonString = JSON.stringify(payload);
    return await QRCode.toDataURL(jsonString, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export function parseAndValidateQR(qrText: string): { valid: boolean; payload?: QRHandoverPayload; error?: string } {
  try {
    const data = JSON.parse(qrText.trim());
    if (!data.transactionCode || !data.equipmentId || !data.action) {
      return { valid: false, error: 'Invalid QR code schema for MediShare handover verification.' };
    }
    return { valid: true, payload: data as QRHandoverPayload };
  } catch {
    // If user enters transaction code manually like "MS-HO-419024"
    const cleaned = qrText.trim();
    if (cleaned.startsWith('MS-HO-')) {
      return {
        valid: true,
        payload: {
          transactionCode: cleaned,
          equipmentId: '',
          equipmentName: '',
          donorId: '',
          borrowerId: '',
          type: 'Lending',
          action: 'HANDOVER',
          timestamp: new Date().toISOString()
        }
      };
    }
    return { valid: false, error: 'Unrecognized handover code format.' };
  }
}
