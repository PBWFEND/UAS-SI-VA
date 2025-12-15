import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Inventory, inventoryApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { DeleteConfirmDialog } from '@/components/inventory/DeleteConfirmDialog';
import { StatsCard } from '@/components/stats/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Package, Layers, AlertCircle, Plus, Search, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Inventory | null>(null);
  
  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getAll();
      setInventory(data);
    } catch (error: any) {
      toast({
        title: 'Gagal Memuat Data',
        description: error.message || 'Tidak dapat memuat data inventaris',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const query = searchQuery.toLowerCase();
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [inventory, searchQuery]);

  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const categories = new Set(inventory.map((item) => item.category)).size;
    const lowStock = inventory.filter((item) => item.quantity <= 5).length;
    
    return { totalItems, totalQuantity, categories, lowStock };
  }, [inventory]);

  const handleAddItem = () => {
    setEditItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: Inventory) => {
    setEditItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setDeleteItemId(id);
      setDeleteItemName(item.name);
      setIsDeleteOpen(true);
    }
  };

  const handleFormSubmit = async (data: { name: string; category: string; quantity: number; description?: string }) => {
    try {
      if (editItem) {
        await inventoryApi.update(editItem.id, data);
        toast({
          title: 'Berhasil Diperbarui',
          description: `${data.name} telah diperbarui`,
        });
      } else {
        await inventoryApi.create(data);
        toast({
          title: 'Berhasil Ditambahkan',
          description: `${data.name} telah ditambahkan ke inventaris`,
        });
      }
      fetchInventory();
    } catch (error: any) {
      toast({
        title: editItem ? 'Gagal Memperbarui' : 'Gagal Menambahkan',
        description: error.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;
    
    setIsDeleting(true);
    try {
      await inventoryApi.delete(deleteItemId);
      toast({
        title: 'Berhasil Dihapus',
        description: `${deleteItemName} telah dihapus dari inventaris`,
      });
      fetchInventory();
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error.message || 'Terjadi kesalahan saat menghapus',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-slide-up">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Inventaris</h1>
            <p className="text-muted-foreground">Kelola inventaris laboratorium Anda</p>
          </div>
          <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Button variant="outline" size="icon" onClick={fetchInventory} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <StatsCard
              title="Total Item"
              value={stats.totalItems}
              icon={Package}
              description="Jenis item terdaftar"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Total Kuantitas"
              value={stats.totalQuantity}
              icon={Layers}
              description="Unit tersedia"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
            <StatsCard
              title="Kategori"
              value={stats.categories}
              icon={Package}
              description="Kategori berbeda"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Stok Rendah"
              value={stats.lowStock}
              icon={AlertCircle}
              description="Item ≤ 5 unit"
            />
          </div>
        </div>

        {/* Search & Table */}
        <div className="space-y-4">
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '350ms' }}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari item, kategori, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <InventoryTable
              items={filteredInventory}
              onEdit={handleEditItem}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <InventoryForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editItem={editItem}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteItemName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
