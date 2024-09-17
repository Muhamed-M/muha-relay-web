import axios from '~/utils/axios';
import type { ConversationPayload } from '~/types/conversationTypes';

class ConversationService {
  async createConversation(payload: ConversationPayload) {
    const { data } = await axios.post('/conversations', payload);

    return data;
  }

  async getConversations(userId: number | undefined) {
    const { data } = await axios.get('/conversations', {
      params: {
        userId,
      },
    });

    return data.data;
  }

  async getConversation(conversationId: number, userId: number | undefined) {
    const { data } = await axios.get(`/conversations/${conversationId}`, {
      params: {
        userId,
      },
    });

    return data;
  }

  async editGroupConversation(conversationId: number, name: string) {
    const { data } = await axios.put(`/conversations/${conversationId}`, { name });

    return data;
  }

  async addGroupMembers(conversationId: number | undefined, usersIds: number[]) {
    const { data } = await axios.put(`/conversations/${conversationId}/group-members`, { usersIds });

    return data;
  }

  async deleteGroupMembers(conversationId: number | undefined, usersIds: number[]) {
    const { data } = await axios.delete(`/conversations/${conversationId}/group-members`, { data: { usersIds } });

    return data;
  }
}

export default new ConversationService();
