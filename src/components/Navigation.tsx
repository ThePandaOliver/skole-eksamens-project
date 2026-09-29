import {cn} from "tailwind-variants";

export default function Navigation() {
	const navItems = [
		{href: "#", label: "Nyheder"},
		{href: "#", label: "Sport"},
		{href: "#", label: "Vejret"},
		{href: "#", label: "Podcast"}
	];

	return (
		<nav className={cn(
			"bg-menu-bg text-menu-text font-medium",
			"w-full px-4 md:px-6 min-h-menu-h items-center py-3 md:py-0 gap-y-2 md:gap-y-0",
			"grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
		)}>
			<div className={""}>
				<a href="#"
				   className="justify-self-start h-full flex items-center text-3xl md:text-news font-bold tracking-tight px-2 hover:bg-menu-hover rounded md:rounded-none transition-colors"
				>
					...news
				</a>
			</div>

			<ul className="md:order-2 col-span-2 md:col-span-1 justify-self-center flex items-center justify-center h-full text-menu lg:text-menu-lg">
				{navItems.map((item) => (
					<li key={item.label} className="h-full flex items-center">
						<a
							href={item.href}
							className="h-full flex items-center px-3 py-1.5 md:py-0 lg:px-5 hover:bg-menu-hover rounded md:rounded-none transition-colors"
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>

			<input
				type="search"
				placeholder="Søg på news"
				aria-label="Søg på news"
				className="md:order-3 justify-self-end h-search-h w-36 sm:w-48 md:w-search-w rounded-lg px-3 text-sm md:text-menu bg-white text-black placeholder:text-search-text focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
			/>
		</nav>
	)
}