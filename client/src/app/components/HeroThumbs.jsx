'use client'
import { FadeInStaggerTwo, FadeInStaggerTwoChildren } from "./FadeInStaggerTwoChildren";
import Image from "next/image";
import Thumb1Img from "../../../public/1.webp";
import Thumb2Img from "../../../public/2.webp";
import Thumb3Img from "../../../public/3.webp";
import Thumb4Img from "../../../public/4.webp";
import Thumb5Img from "../../../public/5.webp";
import { useEffect } from "react";

function HeroThumbs() {

	useEffect(() => {
		const items = document.querySelectorAll('.aximo-hero-thumb-item');
		items.forEach((item, index) => {
		  item.style.setProperty('--index', index);
		  item.style.setProperty('--rotation', `${(index % 2 ? 8 : -8)}deg`);
		});
	  }, []);
	return (
		<FadeInStaggerTwo className="aximo-hero-thumb-wrap">
			<FadeInStaggerTwoChildren className="aximo-hero-thumb-item">
				<div className="image-container">
					<Image src={Thumb1Img} alt="Thumb images" fill className="image" />
				</div>
			</FadeInStaggerTwoChildren>
			<FadeInStaggerTwoChildren className="aximo-hero-thumb-item">
				<div className="image-container">
					<Image src={Thumb2Img} alt="Thumb images" fill className="image" />
				</div>
			</FadeInStaggerTwoChildren>
			<FadeInStaggerTwoChildren className="aximo-hero-thumb-item">
				<div className="image-container">
					<Image src={Thumb3Img} alt="Thumb images" fill className="image" />
				</div>
			</FadeInStaggerTwoChildren>
			<FadeInStaggerTwoChildren className="aximo-hero-thumb-item">
				<div className="image-container">
					<Image src={Thumb4Img} alt="Thumb images" fill className="image" />
				</div>
			</FadeInStaggerTwoChildren>
			<FadeInStaggerTwoChildren className="aximo-hero-thumb-item">
				<div className="image-container">
					<Image src={Thumb5Img} alt="Thumb images" fill className="image" />
				</div>
			</FadeInStaggerTwoChildren>
		</FadeInStaggerTwo>
	);
}

export default HeroThumbs;