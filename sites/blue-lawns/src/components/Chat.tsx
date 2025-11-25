import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';

export default function Chat() {
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
		<div className="w-full h-full flex flex-col bg-white">
			{/* Minimalist header */}
			<div className="px-6 py-4 border-b border-[#E0F0FF]">
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-[#0074D9] uppercase tracking-wide">Blue Lawns</span>
					<span className="text-[#1E90FF]">•</span>
					<span className="text-xs text-[#333]">Landscaping Expert</span>
				</div>
			</div>

			{/* Messages area - clean and spacious */}
			<div ref={scrollRef} className="flex-1 overflow-auto px-6 py-8" style={{ minHeight: '500px' }}>
				{messages.length === 0 && (
					<div className="max-w-2xl mx-auto">
						<div className="mb-6">
							<h2 className="text-2xl font-serif text-gray-900 mb-2">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h2>
							<p className="text-gray-600 text-lg">How can I help you with your landscaping needs today?</p>
						</div>
					</div>
				)}
				<div className="max-w-2xl mx-auto space-y-8">
					{messages.map((m) => (
						<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div
								className={`max-w-[85%] whitespace-pre-wrap ${
									m.role === 'user'
										? 'text-gray-900'
										: 'text-gray-700'
								}`}
								style={{
									fontSize: '15px',
									lineHeight: '1.75'
								}}
							>
								{m.content}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex items-center gap-1 text-gray-400">
							<div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
							<div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:150ms]" />
							<div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse [animation-delay:300ms]" />
						</div>
					)}
				</div>
			</div>

			{/* Minimalist input */}
			<div className="border-t border-[#E0F0FF] px-6 py-4">
				<form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
					<div className="flex items-center gap-3">
						<div className="flex-1 relative">
							<input
								value={input}
								onChange={handleInputChange}
								placeholder="How can I help you today?"
								className="w-full px-4 py-3 text-base bg-[#F9FAFB] border border-[#E0F0FF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF] focus:bg-white transition-colors placeholder:text-gray-400"
							/>
						</div>
						<button
							type="submit"
							disabled={isLoading || !input.trim()}
							className="px-4 py-3 bg-[#0074D9] text-white rounded-lg hover:bg-[#005BBB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px] h-[44px]"
							aria-label="Send message"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-[-45deg]">
								<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
							</svg>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

