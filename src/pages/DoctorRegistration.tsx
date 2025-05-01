
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { 
  brazilianStates, 
  medicalSpecialties, 
  procedures, 
  shiftTypes, 
  periods, 
  weekDays,
  Doctor
} from "@/types/doctor";
import { supabase } from "@/integrations/supabase/client";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  FileText,
  Save,
  Plus,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
const crmRegex = /^\d{4,10}$/;

const formSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(3, { message: "Nome é obrigatório" }),
    photoUrl: z.string().optional(),
    crm: z.string().regex(crmRegex, { message: "CRM inválido" }),
    crmState: z.string().min(2, { message: "Selecione o estado do CRM" }),
    graduationYear: z.number().int().min(1950).max(new Date().getFullYear()),
    city: z.string().min(2, { message: "Cidade é obrigatória" }),
    phone: z.string().regex(phoneRegex, { message: "Telefone inválido" }),
    email: z.string().email({ message: "E-mail inválido" }),
  }),
  specialties: z.object({
    mainSpecialty: z.string().min(1, { message: "Especialidade é obrigatória" }),
    procedures: z.array(z.string()).min(1, { message: "Selecione pelo menos um procedimento" }),
    shiftTypes: z.array(z.string()).min(1, { message: "Selecione pelo menos um tipo de plantão" }),
  }),
  availability: z.object({
    preferredPeriods: z.array(z.string()).min(1, { message: "Selecione pelo menos um período" }),
    preferredDays: z.array(z.string()).min(1, { message: "Selecione pelo menos um dia" }),
    acceptsFixedShifts: z.boolean(),
    acceptsTemporaryShifts: z.boolean(),
    maxDistanceKm: z.number().int().min(1),
  }),
  location: z.object({
    state: z.string().min(2, { message: "Selecione o estado" }),
    citiesOfWork: z.array(z.string()).min(1, { message: "Informe pelo menos uma cidade" }),
  }),
  certifications: z.object({
    acls: z.boolean(),
    bls: z.boolean(),
    atls: z.boolean(),
    pals: z.boolean(),
    others: z.string().optional(),
  }),
  experience: z.object({
    mainHospitals: z.string().optional(),
    yearsOfExperience: z.string().optional(),
  }),
  additionalInfo: z.object({
    hasDriverLicense: z.boolean(),
    hasElectronicHealthRecordExperience: z.boolean(),
    providesInvoice: z.boolean(),
    languages: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DoctorRegistration() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalInfo: {
        fullName: "",
        photoUrl: "",
        crm: "",
        crmState: "",
        graduationYear: new Date().getFullYear(),
        city: "",
        phone: "",
        email: "",
      },
      specialties: {
        mainSpecialty: "",
        procedures: [],
        shiftTypes: [],
      },
      availability: {
        preferredPeriods: [],
        preferredDays: [],
        acceptsFixedShifts: false,
        acceptsTemporaryShifts: false,
        maxDistanceKm: 50,
      },
      location: {
        state: "",
        citiesOfWork: [],
      },
      certifications: {
        acls: false,
        bls: false,
        atls: false,
        pals: false,
        others: "",
      },
      experience: {
        mainHospitals: "",
        yearsOfExperience: "",
      },
      additionalInfo: {
        hasDriverLicense: false,
        hasElectronicHealthRecordExperience: false,
        providesInvoice: false,
        languages: "",
      },
    },
  });

  const watchCitiesState = form.watch("location.state");
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Format phone with mask
  const formatPhone = (value: string) => {
    if (!value) return "";

    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, "");
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (value.length <= 2) {
      return value.replace(/^(\d{0,2})/, "($1");
    } else if (value.length <= 7) {
      return value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else {
      return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
  };

  const addCity = () => {
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
      setNewCity("");
      form.setValue("location.citiesOfWork", [...cities, newCity.trim()]);
    }
  };

  const removeCity = (city: string) => {
    const updatedCities = cities.filter(c => c !== city);
    setCities(updatedCities);
    form.setValue("location.citiesOfWork", updatedCities);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Exemplo: upload da foto para o Supabase Storage
      let photoUrl = data.personalInfo.photoUrl;
      
      if (photoFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('doctors')
          .upload(`profile-photos/${Date.now()}-${photoFile.name}`, photoFile);
          
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        
        if (uploadData) {
          // Você precisará construir a URL ou obter a URL pública do arquivo
          const { data: publicUrlData } = supabase.storage
            .from('doctors')
            .getPublicUrl(uploadData.path);
            
          photoUrl = publicUrlData.publicUrl;
        }
      }
      
      // Atualiza o dado com a URL da foto
      const doctorData = {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          photoUrl
        }
      };
      
      // Armazenar temporariamente no localStorage até que a tabela correta exista
      localStorage.setItem('doctorProfile', JSON.stringify(doctorData));
      
      // Usando uma tabela que existe no esquema atual apenas para fins de demonstração
      // No ambiente real, você deve criar a tabela "doctors" no seu projeto Supabase
      const { error } = await supabase
        .from('Projeto 1')
        .insert([{ created_at: new Date().toISOString() }]);
        
      if (error) {
        console.error("Erro ao salvar no banco:", error);
        throw new Error(error.message);
      }
      
      toast.success("Perfil médico salvo com sucesso! (Dados armazenados temporariamente no localStorage)");
      
      console.log("Perfil do médico:", doctorData);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar o perfil. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Cadastro de Médico Plantonista</h1>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção 1: Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2" /> Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex flex-col items-center justify-center pb-4">
                <Avatar className="w-32 h-32">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt="Foto do perfil" />
                  ) : (
                    <AvatarFallback>MD</AvatarFallback>
                  )}
                </Avatar>
                <div className="mt-4">
                  <Label htmlFor="photo" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md">
                    Escolher Foto
                  </Label>
                  <Input 
                    id="photo" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoChange} 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input 
                  id="fullName" 
                  {...form.register("personalInfo.fullName")} 
                  placeholder="Digite seu nome completo" 
                />
                {form.formState.errors.personalInfo?.fullName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.personalInfo.fullName.message}
                  </p>
                )}
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="crm">CRM *</Label>
                  <Input 
                    id="crm" 
                    {...form.register("personalInfo.crm")} 
                    placeholder="Número do CRM" 
                  />
                  {form.formState.errors.personalInfo?.crm && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.personalInfo.crm.message}
                    </p>
                  )}
                </div>
                
                <div className="w-1/3">
                  <Label htmlFor="crmState">Estado *</Label>
                  <Controller 
                    control={form.control}
                    name="personalInfo.crmState"
                    render={({ field }) => (
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map(state => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.personalInfo?.crmState && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.personalInfo.crmState.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="graduationYear">Ano de Formação *</Label>
                <Controller
                  control={form.control}
                  name="personalInfo.graduationYear"
                  render={({ field }) => (
                    <Input
                      id="graduationYear"
                      type="number"
                      min={1950}
                      max={new Date().getFullYear()}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  )}
                />
                {form.formState.errors.personalInfo?.graduationYear && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.personalInfo.graduationYear.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="city">Cidade onde mora *</Label>
                <Input 
                  id="city" 
                  {...form.register("personalInfo.city")} 
                  placeholder="Cidade atual" 
                />
                {form.formState.errors.personalInfo?.city && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.personalInfo.city.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Controller
                  control={form.control}
                  name="personalInfo.phone"
                  render={({ field }) => (
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={field.value}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    />
                  )}
                />
                {form.formState.errors.personalInfo?.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.personalInfo.phone.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...form.register("personalInfo.email")} 
                  placeholder="seu@email.com" 
                />
                {form.formState.errors.personalInfo?.email && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.personalInfo.email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Área de Atuação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2" /> Área de Atuação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="mainSpecialty">Especialidade Principal *</Label>
                <Controller 
                  control={form.control}
                  name="specialties.mainSpecialty"
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicalSpecialties.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.specialties?.mainSpecialty && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.specialties.mainSpecialty.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Procedimentos Dominados *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {procedures.map((procedure) => (
                    <div key={procedure} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name="specialties.procedures"
                        render={({ field }) => (
                          <Checkbox
                            id={`procedure-${procedure}`}
                            checked={field.value.includes(procedure)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, procedure]);
                              } else {
                                field.onChange(field.value.filter(val => val !== procedure));
                              }
                            }}
                          />
                        )}
                      />
                      <Label htmlFor={`procedure-${procedure}`} className="text-sm">
                        {procedure}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.specialties?.procedures && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.specialties.procedures.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Tipo de Plantão Aceito *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shiftTypes.map((shiftType) => (
                    <div key={shiftType} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name="specialties.shiftTypes"
                        render={({ field }) => (
                          <Checkbox
                            id={`shiftType-${shiftType}`}
                            checked={field.value.includes(shiftType)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, shiftType]);
                              } else {
                                field.onChange(field.value.filter(val => val !== shiftType));
                              }
                            }}
                          />
                        )}
                      />
                      <Label htmlFor={`shiftType-${shiftType}`} className="text-sm">
                        {shiftType}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.specialties?.shiftTypes && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.specialties.shiftTypes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Disponibilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2" /> Disponibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Períodos Preferenciais *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {periods.map((period) => (
                    <div key={period} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name="availability.preferredPeriods"
                        render={({ field }) => (
                          <Checkbox
                            id={`period-${period}`}
                            checked={field.value.includes(period)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, period]);
                              } else {
                                field.onChange(field.value.filter(val => val !== period));
                              }
                            }}
                          />
                        )}
                      />
                      <Label htmlFor={`period-${period}`} className="text-sm">
                        {period}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.availability?.preferredPeriods && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.availability.preferredPeriods.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Dias Preferidos *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {weekDays.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name="availability.preferredDays"
                        render={({ field }) => (
                          <Checkbox
                            id={`day-${day}`}
                            checked={field.value.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, day]);
                              } else {
                                field.onChange(field.value.filter(val => val !== day));
                              }
                            }}
                          />
                        )}
                      />
                      <Label htmlFor={`day-${day}`} className="text-sm">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.availability?.preferredDays && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.availability.preferredDays.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block mb-2">Aceita plantões fixos?</Label>
                  <Controller
                    control={form.control}
                    name="availability.acceptsFixedShifts"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value ? "sim" : "nao"}
                        onValueChange={(value) => field.onChange(value === "sim")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sim" id="fixed-yes" />
                          <Label htmlFor="fixed-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="fixed-no" />
                          <Label htmlFor="fixed-no">Não</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>

                <div>
                  <Label className="block mb-2">Aceita plantões avulsos?</Label>
                  <Controller
                    control={form.control}
                    name="availability.acceptsTemporaryShifts"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value ? "sim" : "nao"}
                        onValueChange={(value) => field.onChange(value === "sim")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sim" id="temporary-yes" />
                          <Label htmlFor="temporary-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="temporary-no" />
                          <Label htmlFor="temporary-no">Não</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxDistanceKm">Distância máxima para deslocamento (km) *</Label>
                <Controller
                  control={form.control}
                  name="availability.maxDistanceKm"
                  render={({ field }) => (
                    <Input
                      id="maxDistanceKm"
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                    />
                  )}
                />
                {form.formState.errors.availability?.maxDistanceKm && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.availability.maxDistanceKm.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 4: Local de Atuação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2" /> Local de Atuação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Controller 
                  control={form.control}
                  name="location.state"
                  render={({ field }) => (
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilianStates.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.location?.state && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.location.state.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Cidades onde aceita atuar *</Label>
                <div className="flex mt-2">
                  <Input 
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Digite o nome da cidade"
                    className="mr-2"
                  />
                  <Button 
                    type="button" 
                    onClick={addCity} 
                    variant="outline"
                    disabled={!watchCitiesState}
                  >
                    <Plus size={18} />
                  </Button>
                </div>

                {!watchCitiesState && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione um estado primeiro
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {cities.map(city => (
                    <div 
                      key={city}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center text-sm"
                    >
                      {city}
                      <button 
                        type="button"
                        onClick={() => removeCity(city)}
                        className="ml-2 hover:text-destructive"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.location?.citiesOfWork && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.location.citiesOfWork.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 5: Certificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2" /> Certificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={form.control}
                      name="certifications.acls"
                      render={({ field }) => (
                        <Checkbox
                          id="acls"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="acls">ACLS (Advanced Cardiac Life Support)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={form.control}
                      name="certifications.bls"
                      render={({ field }) => (
                        <Checkbox
                          id="bls"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="bls">BLS (Basic Life Support)</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={form.control}
                      name="certifications.atls"
                      render={({ field }) => (
                        <Checkbox
                          id="atls"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="atls">ATLS (Advanced Trauma Life Support)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={form.control}
                      name="certifications.pals"
                      render={({ field }) => (
                        <Checkbox
                          id="pals"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="pals">PALS (Pediatric Advanced Life Support)</Label>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="otherCertifications">Outras certificações</Label>
                <Input 
                  id="otherCertifications" 
                  {...form.register("certifications.others")} 
                  placeholder="Especifique outras certificações relevantes" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção 6: Experiência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2" /> Experiência
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="mainHospitals">Principais hospitais onde atuou</Label>
                <Textarea 
                  id="mainHospitals" 
                  {...form.register("experience.mainHospitals")} 
                  placeholder="Liste os principais hospitais onde trabalhou"
                />
              </div>
              
              <div>
                <Label htmlFor="yearsOfExperience">Anos de experiência com plantões</Label>
                <Input 
                  id="yearsOfExperience" 
                  {...form.register("experience.yearsOfExperience")} 
                  placeholder="Ex: 5 anos em PS, 3 em UTI" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção 7: Diferenciais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2" /> Diferenciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={form.control}
                    name="additionalInfo.hasDriverLicense"
                    render={({ field }) => (
                      <Checkbox
                        id="hasDriverLicense"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="hasDriverLicense">Possui CNH</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    control={form.control}
                    name="additionalInfo.hasElectronicHealthRecordExperience"
                    render={({ field }) => (
                      <Checkbox
                        id="hasElectronicHealthRecordExperience"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="hasElectronicHealthRecordExperience">Experiência com prontuário eletrônico</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Controller
                    control={form.control}
                    name="additionalInfo.providesInvoice"
                    render={({ field }) => (
                      <Checkbox
                        id="providesInvoice"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="providesInvoice">Emite nota fiscal</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="languages">Idiomas</Label>
                <Input 
                  id="languages" 
                  {...form.register("additionalInfo.languages")} 
                  placeholder="Ex: Inglês (fluente), Espanhol (intermediário)" 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg" className="flex items-center">
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2" /> Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

