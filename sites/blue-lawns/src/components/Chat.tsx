import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';

export default function Chat() {
	const [open, setOpen] = useState(true);
	const scrollRef = useRef<HTMLDivElement>(null);

	const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
		api: '/api/chat',
	});

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	return (
		<div className="fixed z-50 bottom-4 right-4">
			{/* Floating toggle button for mobile */}
			<button
				aria-label="Toggle chat"
				onClick={() => setOpen((v) => !v)}
				className="md:hidden mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-md"
				style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
			>
				<span>Chat</span>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
					<path d="M4 4h16v12H7l-3 3V4z" stroke="white" strokeWidth="2" />
				</svg>
			</button>

			{/* Chat panel */}
			<div
				className={`w-[90vw] sm:w-96 max-h-[70vh] md:max-h-[75vh] rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-white transition-all ${
					open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
				}`}
			>
				{/* Header */}
				<div
					className="px-4 py-3 text-white flex items-center justify-between"
					style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
				>
					<div className="flex items-center gap-2">
						<img src="/media/blue-lawns-logo.png" alt="Blue Lawns" className="w-6 h-6 rounded-sm" />
						<div className="font-semibold">Blue Lawns Assistant</div>
					</div>
					<button
						onClick={() => setOpen(false)}
						className="hidden md:inline-flex text-white/90 hover:text-white"
						aria-label="Close"
					>
						✕
					</button>
				</div>

				{/* Messages */}
				<div ref={scrollRef} className="p-4 space-y-3 overflow-auto" style={{ maxHeight: '55vh' }}>
					{messages.length === 0 && (
						<div className="text-sm text-gray-600">
							<div className="font-semibold text-gray-800 mb-1">Hi! I’m your Blue Lawns expert.</div>
							<p>
								I can help with lawn care, landscaping, erosion control and more throughout Cape May
								County. Want a free quote? Tell me your city and what you need.
							</p>
						</div>
					)}
					{messages.map((m) => (
						<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div
								className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
									m.role === 'user'
										? 'text-white'
										: 'bg-gray-100 text-gray-800'
								}`}
								style={
									m.role === 'user'
										? { background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }
										: {}
								}
							>
								{m.content}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#10B981' }} />
							<div className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: '#10B981' }} />
							<div className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: '#10B981' }} />
						</div>
					)}
				</div>

				{/* Input */}
				<form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex items-center gap-2">
					<input
						value={input}
						onChange={handleInputChange}
						placeholder="Type your message..."
						className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
						style={{ outlineColor: '#10B981' }}
					/>
					<button
						type="submit"
						disabled={isLoading || !input.trim()}
						className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-white text-sm disabled:opacity-60"
						style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
}




