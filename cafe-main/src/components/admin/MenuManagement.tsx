import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Types
type MenuItem = {
  id: number;
  item_name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
};

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // New/Edit menu item form state
  const [itemForm, setItemForm] = useState({
    item_name: '',
    description: '',
    price: 0,
    category: 'coffee',
    image_url: '',
    is_available: true
  });

  // Categories for the menu items
  const categories = [
    { value: 'coffee', label: 'Coffee' },
    { value: 'tea', label: 'Tea' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'desserts', label: 'Desserts' },
    { value: 'specials', label: 'Specials' }
  ];

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('item_name');
      
      if (error) throw error;
      
      setMenuItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      toast.error(`Failed to load menu items: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);
  
  // Filter menu items based on search and category
  useEffect(() => {
    let filtered = [...menuItems];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems]);

  // Handle opening the add dialog
  const handleAddItem = () => {
    setItemForm({
      item_name: '',
      description: '',
      price: 0,
      category: 'coffee',
      image_url: '',
      is_available: true
    });
    setIsAddDialogOpen(true);
  };

  // Handle opening the edit dialog
  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemForm({
      item_name: item.item_name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle opening the delete dialog
  const handleDeleteItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemForm({ ...itemForm, [name]: value });
  };

  // Handle saving a new menu item
  const saveNewItem = async () => {
    if (!itemForm.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (itemForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from('menu')
        .insert([{
          item_name: itemForm.item_name,
          description: itemForm.description,
          price: itemForm.price,
          category: itemForm.category,
          image_url: itemForm.image_url,
          is_available: itemForm.is_available
        }])
        .select();
      
      if (error) throw error;
      
      toast.success(`${itemForm.item_name} added to menu`);
      setIsAddDialogOpen(false);
      fetchMenuItems();
    } catch (error: any) {
      console.error("Error adding menu item:", error);
      toast.error(`Failed to add menu item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle updating an existing menu item
  const updateItem = async () => {
    if (!selectedItem) return;
    
    if (!itemForm.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (itemForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('menu')
        .update({
          item_name: itemForm.item_name,
          description: itemForm.description,
          price: itemForm.price,
          category: itemForm.category,
          image_url: itemForm.image_url,
          is_available: itemForm.is_available
        })
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      toast.success(`${itemForm.item_name} updated`);
      setIsEditDialogOpen(false);
      fetchMenuItems();
    } catch (error: any) {
      console.error("Error updating menu item:", error);
      toast.error(`Failed to update menu item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle deleting a menu item
  const deleteItem = async () => {
    if (!selectedItem) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      toast.success(`${selectedItem.item_name} deleted`);
      setIsDeleteDialogOpen(false);
      fetchMenuItems();
    } catch (error: any) {
      console.error("Error deleting menu item:", error);
      toast.error(`Failed to delete menu item: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="cafe-card p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-cafe-text/50" />
            <Input 
              placeholder="Search items..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => fetchMenuItems()}
              disabled={isLoading}
              className="px-3"
            >
              <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </Button>
            
            <Button className="bg-cafe hover:bg-cafe-dark" onClick={handleAddItem}>
              <PlusCircle size={16} className="mr-2" />
              New Item
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-cafe border-opacity-50 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-cafe-dark mb-2">No menu items found</h3>
            <p className="text-cafe-text/70 mb-4">
              {searchQuery.trim() || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Add your first menu item to get started'}
            </p>
            {(searchQuery.trim() || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border rounded-md hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold text-cafe-dark">{item.item_name}</h3>
                  <span className="font-semibold">₹{item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-cafe-text/70 mt-1 line-clamp-2">{item.description}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-cafe/10">
                      {categories.find(c => c.value === item.category)?.label || item.category}
                    </Badge>
                    {!item.is_available && (
                      <Badge variant="destructive">Unavailable</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditItem(item)} 
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item)} 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item_name" className="text-right">Item Name</Label>
              <Input 
                id="item_name" 
                name="item_name"
                value={itemForm.item_name} 
                onChange={handleInputChange} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input 
                id="price" 
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={itemForm.price} 
                onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">Image URL</Label>
              <Input 
                id="image_url" 
                name="image_url"
                value={itemForm.image_url} 
                onChange={handleInputChange} 
                className="col-span-3" 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                value={itemForm.description} 
                onChange={handleInputChange} 
                className="col-span-3" 
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)} 
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveNewItem} 
              disabled={processing}
              className="bg-cafe hover:bg-cafe-dark"
            >
              {processing ? 'Saving...' : 'Save Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-item_name" className="text-right">Item Name</Label>
              <Input 
                id="edit-item_name" 
                name="item_name"
                value={itemForm.item_name} 
                onChange={handleInputChange} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Price</Label>
              <Input 
                id="edit-price" 
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={itemForm.price} 
                onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-is_available" className="text-right">Available</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <input
                  type="checkbox"
                  id="edit-is_available"
                  checked={itemForm.is_available}
                  onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-cafe focus:ring-cafe"
                />
                <Label htmlFor="edit-is_available" className="text-sm font-normal">
                  Item is available for order
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image_url" className="text-right">Image URL</Label>
              <Input 
                id="edit-image_url" 
                name="image_url"
                value={itemForm.image_url} 
                onChange={handleInputChange} 
                className="col-span-3" 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">Description</Label>
              <Textarea 
                id="edit-description" 
                name="description"
                value={itemForm.description} 
                onChange={handleInputChange} 
                className="col-span-3" 
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateItem} 
              disabled={processing}
              className="bg-cafe hover:bg-cafe-dark"
            >
              {processing ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
          </DialogHeader>
          
          <p className="py-4">
            Are you sure you want to delete <span className="font-semibold">{selectedItem?.item_name}</span>? 
            This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteItem} 
              disabled={processing}
            >
              {processing ? 'Deleting...' : 'Delete Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
