import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Building2, Phone, Mail, Plus, DollarSign, Users, Target, TrendingUp, LogOut } from 'lucide-react';
import { AddProspectDialog } from './AddProspectDialog';
import { EditProspectDialog } from './EditProspectDialog';
import { MetricsDialog } from './MetricsDialog';

interface Prospect {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: 'new' | 'in_talks' | 'closed';
  value?: number;
  notes?: string;
  created_at: string;
}

const stageConfig = {
  new: {
    title: 'New Prospects',
    bgColor: 'bg-status-new-light',
    textColor: 'text-status-new',
    badgeColor: 'bg-status-new',
    icon: Users,
  },
  in_talks: {
    title: 'In Talks',
    bgColor: 'bg-status-in-talks-light',
    textColor: 'text-status-in-talks',
    badgeColor: 'bg-status-in-talks',
    icon: Target,
  },
  closed: {
    title: 'Closed Deals',
    bgColor: 'bg-status-closed-light',
    textColor: 'text-status-closed',
    badgeColor: 'bg-status-closed',
    icon: TrendingUp,
  },
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects((data || []) as Prospect[]);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Error",
        description: "Failed to load prospects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStage = destination.droppableId as 'new' | 'in_talks' | 'closed';
    
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ 
          stage: newStage,
          // user_id: user?.id // Include user_id for RLS policy
        })
        .eq('id', draggableId);

      if (error) throw error;

      setProspects(prev => 
        prev.map(prospect => 
          prospect.id === draggableId 
            ? { ...prospect, stage: newStage }
            : prospect
        )
      );

      toast({
        title: "Prospect moved",
        description: `Moved to ${stageConfig[newStage].title}`,
      });
    } catch (error) {
      console.error('Error updating prospect stage:', error);
      toast({
        title: "Error",
        description: "Failed to update prospect stage",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProspect = async (prospectId: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId);

      if (error) throw error;

      setProspects(prev => prev.filter(p => p.id !== prospectId));
      toast({
        title: "Prospect deleted",
        description: "Prospect has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast({
        title: "Error",
        description: "Failed to delete prospect",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 sm:py-0 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Micro CRM</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Welcome back, {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowMetrics(true)}
                className="border-primary/20 hover:bg-primary/5 flex-1 sm:flex-none"
                size="sm"
              >
                <TrendingUp className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Metrics</span>
              </Button>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary flex-1 sm:flex-none"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Prospect</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {Object.entries(stageConfig).map(([stage, config]) => {
              const stageProspects = prospects.filter(p => p.stage === stage);
              const Icon = config.icon;
              
              return (
                <div key={stage} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`w-5 h-5 ${config.textColor}`} />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{config.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {stageProspects.length} prospects
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${config.badgeColor} text-white border-0`}
                    >
                      {stageProspects.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[300px] md:min-h-[400px] p-3 md:p-4 rounded-xl border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/30 bg-transparent'
                        }`}
                      >
                        <div className="space-y-3">
                          {stageProspects.map((prospect, index) => (
                            <Draggable 
                              key={prospect.id} 
                              draggableId={prospect.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-move transition-all duration-200 hover:shadow-card ${
                                    snapshot.isDragging 
                                      ? 'shadow-elevated rotate-3 bg-card' 
                                      : 'hover:shadow-pipeline'
                                  }`}
                                  onClick={() => setEditingProspect(prospect)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {getInitials(prospect.full_name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <CardTitle className="text-base leading-none">
                                            {prospect.full_name}
                                          </CardTitle>
                                          {prospect.company && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {prospect.company}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {prospect.value && (
                                        <Badge variant="secondary" className="text-xs">
                                          {formatCurrency(prospect.value)}
                                        </Badge>
                                      )}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{prospect.email}</span>
                                      </div>
                                      {prospect.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Phone className="w-3 h-3" />
                                          <span>{prospect.phone}</span>
                                        </div>
                                      )}
                                      {prospect.notes && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                          {prospect.notes}
                                        </p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </main>

      {/* Dialogs */}
      <AddProspectDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onProspectAdded={fetchProspects}
      />
      
      {editingProspect && (
        <EditProspectDialog
          prospect={editingProspect}
          open={!!editingProspect}
          onOpenChange={() => setEditingProspect(null)}
          onProspectUpdated={fetchProspects}
          onProspectDeleted={handleDeleteProspect}
        />
      )}

      <MetricsDialog
        open={showMetrics}
        onOpenChange={setShowMetrics}
        prospects={prospects}
      />
    </div>
  );
}