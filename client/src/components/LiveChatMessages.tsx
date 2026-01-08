/**
 * Live Chat Messages Component
 * 
 * Real-time display of Tawk.to messages via Firebase Firestore
 * Architecture: Tawk.to → N8N Webhook → Firebase → This Component
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, User, Clock, CheckCheck, Reply, Bell, ExternalLink } from 'lucide-react';
import { 
  subscribeTawkMessages, 
  subscribeUnreadCount, 
  markMessageRead,
  TawkMessage 
} from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface LiveChatMessagesProps {
  compact?: boolean;
  maxMessages?: number;
}

export function LiveChatMessages({ compact = false, maxMessages = 20 }: LiveChatMessagesProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<TawkMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeUnread: (() => void) | undefined;

    try {
      // Subscribe to real-time messages
      unsubscribeMessages = subscribeTawkMessages((newMessages) => {
        setMessages(newMessages);
        setIsConnected(true);
        setError(null);
      }, maxMessages);

      // Subscribe to unread count
      unsubscribeUnread = subscribeUnreadCount((count) => {
        setUnreadCount(count);
      });
    } catch (err) {
      console.error('Firebase connection error:', err);
      setError('Unable to connect to Firebase. Using demo mode.');
      setIsConnected(false);
      
      // Demo data for development
      setMessages([
        {
          id: 'demo-1',
          visitor_id: 'visitor-123',
          visitor_name: 'John Smith',
          visitor_email: 'john@example.com',
          message: 'Hello! I would like to book a room for next week. Do you have availability?',
          timestamp: { toDate: () => new Date(Date.now() - 5 * 60000) } as any,
          read: false,
          responded: false,
          chat_id: 'chat-123'
        },
        {
          id: 'demo-2',
          visitor_id: 'visitor-456',
          visitor_name: 'Maria Garcia',
          message: 'What is the check-in time?',
          timestamp: { toDate: () => new Date(Date.now() - 30 * 60000) } as any,
          read: true,
          responded: true,
          chat_id: 'chat-456',
          agent_response: 'Check-in is at 2 PM and check-out is at 12 PM.'
        }
      ]);
      setUnreadCount(1);
    }

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeUnread) unsubscribeUnread();
    };
  }, [maxMessages]);

  const handleMarkRead = async (messageId: string) => {
    try {
      await markMessageRead(messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const openTawkDashboard = () => {
    window.open('https://dashboard.tawk.to/', '_blank');
  };

  if (compact) {
    return (
      <Card className="bg-slate-800/50 border-cyan-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
            <MessageCircle className="h-4 w-4" />
            {t('Live Chat', 'ლაივ ჩატი')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400">{t('No messages yet', 'შეტყობინებები არ არის')}</p>
          ) : (
            <div className="space-y-2">
              {messages.slice(0, 3).map((msg) => (
                <div 
                  key={msg.id} 
                  className={`text-xs p-2 rounded ${!msg.read ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-700/50'}`}
                >
                  <div className="flex items-center gap-1 text-cyan-300 font-medium">
                    <User className="h-3 w-3" />
                    {msg.visitor_name}
                  </div>
                  <p className="text-slate-300 truncate mt-1">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <MessageCircle className="h-5 w-5" />
            {t('Live Chat Messages', 'ლაივ ჩატის შეტყობინებები')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {unreadCount} {t('new', 'ახალი')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-500" : ""}>
              {isConnected ? t('Live', 'ლაივ') : t('Demo', 'დემო')}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openTawkDashboard}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Tawk.to
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-yellow-400 mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>{t('No messages yet', 'შეტყობინებები ჯერ არ არის')}</p>
              <p className="text-sm mt-2">
                {t('Messages from Tawk.to will appear here in real-time', 
                   'Tawk.to-დან შეტყობინებები აქ გამოჩნდება რეალურ დროში')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !msg.read 
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
                      : 'bg-slate-700/30 border-slate-600/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-cyan-300">{msg.visitor_name}</p>
                        {msg.visitor_email && (
                          <p className="text-xs text-slate-400">{msg.visitor_email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.responded && (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          <CheckCheck className="h-3 w-3 mr-1" />
                          {t('Responded', 'უპასუხა')}
                        </Badge>
                      )}
                      {!msg.read && (
                        <Badge className="bg-cyan-500">
                          {t('New', 'ახალი')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                    <p className="text-slate-200">{msg.message}</p>
                  </div>

                  {/* Agent Response */}
                  {msg.agent_response && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-2 ml-4">
                      <div className="flex items-center gap-1 text-green-400 text-sm mb-1">
                        <Reply className="h-3 w-3" />
                        {t('Agent Response', 'აგენტის პასუხი')}
                      </div>
                      <p className="text-slate-300 text-sm">{msg.agent_response}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {msg.timestamp?.toDate ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                    </div>
                    <div className="flex gap-2">
                      {!msg.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => msg.id && handleMarkRead(msg.id)}
                          className="text-xs text-slate-400 hover:text-cyan-400"
                        >
                          {t('Mark as read', 'წაკითხულად მონიშვნა')}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openTawkDashboard}
                        className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        {t('Reply in Tawk.to', 'პასუხი Tawk.to-ში')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default LiveChatMessages;
