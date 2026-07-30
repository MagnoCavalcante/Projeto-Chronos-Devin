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
import { CHRONOSKnowledgeEngine } from '../lib/knowledgeGraphEngine';
import { getSpecificMythologySection } from '../data/mythologyData';

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
    locations: ['Madri', 'Barcelona', 'Guernica', 'Sevilha', 'Valencia'],
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
    routes: ['Importação de grãos do Mar Negro', 'Metais preciosos de Laurion', 'Exportação de cerâmicas e azeite']
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
    title: 'Gra-Bretanha e a Bacia do Carvão',
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
    locations: ['Karakorum', 'Chang’an', 'Samarcanda', 'Bagdá', 'Pequim', 'Caffa'],
    description: 'A teia de rotas caravaneiras conectando a Ásia Oriental ao Mediterrâneo, unificada sob a Pax Mongolica de Genghis Khan e Kublai Khan.',
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
  const TIMELINE_STEPS = [
    {
      id: 'sumeria',
      year: -3200,
      label: '3200 a.C.',
      era: 'Antiguidade Oriental',
      title: 'A Aurora da Escrita',
      description: 'A invenção da escrita cuneiforme na Mesopotâmia marca o início do registro documental humano.',
      meanwhile: [
        { region: 'Egito Antigo', event: 'Unificação do Alto e Baixo Egito sob o Rei Narmer.' },
        { region: 'América Latina', event: 'Cultivo primário do milho na Mesoamérica.' },
        { region: 'Ásia (China)', event: 'Culturas neolíticas ao longo do Rio Amarelo.' },
        { region: 'Europa', event: 'Primeiras estruturas megalíticas em Stonehenge.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Crescente Fértil & Vale do Nilo'
    },
    {
      id: 'hamurabi',
      year: -1750,
      label: '1750 a.C.',
      era: 'Antiguidade Oriental',
      title: 'O Código de Hamurabi',
      description: 'Codificação de 282 leis em acádio cuneiforme gravadas na Estela de Diorita, consagrando a Lei do Talion.',
      meanwhile: [
        { region: 'Egito Antigo', event: 'Período do Império Médio egípcio e expansão agrícola na região de Fayum.' },
        { region: 'China (Dinastia Shang)', event: 'Desenvolvimento do bronze ritualístico e dos ossos oraculares.' },
        { region: 'Civilização Minoica', event: 'Auge dos palácios monumentais de Cnossos na ilha de Creta.' },
        { region: 'Vale do Indo', event: 'Declínio das grandes cidades planejadas de Harappa e Mohenjo-daro.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Império Paleobabilônico e Mesopotâmia'
    },
    {
      id: 'grecia-classica',
      year: -500,
      label: '500 a.C.',
      era: 'Antiguidade Clássica',
      title: 'Democracia e Filosofia em Atenas',
      description: 'As reformas de Clístenes e a efervescência das correntes intelectuais e filosóficas na Atenas clássica.',
      meanwhile: [
        { region: 'China', event: 'Confúcio e Laozi formulam as bases do pensamento filosófico oriental.' },
        { region: 'América', event: 'Ascensão da Civilização Zapoteca na Mesoamérica (Monte Albán).' },
        { region: 'Índia', event: 'Pregações de Siddhartha Gautama (o Buda) no vale do Ganges.' },
        { region: 'África', event: 'Metalurgia do ferro pela cultura Nok na atual Nigéria.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Hélade Clássica e Cidades-Estado'
    },
    {
      id: 'alexandria',
      year: -300,
      label: '300 a.C.',
      era: 'Antiguidade Clássica',
      title: 'A Biblioteca de Alexandria',
      description: 'O maior polo do conhecimento helenístico reuniu o saber do mundo antigo nas margens do Nilo.',
      meanwhile: [
        { region: 'Índia', event: 'O Império Maurya unifica o subcontinente sob a dinastia de Chandragupta.' },
        { region: 'China', event: 'Período dos Reinos Combatentes preparando a unificação sob Qin Shi Huang.' },
        { region: 'Roma', event: 'Expansão da República Romana pela península Itálica durante as Guerras Samnitas.' },
        { region: 'América', event: 'Construção das pirâmides maias primordiais em El Mirador (Guatemala).' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Mundo Helenístico e Mediterrâneo'
    },
    {
      id: 'roma-republica',
      year: -49,
      label: '49 a.C.',
      era: 'Antiguidade Clássica Romana',
      title: 'A Travessia do Rubicão',
      description: 'Júlio César lidera a XIII Legião através do rio Rubicão, deflagrando a Guerra Civil contra o Senado.',
      meanwhile: [
        { region: 'China Imperial', event: 'A Dinastia Han Ocidental consolida a Rota da Seda.' },
        { region: 'América', event: 'Teotihuacán planeja suas primeiras pirâmides monumentais no México.' },
        { region: 'Egito Ptolemaico', event: 'Cleópatra VII disputa o trono e articula alianças com generais romanos.' },
        { region: 'Índia', event: 'Império Satavahana domina rotas comerciais marítimas.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Províncias Romanas'
    },
    {
      id: 'queda-roma',
      year: 476,
      label: '476 d.C.',
      era: 'Antiguidade Tardia / Idade Média',
      title: 'A Queda do Império Romano',
      description: 'O líder germânico Odoacro depõe o imperador Rômulo Augusto, encerrando o Império Ocidental.',
      meanwhile: [
        { region: 'Império Bizantino', event: 'Constantinopla consolida-se como a próspera capital do Oriente.' },
        { region: 'América do Sul', event: 'Cultura Nazca desenha os geóglifos monumentais no deserto andino.' },
        { region: 'Japão', event: 'Período Kofun; consolidação da monarquia Yamato.' },
        { region: 'África', event: 'Reino de Aksum domina o comércio do Mar Vermelho.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Reinos Germânicos na Europa'
    },
    {
      id: 'reiartur',
      year: 500,
      label: 'Séc. VI',
      era: 'Idade Média',
      title: 'A Historicidade do Rei Artur',
      description: 'A investigação sobre os vestígios dos líderes britões que resistiram às invasões anglo-saxãs.',
      meanwhile: [
        { region: 'Império Bizantino', event: 'Reinado de Justiniano I e compilação do Corpus Juris Civilis.' },
        { region: 'China', event: 'Dinastias do Norte e do Sul dominam a Ásia oriental.' },
        { region: 'Mesoamérica', event: 'Apogeu urbano da metrópole maia de Tikal.' },
        { region: 'Índia', event: 'Era de Ouro das artes e matemática sob a dinastia Gupta.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Bretanha Pós-Romana'
    },
    {
      id: 'islamismo',
      year: 622,
      label: '622 d.C.',
      era: 'Alta Idade Média',
      title: 'O Surgimento do Islamismo',
      description: 'A Hégira de Maomé para Medina unifica a Arábia e inicia a grande expansão científica e geopolítica islâmica.',
      meanwhile: [
        { region: 'China (Dinastia Tang)', event: 'Apogeu cultural e abertura da capital Chang’an ao comércio mundial.' },
        { region: 'Mesoamérica', event: 'Reinado de Pakal, o Grande, na cidade maia de Palenque.' },
        { region: 'Europa Ocidental', event: 'Reinos Merovíngios consolidam-se na antiga Gália romana.' },
        { region: 'Japão', event: 'Reformas Taika instituem a administração imperial inspirada na China.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Expansão Árabe e Califados'
    },
    {
      id: 'rota-da-seda-imperio-mongol',
      year: 1206,
      label: '1206 d.C.',
      era: 'Idade Média',
      title: 'A Rota da Seda e o Império Mongol',
      description: 'Genghis Khan unifica os clãs nômades e expande o maior império territorial contínuo da história, conectando o comércio e as ciências entre Oriente e Ocidente.',
      meanwhile: [
        { region: 'Europa', event: 'Quarta Cruzada e conquista temporária de Constantinopla por cavaleiros ocidentais.' },
        { region: 'América (Andes)', event: 'Surgimento das primeiras confederações pré-incas no vale do Cusco.' },
        { region: 'África', event: 'O Império do Mali inicia sua expansão dourada sob a dinastia Keita.' },
        { region: 'Oriente Próximo', event: 'Florescimento da medicina e filosofia islâmica nos centros de Bagdá e Cairo.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Rota da Seda e Territórios Mongóis'
    },
    {
      id: 'constantinopla',
      year: 1453,
      label: '1453 d.C.',
      era: 'Fim da Idade Média',
      title: 'A Queda de Constantinopla',
      description: 'O sultão Mehmed II toma o Bósforo, encerrando Bizâncio e estimulando a busca por novas rotas marítimas.',
      meanwhile: [
        { region: 'Europa', event: 'Fim da Guerra dos Cem Anos entre França e Inglaterra.' },
        { region: 'América (Império Inca)', event: 'Pachacuti expande o Tawantinsuyu e inicia a construção de Machu Picchu.' },
        { region: 'Alemanha', event: 'Gutenberg imprime a primeira Bíblia de tipos móveis em Mainz.' },
        { region: 'Brasil', event: 'Sociedades Tupi-Guarani dominam a gestão sustentável das florestas tropicais.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Bósforo e Império Otomano'
    },
    {
      id: 'tordesilhas',
      year: 1492,
      label: '1492 d.C.',
      era: 'Idade Moderna',
      title: 'O Tratado de Tordesilhas',
      description: 'A partição do Novo Mundo entre as coroas de Castela e Portugal chancelada pela diplomacia papal.',
      meanwhile: [
        { region: 'Brasil Pré-Cabralino', event: 'Comunidades tupi e jê dominam a costa atlântica sul-americana.' },
        { region: 'China (Ming)', event: 'Reconstrução da Grande Muralha e florescimento das porcelanas.' },
        { region: 'Japão Feudal', event: 'Período Sengoku e guerras locais entre clãs samurais.' },
        { region: 'Espanha', event: 'Queda de Granada e expulsão dos mouros da Península Ibérica.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Partição de Tordesilhas e Rotas Marítimas'
    },
    {
      id: 'brasil-colonial',
      year: 1500,
      label: '1500 d.C.',
      era: 'História do Brasil',
      title: 'A Chegada dos Portugueses',
      description: 'A frota de Pedro Álvares Cabral aporta no litoral baiano, dando início ao Período Colonial brasileiro.',
      meanwhile: [
        { region: 'Europa', event: 'Renascimento Cultural no auge com Leonardo da Vinci e Michelangelo.' },
        { region: 'Mesoamérica', event: 'Império Asteca sob Montezuma II domina o vale central mexicano.' },
        { region: 'Índia', event: 'Vasco da Gama estabelece a Feitoria de Cochim nas Índias.' },
        { region: 'África', event: 'Reino do Congo mantém relações diplomáticas formais com Portugal.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Costa do Brasil e Economia Açucareira'
    },
    {
      id: 'reforma-protestante',
      year: 1517,
      label: '1517 d.C.',
      era: 'Idade Moderna',
      title: 'A Reforma Protestante',
      description: 'Martinho Lutero afixa as 95 Teses na igreja de Wittenberg, desencadeando a cisão na cristandade ocidental.',
      meanwhile: [
        { region: 'América', event: 'Hernán Cortés inicia a expedição contra o Império Asteca.' },
        { region: 'Império Otomano', event: 'Sultão Selim I conquista o Egito mameluco e assume o Califado.' },
        { region: 'Itália', event: 'Maquiavel escreve "O Príncipe" sobre a lógica do poder absolutista.' },
        { region: 'Índia', event: 'Babur funda o monumental Império Mogol no norte indiano.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Europa da Reforma e Imprima de Gutenberg'
    },
    {
      id: 'revolucao-industrial',
      year: 1760,
      label: '1760 d.C.',
      era: 'Idade Contemporânea',
      title: 'A Primeira Revolução Industrial',
      description: 'A mecanização da produção alimentada a carvão e vapor transforma drasticamente o trabalho e a economia.',
      meanwhile: [
        { region: 'Brasil Colonial', event: 'Ciclo do Ouro em Minas Gerais e transferência da capital para o Rio de Janeiro (1763).' },
        { region: 'EUA', event: 'Tensão cresce entre as Treze Colônias e a Coroa Britânica (fatos pré-1776).' },
        { region: 'China (Qing)', event: 'Reinado próspero do Imperador Qianlong e controle do comércio de chá.' },
        { region: 'França', event: 'Enciclopedistas como Diderot e Voltaire propagam o Iluminismo.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Gra-Bretanha e a Bacia do Carvão'
    },
    {
      id: 'independencia-eua-1776',
      year: 1776,
      label: '1776 d.C.',
      era: 'Idade Moderna',
      title: 'A Independência dos EUA',
      description: 'A Declaração de Independência das Treze Colônias funda a primeira república constitucional democrática embasada nos valores iluministas.',
      meanwhile: [
        { region: 'França', event: 'Crise financeira na corte dos Bourbon e propagação das ideias Iluministas.' },
        { region: 'Brasil Colonial', event: 'Auge da mineração e transferência da capital para o Rio de Janeiro.' },
        { region: 'Grã-Bretanha', event: 'Aprimoramento da máquina a vapor por James Watt impulsionando a indústria.' },
        { region: 'Pacífico', event: 'Expedições do Capitão James Cook cartografam a Austrália e Oceania.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'As Treze Colônias Americanas'
    },
    {
      id: 'revolucao-francesa',
      year: 1789,
      label: '1789 d.C.',
      era: 'Idade Contemporânea',
      title: 'A Revolução Francesa',
      description: 'A Queda da Bastilha destitui o absolutismo e promulga a Declaração dos Direitos do Homem e do Cidadão.',
      meanwhile: [
        { region: 'Brasil Colonial', event: 'Conspiração da Inconfidência Mineira liderada por Tiradentes.' },
        { region: 'EUA', event: 'George Washington assume a primeira presidência dos Estados Unidos.' },
        { region: 'Haiti', event: 'Início dos levantes que levariam à primeira revolução negra vitoriosa.' },
        { region: 'Austrália', event: 'Chegada da Primeira Frota britânica e início da colonização de Sydney.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Europa Revolucionária'
    },
    {
      id: 'brasil-imperio',
      year: 1822,
      label: '1822 d.C.',
      era: 'História do Brasil',
      title: 'Independência e Império do Brasil',
      description: 'O Grito do Ipiranga por D. Pedro I funda o Império do Brasil, seguido pela era de estabilidade sob D. Pedro II.',
      meanwhile: [
        { region: 'Hispano-América', event: 'Simón Bolívar e San Martín libertam as colônias espanholas do Sul.' },
        { region: 'Europa', event: 'Período de Restauração após o Congresso de Viena e o fim de Napoleão.' },
        { region: 'EUA', event: 'Doutrina Monroe declara "A América para os americanos".' },
        { region: 'Grã-Bretanha', event: 'Pioneirismo nas estradas de ferro a vapor públicas.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Império do Brasil e Vale do Paraíba'
    },
    {
      id: 'restauracao-meiji-japao',
      year: 1868,
      label: '1868 d.C.',
      era: 'Século XIX',
      title: 'A Restauração Meiji no Japão',
      description: 'O fim do Xogunato Tokugawa e da era dos samurais dá lugar à rápida industrialização e modernização do Japão Imperial.',
      meanwhile: [
        { region: 'EUA', event: 'Fim da Guerra Civil Americana (Secessão) e abolição da escravidão.' },
        { region: 'Brasil Império', event: 'Guerra do Paraguai e ascensão da lavoura cafeeira paulista.' },
        { region: 'Europa', event: 'Processos de Unificação da Itália (Garibaldi) e da Alemanha (Bismarck).' },
        { region: 'África', event: 'Resistência nativa contra o avanço das expedições de exploração do Imperialismo.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Arquipélago Japonês e Era Meiji'
    },
    {
      id: 'primeira-guerra-russa',
      year: 1914,
      label: '1914-1917',
      era: 'Século XX',
      title: 'Primeira Guerra e Revolução Russa',
      description: 'A Primeira Guerra Mundial desintegra impérios e os bolcheviques liderados por Lênin criam a União Soviética.',
      meanwhile: [
        { region: 'Brasil', event: 'Surto de industrialização por substituição de importações e Guerra do Contestado.' },
        { region: 'EUA', event: 'Entrada na Grande Guerra em 1917 emergindo como credor mundial.' },
        { region: 'México', event: 'Revolução Mexicana em pleno curso sob Zapata e Pancho Villa.' },
        { region: 'China', event: 'Queda do último imperador e fundação da República da China (1912).' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1513829096999-4978602297f7?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Europa em Guerra e Império Russo'
    },
    {
      id: 'era-vargas',
      year: 1930,
      label: '1930 d.C.',
      era: 'História do Brasil',
      title: 'A Era Vargas e a Modernização',
      description: 'Getúlio Vargas assume o poder, centraliza o Estado e promulga os direitos trabalhistas e a CLT.',
      meanwhile: [
        { region: 'EUA', event: 'Grande Depressão decorrente da Crise de 1929 e o New Deal de FDR.' },
        { region: 'Europa', event: 'Ascensão do Nazifascismo na Alemanha (Hitler) e Itália (Mussolini).' },
        { region: 'Índia', event: 'Mahatma Gandhi lidera a Marcha do Sal em protesto pacífico.' },
        { region: 'URSS', event: 'Industrialização acelerada sob os Planos Quinquenais de Stálin.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Brasil da Era Vargas'
    },
    {
      id: 'segunda-guerra-holocausto',
      year: 1939,
      label: '1939-1945',
      era: 'Século XX',
      title: 'Segunda Guerra e Holocausto',
      description: 'A mobilização militar total contra o Eixo e o genocídio sistemático de 6 milhões de judeus na Europa.',
      meanwhile: [
        { region: 'Brasil', event: 'Envio da Força Expedicionária Brasileira (FEB) para combater na Itália.' },
        { region: 'EUA', event: 'Projeto Manhattan desenvolve as primeiras armas atômicas da história.' },
        { region: 'Ásia', event: 'Ocupação japonesa na China e Guerra do Pacífico.' },
        { region: 'Mundo', event: 'Criação da Organização das Nações Unidas (ONU) em 1945.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Teatro Global da Segunda Guerra'
    },
    {
      id: 'descolonizacao-africa-asia',
      year: 1947,
      label: '1947-1994',
      era: 'Século XX',
      title: 'Descolonização e Fim do Apartheid',
      description: 'A independência não-violenta da Índia sob Gandhi e a derrocada dos domínios imperiais europeus culminando na libertação da África do Sul sob Mandela.',
      meanwhile: [
        { region: 'Europa / EUA', event: 'Formação da OTAN e Plano Marshall para reconstrução europeia.' },
        { region: 'China', event: 'Revolução Chinesa de 1949 liderada por Mao Tsé-Tung.' },
        { region: 'Oriente Médio', event: 'Criação do Estado de Israel pela Resolução da ONU e primeira guerra árabe-israelense.' },
        { region: 'América Latina', event: 'Industrialização por substituição de importações e lutas sociais.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Ásia, África e o Fim do Apartheid'
    },
    {
      id: 'direitos-civis-eua-1960',
      year: 1963,
      label: 'Anos 1960',
      era: 'Século XX',
      title: 'Movimento dos Direitos Civis nos EUA',
      description: 'A marcha histórica contra a segregação racial Jim Crow com lideranças como Martin Luther King Jr. e Malcolm X, alcançando a aprovação da Lei dos Direitos Civis.',
      meanwhile: [
        { region: 'Guerra Fria', event: 'Crise dos Mísseis em Cuba (1962) trazendo o mundo à beira do confronto nuclear.' },
        { region: 'Brasil', event: 'Tensão política pré-golpe de 1964 e reformas de base do governo João Goulart.' },
        { region: 'Vietnã', event: 'Escalada da intervenção militar americana e surgimento do movimento de contracultura.' },
        { region: 'Vaticano', event: 'Concílio Vaticano II moderniza ritos e doutrina social da Igreja Católica.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'EUA e o Sul de Segregação Racial'
    },
    {
      id: 'ditadura-militar-brasil',
      year: 1964,
      label: '1964-1985',
      era: 'História do Brasil',
      title: 'Ditadura Militar e Redemocratização',
      description: 'O golpe de 1964 instala duas décadas de regime militar, encerradas pela mobilização das Diretas Já e a Constituição de 1988.',
      meanwhile: [
        { region: 'Mundo Bipolar', event: 'Guerra Fria em apogeu; Crise dos Mísseis em Cuba e Guerra do Vietnã.' },
        { region: 'Europa', event: 'Movimentos estudantis e operários do Maio de 1968 em Paris.' },
        { region: 'América Latina', event: 'Operação Condor interliga serviços de inteligência ditatoriais do Cone Sul.' },
        { region: 'África', event: 'Independência das colônias portuguesas (Angola, Moçambique).' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Brasil e o Cone Sul'
    },
    {
      id: 'pouso-lua',
      year: 1969,
      label: '1969 d.C.',
      era: 'Idade Contemporânea',
      title: 'A Corrida Espacial e Pouso Lunar',
      description: 'A tripulação da Apollo 11 caminha pela primeira vez no solo lunar, ápice tecnológico da Guerra Fria.',
      meanwhile: [
        { region: 'América Latina', event: 'Ditaduras militares vigentes durante a competição de superpotências.' },
        { region: 'Vietnã', event: 'Guerra do Vietnã e ascensão dos movimentos pacifistas.' },
        { region: 'África', event: 'Consolidação das independências e lutas pós-coloniais.' },
        { region: 'Japão', event: 'Milagre econômico pós-guerra despontando como centro tecnológico.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Ordem Bipolar da Guerra Fria'
    },
    {
      id: 'guerra-fria-queda-muro-berlim',
      year: 1989,
      label: '1989 d.C.',
      era: 'Fim do Século XX',
      title: 'Queda do Muro de Berlim e Fim da URSS',
      description: 'A derrubada do Muro de Berlim encerra simbolicamente a Guerra Fria, reunificando a Alemanha e antecedendo a dissolução da União Soviética em 1991.',
      meanwhile: [
        { region: 'Brasil', event: 'Primeira eleição presidencial direta após a Ditadura e promulgação da Constituição de 1988.' },
        { region: 'China', event: 'Protestos da Praça da Paz Celestial em Pequim exigindo reformas democráticas.' },
        { region: 'Tecnologia', event: 'Tim Berners-Lee inventa a World Wide Web (WWW) no CERN, iniciando a Era Digital.' },
        { region: 'América Latina', event: 'Processos de transição democrática e combate à inflação na América do Sul.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Berlim, Europa e a Ordem Pós-Guerra Fria'
    },
    {
      id: 'mitologia-nordica',
      year: 2000,
      label: 'Mito Nórdico',
      era: 'Mitologias',
      title: 'Cosmologia Nórdica e Asgard',
      description: 'A tradição mítica dos nove reinos sustentados pela árvore Yggdrasil, o Panteão dos Aesir e o profético Ragnarök.',
      meanwhile: [
        { region: 'Escandinávia Viking', event: 'Tradição oral preservada posteriormente pelas Eddas na Islândia medieval.' },
        { region: 'Tradições Paralelas', event: 'Mitologias eslava, celta e germânica florescem no norte da Europa.' },
        { region: 'Simbolismo', event: 'Runos divinos e representação do coragem heroica diante do destino inelutável.' },
        { region: 'Impacto Cultural', event: 'Inspiração profunda para a literatura de fantasia clássica e moderna.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Nove Reinos de Yggdrasil'
    },
    {
      id: 'mitologia-mesoamericana',
      year: 2001,
      label: 'Mito das Américas',
      era: 'Mitologias',
      title: 'Popol Vuh e os Mitos do Milho',
      description: 'A visão mitológica maia, asteca e inca sobre a criação da humanidade a partir do milho e os ritos de sacrifício ao Sol.',
      meanwhile: [
        { region: 'Mesoamérica', event: 'Culto venerado a Quetzalcóatl (Serpente Emplumada) em Teotihuacán e Chichén Itzá.' },
        { region: 'Andes', event: 'Mitologia inca e o culto a Inti (Deus Sol) e Pacha Mama (Mãe Terra).' },
        { region: 'Amazonia', event: 'Tradições ancestrais dos povos originários sobre a criação do mundo e dos rios.' },
        { region: 'Preservação', event: 'Transcrição em manuscritos maia-quiché preservada nos cutes de Popol Vuh.' }
      ],
      mapUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      mapLabel: 'Territórios Sagrados das Américas'
    }
  ];

  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  const [customCards, setCustomCards] = useState<HistoryCard[]>(() => {
    const saved = localStorage.getItem('chronos_custom_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [customTimelineSteps, setCustomTimelineSteps] = useState<any[]>(() => {
    const saved = localStorage.getItem('chronos_custom_timeline');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddCardFromAdmin = (card: HistoryCard, timelineStep?: any, kgNodes?: any[]) => {
    const updatedCards = [card, ...customCards];
    setCustomCards(updatedCards);
    localStorage.setItem('chronos_custom_cards', JSON.stringify(updatedCards));

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
  };

  const [currentTimelineIndex, setCurrentTimelineIndex] = useState<number>(() => {
    if (typeof initialYear === 'number') {
      const idx = TIMELINE_STEPS.findIndex(step => step.year === initialYear);
      if (idx !== -1) return idx;
    }
    return 2; // Default is 49 a.C. or 476 d.C.
  });
  const [viewingDossier, setViewingDossier] = useState<boolean>(() => {
    if (typeof initialYear === 'number') {
      const idx = TIMELINE_STEPS.findIndex(step => step.year === initialYear);
      return idx !== -1;
    }
    return false;
  });

  useEffect(() => {
    if (typeof initialYear === 'number') {
      const idx = TIMELINE_STEPS.findIndex(step => step.year === initialYear);
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
  const mockCards: HistoryCard[] = [
    {
      id: 'sumeria',
      category: 'História',
      period: 'Antiguidade',
      title: 'A Invenção da Escrita Cuneiforme (c. 3200 a.C.)',
      era: 'Antiguidade Oriental (c. 3200 a.C.)',
      evidenceLevel: 'high',
      summary: 'A transição de fichas contábeis de argila para tabuletas cuneiformes em Uruk. Síntese executiva sobre a necessidade de controle tributário, o mecanismo administrativo da escrita e seu impacto cognitivo e histórico.',
      fact: {
        title: 'O Contexto Urbano e a Transição dos Artefatos de Argila em Uruk',
        description: 'No final do 4º milênio a.C., a cidade suméria de Uruk experimentou um boom demográfico e administrativo sem precedentes. Para gerir colheitas, tributos de cevada e rebanhos rituais do complexo do Templo de Eanna, os administradores evoluíram de fichas tridimensionais (calculi) seladas em esferas ocas de argila (bullae) para tabuletas planas marcadas com estiletes de junco em formato de cunha, originando a escrita proto-cuneiforme.'
      },
      interpretation: {
        title: 'A Teoria de Denise Schmandt-Besserat e a Revolução Cognitivo-Administrativa',
        description: 'A arqueóloga Denise Schmandt-Besserat provou que a escrita não nasceu da literatura ou religião, mas da necessidade contábil. A transição do pictograma ao ideograma e, posteriormente, ao fonograma (princípio do rébus) permitiu registrar abstrações, leis e memórias sociais, reconfigurando a estrutura do poder estatal centralizado e a própria cognição humana.'
      },
      hypothesis: {
        title: 'Origem Contábil Monogênica vs. Poligênese da Escrita',
        description: 'Enquanto o consenso acadêmico (Hans J. Nissen e Schmandt-Besserat) corrobora a matriz contábil mesopotâmica na Baixa Mesopotâmia, debate-se se a escrita egípcia (hieróglifos c. 3250 a.C.) surgiu por estímulo cultural indireto da Suméria ou por invenção endógena independente.'
      },
      timeline: [
        { year: 'c. 8000–3500 a.C.', event: 'Uso de fichas simples de argila (calculi) para contagem de bens e grãos no Crescente Fértil.' },
        { year: 'c. 3500–3300 a.C.', event: 'Surgimento das "bullae" (esferas ocas de argila seladas) e fichas complexas gravadas.' },
        { year: 'c. 3200 a.C.', event: 'Primeiras tabuletas de argila com registros pictográficos e proto-cuneiforme no Templo de Eanna (Uruk IV).' },
        { year: 'c. 2900–2600 a.C.', event: 'Desenvolvimento do fonetismo (rébus); transição de símbolos pictográficos para caracteres cuneiformes abstratos.' },
        { year: 'c. 2600 a.C.', event: 'Surgimento da literatura (Epopeia de Gilgamesh), códigos de leis primordiais e textos litúrgicos.' }
      ],
      characters: [
        { name: 'Enmerkar', role: 'Rei Lendário de Uruk', bio: 'Figura mitológico-histórica a quem a tradição suméria (no poema Enmerkar e o Senhor de Aratta) atribui a invenção da escrita em argila para enviar mensagens diplomáticas imutáveis.' },
        { name: 'Denise Schmandt-Besserat', role: 'Arqueóloga e Epigrafista Contemporânea', bio: 'Responsável pela teoria revolucionária de que as fichas contábeis neolíticas (tokens) deram origem direta aos sinais cuneiformes.' },
        { name: 'Hans J. Nissen', role: 'Historador e Arqueólogo (Univ. Livre de Berlim)', bio: 'Líder do Projeto Uruk-Warka, responsável pela decifração do sistema contábil e socioeconômico das tabuletas arcaicas de Uruk.' }
      ],
      sources: [
        { id: 'src-cun-1', title: 'Tabuletas do Templo de Eanna (Uruk IV)', author: 'Escribas de Uruk', year: -3200, type: 'archaeological', details: 'Acervo do Museu do Iraque / Museu Pergamon' },
        { id: 'src-cun-2', title: 'How Writing Came About', author: 'Denise Schmandt-Besserat', year: 1996, type: 'book', details: 'University of Texas Press, Cap. 1-4' },
        { id: 'src-cun-3', title: 'Archaic Bookkeeping: Early Writing and Techniques of Economic Administration in the Ancient Near East', author: 'Hans J. Nissen, Peter Damerow, Robert K. Englund', year: 1993, type: 'book', details: 'University of Chicago Press' }
      ]
    },
    {
      id: 'roma-republica',
      category: 'História',
      period: 'Antiguidade',
      title: 'A Travessia do Rubicão e a Guerra Civil Romana (49 a.C.)',
      era: 'Antiguidade Clássica (49 a.C.)',
      evidenceLevel: 'high',
      summary: 'A decisão de Júlio César ao cruzar o rio Rubicão com a XIII Legião, desafiando a autoridade do Senado Romano e deflagrando a Guerra Civil.',
      fact: {
        title: 'A Travessia da XIII Legião Gemina',
        description: 'Em janeiro de 49 a.C., Júlio César cruzou a fronteira fluvial do Rubicão sem desmobilizar seu exército. Proclamou "Alea iacta est" (A sorte está lançada). A lei romana proibia severamente que generais adentrassem a Itália armados sem autorização do Senado.'
      },
      interpretation: {
        title: 'Crise Institucional da República Romana',
        description: 'A historiografia clássica (como a obra de Ronald Syme) interpreta a travessia do Rubicão como o sintoma final do colapso da República oligárquica, cujas legiões se tornaram mais leais aos seus generais imperadores do que às instituições do Senado.'
      },
      hypothesis: {
        title: 'Ultimato dos Senadores e Legítima Defesa',
        description: 'Historiadores cesarianos sustentam que César foi encurralado pelo ultimato dos senadores conservadores (Optimates) liderados por Catão e Pompeu, os quais pretendiam processá-lo e destruí-lo politicamente assim que perdesse a imunidade proconsular.'
      },
      timeline: [
        { year: '50 a.C.', event: 'O Senado ordena que Júlio César entregue o comando militar das legiões na Gália.' },
        { year: '49 a.C.', event: 'César cruza o rio Rubicão com a XIII Legião em 10 de janeiro; Pompeu e o Senado evacuam a Itália.' },
        { year: '48 a.C.', event: 'Batalha de Farsália; César derrota Pompeu e assume o controle supremo de Roma.' }
      ],
      characters: [
        { name: 'Júlio César', role: 'Proconsul da Gália e Ditador', bio: 'General brilhante e estrategista político que cruzou o Rubicão, pondo fim ao modelo republicano tradicional.' },
        { name: 'Pompeu o Grande', role: 'General e Comandante do Senado', bio: 'Antigo aliado do Primeiro Triunvirato que assumiu a liderança das forças republicanas contra César.' },
        { name: 'Cleópatra VII', role: 'Rainha do Egito Ptolemaico', bio: 'Soberana que articulou aliança estratégica com César durante os desdobramentos da guerra no Mediterrâneo.' }
      ],
      sources: [
        { id: 'src-ces-1', title: 'Comentários sobre a Guerra Civil (Commentarii de Bello Civili)', author: 'Júlio César', year: -48, type: 'document', details: 'Livro I, Seções 1 a 12' },
        { id: 'src-ces-2', title: 'A Revolução Romana (The Roman Revolution)', author: 'Ronald Syme', year: 1939, type: 'book', details: 'Capítulo IV: The Dictator' },
        { id: 'src-ces-3', title: 'Vida dos Doze Césares: Divus Julius', author: 'Suetônio', year: 121, type: 'book', details: 'Seções 31 a 33' }
      ]
    },
    {
      id: 'tordesilhas',
      category: 'História',
      period: 'Idade Moderna',
      title: 'O Tratado de Tordesilhas (1494)',
      era: 'Fim do Século XV (1494)',
      evidenceLevel: 'high',
      summary: 'A divisão diplomática e cartográfica do Novo Mundo entre as coroas de Castela e Portugal chancelada pela Igreja Católica.',
      fact: {
        title: 'O Acordo Diplomático Real',
        description: 'O tratado foi assinado em 7 de junho de 1494 na vila espanhola de Tordesilhas. Os originais em pergaminho estão preservados no Archivo General de Indias em Sevilha e no Arquivo Nacional da Torre do Tombo em Lisboa, constituindo prova documental absoluta de sua assinatura.'
      },
      interpretation: {
        title: 'Interpretação Geopolítica',
        description: 'Historiadores debatem se Portugal já tinha conhecimento prévio da existência do território sul-americano antes de 1500, o que justificaria a insistência de D. João II em mover a linha divisória papal de 100 para 370 léguas a oeste do arquipélago de Cabo Verde.'
      },
      hypothesis: {
        title: 'A Tese das Viagens Secretas',
        description: 'Alguns historiadores navais levantam a hipótese de que caravelas portuguesas realizaram incursões secretas de reconhecimento na costa leste do Brasil entre 1493 e 1494, reportando sigilosamente os ventos e correntes ao rei.'
      },
      timeline: [
        { year: '1493', event: 'O Papa Alexandre VI promulga a bula Inter Coetera dividindo as terras descobertas.' },
        { year: '1494', event: 'Representantes de Portugal e Castela reúnem-se na vila de Tordesilhas e redefinem o meridiano.' },
        { year: '1506', event: 'O Papa Júlio II emite a bula Ea Quae, ratificando formalmente o tratado geopolítico.' }
      ],
      characters: [
        { name: 'D. João II', role: 'Rei de Portugal', bio: 'Estrategista diplomático astuto que liderou a pressão portuguesa pela mudança da linha de partilha.' },
        { name: 'Reis Católicos', role: 'Monarcas de Aragão e Castela', bio: 'Isabel I e Fernando II, os quais autorizaram as negociações após a primeira viagem de Colombo.' }
      ],
      sources: [
        { id: 'src-tor-1', title: 'História dos Descobrimentos Portugueses', author: 'Jaime Cortesão', year: 1960, type: 'book', details: 'Volume II, Cap. IV' },
        { id: 'src-tor-2', title: 'Tratado de Tordesillas: Pergaminho de Ratificação', author: 'Chancelaria Real', year: 1494, type: 'document', details: 'Gaveta 15, Maço 1' },
        { id: 'src-tor-3', title: 'Cartografia e Diplomacia no Século XV', author: 'Luís de Albuquerque', year: 1983, type: 'article', details: 'Revista de Estudos Históricos, nº 12' }
      ]
    },
    {
      id: 'alexandria',
      category: 'História',
      period: 'Antiguidade',
      title: 'O Incêndio da Biblioteca de Alexandria',
      era: 'Século III a.C. - Século IV d.C.',
      evidenceLevel: 'good',
      summary: 'A investigação sobre a perda material da maior biblioteca do mundo antigo. Mito de catástrofe única vs. Realidade arqueológica.',
      fact: {
        title: 'Destruição Progressiva Documentada',
        description: 'O acervo sofreu múltiplos estragos e perdas progressivas ao longo de séculos, incluindo a destruição parcial acidental na guerra civil de Júlio César (48 a.C.), o cerco de Aureliano (272 d.C.) e o fechamento do Serapeum por ordem de Teodósio I (391 d.C.).'
      },
      interpretation: {
        title: 'Análise da Decadência Material',
        description: 'A historiografia tradicional buscava culpar um único evento traumático (como a invasão islâmica ou o fanatismo cristão). Pesquisas atuais interpretam que a biblioteca definhou gradualmente devido ao corte de subsídios públicos imperiais, falta de escribas qualificados e obsolescência dos suportes físicos de papiro.'
      },
      hypothesis: {
        title: 'Dispersão Prévia de Coleções',
        description: 'Vários helenistas argumentam que os manuscritos mais valiosos foram dispersados ou vendidos para acervos particulares em Roma, Constantinopla e Atenas muito antes da depredação final das estruturas físicas do templo egípcio.'
      },
      timeline: [
        { year: '48 a.C.', event: 'O porto de Alexandria é incendiado durante a campanha militar de Júlio César contra Pompeu.' },
        { year: '272 d.C.', event: 'O Imperador Aureliano devasta o distrito real (Brouchion) onde se situava a sede central.' },
        { year: '391 d.C.', event: 'Templos pagãos são fechados e saqueados após o edito de Teodósio I, afetando a biblioteca satélite.' }
      ],
      characters: [
        { name: 'Ptolomeu I Sóter', role: 'Faraó do Egito Ptolomaico', bio: 'Fundador do Museu e da Grande Biblioteca de Alexandria, estabelecendo o polo intelectual.' },
        { name: 'Hipátia de Alexandria', role: 'Matemática e Filósofa', bio: 'Última grande docente vinculada às instituições académicas alexandrinas clássicas.' }
      ],
      sources: [
        { id: 'src-ale-1', title: 'The Vanished Library: A Wonder of the Ancient World', author: 'Luciano Canfora', year: 1989, type: 'book', details: 'Páginas 85-110' },
        { id: 'src-ale-2', title: 'Alexandria in Late Antiquity: Topography and Social Conflict', author: 'Christopher Haas', year: 2002, type: 'book', details: 'Capítulo III' },
        { id: 'src-ale-3', title: 'Excavations in the Royal Quarter of Alexandria', author: 'Franck Goddio', year: 2008, type: 'archaeological', details: 'Relatório Científico IEASM' }
      ]
    },
    {
      id: 'queda-roma',
      category: 'História',
      period: 'Idade Média',
      title: 'A Queda do Império Romano do Ocidente',
      era: 'Século V (476 d.C.)',
      evidenceLevel: 'debate',
      summary: 'A desintegração da autoridade imperial na Itália e a transição para a era medieval. Um debate historiográfico clássico de múltiplas teses.',
      fact: {
        title: 'A Deposição de Rômulo Augusto',
        description: 'Em setembro de 476 d.C., o líder mercenário germânico Odoacro depôs o jovem usurpador imperial Rômulo Augusto. Odoacro não reivindicou o título imperial, mas enviou as insígnias reais para Constantinopla, declarando-se regente territorial.'
      },
      interpretation: {
        title: 'Monocausa Clássica vs. Multicausalidade',
        description: 'No século XVIII, Edward Gibbon propôs que o cristianismo e o enfraquecimento moral minaram as instituições. A historiografia moderna liderada por Peter Heather rejeita a ideia de "decadência interna pura", enfatizando o impacto logístico insustentável das migrações de povos bárbaros impulsionados pelos hunos.'
      },
      hypothesis: {
        title: 'Tese Climática e Pandêmica',
        description: 'Historiadores ambientais propõem que o declínio romano coincidiu com uma fase de instabilidade climática severa (Pequena Idade do Gelo do Ano 536) e surtos epidemiológicos severos que dizimaram a mão de obra camponesa e a arrecadação de impostos.'
      },
      timeline: [
        { year: '410 d.C.', event: 'Roma é saqueada pelos visigodos sob comando de Alarico, abalando o prestígio imperial.' },
        { year: '476 d.C.', event: 'Odoacro assume o controle militar da Itália, extinguindo a linhagem oficial de imperadores ocidentais.' },
        { year: '541 d.C.', event: 'A Peste de Justiniano assola o Mediterrâneo, inviabilizando tentativas persistentes de reconquista.' }
      ],
      characters: [
        { name: 'Rômulo Augusto', role: 'Último Imperador Ocidental', bio: 'Adolescente entronizado pelo pai que serviu como figura decorativa no desfecho da corte de Ravena.' },
        { name: 'Odoacro', role: 'Rei dos Hérulos e General', bio: 'Oficial militar germânico que destituiu a autoridade fantoche romana e governou sob vassalagem de Bizâncio.' }
      ],
      sources: [
        { id: 'src-rom-1', title: 'The Fall of the Roman Empire: A New History', author: 'Peter Heather', year: 2005, type: 'book', details: 'Capítulo VII' },
        { id: 'src-rom-2', title: 'The Fate of Rome: Climate, Disease, and the End of an Empire', author: 'Kyle Harper', year: 2017, type: 'book', details: 'Parte III, pág. 120-165' },
        { id: 'src-rom-3', title: 'History of the Decline and Fall of the Roman Empire', author: 'Edward Gibbon', year: 1776, type: 'book', details: 'Edição Crítica de 1994' }
      ]
    },
    {
      id: 'reiartur',
      category: 'História',
      period: 'Idade Média',
      title: 'A Historicidade do Rei Artur',
      era: 'Idade das Trevas Britânica (Século VI)',
      evidenceLevel: 'hypothesis',
      summary: 'A busca por vestígios materiais e contemporâneos do lendário líder guerreiro da Távola Redonda. Lenda vs. Realidade Arqueológica.',
      fact: {
        title: 'Silêncio Documental Contemporâneo',
        description: 'Não existe qualquer menção a um líder chamado "Artur" nas crônicas e tratados britânicos autênticos sobreviventes do século VI, tais como o "De Excidio et Conquestu Britanniae" escrito pelo monge Gildas.'
      },
      interpretation: {
        title: 'Construção Mítica de Identidade',
        description: 'A maioria dos medievalistas contemporâneos interpreta Artur não como um homem real singular, mas como um amálgama literário — uma figura mítica composta para simbolizar a brava resistência militar dos bretões romano-celtas contra a invasão anglo-saxã.'
      },
      hypothesis: {
        title: 'O General Riothamus',
        description: 'Pesquisadores como Geoffrey Ashe propõem a hipótese de que o modelo real que inspirou as lendas arturianas teria sido Riothamus, um chefe militar bretão-romano de comprovada atividade na Gália em meados de 470 d.C.'
      },
      timeline: [
        { year: '516 d.C.', event: 'Batalha do Monte Badon, onde guerreiros britões impõem séria derrota tática aos saxões.' },
        { year: '830 d.C.', event: 'A crônica "Historia Brittonum" registra formalmente a primeira menção de Artur como general britânico.' },
        { year: '1136 d.C.', event: 'Geoffrey de Monmouth publica sua crônica fictícia, fundando os mitos medievais cavaleirescos.' }
      ],
      characters: [
        { name: 'Gildas Sapiens', role: 'Historiador e Monge', bio: 'Único cronista britânico sobrevivente do século VI; descreveu as batalhas saxãs mas nunca citou o nome de Artur.' },
        { name: 'Geoffrey de Monmouth', role: 'Clérigo e Escritor', bio: 'Autor galês medieval cujos manuscritos altamente ficcionalizados deram origem ao mito do rei lendário.' }
      ],
      sources: [
        { id: 'src-art-1', title: 'The Discovery of King Arthur', author: 'Geoffrey Ashe', year: 1985, type: 'book', details: 'Cap. II, pág. 45-70' },
        { id: 'src-art-2', title: 'Historia Brittonum', author: 'Atribuído a Nênio', year: 830, type: 'document', details: 'Seção 56 (Códice Harleiano)' },
        { id: 'src-art-3', title: 'Arthurian Literature in the Middle Ages', author: 'Roger Sherman Loomis', year: 1959, type: 'book', details: 'Capítulo I' }
      ]
    },
    {
      id: 'grecia-classica',
      category: 'História',
      period: 'Antiguidade',
      title: 'O Florescimento da Democracia e Filosofia em Atenas (c. 500 a.C.)',
      era: 'Antiguidade Clássica (c. 500 a.C.)',
      evidenceLevel: 'high',
      summary: 'As reformas democráticas de Clístenes e a consolidação do pensamento filosófico e das artes cênicas na Atenas clássica.',
      fact: {
        title: 'As Reformas de Clístenes (508 a.C.)',
        description: 'Clístenes reorganizou a população de Atenas em dez tribos baseadas em distritos geográficos (demos) em vez de linhagens familiares, fundando a Eclésia e o Conselho dos 500 (Bulé), estabelecendo a isonomia (igualdade perante a lei) documentada em inscrições de pedra.'
      },
      interpretation: {
        title: 'O Caráter de Classe da Democracia Ateniense',
        description: 'Historiadores políticos debatem as limitações estruturais da democracia grega. Enquanto os liberais clássicos a celebravam como liberdade pura, críticos contemporâneos demonstram que ela dependia diretamente da escravidão de massa de prisioneiros estrangeiros e da exclusão total das mulheres da esfera política.'
      },
      hypothesis: {
        title: 'A Influência Egípcia na Filosofia Pré-Socrática',
        description: 'Embora a filosofia seja descrita tradicionalmente como um "milagre grego" autônomo, hipóteses revisionistas sugerem forte herança de conhecimentos geométricos e cosmológicos adquiridos por Tales e Pitágoras em viagens aos templos do Baixo Egito.'
      },
      timeline: [
        { year: '508 a.C.', event: 'Clístenes assume o poder e institui a reorganização política democrática de Atenas.' },
        { year: '490 a.C.', event: 'Batalha de Maratona; forças atenienses derrotam a invasão persa de Dario I, salvaguardando a polis.' },
        { year: '461 a.C.', event: 'Início da Era de Péricles; financiamento estatal de teatros, templos no Acrópole e assembleias populares.' }
      ],
      characters: [
        { name: 'Clístenes', role: 'Pai da Democracia', bio: 'Aristocrata reformador que quebrou o poder dos clãs tradicionais atenientes e introduziu o sufrágio geográfico.' },
        { name: 'Sexto Empírico', role: 'Historiador e Filósofo', bio: 'Registrou compilações de debates céticos e das correntes metodológicas que definiam as discussões na ágora.' }
      ],
      sources: [
        { id: 'src-gre-1', title: 'A Constituição dos Atenienses', author: 'Atribuído a Aristóteles', year: -320, type: 'document', details: 'Seções 20-22, Papiros de Londres' },
        { id: 'src-gre-2', title: 'The Ancient Greeks: An Introduction', author: 'John V. A. Fine', year: 1983, type: 'book', details: 'Capítulo 9' }
      ]
    },
    {
      id: 'revolucao-francesa',
      category: 'História',
      period: 'Idade Moderna',
      title: 'A Revolução Francesa e a Queda da Bastilha (1789)',
      era: 'Idade Moderna (1789)',
      evidenceLevel: 'high',
      summary: 'O levante popular de 14 de julho de 1789 em Paris que desmantelou o absolutismo Bourbon e promulgou a Declaração dos Direitos do Homem.',
      fact: {
        title: 'A Tomada da Bastilha',
        description: 'Em 14 de julho de 1789, uma multidão armada cercou e tomou a prisão-fortaleza da Bastilha, buscando pólvora e libertando prisioneiros simbólicos. Os relatórios oficiais do governador de Launay e os diários reais de Luís XVI registram o colapso imediato da autoridade real na capital.'
      },
      interpretation: {
        title: 'A Tese Revisionista de François Furet',
        description: 'Divergindo da visão marxista clássica (uma revolução burguesa linear), François Furet e historiadores revisionistas argumentam que 1789 foi um colapso democrático onde a política discursiva e a retórica de soberania popular substituíram os conflitos de classe estruturais de curto prazo.'
      },
      hypothesis: {
        title: 'O Impacto Climático e a Erupção do Laki',
        description: 'Pesquisadores de paleoclima levantam a hipótese de que a erupção do vulcão Laki na Islândia em 1783 causou perturbações atmosféricas globais, provocando invernos rigorosos e quebras de safra sucessivas na França, catalisando a fome extrema que motivou a revolta camponesa.'
      },
      timeline: [
        { year: '1789', event: 'Reunião dos Estados Gerais; o Terceiro Estado se autoproclama Assembleia Nacional.' },
        { year: '1789', event: 'Queda da Bastilha em 14 de julho; promulgação da Declaração dos Direitos do Homem em agosto.' },
        { year: '1793', event: 'Execução do rei Luís XVI e início do período do Terror jacobino liderado por Robespierre.' }
      ],
      characters: [
        { name: 'Luís XVI', role: 'Rei de França', bio: 'Monarca absolutista deposto cuja indecisão política e crise fiscal culminaram no colapso do Antigo Regime.' },
        { name: 'Maximilien Robespierre', role: 'Líder Jacobino', bio: 'Advogado e político radical que personificou a fase mais violenta e virtuosa da Revolução Francesa.' }
      ],
      sources: [
        { id: 'src-rev-1', title: 'Pensar a Revolução Francesa', author: 'François Furet', year: 1978, type: 'book', details: 'Edição Gallimard, Páginas 45-80' },
        { id: 'src-rev-2', title: 'The French Revolution: A History', author: 'Thomas Carlyle', year: 1837, type: 'book', details: 'Volume I, Cap. III' }
      ]
    },
    {
      id: 'pouso-lua',
      category: 'História',
      period: 'Idade Moderna',
      title: 'A Apollo 11 e o Pouso Lunar da Humanidade (1969)',
      era: 'Idade Contemporânea (1969)',
      evidenceLevel: 'high',
      summary: 'A alunissagem histórica do Módulo Lunar Eagle na Lua, consolidando o apogeu tecnológico da corrida espacial durante a Guerra Fria.',
      fact: {
        title: 'A Alunissagem no Mar da Tranquilidade',
        description: 'Em 20 de julho de 1969, Neil Armstrong e Buzz Aldrin pousaram o módulo lunar "Eagle" na Lua. A missão foi transmitida ao vivo para 600 milhões de telespectadores e é documentada por mais de 400 kg de amostras de rocha lunar coletadas, registros de rádio da NASA e refletores laser deixados na superfície.'
      },
      interpretation: {
        title: 'A Corrida Espacial como Substituto de Guerra',
        description: 'Historiadores de relações internacionais interpretam o programa Apollo não puramente como aventura científica, mas como uma guerra de propaganda substituta crucial entre as duas superpotências nucleares (EUA e URSS) para demonstrar superioridade ideológica.'
      },
      hypothesis: {
        title: 'Teorias de Conspiração de Fraude Lunar',
        description: 'Apesar de refutadas de forma absoluta por evidências físicas, científicas e historiográficas, hipóteses marginais sugerem que o pouso foi filmado em estúdio de cinema pelo diretor Stanley Kubrick a mando do governo americano.'
      },
      timeline: [
        { year: '1961', event: 'O presidente John F. Kennedy declara a meta de enviar um homem à Lua antes do fim da década.' },
        { year: '1969', event: 'Lançamento do Saturno V em 16 de julho; pouso lunar e caminhada histórica em 20 de julho.' },
        { year: '1972', event: 'A missão Apollo 17 encerra o programa de exploração lunar tripulado da NASA.' }
      ],
      characters: [
        { name: 'Neil Armstrong', role: 'Comandante da Apollo 11', bio: 'Primeiro ser humano a caminhar na Lua, eternizado pela frase "um pequeno passo para um homem, um salto gigante para a humanidade".' },
        { name: 'Wernher von Braun', role: 'Diretor Técnico da NASA', bio: 'Pioneiro da engenharia de foguetes alemã, projetista chefe do colossal foguete lançador Saturno V.' }
      ],
      sources: [
        { id: 'src-lua-1', title: 'First Man: The Life of Neil A. Armstrong', author: 'James R. Hansen', year: 2005, type: 'book', details: 'Capítulo 18, Simon & Schuster' },
        { id: 'src-lua-2', title: 'Apollo 11 Mission Report', author: 'NASA Science Directorate', year: 1969, type: 'document', details: 'Documento Técnico MSC-00171' }
      ]
    },
    {
      id: 'hamurabi',
      category: 'História',
      period: 'Antiguidade',
      title: 'O Código de Hamurabi (c. 1750 a.C.)',
      era: 'Antiguidade Oriental (c. 1750 a.C.)',
      evidenceLevel: 'high',
      summary: 'Codificação de 282 leis em acádio cuneiforme gravadas na Estela de Diorita. Causa: Unificação jurídica do Império Babilônico. Mecanismo: Fixação pública e inalterável do direito escrito. Impacto: Princípio da Lei do Talion ("olho por olho") e regulamentação hierárquica. Relevância ENEM: Transição do direito costumeiro para a norma estatal escrita e diferenciação de penas por classe social.',
      fact: {
        title: 'A Estela de Diorita Negra e a Inscrição Cuneiforme',
        description: 'A estela de 2,25m descoberta em Susa (1901) contém 282 artigos em cuneiforme acádio. No topo, o rei Hamurabi é retratado recebendo as leis diretamente do deus Shamash. O texto regula contratos agrícolas, propriedade, casamento e penas corporais rigorosas.'
      },
      interpretation: {
        title: 'Hierarquia Social e a Lei do Talion',
        description: 'O código aplicava penas desiguais conforme o estamento (awilum/livres, mushkenum/dependentes e wardum/escravos). Historiadores como Marc Van De Mieroop explicam que a Lei do Talion visava coibir vinganças privadas desproporcionais, monopolizando a violência no Estado.'
      },
      hypothesis: {
        title: 'Norma Aplicada vs. Monumento de Propaganda Régia',
        description: 'Assiriólogos debatem se a estela era aplicada estritamente nos tribunais cotidianos ou se funcionava primariamente como um monumento de legitimação política para demonstrar que Hamurabi era o "rei justo".'
      },
      timeline: [
        { year: '1792 a.C.', event: 'Hamurabi ascende ao trono do Império Paleobabilônico.' },
        { year: '1750 a.C.', event: 'Promulgação e erigimento público da Estela de Diorita no templo de Marduk.' },
        { year: '1150 a.C.', event: 'Saque de Babilônia pelos elamitas; a estela é levada como troféu para Susa.' },
        { year: '1901 d.C.', event: 'Descoberta da estela por arqueólogos franceses e envio ao Museu do Louvre.' }
      ],
      characters: [
        { name: 'Hamurabi', role: 'Rei da Babilônia (1792–1750 a.C.)', bio: 'Unificador da Mesopotâmia responsável por compilar o famoso código legal escrito.' },
        { name: 'Shamash', role: 'Deus da Justiça e do Sol', bio: 'Divindade babilonia representada concedendo os símbolos de autoridade a Hamurabi.' },
        { name: 'Marc Van De Mieroop', role: 'Assiriólogo e Historiador', bio: 'Autor de biografias fundamentais sobre Hamurabi e o direito paleobabilônico.' }
      ],
      sources: [
        { id: 'src-ham-1', title: 'Estela de Diorita do Código de Hamurabi (Louvre AO 10237)', author: 'Escribas de Hamurabi', year: -1750, type: 'archaeological', details: '282 artigos em cuneiforme acádio' },
        { id: 'src-ham-2', title: 'King Hammurabi of Babylon: A Biography', author: 'Marc Van De Mieroop', year: 2005, type: 'book', details: 'Blackwell Publishing, Cap. 5' }
      ]
    },
    {
      id: 'islamismo',
      category: 'História',
      period: 'Idade Média',
      title: 'O Surgimento do Islamismo e a Expansão Árabe (622 d.C.)',
      era: 'Alta Idade Média (622 d.C.)',
      evidenceLevel: 'high',
      summary: 'A unificação tribal da Arábia pela fé monoteísta a partir da Hégira (622 d.C.) e a formação do Califado. Causa: Fragmentação política no deserto arábico. Mecanismo: O Alcorão, a noção de Umma e a expansão sobre os impérios Bizantino e Sassânida. Impacto: Preservação e ampliação da ciência clássica e rota comercial do Atlântico à Índia. Relevância ENEM: Sincretismo cultural medieval, revolução científica islâmica e o legado do Al-Andalus.',
      fact: {
        title: 'A Hégira de 622 d.C. e o Estado de Medina',
        description: 'Em 622 d.C., perseguições em Meca forçaram Maomé a migrar para Medina (Hégira), marco inicial do calendário islâmico. Em Medina, a Carta de Medina estabeleceu a primeira constituição monoteísta, unificando clãs rivais sob uma nova ordem social.'
      },
      interpretation: {
        title: 'A Tese Pirenne e a Reconfiguração do Mediterrâneo',
        description: 'Henri Pirenne defendeu que a expansão árabe rompeu o comércio no Mediterrâneo, forçando a Europa ocidental a voltar-se para o interior continental e consolidar o feudalismo ("Sem Maomé, Carlos Magno não teria existido").'
      },
      hypothesis: {
        title: 'Vácuo Geopolítico no Oriente Próximo',
        description: 'Historiadores militares apontam que as rápidas conquistas muçulmanas foram facilitadas pelo esgotamento humano e financeiro de séculos de guerras devastadoras entre Bizâncio e o Império Sassânida.'
      },
      timeline: [
        { year: '610 d.C.', event: 'Primeira revelação profética de Maomé na caverna de Hira.' },
        { year: '622 d.C.', event: 'A Hégira: migração de Meca para Medina; ano zero do calendário islâmico.' },
        { year: '632–661 d.C.', event: 'Califado Ortodoxo: expansão sobre a Síria, Egito, Palestina e Pérsia.' },
        { year: '711 d.C.', event: 'Invasão da Península Ibérica e fundação do Al-Andalus.' }
      ],
      characters: [
        { name: 'Profeta Maomé', role: 'Fundador do Islamismo', bio: 'Líder religioso e político que unificou a Península Arábica sob o monoteísmo.' },
        { name: 'Califa Omar', role: 'Segundo Califa Ortodoxo', bio: 'Arquiteto da expansão territorial sobre Jerusalém, Alexandria e a Pérsia.' },
        { name: 'Henri Pirenne', role: 'Historiador Belga', bio: 'Autor da famosa Tese Pirenne sobre o impacto islâmico no nascimento da Europa medieval.' }
      ],
      sources: [
        { id: 'src-isl-1', title: 'Pergaminhos do Alcorão de Birmingham', author: 'Anônimo', year: 645, type: 'archaeological', details: 'Manuscrito em pergaminho datado por C-14' },
        { id: 'src-isl-2', title: 'Mahomet et Charlemagne', author: 'Henri Pirenne', year: 1937, type: 'book', details: 'Edição Albin Michel' }
      ]
    },
    {
      id: 'constantinopla',
      category: 'História',
      period: 'Idade Média',
      title: 'A Queda de Constantinopla (1453 d.C.)',
      era: 'Fim da Idade Média (1453 d.C.)',
      evidenceLevel: 'high',
      summary: 'A tomada da capital bizantina pelas forças de Mehmet II após 53 dias de cerco com artilharia pesada. Causa: Declínio territorial bizantino e expansão otomana. Mecanismo: Bombardas de bronze e transporte de navios por terra para o Chifre de Ouro. Impacto: Fim do Império Romano do Oriente, bloqueio comercial terrestre para a Ásia e fuga de sábios gregos acelerando o Renascimento. Relevância ENEM: Transição da Idade Média para a Idade Moderna e estímulo às Grandes Navegações.',
      fact: {
        title: 'O Cerco de 1453 e a Ruptura das Muralhas Teodosianas',
        description: 'Em 29 de maio de 1453, Mehmet II rompeu as muralhas de Constantinopla com o uso da bombarda gigante de Urbano e estratégias audaciosas. O imperador Constantino XI morreu em combate, marcando o fim definitivo do Império Bizantino.'
      },
      interpretation: {
        title: 'A Revolução da Artilharia de Pólvora',
        description: 'Historiadores militares analisam a queda como o triunfo da artilharia sobre as fortificações medievais de pedra, encerrando a era da cavalaria e forçando o desenvolvimento da arquitetura militar moderna.'
      },
      hypothesis: {
        title: 'Reavaliação do Bloqueio de Especiarias',
        description: 'Historiadores econômicos demonstram que os otomanos não proibiram o comércio cristão, mas elevaram tarifas alfandegárias, estimulando a busca ibérica por rotas marítimas diretas sem intermediários.'
      },
      timeline: [
        { year: '1453 (Abril)', event: 'Início do cerco otomano com 80.000 homens e bombardeio de artilharia.' },
        { year: '1453 (Maio 22)', event: 'Mehmet II transporta 70 galés por terra contornando Gálata até o Chifre de Ouro.' },
        { year: '1453 (Maio 29)', event: 'Conquista da cidade e transformação da Basílica de Santa Sofia em mesquita.' }
      ],
      characters: [
        { name: 'Mehmet II', role: 'Sultão Otomano (O Conquistador)', bio: 'Estrategista genial que conquistou Constantinopla aos 21 anos.' },
        { name: 'Constantino XI', role: 'Último Imperador Bizantino', bio: 'Soberano que liderou a defesa desesperada e tombou nas muralhas.' },
        { name: 'Steven Runciman', role: 'Historiador Britânico', bio: 'Autor da obra clássica sobre a queda de Constantinopla.' }
      ],
      sources: [
        { id: 'src-con-1', title: 'Diário do Cerco de Constantinopla', author: 'Niccolò Barbaro', year: 1453, type: 'document', details: 'Relato de testemunha ocular veneziana' },
        { id: 'src-con-2', title: 'The Fall of Constantinople 1453', author: 'Steven Runciman', year: 1965, type: 'book', details: 'Cambridge University Press' }
      ]
    },
    {
      id: 'reforma-protestante',
      category: 'História',
      period: 'Idade Moderna',
      title: 'A Reforma Protestante e Lutero (1517 d.C.)',
      era: 'Idade Moderna (1517 d.C.)',
      evidenceLevel: 'high',
      summary: 'A afixação das 95 Teses por Martinho Lutero em Wittenberg contra a venda de indulgências. Causa: Abusos do clero e crise moral católica. Mecanismo: Difusão pela imprensa de Gutenberg, salvação pela fé e sola scriptura. Impacto: Quebra da unidade cristã no Ocidente, guerras de religião e fortalecimento do vernáculo. Relevância ENEM: Relação entre religião, burguesia, imprensa e modernidade política.',
      fact: {
        title: 'As 95 Teses e a Imprensa de Gutenberg',
        description: 'Em 31 de outubro de 1517, Lutero denunciou o comércio das indulgências pelo dominicano Tetzel. A recém-inventada imprensa de Gutenberg multiplicou o texto em alemão por toda a Europa em semanas.'
      },
      interpretation: {
        title: 'A Ética Protestante e o Capitalismo (Max Weber)',
        description: 'Max Weber articulou que o calvinismo e o puritanismo protestante, ao valorizarem o trabalho disciplinado e a poupança como sinais de salvação, impulsionaram a mentalidade capitalista moderna.'
      },
      hypothesis: {
        title: 'Interesses Financeiros dos Príncipes Alemães',
        description: 'Historiadores sociais apontam que a Reforma prosperou no Sacro Império porque os príncipes viram a oportunidade de confiscar terras da Igreja e cessar os impostos enviados a Roma.'
      },
      timeline: [
        { year: '1517', event: 'Afixação das 95 Teses na porta da Igreja do Castelo de Wittenberg.' },
        { year: '1521', event: 'Dieta de Worms; Lutero recusa se retratar e é excomungado por Leão X.' },
        { year: '1534', event: 'Lutero publica a tradução completa da Bíblia para o alemão vernacular.' },
        { year: '1555', event: 'Paz de Augsburgo estabelece a liberdade religiosa para príncipes alemães.' }
      ],
      characters: [
        { name: 'Martinho Lutero', role: 'Teólogo e Monge Reformador', bio: 'Iniciador da Reforma Protestante ao contestar as indulgências papais.' },
        { name: 'Leão X', role: 'Papa da Igreja Católica', bio: 'Pontífice que promoveu as indulgências para financiar a Basílica de São Pedro.' },
        { name: 'Max Weber', role: 'Sociólogo Alemão', bio: 'Autor da tese que vincula a ética protestante ao surgimento do capitalismo.' }
      ],
      sources: [
        { id: 'src-ref-1', title: 'As 95 Teses sobre a Eficácia das Indulgências', author: 'Martinho Lutero', year: 1517, type: 'document', details: 'Texto impresso em Wittenberg' },
        { id: 'src-ref-2', title: 'A Ética Protestante e o Espírito do Capitalismo', author: 'Max Weber', year: 1905, type: 'book', details: 'Edição Crítica' }
      ]
    },
    {
      id: 'revolucao-industrial',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Primeira Revolução Industrial (c. 1760 d.C.)',
      era: 'Século XVIII (c. 1760 d.C.)',
      evidenceLevel: 'high',
      summary: 'A mecanização da produção têxtil e a máquina a vapor de James Watt na Grã-Bretanha. Causa: Acumulação de capital, cercamentos (Enclosures) e carvão abundante. Mecanismo: Energia a vapor e sistema fabril. Impacto: Surgimento do proletariado, exôdo rural, urbanização desordenada e capitalismo industrial. Relevância ENEM: Ludismo, cartismo, alienação do trabalho (Marx) e problemas ambientais urbanos.',
      fact: {
        title: 'A Máquina a Vapor e o Êxodo Rural',
        description: 'A máquina a vapor de James Watt (1769) e as leis de cercamento (Enclosure Acts) forçaram camponeses sem terra a migrarem para cidades industriais como Manchester, criando o operariado fabril.'
      },
      interpretation: {
        title: 'A Dupla Revolução de Eric Hobsbawm',
        description: 'Eric Hobsbawm definiu a Revolução Industrial britânica juntamente com a Revolução Francesa como a "Dupla Revolução" que fundou a sociedade contemporânea ocidental.'
      },
      hypothesis: {
        title: 'Pioneirismo Britânico e Recursos Coloniais',
        description: 'Debate-se se o pioneirismo inglês ocorreu por patentes e ciência ou pela exploração das matérias-primas e mercados consumidores cativos do seu império colonial.'
      },
      timeline: [
        { year: '1733', event: 'Invenção da lançadeira volante por John Kay.' },
        { year: '1769', event: 'James Watt patenteia a máquina a vapor aprimorada.' },
        { year: '1811–1816', event: 'Movimento Ludista destrói teares mecânicos em protesto contra baixos salários.' },
        { year: '1838', event: 'Publicação da Carta do Povo (Movimento Cartista) exigindo direitos operários.' }
      ],
      characters: [
        { name: 'James Watt', role: 'Engenheiro Escocês', bio: 'Aprimorou a máquina a vapor, tornando-a a fonte motriz da revolução fabril.' },
        { name: 'Ned Ludd', role: 'Líder Operário Mítico', bio: 'Símbolo da resistência artesanal contra a mecanização destruidora de empregos.' },
        { name: 'Eric Hobsbawm', role: 'Historiador Britânico', bio: 'Analista definitivo da industrialização e do desenvolvimento do capitalismo.' }
      ],
      sources: [
        { id: 'src-ind-1', title: 'A Era das Revoluções (1789-1848)', author: 'Eric Hobsbawm', year: 1962, type: 'book', details: 'Paz e Terra, Cap. 2' },
        { id: 'src-ind-2', title: 'O Capital', author: 'Karl Marx', year: 1867, type: 'book', details: 'Livro I, Seção IV' }
      ]
    },
    {
      id: 'primeira-guerra-russa',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Primeira Guerra e a Revolução Russa (1914–1917)',
      era: 'Início do Século XX (1914–1917)',
      evidenceLevel: 'high',
      summary: 'A Grande Guerra imperialista europeia e a revolução bolchevique de 1917. Causa: Imperialismo, alianças militares e colapso ksarista. Mecanismo: Guerra de trincheiras e a tomada do poder pelos soviéticos sob Lênin ("Paz, Pão e Terra"). Impacto: Fim de 4 impérios, criação da URSS e início da disputa ideológica do século XX. Relevância ENEM: Ideologias contemporâneas, fim das autocracias e origem do bloco socialista.',
      fact: {
        title: 'Atentado de Sarajevo e a Revolução de Outubro',
        description: 'O assassinato de Francisco Ferdinando em 1914 deflagrou a guerra. O esgotamento russo levou à queda do Czar em fevereiro de 1917 e à tomada do Palácio de Inverno pelos Bolcheviques de Lênin em outubro.'
      },
      interpretation: {
        title: 'O Breve Século XX de Hobsbawm',
        description: 'Hobsbawm delimita o "Breve Século XX" (1914-1991) iniciando na Primeira Guerra e na Revolução Russa, que inauguraram a era do confronto ideológico global.'
      },
      hypothesis: {
        title: 'Contingência de Guerra vs. Inevitabilidade Social',
        description: 'Historiadores discutem se a vitória bolchevique decorreu das contradições agrárias estruturais ou da oportunidade única gerada pelo colapso militar na Grande Guerra.'
      },
      timeline: [
        { year: '1914', event: 'Atentado em Sarajevo e início da Primeira Guerra Mundial.' },
        { year: '1917 (Fev)', event: 'Revolução de Fevereiro deposita o Czar Nicolau II.' },
        { year: '1917 (Out)', event: 'Revolução de Outubro: Bolcheviques assumem o poder.' },
        { year: '1918', event: 'Tratado de Brest-Litovsk retira a Rússia do conflito.' }
      ],
      characters: [
        { name: 'Vladimir Lênin', role: 'Líder Bolchevique', bio: 'Chefe teórico e político da Revolução Russa e primeiro líder soviético.' },
        { name: 'Czar Nicolau II', role: 'Último Czar da Rússia', bio: 'Monarca autocrata cuja má gestão da guerra levou ao colapso do império.' },
        { name: 'Leon Trotsky', role: 'Comandante do Exército Vermelho', bio: 'Estrategista crucial na consolidação do poder soviético.' }
      ],
      sources: [
        { id: 'src-1gm-1', title: 'Dez Dias que Abalaram o Mundo', author: 'John Reed', year: 1919, type: 'book', details: 'Relato jornalístico de testemunha ocular' },
        { id: 'src-1gm-2', title: 'A Era dos Extremos', author: 'Eric Hobsbawm', year: 1994, type: 'book', details: 'Companhia das Letras, Cap. 1-2' }
      ]
    },
    {
      id: 'segunda-guerra-holocausto',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Segunda Guerra Mundial e o Holocausto (1939–1945)',
      era: 'Meados do Século XX (1939–1945)',
      evidenceLevel: 'high',
      summary: 'O conflito global entre Aliados e Eixo nazi-fascista e o extermínio de 6 milhões de judeus. Causa: Expansionismo nazista e ideologia do "espaço vital". Mecanismo: Blitzkrieg, campos industriais de morte e bomba atômica. Impacto: Criação da ONU, Declaração dos Direitos Humanos e início da Guerra Fria. Relevância ENEM: Totalitarismo, direitos humanos, memória histórica e nova ordem geopolítica.',
      fact: {
        title: 'Invasão da Polônia e os Campos de Extermínio',
        description: 'A invasão da Polônia em 1939 deu início à guerra. Na Conferência de Wannsee (1942), o nazismo sistematizou a "Solução Final", executando milhões em campos de extermínio como Auschwitz-Birkenau.'
      },
      interpretation: {
        title: 'A Banalidade do Mal e a Modernidade Industrial',
        description: 'Hannah Arendt definiu a "banalidade do mal" ao analisar Eichmann. Zygmunt Bauman demonstrou que o Holocausto utilizou a própria racionalidade industrial e burocrática moderna.'
      },
      hypothesis: {
        title: 'Grau de Culpabilidade da População Civil',
        description: 'Debate-se até que ponto cidadãos alemães comuns tinham conhecimento ativo do genocídio ou se viviam sob coerção e propaganda massiva do regime.'
      },
      timeline: [
        { year: '1939', event: 'Alemanha invade a Polônia; início da Segunda Guerra Mundial.' },
        { year: '1941', event: 'Ataque a Pearl Harbor e início da operação industrial da Solução Final.' },
        { year: '1942–1943', event: 'Batalha de Stalingrado: virada soviética contra o exército nazista.' },
        { year: '1945', event: 'Fim da guerra na Europa e bombas atômicas em Hiroshima e Nagasaki.' }
      ],
      characters: [
        { name: 'Adolf Hitler', role: 'Ditador da Alemanha Nazista', bio: 'Arquiteto do expansionismo fascista e do genocídio do Holocausto.' },
        { name: 'Hannah Arendt', role: 'Filósofa Política', bio: 'Autora de análises sobre o totalitarismo e a banalidade do mal.' },
        { name: 'Winston Churchill', role: 'Primeiro-Ministro Britânico', bio: 'Líder da resistência aliada ocidental contra o nazismo.' }
      ],
      sources: [
        { id: 'src-2gm-1', title: 'Eichmann em Jerusalém', author: 'Hannah Arendt', year: 1963, type: 'book', details: 'Viking Press' },
        { id: 'src-2gm-2', title: 'Modernidade e Holocausto', author: 'Zygmunt Bauman', year: 1989, type: 'book', details: 'Jorge Zahar Editor' }
      ]
    },
    {
      id: 'mitologia-nordica',
      category: 'Mitologia',
      period: 'Mitologias',
      title: 'Mitologia Nórdica: Asgard e o Ragnarök',
      era: 'Era Viking (Século VIII–XI d.C.)',
      evidenceLevel: 'mythological',
      summary: 'A cosmologia germânico-escandinava da arvore Yggdrasil, os Nove Reinos e o crepúsculo cíclico do Ragnarök. Causa: Sacralização dos rigorosos ciclos da natureza e valorização do guerreiro. Mecanismo: Tradição oral das eddas e escrita islandesa. Impacto: Influência duradoura na cultura, na linguagem e na literatura de fantasia ocidental. Relevância ENEM: Análise de mitos de criação e percepção do tempo cíclico.',
      fact: {
        title: 'A Cosmogonia da Yggdrasil e as Eddas',
        description: 'Os nórdicos representavam o cosmos sustentado pela fresno Yggdrasil, unindo nove mundos (Asgard, Midgard, Helheim). Os manuscritos mediais islandeses (Edda em Verso e Edda em Prosa) são as fontes primárias preservadas.'
      },
      interpretation: {
        title: 'A Mortabilidade dos Deuses e o Ragnarök',
        description: 'Diferente dos deuses imortais mediterrâneos, Odin, Thor e Loki estão sujeitos ao fado (Urðr). O Ragnarök representa a batalha final catastrófica necessária para a renovação de um novo mundo.'
      },
      hypothesis: {
        title: 'Influência do Cristianismo nas Escritas Islandesas',
        description: 'Linguistas apontam que a visão de um mundo renovado após o Ragnarök na Völuspá reflete influências cristãs trazidas pelos copistas islandeses do século XIII.'
      },
      timeline: [
        { year: 'c. 800 d.C.', event: 'Auge da Era Viking e transmissão oral das canções mitológicas.' },
        { year: 'c. 1220 d.C.', event: 'Snorri Sturluson escreve a Edda em Prosa na Islândia.' },
        { year: '1270 d.C.', event: 'Compilação do Codex Regius contendo a Edda em Verso.' }
      ],
      characters: [
        { name: 'Odin', role: 'Pai de Todos', bio: 'Deus supremo da sabedoria, magia das runas, poesia e guerra.' },
        { name: 'Thor', role: 'Deus do Trovão', bio: 'Protetor dos homens e de Midgard, armado com o martelo Mjölnir.' },
        { name: 'Snorri Sturluson', role: 'Historiador Islandês', bio: 'Autor responsável por registrar por escrito as tradições nórdicas.' }
      ],
      sources: [
        { id: 'src-nor-1', title: 'Codex Regius da Edda Poética', author: 'Monges Islandeses', year: 1270, type: 'myth', details: 'Manuscrito na Islândia' },
        { id: 'src-nor-2', title: 'Myth and Religion of the North', author: 'Gabriel Turville-Petre', year: 1964, type: 'book', details: 'Weidenfeld & Nicolson' }
      ]
    },
    {
      id: 'mitologia-mesoamericana',
      category: 'Mitologia',
      period: 'Mitologias',
      title: 'Mitologias Precolombianas: Popol Vuh e Quetzalcóatl',
      era: 'Período Pré-Colombiano (c. 2000 a.C. – 1532 d.C.)',
      evidenceLevel: 'mythological',
      summary: 'Cosmogonias e cultos agrícolas das civilizações Maia, Asteca e Inca. Causa: Sacralização do milho, Sol e chuva vitais à agricultura. Mecanismo: Rituais de reciprocidade com o divino e textos sagrados como o Popol Vuh. Impacto: Arquitetura monumental de pirâmides e preservação da identidade indígena. Relevância ENEM: Diversidade das matrizes ameríndias e cosmovisão pré-colombiana.',
      fact: {
        title: 'O Homem de Milho no Popol Vuh',
        description: 'O Popol Vuh maia narra a criação da humanidade a partir do milho amarelo e branco, após tentativas frustradas com lama e madeira, simbolizando a sacralidade da agricultura.'
      },
      interpretation: {
        title: 'Reciprocidade Sagrada e Sacrifícios',
        description: 'Miguel León-Portilla explica que para os astecas, os deuses (como Quetzalcóatl e Huitzilopochtli) necessitavam de rituais e oferendas para manter a ordem cósmica e o movimento do Sol.'
      },
      hypothesis: {
        title: 'Desmistificação do Mito de Quetzalcóatl',
        description: 'Historiadores modernos contestam a lenda de que Moctezuma considerou Cortés como a reencarnação de Quetzalcóatl, demonstrando ser uma construção narrativa espanhola pós-conquista.'
      },
      timeline: [
        { year: '2000 a.C.', event: 'Início do cultivo sagrado do milho na Mesoamérica.' },
        { year: '300–900 d.C.', event: 'Período Clássico Maia e desenvolvimento do calendário solar.' },
        { year: '1325 d.C.', event: 'Fundação de Tenochtitlán pelos astecas no Vale do México.' },
        { year: '1550 d.C.', event: 'Redação em alfabeto latino do Popol Vuh na Guatemala.' }
      ],
      characters: [
        { name: 'Quetzalcóatl', role: 'Serpente Emplumada', bio: 'Divindade da sabedoria, do vento e do conhecimento na Mesoamérica.' },
        { name: 'Gêmeos Heróis', role: 'Hunahpú e Ixbalanqué', bio: 'Protagonistas do Popol Vuh que venceram os deuses da morte em Xibalbá.' },
        { name: 'Miguel León-Portilla', role: 'Antropólogo Mexicano', bio: 'Tradutor e defensor da filosofia e literatura Nahuatl.' }
      ],
      sources: [
        { id: 'src-mes-1', title: 'Manuscrito do Popol Vuh', author: 'Autores Maias K\'iche\'', year: 1550, type: 'myth', details: 'Biblioteca Newberry de Chicago' },
        { id: 'src-mes-2', title: 'A Filosofia Nahuatl', author: 'Miguel León-Portilla', year: 1956, type: 'book', details: 'UNAM México' }
      ]
    },
    {
      id: 'brasil-colonial',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Chegada dos Portugueses e o Brasil Colonial (1500)',
      era: 'Século XVI–XVIII (1500)',
      evidenceLevel: 'high',
      summary: 'A chegada da esquadra de Cabral e a colonização agroexportadora do açúcar. Causa: Expansão marítima mercantilista portuguesa. Mecanismo: Capitanias, Governo-Geral e escravização de indígenas e africanos. Impacto: Estruturação da sociedade patriarcal, latifundiária e escravista brasileira. Relevância ENEM: Carta de Caminha, resistência indígena/quilombola e economia açucareira.',
      fact: {
        title: 'A Carta de Caminha e a Economia do Açúcar',
        description: 'Em 22 de abril de 1500, Cabral aportou na Bahia. A Carta de Pero Vaz de Caminha registrou o primeiro contato. A partir de 1530, a instalação dos engenhos de açúcar consolidou a colonização mercantilista.'
      },
      interpretation: {
        title: 'Sentido da Colonização (Caio Prado Jr.)',
        description: 'Caio Prado Júnior definiu o "sentido da colonização" como a exploração predatória de gêneros tropicais voltada exclusivamente para o enriquecimento das metrópoles europeias.'
      },
      hypothesis: {
        title: 'Intencionalidade do Descobrimento',
        description: 'Historiadores navais defendem que a frota de Cabral não chegou ao Brasil por acaso, mas por uma missão sigilosa de D. João II para garantir as terras do Tratado de Tordesilhas.'
      },
      timeline: [
        { year: '1500 (Abril 22)', event: 'Chegada de Pedro Álvares Cabral a Porto Seguro (BA).' },
        { year: '1532', event: 'Fundação da Vila de São Vicente e primeiro engenho de açúcar.' },
        { year: '1549', event: 'Instalação do Governo-Geral com Tomé de Sousa em Salvador.' },
        { year: '1595', event: 'Formação inicial do Quilombo dos Palmares na Serra da Barriga.' }
      ],
      characters: [
        { name: 'Pedro Álvares Cabral', role: 'Navegador Português', bio: 'Capitão-mor da esquadra que oficializou a posse portuguesa do Brasil em 1500.' },
        { name: 'Pero Vaz de Caminha', role: 'Escrivão da Esquadra', bio: 'Autor da famosa carta relatando as terras e os nativos a D. Manuel I.' },
        { name: 'Caio Prado Júnior', role: 'Historiador Brasileiro', bio: 'Autor do clássico "Formação do Brasil Contemporâneo".' }
      ],
      sources: [
        { id: 'src-bra-1', title: 'Carta do Achamento do Brasil', author: 'Pero Vaz de Caminha', year: 1500, type: 'document', details: 'Torre do Tombo, Lisboa' },
        { id: 'src-bra-2', title: 'Formação do Brasil Contemporâneo', author: 'Caio Prado Júnior', year: 1942, type: 'book', details: 'Editora Brasiliense' }
      ]
    },
    {
      id: 'brasil-imperio',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Independência e o Império do Brasil (1822–1889)',
      era: 'Século XIX (1822–1889)',
      evidenceLevel: 'high',
      summary: 'A independência conduzida pela elite escravista, mantendo a monarquia, a unidade territorial e o Segundo Reinado de D. Pedro II. Causa: Vinda da Família Real (1808) e recolonização pelas Cortes de Lisboa. Mecanismo: Monarquia constitucional, Poder Moderador e economia cafeeira. Impacto: Abolição da escravidão (1888) e Proclamação da República (1889). Relevância ENEM: Constituição de 1824, Poder Moderador, Guerra do Paraguai e abolicionismo.',
      fact: {
        title: 'O 7 de Setembro e o Poder Moderador',
        description: 'Proclamada em 1822 por D. Pedro I, a Independência preservou o regime monárquico. A Constituição de 1824 criou o Poder Moderador, conferindo autoridade pessoal ao imperador sobre os demais poderes.'
      },
      interpretation: {
        title: 'A Construção da Ordem e o Medo da Fragmentação',
        description: 'José Murilo de Carvalho demonstra que a elite brasileira optou pela monarquia para evitar a fragmentação territorial e revoltas populares ("medo do haitianismo") que ameaçassem a escravidão.'
      },
      hypothesis: {
        title: 'Resistência Negra e a Conquista da Abolição',
        description: 'Historiadores negros (como Eduardo Silva) provam que a Lei Áurea de 1888 não foi dádiva imperial, mas resultado de insurreições nas senzalas, aquilombamento e pressão do movimento abolicionista.'
      },
      timeline: [
        { year: '1808', event: 'Transferência da Corte portuguesa para o Rio de Janeiro e abertura dos portos.' },
        { year: '1822', event: 'Grito do Ipiranga e aclamação de D. Pedro I como Imperador.' },
        { year: '1840', event: 'Golpe da Maioridade: início do Segundo Reinado de D. Pedro II.' },
        { year: '1888', event: 'Assinatura da Lei Áurea extinguindo a escravidão no Brasil.' },
        { year: '1889', event: 'Proclamação da República pelo Marechal Deodoro da Fonseca.' }
      ],
      characters: [
        { name: 'D. Pedro II', role: 'Imperador do Brasil', bio: 'Governou o Brasil de 1840 a 1889, símbolo de estabilidade política e patrono das artes.' },
        { name: 'Luís Gama', role: 'Líder Abolicionista e Jurista', bio: 'Ex-escravizado autodidata que libertou centenas de cativos nos tribunais paulistas.' },
        { name: 'José Murilo de Carvalho', role: 'Historiador do Império', bio: 'Referência acadêmica na análise das elites e da cidadania no Brasil Imperial.' }
      ],
      sources: [
        { id: 'src-imp-1', title: 'Constituição do Império do Brasil', author: 'Conselho de Estado', year: 1824, type: 'document', details: 'Arquivo Nacional do Rio de Janeiro' },
        { id: 'src-imp-2', title: 'A Construção da Ordem', author: 'José Murilo de Carvalho', year: 1980, type: 'book', details: 'Editora Campus' }
      ]
    },
    {
      id: 'era-vargas',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Era Vargas e o Estado Novo (1930–1945)',
      era: 'Século XX (1930–1945)',
      evidenceLevel: 'high',
      summary: 'A Revolução de 1930, a industrialização estatal, a criação da CLT e a ditadura do Estado Novo. Causa: Crise de 1929 e fim da hegemonia paulista-mineira. Mecanismo: Centralização política, leis trabalhistas tuteladas e propaganda oficial do DIP. Impacto: Nascimento da CLT, da CSN e consolidação da identidade nacional urbana. Relevância ENEM: Trabalhismo, propaganda do DIP, industrialização e cidadania regulada.',
      fact: {
        title: 'A CLT (1943) e o Aparelho de Propaganda do DIP',
        description: 'Em 1943, Vargas outorgou a CLT, garantindo direitos sociais. Por outro lado, o DIP censurava a oposição e construía o mito do "Pai dos Pobres" através da "A Hora do Brasil".'
      },
      interpretation: {
        title: 'A Cidadania Regulada (Wanderley Guilherme)',
        description: 'Wanderley Guilherme dos Santos explicou que os direitos trabalhistas na Era Vargas eram concedidos aos cidadãos em função da sua profissão reconhecida em carteira assinada vinculada ao Estado.'
      },
      hypothesis: {
        title: 'A Farsa do Plano Cohen',
        description: 'O pretexto utilizado para dar o golpe do Estado Novo em 1937 foi o "Plano Cohen", um documento falso forjado por militares para simular uma iminente ameaça comunista no Brasil.'
      },
      timeline: [
        { year: '1930', event: 'Revolução de 1930 depõe Washington Luís e conduz Vargas ao poder.' },
        { year: '1932', event: 'Revolução Constitucionalista em São Paulo pela constitucionalização.' },
        { year: '1937', event: 'Golpe do Estado Novo e outorga da Constituição de 1937 ("Polaca").' },
        { year: '1943', event: 'Promulgação da Consolidação das Leis do Trabalho (CLT).' },
        { year: '1945', event: 'Deposição militar de Vargas e encerramento do Estado Novo.' }
      ],
      characters: [
        { name: 'Getúlio Vargas', role: 'Presidente e Ditador', bio: 'Figura central da história brasileira do século XX, pai do trabalhismo e da industrialização.' },
        { name: 'Wanderley Guilherme dos Santos', role: 'Cientista Político', bio: 'Autor do conceito de cidadania regulada para analisar o modelo varguista.' },
        { name: 'Lourival Fontes', role: 'Diretor do DIP', bio: 'Idealizador da máquina de censura e propaganda pública do Estado Novo.' }
      ],
      sources: [
        { id: 'src-var-1', title: 'Consolidação das Leis do Trabalho (CLT)', author: 'Governo Getúlio Vargas', year: 1943, type: 'document', details: 'Diário Oficial da União' },
        { id: 'src-var-2', title: 'Cidadania e Justiça', author: 'Wanderley Guilherme dos Santos', year: 1979, type: 'book', details: 'Editora Campus' }
      ]
    },
    {
      id: 'ditadura-militar-brasil',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Ditadura Militar e a Redemocratização (1964–1985)',
      era: 'Século XX (1964–1985)',
      evidenceLevel: 'high',
      summary: 'O regime civil-militar instaurado em 1964, marcado pelo AI-5, censura, represão política e o processo de abertura até a Constituição de 1988. Causa: Guerra Fria, reformas de base de Jango e medo do comunismo nas elites. Mecanismo: Atos Institucionais, Milagre Econômico e campanha Diretas Já. Impacto: Violações de direitos humanos, endividamento externo e promulgação da Carta Cidadã de 1988. Relevância ENEM: AI-5, censura artística, Diretas Já e a Constituição de 1988.',
      fact: {
        title: 'O AI-5 de 1968 e o Relatório da Comissão da Verdade',
        description: 'Em dezembro de 1968, o AI-5 fechou o Congresso, suspendeu o habeas corpus e oficializou a censura prévia. A Comissão Nacional da Verdade (2014) comprovou o assassinato e desaparecimento de 434 opositores do regime.'
      },
      interpretation: {
        title: 'A Caracterização Civil-Militar da Ditadura',
        description: 'Historiadores (como Daniel Aarão Reis) destacam que o regime teve apoio civil ativo de empresários, veículos de imprensa e setores conservadores, viabilizado temporariamente pelo "Milagre Econômico".'
      },
      hypothesis: {
        title: 'Apoio Logístico dos EUA na Operação Brother Sam',
        description: 'Documentos sigilosos comprovam que o governo americano mobilizou uma frota naval para apoiar o golpe de 1964 caso houvesse resistência armada fidedigna de tropas leais a João Goulart.'
      },
      timeline: [
        { year: '1964 (Abril 1)', event: 'Golpe civil-militar depõe o presidente João Goulart.' },
        { year: '1968 (Dez 13)', event: 'Decretado o AI-5, dando início ao período mais repressivo da ditadura.' },
        { year: '1979', event: 'Sancionada a Lei de Anistia no governo do general João Figueiredo.' },
        { year: '1984', event: 'Campanha das "Diretas Já" reúne milhões de brasileiros pelo voto direto.' },
        { year: '1988', event: 'Promulgação da Constituição Cidadã restaurando a democracia.' }
      ],
      characters: [
        { name: 'João Goulart (Jango)', role: 'Presidente Deposto', bio: 'Presidente constitucional derrubado pelo golpe civil-militar de 1964.' },
        { name: 'Vladimir Herzog', role: 'Jornalista', bio: 'Assassinado pelo regime em 1975 no DOI-CODI, sua morte mobilizou a resistência civil.' },
        { name: 'Daniel Aarão Reis', role: 'Historiador', bio: 'Especialista em ditadura militar, censura e movimentos de resistência política.' }
      ],
      sources: [
        { id: 'src-dit-1', title: 'Relatório Final da Comissão Nacional da Verdade', author: 'Governo Federal do Brasil', year: 2014, type: 'document', details: '3 Volumes, Brasília' },
        { id: 'src-dit-2', title: 'A Ditadura Escancarada', author: 'Elio Gaspari', year: 2002, type: 'book', details: 'Companhia das Letras' }
      ]
    },
    {
      id: 'guerras-medicas',
      category: 'História',
      period: 'Antiguidade',
      title: 'As Guerras Médicas / Persas (499 – 449 a.C.)',
      era: 'Antiguidade Clássica (499–449 a.C.)',
      evidenceLevel: 'high',
      summary: 'Grécia (Atenas e Esparta) vs. Império Persa (Batalhas de Maratona, Termópilas e Salamina). Fundamental para entender a hegemonia grega, a formação da Liga de Delos e a preservação da autonomia cultural e política das polis.',
      fact: {
        title: 'As Invasões Persas e a Resistência Grega',
        description: 'Conflito secular travado entre as cidades-estado gregas e o Império Persa Aquêmenida de Dário I e Xerxes I na Bacia do Egeu.',
        causaImediata: 'A Revolta das cidades gregas da Jônia (como Mileto) na Ásia Menor contra o domínio do Império Persa em 499 a.C., recebendo apoio militar e marítimo enviado por Atenas.',
        desenvolvimento: 'Duas grandes invasões persas. Primeira Invasão (490 a.C.): Batalha de Maratona, onde a falange hoplita ateniense derrotou as tropas de Dário I. Segunda Invasão (480 a.C.): Heróica resistência dos 300 espartanos de Leônidas nas Termópilas, seguida pela vitória naval decisiva de Atenas em Salamina (comandada por Temístocles) e a batalha terrestre final de Plateia (479 a.C.).',
        consequencias: 'Recuo definitivo dos persas da Europa, preservação da autonomia cultural e política grega, hegemonia de Atenas no Egeu (Auge do Século de Péricles) e fundação da Liga de Delos.'
      },
      interpretation: {
        title: 'O Mito da Liberdade Ocidental vs. Despotismo Oriental',
        description: 'Heródoto construiu a narrativa fundacional da historiografia ao opor a liberdade da polis grega à servidão autocrática persa, conceito reanalisado pela historiografia contemporânea.'
      },
      hypothesis: {
        title: 'União Grega Contingente',
        description: 'Historiadores demonstram que a aliança entre Atenas e Esparta foi estritamente emergencial e temporária, desmoronando logo em seguida na devastadora Guerra do Peloponeso.'
      },
      timeline: [
        { year: '499 a.C.', event: 'Início da Revolta Jônica apoiada por Atenas contra Dário I.' },
        { year: '490 a.C.', event: 'Primeira Invasão Persa; vitória ateniense na Batalha de Maratona.' },
        { year: '480 a.C.', event: 'Segunda Invasão Persa; Batalha das Termópilas e vitória naval grega em Salamina.' },
        { year: '478 a.C.', event: 'Fundação da Liga de Delos sob liderança de Atenas.' },
        { year: '449 a.C.', event: 'Assinatura da Paz de Calias, encerrando oficialmente as hostilidades.' }
      ],
      characters: [
        { name: 'Leônidas I', role: 'Rei de Esparta', bio: 'Comandante heróico dos 300 espartanos que tombaram no desfiladeiro das Termópilas.' },
        { name: 'Temístocles', role: 'Estrategista Ateniense', bio: 'Idealizador do poder naval de Atenas e arquiteto da vitória tática na Batalha de Salamina.' },
        { name: 'Heródoto', role: 'Pai da História', bio: 'Cronista grego que registrou a narrativa primária das Guerras Médicas em sua obra *Histórias*.' }
      ],
      sources: [
        { id: 'src-med-1', title: 'Histórias (Historiai)', author: 'Heródoto', year: -440, type: 'document', details: 'Livros VI a IX' },
        { id: 'src-med-2', title: 'The Persian Wars', author: 'Charles Hignett', year: 1963, type: 'book', details: 'Oxford University Press' }
      ]
    },
    {
      id: 'guerras-punicas',
      category: 'História',
      period: 'Antiguidade',
      title: 'As Guerras Púnicas (264 – 146 a.C.)',
      era: 'Antiguidade Clássica Romana (264–146 a.C.)',
      evidenceLevel: 'high',
      summary: 'Roma vs. Cartago (Aníbal e seus elefantes). O marco fundamental que destruiu a potência fenícia e transformou Roma na maior potência militar e econômica do Mediterrâneo (Mare Nostrum).',
      fact: {
        title: 'A Disputa do Mediterrâneo Ocidental',
        description: 'Série de três guerras travadas entre Roma e a república marítima de Cartago pelo controle do comércio mediterrâneo.',
        causaImediata: 'Disputa pelo controle estratégico da ilha da Sicília e das rotas comerciais mercantis do Mediterrâneo Ocidental.',
        desenvolvimento: 'Primeira Guerra (264-241 a.C.): Roma constrói sua frota naval e conquista a Sicília. Segunda Guerra (218-201 a.C.): O general cartaginês Aníbal Barca atravessa os Alpes com elefantes de guerra e impõe severas derrotas a Roma (Cannas), sendo vencido por Cipião o Africano em Zama (202 a.C.). Terceira Guerra (149-146 a.C.): Cerco brutal e aniquilação física total de Cartago.',
        consequencias: 'Destruição total de Cartago, transformação do Mediterrâneo em Mare Nostrum romano, expansão acelerada do latifúndio escravista e transição da República para o imperialismo.'
      },
      interpretation: {
        title: 'A Virada Imperialista da República Romana',
        description: 'Polybius analisou como a vitória sobre Cartago forneceu a infraestrutura militar e os recursos financeiros que converteram Roma de potência regional em império universal.'
      },
      hypothesis: {
        title: 'Destruição Salina de Cartago: Mito ou Fato',
        description: 'Arqueólogos modernos apontam que a lenda de que os romanos teriam jogado sal na terra de Cartago para torná-la infértil é uma construção literária do século XIX.'
      },
      timeline: [
        { year: '264 a.C.', event: 'Início da Primeira Guerra Púnica pela disputa da Sicília.' },
        { year: '218 a.C.', event: 'Aníbal inicia a travessia lendária dos Alpes com exército e elefantes.' },
        { year: '216 a.C.', event: 'Batalha de Cannas; maior massacre tático sofrido pelo exército romano.' },
        { year: '202 a.C.', event: 'Batalha de Zama; Cipião o Africano derrota Aníbal no norte da África.' },
        { year: '146 a.C.', event: 'Destruição completa de Cartago e criação da Província Romana da África.' }
      ],
      characters: [
        { name: 'Aníbal Barca', role: 'General Cartaginês', bio: 'Genial estrategista militar que levou a guerra até os portões de Roma.' },
        { name: 'Cipião o Africano', role: 'General e Cônsul Romano', bio: 'Vencedor de Aníbal na Batalha de Zama e mestre das táticas militares romanas.' },
        { name: 'Políbio', role: 'Historiador Grego', bio: 'Cronista de guerra que testemunhou a queda de Cartago e escreveu as *Histórias*.' }
      ],
      sources: [
        { id: 'src-pun-1', title: 'Histórias (Historiké Syntaxis)', author: 'Políbio', year: -150, type: 'document', details: 'Livros III e XV' },
        { id: 'src-pun-2', title: 'A History of Rome to A.D. 565', author: 'Arthur Boak', year: 1965, type: 'book', details: 'Cap. VII' }
      ]
    },
    {
      id: 'cruzadas',
      category: 'História',
      period: 'Idade Média',
      title: 'As Cruzadas (1095 – 1291 d.C.)',
      era: 'Idade Média (1095–1291 d.C.)',
      evidenceLevel: 'high',
      summary: 'O choque entre a Cristandade Ocidental e o Mundo Islâmico pelo controle de Jerusalém e da Terra Santa, motivando profundas transformações comerciais, sociais e culturais.',
      fact: {
        title: 'Movimento Militar-Religioso no Levante',
        description: 'Expedições armadas convocadas pelo Papado que mobilizaram cavaleiros, reis e camponeses em direção ao Oriente Próximo.',
        causaImediata: 'O apelo do imperador bizantino Aleixo I e a convocação do Papa Urbano II no Concílio de Clermont (1095) prometendo a remissão dos pecados aos que libertassem Jerusalém dos turcos seljúcidas.',
        desenvolvimento: 'Primeira Cruzada (1096-1099): Tomada sangrenta de Jerusalém e criação dos Reinos Cruzados. Segunda e Terceira Cruzada: Duelo entre o sultão Saladino (que reconquistou Jerusalém em 1187) e Ricardo Coração de Leão. Quarta Cruzada (1202-1204): Desviada pelos interesses de Veneza, resultou no saque de Constantinopla.',
        consequencias: 'Reabertura das rotas mercantis no Mediterrâneo (renascimento urbano e comercial), enfraquecimento dos senhores feudais e fortalecimento do poder monárquico.'
      },
      interpretation: {
        title: 'Expansão Feudal vs. Guerra Santa',
        description: 'Historiadores econômicos analisam as Cruzadas como válvula de escape para o excedente populacional e a busca de terras pela nobreza desprovida de feudos na Europa.'
      },
      hypothesis: {
        title: 'Convivência Pragmática no Levante',
        description: 'Registros de cronistas árabes como Usama ibn Munqidh mostram que, entre as guerras, havia intensa convivência comercial, médica e cultural entre cruzados e muçulmanos.'
      },
      timeline: [
        { year: '1095', event: 'Papa Urbano II convoca o Concílio de Clermont e decreta a Primeira Cruzada.' },
        { year: '1099', event: 'Conquista de Jerusalém pelos cruzados e fundação do Reino de Jerusalém.' },
        { year: '1187', event: 'Saladino reconquista Jerusalém na Batalha de Hattin.' },
        { year: '1204', event: 'Quarta Cruzada saqueia a capital cristã de Constantinopla.' },
        { year: '1291', event: 'Queda de São João d\'Acre, encerrando a presença cruzada na Terra Santa.' }
      ],
      characters: [
        { name: 'Papa Urbano II', role: 'Pontífice Católico', bio: 'Iniciador do movimento cruzado no discurso histórico de Clermont.' },
        { name: 'Saladino (Salah ad-Din)', role: 'Sultão do Egito e Síria', bio: 'Líder muçulmano respeitado por sua cavalheirismo e reconquistador de Jerusalém.' },
        { name: 'Ricardo Coração de Leão', role: 'Rei da Inglaterra', bio: 'Comandante da Terceira Cruzada e principal oponente militar de Saladino.' }
      ],
      sources: [
        { id: 'src-cru-1', title: 'Gesta Francorum et aliorum Hierosolimitanorum', author: 'Anônimo', year: 1101, type: 'document', details: 'Relato de testemunha da 1ª Cruzada' },
        { id: 'src-cru-2', title: 'As Cruzadas Vistas pelos Árabes', author: 'Amin Maalouf', year: 1983, type: 'book', details: 'Editora Brasiliense' }
      ]
    },
    {
      id: 'guerra-cem-anos',
      category: 'História',
      period: 'Idade Média',
      title: 'A Guerra dos Cem Anos (1337 – 1453 d.C.)',
      era: 'Fim da Idade Média (1337–1453 d.C.)',
      evidenceLevel: 'high',
      summary: 'França vs. Inglaterra (Joana D\'Arc). O fim do sistema feudal de cavalaria, o nascimento dos exércitos permanentes e a transição para as monarquias nacionais consolidadas.',
      fact: {
        title: 'O Secular Conflito Dinástico e Territorial',
        description: 'Conflito prolongado travado em solo francês entre a dinastia dos Valois (França) e a dinastia dos Plantageneta (Inglaterra).',
        causaImediata: 'Disputa pela sucessão do trono francês após a morte de Carlos IV em 1328 e o controle da rica região mercantil de Flandres.',
        desenvolvimento: 'Fase de vitórias inglesas impulsionadas pelos arqueiros na Batalha de Crécy (1346) e Azincourt (1415). Fase de virada francesa (1429): Liderança mística e militar de Joana D\'Arc rompendo o Cerco de Orléans e coroando Carlos VII, culminando na vitória francesa final em Castillon (1453).',
        consequencias: 'Expulsão dos ingleses da França, consolidação do sentimento nacionalista e centralização das monarquias absolutas na França e Inglaterra.'
      },
      interpretation: {
        title: 'O Nascimento da Identidade Nacional Moderna',
        description: 'Historiadores franceses e britânicos analisam o conflito como o catalisador que separou a identidade cultural de ambos os reinos, extinguindo o mundo feudal fragmentado.'
      },
      hypothesis: {
        title: 'O Papel da Artilharia de Pólvora na Vitória Francesa',
        description: 'Pesquisadores militares demonstram que foram os canhões franceses desenvolvidos pelos irmãos Bureau, e não apenas o fervor de Joana D\'Arc, que decidiram as batalhas finais de Castillon.'
      },
      timeline: [
        { year: '1337', event: 'Eduardo III da Inglaterra declara guerra à França.' },
        { year: '1346', event: 'Batalha de Crécy; demonstração do poder destruidor do arco longo inglês.' },
        { year: '1415', event: 'Batalha de Azincourt; vitória esmagadora de Henrique V da Inglaterra.' },
        { year: '1429', event: 'Joana D\'Arc liberta a cidade de Orléans e transforma o rumo da guerra.' },
        { year: '1453', event: 'Batalha de Castillon; vitória francesa decisiva e fim do conflito.' }
      ],
      characters: [
        { name: 'Joana D\'Arc', role: 'Heroína e Padroeira da França', bio: 'Jovem camponesa cujas visões e coragem lideraram a reconquista do território francês.' },
        { name: 'Henrique V', role: 'Rei da Inglaterra', bio: 'Monarca guerreiro responsável pela vitória memorável na Batalha de Azincourt.' },
        { name: 'Carlos VII', role: 'Rei da França', bio: 'Monarca coroado em Reims graças ao apoio de Joana D\'Arc que unificou a França.' }
      ],
      sources: [
        { id: 'src-100-1', title: 'Chroniques de Froissart', author: 'Jean Froissart', year: 1400, type: 'document', details: 'Manuscrito iluminado' },
        { id: 'src-100-2', title: 'The Hundred Years War', author: 'Robin Neillands', year: 1990, type: 'book', details: 'Routledge' }
      ]
    },
    {
      id: 'guerras-napoleonicas',
      category: 'História',
      period: 'Idade Moderna',
      title: 'As Guerras Napoleônicas (1803 – 1815 d.C.)',
      era: 'Idade Contemporânea (1803–1815 d.C.)',
      evidenceLevel: 'high',
      summary: 'O expansionismo francês sob Napoleão Bonaparte, o Bloqueio Continental, a transferência da Família Real Portuguesa para o Brasil em 1808 e a redefinição do mapa político no Congresso de Viena.',
      fact: {
        title: 'A Hegemonia Napoleônica e a Reconstrução Européia',
        description: 'Série de conflitos entre o Primeiro Império Francês de Napoleão e coligações de potências absolutistas financiadas pela Grã-Bretanha.',
        causaImediata: 'Ambição de Napoleão em estender a hegemonia da Revolução Francesa e destruir o monopólio comercial britânico.',
        desenvolvimento: 'Vitórias brilhantes na Europa continental (Austerlitz em 1805). O Bloqueio Continental (1806) força a fuga da Família Real Portuguesa para o Brasil (1808). A desastrosa Invasão da Rússia (1812) dizima a Grande Armée, culminando na derrota final na Batalha de Waterloo (1815).',
        consequencias: 'Congresso de Viena (1815) restaurando as monarquias europeias, difusão do ideário liberal e aceleração das independências na América Latina.'
      },
      interpretation: {
        title: 'Modernização Institucional via Conquista',
        description: 'Historiadores do direito destacam que o Código Napoleônico abolindo o feudalismo foi implantado em todos os territórios ocupados, fundando as bases do Estado moderno europeu.'
      },
      hypothesis: {
        title: 'O Papel do Inverno Russo vs. Tática da Terra Arrasada',
        description: 'Análises logísticas mostram que as febres e a escassez de suprimentos provocadas pela terra arrasada russa causaram mais baixas a Napoleão do que o rigor do inverno.'
      },
      timeline: [
        { year: '1804', event: 'Napoleão Bonaparte coroa-se Imperador dos Franceses na Catedral de Notre-Dame.' },
        { year: '1805', event: 'Derrota naval em Trafalgar para a Grã-Bretanha e vitória brilhante em Austerlitz.' },
        { year: '1806', event: 'Decreto de Berlim instituindo o Bloqueio Continental contra a Inglaterra.' },
        { year: '1808', event: 'Chegada da Família Real Portuguesa ao Rio de Janeiro após a invasão de Portugal.' },
        { year: '1815', event: 'Batalha de Waterloo e início do Congresso de Viena.' }
      ],
      characters: [
        { name: 'Napoleão Bonaparte', role: 'Imperador dos Franceses', bio: 'Estrategista militar lendário e reformador do direito moderno ocidental.' },
        { name: 'Duque de Wellington', role: 'General Britânico', bio: 'Comandante das forças aliadas que venceu Napoleão na Batalha de Waterloo.' },
        { name: 'D. João VI', role: 'Príncipe Regente de Portugal', bio: 'Monarca que transferiu a corte portuguesa para o Rio de Janeiro em 1808.' }
      ],
      sources: [
        { id: 'src-nap-1', title: 'The Napoleonic Wars: A Very Short Introduction', author: 'Mike Rapport', year: 2013, type: 'book', details: 'Oxford University Press' },
        { id: 'src-nap-2', title: '1808', author: 'Laurentino Gomes', year: 2007, type: 'book', details: 'Editora Planeta' }
      ]
    },
    {
      id: 'guerra-civil-espanhola',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Guerra Civil Espanhola (1936 – 1939 d.C.)',
      era: 'Século XX (1936–1939 d.C.)',
      evidenceLevel: 'high',
      summary: 'O ensaio geral da Segunda Guerra Mundial. O golpe fascista do General Franco contra a Segunda República Espanhola, com testes de armas nazistas (Guernica) e a participação das Brigadas Internacionais.',
      fact: {
        title: 'Fascismo vs. Democracia no Solo Ibérico',
        description: 'Conflito violento que dividiu a Espanha entre 1936 e 1939, antecipando os blocos e táticas da II Guerra.',
        causaImediata: 'O golpe de Estado promovido em julho de 1936 por generais ultraconservadores contra o governo eleito da Segunda República (Frente Popular).',
        desenvolvimento: 'Os Nacionalistas de Franco receberam apoio maciço de tropas, tanques e aviação de Hitler e Mussolini (Legião Condor nazista bombardeia Guernica). Os Republicanos lutaram apoiados pelas Brigadas Internacionais e pela URSS.',
        consequencias: 'Vitória de Franco e instalação da ditadura franquista (1939-1975), devastação da Espanha e consolidação das táticas de guerra da Alemanha Nazista.'
      },
      interpretation: {
        title: 'Laboratório de Guerra e Ideologia',
        description: 'Hugh Thomas analisa a guerra como a primeira grande batalha física entre o fascismo europeu ascendente e o bloco democrático/socialista.'
      },
      hypothesis: {
        title: 'O Impacto da "Não-Intervenção" Ocidental',
        description: 'Historiadores demonstram que a política de "Não-Intervenção" mantida por França e Grã-Bretanha selou o destino da democracia espanhola, isolando os republicanos.'
      },
      timeline: [
        { year: '1936 (Julho)', event: 'Golpe militar liderado pelo General Francisco Franco no Marrocos espanhol.' },
        { year: '1937 (Abril)', event: 'Bombardeio nazista da cidade basca de Guernica pela Legião Condor.' },
        { year: '1938', event: 'Batalha do Ebro; maior e mais sangrenta batalha do conflito.' },
        { year: '1939 (Março)', event: 'Queda de Madri, vitória franquista e início da ditadura.' }
      ],
      characters: [
        { name: 'General Francisco Franco', role: 'Caudilho da Espanha', bio: 'Líder dos rebeldes fascistas que governou a Espanha autoritariamente até 1975.' },
        { name: 'Pablo Picasso', role: 'Pintor Espanhol', bio: 'Criador do painel monumental *Guernica*, denúncia universal dos horrores da guerra.' },
        { name: 'Dolores Ibárruri (La Pasionaria)', role: 'Líder Republicana', bio: 'Oradora inflamada famosa pelo bordão antifascista "¡No pasarán!".' }
      ],
      sources: [
        { id: 'src-esp-1', title: 'The Spanish Civil War', author: 'Hugh Thomas', year: 1961, type: 'book', details: 'Harper & Row' },
        { id: 'src-esp-2', title: 'Homage to Catalonia', author: 'George Orwell', year: 1938, type: 'book', details: 'Relato autbiográfico de voluntário' }
      ]
    },
    {
      id: 'guerra-fria-conflitos',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Guerra Fria e os Conflitos Indiretos (1947 – 1991 d.C.)',
      era: 'Século XX (1947–1991 d.C.)',
      evidenceLevel: 'high',
      summary: 'A Ordem Bipolar global (EUA vs. URSS). Disputas por procuração na Coreia, Vietnã, Crise dos Mísseis em Cuba, Corrida Espacial, ditaduras latino-americanas e a queda do Bloco Soviético em 1991.',
      fact: {
        title: 'Tensão Geopolítica Bipolar sem Confronto Direto',
        description: 'Antagonismo ideológico, econômico e militar entre o capitalismo liderado por Washington e o socialismo liderado por Moscou.',
        causaImediata: 'A divisão da Europa em zonas de influência após a Segunda Guerra Mundial e a Doutrina Truman de contenção do comunismo.',
        desenvolvimento: 'Conflitos indiretos: Guerra da Coreia (1950-1953), Crise dos Mísseis em Cuba (1962), Guerra do Vietnã (1955-1975), Corrida Espacial e Armamentista (MAD).',
        consequencias: 'Subvenção de regimes autoritários no Terceiro Mundo, colapso econômico da URSS, queda do Muro de Berlim (1989) e dissolução da União Soviética (1991).'
      },
      interpretation: {
        title: 'Paz Quente no Terceiro Mundo',
        description: 'John Lewis Gaddis ressalta que embora a Europa tenha vivido a "Longa Paz", a Guerra Fria foi extremamente quente e mortal na Ásia, África e América Latina.'
      },
      hypothesis: {
        title: 'A Inevitabilidade da Falência Soviética',
        description: 'Economistas políticos apontam que a corrida armamentista travada por Reagan nos anos 80 acelerou a falência estrutural do modelo de economia planificada soviético.'
      },
      timeline: [
        { year: '1947', event: 'Anúncio da Doutrina Truman e criação do Plano Marshall.' },
        { year: '1950–1953', event: 'Guerra da Coreia; consolidação da divisão da península no Paralelo 38°.' },
        { year: '1962', event: 'Crise dos Mísseis em Cuba; apogeu do risco nuclear entre Kennedy e Khrushchev.' },
        { year: '1975', event: 'Fim da Guerra do Vietnã e unificação comunista do país.' },
        { year: '1989–1991', event: 'Queda do Muro de Berlim e dissolução da União Soviética.' }
      ],
      characters: [
        { name: 'John F. Kennedy', role: 'Presidente dos EUA', bio: 'Líder americano durante a dramática Crise dos Mísseis de Cuba e o Programa Apollo.' },
        { name: 'Nikita Khrushchev', role: 'Líder da União Soviética', bio: 'Primeiro-secretário do PCUS que promoveu a desestalinização e a Crise de Cuba.' },
        { name: 'Mikhail Gorbachev', role: 'Último Líder da URSS', bio: 'Promotor da *Glasnost* e *Perestroika* que conduziram ao fim negociado da Guerra Fria.' }
      ],
      sources: [
        { id: 'src-fri-1', title: 'The Cold War: A New History', author: 'John Lewis Gaddis', year: 2005, type: 'book', details: 'Penguin Books' },
        { id: 'src-fri-2', title: 'Diplomacia', author: 'Henry Kissinger', year: 1994, type: 'book', details: 'Editora Francisco Alves' }
      ]
    },
    {
      id: 'guerra-canudos',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Guerra de Canudos (1896 – 1897)',
      era: 'República Velha (1896–1897)',
      evidenceLevel: 'high',
      summary: 'O massacre da comunidade messiânica de Antônio Conselheiro no sertão da Bahia. A resistência heroica dos sertanejos contra o Exército da recém-fundada República, eternizada por Euclides da Cunha.',
      fact: {
        title: 'O Arraial de Belo Monte e o Massacre Sertanejo',
        description: 'Levante social e comunitário no sertão baiano que reuniu 25.000 pessoas marginalizadas pela miséria e seca.',
        causaImediata: 'Inconformismo de Antônio Conselheiro com a cobrança de novos impostos pela República e litígio comercial de madeira em Juazeiro.',
        desenvolvimento: 'Formação do Arraial comunitário de Canudos. Três expedições militares estaduais e federais foram vergonhosamente derrotadas pela guerrilha sertaneja na caatinga. A quarta expedição nacional usou artilharia pesada e milhares de soldados para exterminar o arraial.',
        consequencias: 'Destruição total de Canudos, massacre de 25.000 sertanejos e denúncia da profunda exclusão social do Brasil em *Os Sertões*.'
      },
      interpretation: {
        title: 'O Choque entre Dois Brasís',
        description: 'Euclides da Cunha interpretou Canudos como o trágico desencontro entre o litoral urbano ocidentalizado e o sertão arcaico esquecido.'
      },
      hypothesis: {
        title: 'Autonomia Comunitária vs. Ameaça Monarquista',
        description: 'Historiadores modernos provam que Canudos não era uma conspiração monarquista financiada pelo exterior, mas um movimento de sobrevivência e fé camponesa autônoma.'
      },
      timeline: [
        { year: '1893', event: 'Antônio Conselheiro e seus seguidores fixam-se na fazenda abandonada de Canudos.' },
        { year: '1896 (Nov)', event: 'Primeira expedição militar é derrotada pelos sertanejos em Uauá.' },
        { year: '1897 (Março)', event: 'Derrota e morte do Coronel Moreira César na terceira expedição.' },
        { year: '1897 (Outubro)', event: 'Queda final do Arraial de Canudos e morte dos últimos defensores.' }
      ],
      characters: [
        { name: 'Antônio Conselheiro', role: 'Líder Messiânico', bio: 'Peregrino que fundou Belo Monte (Canudos) como refúgio comunitário para os desvalidos.' },
        { name: 'Euclides da Cunha', role: 'Engenheiro e Jornalista', bio: 'Coordenou a cobertura de guerra para O Estado de S. Paulo e escreveu *Os Sertões*.' },
        { name: 'Coronel Moreira César', role: 'Comandante Militar', bio: 'Famoso pela truculência no Rio de Janeiro, foi morto na desastrosa 3ª expedição.' }
      ],
      sources: [
        { id: 'src-can-1', title: 'Os Sertões', author: 'Euclides da Cunha', year: 1902, type: 'book', details: 'Edição Crítica de Walnice Nogueira Galvão' },
        { id: 'src-can-2', title: 'A Guerra do Fim do Mundo', author: 'Mario Vargas Llosa', year: 1981, type: 'book', details: 'Romance histórico fundamentado' }
      ]
    },
    {
      id: 'guerra-do-paraguai',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A Guerra do Paraguai / Tríplice Aliança (1864 – 1870)',
      era: 'Brasil Império (1864–1870)',
      evidenceLevel: 'high',
      summary: 'O maior conflito militar da história da América do Sul. Tríplice Aliança (Brasil, Argentina e Uruguai) vs. Paraguai de Solano López. Riachuelo, Tuiuti, Caxias e as consequências sociopolíticas para o Império.',
      fact: {
        title: 'Conflito Continental na Bacia do Rio da Prata',
        description: 'Guerra total travada entre a Tríplice Aliança e o Paraguai pela navegação dos rios e hegemonia regional.',
        causaImediata: 'A intervenção armada do Brasil no Uruguai (1864) e o apresamento do vapor brasileiro *Marquês de Olinda* por ordem de Solano López.',
        desenvolvimento: 'Vitória naval do Brasil em Riachuelo (1865) fecha os rios ao Paraguai. Sangrenta Batalha de Tuiuti (1866). Comando de Caxias na "Dezembrada" (1868) e ocupação de Assunção (1869), terminando na caçada a López em Cerro Corá (1870).',
        consequencias: 'Devastação demográfica e econômica do Paraguai, fortalecimento político do Exército Brasileiro (abolicionismo/republicanismo) e endividamento imperial.'
      },
      interpretation: {
        title: 'Imperialismo Inglês vs. Questões Platinas Locais',
        description: 'A historiografia revisou a antiga tese da "mão invisível inglesa", provando que o conflito nasceu das disputas internas de fronteira e consolidação dos Estados platinos.'
      },
      hypothesis: {
        title: 'Contraditório Papel dos Voluntários da Pátria Escravizados',
        description: 'A promessa de alforria enviou milhares de negros escravizados para a guerra, cuja atuação destacada tornou insustentável a manutenção da escravidão no retorno.'
      },
      timeline: [
        { year: '1864 (Dezembro)', event: 'Paraguai aprisiona o navio *Marquês de Olinda* e invade o Mato Grosso.' },
        { year: '1865 (Junho)', event: 'Batalha Naval do Riachuelo; destruição da esquadra paraguaia pela Marinha Imperial.' },
        { year: '1866 (Maio)', event: 'Batalha de Tuiuti; maior e mais mortífera batalha em solo sul-americano.' },
        { year: '1868 (Dezembro)', event: 'Ofensiva de Caxias na "Dezembrada" (Avaí, Lomas Valentas e Ytororó).' },
        { year: '1870 (Março)', event: 'Batalha de Cerro Corá e morte de Francisco Solano López.' }
      ],
      characters: [
        { name: 'Duque de Caxias', role: 'Patrono do Exército Brasileiro', bio: 'Comandante supremo que reorganizou as tropas brasileiras e venceu a fase decisiva.' },
        { name: 'Francisco Solano López', role: 'Presidente do Paraguai', bio: 'Ditador paraguaio que conduziu o país à guerra total e recusou a rendição até a morte.' },
        { name: 'Almirante Barroso', role: 'Comandante da Marinha Imperial', bio: 'Herói da Batalha Naval do Riachuelo com a famosa célebre ordem "O Brasil espera que cada um cumpra o seu dever".' }
      ],
      sources: [
        { id: 'src-par-1', title: 'Maldita Guerra: Nova História da Guerra do Paraguai', author: 'Francisco Doratioto', year: 2002, type: 'book', details: 'Companhia das Letras' },
        { id: 'src-par-2', title: 'Diário da Guerra do Paraguai', author: 'Alfredo d\'Escragnolle Taunay', year: 1870, type: 'document', details: 'Relato de oficial e escritor' }
      ]
    },
    {
      id: 'feb-segunda-guerra',
      category: 'História do Brasil',
      period: 'História do Brasil',
      title: 'A FEB na Segunda Guerra Mundial (1944 – 1945)',
      era: 'Século XX (1944–1945)',
      evidenceLevel: 'high',
      summary: 'A participação heroica do Brasil na vitória aliada sobre o nazifascismo. Os 25.000 pracinhas na Frente Italiana, as vitórias em Monte Castello e Fornovo di Taro e a contradição que derrubou o Estado Novo de Vargas.',
      fact: {
        title: 'A Cobra Vai Fumar na Linha Gótica',
        description: 'O envio da Força Expedicionária Brasileira (FEB) e da FAB para combater as divisões alemãs na Itália.',
        causaImediata: 'O afundamento brutal de navios mercantes brasileiros por submarinos do Eixo no Atlântico Sul em 1942, mobilizando a opinião pública.',
        desenvolvimento: 'Envio de 25.000 pracinhas sob o comando do General Mascarenhas de Moraes. Enfrentando neve rigorosa, venceram as batalhas estratégicas de Monte Castello (fevereiro de 1945) e Castelnuovo, aprisionando uma divisão alemã inteira em Fornovo di Taro.',
        consequencias: 'Glorificação militar do soldado brasileiro e aceleração da queda da ditadura de Getúlio Vargas em 1945 devido à contradição de combater regimes autoritários fora do país.'
      },
      interpretation: {
        title: 'Alinhamento Pragmático com Washington',
        description: 'Gerson Moura demonstra que Vargas negociou o envio da FEB e os suprimentos de borracha e quartzo em troca do financiamento americano para a Usina Siderúrgica de Volta Redonda (CSN).'
      },
      hypothesis: {
        title: 'A Legendária Origem do Lema "A Cobra Vai Fumar"',
        description: 'A expressão popular nasceu da ironia dos céticos que diziam ser "mais fácil uma cobra fumar cachimbo do que o Brasil entrar na guerra".'
      },
      timeline: [
        { year: '1942 (Agosto)', event: 'Vargas declara estado de beligerância contra a Alemanha e Itália após afundamento de navios.' },
        { year: '1944 (Julho)', event: 'Desembarque do primeiro contingente da FEB em Nápoles, Itália.' },
        { year: '1945 (Fevereiro)', event: 'Tomada histórica de Monte Castello pelas tropas brasileiras após meses de cerco.' },
        { year: '1945 (Abril)', event: 'Rendição da 148ª Divisão Alemã em Fornovo di Taro aos pracinhas.' }
      ],
      characters: [
        { name: 'General Mascarenhas de Moraes', role: 'Comandante da FEB', bio: 'Liderou o contingente brasileiro com brilhantismo e disciplina na Frente Italiana.' },
        { name: 'Capitão Av. Nero Moura', role: 'Comandante do 1º Grupo de Caça', bio: 'Líder da aviação brasileira ("Senta a Pua!") que realizou centenas de missões de ataque.' },
        { name: 'Gerson Moura', role: 'Historiador das Relações Internacionais', bio: 'Autor de obras fundamentais sobre o alinhamento Brasil-EUA na Segunda Guerra.' }
      ],
      sources: [
        { id: 'src-feb-1', title: 'A FEB pelo seu Comandante', author: 'Marshal J.B. Mascarenhas de Moraes', year: 1947, type: 'document', details: 'Editora do Autor' },
        { id: 'src-feb-2', title: 'Suplicantes em Washington: Brasil na Segunda Guerra', author: 'Gerson Moura', year: 1986, type: 'book', details: 'Editora Brasiliense' }
      ]
    },
    {
      id: 'rota-da-seda-imperio-mongol',
      category: 'História',
      period: 'Idade Média',
      title: 'A Rota da Seda e o Império Mongol (c. 130 a.C. – 1206 d.C.)',
      era: 'Antiguidade Oriental e Idade Média',
      evidenceLevel: 'high',
      summary: 'A teia de redes comerciais da Rota da Seda e sua unificação política sob Genghis Khan no século XIII, fundando o maior império contínuo da história mundial e impulsionando trocas científicas e culturais entre Oriente e Ocidente.',
      fact: {
        title: 'A Pax Mongolica e a Conexão Eurasiática',
        description: 'Sob o comando de Temüjin (Genghis Khan) a partir de 1206 d.C., os exércitos nômades mongóis unificaram a estepe, conquistaram a China (Dinastia Yuan) e expandiram-se até a Rússia e o Leste Europeu. O sistema de correios imperiais com estações de troca (Yam) permitiu que viajantes como Marco Polo cruzassem a Eurásia em segurança sob a garantia da lei mongol (Yassa).'
      },
      interpretation: {
        title: 'Integração Comercial e Transmissão Tecnológica Global',
        description: 'Historiadores orientais e ocidentais destacam que o Império Mongol não representou apenas saques militares, mas funcionou como o principal catalisador da globalização pré-moderna, transferindo a bússola marítima, a pólvora, o papel e a imprensa móvel de porcelana da China para o mundo islâmico e para a Europa.'
      },
      hypothesis: {
        title: 'Vetor de Disseminação da Peste Negra',
        description: 'Pesquisadores epidemiológicos e históricos sustentam que a extrema fluidez e rapidez comercial garantida pela Pax Mongolica através das rotas caravaneiras facilitou inadvertidamente a rápida propagação da Peste Negra (Yersinia pestis) dos reservatórios da Ásia Central para o porto de Caffa e para a Europa em 1347.'
      },
      timeline: [
        { year: '130 a.C.', event: 'A Dinastia Han oficializa as rotas caravaneiras da Rota da Seda após as missões de Zhang Qian.' },
        { year: '1206 d.C.', event: 'Kurultai (Assembleia dos Clãs) aclama Temüjin como Genghis Khan, unificando a Mongólia.' },
        { year: '1271–1295 d.C.', event: 'Marco Polo viaja à China e serve na corte do Grão-Khan Kublai Khan.' },
        { year: '1368 d.C.', event: 'A Dinastia Ming derruba os mongóis na China, fragmentando o império em canatos regionais.' }
      ],
      characters: [
        { name: 'Genghis Khan (Temüjin)', role: 'Fundador do Império Mongol', bio: 'Gênio militar e diplomático que unificou os clãs das estepes e criou o maior império contínuo do planeta.' },
        { name: 'Kublai Khan', role: 'Imperador da China e Grão-Khan', bio: 'Neto de Genghis Khan que fundou a Dinastia Yuan e construiu a capital Khanbaliq (atual Pequim).' },
        { name: 'Marco Polo', role: 'Mercador e Cronista Veneziano', bio: 'Viajante que registrou em "As Viagens de Marco Polo" as riquezas e a organização do império mongol.' }
      ],
      sources: [
        { id: 'src-mon-1', title: 'A História Secreta dos Mongóis', author: 'Anônimo da Corte Mongol', year: 1240, type: 'document', details: 'Único registro literário mongol contemporâneo preservado' },
        { id: 'src-mon-2', title: 'Genghis Khan and the Making of the Modern World', author: 'Jack Weatherford', year: 2004, type: 'book', details: 'Crown Publishers, Cap. 3-7' }
      ]
    },
    {
      id: 'independencia-eua-1776',
      category: 'História',
      period: 'Idade Moderna',
      title: 'A Independência dos Estados Unidos e o Iluminismo (1776 d.C.)',
      era: 'Século XVIII (1776 d.C.)',
      evidenceLevel: 'high',
      summary: 'A ruptura colonial das Treze Colônias contra a Coroa Britânica em 1776. Fundada nos princípios iluministas de John Locke e Montesquieu, deu origem à primeira república constitucional e ao modelo democrático representativo moderno.',
      fact: {
        title: 'A Declaração de Independência de 4 de Julho de 1776',
        description: 'Elaborada por Thomas Jefferson, John Adams e Benjamin Franklin durante o Segundo Congresso Continental na Filadélfia, a declaração rompeu os laços com o Rei Jorge III, afirmando que todos os homens possuem direitos inalienáveis — à vida, liberdade e busca pela felicidade — e que governos derivam seu consentimento dos governados.'
      },
      interpretation: {
        title: 'O Efeito Dominó das Revoluções Atlânticas',
        description: 'O historiador Eric Hobsbawm e pesquisadores da "Era das Revoluções Atlânticas" apontam a Revolução Americana como o gatilho inicial que desestabilizou o Antigo Regime europeu: inspirou diretamente a Revolução Francesa de 1789, a Revolução Haitiana de 1791 e as independências da América Latina.'
      },
      hypothesis: {
        title: 'Contradição entre Liberdade Iluminista e Escravidão',
        description: 'Historiadores sociais analisam a profunda contradição fundacional da república americana, na qual autores da declaração de liberdade (como Jefferson e Washington) eram proprietários de centenas de pessoas escravizadas, postergando o debate abolicionista por quase um século.'
      },
      timeline: [
        { year: '1773', event: 'Festa do Chá de Boston (Boston Tea Party) em protesto contra impostos coloniais britânicos.' },
        { year: '1776 (4 Julho)', event: 'Aprovação e publicação oficial da Declaração de Independência na Filadélfia.' },
        { year: '1781', event: 'Batalha de Yorktown; vitória decisiva franco-americana contra as tropas britânicas.' },
        { year: '1787', event: 'Promulgação da Constituição dos Estados Unidos institui o presidencialismo e três poderes.' }
      ],
      characters: [
        { name: 'Thomas Jefferson', role: 'Autor da Declaração e 3º Presidente', bio: 'Mente intelectual iluminista das Treze Colônias e principal redator da Declaração de Independência.' },
        { name: 'George Washington', role: 'Comandante Militar e 1º Presidente', bio: 'General que liderou o Exército Continental na guerra e tornou-se o primeiro presidente americano.' },
        { name: 'Benjamin Franklin', role: 'Cientista, Diplomata e Político', bio: 'Articulador crucial da aliança militar com a França que garantiu recursos para a vitória republicana.' }
      ],
      sources: [
        { id: 'src-eua-1', title: 'Declaração de Independência dos Estados Unidos', author: 'Thomas Jefferson et al.', year: 1776, type: 'document', details: 'Original preservado nos Arquivos Nacionais (National Archives, Washington)' },
        { id: 'src-eua-2', title: 'The Ideological Origins of the American Revolution', author: 'Bernard Bailyn', year: 1967, type: 'book', details: 'Harvard University Press, Prêmio Pulitzer' }
      ]
    },
    {
      id: 'restauracao-meiji-japao',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Restauração Meiji e o Fim do Japão Feudal (1868 d.C.)',
      era: 'Século XIX (1868 d.C.)',
      evidenceLevel: 'high',
      summary: 'A queda do Xogunato Tokugawa e a abolição da ordem feudal dos samurais, dando lugar à rápida industrialização, centralização imperial e ocidentalização tecnológica sob o Imperador Meiji.',
      fact: {
        title: 'A Queda de Edo e a Lei de Abolição dos Daimyos e Samurais',
        description: 'Em 1868, após a Guerra Boshin entre forças fiéis ao Xogum e partidários imperiais, o Xogum Tokugawa Yoshinobu renunciou. A capital foi transferida de Quioto para Edo (renomeada Tóquio). O novo governo aboliu os domínios feudais (han), proibiu os samurais de carregarem espadas em público e criou um exército nacional de recrutamento obrigatório.'
      },
      interpretation: {
        title: 'A Reação ao Imperialismo Ocidental ("Fukoku Kyohei")',
        description: 'A historiografia asiática explica que o lema Meiji "Fukoku Kyohei" (Enriquecer o País, Fortalecer o Exército) não foi mera cópia do Ocidente, mas uma estratégia defensiva para evitar o destino da China (subjugada na Guerra do Ópio), transformando o Japão em um império autônomo e altamente competitivo.'
      },
      hypothesis: {
        title: 'O Papel dos Jovens Samurais Baixos',
        description: 'Especialistas em história japonesa demonstram que a revolução não partiu da massa camponesa nem do imperador adolescente, mas de uma elite de samurais de baixa patente dos feudos do sul (Satsuma e Choshu), como Saigo Takamori e Ito Hirobumi.'
      },
      timeline: [
        { year: '1853', event: 'O Comodoro americano Matthew Perry força a abertura dos portos japoneses com os "Navios Negros".' },
        { year: '1868', event: 'Guerra Boshin, restauração formal do Imperador Meiji e proclamação do Juramento de Cinco Artigos.' },
        { year: '1871–1873', event: 'Missão Iwakura percorre EUA e Europa estudando leis, fábricas e o sistema escolar moderno.' },
        { year: '1889', event: 'Promulgação da Constituição Meiji estabelece a Dieta Imperial (parlamento).' }
      ],
      characters: [
        { name: 'Imperador Meiji (Mutsuhito)', role: 'Imperador do Japão (1867–1912)', bio: 'Símbolo da renovação nacional sob cujo reinado o Japão transformou-se em potência global.' },
        { name: 'Saigo Takamori', role: 'Líder Samurai de Satsuma', bio: 'Pai do exército moderno que posteriormente liderou a Rebelião de Satsuma em defesa da honra samurai.' },
        { name: 'Ito Hirobumi', role: 'Primeiro-Ministro do Japão', bio: 'Arquiteto da Constituição Meiji e da modernização do sistema de governo parlamentar japonês.' }
      ],
      sources: [
        { id: 'src-meiji-1', title: 'The Meiji Restoration', author: 'W. G. Beasley', year: 1972, type: 'book', details: 'Stanford University Press' },
        { id: 'src-meiji-2', title: 'Juramento dos Cinco Artigos da Era Meiji', author: 'Governo Imperial', year: 1868, type: 'document', details: 'Decreto Imperial de 6 de abril de 1868' }
      ]
    },
    {
      id: 'guerra-fria-queda-muro-berlim',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'A Guerra Fria e a Queda do Muro de Berlim (1947 – 1989 d.C.)',
      era: 'Segunda Metade do Século XX (1947–1989 d.C.)',
      evidenceLevel: 'high',
      summary: 'A disputa ideológica, econômica e militar entre o bloco capitalista (EUA) e o bloco socialista (URSS). Marcada pela corrida armamentista nuclear e pela icônica Queda do Muro de Berlim em 1989, antecipando a dissolução da URSS.',
      fact: {
        title: 'A Divisão Ideológica e a Noite de 9 de Novembro de 1989',
        description: 'Construído em 1961 pela Alemanha Oriental (RDA) para conter a fuga de cidadãos para Berlim Ocidental, o Muro de Berlim permaneceu por 28 anos como o maior símbolo físico da Cortina de Ferro. Em 9 de novembro de 1989, sob intensa pressão popular e um anúncio incorreto de abertura de fronteiras, milhares de berlinenses de ambos os lados derrubaram o muro com picaretas e marretas.'
      },
      interpretation: {
        title: 'As Reformas de Gorbachev e o Fim da Bipolaridade',
        description: 'Historiadores analisam que a queda não ocorreu por agressão militar da OTAN, mas pela falência econômica do modelo soviético e pelas políticas de transparência (Glasnost) e reestruturação (Perestroika) de Mikhail Gorbachev, que recusou enviar tanques para conter os protestos no Leste Europeu.'
      },
      hypothesis: {
        title: 'A Tese do "Fim da História" de Francis Fukuyama',
        description: 'Após a queda do muro e o colapso soviético em 1991, o cientista político Francis Fukuyama lançou a hipótese de que a humanidade havia atingido o "Fim da História", com a vitória definitiva da democracia liberal e do capitalismo de mercado.'
      },
      timeline: [
        { year: '1947', event: 'Doutrina Truman e Plano Marshall marcam o início oficial da contenção da Guerra Fria.' },
        { year: '1961', event: 'Construção do Muro de Berlim dividindo a capital alemã em dois setores ideológicos.' },
        { year: '1962', event: 'Crise dos Mísseis de Cuba; momento de maior proximidade com a guerra nuclear total.' },
        { year: '1989 (9 Nov)', event: 'Queda do Muro de Berlim; reunificação alemã consumada no ano seguinte (1990).' },
        { year: '1991 (25 Dez)', event: 'Dissolução oficial da União Soviética e fim da ordem geopolítica bipolar.' }
      ],
      characters: [
        { name: 'Mikhail Gorbachev', role: 'Último Líder da União Soviética', bio: 'Promotor da Glasnost e Perestroika que permitiu a transição pacífica no Leste Europeu.' },
        { name: 'Ronald Reagan', role: 'Presidente dos EUA', bio: 'Líder americano cujo discurso em Berlim ("Mr. Gorbachev, tear down this wall!") simbolizou a pressão ocidental.' },
        { name: 'Helmut Kohl', role: 'Chanceler da Alemanha', bio: 'Arquiteto político da reunificação acelerada da Alemanha Ocidental e Oriental após a queda do muro.' }
      ],
      sources: [
        { id: 'src-gf-1', title: 'The Cold War: A New History', author: 'John Lewis Gaddis', year: 2005, type: 'book', details: 'Penguin Press, Cap. 6-8' },
        { id: 'src-gf-2', title: 'O Fim da História e o Último Homem', author: 'Francis Fukuyama', year: 1992, type: 'book', details: 'Free Press' }
      ]
    },
    {
      id: 'descolonizacao-africa-asia',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'Descolonização da África, Ásia e Fim do Apartheid (1947–1994 d.C.)',
      era: 'Segunda Metade do Século XX (1947–1994 d.C.)',
      evidenceLevel: 'high',
      summary: 'O desmantelamento dos impérios coloniais europeus na Ásia e África pós-Segunda Guerra. Destaque para a independência não-violenta da Índia sob Gandhi (1947) e a histórica queda do regime de segregação racial do Apartheid na África do Sul sob Nelson Mandela (1994).',
      fact: {
        title: 'A Não-Violência Ativa na Índia e a Vitória contra o Apartheid',
        description: 'Após décadas de domínio da Coroa Britânica, Mahatma Gandhi liderou a resistência civil não-violenta (Satyagraha) e a Marcha do Sal, culminando na independência da Índia em 1947. Na África do Sul, o regime de segregação racial do Apartheid (instituído em 1948) foi desmontado após intensas sanções internacionais e a liderança de Nelson Mandela, eleito presidente em 1994.'
      },
      interpretation: {
        title: 'O Enfraquecimento Imperial e a Conferência de Bandung (1955)',
        description: 'Historiadores da pós-colonialidade explicam que o esgotamento financeiro europeu após 1945 abriu espaço para o surgimento do "Terceiro Mundo" e do Movimento dos Não-Alinhados, articulado na Conferência de Bandung por líderes africanos e asiáticos.'
      },
      hypothesis: {
        title: 'A Tese do Neocolonialismo de Kwame Nkrumah',
        description: 'O líder ganes Kwame Nkrumah formulou a hipótese de que a independência política formal não libertou os países africanos, os quais permaneceram subordinados ao neocolonialismo econômico e às corporações do Norte Global.'
      },
      timeline: [
        { year: '1947', event: 'Independência da Índia e do Paquistão, encerrando o Raj Britânico no subcontinente.' },
        { year: '1955', event: 'Conferência de Bandung na Indonésia consagra o Movimento dos Países Não-Alinhados.' },
        { year: '1960', event: 'O "Ano da África": 17 nações africanas conquistam a independência formal.' },
        { year: '1990', event: 'Libertação de Nelson Mandela após 27 anos de prisão política na África do Sul.' },
        { year: '1994', event: 'Primeiras eleições multirraciais na África do Sul e posse de Nelson Mandela como Presidente.' }
      ],
      characters: [
        { name: 'Mahatma Gandhi', role: 'Líder da Independência da Índia', bio: 'Apostolo da não-violência e desobediência civil que inspirou movimentos de libertação no mundo todo.' },
        { name: 'Nelson Mandela', role: 'Presidente da África do Sul e Nobel da Paz', bio: 'Líder do Congresso Nacional Africano que venceu o Apartheid e unificou a nação sul-africana.' },
        { name: 'Kwame Nkrumah', role: 'Pai do Pan-Africanismo e Presidente de Gana', bio: 'Líder da primeira colônia da África Subsaariana a conquistar a independência (1957).' }
      ],
      sources: [
        { id: 'src-des-1', title: 'Autobiografia: A Minha Vida e as Minhas Experiências com a Verdade', author: 'Mahatma Gandhi', year: 1927, type: 'book', details: 'Tradução Crítica' },
        { id: 'src-des-2', title: 'Long Walk to Freedom: The Autobiography of Nelson Mandela', author: 'Nelson Mandela', year: 1994, type: 'book', details: 'Little, Brown and Company' }
      ]
    },
    {
      id: 'direitos-civis-eua-1960',
      category: 'História',
      period: 'Idade Contemporânea',
      title: 'O Movimento dos Direitos Civis nos Estados Unidos (Anos 1960)',
      era: 'Anos 1960 (1955–1968 d.C.)',
      evidenceLevel: 'high',
      summary: 'A mobilização popular massiva contra as leis de segregação racial Jim Crow no Sul americano. Liderada por Martin Luther King Jr., Rosa Parks e Malcolm X, alcançou a aprovação histórica da Lei dos Direitos Civis de 1964 e da Lei do Direito ao Voto de 1965.',
      fact: {
        title: 'De Montgomery à Marcha sobre Washington (1963)',
        description: 'Iniciado em 1955 com o boicote aos ônibus de Montgomery após a prisão de Rosa Parks, o movimento atingiu seu auge em 28 de agosto de 1963, quando 250.000 pessoas reuniram-se no Lincoln Memorial em Washington. Martin Luther King Jr. proferiu o histórico discurso "I Have a Dream", exigindo o fim da segregação racial e igualdade de oportunidades.'
      },
      interpretation: {
        title: 'Duas Correntes Estratégicas: Desobediência Não-Violenta vs. Autodefesa Negra',
        description: 'A historiografia política analisa as correntes complementares e concorrentes do movimento: a estratégia do pastor Martin Luther King Jr. centrada na não-violência e integração nacional, em contraste com a postura do Poder Negro (Black Power) e Malcolm X, que pregavam o orgulho negro, autodeterminação e autodefesa contra a violência policial.'
      },
      hypothesis: {
        title: 'A Vigilância do FBI e o Projeto COINTELPRO',
        description: 'Documentos oficiais desclassificados do governo americano comprovaram que o FBI sob J. Edgar Hoover manteve vigilância ilegal sistemática (Operação COINTELPRO) para espionar, chantagear e desestabilizar as lideranças dos Direitos Civis.'
      },
      timeline: [
        { year: '1955', event: 'Rosa Parks recusa ceder o assento no ônibus; início do Boicote dos Ônibus de Montgomery.' },
        { year: '1963', event: 'Marcha sobre Washington reúne 250.000 pessoas e King profere "I Have a Dream".' },
        { year: '1964', event: 'O Presidente Lyndon B. Johnson assina a Lei dos Direitos Civis (Civil Rights Act).' },
        { year: '1965', event: 'Marcha de Selma a Montgomery e aprovação da Lei do Direito ao Voto (Voting Rights Act).' },
        { year: '1968', event: 'Assassinato de Martin Luther King Jr. em Memphis, disparando comoção e comoção nacional.' }
      ],
      characters: [
        { name: 'Martin Luther King Jr.', role: 'Pastor e Líder dos Direitos Civis', bio: 'Prêmio Nobel da Paz que liderou a luta pela igualdade racial através da não-violência ativa.' },
        { name: 'Rosa Parks', role: 'Ativista dos Direitos Civis', bio: 'Costureira cujo ato corajoso de recusa em Montgomery tornou-se o estopim do movimento civil moderno.' },
        { name: 'Malcolm X (El-Hajj Malik El-Shabazz)', role: 'Líder e Orador Nacionalista Negro', bio: 'Defensor da autodeterminação, orgulho da identidade negra e crítico do racismo institucional.' }
      ],
      sources: [
        { id: 'src-civ-1', title: 'Carta da Prisão de Birmingham (Letter from Birmingham Jail)', author: 'Martin Luther King Jr.', year: 1963, type: 'document', details: 'Texto fundamental da filosofia de desobediência civil' },
        { id: 'src-civ-2', title: 'The Autobiography of Malcolm X', author: 'Malcolm X e Alex Haley', year: 1965, type: 'book', details: 'Grove Press' }
      ]
    }
  ];

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

  const allCards = useMemo(() => [...mockCards, ...customCards], [customCards]);

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
    const step = TIMELINE_STEPS[currentTimelineIndex];
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
      TIMELINE_STEPS.forEach((step, idx) => {
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
                      {TIMELINE_STEPS[currentTimelineIndex].era}
                    </span>
                  </div>
                </div>

                {/* Big Title of the Entered Era */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
                  <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                  <span className="text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">Investigação Histórica Ativa</span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-50 mt-1">
                    Dossiê: {TIMELINE_STEPS[currentTimelineIndex].title} ({TIMELINE_STEPS[currentTimelineIndex].label})
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm font-serif mt-2 leading-relaxed">
                    {TIMELINE_STEPS[currentTimelineIndex].description}
                  </p>
                </div>

                {/* ConceptCard or fallback */}
                {(() => {
                  const currentStep = TIMELINE_STEPS[currentTimelineIndex];
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
                    {TIMELINE_STEPS[currentTimelineIndex].meanwhile.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMeanwhileItem({
                          region: item.region,
                          event: item.event,
                          eraLabel: TIMELINE_STEPS[currentTimelineIndex].label
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-serif font-bold text-slate-900">Linha do Tempo Infinita</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">Deslize ou clique para viajar</span>
              </div>

              {/* Centered Selector Moving-Line Timeline Track */}
              <div className="relative py-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden select-none shadow-md">
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
                  dragConstraints={{ left: -((TIMELINE_STEPS.length - 1) * 150), right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -30 && currentTimelineIndex < TIMELINE_STEPS.length - 1) {
                      setCurrentTimelineIndex(prev => prev + 1);
                      setSelectedNodeDetailsId(null);
                    } else if (info.offset.x > 30 && currentTimelineIndex > 0) {
                      setCurrentTimelineIndex(prev => prev - 1);
                      setSelectedNodeDetailsId(null);
                    }
                  }}
                >
                  {/* Axis Line behind steps */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" style={{ width: `${TIMELINE_STEPS.length * 150}px` }} />
                  
                  {/* Progress fill up to current timeline index */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-amber-500/70 z-0 transition-all duration-300"
                    style={{ width: `${(currentTimelineIndex * 150) + 75}px` }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
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
              <div className="flex justify-between items-center gap-1.5 sm:gap-4 bg-slate-50/50 p-2 sm:p-2.5 rounded-xl border border-slate-200/50">
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
                  <span className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2 sm:px-2.5 py-1 rounded-full border border-amber-200/30 truncate block max-w-full" title={TIMELINE_STEPS[currentTimelineIndex].era}>
                    {TIMELINE_STEPS[currentTimelineIndex].era}
                  </span>
                </div>

                <button
                  disabled={currentTimelineIndex === TIMELINE_STEPS.length - 1}
                  onClick={() => {
                    if (currentTimelineIndex < TIMELINE_STEPS.length - 1) {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-mono font-extrabold tracking-tight text-slate-900">
                      {TIMELINE_STEPS[currentTimelineIndex].label}
                    </span>
                    <span className="text-lg font-serif font-bold text-slate-800">
                      • {TIMELINE_STEPS[currentTimelineIndex].title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-serif leading-relaxed">
                    {TIMELINE_STEPS[currentTimelineIndex].description}
                  </p>
                  
                  {onEnterEpoch && (
                    <button
                      id="enter-epoch-btn"
                      onClick={() => onEnterEpoch(TIMELINE_STEPS[currentTimelineIndex].year)}
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
                      src={TIMELINE_STEPS[currentTimelineIndex].mapUrl} 
                      alt="Mapa histórico conceitual" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-900/35 flex items-center justify-center p-2">
                      <span className="text-[10px] font-sans font-extrabold tracking-wider text-white uppercase text-center bg-slate-950/85 px-2 py-1 rounded border border-slate-700 shadow-sm">
                        {TIMELINE_STEPS[currentTimelineIndex].mapLabel}
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
                const step = TIMELINE_STEPS[currentTimelineIndex];
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
                                  const stepIdx = TIMELINE_STEPS.findIndex(s => s.id === matchingCard?.id || s.title.toLowerCase().includes(matchingCard?.title.toLowerCase() || ''));
                                  if (stepIdx !== -1) {
                                    setCurrentTimelineIndex(stepIdx);
                                    setViewingDossier(true);
                                  } else {
                                    setActiveTab('cards');
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
                {TIMELINE_STEPS[currentTimelineIndex].meanwhile.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMeanwhileItem({
                      region: item.region,
                      event: item.event,
                      eraLabel: TIMELINE_STEPS[currentTimelineIndex].label
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
                          const stepIdx = TIMELINE_STEPS.findIndex(step => step.id === card.id);
                          if (stepIdx !== -1) {
                            setCurrentTimelineIndex(stepIdx);
                          } else {
                            // Fallback to title match
                            const fallbackIdx = TIMELINE_STEPS.findIndex(step => 
                              step.title.toLowerCase().includes(card.title.toLowerCase()) || 
                              card.title.toLowerCase().includes(step.title.toLowerCase())
                            );
                            if (fallbackIdx !== -1) setCurrentTimelineIndex(fallbackIdx);
                          }
                          setViewingDossier(true);
                          setActiveTab('home');
                        }}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-xs transition-all cursor-pointer flex justify-between items-start"
                      >
                        <div>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[8px] uppercase font-mono tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {card.period}
                            </span>
                            <span className="text-[8px] uppercase font-mono tracking-widest bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100">
                              {card.evidenceLevel.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 mt-2 text-sm leading-snug">{card.title}</h4>
                          <p className="text-slate-500 text-xs font-serif mt-1 line-clamp-2">{card.summary}</p>
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
        />
      )}
    </div>
  );
}
