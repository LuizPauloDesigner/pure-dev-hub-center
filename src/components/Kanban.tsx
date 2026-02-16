import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import type { KanbanTask } from '@/contexts/AppContext';

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-500' },
  { id: 'inProgress', title: 'Em Andamento', color: 'bg-yellow-500' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500' },
] as const;

function DroppableColumn({ 
  column, 
  tasks, 
  children 
}: { 
  column: typeof columns[number]; 
  tasks: KanbanTask[]; 
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div key={column.id} className="flex flex-col">
      <div className={`${column.color} text-white rounded-t-lg p-3 font-semibold`}>
        {column.title} ({tasks.length})
      </div>
      <div 
        ref={setNodeRef}
        className={`flex-1 border border-t-0 rounded-b-lg p-4 space-y-3 min-h-[400px] bg-card/50 transition-colors ${
          isOver ? 'bg-primary/5 border-primary' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function SortableTask({ task, onDelete, onEdit }: { task: KanbanTask; onDelete: () => void; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
              {task.recurrence && task.recurrence !== 'none' && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {task.recurrence === 'daily' ? 'Diário' : 'Semanal'}
                </span>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1 hover:bg-muted rounded"
              >
                <Pencil className="h-4 w-4 text-primary" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-muted rounded"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Kanban = () => {
  const { state, currentProject, addKanbanTask, updateKanbanTask, deleteKanbanTask } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    column: 'todo' as const,
    recurrence: 'none' as const,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const projectTasks = state.kanban.filter(task => task.projectId === currentProject);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = projectTasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if dropped over a column
    const columnIds = columns.map(c => c.id);
    if (columnIds.includes(over.id as any)) {
      const newColumn = over.id as KanbanTask['column'];
      if (task.column !== newColumn) {
        updateKanbanTask(taskId, {
          column: newColumn,
          completedAt: newColumn === 'done' ? new Date().toISOString() : undefined,
        });
        toast.success('Tarefa movida');
      }
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    addKanbanTask({
      projectId: currentProject,
      ...newTask,
    });

    setNewTask({
      title: '',
      description: '',
      column: 'todo',
      recurrence: 'none',
    });
    setIsDialogOpen(false);
    toast.success('Tarefa criada');
  };

  const handleEditTask = () => {
    if (!editingTask || !editingTask.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    updateKanbanTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      column: editingTask.column,
      recurrence: editingTask.recurrence,
    });

    setEditingTask(null);
    setIsEditDialogOpen(false);
    toast.success('Tarefa atualizada');
  };

  const openEditDialog = (task: KanbanTask) => {
    setEditingTask({ ...task });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Título"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Select
                value={newTask.column}
                onValueChange={(value: any) => setNewTask({ ...newTask, column: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newTask.recurrence}
                onValueChange={(value: any) => setNewTask({ ...newTask, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Recorrência</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddTask} className="w-full">
                Criar Tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Título"
                value={editingTask?.title || ''}
                onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={editingTask?.description || ''}
                onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
              <Select
                value={editingTask?.column}
                onValueChange={(value: any) => setEditingTask(prev => prev ? { ...prev, column: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={editingTask?.recurrence}
                onValueChange={(value: any) => setEditingTask(prev => prev ? { ...prev, recurrence: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Recorrência</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleEditTask} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map(column => {
            const columnTasks = projectTasks.filter(task => task.column === column.id);

            return (
              <DroppableColumn key={column.id} column={column} tasks={columnTasks}>
                <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {columnTasks.map(task => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onEdit={() => openEditDialog(task)}
                      onDelete={() => {
                        deleteKanbanTask(task.id);
                        toast.success('Tarefa deletada');
                      }}
                    />
                  ))}
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};
