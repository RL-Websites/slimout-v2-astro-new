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

// Real hosted product/category photography from the client's own S3 bucket (see SKILLS.md
// "Image & Video Assets" — reference these URLs directly, never download into the repo).
const S3 = "https://wellnesplusrx-s3.s3.us-east-1.amazonaws.com/slimout";
const MEDICINE = `${S3}/Slimout_v2/Medicine`;
const CATEGORY_V2 = `${S3}/Slimout_v2/Home_Page/Category`;

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
			name: "Semaglutide Injection 0.25 mg",
			desc: "Sema 0.25mg/0.5mg/0.5ml, Sema 0.5mg/0.5mg/0.5ml, Sema 1mg/0.5mg/0.5ml, Sema 1.7mg/0.5mg/0.5ml, Sema 2.5mg/0.5mg/0.5ml",
			qty: "15 vials",
			priceLabel: "Starting from",
			price: "$299.00",
			image: `${MEDICINE}/ChatGPT+Image+Aug+27%2C+2026%2C+10_50_39+AM.webp`,
		},
		{
			slot: "wl-p2",
			name: "Semaglutide Oral Tablets 1mg",
			desc: "Semaglutide 1mg/Pyridoxine 10mg - 240mg / Semaglutide 2mg/Pyridoxine 10mg - 240mg / Semaglutide 4mg/Pyridoxine 10mg - 240mg / Semaglutide 6mg/Pyridoxine 10mg - 240mg",
			qty: "8 tablets",
			priceLabel: "Starting from",
			price: "$299.00",
			image: `${MEDICINE}/Nude.webp`,
		},
		{
			slot: "wl-p3",
			name: "Tirzepatide Injection 2.5mg",
			desc: "Tirz 2.5mg/0.5mg/0.5ml, Tirz 5mg/0.5mg/0.5ml, Tirz 7.5mg/0.5mg/0.5ml, Tirz 10mg/0.5mg/0.5ml, Tirz 12.5mg/0.5mg/0.5ml, Tirz 15mg/0.5mg/0.5ml",
			qty: "18 vials",
			priceLabel: "Starting from",
			price: "$397.00",
			image: `${MEDICINE}/ChatGPT+Image+Aug+27%2C+2026%2C+10_57_32+AM.webp`,
		},
		{
			slot: "wl-p4",
			name: "Tirzepatide Oral Tablets 3mg",
			desc: "Tirzepatide 3mg - 240mg / Tirzepatide 4mg - 240mg / Tirzepatide 5mg - 240mg / Tirzepatide 6mg - 240mg",
			qty: "4 tablets",
			priceLabel: "Starting from",
			price: "$172.55",
			image: `${MEDICINE}/Deep+blue.webp`,
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

const sexualHealth: Category = {
	...stubCategory("sexual-health", "Sexual Health", "Hormonal"),
	products: [
		{
			slot: "sh-p1",
			name: "Epiq Chew 0",
			desc: "Tadalafil 5mg / Vardenafil HCl 5mg / Vit D3 2000IU / Vit K2 1mg (GUM)",
			qty: "3 doses",
			priceLabel: "Starting from",
			price: "$25.00",
			image: `${MEDICINE}/Blue+chew.webp`,
		},
		{
			slot: "sh-p2",
			name: "Red Pill-18",
			desc: "Tadalafil 20mg / Pycnogenol 25mg",
			qty: "3 doses",
			priceLabel: "Starting from",
			price: "$31.00",
			image: `${MEDICINE}/Red+Pill.webp`,
		},
		{
			slot: "sh-p3",
			name: "Mach 1-12",
			desc: "Tadalafil 20mg / Sildenafil 70mg",
			qty: "3 doses",
			priceLabel: "Starting from",
			price: "$48.00",
			image: `${MEDICINE}/mint.webp`,
		},
		{
			slot: "sh-p4",
			name: "Ignite4-6",
			desc: "Tadalafil 20mg / Sildenafil 70mg / Apomorphine 4mg",
			qty: "2 doses",
			priceLabel: "Starting from",
			price: "$36.00",
			image: `${MEDICINE}/Light+blue.webp`,
		},
	],
};

export const categories: Category[] = [
	weightLoss,
	{
		...stubCategory("hormone-therapy", "Hormone Therapy", "Hormonal"),
		heroImage: `${CATEGORY_V2}/Hormone+Therapy.webp`,
	},
	{
		...stubCategory("anti-aging", "Anti-Aging", "Longevity"),
		heroImage: `${CATEGORY_V2}/Anti+Aging.webp`,
	},
	sexualHealth,
	{
		...stubCategory("hair-regrowth", "Hair Regrowth", "Everyday"),
		heroImage: `${CATEGORY_V2}/Hair+Regrowth.webp`,
	},
	{
		...stubCategory("pre-workout", "Pre Workout", "Everyday"),
		heroImage: `${CATEGORY_V2}/Preworkout.webp`,
	},
	{
		...stubCategory("sleep", "Sleep", "Everyday"),
		heroImage: `${CATEGORY_V2}/Sleep.webp`,
	},
	{
		...stubCategory("testosterone", "Testosterone", "Hormonal"),
		heroImage: `${CATEGORY_V2}/Testosterone.webp`,
	},
];

export function getCategory(slug: string): Category | undefined {
	return categories.find((category) => category.slug === slug);
}
