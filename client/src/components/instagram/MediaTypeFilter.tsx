import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Filter, Film, Image, CircleDot } from "lucide-react";

interface MediaTypeFilterProps {
  mediaTypes: string[];
  mediaTypeFilter: string[];
  setMediaTypeFilter: (value: string[]) => void;
}

const getMediaTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'reel':
    case 'reels':
      return Film;
    case 'story':
    case 'stories':
      return CircleDot;
    default:
      return Image;
  }
};

export const MediaTypeFilter = ({
  mediaTypes,
  mediaTypeFilter,
  setMediaTypeFilter,
}: MediaTypeFilterProps) => {
  if (mediaTypes.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>მედია ტიპი:</span>
          </div>
          <ToggleGroup 
            type="multiple" 
            value={mediaTypeFilter}
            onValueChange={setMediaTypeFilter}
            className="justify-start"
          >
            {mediaTypes.map(type => {
              const Icon = getMediaTypeIcon(type);
              return (
                <ToggleGroupItem 
                  key={type} 
                  value={type}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {type}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          {mediaTypeFilter.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMediaTypeFilter([])}
              className="text-muted-foreground"
            >
              გასუფთავება
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
