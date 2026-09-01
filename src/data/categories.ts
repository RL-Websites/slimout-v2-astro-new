export interface CategoryProduct {
	slot: string;
	name: string;
	desc: string;
	qty: string;
	priceLabel: string;
	price: string;
	image: string;
}

export interface CategoryFaq {
	q: string;
	a: string;
}

export interface Category {
	slug: string;
	name: string;
	tag: string;
	blurb: string;
	heroImage: string;
	products: CategoryProduct[];
	recommended: CategoryProduct[];
	faqs: CategoryFaq[];
}

const PLACEHOLDER_PRODUCT =
	"Themes/Thrivewellrx.Theme.SlimoutV2/assets/img/product-placeholder.svg";

const weightLoss: Category = {
	slug: "weight-loss",
	name: "Weight Loss",
	tag: "Metabolic",
	blurb:
		"Provider-guided weight loss programs paired with ongoing support, so your plan adapts as your goals change.",
	heroImage:
		"Themes/Thrivewellrx.Theme.SlimoutV2/assets/img/category/weight-loss.webp",
	products: [
		{
			slot: "wl-p1",
			name: "GLP-1 Program",
			desc: "A provider-managed injectable program with dosage adjustments as you progress.",
			qty: "1 month supply",
			priceLabel: "Starting at",
			price: "$249/mo",
			image: PLACEHOLDER_PRODUCT,
		},
		{
			slot: "wl-p2",
			name: "Metabolic Support Kit",
			desc: "Daily oral support formulated to complement your primary treatment plan.",
			qty: "30-day supply",
			priceLabel: "Starting at",
			price: "$89/mo",
			image: PLACEHOLDER_PRODUCT,
		},
		{
			slot: "wl-p3",
			name: "Appetite Control Add-On",
			desc: "An optional add-on for patients who need extra support between doses.",
			qty: "30-day supply",
			priceLabel: "Starting at",
			price: "$59/mo",
			image: PLACEHOLDER_PRODUCT,
		},
	],
	recommended: [
		{
			slot: "wl-r1",
			name: "B12 Injection",
			desc: "A monthly injection often paired with weight loss programs for added energy support.",
			qty: "4 doses",
			priceLabel: "Starting at",
			price: "$39/mo",
			image: PLACEHOLDER_PRODUCT,
		},
		{
			slot: "wl-r2",
			name: "Daily Multivitamin",
			desc: "A well-rounded multivitamin to help fill common nutritional gaps.",
			qty: "30-day supply",
			priceLabel: "Starting at",
			price: "$19/mo",
			image: PLACEHOLDER_PRODUCT,
		},
		{
			slot: "wl-r3",
			name: "Protein Support Blend",
			desc: "A lightly sweetened protein blend designed to support lean muscle.",
			qty: "30 servings",
			priceLabel: "Starting at",
			price: "$44/mo",
			image: PLACEHOLDER_PRODUCT,
		},
		{
			slot: "wl-r4",
			name: "At-Home Lab Kit",
			desc: "A self-collection kit used to check key baseline markers from home.",
			qty: "1 kit",
			priceLabel: "Starting at",
			price: "$79",
			image: PLACEHOLDER_PRODUCT,
		},
	],
	faqs: [
		{
			q: "How does the Weight Loss program work?",
			a: "After a short intake, a licensed provider reviews your history and goals to recommend a plan. Your dosage and plan can be adjusted over time as you check in with your care team.",
		},
		{
			q: "Am I eligible for treatment?",
			a: "Eligibility is determined by a licensed provider based on your intake and medical history. Not everyone will qualify for every treatment option.",
		},
		{
			q: "How is my medication shipped?",
			a: "Once your plan is approved, your prescription is sent to one of our trusted pharmacy partners and shipped directly to your door.",
		},
		{
			q: "Can I change or cancel my plan?",
			a: "Yes. You can discuss adjusting your plan with your care team at any time, and subscriptions can be paused or cancelled from your account.",
		},
		{
			q: "Is lab testing required?",
			a: "Some treatment options may require baseline lab work before a provider can approve a prescription. Your care team will let you know if this applies to your plan.",
		},
	],
};

function stubCategory(slug: string, name: string, tag: string): Category {
	return {
		slug,
		name,
		tag,
		blurb: `Provider-guided ${name.toLowerCase()} programs paired with ongoing support, so your plan adapts as your goals change.`,
		heroImage: `Themes/Thrivewellrx.Theme.SlimoutV2/assets/img/category/${slug === "pre-workout" ? "preworkout" : slug}.webp`,
		products: [
			{
				slot: `${slug}-p1`,
				name: `${name} Program`,
				desc: "A provider-managed treatment plan tailored to your intake and goals.",
				qty: "1 month supply",
				priceLabel: "Starting at",
				price: "$—/mo",
				image: PLACEHOLDER_PRODUCT,
			},
			{
				slot: `${slug}-p2`,
				name: `${name} Support Kit`,
				desc: "Daily support formulated to complement your primary treatment plan.",
				qty: "30-day supply",
				priceLabel: "Starting at",
				price: "$—/mo",
				image: PLACEHOLDER_PRODUCT,
			},
			{
				slot: `${slug}-p3`,
				name: `${name} Add-On`,
				desc: "An optional add-on recommended by your care team.",
				qty: "30-day supply",
				priceLabel: "Starting at",
				price: "$—/mo",
				image: PLACEHOLDER_PRODUCT,
			},
		],
		recommended: [
			{
				slot: `${slug}-r1`,
				name: "Daily Multivitamin",
				desc: "A well-rounded multivitamin to help fill common nutritional gaps.",
				qty: "30-day supply",
				priceLabel: "Starting at",
				price: "$19/mo",
				image: PLACEHOLDER_PRODUCT,
			},
			{
				slot: `${slug}-r2`,
				name: "At-Home Lab Kit",
				desc: "A self-collection kit used to check key baseline markers from home.",
				qty: "1 kit",
				priceLabel: "Starting at",
				price: "$79",
				image: PLACEHOLDER_PRODUCT,
			},
			{
				slot: `${slug}-r3`,
				name: "B12 Injection",
				desc: "A monthly injection often paired with provider-guided programs for added energy support.",
				qty: "4 doses",
				priceLabel: "Starting at",
				price: "$39/mo",
				image: PLACEHOLDER_PRODUCT,
			},
			{
				slot: `${slug}-r4`,
				name: "Protein Support Blend",
				desc: "A lightly sweetened protein blend designed to support lean muscle.",
				qty: "30 servings",
				priceLabel: "Starting at",
				price: "$44/mo",
				image: PLACEHOLDER_PRODUCT,
			},
		],
		faqs: [
			{
				q: `How does the ${name} program work?`,
				a: "After a short intake, a licensed provider reviews your history and goals to recommend a plan tailored to you.",
			},
			{
				q: "Am I eligible for treatment?",
				a: "Eligibility is determined by a licensed provider based on your intake and medical history. Not everyone will qualify for every treatment option.",
			},
			{
				q: "How is my medication shipped?",
				a: "Once your plan is approved, your prescription is sent to one of our trusted pharmacy partners and shipped directly to your door.",
			},
		],
	};
}

export const categories: Category[] = [
	weightLoss,
	stubCategory("hormone-therapy", "Hormone Therapy", "Hormonal"),
	stubCategory("anti-aging", "Anti-Aging", "Longevity"),
	stubCategory("sexual-health", "Sexual Health", "Hormonal"),
	stubCategory("hair-regrowth", "Hair Regrowth", "Everyday"),
	stubCategory("pre-workout", "Pre Workout", "Everyday"),
	stubCategory("sleep", "Sleep", "Everyday"),
	stubCategory("testosterone", "Testosterone", "Hormonal"),
];

export function getCategory(slug: string): Category | undefined {
	return categories.find((category) => category.slug === slug);
}
