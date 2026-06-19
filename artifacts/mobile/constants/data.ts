export type Service = { name: string; price: number };
export type Review = { name: string; comment: string; rating: number };
export type Salon = {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  description: string;
  phone: string;
  categories: string[];
  services: Service[];
  reviews: Review[];
  imageIndex: number;
};

export const SALON_IMAGES = [
  require("@/assets/images/salon1.png"),
  require("@/assets/images/salon2.png"),
  require("@/assets/images/salon3.png"),
];

export const CATEGORIES = [
  { id: "haircut", label: "Haircut", icon: "scissors" },
  { id: "beard", label: "Beard", icon: "user" },
  { id: "facial", label: "Facial", icon: "sun" },
  { id: "spa", label: "Spa", icon: "droplet" },
  { id: "makeup", label: "Makeup", icon: "heart" },
  { id: "massage", label: "Massage", icon: "wind" },
];

export const SALONS: Salon[] = [
  {
    id: "1",
    name: "Royal Salon",
    city: "Nashik",
    state: "Maharashtra",
    address: "CBS Road, Nashik, Maharashtra 422001",
    lat: 19.9975,
    lng: 73.7898,
    rating: 4.8,
    reviewCount: 124,
    description: "Premium hair salon with modern styling services and experienced professionals. We use only top-grade products for your hair and skin.",
    phone: "+91 9876543210",
    categories: ["haircut", "beard", "facial", "spa"],
    imageIndex: 0,
    services: [
      { name: "Haircut", price: 200 },
      { name: "Beard Styling", price: 100 },
      { name: "Facial", price: 500 },
      { name: "Hair Spa", price: 700 },
      { name: "Head Massage", price: 300 },
    ],
    reviews: [
      { name: "Rahul S.", comment: "Excellent service and very professional staff!", rating: 5 },
      { name: "Amit P.", comment: "Great haircut, very satisfied with the results.", rating: 4 },
      { name: "Vijay K.", comment: "Best salon in Nashik. Highly recommended!", rating: 5 },
    ],
  },
  {
    id: "2",
    name: "Style King Salon",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Linking Road, Bandra West, Mumbai 400050",
    lat: 19.0596,
    lng: 72.8295,
    rating: 4.7,
    reviewCount: 98,
    description: "Mumbai's most stylish salon offering premium grooming services. Our experts stay updated with the latest trends.",
    phone: "+91 9765432109",
    categories: ["haircut", "beard", "makeup"],
    imageIndex: 1,
    services: [
      { name: "Haircut", price: 350 },
      { name: "Beard Styling", price: 150 },
      { name: "Hair Color", price: 1200 },
      { name: "Facial", price: 600 },
      { name: "Makeup", price: 2000 },
    ],
    reviews: [
      { name: "Sanjay M.", comment: "Top class service! Worth every rupee.", rating: 5 },
      { name: "Priya R.", comment: "Love the ambiance and the staff is so friendly.", rating: 5 },
      { name: "Ravi D.", comment: "Good haircut but waiting time is a bit long.", rating: 4 },
    ],
  },
  {
    id: "3",
    name: "Luxury Hair Studio",
    city: "Pune",
    state: "Maharashtra",
    address: "FC Road, Shivajinagar, Pune 411005",
    lat: 18.5204,
    lng: 73.8567,
    rating: 4.9,
    reviewCount: 215,
    description: "Pune's premier luxury hair studio. Experience world-class hair treatments with our certified stylists.",
    phone: "+91 9654321098",
    categories: ["haircut", "spa", "facial"],
    imageIndex: 2,
    services: [
      { name: "Haircut", price: 500 },
      { name: "Hair Spa", price: 1500 },
      { name: "Keratin Treatment", price: 3500 },
      { name: "Facial", price: 800 },
      { name: "Head Massage", price: 400 },
    ],
    reviews: [
      { name: "Neha G.", comment: "Absolutely amazing! Best salon experience ever.", rating: 5 },
      { name: "Anil B.", comment: "The keratin treatment was fantastic!", rating: 5 },
      { name: "Sunita K.", comment: "Very hygienic and professional environment.", rating: 5 },
    ],
  },
  {
    id: "4",
    name: "Glamour Studio",
    city: "Nagpur",
    state: "Maharashtra",
    address: "Sitabuldi, Nagpur, Maharashtra 440012",
    lat: 21.1458,
    lng: 79.0882,
    rating: 4.6,
    reviewCount: 87,
    description: "Nagpur's leading beauty destination offering complete grooming and beauty solutions for men and women.",
    phone: "+91 9543210987",
    categories: ["makeup", "facial", "spa"],
    imageIndex: 0,
    services: [
      { name: "Haircut", price: 180 },
      { name: "Bridal Makeup", price: 5000 },
      { name: "Facial", price: 450 },
      { name: "Spa Package", price: 1200 },
      { name: "Mehendi", price: 800 },
    ],
    reviews: [
      { name: "Pooja S.", comment: "Did my bridal makeup here. Just perfect!", rating: 5 },
      { name: "Rohan T.", comment: "Good service, reasonable prices.", rating: 4 },
    ],
  },
  {
    id: "5",
    name: "Elite Cuts",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    address: "Osmanpura, Chhatrapati Sambhajinagar, Maharashtra 431005",
    lat: 19.8762,
    lng: 75.3433,
    rating: 4.5,
    reviewCount: 63,
    description: "Modern barber shop with a vintage touch. Specializing in classic and contemporary men's grooming.",
    phone: "+91 9432109876",
    categories: ["haircut", "beard"],
    imageIndex: 1,
    services: [
      { name: "Classic Haircut", price: 150 },
      { name: "Beard Trim", price: 80 },
      { name: "Hot Towel Shave", price: 200 },
      { name: "Hair Color", price: 800 },
      { name: "Scalp Treatment", price: 600 },
    ],
    reviews: [
      { name: "Mahesh L.", comment: "Best barber in town! Always consistent.", rating: 5 },
      { name: "Dinesh V.", comment: "Love the vintage vibe. Great haircuts!", rating: 4 },
    ],
  },
];

export const STATES = [
  "Maharashtra",
  "Gujarat",
  "Karnataka",
  "Delhi",
  "Rajasthan",
  "Tamil Nadu",
  "Other State",
];

export const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM",
];
