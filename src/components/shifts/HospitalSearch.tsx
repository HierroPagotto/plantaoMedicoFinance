
import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Hospital = {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
};

// Mock data for hospitals
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

export function HospitalSearch({ value, onChange }: HospitalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredHospitals = mockHospitals.filter(
    hospital => 
      hospital.name.toLowerCase().includes(search.toLowerCase()) ||
      hospital.address.toLowerCase().includes(search.toLowerCase())
  );

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
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>Nenhum hospital encontrado.</CommandEmpty>
            <CommandGroup heading="Hospitais e Clínicas">
              {filteredHospitals.map((hospital) => (
                <CommandItem
                  key={hospital.name}
                  value={hospital.name}
                  onSelect={() => {
                    onChange(hospital);
                    setOpen(false);
                  }}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
