// backend/src/controllers/profileController.ts
export class ProfileController {
    async updateProfile(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const updates = req.body;
  
        const updatedUser = await this.userModel.updateProfile(userId, updates);
        res.json({ user: updatedUser });
      } catch (error) {
        res.status(500).json({ error: 'Profile update failed' });
      }
    }
  
    async uploadAvatar(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const file = req.file;
  
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
  
        const avatarUrl = await this.fileService.uploadAvatar(userId, file);
        await this.userModel.updateAvatar(userId, avatarUrl);
  
        res.json({ avatarUrl });
      } catch (error) {
        res.status(500).json({ error: 'Avatar upload failed' });
      }
    }
  }
  