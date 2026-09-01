export type OrderStatus = 'In Review' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PayStatus = 'Paid' | 'Not Paid' | 'Payment on Hold' | 'Payment Failed';

export type ItemType = 'Injection' | 'Tablet';

export interface OrderItem {
	name: string;
	bundle?: number;
	contents?: string[];
	status: OrderStatus;
	intake?: boolean;
	type: ItemType;
	qty: number;
	price: string;
	tracking: string;
}

export interface Order {
	id: string;
	date: string;
	billing: string;
	amount: number;
	pay: PayStatus;
	items: OrderItem[];
}

export const ORDERS: Order[] = [
	{
		id: '#SO-24810',
		date: 'Aug 14, 2026 10:26 AM',
		billing: 'Jordan Ellis',
		amount: 862.32,
		pay: 'Not Paid',
		items: [
			{
				name: 'Metabolic Reset Package',
				bundle: 2,
				contents: ['Tirzepatide 30mg', 'Semaglutide 1mg', 'Bacteriostatic Water 30mL'],
				status: 'In Review',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$430.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24796',
		date: 'Aug 09, 2026 09:02 AM',
		billing: 'Jordan Ellis',
		amount: 299.0,
		pay: 'Paid',
		items: [
			{
				name: 'Tirzemelt 20',
				status: 'Processing',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$299.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24771',
		date: 'Aug 02, 2026 04:41 PM',
		billing: 'Jordan Ellis',
		amount: 512.0,
		pay: 'Paid',
		items: [
			{
				name: 'Semaglutide 1mg',
				status: 'Delivered',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$390.00',
				tracking: '#N/A',
			},
			{
				name: 'Anastrozole 0.5mg',
				status: 'Delivered',
				type: 'Tablet',
				qty: 1,
				price: '$122.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24755',
		date: 'Jul 27, 2026 11:18 AM',
		billing: 'Jordan Ellis',
		amount: 35.0,
		pay: 'Payment on Hold',
		items: [
			{
				name: 'Follicle Fuel 1',
				status: 'Cancelled',
				type: 'Tablet',
				qty: 1,
				price: '$35.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24738',
		date: 'Jul 21, 2026 08:55 AM',
		billing: 'Jordan Ellis',
		amount: 189.5,
		pay: 'Not Paid',
		items: [
			{
				name: 'Testosterone Cypionate 200mg',
				status: 'In Review',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$189.50',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24702',
		date: 'Jul 12, 2026 02:07 PM',
		billing: 'Jordan Ellis',
		amount: 64.0,
		pay: 'Paid',
		items: [
			{
				name: 'Sleep Support Blend',
				status: 'Delivered',
				type: 'Tablet',
				qty: 1,
				price: '$64.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24689',
		date: 'Jul 04, 2026 10:33 AM',
		billing: 'Jordan Ellis',
		amount: 862.32,
		pay: 'Payment Failed',
		items: [
			{
				name: 'Hormone Balance Package',
				bundle: 2,
				contents: ['Testosterone Cypionate 200mg', 'Anastrozole 0.5mg', 'HCG 5000iu'],
				status: 'Delivered',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$430.00',
				tracking: '#N/A',
			},
			{
				name: 'Longevity Stack Package',
				bundle: 3,
				contents: ['NAD+ 100mg', 'Sermorelin 9mg', 'Glutathione 200mg', 'Vitamin B12'],
				status: 'Shipped',
				type: 'Injection',
				qty: 1,
				price: '$432.32',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24651',
		date: 'Jun 26, 2026 05:12 PM',
		billing: 'Jordan Ellis',
		amount: 78.0,
		pay: 'Paid',
		items: [
			{
				name: 'Pre Workout Stack',
				status: 'Shipped',
				type: 'Tablet',
				qty: 1,
				price: '$78.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24630',
		date: 'Jun 18, 2026 09:44 AM',
		billing: 'Jordan Ellis',
		amount: 430.0,
		pay: 'Not Paid',
		items: [
			{
				name: 'Semaglutide 2.5mg',
				status: 'Processing',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$390.00',
				tracking: '#N/A',
			},
			{
				name: 'Recovery Peptide Package',
				bundle: 2,
				contents: ['BPC-157 5mg', 'TB-500 5mg', 'Bacteriostatic Water 30mL'],
				status: 'In Review',
				type: 'Injection',
				qty: 1,
				price: '$40.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24612',
		date: 'Jun 09, 2026 01:26 PM',
		billing: 'Jordan Ellis',
		amount: 35.0,
		pay: 'Paid',
		items: [
			{
				name: 'Follicle Fuel 1',
				status: 'Delivered',
				type: 'Tablet',
				qty: 1,
				price: '$35.00',
				tracking: '#N/A',
			},
		],
	},
	{
		id: '#SO-24588',
		date: 'Jun 01, 2026 03:18 PM',
		billing: 'Jordan Ellis',
		amount: 189.5,
		pay: 'Not Paid',
		items: [
			{
				name: 'Testosterone Cypionate 200mg',
				status: 'In Review',
				intake: true,
				type: 'Injection',
				qty: 1,
				price: '$110.50',
				tracking: '#N/A',
			},
			{
				name: 'Sleep Support Blend',
				status: 'Processing',
				type: 'Tablet',
				qty: 1,
				price: '$64.00',
				tracking: '#N/A',
			},
			{
				name: 'Anti-Aging Package',
				bundle: 3,
				contents: ['NAD+ 100mg', 'Tretinoin 0.05%', 'Glutathione 200mg', 'Collagen Peptides'],
				status: 'In Review',
				type: 'Injection',
				qty: 1,
				price: '$15.00',
				tracking: '#N/A',
			},
		],
	},
];

export const FILTERS: Array<OrderStatus | 'All'> = [
	'All',
	'In Review',
	'Processing',
	'Shipped',
	'Delivered',
	'Cancelled',
];

export function statusSlug(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Order IDs are shown with a leading "#" (e.g. "#SO-24810") which isn't URL-safe as a path
// segment, so routes use the id without it.
export function orderSlug(id: string): string {
	return id.replace(/^#/, '');
}

export function findOrderBySlug(slug: string): Order | undefined {
	return ORDERS.find((order) => orderSlug(order.id) === slug);
}

interface TimelineStage {
	label: string;
	note: string;
	time: string;
}

export const STAGE_TIMELINES: Record<OrderStatus, TimelineStage[]> = {
	'In Review': [
		{ label: 'Order Placed', note: 'Order placed and payment captured.', time: '6:01 PM' },
		{
			label: 'Waiting for Lab',
			note: 'Order is waiting because one or more items require a lab report.',
			time: '6:03 PM',
		},
		{ label: 'Lab Uploaded', note: 'Lab report uploaded for this order.', time: '6:04 PM' },
		{
			label: 'Awaiting Doctor Review',
			note: 'Prescription sent to Docmedilink and is pending.',
			time: '6:04 PM',
		},
	],
	Processing: [
		{ label: 'Order Placed', note: 'Order placed and payment captured.', time: '6:01 PM' },
		{
			label: 'Waiting for Lab',
			note: 'Order is waiting because one or more items require a lab report.',
			time: '6:03 PM',
		},
		{ label: 'Lab Uploaded', note: 'Lab report uploaded for this order.', time: '6:04 PM' },
		{
			label: 'Awaiting Doctor Review',
			note: 'Prescription sent to Docmedilink and is pending.',
			time: '6:04 PM',
		},
		{
			label: 'Sent to Pharmacy',
			note: 'Prescription status updated by Docmedilink. Pharmacy: Path Pharma.',
			time: '6:16 PM',
		},
	],
	Shipped: [
		{ label: 'Order Placed', note: 'Order placed and payment captured.', time: '6:01 PM' },
		{
			label: 'Waiting for Lab',
			note: 'Order is waiting because one or more items require a lab report.',
			time: '6:03 PM',
		},
		{ label: 'Lab Uploaded', note: 'Lab report uploaded for this order.', time: '6:04 PM' },
		{
			label: 'Awaiting Doctor Review',
			note: 'Prescription sent to Docmedilink and is pending.',
			time: '6:04 PM',
		},
		{
			label: 'Sent to Pharmacy',
			note: 'Prescription status updated by Docmedilink. Pharmacy: Path Pharma.',
			time: '6:16 PM',
		},
		{ label: 'Shipped', note: 'Package handed to the carrier.', time: '8:40 AM' },
	],
	Delivered: [
		{ label: 'Order Placed', note: 'Order placed and payment captured.', time: '6:01 PM' },
		{
			label: 'Waiting for Lab',
			note: 'Order is waiting because one or more items require a lab report.',
			time: '6:03 PM',
		},
		{ label: 'Lab Uploaded', note: 'Lab report uploaded for this order.', time: '6:04 PM' },
		{
			label: 'Awaiting Doctor Review',
			note: 'Prescription sent to Docmedilink and is pending.',
			time: '6:04 PM',
		},
		{
			label: 'Sent to Pharmacy',
			note: 'Prescription status updated by Docmedilink. Pharmacy: Path Pharma.',
			time: '6:16 PM',
		},
		{ label: 'Shipped', note: 'Package handed to the carrier.', time: '8:40 AM' },
		{ label: 'Delivered', note: 'Package delivered to the shipping address.', time: '2:15 PM' },
	],
	Cancelled: [
		{ label: 'Order Placed', note: 'Order placed and payment captured.', time: '6:01 PM' },
		{
			label: 'Awaiting Doctor Review',
			note: 'Prescription sent to Docmedilink and is pending.',
			time: '6:04 PM',
		},
		{ label: 'Doctor Declined', note: 'Not approved by the reviewing provider.', time: '6:20 PM' },
	],
};

export const FILL_PERIODS: string[] = [
	'12 Aug, 2026 – 11 Sep, 2026',
	'12 Sep, 2026 – 12 Oct, 2026',
	'13 Oct, 2026 – 12 Nov, 2026',
	'13 Nov, 2026 – 13 Dec, 2026',
	'14 Dec, 2026 – 13 Jan, 2027',
	'14 Jan, 2027 – 13 Feb, 2027',
	'14 Feb, 2027 – 16 Mar, 2027',
	'17 Mar, 2027 – 16 Apr, 2027',
	'17 Apr, 2027 – 17 May, 2027',
	'18 May, 2027 – 17 Jun, 2027',
	'18 Jun, 2027 – 18 Jul, 2027',
	'19 Jul, 2027 – 18 Aug, 2027',
];

export const STAGE_COLORS: Record<string, { bg: string; fg: string }> = {
	Received: { bg: '#EFF1E6', fg: '#5A6653' },
	Processing: { bg: '#DFEEF6', fg: '#1D5872' },
	'Awaiting Shipment': { bg: '#FBF0D4', fg: '#7A5A11' },
	Shipped: { bg: '#EFF2DC', fg: '#5F6E1D' },
	Delivered: { bg: '#E4F1DA', fg: '#3D6B24' },
};

export const STAGE_ORDER = ['Received', 'Processing', 'Awaiting Shipment', 'Shipped', 'Delivered'];

export const STATUS_TO_STAGE: Record<OrderStatus | 'Declined', string> = {
	'In Review': 'Processing',
	Processing: 'Awaiting Shipment',
	Shipped: 'Shipped',
	Delivered: 'Delivered',
	Cancelled: 'Received',
	Declined: 'Received',
};
