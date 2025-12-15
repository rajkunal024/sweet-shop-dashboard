import { useState } from 'react';
import { Sweet, SweetFormData } from '@/types/sweet';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { SweetForm } from './SweetForm';
import { useUpdateSweet, useDeleteSweet, useRestockSweet } from '@/hooks/useSweets';
import { Edit, Trash2, Package, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminSweetTableProps {
  sweets: Sweet[];
}

export function AdminSweetTable({ sweets }: AdminSweetTableProps) {
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);

  const updateMutation = useUpdateSweet();
  const deleteMutation = useDeleteSweet();
  const restockMutation = useRestockSweet();

  const handleUpdate = (data: SweetFormData) => {
    if (editingSweet) {
      updateMutation.mutate(
        { ...data, id: editingSweet.id },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setEditingSweet(null);
          },
        }
      );
    }
  };

  const handleRestock = () => {
    if (restockSweet) {
      restockMutation.mutate(
        { sweetId: restockSweet.id, quantity: restockAmount },
        {
          onSuccess: () => {
            setRestockDialogOpen(false);
            setRestockSweet(null);
            setRestockAmount(10);
          },
        }
      );
    }
  };

  if (sweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/30">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No sweets in inventory yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sweets.map((sweet) => (
              <TableRow key={sweet.id}>
                <TableCell className="font-medium">{sweet.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {sweet.category}
                  </span>
                </TableCell>
                <TableCell>${Number(sweet.price).toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      sweet.quantity === 0
                        ? 'text-destructive'
                        : sweet.quantity < 10
                        ? 'text-amber-600'
                        : 'text-foreground'
                    }`}
                  >
                    {sweet.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRestockSweet(sweet);
                        setRestockDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSweet(sweet);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Sweet</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{sweet.name}"? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(sweet.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sweet</DialogTitle>
          </DialogHeader>
          {editingSweet && (
            <SweetForm
              sweet={editingSweet}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock {restockSweet?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRestockAmount(Math.max(1, restockAmount - 5))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRestockAmount(restockAmount + 5)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRestockDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleRestock}
                disabled={restockMutation.isPending}
              >
                Restock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

