import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const Cart = () => {
  const { items, totalItems, subtotal, total, clearCart } = useCart(); // Removed tax from destructuring
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearClick = () => {
    setClearDialogOpen(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setClearDialogOpen(false);
  };

  return (
    <PageTransition className="min-h-screen coffee-pattern pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <Link to="/menu" className="flex items-center gap-1 text-cafe-text hover:text-cafe">
              <ChevronLeft size={18} />
              <span>Back to Menu</span>
            </Link>
            
            <Logo withText={false} />
            
            {/* Empty div for alignment */}
            <div className="w-8"></div>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-2">
            <ShoppingCart size={18} className="text-cafe" />
            <h1 className="text-xl font-semibold text-cafe-text">Your Cart</h1>
          </div>
        </div>
      </header>
      
      <main className="container max-w-md mx-auto p-4">
        {items.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-cafe-text/70">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</span>
              <Button
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleClearClick} // Changed to use dialog
              >
                <Trash2 size={14} className="mr-1" />
                Clear all
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
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="cafe-card mt-6 p-4">
              <h3 className="mb-3 font-semibold">Order Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cafe-text/70">Subtotal</span>
                  <span>₹{(typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0).toFixed(2)}</span>
                </div>
                
                {/* Removed tax section */}
                
                <div className="pt-2 border-t border-cafe/10 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{(typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="cafe-card mt-10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cafe/10">
              <ShoppingCart size={24} className="text-cafe" />
            </div>
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-muted-foreground">
              Add items from the menu to get started
            </p>
            <Button asChild className="mt-6 bg-cafe hover:bg-cafe-dark">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        )}
      </main>
      
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg border-t border-cafe/10 p-4">
          <div className="container max-w-md mx-auto">
            <Link to="/payment">
              <Button className="w-full bg-cafe hover:bg-cafe-dark py-6">
                <div className="flex w-full items-center justify-between">
                  <span>Proceed to Payment</span>
                  <span>₹{(typeof total === 'number' && !isNaN(total) ? total : 0).toFixed(2)}</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all items from your cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearCart}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 size={14} className="mr-2" />
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
};

export default Cart;