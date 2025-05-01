
import { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export type Hospital = {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
};

// Mock data para hospitais (usado como fallback caso a API falhe)
const mockHospitals: Hospital[] = [
  { 
    name: 'Hospital São Lucas',
    address: 'Av. Brasília, 2084 - Centro, Araraquara - SP',
    location: { lat: -21.794100, lng: -48.174282 }
  },
  { 
    name: 'Hospital Santa Casa',
    address: 'R. Padre Duarte, 700 - Jardim Nova América, Araraquara - SP',
    location: { lat: -21.786253, lng: -48.179634 }
  },
  { 
    name: 'Hospital da Unimed',
    address: 'Av. José Bonifácio, 794 - Jardim Botafogo, Araraquara - SP',
    location: { lat: -21.792896, lng: -48.185893 }
  },
];

interface HospitalSearchProps {
  value: Hospital | undefined;
  onChange: (hospital: Hospital) => void;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export function HospitalSearch({ value, onChange }: HospitalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [predictions, setPredictions] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Inicializa a API do Google Places
    if (!scriptLoadedRef.current) {
      window.initGooglePlaces = () => {
        if (window.google && window.google.maps) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          const mapDiv = document.createElement('div');
          const map = new window.google.maps.Map(mapDiv, { center: { lat: -23.5505, lng: -46.6333 }, zoom: 13 });
          placesServiceRef.current = new window.google.maps.places.PlacesService(map);
          scriptLoadedRef.current = true;
        }
      };

      // Carrega o script da API Google Places
      const script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initGooglePlaces";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        delete window.initGooglePlaces;
      };
    }
  }, []);

  const handleSearch = (searchText: string) => {
    setSearch(searchText);

    if (searchText.length < 3) {
      setPredictions(mockHospitals.filter(
        hospital => hospital.name.toLowerCase().includes(searchText.toLowerCase()) || 
                   hospital.address.toLowerCase().includes(searchText.toLowerCase())
      ));
      return;
    }

    setLoading(true);

    if (autocompleteServiceRef.current) {
      // Buscar sugestões na API do Google Places
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: searchText,
          types: ['hospital', 'health', 'establishment'],
          componentRestrictions: { country: 'br' }
        },
        (predictions: any[], status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Processar as previsões e buscar detalhes
            Promise.all(
              predictions.slice(0, 5).map((prediction) => {
                return new Promise<Hospital>((resolve, reject) => {
                  placesServiceRef.current.getDetails(
                    { placeId: prediction.place_id, fields: ['name', 'formatted_address', 'geometry'] },
                    (place: any, detailStatus: string) => {
                      if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve({
                          name: place.name,
                          address: place.formatted_address,
                          location: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                          }
                        });
                      } else {
                        reject(new Error(`Error fetching place details: ${detailStatus}`));
                      }
                    }
                  );
                });
              })
            )
              .then((hospitals) => {
                setPredictions(hospitals);
                setLoading(false);
              })
              .catch((error) => {
                console.error('Error fetching hospital details:', error);
                setPredictions(mockHospitals);
                setLoading(false);
                toast({
                  title: "Erro ao buscar hospitais",
                  description: "Usando dados offline como fallback.",
                  variant: "destructive"
                });
              });
          } else {
            // Se falhar, usar os dados mock
            setPredictions(mockHospitals);
            setLoading(false);
          }
        }
      );
    } else {
      // Se a API não estiver disponível, usar os dados mock
      setPredictions(mockHospitals.filter(
        hospital => hospital.name.toLowerCase().includes(searchText.toLowerCase()) || 
                   hospital.address.toLowerCase().includes(searchText.toLowerCase())
      ));
      setLoading(false);
    }
  };

  const handleSelectHospital = (hospital: Hospital) => {
    onChange(hospital);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value.name : "Buscar hospital ou clínica"}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar hospitais..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
            />
          </div>
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2 text-sm text-muted-foreground">Buscando hospitais...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum hospital encontrado.</CommandEmpty>
                <CommandGroup heading="Hospitais e Clínicas">
                  {predictions.map((hospital) => (
                    <CommandItem
                      key={`${hospital.name}-${hospital.location.lat}-${hospital.location.lng}`}
                      value={hospital.name}
                      onSelect={() => handleSelectHospital(hospital)}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{hospital.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {hospital.address}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
