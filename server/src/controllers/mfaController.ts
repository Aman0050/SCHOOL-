import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { prisma } from '../config/db';

export const generateMfaSecret = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `EduXeno (${req.user!.email})`
    });

    // Save secret to user (not yet enabled)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
      }
    });

    // Generate QR Code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    // Log security event
    await prisma.securityEvent.create({
      data: {
        tenantId: req.user!.tenantId,
        userId,
        eventType: 'MFA_SETUP_INITIATED',
        severity: 'LOW',
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAndEnableMfa = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ success: false, message: 'MFA not initiated' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 12).toUpperCase()
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          backupCodes
        }
      });

      await prisma.securityEvent.create({
        data: {
          tenantId: req.user!.tenantId,
          userId,
          eventType: 'MFA_ENABLED',
          severity: 'MEDIUM',
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });

      res.status(200).json({
        success: true,
        message: 'MFA successfully enabled',
        data: { backupCodes }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid TOTP token' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
