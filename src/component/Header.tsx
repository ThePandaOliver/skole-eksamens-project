"use client";

import React, {useState, useEffect, useMemo} from "react";
import Link from "next/link";
import {FaBars, FaMagnifyingGlass, FaX} from "react-icons/fa6";
import {cn} from "tailwind-variants";

interface SearchResultItem {
	id: string;
	headline: string;
	description: string;
	href?: string;
}

const SAMPLE_SEARCH_RESULTS: SearchResultItem[] = [
	{
		id: "1",
		headline: "Headline Lorem ipsum dolor sit amet",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet asperiores beatae cum debitis, dolore dolorum in inventore iusto laudantium qui quia sit voluptates. Accusantium atque corporis cum officia voluptate? Natus.",
	},
	{
		id: "2",
		headline: "Headline Lorem ipsum dolor sit amet",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet asperiores beatae cum debitis, dolore dolorum in inventore iusto laudantium qui quia sit voluptates. Accusantium atque corporis cum officia voluptate? Natus.",
	},
	{
		id: "3",
		headline: "Headline Lorem ipsum dolor sit amet",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet asperiores beatae cum debitis, dolore dolorum in inventore iusto laudantium qui quia sit voluptates. Accusantium atque corporis cum officia voluptate? Natus.",
	}
];

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";

			return () => {
				document.body.style.overflow = "";
			};
		}
	}, [isOpen]);

	// Auto-close if screen resized to desktop size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1000) {
				setIsOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isOpen]);

	// Filter search results
	const filteredResults = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return SAMPLE_SEARCH_RESULTS.slice(0, 3);
		}
		return SAMPLE_SEARCH_RESULTS.filter(
			(item) =>
				item.headline.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query)
		);
	}, [searchQuery]);

	return (
		<>
			{/* Main Header Bar */}
			<header className="sticky top-0 z-40 w-full bg-menu-bg text-menu-text">
				<div className="h-14 md:h-menu-h px-3 sm:px-4 flex items-center justify-between">
					{/* Logo */}
					<Link
						href="/"
						className="text-xl sm:text-2xl md:text-3xl font-bold hover:bg-menu-hover h-full select-none flex items-center px-2 sm:px-4 -ml-2 sm:-ml-4 shrink-0"
					>
						...news
					</Link>

					{/* Navigation Links */}
					<nav className="hidden sm:flex items-center gap-1 sm:gap-2.5 lg:gap-4 h-full">
						<Link
							href="/nyheder"
							className="text-sm md:text-lg font-semibold hover:bg-menu-hover transition-colors h-full select-none flex items-center px-1.5 sm:px-2.5 md:px-4"
						>
							Nyheder
						</Link>
						<Link
							href="/sport"
							className="text-sm md:text-lg font-semibold hover:bg-menu-hover transition-colors h-full select-none flex items-center px-1.5 sm:px-2.5 md:px-4"
						>
							Sport
						</Link>
						<Link
							href="/vejret"
							className="text-sm md:text-lg font-semibold hover:bg-menu-hover transition-colors h-full select-none flex items-center px-1.5 sm:px-2.5 md:px-4"
						>
							Vejret
						</Link>
						<Link
							href="/podcast"
							className="text-sm md:text-lg font-semibold hover:bg-menu-hover transition-colors h-full select-none flex items-center px-1.5 sm:px-2.5 md:px-4"
						>
							Podcast
						</Link>
					</nav>

					{/* Right Section */}
					<div className="flex items-center shrink-0">
						{/* Desktop Search Bar */}
						<div className="hidden lg:flex items-center w-search-w h-search-h bg-white rounded-lg px-2">
							<input
								type="text"
								placeholder="Søg på news"
								className="w-full text-black placeholder:text-search-text outline-none text-sm"
							/>
						</div>

						{/* Burger Menu Button */}
						<button
							type="button"
							onClick={() => setIsOpen(true)}
							className="lg:hidden p-1.5 sm:p-2 hover:bg-menu-hover rounded-full transition-colors cursor-pointer text-white"
							aria-label="Åbn menu"
						>
							<FaBars className="text-xl sm:text-2xl" />
						</button>
					</div>
				</div>
			</header>

			{/* Burger Menu */}
			<div
				className={cn(
					"fixed z-50 w-full h-full flex flex-col bg-white transition-transform duration-300 ease-in-out",
					isOpen
						? "translate-x-0 pointer-events-auto"
						: "translate-x-full pointer-events-none"
				)}
			>
				{/* Top bar */}
				<div className="w-full bg-black text-menu-text shrink-0">
					<div className="max-w-container mx-auto h-14 md:h-menu-h px-4 flex items-center justify-between">
						{/* Logo */}
						<Link
							href="/"
							onClick={() => setIsOpen(false)}
							className="text-xl sm:text-2xl md:text-3xl px-2 sm:px-4 -ml-2 sm:-ml-4 font-bold hover:bg-menu-hover h-full select-none flex items-center"
						>
							...news
						</Link>

						{/* Close Burger Menu */}
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="p-2 hover:bg-menu-hover rounded-full transition-colors cursor-pointer"
							aria-label="Luk menu"
						>
							<FaX className="text-xl sm:text-2xl" />
						</button>
					</div>
				</div>

				{/* Burger Menu Content */}
				<div className="flex-1 overflow-y-auto w-full">
					<div className="max-w-container mx-auto px-5 py-6">
						{/* Search */}
						<div
							className="relative flex items-center w-full border border-neutral-300 rounded-full px-5 py-3 mb-6 bg-white focus-within:border-black transition-colors">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Søg på News"
								className="w-full text-xl text-black placeholder:text-search-text outline-none pr-8"
							/>
							<FaMagnifyingGlass className="w-6 h-6 text-neutral-600 shrink-0 absolute right-4 pointer-events-none" />
						</div>

						{/* Navigation Links */}
						<nav className="flex flex-col space-y-3.5 mb-8">
							<Link
								href="/nyheder"
								onClick={() => setIsOpen(false)}
								className="text-2xl text-black hover:text-category transition-colors"
							>
								Nyheder
							</Link>
							<Link
								href="/sport"
								onClick={() => setIsOpen(false)}
								className="text-2xl text-black hover:text-category transition-colors"
							>
								Sport
							</Link>
							<Link
								href="/vejret"
								onClick={() => setIsOpen(false)}
								className="text-2xl text-black hover:text-category transition-colors"
							>
								Vejr
							</Link>
							<Link
								href="/podcast"
								onClick={() => setIsOpen(false)}
								className="text-2xl text-black hover:text-category transition-colors"
							>
								Podcast
							</Link>
						</nav>

						{/* Search Results */}
						<section className="mt-10">
							<h3 className="font-bold text-xl text-black mb-4">
								Søgeresultat:
							</h3>

							<div className="space-y-5">
								{filteredResults.length > 0 ? (
									filteredResults.map((result) => (
										<article key={result.id}>
											<h4 className="font-bold text-base text-black">
												{result.headline}
											</h4>
											<p className="text-sm text-neutral-700 mt-1">
												{result.description}
											</p>
										</article>
									))
								) : (
									<p className="text-neutral-500 text-sm">
										Ingen resultater matcher &quot;{searchQuery}&quot;
									</p>
								)}
							</div>
						</section>
					</div>
				</div>
			</div>
		</>
	);
}
