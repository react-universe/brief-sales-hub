import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Prospect {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: 'new' | 'in_talks' | 'closed';
  value?: number;
  notes?: string;
  created_at: string;
}

interface EditProspectDialogProps {
  prospect: Prospect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProspectUpdated: () => void;
  onProspectDeleted: (id: string) => void;
}

export function EditProspectDialog({ 
  prospect, 
  open, 
  onOpenChange, 
  onProspectUpdated, 
  onProspectDeleted 
}: EditProspectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    const updateData = {
      full_name: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      company: formData.get('company') as string || null,
      stage: formData.get('stage') as string,
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : null,
      notes: formData.get('notes') as string || null,
    };

    try {
      const { error } = await supabase
        .from('prospects')
        .update(updateData)
        .eq('id', prospect.id);

      if (error) throw error;

      toast({
        title: "Prospect updated",
        description: "Prospect information has been updated successfully",
      });

      onProspectUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating prospect:', error);
      toast({
        title: "Error",
        description: "Failed to update prospect",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onProspectDeleted(prospect.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting prospect:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prospect</DialogTitle>
          <DialogDescription>
            Update prospect information and manage their details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={prospect.full_name}
                placeholder="Enter full name"
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={prospect.email}
                placeholder="Enter email address"
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={prospect.phone || ''}
                placeholder="Enter phone number"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={prospect.company || ''}
                placeholder="Enter company name"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select name="stage" defaultValue={prospect.stage}>
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_talks">In Talks</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Deal Value ($)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                defaultValue={prospect.value || ''}
                placeholder="0.00"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={prospect.notes || ''}
              placeholder="Add any additional notes about this prospect..."
              className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  disabled={isLoading || isDeleting}
                  className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Prospect</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {prospect.full_name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary flex-1 sm:flex-none"
              >
                {isLoading ? "Updating..." : "Update Prospect"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}