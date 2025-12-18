import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { telegramService } from "../services/telegramService";

export const telegramRouter = router({
  // Get bot info
  getBotInfo: protectedProcedure.query(async () => {
    const result = await telegramService.getMe();
    if (!result.ok) {
      throw new Error(result.description || 'Failed to get bot info');
    }
    return {
      id: result.result?.id,
      username: result.result?.username,
      firstName: result.result?.first_name,
      isBot: result.result?.is_bot,
    };
  }),

  // Get recent messages/updates
  getUpdates: protectedProcedure
    .input(z.object({
      offset: z.number().optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const result = await telegramService.getUpdates(input?.offset, input?.limit);
      if (!result.ok) {
        throw new Error(result.description || 'Failed to get updates');
      }
      
      // Transform updates to a more usable format
      const messages = (result.result || [])
        .filter(update => update.message)
        .map(update => ({
          updateId: update.update_id,
          messageId: update.message!.message_id,
          chatId: update.message!.chat.id,
          chatType: update.message!.chat.type,
          chatTitle: update.message!.chat.title,
          fromId: update.message!.from?.id,
          fromUsername: update.message!.from?.username,
          fromFirstName: update.message!.from?.first_name,
          text: update.message!.text,
          date: new Date(update.message!.date * 1000).toISOString(),
        }));
      
      return {
        messages,
        lastUpdateId: result.result?.[result.result.length - 1]?.update_id,
      };
    }),

  // Send message to a chat
  sendMessage: protectedProcedure
    .input(z.object({
      chatId: z.union([z.number(), z.string()]),
      text: z.string().min(1).max(4096),
      parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional(),
      disableNotification: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.sendMessage(
        input.chatId,
        input.text,
        {
          parse_mode: input.parseMode,
          disable_notification: input.disableNotification,
        }
      );
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send message');
      }
      
      return {
        messageId: result.result?.message_id,
        chatId: result.result?.chat.id,
        date: result.result ? new Date(result.result.date * 1000).toISOString() : null,
      };
    }),

  // Send booking confirmation
  sendBookingConfirmation: protectedProcedure
    .input(z.object({
      chatId: z.union([z.number(), z.string()]),
      guestName: z.string(),
      studioName: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
      confirmationCode: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.sendBookingConfirmation(
        input.chatId,
        input.guestName,
        input.studioName,
        input.checkIn,
        input.checkOut,
        input.confirmationCode
      );
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send booking confirmation');
      }
      
      return { success: true, messageId: result.result?.message_id };
    }),

  // Send check-in reminder
  sendCheckInReminder: protectedProcedure
    .input(z.object({
      chatId: z.union([z.number(), z.string()]),
      guestName: z.string(),
      studioName: z.string(),
      checkInDate: z.string(),
      checkInTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.sendCheckInReminder(
        input.chatId,
        input.guestName,
        input.studioName,
        input.checkInDate,
        input.checkInTime
      );
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send check-in reminder');
      }
      
      return { success: true, messageId: result.result?.message_id };
    }),

  // Send review request
  sendReviewRequest: protectedProcedure
    .input(z.object({
      chatId: z.union([z.number(), z.string()]),
      guestName: z.string(),
      studioName: z.string(),
      reviewLink: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.sendReviewRequest(
        input.chatId,
        input.guestName,
        input.studioName,
        input.reviewLink
      );
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send review request');
      }
      
      return { success: true, messageId: result.result?.message_id };
    }),

  // Send custom notification
  sendNotification: protectedProcedure
    .input(z.object({
      chatId: z.union([z.number(), z.string()]),
      title: z.string(),
      body: z.string(),
      type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.sendNotification(
        input.chatId,
        input.title,
        input.body,
        input.type
      );
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send notification');
      }
      
      return { success: true, messageId: result.result?.message_id };
    }),

  // Get webhook info
  getWebhookInfo: protectedProcedure.query(async () => {
    const result = await telegramService.getWebhookInfo();
    if (!result.ok) {
      throw new Error(result.description || 'Failed to get webhook info');
    }
    return result.result;
  }),

  // Set webhook URL
  setWebhook: protectedProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const result = await telegramService.setWebhook(input.url);
      if (!result.ok) {
        throw new Error(result.description || 'Failed to set webhook');
      }
      return { success: true };
    }),

  // Delete webhook
  deleteWebhook: protectedProcedure.mutation(async () => {
    const result = await telegramService.deleteWebhook();
    if (!result.ok) {
      throw new Error(result.description || 'Failed to delete webhook');
    }
    return { success: true };
  }),
});
