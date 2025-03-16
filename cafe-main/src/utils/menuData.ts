export type MenuItemType = {
  id: string;
  name?: string;
  item_name?: string;
  price: number;
  prices?: {
    S?: number;
    R?: number;
    L?: number;
  };
  description?: string;
  image?: string;
  image_url?: string;
  category: string;
  recommended?: boolean;
  veg?: boolean;
  unavailable?: boolean;
  is_available?: boolean;
  // Add these fields for size functionality
  hasSizes?: boolean;
  currentSize?: 'small' | 'medium' | 'large';
};

const menuData: MenuCategoryType[] = [
  {
    id: "breakfast",
    name: "ENGLISH BREAKFAST",
    items: [
      { id: "garlic-bread", name: "GARLIC BREAD", price: 99, category: "breakfast" },
      { id: "egg-croissant", name: "EGG CROISSANT", price: 137, category: "breakfast" },
      { id: "chocolate-croissant", name: "CHOCOLATE CROISSANT", price: 82, category: "breakfast" },
      { id: "maggi", name: "MAGGI", price: 99, category: "breakfast" },
      { id: "chicken-pasta", name: "CHICKEN PASTA", price: 150, category: "breakfast" },
      { id: "veg-pasta", name: "VEG PASTA", price: 130, category: "breakfast", veg: true },
      { id: "chicken-wrap", name: "CHICKEN WRAP", price: 160, category: "breakfast" },
      { id: "paneer-wrap", name: "PANEER WRAP", price: 143, category: "breakfast", veg: true },
      { id: "chicken-tikka-sandwich", name: "CHICKEN TIKKA SANDWICH", price: 147, category: "breakfast", recommended: true, image: "/food-images/CHICKEN TIKKA SANDWICH.jpg" },
      { id: "paneer-tikka-sandwich", name: "PANEER TIKKA SANDWICH", price: 130, category: "breakfast", veg: true },
      { id: "smoke-chicken-sandwich", name: "SMOKE CHICKEN SANDWICH", price: 181, category: "breakfast", recommended: true, image: "/food-images/SMOKE CHICKEN SANDWICH.jpg" },
      { id: "spinach-corn-sandwich", name: "SPINACH CORN SANDWICH", price: 154, category: "breakfast", veg: true },
      { id: "paneer-tikka-sub", name: "PANEER TIKKA SUB", price: 130, category: "breakfast", veg: true },
      { id: "chicken-tikka-sub", name: "CHICKEN TIKKA SUB", price: 150, category: "breakfast" }
    ]
  },
  {
    id: "pizza",
    name: "PIZZA'S",
    items: [
      { id: "paneer-tikka-pizza", name: "PANEER TIKKA PIZZA", price: 140, category: "pizza", veg: true },
      { id: "chicken-tikka-pizza", name: "CHICKEN TIKKA PIZZA", price: 160, category: "pizza", recommended: true, image: "/food-images/CHICKEN TIKKA PIZZA.jpg" },
      { id: "sweet-corn-pizza", name: "SWEET CORN PIZZA", price: 140, category: "pizza", veg: true },
      { id: "margarita-pizza", name: "MARGARITA PIZZA", price: 90, category: "pizza", veg: true },
      { id: "veg-supreme-pizza", name: "VEG SUPREME PIZZA", price: 110, category: "pizza", veg: true }
    ]
  },
  {
    id: "burger",
    name: "BURGER'S",
    items: [
      { id: "veg-mini-burger", name: "VEG MINI BURGER", price: 120, category: "burger", veg: true },
      { id: "plain-french-fries", name: "PLAIN FRENCH FRIES", price: 99, category: "burger", veg: true },
      { id: "peri-peri-fries", name: "PERI PERI FRIES", price: 120, category: "burger", veg: true },
      { id: "classic-burger", name: "CLASSIC BURGER", price: 120, category: "burger" },
      { id: "tandoori-burger", name: "TANDOORI BURGER", price: 140, category: "burger", recommended: true, image: "/food-images/TANDOORI BURGER.jpg" }
    ]
  },
  {
    id: "snacks",
    name: "SNACK'S",
    items: [
      { id: "veg-puff", name: "VEG PUFF", price: 78, category: "snacks", veg: true },
      { id: "chicken-puff", name: "CHICKEN PUFF", price: 92, category: "snacks" },
      { id: "veg-nuggets", name: "VEG NUGGETS", price: 110, category: "snacks", veg: true },
      { id: "chicken-nuggets", name: "CHICKEN NUGGETS", price: 120, category: "snacks" },
      { id: "veg-momoz", name: "VEG MOMOZ", price: 110, category: "snacks", veg: true },
      { id: "chicken-momoz", name: "CHICKEN MOMOZ", price: 130, category: "snacks" },
      { id: "chicken-popcorn", name: "CHICKEN POPCORN", price: 135, category: "snacks" },
      { id: "chicken-leg-piece", name: "CHICKEN LEG PIECE", price: 199, category: "snacks", recommended: true, image: "/food-images/CHICKEN LEG PIECE.jpg" },
      { id: "chicken-wings", name: "CHICKEN WINGS", price: 150, category: "snacks" }
    ]
  },
  {
    id: "desserts",
    name: "DESERT'S",
    items: [
      { id: "almond-muffin", name: "ALMOND MUFFIN", price: 119, category: "desserts", veg: true },
      { id: "blueberry-muffin", name: "BLUEBERRY MUFFIN", price: 119, category: "desserts", veg: true },
      { id: "choco-chip-muffin", name: "CHOCO CHIP MUFFIN", price: 119, category: "desserts", veg: true },
      { id: "banana-walnut-cake", name: "BANANA WALNUT CAKE", price: 102, category: "desserts", veg: true },
      { id: "lemon-chiffon-cake", name: "LEMON CHIFFON CAKE", price: 78, category: "desserts", veg: true },
      { id: "marble-cake", name: "MARBLE CAKE", price: 78, category: "desserts", veg: true },
      { id: "brownie-walnut-cake", name: "BROWNIE WALNUT CAKE", price: 130, category: "desserts", veg: true, recommended: true, image: "/food-images/BROWNIE WALNUT CAKE.jpg" },
      { id: "chocolate-donut", name: "CHOCOLATE DONUT", price: 104, category: "desserts", veg: true },
      { id: "white-chocolate-donut", name: "WHITE CHOCOLATE DONUT", price: 104, category: "desserts", veg: true },
      { id: "caramel-fudge-donut", name: "CARAMEL FUDGE DONUT", price: 104, category: "desserts", veg: true },
      { id: "red-velvet-pastry", name: "RED VELVET PASTRY", price: 130, category: "desserts", veg: true },
      { id: "black-forest-pastry", name: "BLACK FOREST PASTRY", price: 130, category: "desserts", veg: true },
      { id: "pineapple-pastry", name: "PINEAPPLE PASTRY", price: 130, category: "desserts", veg: true },
      { id: "blue-berry-cheese-pastry", name: "BLUE BERRY CHEESE PASTRY", price: 147, category: "desserts", veg: true },
      { id: "plain-cheese-pastry", name: "PLAIN CHEESE PASTRY", price: 147, category: "desserts", veg: true },
      { id: "death-by-chocolate-pastry", name: "DEATH BY CHOCOLATE PASTRY", price: 147, category: "desserts", veg: true, recommended: true, image: "/food-images/DEATH BY CHOCOLATE PST.jpg" },
      { id: "choco-chip-cookie", name: "CHOCO CHIP COOKIE", price: 65, category: "desserts", veg: true },
      { id: "crunchy-oat-cookie", name: "CRUNCHY OAT COOKIE", price: 65, category: "desserts", veg: true },
      { id: "bun-muska", name: "BUN MUSKA", price: 65, category: "desserts", veg: true },
      { id: "wicked-brownie", name: "WICKED BROWNIE", price: 198, category: "desserts", veg: true },
      { id: "dark-temptations", name: "DARK TEMPTATIONS", price: 198, category: "desserts", veg: true }
    ]
  },
  {
    id: "barista-cakes",
    name: "BARISTA CAKE'S",
    items: [
      { id: "death-by-chocolate", name: "DEATH BY CHOCOLATE (500GMS)", price: 587, category: "barista-cakes", veg: true },
      { id: "truly-truffle-cake", name: "TRULY TRUFFLE CAKE (500GMS)", price: 587, category: "barista-cakes", veg: true },
      { id: "choco-caramel-cake", name: "CHOCO CARAMEL CAKE (500GMS)", price: 587, category: "barista-cakes", veg: true },
      { id: "plain-cheese-cake", name: "PLAIN CHEESE CAKE (1KG)", price: 1174, category: "barista-cakes", veg: true },
      { id: "red-velvet-cake", name: "RED VELVET CAKE (500GMS)", price: 519, category: "barista-cakes", veg: true },
      { id: "black-forest-cake", name: "BLACK FOREST CAKE (500GMS)", price: 519, category: "barista-cakes", veg: true },
      { id: "pine-apple-cake", name: "PINE APPLE CAKE (500GMS)", price: 519, category: "barista-cakes", veg: true },
      { id: "blue-berry-cheese-cake", name: "BLUE BERRY CHEESE CAKE (1KG)", price: 1400, category: "barista-cakes", veg: true, recommended: true, image: "/food-images/BLUE BERRY CHEESE CAKE.jpg" }
    ]
  },
  {
    id: "hot",
    name: "HOT",
    items: [
      { 
        id: "mochta", 
        name: "MOCHTA", 
        category: "hot",
        prices: { S: 135, R: 151, L: 164 },
        price: 135
      },
      { 
        id: "hot-chocolate", 
        name: "HOT CHOCOLATE", 
        category: "hot",
        prices: { S: 135, R: 151, L: 164 },
        price: 135
      },
      { id: "affogato", name: "AFFOGATO", price: 95, category: "hot" }
    ]
  },
  {
    id: "coffee",
    name: "COFFEE",
    items: [
      { 
        id: "cappuccino", 
        name: "CAPPUCCINO", 
        category: "coffee",
        prices: { S: 104, R: 117, L: 126 },
        price: 104
      },
      { 
        id: "lattee", 
        name: "LATTEE", 
        category: "coffee",
        prices: { S: 110, R: 123, L: 139 },
        price: 110,
        recommended: true,
        image: "/food-images/LATTEE.jpg"
      },
      { 
        id: "americano", 
        name: "AMERICANO", 
        category: "coffee",
        prices: { S: 88, R: 104, L: 117 },
        price: 88
      },
      { id: "espresso", name: "ESPRESSO", price: 79, category: "coffee" }
    ]
  },
  {
    id: "tea",
    name: "TEA",
    items: [
      { id: "ginger-honey-tea", name: "GINGER HONEY TEA", price: 104, category: "tea" },
      { id: "masala-tea", name: "MASALA TEA", price: 104, category: "tea", recommended: true, image: "/food-images/MASALA TEA.jpg" },
      { id: "assam-tea", name: "ASSAM TEA", price: 104, category: "tea" },
      { id: "darjeeling-tea", name: "DARJEELING TEA", price: 104, category: "tea" },
      { id: "green-tea", name: "GREEN TEA", price: 104, category: "tea" }
    ]
  },
  {
    id: "ice-tea",
    name: "ICE TEA",
    items: [
      { 
        id: "peach-ice-tea", 
        name: "PEACH ICE TEA", 
        category: "ice-tea",
        prices: { S: 117, R: 135 },
        price: 117
      },
      { 
        id: "lemon-ice-tea", 
        name: "LEMON ICE TEA", 
        category: "ice-tea",
        prices: { S: 117, R: 135 },
        price: 117,
        recommended: true,
        image: "/food-images/LEMON ICE TEA.jpg"
      }
    ]
  },
  {
    id: "ice-coffee",
    name: "ICE COFFEE",
    items: [
      { 
        id: "brrrista", 
        name: "BRRRISTA", 
        category: "ice-coffee",
        prices: { S: 123, R: 142 },
        price: 123
      },
      { 
        id: "iced-americano", 
        name: "ICED AMERICANO", 
        category: "ice-coffee",
        prices: { S: 104, R: 120 },
        price: 104
      },
      { 
        id: "iced-latte", 
        name: "ICED LATTE", 
        category: "ice-coffee",
        prices: { S: 123, R: 142 },
        price: 123
      },
      { 
        id: "iced-cafe-mocha", 
        name: "ICED CAFÉ MOCHA", 
        category: "ice-coffee",
        prices: { S: 151, R: 167 },
        price: 151,
        recommended: true,
        image: "/food-images/ICED CAFE MOCHA.jpg"
      }
    ]
  },
  {
    id: "mojitos",
    name: "MOJITO'S",
    items: [
      { 
        id: "classic-mojito", 
        name: "CLASSIC MOJITO", 
        category: "mojitos",
        prices: { S: 135, R: 148 },
        price: 135
      },
      { 
        id: "green-apple-mojito", 
        name: "GREEN APPLE MOJITO", 
        category: "mojitos",
        prices: { S: 145, R: 161 },
        price: 145,
        recommended: true
      },
      { 
        id: "blue-curraco-mojito", 
        name: "BLUE CURRACO MOJITO", 
        category: "mojitos",
        prices: { S: 135, R: 148 },
        price: 135
      },
      { 
        id: "water-melon-mojito", 
        name: "WATER MELON MOJITO", 
        category: "mojitos",
        prices: { S: 135, R: 148 },
        price: 135
      }
    ]
  },
  {
    id: "cold-coffee",
    name: "COLD COFFEE",
    items: [
      { 
        id: "barista-frappe", 
        name: "BARISTA FRAPPE", 
        category: "cold-coffee",
        prices: { S: 167, R: 186 },
        price: 167
      },
      { 
        id: "vanilla-frappe", 
        name: "VANILLA FRAPPE", 
        category: "cold-coffee",
        prices: { S: 198, R: 217 },
        price: 198
      },
      { 
        id: "brownie-frappe", 
        name: "BROWNIE FRAPPE", 
        category: "cold-coffee",
        prices: { S: 233, R: 258 },
        price: 233,
        recommended: true
      },
      { 
        id: "brrrista-blast", 
        name: "BRRRISTA BLAST", 
        category: "cold-coffee",
        prices: { S: 208, R: 224 },
        price: 208
      }
    ]
  },
  {
    id: "smoothies",
    name: "SMOOTHIES",
    items: [
      { 
        id: "chocolate-smoothie", 
        name: "CHOCOLATE SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "mango-smoothie", 
        name: "MANGO SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "triple-berry", 
        name: "TRIPLE BERRY", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158,
        recommended: true
      },
      { 
        id: "thiramisu", 
        name: "THIRAMISU", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "rose-faluda", 
        name: "ROSE FALUDA", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "kitkat-smoothie", 
        name: "KITKAT SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "oreo-smoothie", 
        name: "OREO SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "strawberry-smoothie", 
        name: "STRAWBERRY SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "peanut-butter-smoothie", 
        name: "PEANUT BUTTER SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      },
      { 
        id: "dry-fruit-smoothie", 
        name: "DRY FRUIT SMOOTHIE", 
        category: "smoothies",
        prices: { S: 158, R: 186 },
        price: 158
      }
    ]
  }
];

export const getRecommendedItems = (): MenuItemType[] => {
  const allItems = menuData.flatMap(category => category.items);
  const recommendedItems = allItems.filter(item => item.recommended);
  
  // Make sure we have at least the 6 special items even if they're not marked as recommended
  const mustIncludeIds = [
    'brownie-walnut-cake',
    'chicken-leg-piece',
    'chicken-tikka-pizza',
    'death-by-chocolate-pastry',
    'smoke-chicken-sandwich',
    'tandoori-burger'
  ];
  
  const mustIncludeItems = allItems.filter(item => 
    mustIncludeIds.includes(item.id) && !recommendedItems.some(ri => ri.id === item.id)
  );
  
  return [...recommendedItems, ...mustIncludeItems];
};

export default menuData;

// Add these type definitions to ensure proper type safety
export type MenuItemPrice = {
  S: number;
  R: number;
  L: number;
};

export function getItemPrice(item: MenuItemType, size?: string): number {
  if (!item) return 0;
  
  // If item has size-specific pricing and a size is provided
  if (item.prices && size && size in item.prices) {
    const sizePrice = item.prices[size as keyof typeof item.prices];
    return typeof sizePrice === 'number' ? sizePrice : 0;
  }
  
  // Otherwise use the base price
  return typeof item.price === 'number' ? item.price : 0;
}

export type MenuCategoryType = {
  id: string;
  name: string;
  items: MenuItemType[];
  description?: string;
  image?: string;
};
