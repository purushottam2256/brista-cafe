import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Logo from '@/components/Logo';
import CartItem from '@/components/CartItem';
import PageTransition from '@/components/PageTransition';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const Cart = () => {
  const { items, totalItems, subtotal, total, clearCart } = useCart();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');

  // Load room number from localStorage if exists
  useEffect(() => {
    const savedRoomNumber = localStorage.getItem('roomNumber');
    if (savedRoomNumber) {
      setRoomNumber(savedRoomNumber);
    }
  }, []);

  // Save room number to localStorage when it changes
  useEffect(() => {
    if (roomNumber) {
      localStorage.setItem('roomNumber', roomNumber);
    }
  }, [roomNumber]);

  const handleClearClick = () => {
    setClearDialogOpen(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setClearDialogOpen(false);
  };

  const handleRoomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 4 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setRoomNumber(value);
  };

  const handleProceedToPayment = () => {
    if (!roomNumber && items.length > 0) {
      toast.warning("Please enter your room number for delivery");
      return false;
    }
    return true;
  };

  return (
    <PageTransition className="min-h-screen coffee-pattern pb-24">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container max-w-md mx-auto px-4 py-3 safe-area-padding">
          <div className="flex items-center justify-between">
            <Link 
              to="/menu" 
              className="flex items-center gap-1 text-cafe-text hover:text-cafe p-2 touch-manipulation"
              aria-label="Back to Menu"
            >
              <motion.div
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={20} />
              </motion.div>
              <span className="text-sm font-medium">Menu</span>
            </Link>
            
            <Logo withText={false} />
          </div>
          
          <div className="mt-2 flex items-center justify-center">
            <h1 className="text-xl font-semibold text-cafe-text">Your Cart</h1>
          </div>
        </div>
      </header>
      
      <main className="container max-w-md mx-auto p-4 safe-area-padding">
        {items.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-cafe-text/70">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</span>
              <Button
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 p-2 touch-manipulation"
                onClick={handleClearClick}
              >
                <Trash2 size={16} className="mr-1" />
                <span>Clear all</span>
              </Button>
            </div>
            
            <AnimatePresence>
              {items.map(item => (
                <motion.div 
                  key={item.id} 
                  className="mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  layout
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            <motion.div 
              className="cafe-card mt-6 p-5 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-4 font-semibold text-lg">Delivery Information</h3>
              
              <div className="mb-5">
                <Label htmlFor="roomNumber" className="text-sm text-cafe-text/70 mb-2 block">
                  Room Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="roomNumber"
                    placeholder="Enter your room number"
                    value={roomNumber}
                    onChange={handleRoomNumberChange}
                    className="pl-10 h-12 text-base rounded-xl"
                    required
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-cafe-text/60 mt-2">
                  Required for delivery in the hospital
                </p>
              </div>
              
              <h3 className="mb-3 font-semibold text-lg">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-cafe-text/70">Subtotal</span>
                  <span className="font-medium">₹{(typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0).toFixed(2)}</span>
                </div>
                
                <div className="pt-3 border-t border-cafe/10 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{(typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            className="cafe-card mt-10 p-8 text-center rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cafe/10">
              <ShoppingCart size={30} className="text-cafe" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
            <p className="mt-2 text-muted-foreground mb-6">
              Add items from the menu to get started
            </p>
            <Button asChild className="mt-2 bg-cafe hover:bg-cafe-dark py-6 px-8 text-base rounded-xl">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </motion.div>
        )}
      </main>
      
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg border-t border-cafe/10 p-4 safe-area-padding-bottom">
          <div className="container max-w-md mx-auto">
            <Button 
              className="w-full bg-cafe hover:bg-cafe-dark py-7 rounded-xl text-base"
              onClick={() => {
                if (handleProceedToPayment()) {
                  window.location.href = '/payment';
                }
              }}
            >
              <motion.div 
                className="flex w-full items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <span>Proceed to Payment</span>
                <span className="font-bold">₹{(typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(2)}</span>
              </motion.div>
            </Button>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[90%] mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Clear your cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearCart}
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
};

export default Cart;