import type { ProjectPictureGrid } from '@/hooks/useProjects';

interface PictureGridProps {
  grid: ProjectPictureGrid;
}

export function PictureGrid({ grid }: PictureGridProps) {
  const getColumnClass = (columns: number) => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  if (!grid.pictures || grid.pictures.length === 0) {
    return null;
  }

  return (
    <div className={`grid ${getColumnClass(grid.columns)} gap-6 my-12`}>
      {grid.pictures.map((picture, index) => (
        <div key={index} className="space-y-3">
          <img
            src={picture.url}
            alt={picture.alt}
            className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
          />
          {picture.caption && (
            <p className="text-sm text-muted-foreground italic text-center">
              {picture.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
