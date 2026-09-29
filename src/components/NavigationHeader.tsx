"use client"
import {cn} from "tailwind-variants";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {FaBars, FaX} from "react-icons/fa6";

export default function NavigationHeader() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const pathName = usePathname()
	const isActive = (href: string) => pathName.includes(href);

	const navItems = [
		{href: "/nyheder", label: "Nyheder"},
		{href: "/sport", label: "Sport"},
		{href: "/vejr", label: "Vejret"},
		{href: "/podcast", label: "Podcast"}
	];

	return (
		<header className={"text-menu-text font-medium text-menu lg:text-menu-lg"}>
			<nav className={"grid md:grid-cols-[1fr_auto_1fr] gap-2 h-menu-h items-center md:bg-menu-bg md:px-6"}>
				<div className={"w-full flex justify-between items-center bg-menu-bg md:bg-none px-6 md:px-0"}>
					<a href={"/"}
					   className={"text-5xl w-fit hover:bg-menu-hover h-full flex items-center px-4"}>
						...news
					</a>

					<button className={"flex md:hidden items-center justify-center size-10 rounded-full cursor-pointer hover:bg-menu-hover"}
					        onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{
							isMenuOpen ?
								<FaX /> :
								<FaBars />
						}
					</button>
				</div>

				<ul className={"flex flex-col md:flex-row items-center h-full text-black md:text-menu-text"}>
					{
						navItems.map((item) => (
							<li key={item.href} className={"h-full"}>
								<a href={item.href}
								   className={cn(
									   "flex items-end h-full p-4 lg:p-5 cursor-pointer transition",
									   isActive(item.href) ? "bg-menu-active" : "hover:bg-menu-hover"
								   )}>
									{item.label}
								</a>
							</li>
						))
					}
				</ul>

				<input type={"search"} placeholder={"Søg på news"}
				       className={"md:ml-auto max-w-search-w w-full h-search-h text-menu bg-white text-black placeholder-search-text px-2 rounded-lg focus:outline-none"}/>
			</nav>
		</header>
	);
}