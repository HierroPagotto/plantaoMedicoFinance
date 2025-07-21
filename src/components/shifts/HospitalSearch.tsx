import { useState, useEffect, useRef, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export type Hospital = {
  id?: number | string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
};

interface HospitalSearchProps {
  value: Hospital | undefined;
  onChange: (hospital: Hospital) => void;
  onCreateNew?: (hospital: Hospital) => void;
  onSearchResults?: (results: Hospital[]) => void;
}

export function HospitalSearch({ value, onChange, onCreateNew, onSearchResults }: HospitalSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [predictions, setPredictions] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const { toast } = useToast();
  const debounceTimer = useRef<NodeJS.Timeout>();
  const initialLoad = useRef(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHospital, setModalHospital] = useState({ name: '', address: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const mapApiHospitalToComponent = useCallback((apiHospital: any): Hospital => {
    return {
      id: apiHospital.id,
      name: apiHospital.name,
      address: apiHospital.address,
      location: {
        lat: apiHospital.latitude,
        lng: apiHospital.longitude
      }
    };
  }, []);

  const fetchHospitals = useCallback(async (searchText = '') => {
    try {
      setLoading(true);
      const response = await api.getHospitals();
      const hospitals = response.data || response;

      const filtered = hospitals
        .filter((hospital: any) =>
          hospital.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (hospital.address && hospital.address.toLowerCase().includes(searchText.toLowerCase()))
        )
        .map(mapApiHospitalToComponent);

      setPredictions(filtered);
      setShowCreateOption(searchText !== '' && filtered.length === 0);
    } catch (error) {
      toast({
        title: "Erro ao buscar hospitais",
        description: "Não foi possível carregar a lista de hospitais.",
        variant: "destructive"
      });
      setPredictions([]);
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  }, [mapApiHospitalToComponent, toast]);

  useEffect(() => {
    if (open && initialLoad.current) {
      fetchHospitals();
    }
  }, [open, fetchHospitals]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!open) return;

    if (search.length === 0) {
      fetchHospitals();
      setShowCreateOption(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchHospitals(search);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search, open, fetchHospitals]);

  const handleCreateNewHospital = async () => {
    // Ao clicar no +, abrir modal em vez de criar direto
    setModalOpen(true);
    setModalHospital({ name: search, address: '' });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalHospital.name.trim() || !modalHospital.address.trim()) {
      toast({ title: 'Preencha todos os campos.' });
      return;
    }
    setModalLoading(true);
    try {
      const newHospital = {
        name: modalHospital.name,
        address: modalHospital.address,
        latitude: 0.0,
        longitude: 0.0
      };
      await api.createHospital(newHospital);
      const response = await api.getHospitals();
      const hospitals = response.data || response;
      const mappedHospitals = hospitals.map(mapApiHospitalToComponent);
      setPredictions(mappedHospitals);
      if (onSearchResults) onSearchResults(mappedHospitals);
      const newlyCreatedHospital = mappedHospitals.find(h => h.name === modalHospital.name) || mappedHospitals[mappedHospitals.length - 1];
      if (newlyCreatedHospital) onChange(newlyCreatedHospital);
      setModalOpen(false);
      setSearch('');
      toast({ title: 'Hospital criado', description: 'O novo hospital foi adicionado com sucesso.' });
    } catch (error) {
      toast({ title: 'Erro ao criar hospital', description: 'Não foi possível criar o novo hospital.', variant: 'destructive' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleSelectHospital = (hospital: Hospital) => {
    onChange(hospital);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full gap-2">
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
              <div className="flex items-center border-b px-3 gap-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Buscar hospitais..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
                  autoFocus
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-1 text-medical-teal hover:bg-medical-teal/10"
                  onClick={handleCreateNewHospital}
                  title="Cadastrar novo hospital"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <CommandList>
                {loading && initialLoad.current ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Carregando hospitais...</span>
                  </div>
                ) : loading ? (
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
                          key={hospital.id || `${hospital.name}-${hospital.location.lat}-${hospital.location.lng}`}
                          value={hospital.name}
                          onSelect={() => handleSelectHospital(hospital)}
                        >
                          <div className="flex flex-col">
                            <div className="font-medium">{hospital.name}</div>
                            {/*{hospital.address && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {hospital.address}
                              </div>
                            )}*/}
                          </div>
                        </CommandItem>
                      ))}
                      {showCreateOption && (
                        <CommandItem
                          value={`Criar "${search}"`}
                          onSelect={handleCreateNewHospital}
                          className="text-primary"
                        >
                          <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar novo hospital: "{search}"
                          </div>
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar novo hospital</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input
                value={modalHospital.name}
                onChange={e => setModalHospital({ ...modalHospital, name: e.target.value })}
                required
                placeholder="Nome do hospital ou clínica"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <Input
                value={modalHospital.address}
                onChange={e => setModalHospital({ ...modalHospital, address: e.target.value })}
                required
                placeholder="Endereço completo"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={modalLoading} className="bg-medical-teal text-white hover:bg-medical-accent">
                {modalLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}