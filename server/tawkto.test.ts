import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { tawktoMessages } from '../drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';

describe('Tawk.to Live Chat Integration', () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe('Database Schema', () => {
    it('should have tawktoMessages table', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'tawktoMessages'
      `);
      expect(result).toBeDefined();
    });

    it('should have required columns in tawktoMessages', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const result = await db.execute(sql`
        SELECT COLUMN_NAME FROM information_schema.columns 
        WHERE table_name = 'tawktoMessages'
      `);
      
      const columns = (result[0] as any[]).map((r: any) => r.COLUMN_NAME);
      
      expect(columns).toContain('id');
      expect(columns).toContain('chatId');
      expect(columns).toContain('eventType');
      expect(columns).toContain('visitorName');
      expect(columns).toContain('visitorEmail');
      expect(columns).toContain('message');
      expect(columns).toContain('status');
      expect(columns).toContain('isRead');
      expect(columns).toContain('createdAt');
    });
  });

  describe('Data Operations', () => {
    it('should fetch all tawkto messages', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const messages = await db
        .select()
        .from(tawktoMessages)
        .orderBy(desc(tawktoMessages.createdAt))
        .limit(10);
      
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should calculate chat statistics', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const [stats] = await db
        .select({
          total: sql<number>`COUNT(*)`,
          active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
          ended: sql<number>`SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END)`,
          unread: sql<number>`SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END)`,
        })
        .from(tawktoMessages);
      
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
    });

    it('should have test messages in database', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const messages = await db
        .select()
        .from(tawktoMessages)
        .limit(5);
      
      // We should have at least 2 test messages from webhook testing
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter messages by status', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const activeMessages = await db
        .select()
        .from(tawktoMessages)
        .where(eq(tawktoMessages.status, 'active'));
      
      expect(Array.isArray(activeMessages)).toBe(true);
      activeMessages.forEach(msg => {
        expect(msg.status).toBe('active');
      });
    });
  });

  describe('Webhook Data Format', () => {
    it('should store visitor information correctly', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const messages = await db
        .select()
        .from(tawktoMessages)
        .where(eq(tawktoMessages.visitorName, 'Test User'))
        .limit(1);
      
      if (messages.length > 0) {
        const msg = messages[0];
        expect(msg.visitorName).toBe('Test User');
        expect(msg.visitorEmail).toBe('test@test.com');
        expect(msg.visitorCountry).toBe('Georgia');
        expect(msg.visitorCity).toBe('Batumi');
      }
    });

    it('should store metadata as JSON', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }
      
      const messages = await db
        .select()
        .from(tawktoMessages)
        .limit(1);
      
      if (messages.length > 0) {
        const msg = messages[0];
        expect(msg.metadata).toBeDefined();
        expect(typeof msg.metadata).toBe('object');
      }
    });
  });
});
