import { marked } from 'marked';
import React, { useState, useRef, useEffect } from 'react';
import { Rocket, X, Bot, Calendar, Info, FileText, ChevronRight, Send, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const renderMessage = (msg: string) => (
    <div
      className="text-sm text-slate-700 dark:text-slate-200 chat-markdown"
      dangerouslySetInnerHTML={{ __html: marked.parse(msg) }}
    />
  );

  const { rows, users, modules, projects, activeProjectId, setCurrentView, addRow, updateRow, setIsExportOpen } = useStore();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Hi! I am Looper, your AI Partner. I know everything about your workspaces, test points, and users. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_AIPARTNER_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: '⚠️ **Configuration Error**: `NEXT_PUBLIC_AIPARTNER_API_KEY` is not set in your Vercel or local environment variables.' }]);
        setIsLoading(false);
        return;
      }

      const activeProject = projects.find(p => p.id === activeProjectId);
      const systemPrompt = `You are Looper, an expert AI QA Partner integrated directly into the QAFlow Pro app. 
You are helpful, concise, and professional. 

**Current Site Context:**
- Active Project: ${activeProject?.name || 'None'}
- Total Users: ${users.length} (${users.map(u => u.name).join(', ')})
- Total Test Rows: ${rows.length}
- Total Modules: ${modules.length}

You can answer questions about the site. You also have tools to perform actions like navigating, adding points, assigning users, and generating reports. If the user asks you to do something that matches a tool, USE THE TOOL. If the tool executes successfully, confirm it to the user.`;

      const tools = [
        {
          functionDeclarations: [
            {
              name: 'navigate',
              description: 'Navigate the user to a different view in the app (dashboard, table, kanban, timeline, analytics, archive, users).',
              parameters: {
                type: 'OBJECT',
                properties: {
                  view: { type: 'STRING', description: 'The view to navigate to. Allowed values: dashboard, table, kanban, timeline, analytics, archive, users' }
                },
                required: ['view']
              }
            },
            {
              name: 'add_test_point',
              description: 'Add a new test point/row to the system.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  testPoint: { type: 'STRING', description: 'The title/name of the test point' },
                  expectedResult: { type: 'STRING', description: 'What is expected to happen' },
                  priority: { type: 'STRING', description: 'Low, Medium, High, or Critical' }
                },
                required: ['testPoint']
              }
            },
            {
              name: 'generate_report',
              description: 'Open the print report view to generate a PDF report for the user.',
              parameters: {
                type: 'OBJECT',
                properties: {}
              }
            }
          ]
        }
      ];

      const conversationHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: conversationHistory,
          tools: tools
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API Error');

      const responsePart = data.candidates?.[0]?.content?.parts?.[0];
      
      if (responsePart?.functionCall) {
        const { name, args } = responsePart.functionCall;
        let functionResultMsg = '';
        
        if (name === 'navigate') {
          const viewMap: any = { dashboard: 'dashboard', table: 'table', kanban: 'kanban', timeline: 'timeline', analytics: 'analytics', archive: 'archive', users: 'users' };
          const target = viewMap[args.view?.toLowerCase()] || 'dashboard';
          setCurrentView(target);
          functionResultMsg = `I have navigated you to the ${target} view.`;
        } else if (name === 'add_test_point') {
          const newRow = {
            id: `row-${Date.now()}`,
            moduleId: modules[0]?.id || 'mod-1',
            testPoint: args.testPoint,
            howToTest: 'Follow standard testing procedures.',
            expectedResult: args.expectedResult || 'Function works as expected.',
            actualResult: '',
            testingStatus: 'Pending',
            functionalityStatus: 'Pending',
            priority: args.priority || 'Medium',
            assignedUsers: [],
            notes: []
          };
          // @ts-ignore
          addRow(newRow);
          functionResultMsg = `I have successfully added the test point "${args.testPoint}".`;
        } else if (name === 'generate_report') {
          setIsExportOpen(true);
          functionResultMsg = 'I have opened the Report Generator for you.';
        }

        // Send function result back to Gemini to get a natural response
        const followupRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...conversationHistory,
              data.candidates[0].content,
              {
                role: 'user',
                parts: [{
                  functionResponse: {
                    name: name,
                    response: { result: functionResultMsg }
                  }
                }]
              }
            ],
            tools: tools
          })
        });
        
        const followupData = await followupRes.json();
        const text = followupData.candidates?.[0]?.content?.parts?.[0]?.text || functionResultMsg;
        setMessages(prev => [...prev, { role: 'model', text }]);
      } else if (responsePart?.text) {
        setMessages(prev => [...prev, { role: 'model', text: responsePart.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I didn't understand that." }]);
      }
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

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
        <div className="p-5 h-[400px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] animate-fade-in-up ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-2xl shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-violet-600 text-white rounded-tr-sm border-violet-500' 
                  : 'bg-white dark:bg-slate-800 rounded-tl-sm border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {msg.role === 'model' ? renderMessage(msg.text) : <span className="text-sm">{msg.text}</span>}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span className="text-xs">Looper is thinking...</span>
              </div>
            </div>
          )}
          
          {messages.length === 1 && (
            <div className="flex flex-col gap-2 mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => { setInput("Can you generate a testing report?"); handleSend(); }} className="flex items-center justify-between w-[85%] bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/50 hover:border-violet-500 hover:shadow-md transition-all rounded-xl p-3 group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Generate a report</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </button>

              <button onClick={() => { setInput("Navigate to the Kanban board"); handleSend(); }} className="flex items-center justify-between w-[85%] bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-900/50 hover:border-violet-500 hover:shadow-md transition-all rounded-xl p-3 group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-violet-600 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Open Kanban View</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-none rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-1 p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-full transition-colors shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
