import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Define types
type MenuItemType = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  recommended: boolean;
  veg: boolean;
  sizes?: {
    S?: number;
    R?: number;
    L?: number;
  };
  unavailable: boolean;
};

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // New item form state
  const [newItem, setNewItem] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    recommended: boolean;
    veg: boolean;
    sizes: {
      S?: number;
      R?: number;
      L?: number;
    };
    unavailable: boolean;
  }>({
    name: '',
    description: '',
    price: 0,
    category: 'coffee',
    image_url: '',
    recommended: false,
    veg: true,
    sizes: {},
    unavailable: false
  });

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setMenuItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      toast.error(`Failed to load menu items: ${error.message}`);
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
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
    
    setFilteredItems(filtered);
  }, [searchQuery, menuItems]);

  // Add new item
  const addItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setProcessing(true);
      const { error } = await supabase
        .from('menu_items')
        .insert([newItem]);

      if (error) throw error;

      toast.success(`${newItem.name} added to menu`);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'coffee',
        image_url: '',
        recommended: false,
        veg: true,
        sizes: {},
        unavailable: false
      });
      
      setIsAddDialogOpen(false);
      fetchMenuItems();
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
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      recommended: item.recommended,
      veg: item.veg,
      sizes: item.sizes || {},
      unavailable: item.unavailable
    });
    setIsEditDialogOpen(true);
  };

  const updateItem = async () => {
    if (!selectedItem) return;
    
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('menu_items')
        .update(newItem)
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${newItem.name} updated successfully`);
      setIsEditDialogOpen(false);
      fetchMenuItems();
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
        .from('menu_items')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(`${selectedItem.name} deleted from menu`);
      setIsDeleteDialogOpen(false);
      fetchMenuItems();
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
        <h1 className="text-2xl font-bold text-cafe-dark">Menu Management</h1>
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
            <p className="text-muted-foreground">Loading menu items...</p>
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
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-between p-4 hover:bg-cafe/5"
                    >
                      <div className="flex items-center space-x-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-cafe/10 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-cafe/50" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-cafe-dark">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.recommended && (
                              <Badge variant="secondary" className="text-xs bg-cafe/10 text-cafe">
                                Recommended
                              </Badge>
                            )}
                            {item.veg && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Veg
                              </Badge>
                            )}
                            {item.unavailable && (
                              <Badge variant="destructive" className="text-xs">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cafe-dark">
                          ₹{item.price}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          className="text-cafe hover:bg-cafe/10"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(item)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No menu items found
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input 
                id="name" 
                value={newItem.name} 
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Enter item name"
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
              <Label htmlFor="category">Category *</Label>
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
              <Label htmlFor="price">Price (₹) *</Label>
              <Input 
                id="price" 
                type="number" 
                value={newItem.price} 
                onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                placeholder="Enter price"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url" 
                value={newItem.image_url} 
                onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                placeholder="Enter image URL (optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recommended"
                checked={newItem.recommended}
                onCheckedChange={(checked) => setNewItem({...newItem, recommended: checked})}
              />
              <Label htmlFor="recommended">Recommended Item</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="veg"
                checked={newItem.veg}
                onCheckedChange={(checked) => setNewItem({...newItem, veg: checked})}
              />
              <Label htmlFor="veg">Vegetarian</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="unavailable"
                checked={newItem.unavailable}
                onCheckedChange={(checked) => setNewItem({...newItem, unavailable: checked})}
              />
              <Label htmlFor="unavailable">Unavailable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input 
                id="edit-name" 
                value={newItem.name} 
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
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
              <Label htmlFor="edit-category">Category *</Label>
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
              <Label htmlFor="edit-price">Price (₹) *</Label>
              <Input 
                id="edit-price" 
                type="number" 
                value={newItem.price} 
                onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input 
                id="edit-image_url" 
                value={newItem.image_url} 
                onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-recommended"
                checked={newItem.recommended}
                onCheckedChange={(checked) => setNewItem({...newItem, recommended: checked})}
              />
              <Label htmlFor="edit-recommended">Recommended Item</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-veg"
                checked={newItem.veg}
                onCheckedChange={(checked) => setNewItem({...newItem, veg: checked})}
              />
              <Label htmlFor="edit-veg">Vegetarian</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-unavailable"
                checked={newItem.unavailable}
                onCheckedChange={(checked) => setNewItem({...newItem, unavailable: checked})}
              />
              <Label htmlFor="edit-unavailable">Unavailable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete {selectedItem?.name}? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteItem} 
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
