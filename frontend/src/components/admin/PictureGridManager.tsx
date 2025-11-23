import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import type { ProjectPictureGrid, ProjectGridPicture } from '@/hooks/useProjects';

interface PictureGridManagerProps {
  pictureGrids: ProjectPictureGrid[];
  onChange: (grids: ProjectPictureGrid[]) => void;
}

const POSITION_OPTIONS = [
  { value: 'before_objectives', label: 'Before Objectives' },
  { value: 'after_objectives', label: 'After Objectives' },
  { value: 'before_methodology', label: 'Before Methodology' },
  { value: 'after_methodology', label: 'After Methodology' },
  { value: 'before_findings', label: 'Before Findings' },
  { value: 'after_findings', label: 'After Findings' },
  { value: 'before_impact', label: 'Before Impact' },
  { value: 'after_impact', label: 'After Impact' },
] as const;

export function PictureGridManager({ pictureGrids, onChange }: PictureGridManagerProps) {
  const [editingGridIndex, setEditingGridIndex] = useState<number | null>(null);

  const addGrid = () => {
    const newGrid: ProjectPictureGrid = {
      position: 'after_objectives',
      columns: 2,
      order: pictureGrids.length,
      pictures: [],
    };
    onChange([...pictureGrids, newGrid]);
    setEditingGridIndex(pictureGrids.length);
  };

  const removeGrid = (index: number) => {
    const updated = pictureGrids.filter((_, i) => i !== index);
    onChange(updated.map((grid, i) => ({ ...grid, order: i })));
    if (editingGridIndex === index) {
      setEditingGridIndex(null);
    }
  };

  const updateGrid = (index: number, updates: Partial<ProjectPictureGrid>) => {
    const updated = [...pictureGrids];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const moveGrid = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pictureGrids.length) return;

    const updated = [...pictureGrids];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated.map((grid, i) => ({ ...grid, order: i })));
    if (editingGridIndex === index) {
      setEditingGridIndex(newIndex);
    }
  };

  const addPicture = (gridIndex: number) => {
    const grid = pictureGrids[gridIndex];
    const newPicture: ProjectGridPicture = {
      url: '',
      alt: '',
      order: grid.pictures.length,
    };
    updateGrid(gridIndex, {
      pictures: [...grid.pictures, newPicture],
    });
  };

  const removePicture = (gridIndex: number, pictureIndex: number) => {
    const grid = pictureGrids[gridIndex];
    updateGrid(gridIndex, {
      pictures: grid.pictures.filter((_, i) => i !== pictureIndex).map((pic, i) => ({ ...pic, order: i })),
    });
  };

  const updatePicture = (gridIndex: number, pictureIndex: number, updates: Partial<ProjectGridPicture>) => {
    const grid = pictureGrids[gridIndex];
    const updatedPictures = [...grid.pictures];
    updatedPictures[pictureIndex] = { ...updatedPictures[pictureIndex], ...updates };
    updateGrid(gridIndex, { pictures: updatedPictures });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Picture Grids</Label>
        <Button type="button" onClick={addGrid} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Picture Grid
        </Button>
      </div>

      {pictureGrids.length === 0 && (
        <p className="text-sm text-muted-foreground">No picture grids added yet. Click "Add Picture Grid" to create one.</p>
      )}

      {pictureGrids.map((grid, gridIndex) => (
        <Card key={gridIndex}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Grid {gridIndex + 1}</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveGrid(gridIndex, 'up')}
                  disabled={gridIndex === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveGrid(gridIndex, 'down')}
                  disabled={gridIndex === pictureGrids.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGrid(gridIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`grid-${gridIndex}-position`}>Position</Label>
                <Select
                  value={grid.position}
                  onValueChange={(value) => updateGrid(gridIndex, { position: value as ProjectPictureGrid['position'] })}
                >
                  <SelectTrigger id={`grid-${gridIndex}-position`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`grid-${gridIndex}-columns`}>Columns</Label>
                <Select
                  value={grid.columns.toString()}
                  onValueChange={(value) => updateGrid(gridIndex, { columns: parseInt(value) as 1 | 2 | 3 })}
                >
                  <SelectTrigger id={`grid-${gridIndex}-columns`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Column</SelectItem>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Pictures ({grid.pictures.length})</Label>
                <Button
                  type="button"
                  onClick={() => addPicture(gridIndex)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Picture
                </Button>
              </div>

              {grid.pictures.length === 0 && (
                <p className="text-sm text-muted-foreground">No pictures added. Click "Add Picture" to add one.</p>
              )}

              {grid.pictures.map((picture, pictureIndex) => (
                <div key={pictureIndex} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Picture {pictureIndex + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePicture(gridIndex, pictureIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`grid-${gridIndex}-pic-${pictureIndex}-url`}>Image URL</Label>
                      <Input
                        id={`grid-${gridIndex}-pic-${pictureIndex}-url`}
                        type="url"
                        value={picture.url}
                        onChange={(e) => updatePicture(gridIndex, pictureIndex, { url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`grid-${gridIndex}-pic-${pictureIndex}-alt`}>Alt Text</Label>
                      <Input
                        id={`grid-${gridIndex}-pic-${pictureIndex}-alt`}
                        value={picture.alt}
                        onChange={(e) => updatePicture(gridIndex, pictureIndex, { alt: e.target.value })}
                        placeholder="Describe the image"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`grid-${gridIndex}-pic-${pictureIndex}-caption`}>Caption (Optional)</Label>
                      <Input
                        id={`grid-${gridIndex}-pic-${pictureIndex}-caption`}
                        value={picture.caption || ''}
                        onChange={(e) => updatePicture(gridIndex, pictureIndex, { caption: e.target.value || undefined })}
                        placeholder="Optional caption"
                      />
                    </div>

                    {picture.url && (
                      <div className="mt-2">
                        <img
                          src={picture.url}
                          alt={picture.alt || 'Preview'}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
