import axios from '~/utils/axios';

class MessageReceiptService {
  async markMessagesAsRead(conversationId: number, userId: number | undefined) {
    await axios.put('/message-receipts', {
      conversationId,
      userId,
    });
  }
}

export default new MessageReceiptService();
