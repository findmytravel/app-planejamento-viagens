"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, MapPin, ChevronRight, ChevronLeft, Calendar, AlertCircle } from "lucide-react";

type TripOption = "match" | "known";

// Tipos para o formulário Travel Match
interface TravelMatchForm {
  departureCity: string;
  tripTypes: string[];
  company: string;
  numberOfTravelers: number;
  companions: Array<{ name: string; relation: string }>;
  destinationTypes: string[];
  activities: string[];
  beachActivities: string[];
  seaTemperature: string;
  seaType: string;
  seaColor: string;
  accommodation: string[];
  beachfront: string;
  travelDateType: "dates" | "month" | "";
  departureDate: string;
  returnDate: string;
  month: string;
  monthDuration: number | null;
  budgetType: "total" | "per-person";
  budget: number | null;
}

// Tipos para o formulário Já Sei
interface KnownDestinationForm {
  destinations: string[];
  travelDate: string;
  duration: string;
  budget: number | null;
  budgetType: "per-person" | "total";
  travelers: string;
  activities: string[];
}

// Lista completa de cidades brasileiras para autocomplete (todas as capitais + principais cidades)
const BRAZILIAN_CITIES = [
  // Capitais
  "Aracaju", "Belém", "Belo Horizonte", "Boa Vista", "Brasília", "Campo Grande",
  "Cuiabá", "Curitiba", "Florianópolis", "Fortaleza", "Goiânia", "João Pessoa",
  "Macapá", "Maceió", "Manaus", "Natal", "Palmas", "Porto Alegre", "Porto Velho",
  "Recife", "Rio Branco", "Rio de Janeiro", "Salvador", "São Luís", "São Paulo",
  "Teresina", "Vitória",
  
  // São Paulo
  "Americana", "Araçatuba", "Araraquara", "Araras", "Assis", "Atibaia", "Barretos",
  "Barueri", "Bauru", "Birigui", "Botucatu", "Bragança Paulista", "Cajamar", "Campinas",
  "Carapicuíba", "Caraguatatuba", "Catanduva", "Cotia", "Cruzeiro", "Cubatão", "Diadema",
  "Embu das Artes", "Ferraz de Vasconcelos", "Franca", "Francisco Morato", "Franco da Rocha",
  "Guaratinguetá", "Guarujá", "Guarulhos", "Hortolândia", "Indaiatuba", "Itapecerica da Serra",
  "Itapetininga", "Itapevi", "Itaquaquecetuba", "Itu", "Jaboticabal", "Jacareí", "Jandira",
  "Jau", "Jundiaí", "Limeira", "Lins", "Marília", "Matão", "Mauá", "Mogi das Cruzes",
  "Mogi Guaçu", "Osasco", "Ourinhos", "Paulínia", "Piracicaba", "Poá", "Praia Grande",
  "Presidente Prudente", "Ribeirão Pires", "Ribeirão Preto", "Rio Claro", "Salto",
  "Santa Bárbara d'Oeste", "Santana de Parnaíba", "Santo André", "Santos", "São Bernardo do Campo",
  "São Caetano do Sul", "São Carlos", "São João da Boa Vista", "São José do Rio Preto",
  "São José dos Campos", "São Vicente", "Sertãozinho", "Sorocaba", "Sumaré", "Suzano",
  "Taboão da Serra", "Tatuí", "Taubaté", "Valinhos", "Votorantim", "Votuporanga",
  
  // Rio de Janeiro
  "Angra dos Reis", "Araruama", "Armação dos Búzios", "Barra Mansa", "Belford Roxo",
  "Cabo Frio", "Campos dos Goytacazes", "Duque de Caxias", "Itaboraí", "Itaguaí",
  "Macaé", "Magé", "Maricá", "Mesquita", "Nilópolis", "Niterói", "Nova Friburgo",
  "Nova Iguaçu", "Petrópolis", "Queimados", "Resende", "Rio das Ostras", "São Gonçalo",
  "São João de Meriti", "Saquarema", "Teresópolis", "Três Rios", "Volta Redonda",
  
  // Minas Gerais
  "Araguari", "Barbacena", "Betim", "Conselheiro Lafaiete", "Contagem", "Coronel Fabriciano",
  "Divinópolis", "Governador Valadares", "Ibirité", "Ipatinga", "Itabira", "Itajubá",
  "Itaúna", "Juiz de Fora", "Lavras", "Montes Claros", "Muriaé", "Nova Lima", "Ouro Preto",
  "Pará de Minas", "Passos", "Patos de Minas", "Poços de Caldas", "Pouso Alegre",
  "Ribeirão das Neves", "Sabará", "Santa Luzia", "Sete Lagoas", "Teófilo Otoni",
  "Uberaba", "Uberlândia", "Varginha", "Vespasiano",
  
  // Bahia
  "Alagoinhas", "Barreiras", "Camaçari", "Candeias", "Eunápolis", "Feira de Santana",
  "Ilhéus", "Itabuna", "Jequié", "Juazeiro", "Lauro de Freitas", "Paulo Afonso",
  "Porto Seguro", "Santo Antônio de Jesus", "Simões Filho", "Teixeira de Freitas",
  "Vitória da Conquista",
  
  // Paraná
  "Almirante Tamandaré", "Apucarana", "Arapongas", "Araucária", "Cambé", "Cascavel",
  "Colombo", "Foz do Iguaçu", "Guarapuava", "Londrina", "Maringá", "Paranaguá",
  "Pinhais", "Ponta Grossa", "São José dos Pinhais", "Toledo", "Umuarama",
  
  // Rio Grande do Sul
  "Alvorada", "Bagé", "Bento Gonçalves", "Cachoeirinha", "Canoas", "Caxias do Sul",
  "Erechim", "Gravataí", "Novo Hamburgo", "Passo Fundo", "Pelotas", "Rio Grande",
  "Santa Cruz do Sul", "Santa Maria", "Santo Ângelo", "São Leopoldo", "Sapucaia do Sul",
  "Uruguaiana", "Viamão",
  
  // Santa Catarina
  "Balneário Camboriú", "Blumenau", "Brusque", "Chapecó", "Criciúma", "Itajaí",
  "Jaraguá do Sul", "Joinville", "Lages", "Palhoça", "São José", "Tubarão",
  
  // Pernambuco
  "Abreu e Lima", "Cabo de Santo Agostinho", "Camaragibe", "Caruaru", "Garanhuns",
  "Igarassu", "Jaboatão dos Guararapes", "Olinda", "Paulista", "Petrolina",
  "São Lourenço da Mata", "Vitória de Santo Antão",
  
  // Ceará
  "Caucaia", "Crato", "Itapipoca", "Juazeiro do Norte", "Maracanaú", "Maranguape",
  "Sobral",
  
  // Goiás
  "Águas Lindas de Goiás", "Anápolis", "Aparecida de Goiânia", "Catalão", "Formosa",
  "Itumbiara", "Luziânia", "Rio Verde", "Senador Canedo", "Trindade", "Valparaíso de Goiás",
  
  // Espírito Santo
  "Cachoeiro de Itapemirim", "Cariacica", "Colatina", "Guarapari", "Linhares",
  "Serra", "São Mateus", "Viana", "Vila Velha",
  
  // Pará
  "Abaetetuba", "Altamira", "Ananindeua", "Barcarena", "Bragança", "Castanhal",
  "Itaituba", "Marabá", "Marituba", "Parauapebas", "Santarém",
  
  // Maranhão
  "Açailândia", "Bacabal", "Caxias", "Codó", "Imperatriz", "Paço do Lumiar",
  "Santa Inês", "São José de Ribamar", "Timon",
  
  // Paraíba
  "Bayeux", "Cabedelo", "Campina Grande", "Patos", "Santa Rita",
  
  // Amazonas
  "Itacoatiara", "Manacapuru", "Parintins",
  
  // Mato Grosso
  "Rondonópolis", "Sinop", "Várzea Grande",
  
  // Mato Grosso do Sul
  "Corumbá", "Dourados", "Três Lagoas",
  
  // Alagoas
  "Arapiraca", "Rio Largo",
  
  // Sergipe
  "Itabaiana", "Lagarto", "Nossa Senhora do Socorro",
  
  // Rondônia
  "Ariquemes", "Cacoal", "Ji-Paraná", "Vilhena",
  
  // Piauí
  "Parnaíba", "Picos",
  
  // Tocantins
  "Araguaína", "Gurupi",
  
  // Acre
  "Cruzeiro do Sul",
  
  // Roraima
  "Rorainópolis",
  
  // Amapá
  "Santana"
].sort();

export default function NewTripPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<TripOption | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Estados para Travel Match
  const [matchForm, setMatchForm] = useState<TravelMatchForm>({
    departureCity: "",
    tripTypes: [],
    company: "",
    numberOfTravelers: 0,
    companions: [],
    destinationTypes: [],
    activities: [],
    beachActivities: [],
    seaTemperature: "",
    seaType: "",
    seaColor: "",
    accommodation: [],
    beachfront: "",
    travelDateType: "",
    departureDate: "",
    returnDate: "",
    month: "",
    monthDuration: null,
    budgetType: "total",
    budget: null,
  });

  // Estados para Já Sei
  const [knownForm, setKnownForm] = useState<KnownDestinationForm>({
    destinations: [],
    travelDate: "",
    duration: "",
    budget: null,
    budgetType: "total",
    travelers: "",
    activities: [],
  });

  // Estados para autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  const handleOptionSelect = (option: TripOption) => {
    setSelectedOption(option);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setSelectedOption(null);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTotalSteps = () => {
    if (selectedOption === "match") {
      const hasBeach = matchForm.destinationTypes.includes("Praia");
      // Base: 8 steps (Local, Tipo, Companhia, Pessoas, Destino, Atividades, Hospedagem, Orçamento)
      // Quando viajar: +1 step
      // Se mês: +1 step (duração)
      let total = 8;
      total += 1; // Quando viajar
      if (matchForm.travelDateType === "month") total += 1;
      return total;
    }
    return 6;
  };

  const handleNext = () => {
    if (selectedOption === "match") {
      const totalSteps = getTotalSteps();
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmitMatch();
      }
    } else {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmitKnown();
      }
    }
  };

  const handleSubmitMatch = () => {
    // Salvar dados no localStorage
    localStorage.setItem("travelMatchForm", JSON.stringify(matchForm));
    
    // Redirecionar para página de resultados da IA
    router.push("/ai-results");
  };

  const handleSubmitKnown = () => {
    console.log("Known Destination Form:", knownForm);
    localStorage.setItem("knownDestinationForm", JSON.stringify(knownForm));
    alert("Viagem criada com sucesso!");
    router.push("/");
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const isStepValid = () => {
    if (selectedOption === "match") {
      const hasBeach = matchForm.destinationTypes.includes("Praia");
      
      // Steps fixos (1-8): Local, Tipo Viagem, Companhia, Pessoas, Destino, Atividades, Hospedagem, Orçamento
      if (currentStep === 1) return matchForm.departureCity !== "";
      if (currentStep === 2) return matchForm.tripTypes.length > 0;
      if (currentStep === 3) return matchForm.company !== "";
      if (currentStep === 4) return matchForm.numberOfTravelers > 0;
      if (currentStep === 5) return matchForm.destinationTypes.length > 0;
      if (currentStep === 6) return matchForm.activities.length > 0;
      if (currentStep === 7) return matchForm.accommodation.length > 0;
      if (currentStep === 8) return matchForm.budget !== null && matchForm.budget > 0;
      
      // Step 9: Quando viajar
      if (currentStep === 9) {
        if (matchForm.travelDateType === "dates") {
          if (!matchForm.departureDate || !matchForm.returnDate) return false;
          return new Date(matchForm.departureDate) < new Date(matchForm.returnDate);
        }
        return matchForm.travelDateType === "month";
      }
      
      // Step 10: Duração (apenas se escolheu mês)
      if (currentStep === 10) {
        return matchForm.monthDuration !== null && matchForm.monthDuration > 0;
      }
      
      return false;
    } else {
      switch (currentStep) {
        case 1: return knownForm.destinations.length > 0;
        case 2: return knownForm.travelDate !== "";
        case 3: return knownForm.duration !== "";
        case 4: return knownForm.budget !== null && knownForm.budget > 0;
        case 5: return knownForm.travelers !== "";
        case 6: return knownForm.activities.length > 0;
        default: return false;
      }
    }
  };

  // Função para filtrar cidades baseado no input
  const handleCityInputChange = (value: string) => {
    setMatchForm({ ...matchForm, departureCity: value });
    
    if (value.length > 0) {
      const filtered = BRAZILIAN_CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredCities([]);
    }
  };

  // Função para selecionar uma cidade da lista
  const handleCitySelect = (city: string) => {
    setMatchForm({ ...matchForm, departureCity: city });
    setShowSuggestions(false);
    setFilteredCities([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                if (!selectedOption) {
                  router.push("/");
                } else {
                  handleBack();
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A6FF] to-blue-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00A6FF] to-blue-600 bg-clip-text text-transparent">
                FindMyTravel
              </h1>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedOption ? (
          // Tela de Seleção de Opção
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Como você quer planejar sua viagem?</h2>
              <p className="text-gray-600">Escolha a melhor opção para você</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opção 1: Travel Match */}
              <button
                onClick={() => handleOptionSelect("match")}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#00A6FF] hover:shadow-xl transition-all duration-300 text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Travel Match</h3>
                <p className="text-gray-600 mb-4">
                  Descubra o destino perfeito! Responda algumas perguntas e nossa IA encontrará os melhores lugares para você.
                </p>
                <div className="flex items-center gap-2 text-[#00A6FF] font-semibold">
                  <span>Começar</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Opção 2: Já Sei Para Onde Ir */}
              <button
                onClick={() => handleOptionSelect("known")}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#00A6FF] hover:shadow-xl transition-all duration-300 text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00A6FF] to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Já Sei Para Onde Ir</h3>
                <p className="text-gray-600 mb-4">
                  Você já tem um destino em mente? Vamos ajudar a planejar todos os detalhes da sua viagem.
                </p>
                <div className="flex items-center gap-2 text-[#00A6FF] font-semibold">
                  <span>Começar</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          // Formulário
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Passo {currentStep} de {getTotalSteps()}
                </span>
                <span className="text-sm font-medium text-[#00A6FF]">
                  {Math.round((currentStep / getTotalSteps()) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#00A6FF] to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {selectedOption === "match" ? (
                <TravelMatchStep
                  step={currentStep}
                  form={matchForm}
                  setForm={setMatchForm}
                  toggleArrayItem={toggleArrayItem}
                  showSuggestions={showSuggestions}
                  filteredCities={filteredCities}
                  handleCityInputChange={handleCityInputChange}
                  handleCitySelect={handleCitySelect}
                  setShowSuggestions={setShowSuggestions}
                />
              ) : (
                <KnownDestinationStep
                  step={currentStep}
                  form={knownForm}
                  setForm={setKnownForm}
                  toggleArrayItem={toggleArrayItem}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  isStepValid()
                    ? 'bg-gradient-to-r from-[#00A6FF] to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>{currentStep === getTotalSteps() ? "Finalizar" : "Próximo"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente para os passos do Travel Match
function TravelMatchStep({
  step,
  form,
  setForm,
  toggleArrayItem,
  showSuggestions,
  filteredCities,
  handleCityInputChange,
  handleCitySelect,
  setShowSuggestions,
}: {
  step: number;
  form: TravelMatchForm;
  setForm: (form: TravelMatchForm) => void;
  toggleArrayItem: (array: string[], item: string) => string[];
  showSuggestions: boolean;
  filteredCities: string[];
  handleCityInputChange: (value: string) => void;
  handleCitySelect: (city: string) => void;
  setShowSuggestions: (show: boolean) => void;
}) {
  const hasBeach = form.destinationTypes.includes("Praia");

  const tripTypes = [
    "Gastronômica", "Para descansar", "Em contato com a natureza", "De aventura",
    "Cultural", "Esportiva", "Com trilhas", "Urbana", "Romântica"
  ];

  const companyOptions = [
    "Em família", "Casal", "Com amigos", "Sozinho", "Quero conhecer pessoas"
  ];

  const destinationTypes = [
    "Praia", "Montanha", "Neve", "Campo", "Cidade grande", "Cidade do interior"
  ];

  const activities = [
    "Nadar", "Descansar", "Praticar esportes", "Fazer passeios turísticos",
    "Ler", "Comer e beber", "Atividades ao ar livre", "Passeios culturais",
    "Conhecer pontos turísticos", "Tirar fotos"
  ];

  const beachActivities = [
    "Entrar no mar", "Relaxar na areia", "Esportes aquáticos",
    "Passeios de barco", "Comer e beber", "Curtir festas e Beach Clubs", "Ler e relaxar", "Ver o Sunset"
  ];

  const seaTemperatures = ["Mar quente", "Mar frio", "Temperatura não importa"];
  const seaTypes = ["Com ondas", "Sem ondas", "Tanto faz"];
  const seaColors = ["Azul turquesa", "Verde", "Cor não importa"];

  const accommodations = [
    "Hotel de luxo", "Pousada charmosa", "Resort all inclusive", "Resort",
    "Casa de temporada", "Hostel", "Hotel bom e econômico", "Hotel barato"
  ];

  const beachfrontOptions = ["Sim", "Não", "Não é essencial, mas seria legal"];

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const relations = [
    "Esposa/Marido", "Filho(a)", "Amigo(a)", "Mãe/Pai", "Irmão/Irmã", "Outro"
  ];

  const hasDateError = () => {
    if (form.travelDateType === "dates" && form.departureDate && form.returnDate) {
      return new Date(form.returnDate) <= new Date(form.departureDate);
    }
    return false;
  };

  const calculateTotalBudget = () => {
    if (form.budgetType === "per-person" && form.budget && form.numberOfTravelers > 0) {
      return form.budget * form.numberOfTravelers;
    }
    return null;
  };

  // Função para formatar valor em moeda brasileira
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Função para lidar com input de moeda
  const handleCurrencyInput = (value: string) => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') {
      setForm({ ...form, budget: null });
      return '';
    }
    
    // Converte para número (divide por 100 para considerar centavos)
    const numberValue = parseInt(numericValue) / 100;
    setForm({ ...form, budget: numberValue });
    
    // Retorna formatado
    return formatCurrency(numberValue);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Local de partida</h2>
            <p className="text-gray-600">Digite a cidade de partida</p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={form.departureCity}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onFocus={() => {
                if (form.departureCity.length > 0 && filteredCities.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Digite sua cidade"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
              autoComplete="off"
            />
            
            {showSuggestions && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-[#00A6FF] transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tipo de viagem</h2>
            <p className="text-gray-600">Que tipo de viagem você quer fazer? (pode escolher vários)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tripTypes.map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, tripTypes: toggleArrayItem(form.tripTypes, type) })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.tripTypes.includes(type)
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Companhia</h2>
            <p className="text-gray-600">Com quem você vai viajar?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyOptions.map((option) => (
              <button
                key={option}
                onClick={() => setForm({ ...form, company: option })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.company === option
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Companheiros de viagem</h2>
            <p className="text-gray-600">Quantas pessoas irão viajar?</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de pessoas (incluindo você) *
              </label>
              <input
                type="number"
                min="1"
                value={form.numberOfTravelers || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setForm({ ...form, numberOfTravelers: value });
                }}
                placeholder="Digite o número de pessoas"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
              />
              {form.numberOfTravelers <= 0 && (
                <p className="text-sm text-red-600 mt-1">O número de pessoas deve ser maior que 0</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Detalhes dos companheiros (opcional)
              </p>
              
              {form.companions.map((companion, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg mb-3">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={companion.name}
                      onChange={(e) => {
                        const newCompanions = [...form.companions];
                        newCompanions[index].name = e.target.value;
                        setForm({ ...form, companions: newCompanions });
                      }}
                      placeholder="Nome"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                    />
                    <select
                      value={companion.relation}
                      onChange={(e) => {
                        const newCompanions = [...form.companions];
                        newCompanions[index].relation = e.target.value;
                        setForm({ ...form, companions: newCompanions });
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                    >
                      <option value="">Selecione a relação</option>
                      {relations.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const newCompanions = form.companions.filter((_, i) => i !== index);
                      setForm({ ...form, companions: newCompanions });
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}

              <button
                onClick={() => setForm({ ...form, companions: [...form.companions, { name: "", relation: "" }] })}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#00A6FF] hover:text-[#00A6FF] transition-colors"
              >
                + Adicionar detalhes de companheiro
              </button>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tipo de destino</h2>
            <p className="text-gray-600">Que tipo de destino você prefere? (escolha apenas 1)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {destinationTypes.map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, destinationTypes: [type] })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.destinationTypes.includes(type)
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividades favoritas</h2>
            <p className="text-gray-600">O que você mais gosta de fazer em uma viagem? (pode escolher vários)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => setForm({ ...form, activities: toggleArrayItem(form.activities, activity) })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.activities.includes(activity)
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tipo de hospedagem</h2>
            <p className="text-gray-600">Que tipo de hospedagem você prefere?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accommodations.map((acc) => (
              <button
                key={acc}
                onClick={() => setForm({ ...form, accommodation: [acc] })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.accommodation.includes(acc)
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>
      );

    case 8:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Orçamento da viagem</h2>
            <p className="text-gray-600">Qual é o valor máximo que você pretende gastar?</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">O orçamento é:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForm({ ...form, budgetType: "total" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    form.budgetType === "total"
                      ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Valor total da viagem
                </button>
                <button
                  onClick={() => setForm({ ...form, budgetType: "per-person" })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    form.budgetType === "per-person"
                      ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Valor por pessoa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor máximo *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <input
                  type="text"
                  value={form.budget !== null ? formatCurrency(form.budget) : ''}
                  onChange={(e) => {
                    const formatted = handleCurrencyInput(e.target.value);
                    e.target.value = formatted;
                  }}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                />
              </div>
              {form.budget !== null && form.budget <= 0 && (
                <p className="text-sm text-red-600 mt-1">O valor deve ser maior que 0</p>
              )}
            </div>

            {form.budgetType === "per-person" && form.budget && form.budget > 0 && form.numberOfTravelers > 0 && (
              <div className="p-4 bg-blue-50 border-2 border-[#00A6FF] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Valor total da viagem:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {form.numberOfTravelers} {form.numberOfTravelers === 1 ? 'pessoa' : 'pessoas'} × R$ {formatCurrency(form.budget)}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#00A6FF]">
                    R$ {formatCurrency(calculateTotalBudget() || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 9:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quando você quer viajar?</h2>
            <p className="text-gray-600">Escolha como prefere informar a data da viagem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setForm({ ...form, travelDateType: "dates", month: "", monthDuration: null })}
              className={`p-6 rounded-lg border-2 transition-all ${
                form.travelDateType === "dates"
                  ? 'border-[#00A6FF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className={`w-6 h-6 ${form.travelDateType === "dates" ? 'text-[#00A6FF]' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${form.travelDateType === "dates" ? 'text-[#00A6FF]' : 'text-gray-700'}`}>
                  Datas específicas
                </h3>
              </div>
              <p className="text-sm text-gray-600">Selecione data de ida e volta</p>
            </button>

            <button
              onClick={() => setForm({ ...form, travelDateType: "month", departureDate: "", returnDate: "" })}
              className={`p-6 rounded-lg border-2 transition-all ${
                form.travelDateType === "month"
                  ? 'border-[#00A6FF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className={`w-6 h-6 ${form.travelDateType === "month" ? 'text-[#00A6FF]' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${form.travelDateType === "month" ? 'text-[#00A6FF]' : 'text-gray-700'}`}>
                  Apenas o mês
                </h3>
              </div>
              <p className="text-sm text-gray-600">Escolha o mês da viagem</p>
            </button>
          </div>

          {form.travelDateType === "dates" && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de ida
                </label>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de volta
                </label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                />
              </div>

              {hasDateError() && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Data inválida</p>
                    <p className="text-sm text-red-600 mt-1">
                      A data de volta deve ser posterior à data de ida. Por favor, ajuste as datas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {form.travelDateType === "month" && (
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione o mês (opcional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => setForm({ ...form, month })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      form.month === month
                        ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 10:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Duração da viagem</h2>
            <p className="text-gray-600">Por quantos dias você pretende viajar{form.month ? ` em ${form.month}` : ''}?</p>
          </div>
          <div>
            <input
              type="number"
              min="1"
              max="30"
              value={form.monthDuration || ""}
              onChange={(e) => setForm({ ...form, monthDuration: parseInt(e.target.value) || null })}
              placeholder="Número de dias (1-30)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Componente para os passos do Já Sei Para Onde Ir
function KnownDestinationStep({
  step,
  form,
  setForm,
  toggleArrayItem,
}: {
  step: number;
  form: KnownDestinationForm;
  setForm: (form: KnownDestinationForm) => void;
  toggleArrayItem: (array: string[], item: string) => string[];
}) {
  const [destinationInput, setDestinationInput] = useState("");

  const activities = [
    "Aventuras ao ar livre",
    "Festivais / eventos",
    "Gastronomia / experiências culinárias",
    "Vida noturna",
    "Compras",
    "Bem-estar e spa"
  ];

  const durations = [
    "Final de semana (2 a 3 dias)", "3 a 5 dias", "7 dias", "Mais de 10 dias"
  ];

  const travelerCounts = ["1", "2", "3 a 5", "6 ou mais"];

  const handleAddDestination = () => {
    if (destinationInput.trim()) {
      setForm({ ...form, destinations: [...form.destinations, destinationInput.trim()] });
      setDestinationInput("");
    }
  };

  const handleRemoveDestination = (index: number) => {
    setForm({ ...form, destinations: form.destinations.filter((_, i) => i !== index) });
  };

  // Função para formatar valor em moeda brasileira
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Função para lidar com input de moeda
  const handleCurrencyInput = (value: string) => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') {
      setForm({ ...form, budget: null });
      return '';
    }
    
    // Converte para número (divide por 100 para considerar centavos)
    const numberValue = parseInt(numericValue) / 100;
    setForm({ ...form, budget: numberValue });
    
    // Retorna formatado
    return formatCurrency(numberValue);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Destino desejado</h2>
            <p className="text-gray-600">Qual é o destino? (você pode adicionar mais de um)</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDestination()}
                placeholder="Digite o destino"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
              />
              <button
                onClick={handleAddDestination}
                className="px-6 py-3 bg-[#00A6FF] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>

            {form.destinations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Destinos adicionados:</p>
                <div className="flex flex-wrap gap-2">
                  {form.destinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#00A6FF] rounded-lg border-2 border-[#00A6FF]"
                    >
                      <span>{dest}</span>
                      <button
                        onClick={() => handleRemoveDestination(index)}
                        className="text-[#00A6FF] hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data da viagem</h2>
            <p className="text-gray-600">Quando você pretende viajar?</p>
          </div>
          <div>
            <input
              type="date"
              value={form.travelDate}
              onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
            />
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Duração da viagem</h2>
            <p className="text-gray-600">Por quantos dias você pretende viajar?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setForm({ ...form, duration })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.duration === duration
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Orçamento</h2>
            <p className="text-gray-600">Qual o orçamento da viagem?</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setForm({ ...form, budgetType: "per-person" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  form.budgetType === "per-person"
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Por pessoa
              </button>
              <button
                onClick={() => setForm({ ...form, budgetType: "total" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  form.budgetType === "total"
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Total do grupo
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor em R$
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <input
                  type="text"
                  value={form.budget !== null ? formatCurrency(form.budget) : ''}
                  onChange={(e) => {
                    const formatted = handleCurrencyInput(e.target.value);
                    e.target.value = formatted;
                  }}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A6FF] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Número de pessoas</h2>
            <p className="text-gray-600">Quantas pessoas irão viajar?</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {travelerCounts.map((count) => (
              <button
                key={count}
                onClick={() => setForm({ ...form, travelers: count })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.travelers === count
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividades de interesse</h2>
            <p className="text-gray-600">Quais atividades você tem interesse?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => setForm({ ...form, activities: toggleArrayItem(form.activities, activity) })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  form.activities.includes(activity)
                    ? 'border-[#00A6FF] bg-blue-50 text-[#00A6FF] font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
