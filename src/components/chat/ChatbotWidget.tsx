import { marked } from 'marked';
import React, { useState } from 'react';
import { Rocket, X, Bot, Calendar, Info, FileText, ChevronRight, Send } from 'lucide-react';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to render markdown messages safely
  const renderMessage = (msg: string) => (
    <div
      className="text-sm text-slate-700 dark:text-slate-200"
      dangerouslySetInnerHTML={{ __html: marked.parse(msg) }}
    />
  );

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-fuchsia-500/30 hover:scale-110 hover:shadow-2xl transition-all duration-300 z-50 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <Rocket className="h-5 w-5" />
      </button>

      {/* Chat Modal */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all duration-400 transform origin-bottom-right z-50 overflow-hidden ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-100/50 to-fuchsia-100/50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-inner">
                <Bot className="h-6 w-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Looper</h3>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="p-5 h-[400px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          {/* Bot Message 1 */}
          <div className="flex gap-3 max-w-[85%] animate-fade-in-up">
            <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700">
              {renderMessage("Hi! I am Looper. Happy to chat with you 🙂")}
            </div>
          </div>

          {/* Bot Message 2 */}
          <div className="flex gap-3 max-w-[85%] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700">
              {renderMessage("How can I help you today?")}
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex flex-col gap-2 mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button className="flex items-center justify-between w-[85%] bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/50 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-md transition-all rounded-xl p-3 group">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Schedule a demo</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>

            <button className="flex items-center justify-between w-[85%] bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/50 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-md transition-all rounded-xl p-3 group">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Know more about us</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>

            <button className="flex items-center justify-between w-[85%] bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/50 hover:border-violet-500 dark:hover:border-violet-500 hover:shadow-md transition-all rounded-xl p-3 group">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Read an article</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-none rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <button className="absolute right-1 p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full transition-colors shadow-sm">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
