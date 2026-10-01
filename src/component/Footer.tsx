"use client";

import React, {useState} from "react";
import Link from "next/link";
import ContactModal from "@/component/ContactModal";

export default function Footer() {
	const [isContactOpen, setIsContactOpen] = useState(false);

	return (
		<>
			<footer className={"w-full bg-black text-white mt-auto"}>
				<div className={"max-w-350 mx-auto px-4 py-10"}>
					<div className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 justify-items-center gap-3 flex-wrap"}>
						<div>
							<h3 className={"text-2xl font-bold text-white mb-4"}>Nyheder</h3>
							<ul className={"text-base text-white"}>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Senest nyt
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										International
									</Link>
								</li>
								<li>
									<Link href={"/sport"} className={"hover:text-category transition-colors"}>
										Sport
									</Link>
								</li>
								<li>
									<Link href={"/vejret"} className={"hover:text-category transition-colors"}>
										Vejret
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h3 className={"text-2xl font-bold text-white mb-4"}>Lorum ipsum dolor</h3>
							<div className={"text-base text-white"}>
								<p>
									Phasellus viverra nulla ut<br/>
									metus varius laoreet.
								</p>
								<p>
									hasellus viverra nulla ut<br/>
									metus variuslaoreet.
								</p>
								<p>
									hasellus viverra nulla ut<br/>
									metus varius.
								</p>
							</div>
						</div>

						<div>
							<h3 className={"text-2xl font-bold text-white mb-4"}>Lorum ipsum dolor</h3>
							<div className={"text-base text-white"}>
								<p>
									Phasellus viverra nulla ut<br/>
									metus varius laoreet.
								</p>
								<p>
									hasellus viverra nulla ut<br/>
									metus variuslaoreet.
								</p>
								<p>
									hasellus viverra nulla ut<br/>
									metus varius.
								</p>
							</div>
						</div>

						<div>
							<h3 className={"text-2xl font-bold text-white mb-4"}>Om news</h3>
							<ul className={"text-base text-white"}>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Nyt fra News
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Job i News
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Presse
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Vilkår på News
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Etik og rettelse
									</Link>
								</li>
								<li>
									<Link href={"#"} className={"hover:text-category transition-colors"}>
										Privatpolitk
									</Link>
								</li>
								<li>
									<button
										onClick={() => setIsContactOpen(true)}
										className={"hover:text-category transition-colors cursor-pointer"}
									>
										Kontakt
									</button>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Divider line */}
				<div className={"border-t border-white w-full"}/>

				{/* Bottom text */}
				<div className={"max-w-350 mx-auto px-4 py-10"}>
					<p className={"text-center text-sm md:text-base text-white"}>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. ipsum dolor sit amet, consectetur
						adipiscing elit. consectetu
					</p>
				</div>
			</footer>

			{/* Contact Modal */}
			<ContactModal
				isOpen={isContactOpen}
				onClose={() => setIsContactOpen(false)}
			/>
		</>
	);
}
