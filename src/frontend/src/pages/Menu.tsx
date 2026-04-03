import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Leaf, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { MenuCategory, MenuItem } from "../backend.d";
import {
  useCreateCategory,
  useCreateMenuItem,
  useDeleteCategory,
  useDeleteMenuItem,
  useGetAllCategories,
  useGetAllMenuItems,
  useUpdateCategory,
  useUpdateMenuItem,
} from "../hooks/useQueries";

interface CategoryFormData {
  name: string;
  description: string;
  sortOrder: string;
}

interface MenuItemFormData {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageFile: File | null;
}

export default function Menu() {
  const { data: categories = [], isLoading: catsLoading } =
    useGetAllCategories();
  const { data: menuItems = [], isLoading: itemsLoading } =
    useGetAllMenuItems();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>({
    name: "",
    description: "",
    sortOrder: "1",
  });

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<MenuItemFormData>({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    isVeg: true,
    isAvailable: true,
    imageFile: null,
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  const openCreateCat = () => {
    setEditingCat(null);
    setCatForm({
      name: "",
      description: "",
      sortOrder: String(categories.length + 1),
    });
    setCatFormOpen(true);
  };

  const openEditCat = (cat: MenuCategory) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder.toString(),
    });
    setCatFormOpen(true);
  };

  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editingCat) {
        await updateCategory.mutateAsync({
          id: editingCat.id,
          name: catForm.name.trim(),
          description: catForm.description.trim(),
          sortOrder: BigInt(Number(catForm.sortOrder) || 1),
        });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({
          name: catForm.name.trim(),
          description: catForm.description.trim(),
          sortOrder: BigInt(Number(catForm.sortOrder) || 1),
        });
        toast.success("Category created");
      }
      setCatFormOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const openCreateItem = (catId?: string) => {
    setEditingItem(null);
    setItemForm({
      categoryId: catId || categories[0]?.id.toString() || "",
      name: "",
      description: "",
      price: "",
      isVeg: true,
      isAvailable: true,
      imageFile: null,
    });
    setUploadProgress(0);
    setItemFormOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId.toString(),
      name: item.name,
      description: item.description,
      price: (Number(item.price) / 100).toFixed(2),
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      imageFile: null,
    });
    setUploadProgress(0);
    setItemFormOpen(true);
  };

  const handleItemSubmit = async () => {
    if (!itemForm.name.trim() || !itemForm.price || !itemForm.categoryId) {
      toast.error("Name, price and category are required");
      return;
    }
    const priceCents = BigInt(
      Math.round(Number.parseFloat(itemForm.price) * 100),
    );
    let imageBlob: ExternalBlob | null = null;
    if (itemForm.imageFile) {
      const arrayBuf = await itemForm.imageFile.arrayBuffer();
      imageBlob = ExternalBlob.fromBytes(
        new Uint8Array(arrayBuf),
      ).withUploadProgress((p) => setUploadProgress(p));
    }
    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({
          id: editingItem.id,
          categoryId: BigInt(itemForm.categoryId),
          name: itemForm.name.trim(),
          description: itemForm.description.trim(),
          price: priceCents,
          image: imageBlob,
          isAvailable: itemForm.isAvailable,
          isVeg: itemForm.isVeg,
        });
        toast.success("Menu item updated");
      } else {
        await createMenuItem.mutateAsync({
          categoryId: BigInt(itemForm.categoryId),
          name: itemForm.name.trim(),
          description: itemForm.description.trim(),
          price: priceCents,
          image: imageBlob,
          isAvailable: itemForm.isAvailable,
          isVeg: itemForm.isVeg,
        });
        toast.success("Menu item created");
      }
      setItemFormOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
  );
  const allTabId = "all";

  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {menuItems.length} items across {categories.length} categories
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={openCreateCat}
            data-ocid="menu.add_category.button"
          >
            <Plus size={15} className="mr-1.5" /> Add Category
          </Button>
          <Button
            onClick={() => openCreateItem()}
            data-ocid="menu.add_item.button"
          >
            <Plus size={15} className="mr-1.5" /> Add Item
          </Button>
        </div>
      </div>

      {catsLoading || itemsLoading ? (
        <div className="space-y-4" data-ocid="menu.loading_state">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-4">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <Skeleton key={k} className="h-40" />
            ))}
          </div>
        </div>
      ) : (
        <Tabs defaultValue={sortedCategories[0]?.id.toString() || allTabId}>
          <div className="flex items-center justify-between mb-4">
            <TabsList
              className="h-10 bg-secondary"
              data-ocid="menu.categories.tab"
            >
              {sortedCategories.map((cat) => (
                <TabsTrigger
                  key={cat.id.toString()}
                  value={cat.id.toString()}
                  className="text-sm"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {sortedCategories.map((cat) => {
            const catItems = menuItems.filter((i) => i.categoryId === cat.id);
            return (
              <TabsContent key={cat.id.toString()} value={cat.id.toString()}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{cat.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      {cat.description}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditCat(cat)}
                      data-ocid="menu.category.edit_button"
                    >
                      <Edit2 size={13} className="mr-1" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30"
                          data-ocid="menu.category.delete_button"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="menu.category.delete.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{cat.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            All items in this category will also be removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="menu.category.delete.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteCategory
                                .mutateAsync(cat.id)
                                .then(() => toast.success("Category deleted"))
                            }
                            className="bg-destructive text-destructive-foreground"
                            data-ocid="menu.category.delete.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      onClick={() => openCreateItem(cat.id.toString())}
                      data-ocid="menu.category.add_item.button"
                    >
                      <Plus size={13} className="mr-1" /> Add Item
                    </Button>
                  </div>
                </div>

                {catItems.length === 0 ? (
                  <div
                    className="text-center py-12 border-2 border-dashed border-border rounded-xl"
                    data-ocid="menu.items.empty_state"
                  >
                    <p className="text-muted-foreground">
                      No items in this category yet.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => openCreateItem(cat.id.toString())}
                    >
                      <Plus size={13} className="mr-1" /> Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {catItems.map((item, idx) => (
                        <motion.div
                          key={item.id.toString()}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <Card
                            data-ocid={`menu.items.item.${idx + 1}`}
                            className="shadow-card border-border hover:shadow-card-hover transition-shadow"
                          >
                            {item.image && (
                              <div className="h-32 overflow-hidden rounded-t-lg">
                                <img
                                  src={item.image.getDirectURL()}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {!item.image && (
                              <div className="h-24 rounded-t-lg bg-gold-light flex items-center justify-center">
                                <span className="text-3xl">
                                  {item.isVeg ? "🥗" : "🍗"}
                                </span>
                              </div>
                            )}
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-semibold text-[14px] leading-tight">
                                  {item.name}
                                </p>
                                <Badge
                                  className={`text-[10px] shrink-0 ${
                                    item.isVeg
                                      ? "bg-success-light text-success border-0"
                                      : "bg-destructive/10 text-destructive border-0"
                                  }`}
                                >
                                  {item.isVeg ? (
                                    <>
                                      <Leaf size={9} className="mr-0.5" />
                                      Veg
                                    </>
                                  ) : (
                                    "Non-Veg"
                                  )}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-[11px] line-clamp-2 mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-[15px] text-foreground">
                                  ₹{(Number(item.price) / 100).toFixed(0)}
                                </p>
                                <Switch
                                  checked={item.isAvailable}
                                  onCheckedChange={() =>
                                    updateMenuItem.mutateAsync({
                                      ...item,
                                      id: item.id,
                                      image: null,
                                      isAvailable: !item.isAvailable,
                                    })
                                  }
                                  data-ocid={`menu.items.availability.switch.${idx + 1}`}
                                />
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-7 text-xs"
                                  onClick={() => openEditItem(item)}
                                  data-ocid={`menu.items.edit_button.${idx + 1}`}
                                >
                                  <Edit2 size={11} className="mr-1" /> Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs text-destructive border-destructive/30"
                                      data-ocid={`menu.items.delete_button.${idx + 1}`}
                                    >
                                      <Trash2 size={11} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent data-ocid="menu.items.delete.dialog">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete "{item.name}"?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove this menu
                                        item.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel data-ocid="menu.items.delete.cancel_button">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteMenuItem
                                            .mutateAsync(item.id)
                                            .then(() =>
                                              toast.success("Item deleted"),
                                            )
                                        }
                                        className="bg-destructive text-destructive-foreground"
                                        data-ocid="menu.items.delete.confirm_button"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Category Form */}
      <Dialog open={catFormOpen} onOpenChange={setCatFormOpen}>
        <DialogContent data-ocid="menu.category.form.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Starters"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="menu.category.form.name.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Short description"
                value={catForm.description}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, description: e.target.value }))
                }
                data-ocid="menu.category.form.description.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                min="1"
                value={catForm.sortOrder}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, sortOrder: e.target.value }))
                }
                data-ocid="menu.category.form.sortorder.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCatFormOpen(false)}
              data-ocid="menu.category.form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCatSubmit}
              disabled={createCategory.isPending || updateCategory.isPending}
              data-ocid="menu.category.form.submit_button"
            >
              {editingCat ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Form */}
      <Dialog open={itemFormOpen} onOpenChange={setItemFormOpen}>
        <DialogContent className="max-w-lg" data-ocid="menu.item.form.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={itemForm.categoryId}
                onValueChange={(v) =>
                  setItemForm((p) => ({ ...p, categoryId: v }))
                }
              >
                <SelectTrigger data-ocid="menu.item.form.category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Butter Chicken"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="menu.item.form.name.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                data-ocid="menu.item.form.description.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 320.00"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, price: e.target.value }))
                }
                data-ocid="menu.item.form.price.input"
              />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.isVeg}
                  onCheckedChange={(v) =>
                    setItemForm((p) => ({ ...p, isVeg: v }))
                  }
                  data-ocid="menu.item.form.isveg.switch"
                />
                <Label>Vegetarian</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.isAvailable}
                  onCheckedChange={(v) =>
                    setItemForm((p) => ({ ...p, isAvailable: v }))
                  }
                  data-ocid="menu.item.form.available.switch"
                />
                <Label>Available</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    imageFile: e.target.files?.[0] || null,
                  }))
                }
                data-ocid="menu.item.form.image.upload_button"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemFormOpen(false)}
              data-ocid="menu.item.form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleItemSubmit}
              disabled={createMenuItem.isPending || updateMenuItem.isPending}
              data-ocid="menu.item.form.submit_button"
            >
              {(createMenuItem.isPending || updateMenuItem.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
