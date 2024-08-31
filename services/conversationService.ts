import axios from '~/utils/axios';
import type { ConversationPayload } from '~/types/conversationTypes';

class ConversationService {
  async createConversation(payload: ConversationPayload) {
    const { data } = await axios.post('/conversations', payload);

    return data;
  }

  async getConversations(userId: string | undefined) {
    const { data } = await axios.get('/conversations', {
      params: {
        userId,
      },
    });

    return data.data;
  }
}

export default new ConversationService();
