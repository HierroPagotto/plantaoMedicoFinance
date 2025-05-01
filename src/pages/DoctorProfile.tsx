
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Doctor, brazilianStates } from "@/types/doctor";
import {
  User,
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
} from "lucide-react";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera os dados do médico do localStorage
    const doctorData = localStorage.getItem("doctorProfile");
    if (doctorData) {
      try {
        const parsedData = JSON.parse(doctorData);
        setDoctor(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados do médico:", error);
        toast.error("Erro ao carregar dados do perfil médico");
      }
    } else {
      toast.error("Perfil médico não encontrado. Por favor, complete o cadastro.");
    }
    setLoading(false);
  }, []);

  // Função auxiliar para obter o nome do estado a partir da sigla
  const getStateName = (stateCode: string) => {
    const state = brazilianStates.find((s) => s.value === stateCode);
    return state ? state.label : stateCode;
  };

  // Mostrar mensagem de carregamento enquanto os dados estão sendo recuperados
  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Carregando perfil...</div>
        </div>
      </AppShell>
    );
  }

  // Mostrar mensagem se não houver dados do médico
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

  return (
    <AppShell>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Perfil Médico</h1>
          <Button asChild variant="outline">
            <Link to="/doctor-registration" className="flex items-center gap-2">
              <Edit size={16} />
              Editar perfil
            </Link>
          </Button>
        </div>

        {/* Cabeçalho do perfil */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="w-32 h-32 border-2 border-primary">
                {doctor.personalInfo.photoUrl ? (
                  <AvatarImage src={doctor.personalInfo.photoUrl} alt={doctor.personalInfo.fullName} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {doctor.personalInfo.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold">{doctor.personalInfo.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {doctor.specialties.mainSpecialty}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    CRM {doctor.personalInfo.crm}/{doctor.personalInfo.crmState}
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>
                      {doctor.personalInfo.city}, {getStateName(doctor.location.state)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{doctor.personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{doctor.personalInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1 */}
          <div className="space-y-6">
            {/* Área de atuação */}
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
                  <p>{doctor.specialties.mainSpecialty}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Procedimentos dominados</h3>
                  <div className="flex flex-wrap gap-1">
                    {doctor.specialties.procedures.map((procedure) => (
                      <Badge key={procedure} variant="secondary" className="mb-1">
                        {procedure}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Tipos de plantão</h3>
                  <div className="flex flex-wrap gap-1">
                    {doctor.specialties.shiftTypes.map((shiftType) => (
                      <Badge key={shiftType} variant="outline" className="mb-1">
                        {shiftType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificações */}
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
                      className={`w-3 h-3 rounded-full ${
                        doctor.certifications.acls ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>ACLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        doctor.certifications.bls ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>BLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        doctor.certifications.atls ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>ATLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        doctor.certifications.pals ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>PALS</span>
                  </div>
                </div>

                {doctor.certifications.others && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Outras certificações</h3>
                    <p className="text-sm">{doctor.certifications.others}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diferenciais */}
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
                      className={`w-3 h-3 rounded-full ${
                        doctor.additionalInfo.hasDriverLicense ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>Possui CNH</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        doctor.additionalInfo.hasElectronicHealthRecordExperience
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span>Experiência com prontuário eletrônico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        doctor.additionalInfo.providesInvoice ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>Emite nota fiscal</span>
                  </li>
                </ul>

                {doctor.additionalInfo.languages && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-1">Idiomas</h3>
                    <p className="text-sm">{doctor.additionalInfo.languages}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-6">
            {/* Disponibilidade */}
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
                    {doctor.availability.preferredPeriods.map((period) => (
                      <Badge key={period} variant="outline" className="mb-1">
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Dias preferidos</h3>
                  <div className="flex flex-wrap gap-1">
                    {doctor.availability.preferredDays.map((day) => (
                      <Badge key={day} variant="outline" className="mb-1">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Aceita plantões fixos</h3>
                    <p>{doctor.availability.acceptsFixedShifts ? "Sim" : "Não"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Aceita plantões avulsos</h3>
                    <p>{doctor.availability.acceptsTemporaryShifts ? "Sim" : "Não"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Distância máxima</h3>
                  <p>{doctor.availability.maxDistanceKm} km</p>
                </div>
              </CardContent>
            </Card>

            {/* Local de atuação */}
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
                  <p>{getStateName(doctor.location.state)}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Cidades onde aceita atuar</h3>
                  <div className="flex flex-wrap gap-1">
                    {doctor.location.citiesOfWork.map((city) => (
                      <Badge key={city} variant="secondary" className="mb-1">
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formação */}
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
                    <p>{doctor.personalInfo.graduationYear}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">CRM</h3>
                    <p>
                      {doctor.personalInfo.crm}/{doctor.personalInfo.crmState}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3 */}
          <div className="space-y-6">
            {/* Experiência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiência Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.experience.yearsOfExperience && (
                  <div>
                    <h3 className="font-medium mb-1">Anos de experiência</h3>
                    <p>{doctor.experience.yearsOfExperience}</p>
                  </div>
                )}

                {doctor.experience.mainHospitals && (
                  <div>
                    <h3 className="font-medium mb-1">Principais hospitais</h3>
                    <p className="whitespace-pre-line">{doctor.experience.mainHospitals}</p>
                  </div>
                )}
                
                {!doctor.experience.yearsOfExperience && !doctor.experience.mainHospitals && (
                  <p className="text-muted-foreground italic">Não informado</p>
                )}
              </CardContent>
            </Card>

            {/* Status do Cadastro */}
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
                  <p>Cadastro realizado em: {new Date().toLocaleDateString()}</p>
                  <p>Última atualização: {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code / Link de compartilhamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compartilhar Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded-lg mx-auto w-32 h-32 flex items-center justify-center mb-4">
                    <div className="text-xs text-muted-foreground">QR Code do perfil</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Copiar link do perfil
                  </Button>
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
