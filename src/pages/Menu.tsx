import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, X, Coffee, CupSoda, Dessert, Soup, Fish, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import MenuCategory from '@/components/MenuCategory';
import RecommendedItems from '@/components/RecommendedItems';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/context/CartContext';
import menuData, { getRecommendedItems, MenuItemType, MenuCategoryType } from '@/utils/menuData';
import FAQButton from '@/components/FAQButton'; 
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Menu: React.FC = () => {
  // References and state
  const { totalItems, items: cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState<MenuCategoryType[]>(menuData);
  const [menuItems, setMenuItems] = useState<MenuCategoryType[]>(menuData);
  const [recommendedItems, setRecommendedItems] = useState<MenuItemType[]>(getRecommendedItems());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [debugMode, setDebugMode] = useState(false);
  
  // Parallax effects based on scroll
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);
  
  // Category references for scrolling
  const categoryRefs = useRef<{[key: string]: HTMLDivElement}>({});
  
  // Make fetchMenuItems available for debug button
  const handleSyncInventory = async () => {
    try {
      console.log("Manual sync triggered");
      toast.success("Syncing with inventory...");
      
      // Fetch inventory data
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('product_name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Loaded ${data.length} items from inventory:`, data);
        
        // Map inventory items by NAME (not ID) since IDs don't match
        const inventoryMap = data.reduce((acc, item) => {
          // Use normalized product_name as the key
          const normalizedName = item.product_name.trim().toUpperCase();
          acc[normalizedName] = {
            id: String(item.id),
            name: item.product_name,
            price: item.price,
            description: item.description,
            category: item.category,
            unavailable: item.quantity <= 0,
            is_available: item.quantity > 0,
            image: item.image_url || "/placeholder-food.jpg"
          };
          return acc;
        }, {});
        
        console.log("Created inventory map by name:", inventoryMap);

        // Update menu data with inventory information using name matching
        const updatedMenu = menuData.map(category => ({
          ...category,
          items: category.items.map(item => {
            // Normalize menu item name for matching
            const menuItemName = item.name.trim().toUpperCase();
            
            // Look for a match by name
            const invItem = inventoryMap[menuItemName];
            
            if (invItem) {
              console.log(`Matched menu item "${item.name}" with inventory item "${invItem.name}"`);
              return {
                ...item,
                price: invItem.price || item.price,
                description: invItem.description || item.description,
                unavailable: invItem.unavailable,
                is_available: invItem.is_available,
                // Store the inventory ID for future reference
                inventory_id: invItem.id
              };
            }
            return item;
          })
        }));
        
        // Update recommended items with inventory information using name matching
        const updatedRecommended = getRecommendedItems().map(item => {
          const menuItemName = item.name.trim().toUpperCase();
          const invItem = inventoryMap[menuItemName];
          
          if (invItem) {
            console.log(`Matched recommended item "${item.name}" with inventory item "${invItem.name}"`);
            return {
              ...item,
              price: invItem.price || item.price,
              description: invItem.description || item.description,
              unavailable: invItem.unavailable,
              is_available: invItem.is_available,
              inventory_id: invItem.id
            };
          }
          return item;
        });
        
        // Inside the fetchMenuItems function, add this log so we can see the recommended items
        console.log("Recommended items:", updatedRecommended.map(item => item.name));

        // Add a slight delay to loading recommended items to ensure they're visible
        setTimeout(() => {
          setRecommendedItems(updatedRecommended);
          console.log("Setting recommended items:", updatedRecommended.length);
        }, 500);
        
        // Update state with the new data
        setMenuItems(updatedMenu);
        setFilteredMenu(updatedMenu);
      }
    } catch (error) {
      console.error("Error syncing inventory:", error);
      toast.error("Failed to sync with inventory");
    }
  };
  
  // Load menu items and availability data from Supabase
  useEffect(() => {
    // Initial fetch
    handleSyncInventory();

    // Set up real-time subscription to inventory changes
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'inventory',
      }, (payload) => {
        console.log('Inventory change detected:', payload);
        handleSyncInventory(); // Refresh data on change
      })
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up inventory subscription");
      supabase.removeChannel(inventoryChannel);
    };
  }, []); // Remove activeCategory dependency to prevent issues
  
  // Filter menu items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMenu(menuItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = menuItems
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          (item.item_name?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query)) || 
          (item.description?.toLowerCase().includes(query)) ||
          (item.category?.toLowerCase().includes(query))
        )
      }))
      .filter(category => category.items.length > 0);
    
    setFilteredMenu(filtered);
  }, [searchQuery, menuItems]);
  
  // Scroll to category function
  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      // Offset for header height
      const yOffset = -90; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      setActiveCategory(categoryId);
      setShowCategoryDropdown(false);
    }
  };
  
  // Category icon map
  const categoryIcon = {
    coffee: <Coffee size={16} />,
    tea: <CupSoda size={16} />,
    desserts: <Dessert size={16} />,
    sandwiches: <Fish size={16} />,
    default: <Coffee size={16} />
  };
  
  // Get icon for category
  const getIconForCategory = (categoryId: string) => {
    return categoryIcon[categoryId as keyof typeof categoryIcon] || categoryIcon.default;
  };

  return (
    <PageTransition className="min-h-screen pb-24 bg-[#F8F3E9]">
      {/* Animated background elements */}
      <motion.div 
        className="fixed inset-0 z-0 overflow-hidden"
        style={{ y: backgroundY }}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-60 coffee-pattern"
          style={{ opacity: 0.07 }} 
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-60 coffee-pattern -scale-y-100"
          style={{ opacity: 0.09 }} 
        />
        
        {/* Floating coffee beans - make more visible */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-cafe/10 rounded-full"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Gradient orbs - make more visible */}
        <div className="absolute -right-20 top-1/4 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="absolute -left-20 top-2/3 w-80 h-80 rounded-full bg-amber-700/10 blur-2xl" />
      </motion.div>
      
      {/* Header with animations - reduce blur, increase opacity */}
      <motion.header 
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-md border-b border-amber-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="container max-w-md mx-auto p-4"
          layout
        >
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <Link to="/">
                <Logo />
              </Link>
            </motion.div>
            
            <div className="flex items-center gap-2">
              {/* FAQ Button added to the top-right corner */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FAQButton variant="ghost" size="sm" className="text-cafe-dark hover:text-cafe hover:bg-amber-50" />
              </motion.div>
              
              {/* Cart icon with badge */}
              <div className="relative">
                <motion.div
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cafe text-xs font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: totalItems > 0 ? 1 : 0,
                    rotate: totalItems > 0 ? [0, -10, 10, -10, 0] : 0 
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 500, 
                    damping: 30,
                    rotate: { 
                      delay: 0.2,
                      duration: 0.5,
                      ease: 'easeInOut' 
                    }
                  }}
                >
                  {typeof totalItems === 'number' && !isNaN(totalItems) ? totalItems : '0'}
                </motion.div>
                
                <Link to="/cart">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-cafe-dark hover:text-cafe hover:bg-amber-50"
                  >
                    <ShoppingBag size={22} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="mt-4 relative"
            animate={{ width: isSearchFocused ? '100%' : '100%' }}
            transition={{ duration: 0.3 }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cafe-dark" />
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ 
                opacity: 1,
                scale: isSearchFocused ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <Input
                placeholder="Search for drinks, desserts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-10 pr-10 bg-white border-cafe/30 focus:border-cafe focus:ring-amber-200"
              />
            </motion.div>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>
          
          {/* Category navigation */}
          <motion.div 
            className="mt-4 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-full flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {menuItems.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`px-3 py-2 rounded-full whitespace-nowrap text-sm font-medium flex items-center gap-1.5 ${
                    activeCategory === category.id 
                      ? 'bg-cafe text-white'
                      : 'bg-white/80 border border-cafe/10 text-cafe-dark hover:bg-cafe/5'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {getIconForCategory(category.id)}
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.header>
      
      <main className="container max-w-md mx-auto p-4 relative z-1" ref={scrollRef}>
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecommendedItems items={recommendedItems} />
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          {filteredMenu.length > 0 ? (
            <div>
              {filteredMenu.map((category, index) => (
                <motion.div 
                  key={category.id}
                  ref={el => {
                    if (el) categoryRefs.current[category.id] = el;
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <MenuCategory 
                    category={category} 
                    isActive={activeCategory === category.id}
                    onCategoryEnter={() => setActiveCategory(category.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-white rounded-xl shadow-md mt-10 p-8 text-center border border-amber-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div 
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cafe/10"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, -5, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <Coffee size={24} className="text-cafe" />
              </motion.div>
              <h3 className="text-xl font-semibold text-cafe-dark">No items found</h3>
              <p className="mt-2 text-muted-foreground">
                Try a different search term or browse our categories
              </p>
              <motion.button
                className="mt-4 px-4 py-2 bg-cafe/10 text-cafe rounded-lg text-sm font-medium"
                onClick={() => setSearchQuery('')}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(146, 104, 69, 0.15)' }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Search
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Return to top button - more visible */}
        <motion.button
          className="fixed bottom-24 right-4 h-10 w-10 rounded-full bg-cafe text-white flex items-center justify-center shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: scrollY.get() > 300 ? 1 : 0,
            scale: scrollY.get() > 300 ? 1 : 0,
          }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronDown className="rotate-180" size={18} />
        </motion.button>
        
        {/* Debug controls - more visible */}
        {debugMode && (
          <div className="fixed bottom-24 left-4 z-50">
            <button
              className="bg-black/80 text-white text-xs py-2 px-3 rounded-lg shadow-md"
              onClick={handleSyncInventory}
            >
              Sync Inventory
            </button>
          </div>
        )}

        {/* Developer mode toggle */}
        <div 
          className="fixed bottom-2 left-2 h-4 w-4" 
          onClick={() => {
            setDebugMode(!debugMode);
            if (!debugMode) toast.success("Debug mode enabled");
          }}
        />
      </main>
      
      {/* Cart bar with animations - less blur, more visible */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-white/95 shadow-lg border-t border-cafe/20 p-4"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="container max-w-md mx-auto">
              <Link to="/cart">
                <Button className="w-full bg-cafe hover:bg-cafe-dark py-6 group overflow-hidden relative">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-amber-700/80 to-amber-900/80"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="relative z-10 flex w-full items-center justify-between"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="flex items-center">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut'
                        }}
                      >
                        <ShoppingBag size={18} className="mr-2" />
                      </motion.div>
                      View Cart <span className="ml-1 font-normal">({typeof totalItems === 'number' && !isNaN(totalItems) ? totalItems : 0} items)</span>
                    </span>
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut'
                      }}
                      className="font-bold"
                    >
                      ₹{cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                    </motion.span>
                  </motion.div>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Menu;