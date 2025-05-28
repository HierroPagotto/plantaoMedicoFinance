import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { brazilianStates } from "@/types/doctor";
import QRCode from "react-qr-code";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  FileText,
  Edit,
  Shield,
  Info,
  Star,
  Printer,
} from "lucide-react";
import PrintButton from "@/components/ui/print-button";

interface UserData {
  accepts_fixed_shifts: boolean;
  accepts_temporary_shifts: boolean;
  acls: boolean;
  atls: boolean;
  bls: boolean;
  cities_of_work: string | null;
  city: string;
  created_at: string;
  crm: string;
  crm_state: string | null;
  email: string;
  graduation_year: string | null;
  has_driver_license: boolean;
  has_ehr_experience: boolean;
  id: string;
  languages: string | null;
  main_hospitals: string | null;
  main_specialty: string;
  max_distance_km: number | null;
  name: string;
  other_certifications: string | null;
  pals: boolean;
  phone: string;
  photo_url: string;
  preferred_days: string;
  preferred_periods: string;
  procedures: string;
  provides_invoice: boolean;
  shift_types: string;
  shifts_count: number;
  state: string | null;
  updated_at: string;
  years_of_experience: number | null;
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorData = localStorage.getItem("userData");
    if (doctorData) {
      try {
        const parsedData = JSON.parse(doctorData);
        setDoctor(parsedData);
      } catch (error) {
        toast.error("Erro ao carregar");
      }
    } else {
      toast.error("Perfil médico não encontrado");
    }
    setLoading(false);
  }, []);

  const getStateName = (stateCode: string | null) => {
    if (!stateCode) return "Não informado";
    const state = brazilianStates.find((s) => s.value === stateCode);
    return state ? state.label : stateCode;
  };

  const handleCopyLink = async () => {
    if (!doctor) return;

    const profileUrl = `${window.location.origin}/doctor-profile/${doctor.id}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      toast.error("Não foi possível copiar o link");
      const textArea = document.createElement("textarea");
      textArea.value = profileUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copiado!");
      } catch (fallbackErr) { }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Carregando perfil...</div>
        </div>
      </AppShell>
    );
  }

  if (!doctor) {
    return (
      <AppShell>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
            <p className="mb-6">Você ainda não cadastrou seu perfil médico.</p>
            <Button asChild>
              <Link to="/doctor-registration">Cadastrar perfil médico</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const preferredDays = doctor.preferred_days ? doctor.preferred_days.split(",") : [];
  const preferredPeriods = doctor.preferred_periods ? doctor.preferred_periods.split(",") : [];
  const procedures = doctor.procedures ? doctor.procedures.split(",") : [];
  const shiftTypes = doctor.shift_types ? doctor.shift_types.split(",") : [];
  const citiesOfWork = doctor.cities_of_work ? doctor.cities_of_work.split(',') : [];

  const profileUrl = `${window.location.origin}/doctor-profile/${doctor.id}`;

  return (
    <AppShell>
      <div className="container mx-auto py-6 print-container">
        <div className="flex items-center justify-between mb-6 print-hide">
          <h1 className="text-2xl font-bold">Perfil Médico</h1>
          <div className="flex gap-2">
            <PrintButton />
            <Button asChild variant="outline">
              <Link to="/doctor-registration" className="flex items-center gap-2">
                <Edit size={16} />
                Editar perfil
              </Link>
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="w-32 h-32 border-2 border-primary">
                {doctor.photo_url ? (
                  <AvatarImage src={doctor.photo_url} alt={doctor.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {doctor.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {doctor.main_specialty}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    CRM {doctor.crm}/{doctor.crm_state || "UF"}
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>
                      {doctor.city}, {getStateName(doctor.state)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{doctor.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Área de Atuação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Especialidade principal</h3>
                  <p>{doctor.main_specialty}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Procedimentos dominados</h3>
                  <div className="flex flex-wrap gap-1">
                    {procedures.map((procedure) => (
                      <Badge key={procedure} variant="secondary" className="mb-1">
                        {procedure}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Tipos de plantão</h3>
                  <div className="flex flex-wrap gap-1">
                    {shiftTypes.map((shiftType) => (
                      <Badge key={shiftType} variant="outline" className="mb-1">
                        {shiftType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.acls ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>ACLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.bls ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>BLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.atls ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>ATLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.pals ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>PALS</span>
                  </div>
                </div>

                {doctor.other_certifications && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Outras certificações</h3>
                    <p className="text-sm">{doctor.other_certifications}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Diferenciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.has_driver_license ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>Possui CNH</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.has_ehr_experience ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>Experiência com prontuário eletrônico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${doctor.provides_invoice ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span>Emite nota fiscal</span>
                  </li>
                </ul>

                {doctor.languages && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Idiomas</h3>
                    <p className="text-sm">{doctor.languages}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Disponibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Períodos preferenciais</h3>
                  <div className="flex flex-wrap gap-1">
                    {preferredPeriods.map((period) => (
                      <Badge key={period} variant="outline" className="mb-1">
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Dias preferidos</h3>
                  <div className="flex flex-wrap gap-1">
                    {preferredDays.map((day) => (
                      <Badge key={day} variant="outline" className="mb-1">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Aceita plantões fixos</h3>
                    <p>{doctor.accepts_fixed_shifts ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Aceita plantões avulsos</h3>
                    <p>{doctor.accepts_temporary_shifts ? "Sim" : "Não"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Distância máxima</h3>
                  <p>{doctor.max_distance_km ? `${doctor.max_distance_km} km` : "Não informado"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Local de Atuação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Estado</h3>
                  <p>{getStateName(doctor.state)}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Cidades onde aceita atuar</h3>
                  <div className="flex flex-wrap gap-1">
                    {citiesOfWork.length > 0 ? (
                      citiesOfWork.map((city) => (
                        <Badge key={city} variant="secondary" className="mb-1">
                          {city}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Não informado</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Formação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Ano de formação</h3>
                    <p>{doctor.graduation_year || "Não informado"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">CRM</h3>
                    <p>
                      {doctor.crm}/{doctor.crm_state || "UF"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiência Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.years_of_experience && (
                  <div>
                    <h3 className="font-medium mb-1">Anos de experiência</h3>
                    <p>{doctor.years_of_experience}</p>
                  </div>
                )}

                {doctor.main_hospitals && (
                  <div>
                    <h3 className="font-medium mb-1">Principais hospitais</h3>
                    <p className="whitespace-pre-line">{doctor.main_hospitals}</p>
                  </div>
                )}

                {!doctor.years_of_experience && !doctor.main_hospitals && (
                  <p className="text-muted-foreground italic">Não informado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Status do Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium text-green-700">Perfil completo</span>
                  </div>
                  <p className="mt-2 text-sm text-green-600">
                    Seu perfil está completo e pronto para ser encontrado por hospitais e instituições.
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Cadastro realizado em: {new Date(doctor.created_at).toLocaleDateString()}</p>
                  <p>Última atualização: {new Date(doctor.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compartilhar Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg mx-auto w-32 h-32 flex items-center justify-center mb-4">
                    <QRCode
                      value={profileUrl}
                      size={128}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyLink}
                  >
                    Copiar link do perfil
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Escaneie o QR Code para acessar este perfil
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button asChild variant="outline">
            <Link to="/dashboard">Voltar para o Dashboard</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}