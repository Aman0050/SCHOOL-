import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, email } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, email },
    });

    res.json({ success: true, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const avatarUrl = `/uploads/${file.filename}`;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: { userId, avatarUrl },
    });

    res.json({ success: true, avatarUrl: profile.avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

export const disableMfa = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid password' });

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null, backupCodes: [] }
    });

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable MFA' });
  }
};

export const updateSchoolDetails = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, address, website, academicYear } = req.body;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { name },
    });

    const school = await prisma.school.findFirst({ where: { tenantId } });
    if (school) {
      await prisma.school.update({
        where: { id: school.id },
        data: { name, address },
      });
    }

    res.json({ success: true, message: 'School details updated' });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ success: false, message: 'Failed to update school details' });
  }
};

export const updateNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const preferences = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferences },
    });

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
