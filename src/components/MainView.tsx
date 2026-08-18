/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Flame,
  Search,
  Bookmark,
  Filter,
  CheckCircle,
  LogOut,
  Shield,
  BookOpen,
  Info,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Globe,
  Network,
  ArrowRight,
  Database,
  GitBranch,
  Cpu,
  Calendar,
  Map,
  X,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Tab, User, HistoryCard, Screen, KGNode, KGRelationship, EntityType, EvidenceLevel, DossierRequest } from '../types';
import ConceptCard from './ConceptCard';
import BottomNav from './BottomNav';
import AdminPanel from './AdminPanel';
import GeographicMapView from './GeographicMapView';
import { getGeoMapDataForTopic } from '../data/geographicCoordinates';
import { CHRONOSKnowledgeEngine } from '../lib/knowledgeGraphEngine';
import { getSpecificMythologySection } from '../data/mythologyData';
import { TIMELINE_STEPS, mockCards } from '../data/mockData';
import { saveCardToSupabase, deleteCardFromSupabase, loadCardsFromSupabase, migrateLocalStorageToSupabase, migrateMockDataToSupabase } from '../lib/supabaseSync';

// Instantiate the singleton Knowledge Graph engine
const kgEngine = new CHRONOSKnowledgeEngine();

const ENTITY_TYPE_TRANSLATIONS: Record<EntityType, string> = {
  PERSONAGEM: 'Personagem',
  EVENTO: 'Evento',
  CIVILIZACAO: 'Civilização',
  IMPERIO: 'Império',
  GUERRA: 'Guerra',
  TRATADO: 'Tratado',
  PAIS: 'País',
  CIDADE: 'Cidade',
  RELIGIAO: 'Religião',
  FILOSOFIA: 'Filosofia',
  MOVIMENTO: 'Movimento',
  TECNOLOGIA: 'Tecnologia',
  OBJETO_HISTORICO: 'Objeto Histórico',
  CONSTRUCAO: 'Construção',
  LIVRO: 'Livro',
  DOCUMENTO: 'Documento',
  FONTE: 'Fonte',
  AUTOR: 'Autor',
  DESCOBERTA: 'Descoberta',
  DATA: 'Data',
  PERIODO_HISTORICO: 'Período Histórico',
  MITOLOGIA: 'Mitologia',
  DEUS: 'Deus',
  CRIATURA_MITOLOGICA: 'Criatura Mitológica',
  ARTEFATO_MITOLOGICO: 'Artefato Mitológico'
};

const RELATIONSHIP_TYPE_TRANSLATIONS: Record<string, string> = {
  PARTICIPATED_IN: 'Participou de',
  OCCURRED_IN: 'Ocorreu em',
  BELONGS_TO: 'Pertence a',
  PART_OF_CIVILIZATION: 'Faz parte da civilização',
  HAS_BATTLE: 'Possui batalha',
  CITES_DOCUMENT: 'Cita documento',
  PROVES_EVENT: 'Comprova evento',
  WROTE_BOOK: 'Escreveu livro',
  REFERENCES_THEME: 'Referencia tema',
  INFLUENCED: 'Influenciou',
  RULED_EMPIRE: 'Governou império',
  CREATED_TECH: 'Criou tecnologia/descoberta',
  CONSTRUCTED_BY: 'Erguido por',
  LOCATED_AT: 'Localizado em',
  TEMPORAL_ANCHOR: 'Ancorado temporalmente em',
  BELONGS_TO_MYTHOLOGY: 'Pertence à mitologia',
  ASSOCIATED_WITH: 'Associado com'
};

interface MapDetail {
  title: string;
  locations: string[];
  description: string;
  routes: string[];
}

const MAP_DETAILS_REGISTRY: Record<string, MapDetail> = {
  'sumeria': {
    title: 'Crescente Fértil & Vale do Nilo',
    locations: ['Uruk', 'Ur', 'Nipur', 'Tinis', 'Mênfis'],
    description: 'Os vales dos rios Tigre, Eufrates e Nilo serviram de berço para as primeiras grandes aglomerações e impérios unificados da Antiguidade Oriental.',
    routes: ['Rotas fluviais de cevada', 'Comércio de cobre do Sinai', 'Madeira de cedro do Líbano']
  },
  'hamurabi': {
    title: 'Império Paleobabilônico e Mesopotâmia Central',
    locations: ['Babilônia', 'Susa', 'Larsa', 'Eshnunna'],
    description: 'A unificação da Babilônia sob Hamurabi estabeleceu o centro normativo e legislativo do Oriente Próximo antigo.',
    routes: ['Estradas reais de mensageiros', 'Canais de irrigação do Eufrates']
  },
  'guerras-medicas': {
    title: 'Grécia Clássica e a Invasão do Império Persa',
    locations: ['Atenas', 'Esparta', 'Maratona', 'Termópilas', 'Salamina', 'Persépolis'],
    description: 'O confronto épico entre a aliança de cidades-estado gregas e o vasto Império Persa de Dário I e Xerxes I.',
    routes: ['Rotas navais do Mar Egeu', 'Caminho Real Persa (Susa-Sardes)']
  },
  'guerras-punicas': {
    title: 'A Disputa do Mediterrâneo entre Roma e Cartago',
    locations: ['Roma', 'Cartago', 'Sicília', 'Cannas', 'Zama', 'Sagunto'],
    description: 'As três guerras Púnicas que destruíram Cartago e transformaram Roma na senhora soberana do Mare Nostrum.',
    routes: ['Marcha Transalpina de Aníbal Barca', 'Rotas de suprimento naval romano']
  },
  'cruzadas': {
    title: 'A Terra Santa e a Bacia do Mediterrâneo',
    locations: ['Jerusalém', 'Constantinopla', 'Antioquia', 'Roma', 'Acre'],
    description: 'A mobilização da cristandade europeia rumo ao Levante e os choques contra o mundo islâmico.',
    routes: ['Rotas marítimas genovesas e venezianas', 'Caminho terrestre dos Peregrinos']
  },
  'guerra-cem-anos': {
    title: 'Reinos da França e Inglaterra no Fim da Idade Média',
    locations: ['Paris', 'Londres', 'Orléans', 'Crécy', 'Azincourt', 'Castillon'],
    description: 'O longo conflito pela sucessão da coroa francesa, transformando exércitos e armas medievais.',
    routes: ['Eixo do Canal da Mancha', 'Caminhos militares de Flandres']
  },
  'guerras-napoleonicas': {
    title: 'O Império Francês e a Europa Napoleônica',
    locations: ['Paris', 'Londres', 'Austerlitz', 'Moscou', 'Waterloo', 'Lisboa'],
    description: 'A expansão militar de Napoleão Bonaparte, o Bloqueio Continental e a fuga da Corte Portuguesa para o Brasil.',
    routes: ['Linha de navegação do Bloqueio Continental', 'Rota da Transmigração da Família Real para o Brasil']
  },
  'guerra-do-paraguai': {
    title: 'Teatro de Operações da Bacia do Rio da Prata',
    locations: ['Assunção', 'Rio de Janeiro', 'Humaitá', 'Tuiuti', 'Cerro Corá'],
    description: 'O maior conflito militar da América do Sul entre o Paraguai e a Tríplice Aliança (Brasil, Argentina, Uruguai).',
    routes: ['Hidrovia dos Rios Paraná e Paraguai', 'Eixo de navegação da Marinha Imperial']
  },
  'guerra-canudos': {
    title: 'O Sertão Baiano e o Arraial de Belo Monte',
    locations: ['Canudos (Belo Monte)', 'Juazeiro', 'Salvador', 'Rio de Janeiro'],
    description: 'O levante messiânico dos sertanejos fiéis a Antônio Conselheiro e a brutal campanha militar de destruição.',
    routes: ['Trilhas da caatinga sertaneja', 'Estrada de ferro Bahia a São Francisco']
  },
  'guerra-civil-espanhola': {
    title: 'Espanha Dividida e o Conflito Ideológico',
    locations: ['Madri', 'Barcelona', 'Guernica', 'Sevilha', 'Valência'],
    description: 'O confronto trágico entre Republicanos e as forças franquistas apoiadas pelas potências fascistas.',
    routes: ['Linha de comboios das Brigadas Internacionais', 'Rotas de apoio aéreo da Legião Condor']
  },
  'guerra-fria-conflitos': {
    title: 'Conflitos Indiretos e a Bipolaridade Global',
    locations: ['Washington', 'Moscou', 'Havana', 'Seul', 'Hanói', 'Berlim'],
    description: 'As guerras por procuração e os pontos de tensão entre as superpotências durante a Guerra Fria.',
    routes: ['Linhas de suprimento da OTAN e do Pacto de Varsóvia']
  },
  'feb-segunda-guerra': {
    title: 'A Frente Italiana e o Avanço da FEB',
    locations: ['Monte Castello', 'Castelnuovo', 'Pisa', 'Fornovo di Taro', 'Rio de Janeiro'],
    description: 'A bravura dos pracinhas brasileiros na tomada das posições alemãs na Linha Gótica em solo italiano.',
    routes: ['Rota marítima dos comboios de tropas do Rio a Nápoles']
  },
  'grecia-classica': {
    title: 'Hélade Clássica e Cidades-Estado',
    locations: ['Atenas', 'Esparta', 'Tebas', 'Mileto', 'Siracusa'],
    description: 'A bacia do Mar Egeu conectava centenas de cidades-estado independentes (póleis) que compartilhavam o mesmo universo cultural e religioso.',
    routes: ['Importação de grãos do Mar Negro', 'Metais preciosos de Láurion', 'Exportação de cerâmicas e azeite']
  },
  'alexandria': {
    title: 'Mundo Helenístico e Bacia do Mediterrâneo Oriental',
    locations: ['Alexandria', 'Pérgamo', 'Antioquia', 'Atenas', 'Rodes'],
    description: 'O Império Ptolomaico converteu Alexandria no maior porto cultural e científico do mundo antigo.',
    routes: ['Rota marítima do Nilo', 'Caravanas de papiro e especiarias']
  },
  'roma-republica': {
    title: 'Expansão do Império e Províncias Romanas',
    locations: ['Roma', 'Cartago', 'Alexandria', 'Antioquia', 'Gália'],
    description: 'Com a anexação total do Mediterrâneo ("Mare Nostrum"), as estradas de paralelepípedos e as frotas de galés unificaram o comércio e a força militar de três continentes.',
    routes: ['Via Ápia e Via Flamínia', 'Rotas de grãos de Alexandria', 'Cursus Publicus']
  },
  'queda-roma': {
    title: 'Fragmentação da Europa e Reinos Germânicos',
    locations: ['Ravena', 'Constantinopla', 'Roma', 'Cartago', 'Alexandria'],
    description: 'Após a deposição de Rômulo Augusto, o controle ocidental fragmentou-se em feudos e monarquias germânicas independentes.',
    routes: ['Estradas comerciais terrestres bizantinas', 'Rotas marítimas reduzidas']
  },
  'reiartur': {
    title: 'Bretanha Pós-Romana e Reinos Célticos',
    locations: ['Tintagel', 'Badon', 'Glastonbury', 'Londínio'],
    description: 'A resistência dos britões romano-célticos contra os invasores anglo-saxões moldou as lendas heroicas da Távola Redonda.',
    routes: ['Estradas de pedra romanas remanescentes', 'Rotas de cabotagem no Canal da Mancha']
  },
  'islamismo': {
    title: 'Península Arábica e Califado Omeia/Abássida',
    locations: ['Meca', 'Medina', 'Damasco', 'Bagdá', 'Córdoba'],
    description: 'A expansão islâmica a partir da Hégira unificou o comércio do Atlântico à Índia e preservou a ciência clássica.',
    routes: ['Caravanas do Incenso', 'Rotas marítimas do Oceano Índico', 'Caminho de Santiago e Al-Andalus']
  },
  'constantinopla': {
    title: 'Império Bizantino e o Cerco Otomano',
    locations: ['Constantinopla', 'Edirne', 'Mistra', 'Trebizonda'],
    description: 'A queda do Bósforo sob Mehmed II encerrou o Império Romano do Oriente e precipitou as navegações atlânticas.',
    routes: ['Rota da Seda', 'Estreitos de Bósforo e Dardanelos']
  },
  'tordesilhas': {
    title: 'Partição de Tordesilhas e Rotas Marítimas Globais',
    locations: ['Lisboa', 'Sevilha', 'Tenochtitlán', 'Cusco', 'Salvador'],
    description: 'O Tratado de Tordesilhas dividiu o planeta em hemisférios ibéricos de controle marítimo.',
    routes: ['Rota das Naus da Índia', 'Eixo comercial Sevilha-Antilhas', 'Rotas do Atlântico Sul']
  },
  'brasil-colonial': {
    title: 'América Portuguesa e Economia Açucareira',
    locations: ['Salvador', 'Olinda', 'Porto Seguro', 'Rio de Janeiro'],
    description: 'A costa brasileira tornou-se o centro produtor de açúcar da Coroa portuguesa com trabalho escravizado.',
    routes: ['Rota Triangular Transatlântica', 'Caminho do Ouro e Trilhas Paulistas']
  },
  'reforma-protestante': {
    title: 'Europa da Reforma e Guerras de Religião',
    locations: ['Wittenberg', 'Genebra', 'Zurique', 'Roma', 'Augsburgo'],
    description: 'As 95 Teses de Lutero quebraram a hegemonia católica e deram origem a novas denominações cristãs.',
    routes: ['Eixos de distribuição de imprensa de Gutenberg', 'Rotas mercantes da Liga Hanseática']
  },
  'revolucao-industrial': {
    title: 'Grã-Bretanha e a Bacia do Carvão',
    locations: ['Manchester', 'Birmingham', 'Londres', 'Liverpool'],
    description: 'A mecanização a vapor e o tear mecânico transformaram as relações de trabalho e o capitalismo global.',
    routes: ['Rede de canais fluviais britânicos', 'Primeiras ferrovias de locomotivas']
  },
  'revolucao-francesa': {
    title: 'Europa Revolucionária e Focos Iluministas',
    locations: ['Paris', 'Londres', 'Viena', 'Berlim', 'Vila Rica (Ouro Preto)'],
    description: 'O colapso da Bastilha na França gerou uma onda de choque que redefiniu as fronteiras e estruturas absolutistas da Europa.',
    routes: ['Eixos de correio diplomático e jornais', 'Rotas de panfletos intelectuais']
  },
  'brasil-imperio': {
    title: 'Império do Brasil e Café com Leite',
    locations: ['Rio de Janeiro', 'São Paulo', 'Recife', 'Salvador'],
    description: 'O processo de Independência e o Reinado de D. Pedro II consolidaram a unidade territorial brasileira.',
    routes: ['Ferrovias do Café no Vale do Paraíba', 'Rotas de navegação a vapor costeiras']
  },
  'primeira-guerra-russa': {
    title: 'Europa em Guerra e Império Russo em Revolução',
    locations: ['Petrogrado', 'Berlim', 'Paris', 'Viena', 'Moscou'],
    description: 'As trincheiras da Grande Guerra e a Queda do Czarismo implantaram o primeiro Estado socialista do mundo.',
    routes: ['Ferrovia Transiberiana', 'Eixos de suprimentos da Entente']
  },
  'era-vargas': {
    title: 'Brasil na Era Vargas e Industrialização',
    locations: ['Rio de Janeiro', 'São Paulo', 'Volta Redonda', 'Porto Alegre'],
    description: 'A Revolução de 1930 e o Estado Novo criaram a legislação trabalhista (CLT) e a indústria de base no Brasil.',
    routes: ['Central do Brasil', 'Rodovias estaduais nascentes']
  },
  'segunda-guerra-holocausto': {
    title: 'Teatro de Operações Global da Segunda Guerra Mundial',
    locations: ['Berlim', 'Auschwitz', 'Stalingrado', 'Normandia', 'Tóquio'],
    description: 'O maior conflito militar da história humana, marcado pela derrota do nazifascismo e a tragédia do Holocausto.',
    routes: ['Eixos de suprimentos Aliados', 'Rotas de comboios do Atlântico Norte']
  },
  'ditadura-militar-brasil': {
    title: 'Brasil sob Regime Militar e Redemocratização',
    locations: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Araguaia'],
    description: 'Vinte e um anos de regime de exceção militar seguidos pela campanha das Diretas Já e a Constituição de 1988.',
    routes: ['Rodovia Transamazônica', 'Malha rodoviária federal BR-116']
  },
  'pouso-lua': {
    title: 'Ordem Geopolítica Bipolar da Guerra Fria',
    locations: ['Washington', 'Moscou', 'Houston', 'Baikonur', 'Hanói'],
    description: 'A divisão militar e ideológica entre EUA e URSS culminou na corrida espacial e no pouso da Apollo 11.',
    routes: ['Órbitas aeroespaciais primárias', 'Rede de telecomunicação por satélite']
  },
  'rota-da-seda-imperio-mongol': {
    title: 'Rota da Seda e a Expansão do Império Mongol',
    locations: ['Karakorum', 'Chang’an', 'Samarcanda', 'Bagdá', 'Pequim', 'Cafa'],
    description: 'A teia de rotas caravaneiras conectando a Ásia Oriental ao Mediterrâneo, unificada sob a Pax Mongolica de Gengis Khan e Kublai Khan.',
    routes: ['Rota da Seda do Norte', 'Rota da Seda Marítima', 'Caminhos de Correio Imperial Yam']
  },
  'restauracao-meiji-japao': {
    title: 'O Japão da Era Meiji e a Modernização Industrial',
    locations: ['Tóquio (Edo)', 'Quioto', 'Yokohama', 'Satsuma', 'Choshu'],
    description: 'A transição do isolamento feudal do Xogunato Tokugawa (Bakumatsu) para um império moderno industrializado.',
    routes: ['Linha Férrea Tóquio-Yokohama', 'Rotas Marítimas do Comércio de Seda e Carvão']
  },
  'independencia-eua-1776': {
    title: 'As Treze Colônias e a Revolução Americana',
    locations: ['Filadélfia', 'Boston', 'Nova York', 'Yorktown', 'Lexington'],
    description: 'O teatro de operações da Guerra de Independência Americana e os focos de debate Iluminista das Treze Colônias.',
    routes: ['Linha Marítima de Suprimentos Franceses', 'Caminho de Correios de Benjamin Franklin']
  },
  'guerra-fria-queda-muro-berlim': {
    title: 'Guerra Fria, Berlim Dividida e a Bipolaridade',
    locations: ['Berlim', 'Washington', 'Moscou', 'Havana', 'Praga', 'Pequim'],
    description: 'A Cortina de Ferro na Europa, a divisão de Berlim e os pontos de inflexão diplomática e militar entre as superpotências.',
    routes: ['Ponte Aérea de Berlim', 'Linha Vermelha de Comunicação Direta Washington-Moscou']
  },
  'descolonizacao-africa-asia': {
    title: 'A Luta pela Independência na África, Ásia e Fim do Apartheid',
    locations: ['Nova Déli', 'Joanesburgo', 'Pretória', 'Argel', 'Acra', 'Túnis'],
    description: 'O desmantelamento dos impérios coloniais europeus na África e na Ásia e a vitoriosa resistência ao Apartheid.',
    routes: ['Rotas do Movimento dos Não-Alinhados', 'Eixo da Marcha do Sal em Dandi']
  },
  'direitos-civis-eua-1960': {
    title: 'O Movimento dos Direitos Civis nos Estados Unidos',
    locations: ['Washington D.C.', 'Montgomery', 'Selma', 'Birmingham', 'Atlanta'],
    description: 'Os eixos de marchas pacíficas e protestos constitutivos contra as leis de segregação racial Jim Crow.',
    routes: ['Rota da Marcha de Selma a Montgomery', 'Itinerário dos Passageiros da Liberdade (Freedom Riders)']
  },
  'mitologia-nordica': {
    title: 'Cosmologia dos Nove Reinos de Yggdrasil',
    locations: ['Asgard', 'Midgard', 'Jötunheimr', 'Niflheim', 'Valhalla'],
    description: 'A tradição mítica nórdica descreve a criação do mundo a partir do abismo Ginnungagap e o fatídico Ragnarök.',
    routes: ['Ponte de Arco-Íris Bifröst', 'Navio de unhas Naglfar']
  },
  'mitologia-mesoamericana': {
    title: 'Territórios Sagrados da Mesoamérica e dos Andes',
    locations: ['Tenochtitlán', 'Tikal', 'Cusco', 'Teotihuacán'],
    description: 'A visão cosmológica maia, asteca e inca unia o milho sagrado, rituais solares e a divindade Quetzalcóatl.',
    routes: ['Caminhos do Inca (Qhapaq Ñan)', 'Canais fluviais de Chinampas']
  }
};

interface MeanwhileDetails {
  inicio: string;
  detalhes: string;
  termino: string;
  dossierId?: string;
  dossierTitle?: string;
}

const MEANWHILE_REGISTRY: Record<string, MeanwhileDetails> = {
  'Brasil: Surto de industrialização por substituição de importações e Guerra do Contestado': {
    inicio: 'Com a eclosão da Primeira Guerra Mundial (1914), as importações brasileiras de bens manufaturados europeus despencaram, forçando o capital produtivo interno a suprir o mercado nacional (Substituição de Importações). Paralelamente, no Sul, a construção da ferrovia Brazil Railway expropriou milhares de camponeses na fronteira entre Paraná e Santa Catarina.',
    detalhes: 'O surto industrial acelerou a expansão fabril e o movimento operário em São Paulo e no Rio de Janeiro. No interior, a Guerra do Contestado (1912-1916) uniu milhares de camponeses seguidores dos monges João Maria e José Maria em "redutos comunitários" autônomos com forte religiosidade popular, resistindo aos grandes coronéis latifundiários e às forças policiais.',
    termino: 'A Guerra do Contestado encerrou-se em 1916 após uma violenta ofensiva do Exército Brasileiro que dizimou os redutos rurais com uso inédito de aviação militar e artilharia pesada (com mais de 10.000 mortos). Já o surto industrial impulsionou a Greve Geral de 1917 e redefiniu a economia urbana do Brasil.'
  },
  'Surto de industrialização por substituição de importações e Guerra do Contestado': {
    inicio: 'Com a eclosão da Primeira Guerra Mundial (1914), as importações brasileiras de bens manufaturados europeus despencaram, forçando o capital produtivo interno a suprir o mercado nacional (Substituição de Importações). Paralelamente, no Sul, a construção da ferrovia Brazil Railway expropriou milhares de camponeses na fronteira entre Paraná e Santa Catarina.',
    detalhes: 'O surto industrial acelerou a expansão fabril e o movimento operário em São Paulo e no Rio de Janeiro. No interior, a Guerra do Contestado (1912-1916) uniu milhares de camponeses seguidores dos monges João Maria e José Maria em "redutos comunitários" autônomos com forte religiosidade popular, resistindo aos grandes coronéis latifundiários e às forças policiais.',
    termino: 'A Guerra do Contestado encerrou-se em 1916 após uma violenta ofensiva do Exército Brasileiro que dizimou os redutos rurais com uso inédito de aviação militar e artilharia pesada (com mais de 10.000 mortos). Já o surto industrial impulsionou a Greve Geral de 1917 e redefiniu a economia urbana do Brasil.'
  },
  'Envio da Força Expedicionária Brasileira (FEB) para combater na Itália': {
    inicio: 'Após o afundamento brutal de diversos navios mercantes brasileiros por submarinos alemães no Atlântico Sul em 1942, o governo brasileiro declarou guerra ao Eixo e organizou a FEB.',
    detalhes: 'Cerca de 25.000 soldados brasileiros ("pracinhas") e aviadores do 1º Grupo de Caça atuaram na Frente Italiana sob condições extremas de inverno. A FEB conquistou posições defensivas alemãs estratégicas na Linha Gótica, como a vitória decisiva em Monte Castello e Castelnuovo.',
    termino: 'A FEB garantiu a rendição incondicional da 148ª Divisão Alemã em Fornovo di Taro (abril de 1945). O retorno vitorioso dos veteranos expôs a contradição de combater regimes autoritários fora do país, acelerando o fim do Estado Novo de Getúlio Vargas.',
    dossierId: 'feb-segunda-guerra',
    dossierTitle: 'A FEB na Segunda Guerra Mundial (1944 – 1945)'
  },
  'Conspiração da Inconfidência Mineira liderada por Tiradentes': {
    inicio: 'A decadência da mineração de ouro nas Gerais aliada à iminente decretação da "Derrama" (cobrança compulsória de impostos atrasados) pela Coroa Portuguesa indignou a elite letrada e militar da capitania em 1789.',
    detalhes: 'Inspirados pelos ideais iluministas e pela Independência dos Estados Unidos, intelectuais, poetas e militares como Cláudio Manuel da Costa, Tomás Antônio Gonzaga e Joaquim José da Silva Xavier (Tiradentes) planejaram proclamar uma República independente com manufaturas e universidade.',
    termino: 'A conspiração foi delatada por Joaquim Silvério dos Reis em troca do perdão de suas dívidas com a Coroa. Os inconfidentes foram presos e degredados para a África, e Tiradentes assumiu a responsabilidade total, sendo enforcado e esquartejado no Rio de Janeiro em 21 de abril de 1792.',
    dossierId: 'revolucao-francesa'
  },
  'Ciclo do Ouro em Minas Gerais e transferência da capital para o Rio de Janeiro (1763)': {
    inicio: 'A descoberta de jazidas de ouro pelos paulistas no final do século XVII provocou uma corrida migratória sem precedentes para o interior da colônia.',
    detalhes: 'O eixo socioeconômico deslocou-se do Nordeste açucareiro para a região Centro-Sul. A Coroa organizou as Casas de Fundição para cobrar o imposto do Quinto e coibir o contrabando.',
    termino: 'Em 1763, o Marquês de Pombal transferiu a capital da colônia de Salvador para o Rio de Janeiro para fiscalizar o escoamento do ouro no porto atlântico. O ciclo começou a declinar no fim do século XVIII.',
    dossierId: 'brasil-colonial'
  },
  'Hernán Cortés inicia a expedição contra o Império Asteca': {
    inicio: 'Em 1519, o conquistador espanhol Hernán Cortés desembarcou na costa de Veracruz com aproximadamente 500 homens, cavalos e armas de fogo.',
    detalhes: 'Cortés explorou rivalidades entre os povos subjugados pelos astecas, aliando-se aos tlaxcaltecas. Avançou até Tenochtitlán, onde fez o imperador Montezuma II de refém.',
    termino: 'Em 1521, após o cerco devastador marcado por epidemia de varíola e combates sangrentos, Tenochtitlán caiu, dando origem ao Vice-Reino da Nova Espanha.',
    dossierId: 'tordesilhas'
  },
  'Sultão Selim I conquista o Egito mameluco e assume o Califado': {
    inicio: 'A disputa territorial entre o Império Otomano e o Sultanato Mameluco pelo controle do Leste do Mediterrâneo e das rotas comerciais levou à guerra em 1516.',
    detalhes: 'O sultão Selim I utilizou artilharia de vanguarda e janízaros treinados para vencer os mamelucos nas batalhas de Marj Dabiq e Ridaniya.',
    termino: 'Com a tomada do Cairo em 1517, Selim I anexou o Egito e as cidades sagradas de Meca e Medina, assumindo a liderança do Califado islâmico.',
    dossierId: 'constantinopla'
  },
  'Maquiavel escreve "O Príncipe" sobre a lógica do poder absolutista': {
    inicio: 'A instabilidade das guerras italianas e a destituição da República de Florença em 1512 motivaram o exilado Maquiavel a escrever uma análise sobre a política.',
    detalhes: 'Em "O Príncipe" (1513), Maquiavel examinou como um governante conquista e mantém o poder de forma realista e pragmática, separando a política da moral religiosa tradicional.',
    termino: 'A obra inaugurou a Ciência Política Moderna e a teoria do Realismo Político, tornando-se um divisor de águas na história do pensamento Ocidental.',
    dossierId: 'reforma-protestante'
  },
  'Babur funda o monumental Império Mogol no norte indiano': {
    inicio: 'Babur, descendente de Tamerlão e Genghis Khan, migrou da Ásia Central para o subcontinente indiano em busca de expansão territorial.',
    detalhes: 'Na Primeira Batalha de Panipat (1526), usou táticas de cavalaria rápida e pólvora para derrotar o poderoso exército do Sultanato de Déli.',
    termino: 'Fundou o Império Mogol, que dominou a Índia por mais de três séculos e construiu relíquias arquitetônicas universais como o Taj Mahal.',
    dossierId: 'tordesilhas'
  },
  'Simón Bolívar e San Martín libertam as colônias espanholas do Sul': {
    inicio: 'A ocupação napoleônica na Espanha (1808) enfraqueceu o pacto colonial na América Hispânica, motivando os criollos a organizar movimentos de independência.',
    detalhes: 'Bolívar liderou as guerras de libertação no Norte (Venezuela, Colômbia, Equador). San Martín organizou o Exército dos Andes no Sul, libertando o Chile e o Peru.',
    termino: 'Após a Conferência de Guayaquil e a Batalha de Ayacucho (1824), as forças realistas espanholas foram derrotadas, encerrando o Império Espanhol na América do Sul.',
    dossierId: 'guerras-napoleonicas'
  },
  'Grande Depressão decorrente da Crise de 1929 e o New Deal de FDR': {
    inicio: 'O colapso da Bolsa de Nova York em outubro de 1929 deflagrou a maior crise financeira do mundo capitalista.',
    detalhes: 'O desemprego nos EUA atingiu 25% e a produção ruiu. Em 1933, Franklin D. Roosevelt lançou o New Deal com intervenções estatais, obras públicas e seguro social.',
    termino: 'O New Deal estabilizou a economia americana e fundamentou o Estado de Bem-Estar Social, recuperando-se totalmente com a mobilização fabril da Segunda Guerra.',
    dossierId: 'era-vargas'
  },
  'Ascensão do Nazifascismo na Alemanha (Hitler) e Itália (Mussolini)': {
    inicio: 'A crise de 1929, o medo do comunismo e os traumas da Primeira Guerra impulsionaram partidos ultranacionalistas na Europa.',
    detalhes: 'Mussolini assumiu o poder na Itália em 1922. Na Alemanha, Hitler foi nomeado Chanceler em 1933, instalando o Terceiro Reich e promovendo o expansionismo e perseguição racial.',
    termino: 'O expansionismo nazista provocou a Segunda Guerra Mundial em 1939, culminando no Holocausto e na destruição total do Eixo em 1945.',
    dossierId: 'segunda-guerra-holocausto'
  },
  'Operação Condor interliga serviços de inteligência ditatoriais do Cone Sul': {
    inicio: 'Nos anos 1970, durante o auge da Guerra Fria, as ditaduras militares do Cone Sul (Brasil, Argentina, Chile, Uruguai, Bolívia e Paraguai) criaram uma rede secreta.',
    detalhes: 'Com conhecimento e apoio de inteligência dos EUA, a Operação Condor trocava dados e executava a prisão e eliminação transfronteiriça de opositores políticos.',
    termino: 'A rede desmantelou-se com a redemocratização nos anos 1980. Revelações de documentos como os "Arquivos do Terror" comprovaram os crimes da operação.',
    dossierId: 'ditadura-militar-brasil'
  },
  'A Rota da Seda e a Expansão do Império Mongol': {
    inicio: 'Com a consolidação da Dinastia Han na China (130 a.C.) e posteriormente a unificação dos clãs nômades por Genghis Khan (1206 d.C.), a Rota da Seda tornou-se a maior artéria comercial e cultural da Eurásia.',
    detalhes: 'A Pax Mongolica garantiu segurança sem precedentes para mercadores como Marco Polo, permitindo a circulação de seda, pólvora, bússola e papel entre o Oriente e o Ocidente.',
    termino: 'A fragmentação do Império Mongol em quatro canatos e a eclosão da Peste Negra no século XIV desestabilizaram as rotas terrestres, impulsionando a futura expansão marítima europeia.',
    dossierId: 'rota-da-seda-imperio-mongol',
    dossierTitle: 'A Rota da Seda e o Império Mongol (1206 d.C.)'
  },
  'A Independência dos Estados Unidos e a Revolução Americana': {
    inicio: 'A insatisfação com a cobrança de impostos sem representação no Parlamento britânico motivou as Treze Colônias a reunirem-se no Congresso Continental.',
    detalhes: 'Em 4 de julho de 1776, a Declaração escrita por Thomas Jefferson proclamou a independência sob os princípios iluministas de direitos inalienáveis à vida, liberdade e busca pela felicidade.',
    termino: 'Com o apoio decisivo da França de Luís XVI e a vitória em Yorktown (1781), a Inglaterra reconheceu os EUA no Tratado de Paris (1783), fundando a primeira república constitucional moderna.',
    dossierId: 'independencia-eua-1776',
    dossierTitle: 'A Independência dos Estados Unidos (1776 d.C.)'
  },
  'A Restauração Meiji e o Fim do Japão Feudal': {
    inicio: 'A chegada das "Naus Negras" do Comodoro Matthew Perry em 1853 expôs a vulnerabilidade militar do Xogunato Tokugawa diante das potências ocidentais.',
    detalhes: 'Em 1868, a coalizão dos clãs Satsuma e Choshu restaurou o poder formal do Imperador Meiji (Mutsuhito), abolindo o sistema feudal dos samurais e a estrutura de castas.',
    termino: 'O Japão enviou a Missão Iwakura ao Ocidente, adotou ferrovias, telégrafo e educação universal, tornando-se em poucas décadas a primeira potência industrial não-ocidental.',
    dossierId: 'restauracao-meiji-japao',
    dossierTitle: 'A Restauração Meiji e o Japão Feudal (1868 d.C.)'
  },
  'A Guerra Fria e a Queda do Muro de Berlim': {
    inicio: 'Após a Segunda Guerra Mundial, o mundo foi dividido entre o bloco capitalista (EUA) e o socialista (URSS), simbolizado pela divisão de Berlim e o Muro erguido em 1961.',
    detalhes: 'A corrida armamentista nuclear, a Crise dos Mísseis de Cuba (1962) e a corrida espacial definiram o confronto. Nos anos 1980, as reformas de Glasnost e Perestroika enfraqueceram a URSS.',
    termino: 'Em 9 de novembro de 1989, a pressão popular derrubou o Muro de Berlim, culminando na reunificação alemã e na dissolução oficial da União Soviética em 1991.',
    dossierId: 'guerra-fria-queda-muro-berlim',
    dossierTitle: 'A Guerra Fria e a Queda do Muro de Berlim (1989 d.C.)'
  },
  'Descolonização da África, Ásia e Fim do Apartheid': {
    inicio: 'O enfraquecimento das potências europeias após a Segunda Guerra desencadeou ondas libertárias na Ásia e na África.',
    detalhes: 'A Índia conquistou a independência em 1947 via resistência não-violenta de Mahatma Gandhi. Na África do Sul, o regime do Apartheid foi combatido pelo Congresso Nacional Africano.',
    termino: 'Após 27 anos de prisão, Nelson Mandela foi libertado em 1990 e eleito o primeiro presidente negro da África do Sul em 1994, selando o fim do Apartheid.',
    dossierId: 'descolonizacao-africa-asia',
    dossierTitle: 'Descolonização e Fim do Apartheid (1947–1994)'
  },
  'O Movimento dos Direitos Civis nos Estados Unidos': {
    inicio: 'A recusa de Rosa Parks em ceder seu lugar no ônibus em Montgomery (1955) catalisou o boicote aos transportes e a liderança de Martin Luther King Jr.',
    detalhes: 'A estratégia de desobediência civil não-violenta, marchas massivas (como a Marcha sobre Washington em 1963) e o protesto firme de Malcolm X pressionaram o governo americano.',
    termino: 'A aprovação da Lei dos Direitos Civis (1964) e da Lei do Direito ao Voto (1965) extinguiu legalmente a segregação Jim Crow no Sul americano.',
    dossierId: 'direitos-civis-eua-1960',
    dossierTitle: 'Movimento dos Direitos Civis nos EUA (Anos 1960)'
  }
};

function getMeanwhileDetails(eventTitle: string, region: string, eraLabel?: string): MeanwhileDetails {
  if (MEANWHILE_REGISTRY[eventTitle]) {
    return MEANWHILE_REGISTRY[eventTitle];
  }

  const lower = eventTitle.toLowerCase();
  for (const key of Object.keys(MEANWHILE_REGISTRY)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return MEANWHILE_REGISTRY[key];
    }
  }

  return {
    inicio: `Este acontecimento teve início como resultado das transformações geopolíticas, sociais e econômicas que marcaram a região de ${region} na época ${eraLabel || 'correspondente'}.`,
    detalhes: `Compreende o desenvolvimento do fato histórico: "${eventTitle}". As dinâmicas ocorridas nesse período influenciaram a organização social e o equilíbrio regional de forças.`,
    termino: `O desfecho desse processo contribuiu para reestruturar as instituições e a sociedade local na região de ${region}, deixando um importante registro historiográfico.`
  };
}

interface MainViewProps {
  user: User;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  onEnterEpoch?: (year: number) => void;
  initialYear?: number;
}

export default function MainView({ user, onLogout, onNavigate, onEnterEpoch, initialYear }: MainViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [userState, setUserState] = useState<User>(user);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMythology, setSelectedMythology] = useState<string | null>(null);
  const [activeMythologySection, setActiveMythologySection] = useState<string>('Introdução');
  const [selectedMapDetails, setSelectedMapDetails] = useState<boolean>(false);

  // Infinite Timeline & Global Simultaneous Events State

  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  const [customCards, setCustomCards] = useState<HistoryCard[]>(() => {
    const saved = localStorage.getItem('chronos_custom_cards');
    if (saved) {
      try {
        const parsed: HistoryCard[] = JSON.parse(saved);
        // Filter out old fallback cards that contain prompt text instead of real content
        // Also remove duplicates of mockCards by title
        const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
        const mockTitles = new Set(mockCards.map(c => normalizeTitle(c.title || '')));
        const cleaned = parsed.filter((c: any) => {
          const text = (c.summary || '') + (c.title || '') + (c.fact?.description || '');
          const isPromptJunk = text.includes('Atue como') || text.includes('especialista em Historiografia');
          const isDuplicateOfMock = mockTitles.has(normalizeTitle(c.title || ''));
          return !isPromptJunk && !isDuplicateOfMock;
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('chronos_custom_cards', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Sync with Supabase on mount: migrate mock + localStorage first, then merge remote cards
  useEffect(() => {
    (async () => {
      await migrateMockDataToSupabase(mockCards, TIMELINE_STEPS);
      await migrateLocalStorageToSupabase();
      const remoteCards = await loadCardsFromSupabase();
      if (remoteCards.length > 0) {
        const localIds = new Set(customCards.map(c => c.id));
        const newFromRemote = remoteCards.filter(c => !localIds.has(c.id));
        if (newFromRemote.length > 0) {
          const merged = [...customCards, ...newFromRemote];
          setCustomCards(merged);
          localStorage.setItem('chronos_custom_cards', JSON.stringify(merged));
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customTimelineSteps, setCustomTimelineSteps] = useState<any[]>(() => {
    const saved = localStorage.getItem('chronos_custom_timeline');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up old steps with mismatched IDs (step- prefix from previous bug)
        // Also remove steps that contain prompt text instead of real content
        const cleaned = parsed.filter((s: any) => {
          if (s.id?.startsWith('step-')) return false;
          const text = (s.title || '') + (s.description || '');
          return !text.includes('Atue como') && !text.includes('especialista em Historiografia');
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('chronos_custom_timeline', JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Merge custom timeline steps into TIMELINE_STEPS, sorted by year
  // Filter out custom steps that duplicate a mock step by year or title
  const mergedTimelineSteps = [...TIMELINE_STEPS];
  customTimelineSteps.forEach(customStep => {
    const duplicatesMock = mergedTimelineSteps.some(s =>
      s.id === customStep.id ||
      s.year === customStep.year ||
      (s.title && customStep.title && (
        s.title.toLowerCase() === customStep.title.toLowerCase() ||
        s.title.toLowerCase().includes(customStep.title.toLowerCase()) ||
        customStep.title.toLowerCase().includes(s.title.toLowerCase())
      ))
    );
    if (!duplicatesMock) {
      mergedTimelineSteps.push(customStep);
    }
  });
  mergedTimelineSteps.sort((a, b) => a.year - b.year);

  const handleAddCardFromAdmin = (card: HistoryCard, timelineStep?: any, kgNodes?: any[]) => {
    const updatedCards = [card, ...customCards];
    setCustomCards(updatedCards);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updatedCards));
    saveCardToSupabase(card);

    if (timelineStep) {
      const updatedSteps = [...customTimelineSteps, timelineStep];
      setCustomTimelineSteps(updatedSteps);
      localStorage.setItem('chronos_custom_timeline', JSON.stringify(updatedSteps));
    }

    if (kgNodes && kgNodes.length > 0) {
      kgNodes.forEach(node => {
        kgEngine.registerNode(node);
      });
    }
  };

  const handleDeleteCardFromAdmin = (cardId: string) => {
    const updatedCards = customCards.filter(c => c.id !== cardId);
    setCustomCards(updatedCards);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updatedCards));
    deleteCardFromSupabase(cardId);

    // Also remove corresponding timeline step
    const updatedSteps = customTimelineSteps.filter(s => s.id !== cardId);
    setCustomTimelineSteps(updatedSteps);
    localStorage.setItem('chronos_custom_timeline', JSON.stringify(updatedSteps));
  };

  const handleUpdateCardFromAdmin = (updatedCard: HistoryCard) => {
    // If the card is in customCards, update it there
    const isInCustom = customCards.some(c => c.id === updatedCard.id);
    if (isInCustom) {
      const updatedCards = customCards.map(c => c.id === updatedCard.id ? updatedCard : c);
      setCustomCards(updatedCards);
      localStorage.setItem('chronos_custom_cards', JSON.stringify(updatedCards));
    } else {
      // It's a mockCard — add it to customCards as an override
      const updatedCards = [updatedCard, ...customCards.filter(c => c.id !== updatedCard.id)];
      setCustomCards(updatedCards);
      localStorage.setItem('chronos_custom_cards', JSON.stringify(updatedCards));
    }
    saveCardToSupabase(updatedCard);
  };

  const [currentTimelineIndex, setCurrentTimelineIndex] = useState<number>(() => {
    if (typeof initialYear === 'number') {
      const idx = mergedTimelineSteps.findIndex(step => step.year === initialYear);
      if (idx !== -1) return idx;
    }
    return 2; // Default is 49 a.C. or 476 d.C.
  });
  const [viewingDossier, setViewingDossier] = useState<boolean>(() => {
    if (typeof initialYear === 'number') {
      const idx = mergedTimelineSteps.findIndex(step => step.year === initialYear);
      return idx !== -1;
    }
    return false;
  });

  useEffect(() => {
    if (typeof initialYear === 'number') {
      const idx = mergedTimelineSteps.findIndex(step => step.year === initialYear);
      if (idx !== -1) {
        setCurrentTimelineIndex(idx);
        setViewingDossier(true);
      }
    }
  }, [initialYear]);

  const [selectedNodeDetailsId, setSelectedNodeDetailsId] = useState<string | null>(null);

  // State for "Enquanto isso no mundo..." Modal & Dossier Request System
  const [selectedMeanwhileItem, setSelectedMeanwhileItem] = useState<{
    region: string;
    event: string;
    eraLabel?: string;
  } | null>(null);

  const [requestedDossiers, setRequestedDossiers] = useState<string[]>(() => {
    const saved = localStorage.getItem('chronos_requested_dossiers');
    return saved ? JSON.parse(saved) : [];
  });

  const handleRequestDossier = (eventTitle: string, region?: string, eraLabel?: string) => {
    if (!requestedDossiers.includes(eventTitle)) {
      const next = [...requestedDossiers, eventTitle];
      setRequestedDossiers(next);
      localStorage.setItem('chronos_requested_dossiers', JSON.stringify(next));
    }

    try {
      const storedRaw = localStorage.getItem('chronos_dossier_requests');
      const requests: DossierRequest[] = storedRaw ? JSON.parse(storedRaw) : [];

      if (!requests.some(r => r.event === eventTitle)) {
        const newReq: DossierRequest = {
          id: `req-${Date.now()}`,
          event: eventTitle,
          region: region || selectedMeanwhileItem?.region || 'Global',
          eraLabel: eraLabel || selectedMeanwhileItem?.eraLabel || 'Época Correspondente',
          requestedAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          userEmail: userState?.email || user?.email || 'estudante@chronos.app',
          userName: userState?.name || user?.name || 'Estudante CHRONOS',
          status: 'pendente'
        };
        const updated = [newReq, ...requests];
        localStorage.setItem('chronos_dossier_requests', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Erro ao salvar solicitação de dossiê:', e);
    }
  };

  // Knowledge Graph exploration states
  const [searchSubTab, setSearchSubTab] = useState<'cards' | 'graph'>('graph');
  const [graphQuery, setGraphQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('char-cesar');
  const [pathStartId, setPathStartId] = useState<string>('char-cesar');
  const [pathEndId, setPathEndId] = useState<string>('god-jupiter');
  const [pathResult, setPathResult] = useState<{ node: KGNode; relationship?: KGRelationship }[] | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);

  const mythologies = [
    { id: 'grega', name: 'Mitologia Grega', region: 'Hélade (Grécia Antiga)', era: 'Século XII a.C. - Século IV d.C.', color: 'border-amber-500/20 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10' },
    { id: 'romana', name: 'Mitologia Romana', region: 'Roma Antiga', era: 'Século VIII a.C. - Século V d.C.', color: 'border-rose-500/20 text-rose-700 bg-rose-500/5 hover:bg-rose-500/10' },
    { id: 'nordica', name: 'Mitologia Nórdica', region: 'Escandinávia', era: 'Século VIII d.C. - Século XI d.C.', color: 'border-amber-600/20 text-amber-800 bg-amber-600/5 hover:bg-amber-600/10' },
    { id: 'egipcia', name: 'Mitologia Egípcia', region: 'Vale do Nilo (Egito Antigo)', era: '3100 a.C. - Século IV d.C.', color: 'border-yellow-600/20 text-yellow-800 bg-yellow-600/5 hover:bg-yellow-600/10' },
    { id: 'celta', name: 'Mitologia Celta', region: 'Europa Ocidental', era: 'Século VI a.C. - Século VI d.C.', color: 'border-emerald-600/20 text-emerald-800 bg-emerald-600/5 hover:bg-emerald-600/10' },
    { id: 'mesopotamica', name: 'Mitologia Mesopotâmica', region: 'Crescente Fértil (Suméria, Babilônia)', era: '3500 a.C. - Século VI a.C.', color: 'border-amber-700/20 text-amber-900 bg-amber-700/5 hover:bg-amber-700/10' },
    { id: 'japonesa', name: 'Mitologia Japonesa', region: 'Arquipélago Japonês (Xintoísmo)', era: 'Século VII d.C. - Presente', color: 'border-red-600/20 text-red-800 bg-red-600/5 hover:bg-red-600/10' },
    { id: 'chinesa', name: 'Mitologia Chinesa', region: 'Planície do Rio Amarelo', era: '2000 a.C. - Presente', color: 'border-orange-600/20 text-orange-800 bg-orange-600/5 hover:bg-orange-600/10' },
    { id: 'maia', name: 'Mitologia Maia', region: 'Mesoamérica (Península de Iucatã)', era: '2000 a.C. - Século XVI d.C.', color: 'border-teal-600/20 text-teal-800 bg-teal-600/5 hover:bg-teal-600/10' },
    { id: 'asteca', name: 'Mitologia Asteca', region: 'Mesoamérica (Vale do México)', era: 'Século XIII d.C. - Século XVI d.C.', color: 'border-yellow-700/20 text-yellow-900 bg-yellow-700/5 hover:bg-yellow-700/10' },
    { id: 'inca', name: 'Mitologia Inca', region: 'Região Andina (América do Sul)', era: 'Século XII d.C. - Século XVI d.C.', color: 'border-yellow-500/20 text-yellow-750 bg-yellow-500/5 hover:bg-yellow-500/10' },
    { id: 'hindu', name: 'Mitologia Hindu', region: 'Subcontinente Indiano (Vedas)', era: '1500 a.C. - Presente', color: 'border-purple-600/20 text-purple-800 bg-purple-600/5 hover:bg-purple-600/10' },
    { id: 'brasileiro', name: 'Folclore Brasileiro', region: 'Brasil (América do Sul)', era: 'Século XVI - Presente', color: 'border-emerald-500/20 text-emerald-800 bg-emerald-500/5 hover:bg-emerald-500/10' }
  ];

  const mythologySections = [
    { title: 'Introdução', description: 'Visão geral da tradição mitológica, contexto histórico-geográfico de surgimento e importância sociocultural do estudo.' },
    { title: 'Cosmologia', description: 'Como a tradição compreendia a organização do cosmos, o plano divino, o mundo físico e o submundo.' },
    { title: 'Origem do mundo', description: 'O mito da criação original (teogonia/cosmogonia), separação dos elementos primordiais e ascensão das divindades.' },
    { title: 'Principais deuses', description: 'Catálogo de divindades soberanas, seus domínios sagrados, atributos rituais e símbolos sagrados associados.' },
    { title: 'Heróis', description: 'Narrativas de semideuses, guerreiros mortais agraciados pelo divino e suas sagas de superação de limites.' },
    { title: 'Criaturas', description: 'Feras místicas, guardiões de portais, monstros elementais e seres fantásticos descritos nos manuscritos literários.' },
    { title: 'Objetos lendários', description: 'Armas divinas, cálices rituais, amuletos celestes, relíquias de poder e artefatos de relevância simbólica.' },
    { title: 'Locais sagrados', description: 'Santuários, montanhas místicas, templos oraculares, rios transcendentais e moradas divinas descritas.' },
    { title: 'Linha do tempo da tradição', description: 'Estruturação sequencial das eras mitológicas (ex: Idade de Ouro, Idade de Prata) e ciclos cosmogônicos.' },
    { title: 'Árvore genealógica dos deuses', description: 'Esquema de parentesco, consórcios sagrados e progênies divinas das dinastias sobrenaturais.' },
    { title: 'Mapa de origem', description: 'Geografia mística sobreposta à cartografia do mundo antigo, identificando locais rituais.' },
    { title: 'Obras literárias relacionadas', description: 'Códices, epopeias, hinos litúrgicos e manuscritos originais preservados onde as narrativas são contadas.' },
    { title: 'Influência na cultura moderna', description: 'Apropriações semânticas, termos artísticos, representações na ficção científica, psicologia analítica e cultura popular contemporânea.' },
    { title: 'Fontes', description: 'Evidências textuais, tabuletas arqueológicas, inscrições epigráficas e fragmentos históricos de sustentação acadêmica da tradição.' },
    { title: 'Bibliografia', description: 'Compilado de monografias, traduções críticas e estudos mitológicos contemporâneos recomendados.' }
  ];

  // Rigorous Academic Dataset covering different epochs & reliability scores

  const handleMasterCard = (id: string, xpEarned: number) => {
    if (!masteredCards.includes(id)) {
      setMasteredCards((prev) => [...prev, id]);
      setUserState((prev) => {
        const nextXp = prev.xp + xpEarned;
        const nextLevel = Math.floor(nextXp / 150) + 1;
        return {
          ...prev,
          xp: nextXp,
          level: nextLevel,
          streak: prev.streak + 1
        };
      });
    }
  };

  const periods = ['Todos', 'Antiguidade', 'Idade Média', 'Idade Moderna', 'Idade Contemporânea', 'História do Brasil', 'Mitologias'];

  const allCards = useMemo(() => {
    const customIds = new Set(customCards.map(c => c.id));
    const mockCardsFiltered = mockCards.filter(c => !customIds.has(c.id));
    const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
    const mockTitles = new Set(mockCards.map(c => normalizeTitle(c.title || '')));
    const customCardsFiltered = customCards.filter(c => !mockTitles.has(normalizeTitle(c.title || '')));
    return [...mockCardsFiltered, ...customCardsFiltered];
  }, [customCards]);

  const filteredCards = allCards.filter((card) => {
    const matchesPeriod = activePeriod === 'Todos' || card.period === activePeriod;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPeriod && matchesSearch;
  });

  // Calculate saved sources count based on user interaction (each card has multiple sources)
  const savedSourcesCount = masteredCards.length * 2 || 1;

  // Get nodes for current timeline step dynamically from CKE
  const stepNodes = (() => {
    const all = kgEngine.getAllNodes();
    const step = mergedTimelineSteps[currentTimelineIndex];
    if (!step) return [];

    // Explicit mappings for key steps
    if (step.id === 'sumeria') {
      return all.filter(n => n.id === 'civ-sumeria' || n.id === 'tech-cuneiforme' || n.id === 'doc-hamurabi');
    }
    if (step.id === 'hamurabi') {
      return all.filter(n => n.id === 'doc-hamurabi' || n.id === 'civ-sumeria' || n.id === 'tech-cuneiforme');
    }
    if (step.id === 'grecia-classica') {
      const filtered = all.filter(n => 
        n.id.includes('grecia') || 
        n.id.includes('atena') || 
        n.tags.some(t => t.toLowerCase().includes('greg') || t.toLowerCase().includes('clássico')) ||
        n.keywords.some(k => k.toLowerCase().includes('greg') || k.toLowerCase().includes('atena'))
      );
      return filtered.length > 0 ? filtered : all.filter(n => n.evidenceLevel === 'mythological').slice(0, 3);
    }
    if (step.id === 'roma-republica') {
      return all.filter(n => 
        n.id === 'char-cesar' || 
        n.id === 'char-pompeu' || 
        n.id === 'evt-rubicao' || 
        n.id === 'war-guerra-civil-roma' || 
        n.id === 'book-bello-gallico' || 
        n.id === 'civ-roma' || 
        n.id === 'city-roma' || 
        n.id === 'char-cleopatra' || 
        n.id === 'city-alexandria' || 
        n.id === 'const-biblioteca-alexandria' || 
        n.id === 'myth-romana' || 
        n.id === 'god-jupiter'
      );
    }
    if (step.id === 'queda-roma') {
      return all.filter(n => n.id === 'evt-queda-roma' || n.id === 'char-romulo-augusto' || n.id === 'imp-bizantino');
    }
    if (step.id === 'tordesilhas') {
      return all.filter(n => n.id === 'evt-descobrimento-america' || n.id === 'doc-tordesilhas');
    }
    if (step.id === 'revolucao-francesa') {
      return all.filter(n => n.id === 'char-montesquieu' || n.id === 'evt-bastilha' || n.id === 'evt-inconfidencia');
    }
    if (step.id === 'pouso-lua') {
      return all.filter(n => n.id === 'evt-pouso-lua');
    }

    // Dynamic keyword/tag matching for all other steps
    const searchTerms = [
      step.id,
      step.title.toLowerCase(),
      step.era.toLowerCase()
    ];
    const dynamicNodes = all.filter(n => {
      const name = n.name.toLowerCase();
      const era = n.era.toLowerCase();
      const summary = n.summary.toLowerCase();
      return searchTerms.some(term => name.includes(term) || era.includes(term) || summary.includes(term));
    });

    return dynamicNodes.length > 0 ? dynamicNodes : all.slice(0, 3);
  })();

  // Navigate to any node and snap the timeline to its closest historical period
  const handleNavigateToNode = (id: string) => {
    setSelectedNodeDetailsId(id);
    const node = kgEngine.getNode(id);
    if (node) {
      // Find the timeline step that is closest to this node's year
      const nodeYear = kgEngine['parseEraToComparableYear'](node.era);
      let closestIdx = 0;
      let minDiff = Infinity;
      mergedTimelineSteps.forEach((step, idx) => {
        const diff = Math.abs(step.year - nodeYear);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setCurrentTimelineIndex(closestIdx);
    }
  };

  return (
    <div id="main-view-layout" className="min-h-screen bg-slate-50 text-slate-850 pb-24 font-sans antialiased">
      {/* Dynamic Header */}
      <header id="main-header" className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-6 py-4.5 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-serif font-bold text-xl shadow-xs border border-slate-800">
              C
            </div>
            <div>
              <span className="font-serif font-extrabold text-base text-slate-950 block leading-tight tracking-wider">CHRONOS</span>
              <span className="text-[9px] font-mono tracking-widest text-amber-600 uppercase font-semibold">Conhecimento através do tempo</span>
            </div>
          </div>

          {/* Core Academic Progression Indicators */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-mono font-bold shadow-xs cursor-pointer transition-all border border-amber-400/40"
              title="Acessar Painel de Controle Admin & IA Híbrida"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>

            <div className="flex items-center gap-1.5 bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-200/40 text-amber-900 shadow-3xs" title="Dias seguidos de atividade">
              <Flame className="w-4 h-4 text-amber-500 fill-current animate-pulse" />
              <span className="font-mono text-xs font-bold">{userState.streak} d</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full text-white shadow-3xs" title="Nível acadêmico atual">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs font-bold">Nível {userState.level}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-28">
        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div id="tab-home" className="space-y-8 animate-fade-in">
            {viewingDossier ? (
              /* THE IMMERSIVE HISTORICAL DOSSIER SCREEN (ERA DETAILS) */
              <div className="space-y-6">
                {/* Back bar */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setViewingDossier(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-amber-800 transition-all bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-3xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                    <span>Voltar à Corrente do Tempo</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/30">
                      {mergedTimelineSteps[currentTimelineIndex].era}
                    </span>
                  </div>
                </div>

                {/* Big Title of the Entered Era */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
                  <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                  <span className="text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">Investigação Histórica Ativa</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-50 mt-1">
                    Dossiê: {mergedTimelineSteps[currentTimelineIndex].title} ({mergedTimelineSteps[currentTimelineIndex].label})
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm font-serif mt-2 leading-relaxed">
                    {mergedTimelineSteps[currentTimelineIndex].description}
                  </p>
                </div>

                {/* ConceptCard or fallback */}
                {(() => {
                  const currentStep = mergedTimelineSteps[currentTimelineIndex];
                  const card = allCards.find(c => c.id === currentStep.id) ||
                               allCards.find(c => c.title.toLowerCase().includes(currentStep.title.toLowerCase()) || currentStep.title.toLowerCase().includes(c.title.toLowerCase()));
                  if (card) {
                    return (
                      <ConceptCard
                        card={card}
                        isMastered={masteredCards.includes(card.id)}
                        onMasterCard={handleMasterCard}
                      />
                    );
                  }
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                      <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-slate-500 text-sm font-serif">Dossiê de investigação indisponível para esta era.</p>
                    </div>
                  );
                })()}

                {/* "ENQUANTO ISSO NO MUNDO..." PANEL ALSO SHOWN INSIDE DOSSIER FOR CONTEXT! */}
                <div className="bg-amber-500/[0.01] border-2 border-amber-500/10 rounded-2xl p-6 shadow-3xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                    <Globe className="w-5 h-5 text-amber-700" />
                    <div>
                      <h3 className="text-base font-serif font-bold text-slate-900 leading-tight">Contexto Global Simultâneo</h3>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Enquanto isso em outras regiões...</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mergedTimelineSteps[currentTimelineIndex].meanwhile?.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMeanwhileItem({
                          region: item.region,
                          event: item.event,
                          eraLabel: mergedTimelineSteps[currentTimelineIndex].label
                        })}
                        className="p-4 bg-white border border-slate-200/80 hover:border-amber-500 rounded-xl space-y-1.5 shadow-3xs hover:shadow-2xs transition-all border-l-4 border-l-amber-600 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[9px] font-mono uppercase text-amber-800 tracking-wider font-extrabold">
                            {item.region}
                          </span>
                          <span className="text-[8px] font-mono text-amber-700 group-hover:text-amber-900 font-bold uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/40">
                            + Detalhes
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-serif leading-relaxed group-hover:text-slate-950 font-medium">
                          {item.event}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* THE TIMELINE VIEW STREAM */
              <>
                {/* Elegant Welcome Header & Progress */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
                  <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">Motor de Conhecimento CHRONOS</span>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-50 mt-0.5">
                        Bem-vindo ao CHRONOS, {userState.name}
                      </h2>
                      <p className="text-slate-300 text-xs sm:text-sm font-serif mt-1">
                        Viaje interativamente através do tempo guiado por evidências acadêmicas rigorosas.
                      </p>
                    </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 shrink-0 text-center md:text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Investigações Consolidadas</span>
                  <span className="text-base font-mono font-bold text-amber-400">{masteredCards.length} / {allCards.length} Temas</span>
                </div>
              </div>
            </div>

            {/* THE INFINITE TIMELINE NAVIGATION (HEART OF THE APP) */}
            <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 overflow-hidden">
              {/* Transparent thematic background image tied to the selected epoch */}
              {mergedTimelineSteps[currentTimelineIndex].backgroundImageUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
                  <img
                    key={`bg-${mergedTimelineSteps[currentTimelineIndex].id}`}
                    src={mergedTimelineSteps[currentTimelineIndex].backgroundImageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-25 sepia-[0.4] transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/85" />
                </div>
              )}

              <div className="relative z-10 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-serif font-bold text-slate-900">Linha do Tempo Infinita</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">Deslize ou clique para viajar</span>
              </div>

              {/* Centered Selector Moving-Line Timeline Track */}
              <div className="relative z-10 py-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden select-none shadow-md">
                {/* Fixed Center Selector Marker Line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 z-20 pointer-events-none shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                
                {/* Fixed Center Selector Indicator Badges */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                  <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-md border border-amber-300/60">
                    Época Selecionada
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400 -mt-0.5 animate-bounce" />
                </div>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 border border-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
                </div>

                {/* Left/Right Vignette Blur Gradients */}
                <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                {/* Moving Timeline Track */}
                <motion.div 
                  className="flex items-center relative z-0 py-2 cursor-grab active:cursor-grabbing"
                  animate={{ x: `calc(50% - ${(currentTimelineIndex * 150) + 75}px)` }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  drag="x"
                  dragConstraints={{ left: -((mergedTimelineSteps.length - 1) * 150), right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -30 && currentTimelineIndex < mergedTimelineSteps.length - 1) {
                      setCurrentTimelineIndex(prev => prev + 1);
                      setSelectedNodeDetailsId(null);
                    } else if (info.offset.x > 30 && currentTimelineIndex > 0) {
                      setCurrentTimelineIndex(prev => prev - 1);
                      setSelectedNodeDetailsId(null);
                    }
                  }}
                >
                  {/* Axis Line behind steps */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" style={{ width: `${mergedTimelineSteps.length * 150}px` }} />
                  
                  {/* Progress fill up to current timeline index */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-amber-500/70 z-0 transition-all duration-300"
                    style={{ width: `${(currentTimelineIndex * 150) + 75}px` }}
                  />

                  {mergedTimelineSteps.map((step, idx) => {
                    const isActive = currentTimelineIndex === idx;
                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          setCurrentTimelineIndex(idx);
                          setSelectedNodeDetailsId(null);
                        }}
                        className="w-[150px] min-w-[150px] shrink-0 flex flex-col items-center justify-center relative z-10 gap-2 focus:outline-none transition-all cursor-pointer group py-2"
                      >
                        {/* Year Label */}
                        <span className={`text-[10px] font-mono font-bold tracking-tight uppercase transition-all ${
                          isActive 
                            ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] font-black' 
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}>
                          {step.label}
                        </span>

                        {/* Node Circle */}
                        <div className={`rounded-full transition-all flex items-center justify-center ${
                          isActive 
                            ? 'w-6 h-6 bg-amber-400 border-2 border-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.9)] ring-4 ring-amber-500/20' 
                            : 'w-4 h-4 bg-slate-800 border-2 border-slate-600 group-hover:border-amber-400 group-hover:bg-slate-700'
                        }`}>
                          {isActive && <div className="w-2 h-2 bg-slate-950 rounded-full" />}
                        </div>

                        {/* Title Label */}
                        <span className={`text-xs font-serif text-center px-1 max-w-[130px] transition-all line-clamp-1 ${
                          isActive 
                            ? 'text-white font-bold scale-105' 
                            : 'text-slate-400 font-medium group-hover:text-slate-200'
                        }`}>
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Prev/Next timeline controls */}
              <div className="relative z-10 flex justify-between items-center gap-1.5 sm:gap-4 bg-slate-50/50 p-2 sm:p-2.5 rounded-xl border border-slate-200/50">
                <button
                  disabled={currentTimelineIndex === 0}
                  onClick={() => {
                    if (currentTimelineIndex > 0) {
                      setCurrentTimelineIndex(prev => prev - 1);
                      setSelectedNodeDetailsId(null);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:opacity-100 transition-all cursor-pointer shadow-3xs active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Voltar<span className="hidden sm:inline"> Era</span></span>
                </button>
                
                <div className="text-center min-w-0 flex-1 mx-1 sm:mx-2">
                  <span className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2 sm:px-2.5 py-1 rounded-full border border-amber-200/30 truncate block max-w-full" title={mergedTimelineSteps[currentTimelineIndex].era}>
                    {mergedTimelineSteps[currentTimelineIndex].era}
                  </span>
                </div>

                <button
                  disabled={currentTimelineIndex === mergedTimelineSteps.length - 1}
                  onClick={() => {
                    if (currentTimelineIndex < mergedTimelineSteps.length - 1) {
                      setCurrentTimelineIndex(prev => prev + 1);
                      setSelectedNodeDetailsId(null);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-100 text-[10px] sm:text-xs font-mono font-bold uppercase text-white transition-all cursor-pointer shadow-sm active:scale-95 border border-amber-500/20 shrink-0"
                >
                  <span>Avançar<span className="hidden sm:inline"> Era</span></span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

              {/* Stop Year Epoch Presentation */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-mono font-extrabold tracking-tight text-slate-900">
                      {mergedTimelineSteps[currentTimelineIndex].label}
                    </span>
                    <span className="text-lg font-serif font-bold text-slate-800">
                      • {mergedTimelineSteps[currentTimelineIndex].title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-serif leading-relaxed">
                    {mergedTimelineSteps[currentTimelineIndex].description}
                  </p>
                  
                  {onEnterEpoch && (
                    <button
                      id="enter-epoch-btn"
                      onClick={() => onEnterEpoch(mergedTimelineSteps[currentTimelineIndex].year)}
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-white rounded-xl shadow-md font-mono text-xs uppercase tracking-wider font-bold transition-all border border-amber-400/40 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
                      <span>Entrar nesta Época</span>
                    </button>
                  )}
                </div>

                {/* Conceptual Period Map Panel */}
                <button
                  onClick={() => setSelectedMapDetails(true)}
                  className="md:col-span-1 text-left bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between group transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <div className="w-full p-3 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Map className="w-4 h-4 text-slate-500 group-hover:text-amber-600 transition-colors" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold group-hover:text-amber-800 transition-colors">Mapa Conceitual da Época</span>
                    </div>
                    <span className="text-[8px] font-mono font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/20 animate-pulse">Clique</span>
                  </div>
                  <div className="w-full relative h-24 bg-slate-200 overflow-hidden">
                    <img 
                      src={mergedTimelineSteps[currentTimelineIndex].mapUrl} 
                      alt="Mapa histórico conceitual" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-900/35 flex items-center justify-center p-2">
                      <span className="text-[10px] font-sans font-extrabold tracking-wider text-white uppercase text-center bg-slate-950/85 px-2 py-1 rounded border border-slate-700 shadow-sm">
                        {mergedTimelineSteps[currentTimelineIndex].mapLabel}
                      </span>
                    </div>
                  </div>
                  <div className="w-full p-2.5 bg-white text-center border-t border-slate-100">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-semibold group-hover:text-amber-700 transition-colors">Explorar Detalhes Geográficos</span>
                  </div>
                </button>
              </div>
            </div>

            {/* DYNAMIC CHRONOS KNOWLEDGE GRAPH DISCOVERED ENTITIES GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>Entidades Relevantes Mapeadas ({stepNodes.length})</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Consultando CKE v1.1</span>
              </div>

              {stepNodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {stepNodes.map((node) => {
                    const isMyth = node.evidenceLevel === 'mythological';
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeDetailsId(node.id)}
                        className={`w-full text-left p-4 rounded-xl border bg-white shadow-3xs hover:shadow-2xs hover:border-amber-500 hover:bg-slate-50/30 transition-all flex flex-col justify-between min-h-[140px] group cursor-pointer ${
                          isMyth ? 'border-amber-200/60 bg-amber-500/[0.005]' : 'border-slate-200'
                        }`}
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-start w-full gap-2">
                            <span className="text-[8px] font-mono font-bold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200/50">
                              {ENTITY_TYPE_TRANSLATIONS[node.type] || node.type}
                            </span>
                            <span className={`text-[7px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded border ${
                              node.evidenceLevel === 'high' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                              node.evidenceLevel === 'good' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                              node.evidenceLevel === 'debate' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                              node.evidenceLevel === 'hypothesis' ? 'bg-rose-50 text-rose-800 border-rose-100' :
                              'bg-amber-50 text-amber-900 border-amber-200'
                            }`}>
                              {node.evidenceLevel === 'high' ? 'Alto Consenso' :
                               node.evidenceLevel === 'good' ? 'Bom Nível' :
                               node.evidenceLevel === 'debate' ? 'Em Debate' :
                               node.evidenceLevel === 'hypothesis' ? 'Hipótese' :
                               node.evidenceLevel === 'mythological' ? 'Mito' : node.evidenceLevel}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm mt-3 group-hover:text-amber-800 transition-colors line-clamp-1">{node.name}</h4>
                          <p className="text-slate-400 text-[10px] font-mono mt-1.5 leading-tight line-clamp-2 italic">"{node.summary}"</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[8px] font-mono text-slate-400 group-hover:text-amber-800 border-t border-slate-100 pt-2 w-full">
                          <span>INSPECIONAR DADOS</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <p className="text-slate-400 text-xs font-serif italic">Nenhuma entidade catalogada diretamente neste ponto de ancoragem.</p>
                </div>
              )}
            </div>

            {/* DYNAMIC DETAILED INSPECTOR MODAL OVERLAY */}
            <AnimatePresence>
              {selectedNodeDetailsId && (() => {
                const node = kgEngine.getNode(selectedNodeDetailsId);
                if (!node) return null;
                const neighbors = kgEngine.getNeighbors(node.id);
                const isMythological = node.evidenceLevel === 'mythological';
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with elegant blur */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedNodeDetailsId(null)}
                      className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Centered Modal Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl space-y-5 overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col z-10"
                    >
                      <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

                      {/* Modal Header */}
                      <div className="flex justify-between items-start gap-4 border-b border-slate-800 p-6 pb-4 shrink-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full tracking-wider">
                              {ENTITY_TYPE_TRANSLATIONS[node.type] || node.type}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">{node.era}</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-50">{node.name}</h3>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-slate-450 font-semibold">Rigor de Evidência Científica</span>
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border mt-0.5 ${
                              node.evidenceLevel === 'high' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-850' :
                              node.evidenceLevel === 'good' ? 'bg-blue-950/80 text-blue-300 border-blue-850' :
                              node.evidenceLevel === 'debate' ? 'bg-amber-950/80 text-amber-300 border-amber-850' :
                              node.evidenceLevel === 'hypothesis' ? 'bg-rose-950/80 text-rose-300 border-rose-850' :
                              'bg-amber-900/40 text-amber-200 border-amber-700/80'
                            }`}>
                              {node.evidenceLevel === 'high' ? 'Alto Consenso Histórico' :
                               node.evidenceLevel === 'good' ? 'Bom Nível de Evidência' :
                               node.evidenceLevel === 'debate' ? 'Tema em Debate' :
                               node.evidenceLevel === 'hypothesis' ? 'Hipótese Histórica' :
                               node.evidenceLevel === 'mythological' ? 'Estudo Temático / Mitologia' : node.evidenceLevel}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => setSelectedNodeDetailsId(null)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
                            title="Fechar detalhes"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Body (Scrollable content) */}
                      <div className="p-6 pt-0 space-y-5 overflow-y-auto max-h-[55vh] scrollbar-thin flex-1 pr-4">
                        {/* Mobile Rigor Level (Visible only on very small viewports) */}
                        <div className="sm:hidden flex flex-col p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Rigor de Evidência Científica</span>
                          <div>
                            <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              node.evidenceLevel === 'high' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-850' :
                              node.evidenceLevel === 'good' ? 'bg-blue-950/80 text-blue-300 border-blue-850' :
                              node.evidenceLevel === 'debate' ? 'bg-amber-950/80 text-amber-300 border-amber-850' :
                              node.evidenceLevel === 'hypothesis' ? 'bg-rose-950/80 text-rose-300 border-rose-850' :
                              'bg-amber-900/40 text-amber-200 border-amber-700/80'
                            }`}>
                              {node.evidenceLevel === 'high' ? 'Alto Consenso Histórico' :
                               node.evidenceLevel === 'good' ? 'Bom Nível de Evidência' :
                               node.evidenceLevel === 'debate' ? 'Tema em Debate' :
                               node.evidenceLevel === 'hypothesis' ? 'Hipótese Histórica' :
                               node.evidenceLevel === 'mythological' ? 'Estudo Temático / Mitologia' : node.evidenceLevel}
                            </span>
                          </div>
                        </div>

                        {/* Scientific summary */}
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-serif text-sm leading-relaxed italic text-slate-200">
                          "{node.summary}"
                        </div>

                        {/* Historiographical Description */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Descrição Historiográfica Detalhada</span>
                          <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
                            {node.description}
                          </p>
                        </div>

                        {/* Scientific consensus/justification */}
                        {node.justification && (
                          <div className="space-y-1.5 p-4 bg-amber-500/[0.02] rounded-xl border border-amber-500/10">
                            <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest">Fundamentação e Nível de Consenso</span>
                            <p className="text-xs text-slate-300 font-serif leading-relaxed">
                              {node.justification}
                            </p>
                          </div>
                        )}

                        {/* Legenda de Níveis de Evidência Histórica */}
                        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Legenda Metodológica dos Níveis de Evidência</span>
                            </span>
                            <span className="text-[8px] text-slate-500 font-normal">Classificação Historiográfica</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-300 font-serif leading-relaxed">
                            <strong className="text-emerald-400 font-sans font-bold">Alto Consenso Histórico = Fato Histórico Estabelecido:</strong> Equivale a fatos irrefutáveis (como a existência de Júlio César, Roma Antiga, II Guerra Mundial), respaldados por concordância documental primária, numismática e evidências arqueológicas irrefutáveis.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[10px] text-slate-400 font-sans border-t border-slate-850">
                            <div><strong className="text-blue-300 font-semibold">Bom Nível:</strong> Aceito com raras divergências secundárias.</div>
                            <div><strong className="text-amber-300 font-semibold">Em Debate:</strong> Múltiplas correntes acadêmicas concorrentes.</div>
                            <div><strong className="text-rose-300 font-semibold">Hipótese:</strong> Teoria plausível pendente de provas.</div>
                            <div><strong className="text-purple-300 font-semibold">Mitologia:</strong> Estudo simbólico / tradição cultural.</div>
                          </div>
                        </div>

                        {/* Interactive Relationships network */}
                        <div className="space-y-3">
                          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Relacionamentos Ativos no Grafo (Clique para viajar)</span>
                          {neighbors.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {neighbors.map((n, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleNavigateToNode(n.node.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500 transition-all text-xs text-slate-300 shadow-3xs group text-left cursor-pointer"
                                >
                                  <span className="text-amber-400 font-semibold uppercase text-[7px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                    {RELATIONSHIP_TYPE_TRANSLATIONS[n.relationship.type] || n.relationship.type}
                                  </span>
                                  <span>{n.direction === 'outgoing' ? '→' : '←'}</span>
                                  <strong className="font-serif text-white group-hover:text-amber-300">{n.node.name}</strong>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-xs font-serif italic">Nenhum relacionamento mapeado para este nó.</p>
                          )}
                        </div>

                        {/* Sources list */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2.5">
                          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-semibold">Fontes Bibliográficas Rastreáveis</span>
                          {node.sources && node.sources.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {node.sources.map((s, idx) => (
                                <div key={idx} className="text-xs font-serif text-slate-300 border-l-2 border-amber-500/50 pl-3 py-1 bg-slate-900/40 rounded-r-lg p-2 border border-slate-800/20">
                                  <strong className="text-white block text-[11px] truncate">{s.title}</strong>
                                  <span className="text-slate-400 text-[10px] font-mono block mt-0.5">{s.author} ({s.year})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 text-[10px] font-serif italic">Aresta de relevância indireta/autointegrada.</p>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-6 pt-0 border-t border-slate-800 flex justify-end shrink-0">
                        <button
                          onClick={() => setSelectedNodeDetailsId(null)}
                          className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all border border-slate-700 cursor-pointer"
                        >
                          Fechar Detalhes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>

            {/* DYNAMIC HISTORICAL MAP DETAILS MODAL OVERLAY */}
            <AnimatePresence>
              {selectedMapDetails && (() => {
                const step = mergedTimelineSteps[currentTimelineIndex];
                const detail = MAP_DETAILS_REGISTRY[step.id] || {
                  title: step.mapLabel,
                  locations: [],
                  description: step.description,
                  routes: []
                };
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop with elegant blur */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedMapDetails(false)}
                      className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Centered Modal Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl space-y-5 overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col z-10"
                    >
                      {/* Image header banner */}
                      <div className="relative h-48 sm:h-56 bg-slate-800 shrink-0">
                        <img 
                          src={step.mapUrl} 
                          alt={step.mapLabel}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-60" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        
                        {/* Title overlay */}
                        <div className="absolute bottom-4 left-6 right-6">
                          <span className="text-[9px] font-mono font-extrabold uppercase px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full tracking-wider">
                            Cartografia Histórica • {step.label}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5 drop-shadow-md">
                            {detail.title}
                          </h3>
                        </div>

                        {/* Close button top right */}
                        <button
                          onClick={() => setSelectedMapDetails(false)}
                          className="absolute top-4 right-4 p-1.5 bg-slate-950/60 hover:bg-slate-950 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-800/40"
                          title="Fechar mapa"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body (Scrollable content) */}
                      <div className="p-6 pt-0 space-y-5 overflow-y-auto max-h-[45vh] scrollbar-thin flex-1 pr-4">
                        {/* Interactive Geographic Map */}
                        <GeographicMapView
                          data={getGeoMapDataForTopic(step.id, detail.title)}
                          height="240px"
                        />

                        {/* Geopolitical description */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest block font-semibold">Geografia & Dinâmica Geopolítica</span>
                          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed">
                            {detail.description}
                          </p>
                        </div>

                        {/* Key Locations / Power Centers */}
                        {detail.locations.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-semibold">Centros de Poder e Cidades Ativas</span>
                            <div className="flex flex-wrap gap-2">
                              {detail.locations.map((loc, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-serif text-amber-100/90 rounded-lg shadow-3xs"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Active Routes / Commercial flow */}
                        {detail.routes.length > 0 && (
                          <div className="space-y-2.5 p-4 bg-slate-950 rounded-xl border border-slate-850">
                            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-semibold">Rotas de Fluxo e Eixos Comerciais Ativos</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {detail.routes.map((rt, idx) => (
                                <div key={idx} className="text-xs font-serif text-slate-300 border-l-2 border-amber-500/50 pl-3 py-1 bg-slate-900/40 rounded-r-lg">
                                  {rt}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="p-6 pt-0 border-t border-slate-800 flex justify-end shrink-0">
                        <button
                          onClick={() => setSelectedMapDetails(false)}
                          className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all border border-slate-700 cursor-pointer"
                        >
                          Fechar Cartografia
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>

            {/* DYNAMIC MEANWHILE EVENT DETAILED INSPECTOR MODAL OVERLAY */}
            <AnimatePresence>
              {selectedMeanwhileItem && (() => {
                const details = getMeanwhileDetails(
                  selectedMeanwhileItem.event,
                  selectedMeanwhileItem.region,
                  selectedMeanwhileItem.eraLabel
                );

                // Check if a matching dossier exists in allCards by dossierId or title
                let matchingCard: HistoryCard | undefined = undefined;
                if (details.dossierId) {
                  matchingCard = allCards.find(c => c.id === details.dossierId);
                }
                if (!matchingCard) {
                  const evLower = selectedMeanwhileItem.event.toLowerCase();
                  matchingCard = allCards.find(c =>
                    c.title.toLowerCase().includes(evLower) || evLower.includes(c.title.toLowerCase())
                  );
                }

                const isRequested = requestedDossiers.includes(selectedMeanwhileItem.event);

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedMeanwhileItem(null)}
                      className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Centered Modal Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="relative bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col z-10"
                    >
                      {/* Header Banner */}
                      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/50 border-b border-slate-800 relative">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 bg-amber-500 text-slate-950 rounded-full tracking-wider shadow-2xs">
                            {selectedMeanwhileItem.region} • Visão Simultânea Global
                          </span>
                          <button
                            onClick={() => setSelectedMeanwhileItem(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer border border-slate-700"
                            title="Fechar detalhes"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-50 mt-1 leading-snug">
                          {selectedMeanwhileItem.event}
                        </h3>
                        {selectedMeanwhileItem.eraLabel && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-1 uppercase tracking-widest font-semibold">
                            Época Histórica: {selectedMeanwhileItem.eraLabel}
                          </span>
                        )}
                      </div>

                      {/* Modal Scrollable Body */}
                      <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] scrollbar-thin flex-1">
                        
                        {/* Section 1: Início */}
                        <div className="space-y-2 p-4 bg-slate-950/90 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 text-amber-400">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                              O que iniciou (O Estopim / Início)
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed pl-6 border-l-2 border-amber-500/40">
                            {details.inicio}
                          </p>
                        </div>

                        {/* Section 2: Resumo Detalhado */}
                        <div className="space-y-2 p-4 bg-slate-950/90 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 text-amber-400">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                              Resumo com Mais Detalhes (Desenvolvimento)
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed pl-6 border-l-2 border-amber-500/40">
                            {details.detalhes}
                          </p>
                        </div>

                        {/* Section 3: Como Terminou */}
                        <div className="space-y-2 p-4 bg-slate-950/90 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 text-amber-400">
                            <CheckCircle className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                              Como Terminou (Desfecho / Conclusão)
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed pl-6 border-l-2 border-amber-500/40">
                            {details.termino}
                          </p>
                        </div>

                        {/* Section 4: Presença de Dossiê no App */}
                        <div className="p-4 rounded-xl border bg-slate-950 space-y-3 border-amber-500/20">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block border-b border-slate-850 pb-2">
                            Status no Acervo de Dossiês CHRONOS
                          </span>

                          {matchingCard ? (
                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5 bg-emerald-950/50 p-3 rounded-lg border border-emerald-800/40">
                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-mono font-bold text-emerald-300 block uppercase">
                                    Dossiê Disponível no Acervo
                                  </span>
                                  <p className="text-xs font-serif text-slate-300 mt-0.5">
                                    Este tema já possui um dossiê histórico completo catalogado: <strong className="text-white">"{matchingCard.title}"</strong>.
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  const stepIdx = mergedTimelineSteps.findIndex(s => s.id === matchingCard?.id || s.title.toLowerCase().includes(matchingCard?.title.toLowerCase() || ''));
                                  if (stepIdx !== -1) {
                                    setCurrentTimelineIndex(stepIdx);
                                    setViewingDossier(true);
                                  } else {
                                    setActiveTab('search');
                                    setSearchQuery(matchingCard?.title || '');
                                  }
                                  setSelectedMeanwhileItem(null);
                                }}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono text-xs uppercase tracking-wider font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                              >
                                <BookOpen className="w-4 h-4" />
                                <span>Acessar Dossiê Completo no App</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-mono font-bold text-amber-300 block uppercase">
                                    Conteúdo ainda não catalogado como Dossiê Individual
                                  </span>
                                  <p className="text-xs font-serif text-slate-300 mt-1 leading-relaxed">
                                    Deseja que adicionemos um dossiê sobre este assunto aqui no aplicativo?
                                  </p>
                                </div>
                              </div>

                              {isRequested ? (
                                <div className="p-3 bg-emerald-950/60 border border-emerald-700/50 rounded-xl text-center space-y-1 animate-fade-in">
                                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Solicitação Registrada!</span>
                                  </div>
                                  <p className="text-[11px] font-serif text-emerald-200/90">
                                    Sua sugestão foi enviada para a nossa equipe editorial de IA. Em breve este dossiê estará disponível no acervo.
                                  </p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleRequestDossier(selectedMeanwhileItem.event)}
                                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs uppercase tracking-wider font-extrabold rounded-xl border border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
                                >
                                  <Sparkles className="w-4 h-4 text-slate-950" />
                                  <span>Sim, solicitar adição deste Dossiê</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/80">
                        <button
                          onClick={() => setSelectedMeanwhileItem(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border border-slate-700 cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>

            {/* "ENQUANTO ISSO NO MUNDO..." PANEL */}
            <div className="bg-amber-500/[0.01] border-2 border-amber-500/10 rounded-2xl p-6 shadow-3xs space-y-5">
              <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                <Globe className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900 leading-tight">Enquanto isso no mundo...</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Visão Histórica Simultânea e Global</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mergedTimelineSteps[currentTimelineIndex].meanwhile?.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMeanwhileItem({
                      region: item.region,
                      event: item.event,
                      eraLabel: mergedTimelineSteps[currentTimelineIndex].label
                    })}
                    className="p-4 bg-white border border-slate-200/80 hover:border-amber-500 rounded-xl space-y-1.5 shadow-3xs hover:shadow-2xs transition-all border-l-4 border-l-amber-600 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] font-mono uppercase text-amber-800 tracking-wider font-extrabold">
                        {item.region}
                      </span>
                      <span className="text-[8px] font-mono text-amber-700 group-hover:text-amber-900 font-bold uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/40">
                        + Detalhes
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-serif leading-relaxed group-hover:text-slate-950 font-medium">
                      {item.event}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* INTEGRATED SEMANTIC CONNECTION EXPLORER */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-md space-y-6">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-amber-100 leading-tight">Explorador de Conexões Semânticas</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block mt-0.5 font-bold">Mapeamento de nexos causais históricos</span>
                </div>
              </div>

              <p className="text-slate-400 text-xs font-serif leading-relaxed">
                Descubra conexões e relações entre quaisquer duas entidades históricas ou mitológicas da nossa base de dados. Escolha uma trilha recomendada ou selecione os nós de origem e destino abaixo.
              </p>

              {/* Preset Shortcuts */}
              <div className="space-y-2">
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block font-semibold">Trilhas Recomendadas para Testar</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setPathStartId('char-montesquieu');
                      setPathEndId('evt-inconfidencia');
                      const path = kgEngine.findConnectionPath('char-montesquieu', 'evt-inconfidencia');
                      setPathResult(path);
                      setPathError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-[11px] font-serif text-slate-200 border border-slate-700/80 hover:border-amber-500/60 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    🏛️ <strong className="font-sans font-medium text-amber-300">Relação de Poder:</strong> Montesquieu até Inconfidência Mineira
                  </button>
                  <button
                    onClick={() => {
                      setPathStartId('civ-sumeria');
                      setPathEndId('doc-hamurabi');
                      const path = kgEngine.findConnectionPath('civ-sumeria', 'doc-hamurabi');
                      setPathResult(path);
                      setPathError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-[11px] font-serif text-slate-200 border border-slate-700/80 hover:border-amber-500/60 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    📖 <strong className="font-sans font-medium text-amber-300">Origem das Leis:</strong> Suméria até Cód. de Hamurabi
                  </button>
                  <button
                    onClick={() => {
                      setPathStartId('char-cesar');
                      setPathEndId('const-biblioteca-alexandria');
                      const path = kgEngine.findConnectionPath('char-cesar', 'const-biblioteca-alexandria');
                      setPathResult(path);
                      setPathError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-[11px] font-serif text-slate-200 border border-slate-700/80 hover:border-amber-500/60 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    👑 <strong className="font-sans font-medium text-amber-300">Tríade do Nilo:</strong> Júlio César até Biblioteca Alexandria
                  </button>
                </div>
              </div>

              {/* Selector Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">Origem (Nó A)</label>
                  <select
                    value={pathStartId}
                    onChange={(e) => setPathStartId(e.target.value)}
                    className="block w-full bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-serif"
                  >
                    {kgEngine.getAllNodes().map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({ENTITY_TYPE_TRANSLATIONS[n.type] || n.type})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">Destino (Nó B)</label>
                  <select
                    value={pathEndId}
                    onChange={(e) => setPathEndId(e.target.value)}
                    className="block w-full bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-serif"
                  >
                    {kgEngine.getAllNodes().map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({ENTITY_TYPE_TRANSLATIONS[n.type] || n.type})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (pathStartId === pathEndId) {
                      setPathError("Por favor, selecione duas entidades diferentes.");
                      setPathResult(null);
                    } else {
                      const path = kgEngine.findConnectionPath(pathStartId, pathEndId);
                      if (path) {
                        setPathResult(path);
                        setPathError(null);
                      } else {
                        setPathResult(null);
                        setPathError("Nenhum caminho lógico pôde ser traçado até a profundidade máxima de 4 níveis de conexões.");
                      }
                    }
                  }}
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs h-10 flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Calcular Caminho</span>
                </button>
              </div>

              {/* Pathfinder Output */}
              <AnimatePresence mode="wait">
                {pathError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 font-serif"
                  >
                    {pathError}
                  </motion.div>
                )}

                {pathResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 shadow-inner"
                  >
                    <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block font-bold">Cadeia de Relações Tracada por Algoritmo Semântico</span>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap justify-center py-2">
                      {pathResult.map((step, stepIdx) => {
                        const nodeColor = step.node.evidenceLevel === 'mythological' 
                          ? 'border-amber-500/40 text-amber-300 bg-amber-500/5 hover:border-amber-400' 
                          : 'border-slate-700 text-slate-100 bg-slate-900 hover:border-amber-500';

                        return (
                          <div key={stepIdx} className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Entity Node */}
                            <button 
                              onClick={() => handleNavigateToNode(step.node.id)}
                              className={`px-4 py-3 rounded-xl border text-center font-serif flex flex-col justify-center max-w-xs transition-all hover:bg-slate-800 cursor-pointer ${nodeColor}`}
                            >
                              <span className="text-[7px] font-mono uppercase text-slate-400 tracking-wider mb-0.5">{ENTITY_TYPE_TRANSLATIONS[step.node.type] || step.node.type}</span>
                              <strong className="text-xs block">{step.node.name}</strong>
                              <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-wider">{step.node.era}</span>
                            </button>

                            {/* Directed Relationship Link Edge */}
                            {stepIdx < pathResult.length - 1 && pathResult[stepIdx + 1]?.relationship && (
                              <div className="flex flex-row md:flex-col items-center justify-center gap-2">
                                <div className="h-0.5 w-8 bg-slate-700 hidden md:block" />
                                <span className="text-[8px] font-mono uppercase text-amber-400/80 tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-center">
                                  {RELATIONSHIP_TYPE_TRANSLATIONS[pathResult[stepIdx + 1].relationship?.type || ''] || pathResult[stepIdx + 1].relationship?.type}
                                </span>
                                <div className="h-0.5 w-8 bg-slate-700 hidden md:block" />
                                {/* Mobile/vertical indicator arrow */}
                                <span className="text-slate-500 block md:hidden text-lg">↓</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-serif text-slate-400 text-center">
                      <strong>Nexo Causal Concluído:</strong> O motor semântico confirmou relevância causal de nível <strong>{pathResult.length - 1}</strong> entre as entidades. Clique em qualquer card acima para viajar até sua era correspondente.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    )}

        {/* TAB: SEARCH / BASE DOCUMENTAL & SEMANTIC GRAPH */}
        {activeTab === 'search' && (
          <div id="tab-search" className="space-y-6">
            {/* Premium segmented control to switch views */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs sm:max-w-md mx-auto sm:mx-0 border border-slate-200">
              <button
                id="subtab-cards-btn"
                onClick={() => setSearchSubTab('cards')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  searchSubTab === 'cards'
                    ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Provas e Fatos
              </button>
              <button
                id="subtab-graph-btn"
                onClick={() => {
                  setSearchSubTab('graph');
                  // Trigger pathfinding on load
                  const initialPath = kgEngine.findConnectionPath('char-cesar', 'god-jupiter');
                  setPathResult(initialPath);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                  searchSubTab === 'graph'
                    ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Grafo de Conhecimento
              </button>
            </div>

            {searchSubTab === 'cards' ? (
              <div className="space-y-6">
                {/* Explaining choice of Base Documental */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Base Documental</h2>
                  <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100/50 text-xs text-amber-950 font-serif leading-relaxed mb-4">
                    <strong>Justificativa da Nomenclatura:</strong> Escolhemos <strong>"Base Documental"</strong> para esta área de exploração pois, ao contrário de uma simples "Biblioteca", esta aba representa o centro de validação científica do aplicativo. Ela foca no registro formal das provas historiográficas, permitindo rastrear onde cada afirmação factual foi coletada.
                  </div>
                  <p className="text-slate-500 text-xs font-serif leading-relaxed mb-4">
                    Pesquise por títulos, períodos ou termos-chave nas investigações catalogadas. Todos os dados e links referenciam artigos, teses e manuscritos reais e de elevado prestígio.
                  </p>

                  {/* Search Box */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="library-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar por Hamurabi, Tordesilhas, Alexandria, Roma, Artur, Vargas..."
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Period Filter Buttons / Pills */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-100">
                    {periods.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivePeriod(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                          activePeriod === p
                            ? 'bg-amber-600 text-white shadow-3xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Registros Catalogados ({filteredCards.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          const stepIdx = mergedTimelineSteps.findIndex(step => step.id === card.id);
                          if (stepIdx !== -1) {
                            setCurrentTimelineIndex(stepIdx);
                          } else {
                            // Fallback: exact title match only
                            const fallbackIdx = mergedTimelineSteps.findIndex(step => 
                              step.title.toLowerCase() === card.title.toLowerCase()
                            );
                            if (fallbackIdx !== -1) setCurrentTimelineIndex(fallbackIdx);
                          }
                          setViewingDossier(true);
                          setActiveTab('home');
                        }}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer flex justify-between items-start"
                      >
                        <div>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <span className="text-[8px] uppercase font-mono tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {card.period}
                            </span>
                            <span className="text-[8px] uppercase font-mono tracking-widest bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100">
                              {card.evidenceLevel.toUpperCase()}
                            </span>
                            {card.modo_aprofundado && (
                              <span className="text-[8px] uppercase font-mono tracking-widest bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Aprofundado
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 mt-2 text-sm leading-snug">{card.title}</h4>
                          <p className="text-slate-500 text-xs font-serif mt-1 line-clamp-2">{card.summary}</p>
                          {card.modo_aprofundado && (
                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                              <p className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Conteúdo Aprofundado:</p>
                              <div className="flex flex-wrap gap-1">
                                {card.metricas_rapidas && (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Métricas</span>
                                )}
                                {card.relevancia_atual && (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Relevância Atual</span>
                                )}
                                {card.fact?.pilares_fatos?.length ? (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Pilares de Fatos</span>
                                ) : null}
                                {card.interpretation?.debates_historiograficos?.length ? (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Debates Historiográficos</span>
                                ) : null}
                                {card.interpretation?.mitos_vs_fatos?.length ? (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Mitos vs Fatos</span>
                                ) : null}
                                {card.characters?.some(c => c.citacao_historica) && (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Citações Históricas</span>
                                )}
                                {card.sources?.some(s => s.trecho_fonte_primaria) && (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Fontes Primárias</span>
                                )}
                                {card.timeline?.some(t => t.detalhe_tatico) && (
                                  <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Detalhes Táticos</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* THE CHRONOS KNOWLEDGE GRAPH INTERACTIVE ENGINE */
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.01] rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 text-amber-400">
                      <Network className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-serif font-bold text-slate-900">Base de Conhecimento Conectada</h2>
                  </div>
                  <p className="text-slate-500 text-xs font-serif leading-relaxed mb-4">
                    CHRONOS organiza a história em um **Grafo de Conhecimento Semântico** que mapeia as conexões causais e culturais da humanidade. Esta arquitetura de dados relacional protege as investigações contra dados isolados e prepara a plataforma para futuras consultas por IA e busca semântica profunda.
                  </p>

                  {/* Graph Telemetry Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center sm:text-left">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block">Nós de Entidades</span>
                      <span className="text-lg font-mono font-bold text-slate-900">{kgEngine.getAllNodes().length} Ativos</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center sm:text-left">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block">Arestas Direcionadas</span>
                      <span className="text-lg font-mono font-bold text-slate-900">6 Conexões</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center sm:text-left col-span-2">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block">Ontologia Cadastrada</span>
                      <span className="text-[10px] font-mono font-bold text-amber-700 block truncate">25 Entidades Históricas e Mitológicas</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Semantic Search and Entity list */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-3">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Busca Semântica no Grafo</span>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Search className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={graphQuery}
                          onChange={(e) => setGraphQuery(e.target.value)}
                          placeholder="Buscar personagem, deus, cidade, mito..."
                          className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 bg-slate-50/50"
                        />
                      </div>

                      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {kgEngine.search(graphQuery).map((node) => {
                          const isSelected = selectedNodeId === node.id;
                          return (
                            <button
                              key={node.id}
                              onClick={() => {
                                setSelectedNodeId(node.id);
                                // Focus the pathfinder parameters on clicking
                                if (!pathStartId) setPathStartId(node.id);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-bold truncate">{node.name}</span>
                                <span className={`text-[7px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                                  isSelected
                                    ? 'bg-slate-800 border-slate-700 text-amber-300'
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                                }`}>
                                  {ENTITY_TYPE_TRANSLATIONS[node.type] || node.type}
                                </span>
                              </div>
                              <span className={`text-[9px] font-serif mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                {node.summary}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Middle & Right Column combined: Node Inspector Panel */}
                  <div className="lg:col-span-2">
                    {(() => {
                      const node = kgEngine.getNode(selectedNodeId);
                      if (!node) {
                        return (
                          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <Network className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
                            <p className="text-slate-500 text-sm font-serif">Selecione um nó do grafo para inspecionar</p>
                          </div>
                        );
                      }

                      const neighbors = kgEngine.getNeighbors(node.id);
                      const recommendations = kgEngine.getRecommendations(node.id, 2);
                      const isMythological = node.evidenceLevel === 'mythological';

                      return (
                        <div className={`bg-white border rounded-2xl p-6 shadow-xs space-y-6 transition-colors duration-200 ${
                          isMythological ? 'border-amber-600/30 bg-amber-500/[0.005]' : 'border-slate-200'
                        }`}>
                          {/* Inspector Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest border ${
                                  isMythological 
                                    ? 'bg-amber-100/60 text-amber-800 border-amber-200' 
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {ENTITY_TYPE_TRANSLATIONS[node.type] || node.type}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                                  {node.era}
                                </span>
                              </div>
                              <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">{node.name}</h3>
                            </div>

                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mb-0.5">Nível de Evidência</span>
                              <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                                node.evidenceLevel === 'high' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : node.evidenceLevel === 'good'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : node.evidenceLevel === 'debate'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : node.evidenceLevel === 'hypothesis'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-300 font-semibold'
                              }`}>
                                {node.evidenceLevel === 'mythological' ? 'Estudo de Mitologia' : node.evidenceLevel.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Summary & Core Description */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Resumo Conceitual</span>
                            <p className="text-xs text-slate-800 font-serif leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                              "{node.summary}"
                            </p>
                            <p className="text-xs text-slate-600 font-serif leading-relaxed mt-2">
                              {node.description}
                            </p>
                          </div>

                          {/* Relationships Viz (Interactive connections list) */}
                          <div className="space-y-3">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Relacionamentos Ativos no Grafo</span>
                            {neighbors.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {neighbors.map((n, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedNodeId(n.node.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-slate-50 transition-all text-[11px] text-slate-700 shadow-3xs group"
                                  >
                                    <span className="text-slate-400 font-semibold uppercase text-[8px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200">
                                      {RELATIONSHIP_TYPE_TRANSLATIONS[n.relationship.type] || n.relationship.type}
                                    </span>
                                    <span className="text-slate-400">{n.direction === 'outgoing' ? '→' : '←'}</span>
                                    <strong className="font-serif group-hover:text-slate-900">{n.node.name}</strong>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-xs font-serif italic">Nenhuma aresta direcional conectada para este nó.</p>
                            )}
                          </div>

                          {/* Dynamic Recommendations & Sources Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Scientific Sources listed inside Node */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Fontes da Entidade</span>
                              {node.sources && node.sources.length > 0 ? (
                                <div className="space-y-1.5">
                                  {node.sources.map((s, idx) => (
                                    <div key={idx} className="text-[10px] font-serif text-slate-600 border-l-2 border-slate-300 pl-2">
                                      <strong>{s.title}</strong>
                                      <p className="text-slate-400 text-[9px] font-mono">{s.author} ({s.year})</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 text-[10px] font-serif italic">Aresta de relevância indireta/autointegrada.</p>
                              )}
                            </div>

                            {/* Recommendations calculated live by the engine */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold text-amber-800">Recomendações de Conexão</span>
                              <div className="space-y-1">
                                {recommendations.map((rec) => (
                                  <button
                                    key={rec.id}
                                    onClick={() => setSelectedNodeId(rec.id)}
                                    className="w-full text-left text-[11px] font-serif text-slate-700 hover:text-amber-800 font-medium hover:underline flex items-center justify-between"
                                  >
                                    <span>{rec.name}</span>
                                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">{ENTITY_TYPE_TRANSLATIONS[rec.type] || rec.type}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* DYNAMIC PATHFINDER GRAPH SIMULATOR SECTION */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-md">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-serif font-bold text-amber-100">Descoberta de Conexões (Semantic Pathfinder)</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-serif leading-relaxed mb-4">
                    Selecione duas entidades quaisquer da base de conhecimento CHRONOS para descobrir como elas estão relacionadas na teia histórica e cultural por meio de caminhos de parentesco, causalidade territorial ou herança mitológica.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">Origem (Nó A)</label>
                      <select
                        value={pathStartId}
                        onChange={(e) => setPathStartId(e.target.value)}
                        className="block w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-serif"
                      >
                        {kgEngine.getAllNodes().map(n => (
                          <option key={n.id} value={n.id}>{n.name} ({ENTITY_TYPE_TRANSLATIONS[n.type] || n.type})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">Destino (Nó B)</label>
                      <select
                        value={pathEndId}
                        onChange={(e) => setPathEndId(e.target.value)}
                        className="block w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500 font-serif"
                      >
                        {kgEngine.getAllNodes().map(n => (
                          <option key={n.id} value={n.id}>{n.name} ({ENTITY_TYPE_TRANSLATIONS[n.type] || n.type})</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        if (pathStartId === pathEndId) {
                          setPathError("Por favor, selecione duas entidades diferentes.");
                          setPathResult(null);
                        } else {
                          const path = kgEngine.findConnectionPath(pathStartId, pathEndId);
                          if (path) {
                            setPathResult(path);
                            setPathError(null);
                          } else {
                            setPathResult(null);
                            setPathError("Nenhum caminho lógico pôde ser traçado até a profundidade máxima de 4 níveis de conexões.");
                          }
                        }
                      }}
                      className="bg-amber-500 text-slate-950 hover:bg-amber-400 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs shrink-0 h-10 flex items-center justify-center gap-2"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Calcular Caminho</span>
                    </button>
                  </div>

                  {/* Pathfinder Output */}
                  <AnimatePresence mode="wait">
                    {pathError && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 font-serif"
                      >
                        {pathError}
                      </motion.div>
                    )}

                    {pathResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 shadow-inner"
                      >
                        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block">Cadeia de Relações Tracada por Algoritmo Semântico</span>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap justify-center py-2">
                          {pathResult.map((step, stepIdx) => {
                            const nodeColor = step.node.evidenceLevel === 'mythological' 
                              ? 'border-amber-500/40 text-amber-300 bg-amber-500/5' 
                              : 'border-slate-700 text-slate-100 bg-slate-900';

                            return (
                              <div key={stepIdx} className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Entity Node */}
                                <div className={`px-4 py-3 rounded-xl border text-center font-serif flex flex-col justify-center max-w-xs ${nodeColor}`}>
                                  <span className="text-[7px] font-mono uppercase text-slate-400 tracking-wider mb-0.5">{ENTITY_TYPE_TRANSLATIONS[step.node.type] || step.node.type}</span>
                                  <strong className="text-xs">{step.node.name}</strong>
                                  <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-wider">{step.node.era}</span>
                                </div>

                                {/* Directed Relationship Link Edge */}
                                {stepIdx < pathResult.length - 1 && pathResult[stepIdx + 1]?.relationship && (
                                  <div className="flex flex-row md:flex-col items-center justify-center gap-2">
                                    <div className="h-0.5 w-8 bg-slate-700 hidden md:block" />
                                    <span className="text-[8px] font-mono uppercase text-amber-400/80 tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                      {RELATIONSHIP_TYPE_TRANSLATIONS[pathResult[stepIdx + 1].relationship?.type || ''] || pathResult[stepIdx + 1].relationship?.type}
                                    </span>
                                    <div className="h-0.5 w-8 bg-slate-700 hidden md:block" />
                                    {/* Mobile/vertical indicator arrow */}
                                    <span className="text-slate-500 block md:hidden text-lg">↓</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-serif text-slate-400 text-center">
                          <strong>Conclusão do Traçado:</strong> O algoritmo de busca em largura confirmou a existência de uma conexão intelectual de relevância histórico-cultural de nível <strong>{pathResult.length - 1}</strong> entre os termos.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MITOLOGIA */}
        {activeTab === 'mitologia' && (
          <div id="tab-mitologia" className="space-y-6">
            {/* Elegant warning disclaimer matching exact quote and style requirements */}
            <div className="bg-amber-500/[0.03] border-2 border-amber-600/20 rounded-2xl p-5 shadow-xs relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 mt-0.5 shrink-0">
                  <AlertCircle className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest">Estudo das Tradições Culturais</h4>
                  <p className="text-xs text-amber-900/90 font-serif leading-relaxed mt-1">
                    "Os conteúdos desta seção representam tradições culturais, religiosas e literárias de diferentes civilizações. Eles não devem ser interpretados como fatos históricos comprovados, mas como parte importante da história das culturas humanas."
                  </p>
                </div>
              </div>
            </div>

            {selectedMythology === null ? (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Tradições Mitológicas Globais</h2>
                  <p className="text-slate-500 text-xs font-serif leading-relaxed">
                    Explore a estrutura sistêmica das narrativas religiosas e literárias das grandes civilizações da antiguidade. CHRONOS cataloga a cosmologia e os caminhos míticos como chaves para decifrar a mentalidade e o imaginário dos povos históricos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mythologies.map((myth) => (
                    <div
                      key={myth.id}
                      onClick={() => {
                        setSelectedMythology(myth.id);
                        setActiveMythologySection('Introdução');
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${myth.color} shadow-3xs hover:shadow-xs group`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase font-bold block">
                            {myth.region}
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-600/40 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <h3 className="font-serif font-bold text-base text-slate-950 mt-2 group-hover:text-amber-900 transition-colors">
                          {myth.name}
                        </h3>
                        <p className="text-slate-400 text-[10px] font-mono mt-3 uppercase tracking-wider">
                          {myth.era}
                        </p>
                      </div>
                      <div className="mt-5 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 group-hover:text-amber-800 transition-colors pt-2.5 border-t border-slate-200/40">
                        <span>ESTRUTURA ANALÍTICA</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back Navigation */}
                <button
                  onClick={() => setSelectedMythology(null)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-slate-600 hover:text-amber-800 transition-all bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-3xs"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                  <span>Voltar ao painel de Mitologias</span>
                </button>

                {/* Mythology Header Card with custom dark background and warm highlights */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white border border-slate-800 relative overflow-hidden shadow-md">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                  <span className="text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">Módulo Temático e Cultural</span>
                  <h2 className="text-2xl font-serif font-bold text-amber-50 mt-1">
                    {mythologies.find(m => m.id === selectedMythology)?.name}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-mono text-[10px] text-slate-300">
                    <span><strong>Geografia:</strong> {mythologies.find(m => m.id === selectedMythology)?.region}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span><strong>Época de Atividade:</strong> {mythologies.find(m => m.id === selectedMythology)?.era}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mobile Navigation Dropdown (shown only on mobile/tablet) */}
                  <div className="md:hidden space-y-1.5 w-full">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                      Estrutura de Análise
                    </span>
                    <div className="relative">
                      <select
                        id="mythology-section-dropdown"
                        value={activeMythologySection}
                        onChange={(e) => setActiveMythologySection(e.target.value)}
                        className="w-full bg-white border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl p-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-3xs appearance-none font-serif cursor-pointer"
                      >
                        {mythologySections.map((sec) => (
                          <option key={sec.title} value={sec.title}>
                            {sec.title}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 border-l border-slate-100">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Left Column: List of 15 requested structural categories (Desktop only) */}
                  <div className="hidden md:block md:col-span-1 space-y-1.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">Estrutura de Análise</span>
                    {mythologySections.map((sec) => {
                      const isActive = activeMythologySection === sec.title;
                      return (
                        <button
                          key={sec.title}
                          onClick={() => setActiveMythologySection(sec.title)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border flex items-center justify-between ${
                            isActive
                              ? 'bg-amber-800/10 text-amber-900 border-amber-500/30 font-bold shadow-3xs'
                              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{sec.title}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Active section high-fidelity explanation, structure and placeholder with warm identity */}
                  <div className="md:col-span-2">
                    {(() => {
                      const data = getSpecificMythologySection(selectedMythology, activeMythologySection);
                      const theme = {
                        grega: { text: 'text-amber-800', bg: 'bg-amber-500/[0.01]', border: 'border-amber-500/10', pill: 'bg-amber-500/10 text-amber-700 border-amber-500/20', noteBg: 'bg-amber-500/[0.03]', noteBorder: 'border-amber-500/10', noteText: 'text-amber-700/90', noteLabel: 'text-amber-800', iconColor: 'text-amber-600' },
                        romana: { text: 'text-rose-800', bg: 'bg-rose-500/[0.01]', border: 'border-rose-500/10', pill: 'bg-rose-500/10 text-rose-700 border-rose-500/20', noteBg: 'bg-rose-500/[0.03]', noteBorder: 'border-rose-500/10', noteText: 'text-rose-700/90', noteLabel: 'text-rose-800', iconColor: 'text-rose-600' },
                        nordica: { text: 'text-amber-900', bg: 'bg-amber-600/[0.01]', border: 'border-amber-600/10', pill: 'bg-amber-600/10 text-amber-800 border-amber-600/20', noteBg: 'bg-amber-600/[0.03]', noteBorder: 'border-amber-600/10', noteText: 'text-amber-800/90', noteLabel: 'text-amber-900', iconColor: 'text-amber-700' },
                        egipcia: { text: 'text-yellow-900', bg: 'bg-yellow-600/[0.01]', border: 'border-yellow-600/10', pill: 'bg-yellow-600/10 text-yellow-800 border-yellow-600/20', noteBg: 'bg-yellow-600/[0.03]', noteBorder: 'border-yellow-600/10', noteText: 'text-yellow-800/90', noteLabel: 'text-yellow-900', iconColor: 'text-yellow-700' },
                        celta: { text: 'text-emerald-950', bg: 'bg-emerald-600/[0.01]', border: 'border-emerald-600/10', pill: 'bg-emerald-600/10 text-emerald-800 border-emerald-600/20', noteBg: 'bg-emerald-600/[0.03]', noteBorder: 'border-emerald-600/10', noteText: 'text-emerald-800/90', noteLabel: 'text-emerald-950', iconColor: 'text-emerald-700' },
                        mesopotamica: { text: 'text-amber-950', bg: 'bg-amber-700/[0.01]', border: 'border-amber-700/10', pill: 'bg-amber-700/10 text-amber-900 border-amber-700/20', noteBg: 'bg-amber-700/[0.03]', noteBorder: 'border-amber-700/10', noteText: 'text-amber-900/90', noteLabel: 'text-amber-950', iconColor: 'text-amber-800' },
                        japonesa: { text: 'text-red-900', bg: 'bg-red-600/[0.01]', border: 'border-red-600/10', pill: 'bg-red-600/10 text-red-800 border-red-600/20', noteBg: 'bg-red-600/[0.03]', noteBorder: 'border-red-600/10', noteText: 'text-red-800/90', noteLabel: 'text-red-900', iconColor: 'text-red-700' },
                        chinesa: { text: 'text-orange-900', bg: 'bg-orange-600/[0.01]', border: 'border-orange-600/10', pill: 'bg-orange-600/10 text-orange-800 border-orange-600/20', noteBg: 'bg-orange-600/[0.03]', noteBorder: 'border-orange-600/10', noteText: 'text-orange-800/90', noteLabel: 'text-orange-900', iconColor: 'text-orange-700' },
                        maia: { text: 'text-teal-900', bg: 'bg-teal-600/[0.01]', border: 'border-teal-600/10', pill: 'bg-teal-600/10 text-teal-800 border-teal-600/20', noteBg: 'bg-teal-600/[0.03]', noteBorder: 'border-teal-600/10', noteText: 'text-teal-800/90', noteLabel: 'text-teal-900', iconColor: 'text-teal-750' },
                        asteca: { text: 'text-yellow-950', bg: 'bg-yellow-700/[0.01]', border: 'border-yellow-700/10', pill: 'bg-yellow-700/10 text-yellow-900 border-yellow-700/20', noteBg: 'bg-yellow-700/[0.03]', noteBorder: 'border-yellow-700/10', noteText: 'text-yellow-900/90', noteLabel: 'text-yellow-950', iconColor: 'text-yellow-800' },
                        inca: { text: 'text-yellow-900', bg: 'bg-yellow-500/[0.01]', border: 'border-yellow-500/10', pill: 'bg-yellow-500/10 text-yellow-850 border-yellow-500/20', noteBg: 'bg-yellow-500/[0.03]', noteBorder: 'border-yellow-500/10', noteText: 'text-yellow-800/90', noteLabel: 'text-yellow-900', iconColor: 'text-yellow-700' },
                        hindu: { text: 'text-purple-900', bg: 'bg-purple-600/[0.01]', border: 'border-purple-600/10', pill: 'bg-purple-600/10 text-purple-800 border-purple-600/20', noteBg: 'bg-purple-600/[0.03]', noteBorder: 'border-purple-600/10', noteText: 'text-purple-800/90', noteLabel: 'text-purple-900', iconColor: 'text-purple-700' },
                        brasileiro: { text: 'text-emerald-800', bg: 'bg-emerald-500/[0.01]', border: 'border-emerald-500/10', pill: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', noteBg: 'bg-emerald-500/[0.03]', noteBorder: 'border-emerald-500/10', noteText: 'text-emerald-700/90', noteLabel: 'text-emerald-800', iconColor: 'text-emerald-600' }
                      }[selectedMythology as string] || { text: 'text-emerald-800', bg: 'bg-emerald-500/[0.01]', border: 'border-emerald-500/10', pill: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', noteBg: 'bg-emerald-500/[0.03]', noteBorder: 'border-emerald-500/10', noteText: 'text-emerald-700/90', noteLabel: 'text-emerald-800', iconColor: 'text-emerald-600' };

                      return (
                        <div className={`${theme.bg} border-2 ${theme.border} rounded-2xl p-6 shadow-3xs min-h-[400px] flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <div className={`p-1.5 rounded-lg ${theme.pill}`}>
                                <Sparkles className="w-4 h-4 stroke-[1.5]" />
                              </div>
                              <h3 className="text-lg font-serif font-bold text-slate-900">{data.title}</h3>
                            </div>

                            <p className="text-slate-700 text-sm font-serif leading-relaxed mb-6">
                              {data.details}
                            </p>

                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3 shadow-3xs">
                              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 border-b border-slate-100 pb-2">
                                <Info className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                                <span>Aspectos Principais Relevantes</span>
                              </div>

                              <ul className="text-xs text-slate-600 space-y-2 pl-4 list-disc font-serif leading-relaxed">
                                {data.bullets.map((bullet, idx) => (
                                  <li key={idx}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className={`mt-6 ${theme.noteBg} border ${theme.noteBorder} rounded-xl p-4`}>
                            <span className={`text-[9px] font-mono uppercase tracking-widest ${theme.noteLabel} font-bold block mb-1`}>Nota Científica & Acadêmica</span>
                            <p className={`text-[11px] ${theme.noteText} font-serif leading-relaxed`}>
                              {data.scientificNote}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SAVED / SOURCES */}
        {activeTab === 'saved' && (
          <div id="tab-saved" className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Acervo Bibliográfico</h2>
              <p className="text-slate-500 text-xs font-serif leading-relaxed">
                Esta seção armazena as principais fontes que dão embasamento empírico e textual às nossas investigações de campo.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Fontes Ativas Reconhecidas</h3>
              <div className="grid grid-cols-1 gap-3">
                {allCards.flatMap((c) => c.sources || []).map((src, index) => (
                  <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                      <BookOpen className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] uppercase font-mono tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                          {src.type === 'book' ? 'Livro' : src.type === 'document' ? 'Manuscrito' : 'Artigo Acadêmico'}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">{src.details}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug mt-1 truncate">{src.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{src.author} ({src.year})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: USER PROFILE */}
        {activeTab === 'profile' && (
          <div id="tab-profile" className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-amber-400 font-serif font-bold text-3xl flex items-center justify-center border-4 border-amber-500/20">
                {userState.name.charAt(0)}
              </div>
              <div className="text-center sm:text-left flex-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Investigador Acadêmico
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">{userState.name}</h3>
                <p className="text-slate-500 text-xs font-mono">{userState.email}</p>
                <p className="text-slate-400 text-xs mt-1">Membro ativo desde: {userState.joinedDate}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Rendimento Investigativo</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-2xl font-mono font-bold text-slate-900">{masteredCards.length}</span>
                  <span className="text-[11px] text-slate-500 font-serif">Cartões Analisados</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="block text-2xl font-mono font-bold text-amber-600">{userState.xp}</span>
                  <span className="text-[11px] text-slate-500 font-serif">Pontos XP Obtidos</span>
                </div>
              </div>
            </div>

            {/* Rigor Historiográfico (Substitui achievements infantis) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Rigor Científico Adotado</span>
              </h3>
              <p className="text-xs text-slate-500 font-serif leading-relaxed">
                Este perfil adere estritamente às normas do método histórico e historiográfico científico. Todo o progresso registrado atesta a leitura de dados baseados em fatos comprovados, distinção analítica e estudo bibliográfico rigoroso.
              </p>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div id="tab-settings" className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Compromisso Editorial</h2>
              <p className="text-slate-500 text-xs font-serif leading-relaxed">
                Gerencie sua conta e examine as diretrizes acadêmicas que fundamentam nosso portal.
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Diretrizes de Rigor Historiográfico</span>
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Separação Metódica:</strong> Divisão clara entre fatos consensuais e correntes de interpretação da época.</span>
                </div>
                <div className="flex gap-3 items-start text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Transparência de Fontes:</strong> Fornecimento contínuo das coordenadas exatas dos manuscritos e livros consultados.</span>
                </div>
                <div className="flex gap-3 items-start text-xs text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Independência Teórica:</strong> Abordagem neutra despida de anacronismos ou visões lúdicas infantis.</span>
                </div>
              </div>
            </div>

            {/* Settings Options (Restauração de XP removida!) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
              <button
                id="admin-panel-button"
                onClick={() => setShowAdminPanel(true)}
                className="w-full text-left px-6 py-4 hover:bg-amber-50 text-amber-900 transition-colors flex items-center justify-between text-xs font-semibold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Painel de Controle (Gestão de Usuários & IA Híbrida)</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Abrir
                </span>
              </button>

              <button
                id="logout-button"
                onClick={onLogout}
                className="w-full text-left px-6 py-4 hover:bg-rose-50 text-rose-600 transition-colors flex items-center justify-between text-xs font-semibold"
              >
                <span>Terminar Sessão Acadêmica (Logout)</span>
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">CHRONOS • Conhecimento através do tempo</p>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedSourcesCount}
      />

      {/* Admin Control Panel Modal */}
      {showAdminPanel && (
        <AdminPanel
          currentUser={userState}
          onClose={() => setShowAdminPanel(false)}
          cards={allCards}
          onAddCard={handleAddCardFromAdmin}
          onDeleteCard={handleDeleteCardFromAdmin}
          onUpdateCard={handleUpdateCardFromAdmin}
          timelineSteps={mergedTimelineSteps}
        />
      )}
    </div>
  );
}
