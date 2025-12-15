import { Inventory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryTableProps {
  items: Inventory[];
  onEdit: (item: Inventory) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const InventoryTable = ({ items, onEdit, onDelete, isLoading }: InventoryTableProps) => {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Package className="h-8 w-8 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Belum Ada Inventaris</h3>
            <p className="text-muted-foreground">
              Mulai tambahkan item inventaris laboratorium Anda
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Nama Item</TableHead>
              <TableHead className="font-semibold">Kategori</TableHead>
              <TableHead className="text-center font-semibold">Qty</TableHead>
              <TableHead className="hidden font-semibold md:table-cell">Deskripsi</TableHead>
              <TableHead className="hidden font-semibold sm:table-cell">Tanggal</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-primary/10 px-2 text-sm font-semibold text-primary">
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
                  {item.description || '-'}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(item.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
