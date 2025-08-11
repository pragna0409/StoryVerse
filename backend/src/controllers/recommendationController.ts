// backend/src/controllers/recommendationController.ts
export class RecommendationController {
    constructor(
      private recommendationService: RecommendationService,
      private aiService: AIService
    ) {}
  
    async getPersonalizedRecommendations(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const { limit = 10, refresh = false } = req.query;
  
        // Check cache first (unless refresh requested)
        if (!refresh) {
          const cachedRecs = await this.recommendationService.getCachedRecommendations(userId);
          if (cachedRecs) {
            return res.json({ recommendations: cachedRecs });
          }
        }
  
        // Get user profile and preferences
        const userProfile = await this.recommendationService.getUserProfile(userId);
  
        // Generate recommendations using AI service
        const recommendations = await this.aiService.generateRecommendations(
          userId,
          userProfile,
          Number(limit)
        );
  
        // Cache recommendations
        await this.recommendationService.cacheRecommendations(userId, recommendations);
  
        // Log recommendation event for analytics
        await this.recommendationService.logRecommendationEvent(userId, recommendations);
  
        res.json({ recommendations });
      } catch (error) {
        console.error('Recommendation generation failed:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
      }
    }
  
    async analyzeSocialMedia(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const { platform, accessToken } = req.body;
  
        let analysis;
  
        switch (platform) {
          case 'pinterest':
            analysis = await this.aiService.analyzePinterestAccount(accessToken);
            break;
          case 'spotify':
            analysis = await this.aiService.analyzeSpotifyAccount(accessToken);
            break;
          default:
            return res.status(400).json({ error: 'Unsupported platform' });
        }
  
        // Save analysis to user profile
        await this.recommendationService.updateSocialAnalysis(userId, platform, analysis);
  
        // Generate updated recommendations
        const updatedProfile = await this.recommendationService.getUserProfile(userId);
        const recommendations = await this.aiService.generateRecommendations(
          userId,
          updatedProfile,
          10
        );
  
        res.json({
          analysis,
          recommendations,
          message: `${platform} analysis completed successfully`
        });
      } catch (error) {
        console.error('Social media analysis failed:', error);
        res.status(500).json({ error: 'Social media analysis failed' });
      }
    }
  
    async trackRecommendationInteraction(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const { bookId, action, recommendationType } = req.body;
  
        // Valid actions: 'clicked', 'added_to_library', 'dismissed', 'rated'
        await this.recommendationService.trackInteraction(
          userId,
          bookId,
          action,
          recommendationType
        );
  
        // Update recommendation model based on feedback
        if (action === 'rated' || action === 'added_to_library') {
          await this.aiService.updateRecommendationModel(userId, bookId, action);
        }
  
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to track interaction' });
      }
    }
  
    async getRecommendationExplanation(req: Request, res: Response) {
      try {
        const userId = req.user.id;
        const { bookId } = req.params;
  
        const explanation = await this.recommendationService.getRecommendationExplanation(
          userId,
          bookId
        );
  
        res.json({ explanation });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get explanation' });
      }
    }
  }
  