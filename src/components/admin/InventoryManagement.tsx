import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, RotateCcw, Search, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Define types
type MenuItemType = {
  id: number;
  product_name: string;
  description?: string;
  quantity: number;
  price: number;
  category: string;
  created_at: string;
};

const InventoryManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Auth error:", error);
        toast.error("Authentication error. Please log in again.");
        return;
      }
      console.log("Auth state:", session);
    };
    checkAuth();
  }, []);

  // New item form state
  const [newItem, setNewItem] = useState<{
    product_name: string;
    description: string;
    quantity: number;
    price: number;
    category: string;
  }>({
    product_name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: 'coffee'
  });

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to fetch inventory items from Supabase...");
      
      // Check connection to Supabase
      try {
        await supabase.from('inventory').select('count(*)', { count: 'exact', head: true });
      } catch (connError) {
        console.error("Supabase connection error:", connError);
        toast.error("Could not connect to the database. Please check your internet connection.");
        setIsLoading(false);
        return;
      }
      
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('inventory')
        .select('*')
        .order('product_name');
        
      if (menuItemsError) {
        console.error("Error fetching inventory data:", menuItemsError);
        throw menuItemsError;
      }
      
      console.log("Successfully fetched inventory items:", menuItemsData ? menuItemsData.length : 0, "items");
      console.log("First few items:", menuItemsData?.slice(0, 3));
      
      setMenuItems(menuItemsData || []);
      setFilteredItems(menuItemsData || []);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      
      // Provide more detailed error messages
      if (error.code === 'PGRST116' || error.message?.includes('Failed to fetch')) {
        toast.error("Network error: Unable to reach the database server. Please check your connection.");
      } else if (error.code === '42P01') {
        toast.error("Database error: The inventory table doesn't exist.");
      } else {
        toast.error(`Failed to load menu items: ${error.message || 'Unknown error'}`);
      }
      
      // Set empty arrays to prevent undefined errors
      setMenuItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(menuItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = menuItems.filter(item => 
      item.product_name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
    
    setFilteredItems(filtered);
  }, [searchQuery, menuItems]);

  // Toggle item availability
  const toggleItemAvailability = async (itemId: number) => {
    try {
      setProcessing(true);
      const item = menuItems.find(i => i.id === itemId);
      if (!item) return;
      
      // If quantity is > 0, set it to 0 (unavailable)
      // If quantity is <= 0, set it to 10 (available)
      const newQuantity = item.quantity > 0 ? 0 : 10;
      
      console.log(`Updating item ${item.product_name} (${itemId}) availability to ${newQuantity > 0 ? 'available' : 'unavailable'}`);
      
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .select();
        
      if (error) throw error;
      
      console.log("Update response:", data);
      
      // Update local state
      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      setFilteredItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      // Add feedback that this will update the menu
      toast.success(`Item ${newQuantity > 0 ? 'available' : 'unavailable'} now. Menu will update automatically.`);
    } catch (error: any) {
      console.error("Error updating item availability:", error);
      toast.error(`Failed to update item availability: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Reset all items to available
  const resetAllItems = async () => {
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: 10 })
        .in('id', menuItems.map(item => item.id));
      
      if (error) throw error;
      
      // Update local state
      setMenuItems(prev => prev.map(item => ({ ...item, quantity: 10 })));
      setFilteredItems(prev => prev.map(item => ({ ...item, quantity: 10 })));
      
      // Add feedback that this will update the menu
      toast.success('All items are now available. Menu will update automatically.');
    } catch (error: any) {
      console.error("Error resetting item availability:", error);
      toast.error(`Failed to reset item availability: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Add new item
  const addItem = async () => {
    // Validate form
    if (!newItem.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (newItem.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setProcessing(true);
      
      // Check authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Current session:", session);
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Authentication error");
      }
      
      // Log attempt to add item
      console.log("Attempting to add new item:", newItem);
      
      // Proceed with item insertion
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          product_name: newItem.product_name,
          description: newItem.description,
          quantity: newItem.quantity,
          price: newItem.price,
          category: newItem.category,
          is_available: newItem.quantity > 0
        }])
        .select();

      if (error) {
        console.error("Supabase error adding item:", error);
        throw error;
      }

      console.log("Successfully added item, response:", data);
      toast.success(`${newItem.product_name} added to inventory. Menu will update automatically.`);
      
      // Reset form
      setNewItem({
        product_name: '',
        description: '',
        quantity: 0,
        price: 0,
        category: 'coffee'
      });
      
      setIsAddDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast.error(`Failed to add item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Edit item
  const openEditDialog = (item: MenuItemType) => {
    setSelectedItem(item);
    
    setNewItem({
      product_name: item.product_name,
      description: item.description || '',
      quantity: item.quantity,
      price: item.price,
      category: item.category
    });
    
    setIsEditDialogOpen(true);
  };

  const updateItem = async () => {
    if (!selectedItem) return;
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('inventory')
        .update({
          product_name: newItem.product_name,
          quantity: newItem.quantity,
          price: newItem.price,
          category: newItem.category,
          is_available: newItem.quantity > 0
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${newItem.product_name} updated successfully. Menu will update automatically.`);
      setIsEditDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error(`Failed to update item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Delete item
  const openDeleteDialog = (item: MenuItemType) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const deleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${selectedItem.product_name} deleted from inventory`);
      setIsDeleteDialogOpen(false);
      fetchMenuItems(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error(`Failed to delete item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-cafe-dark">Inventory Management</h1>
        <Badge className="ml-2">Total: {menuItems.length} items</Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={resetAllItems}
          className="text-cafe hover:bg-cafe/10"
          title="Reset all items to available"
          disabled={processing || isLoading}
        >
          <RotateCcw size={16} />
        </Button>
        
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-cafe hover:bg-cafe-dark whitespace-nowrap"
          disabled={processing}
        >
          <PlusCircle size={16} className="mr-2" />
          Add Item
        </Button>
      </div>
      
      {isLoading ? (
        <div className="cafe-card p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-cafe" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredItems.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-cafe/10 bg-white shadow-sm">
                <div className="border-b border-cafe/10 bg-cafe/5 px-4 py-3">
                  <h2 className="text-lg font-semibold text-cafe-dark">Menu Items</h2>
                </div>
                
                <div className="divide-y divide-cafe/10">
                  {filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between px-4 py-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-medium text-cafe-text">{item.product_name}</h3>
                          {item.description && (
                            <span className="text-xs text-cafe-text/60">
                              {item.description}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-cafe-text/60">
                          <span className="capitalize">{item.category}</span> - 
                          ₹{item.price}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`mr-2 text-sm ${item.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.quantity > 0 ? 'Available' : 'Unavailable'}
                        </span>
                        <Switch
                          checked={item.quantity > 0}
                          onCheckedChange={() => toggleItemAvailability(item.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                          disabled={processing}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          className="h-8 w-8 text-slate-600"
                          disabled={processing}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(item)}
                          className="h-8 w-8 text-red-600"
                          disabled={processing}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cafe-card flex flex-col items-center justify-center p-8 text-center">
                <Ban size={48} className="mb-4 text-cafe-text/30" />
                <h3 className="text-xl font-semibold">No items found</h3>
                <p className="mt-2 text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Add items to your menu"}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add item dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input 
                id="product_name" 
                value={newItem.product_name} 
                onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={newItem.description} 
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Enter item description (optional)"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => setNewItem({...newItem, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="tea">Tea</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                value={newItem.price} 
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                placeholder="Enter price"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                value={newItem.quantity} 
                onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={addItem} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit item dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-product_name">Product Name</Label>
              <Input 
                id="edit-product_name" 
                value={newItem.product_name} 
                onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                value={newItem.description} 
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => setNewItem({...newItem, category: value})}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="tea">Tea</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input 
                id="edit-price" 
                type="number" 
                value={newItem.price} 
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input 
                id="edit-quantity" 
                type="number" 
                value={newItem.quantity} 
                onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={updateItem} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{selectedItem?.product_name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteItem} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;