// backend/src/services/pinterestService.ts
export class PinterestService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
  
    constructor() {
      this.clientId = process.env.PINTEREST_CLIENT_ID!;
      this.clientSecret = process.env.PINTEREST_CLIENT_SECRET!;
      this.redirectUri = process.env.PINTEREST_REDIRECT_URI!;
    }
  
    getAuthorizationUrl(state: string): string {
      const scopes = ['read_public', 'read_secret'].join(',');
  
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: scopes,
        state: state
      });
  
      return `https://www.pinterest.com/oauth/?${params.toString()}`;
    }
  
    async exchangeCodeForToken(code: string): Promise<PinterestTokens> {
      try {
        const response = await axios.post(
          '<https://api.pinterest.com/v5/oauth/token>',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            client_secret: this.clientSecret
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
  
        return response.data;
      } catch (error) {
        throw new Error('Failed to exchange code for token');
      }
    }
  
    async getUserInfo(accessToken: string): Promise<PinterestUser> {
      try {
        const response = await axios.get(
          '<https://api.pinterest.com/v5/user_account>',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
  
        return response.data;
      } catch (error) {
        throw new Error('Failed to get user info');
      }
    }
  
    async getUserBoards(accessToken: string): Promise<PinterestBoard[]> {
      try {
        const response = await axios.get(
          '<https://api.pinterest.com/v5/boards>',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
  
        return response.data.items;
      } catch (error) {
        throw new Error('Failed to get user boards');
      }
    }
  
    async getBoardPins(accessToken: string, boardId: string): Promise<PinterestPin[]> {
      try {
        const response = await axios.get(
          `https://api.pinterest.com/v5/boards/${boardId}/pins`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
  
        return response.data.items;
      } catch (error) {
        throw new Error('Failed to get board pins');
      }
    }
  
    async analyzeUserAesthetics(accessToken: string): Promise<AestheticAnalysis> {
      try {
        const boards = await this.getUserBoards(accessToken);
        const analysis: AestheticAnalysis = {
          colorPalette: [],
          themes: [],
          interests: [],
          moodProfile: {},
          bookGenreMapping: []
        };
  
        for (const board of boards.slice(0, 10)) { // Analyze top 10 boards
          const pins = await this.getBoardPins(accessToken, board.id);
          const boardAnalysis = await this.analyzeBoardAesthetics(board, pins);
  
          // Aggregate analysis
          analysis.colorPalette.push(...boardAnalysis.colors);
          analysis.themes.push(...boardAnalysis.themes);
          analysis.interests.push(...boardAnalysis.interests);
  
          // Merge mood profiles
          Object.keys(boardAnalysis.mood).forEach(mood => {
            analysis.moodProfile[mood] =
              (analysis.moodProfile[mood] || 0) + boardAnalysis.mood[mood];
          });
        }
  
        // Normalize mood scores
        const totalBoards = boards.length;
        Object.keys(analysis.moodProfile).forEach(mood => {
          analysis.moodProfile[mood] /= totalBoards;
        });
  
        // Map to book genres
        analysis.bookGenreMapping = this.mapAestheticsToBookGenres(analysis);
  
        return analysis;
      } catch (error) {
        throw new Error('Failed to analyze user aesthetics');
      }
    }
  
    private async analyzeBoardAesthetics(
      board: PinterestBoard,
      pins: PinterestPin[]
    ): Promise<BoardAnalysis> {
      const analysis: BoardAnalysis = {
        colors: [],
        themes: [],
        interests: [],
        mood: {}
      };
  
      // Analyze board name and description for themes
      const boardText = `${board.name} ${board.description || ''}`.toLowerCase();
      analysis.themes = this.extractThemesFromText(boardText);
      analysis.interests = this.extractInterestsFromText(boardText);
  
      // Analyze pins
      for (const pin of pins.slice(0, 20)) { // Analyze first 20 pins
        if (pin.media?.images?.original?.url) {
          try {
            // Extract colors from pin image
            const colors = await this.extractColorsFromImage(pin.media.images.original.url);
            analysis.colors.push(...colors);
  
            // Analyze pin description
            const pinText = `${pin.title || ''} ${pin.description || ''}`.toLowerCase();
            analysis.interests.push(...this.extractInterestsFromText(pinText));
          } catch (error) {
            console.error('Error analyzing pin:', error);
          }
        }
      }
  
      // Analyze mood from colors and themes
      analysis.mood = this.analyzeMoodFromAesthetics(analysis.colors, analysis.themes);
  
      return analysis;
    }
  
    private mapAestheticsToBookGenres(analysis: AestheticAnalysis): string[] {
      const genreMapping: string[] = [];
  
      // Color-based mapping
      const dominantColors = this.getDominantColors(analysis.colorPalette);
  
      if (dominantColors.includes('pink') || dominantColors.includes('red')) {
        genreMapping.push('Romance');
      }
  
      if (dominantColors.includes('black') || dominantColors.includes('dark')) {
        genreMapping.push('Horror', 'Mystery', 'Thriller');
      }
  
      if (dominantColors.includes('blue') || dominantColors.includes('teal')) {
        genreMapping.push('Science Fiction', 'Fantasy');
      }
  
      // Theme-based mapping
      const themes = analysis.themes;
  
      if (themes.some(theme => ['vintage', 'antique', 'classic'].includes(theme))) {
        genreMapping.push('Historical Fiction', 'Classic Literature');
      }
  
      if (themes.some(theme => ['nature', 'outdoor', 'adventure'].includes(theme))) {
        genreMapping.push('Adventure', 'Nature Writing');
      }
  
      if (themes.some(theme => ['art', 'creative', 'design'].includes(theme))) {
        genreMapping.push('Art', 'Biography', 'Creative Non-fiction');
      }
  
      // Mood-based mapping
      const moodProfile = analysis.moodProfile;
  
      if (moodProfile.romantic > 0.3) {
        genreMapping.push('Romance');
      }
  
      if (moodProfile.dark > 0.4) {
        genreMapping.push('Gothic', 'Horror');
      }
  
      if (moodProfile.minimalist > 0.3) {
        genreMapping.push('Philosophy', 'Poetry');
      }
  
      return [...new Set(genreMapping)]; // Remove duplicates
    }
  }
  