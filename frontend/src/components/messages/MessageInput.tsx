import { Send, ChevronDown, ChevronUp, Dices } from "lucide-react";
import { useState } from "react";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState('');
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isCustomRollOpen, setIsCustomRollOpen] = useState(false);
	const [diceCounts, setDiceCounts] = useState({ d20: 0, d12: 0, d10: 0, d8: 0, d6: 0, d4: 0 });
	const [bonus, setBonus] = useState(0);
	const [rollName, setRollName] = useState('');

	const { loading, sendMessage } = useSendMessage();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!message.trim()) return;
		await sendMessage(message);
		setMessage("");
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleCustomRollMenu = () => {
		setIsCustomRollOpen(!isCustomRollOpen);
	};

	const handleDiceCountChange = (die: keyof typeof diceCounts, value: string) => {
		const count = Math.max(0, parseInt(value) || 0);
		setDiceCounts((prev) => ({ ...prev, [die]: count }));
	};

	const handleBonusChange = (value: string) => {
		setBonus(parseInt(value) || 0);
	};

	const handleRollNameChange = (value: string) => {
		setRollName(value);
	};

	const rollDice = async (sides: number) => {
		const result = Math.floor(Math.random() * sides) + 1;
		await sendMessage(`Rolled a d${sides}: ${result}`);
		setIsMenuOpen(false);
	};

	const handleCustomRoll = async () => {
		let totalRoll = bonus;
		const rollDetails: string[] = [];

		for (const [die, count] of Object.entries(diceCounts)) {
			if (count > 0) {
				const sides = parseInt(die.slice(1));
				const rolls = [];
				for (let i = 0; i < count; i++) {
					const roll = Math.floor(Math.random() * sides) + 1;
					rolls.push(roll);
					totalRoll += roll;
				}
				rollDetails.push(`${count}${die} {${rolls.join(" + ")}}`);
			}
		}

		const rollSummary = rollDetails.join(" + ");
		const rollMessage = `${rollName} (${rollSummary}${bonus ? ` + ${bonus}` : ''}): ${totalRoll}`;

		await sendMessage(rollMessage);
		setIsCustomRollOpen(false);
	};

	return (
		<form className='px-4 mb-3' onSubmit={handleSubmit}>
			<div className='w-full relative flex items-center'>
				<textarea
					className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white resize-none overflow-hidden pr-28'
					placeholder='Send a message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					rows={1}
				/>
				<div className='absolute inset-y-0 end-0 flex items-center pe-3 space-x-2'>
					<div className='relative'>
						<button
							type='button'
							className='flex items-center text-white'
							onClick={toggleMenu}
						>
							{isMenuOpen ? <ChevronUp className='w-6 h-6' /> : <ChevronDown className='w-6 h-6' />}
						</button>
						{isMenuOpen && (
							<div className='absolute right-0 bottom-full mb-2 w-24 bg-gray-700 rounded-lg shadow-lg z-10'>
								<ul className='py-1'>
									{[20, 12, 10, 8, 6, 4].map((sides) => (
										<li key={sides}>
											<button
												type='button'
												className='block px-4 py-2 text-sm text-white hover:bg-gray-600'
												onClick={() => rollDice(sides)}
											>
												Roll d{sides}
											</button>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
					<div className='relative'>
						<button
							type='button'
							className='flex items-center text-white'
							onClick={toggleCustomRollMenu}
						>
							<Dices className='w-6 h-6' />
						</button>
						{isCustomRollOpen && (
							<div className='absolute right-0 bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10 p-4'>
								<div className='space-y-2'>
									{(["d20", "d12", "d10", "d8", "d6", "d4"] as const).map((die) => (
										<div key={die} className='flex justify-between items-center'>
											<label className='text-white text-sm'>{die.toUpperCase()}:</label>
											<input
												type='number'
												min='0'
												className='w-16 text-sm text-white bg-gray-800 p-1 rounded'
												value={diceCounts[die]}
												onChange={(e) => handleDiceCountChange(die, e.target.value)}
											/>
										</div>
									))}
									<div className='flex justify-between items-center'>
										<label className='text-white text-sm'>Bonus:</label>
										<input
											type='number'
											className='w-16 text-sm text-white bg-gray-800 p-1 rounded'
											value={bonus}
											onChange={(e) => handleBonusChange(e.target.value)}
										/>
									</div>
									<div className='flex justify-between items-center'>
										<label className='text-white text-sm'>Roll Name:</label>
										<input
											type='text'
											className='w-full text-sm text-white bg-gray-800 p-1 rounded'
											value={rollName}
											onChange={(e) => handleRollNameChange(e.target.value)}
										/>
									</div>
									<button
										type='button'
										className='w-full mt-2 text-sm text-white bg-blue-600 p-2 rounded hover:bg-blue-700'
										onClick={handleCustomRoll}
									>
										Roll!
									</button>
								</div>
							</div>
						)}
					</div>
					<button type='submit' className='ml-2 flex items-center'>
						{loading ? <span className='loading loading-spinner' /> : <Send className='w-6 h-6 text-white' />}
					</button>
				</div>
			</div>
		</form>
	);
};

export default MessageInput;
