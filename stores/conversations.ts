import ConversationService from '~/services/conversationService';
import type { Conversation } from '~/types';

interface ConversationStore {
  loading: boolean;
  conversations: Conversation[];
  loadingConversation: boolean;
  conversation: Conversation | null;
}

export const useConversationsStore = defineStore({
  id: 'conversations',
  state: (): ConversationStore => ({
    loading: true,
    conversations: [],
    loadingConversation: true,
    conversation: null,
  }),
  actions: {
    async fetchConversations(userId: number | undefined) {
      try {
        const result = await ConversationService.getConversations(userId);
        this.conversations = result;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async getConversation(conversationId: number, userId: number | undefined) {
      try {
        const result = await ConversationService.getConversation(conversationId, userId);
        this.conversation = result;
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingConversation = false;
      }
    },
    async editGroupConversation(conversationId: number, name: string) {
      try {
        const updatedConversation = await ConversationService.editGroupConversation(conversationId, name);

        if (!this.conversation) return;
        this.conversation.name = updatedConversation.name;
      } catch (error) {
        console.error(error);
      }
    },
    async addGroupMembers(conversationId: number | undefined, usersIds: number[]) {
      try {
        await ConversationService.addGroupMembers(conversationId, usersIds);
      } catch (error) {
        console.error(error);
      }
    },
    async deleteGroupMembers(conversationId: number | undefined, usersIds: number[]) {
      try {
        await ConversationService.deleteGroupMembers(conversationId, usersIds);
        if (!this.conversation?.members) return;
        this.conversation.members = this.conversation?.members?.filter(
          (member) => !usersIds.includes(member.user?.id as number)
        );
      } catch (error) {
        console.error(error);
      }
    },
  },
});
