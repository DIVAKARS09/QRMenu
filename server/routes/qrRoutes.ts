import { Router } from 'express';
import QRCode from 'qrcode';
import { dbStore } from '../store';

export const qrRouter = Router();

// Generate Data URL for QR Code pointing to public menu
qrRouter.get('/generate/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = dbStore.findShopBySlug(slug);

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Determine base URL from host or environment
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const targetMenuUrl = `${protocol}://${host}/menu/${slug}`;

    const qrDataUrl = await QRCode.toDataURL(targetMenuUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#111827', // Slate 900
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const qrSvg = await QRCode.toString(targetMenuUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    return res.json({
      slug,
      shopName: shop.name,
      targetUrl: targetMenuUrl,
      qrDataUrl,
      qrSvg,
    });
  } catch (err: any) {
    console.error('QR generation error:', err);
    return res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Downloadable PNG QR Code
qrRouter.get('/download/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = dbStore.findShopBySlug(slug);

    if (!shop) {
      return res.status(404).send('Shop not found');
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const targetMenuUrl = `${protocol}://${host}/menu/${slug}`;

    const buffer = await QRCode.toBuffer(targetMenuUrl, {
      width: 800,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-menu-qr.png"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).send('Failed to generate downloadable QR code');
  }
});
