
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ShiftProps } from '@/components/shifts/ShiftCard';

interface MapPreviewProps {
  nextShift: ShiftProps | null;
}

export function MapPreview({ nextShift }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nextShift || !mapRef.current) {
      return;
    }

    // This is a mock implementation since we don't have actual map integration yet
    // In a real implementation, this would use the Google Maps or Mapbox APIs
    const mapElement = mapRef.current;
    mapElement.innerHTML = '';
    mapElement.style.background = '#e5e7eb';
    mapElement.style.borderRadius = '0.375rem';
    
    // Create a mock map UI
    const mapContent = document.createElement('div');
    mapContent.className = 'flex items-center justify-center h-full flex-col';
    mapContent.innerHTML = `
      <div class="text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" 
          stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p class="mt-2 font-medium">${nextShift.hospital.name}</p>
        <p class="text-sm text-muted-foreground mt-1">${nextShift.hospital.address}</p>
      </div>
    `;
    mapElement.appendChild(mapContent);
  }, [nextShift]);

  if (!nextShift) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Local do próximo plantão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted flex items-center justify-center rounded-md">
            <p className="text-muted-foreground">Nenhum plantão agendado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Local do próximo plantão</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-64" />
      </CardContent>
      <CardFooter className="pt-4">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextShift.hospital.address)}`} target="_blank" rel="noopener noreferrer">
            Abrir no Google Maps
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
