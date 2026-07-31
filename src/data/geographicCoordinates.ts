/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GeoPointType = 'capital' | 'batalha' | 'porto' | 'monumento' | 'evento';

export interface GeoPoint {
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: GeoPointType;
}

export interface GeoRoute {
  name: string;
  coordinates: [number, number][];
}

export interface TopicGeoData {
  title: string;
  regionName: string;
  center: [number, number];
  zoom: number;
  description: string;
  points: GeoPoint[];
  routes: GeoRoute[];
}

const GEO_MAP_REGISTRY: Record<string, TopicGeoData> = {
  'sumeria': {
    title: 'Crescente Fértil & Vale do Nilo',
    regionName: 'Mesopotâmia e Egito Antigo',
    center: [32.5, 44.5],
    zoom: 5,
    description: 'Os vales dos rios Tigre, Eufrates e Nilo serviram de berço para as primeiras grandes aglomerações e impérios unificados da Antiguidade Oriental.',
    points: [
      { name: 'Uruk', lat: 31.35, lng: 45.42, description: 'Uma das primeiras cidades-estado da Mesopotâmia, centro do templo de Eanna.', type: 'capital' },
      { name: 'Ur', lat: 30.96, lng: 46.10, description: 'Cidade-estado suméria, lar do Zigurate de Ur.', type: 'capital' },
      { name: 'Nipur', lat: 32.12, lng: 45.23, description: 'Centro religioso da Suméria, sede do deus Enlil.', type: 'monumento' },
      { name: 'Tinis', lat: 26.00, lng: 32.00, description: 'Capital do primeiro Egito unificado.', type: 'capital' },
      { name: 'Mênfis', lat: 29.85, lng: 31.25, description: 'Primeira capital do Egito faraônico unificado.', type: 'capital' },
    ],
    routes: [
      { name: 'Rotas fluviais do Tigre-Eufrates', coordinates: [[31.35, 45.42], [30.96, 46.10], [32.12, 45.23]] },
      { name: 'Comércio de cobre do Sinai', coordinates: [[29.85, 31.25], [28.5, 33.8]] },
    ],
  },
  'hamurabi': {
    title: 'Império Paleobabilônico',
    regionName: 'Mesopotâmia Central',
    center: [32.5, 44.4],
    zoom: 5,
    description: 'A unificação da Babilônia sob Hamurabi estabeleceu o centro normativo e legislativo do Oriente Próximo antigo.',
    points: [
      { name: 'Babilônia', lat: 32.54, lng: 44.42, description: 'Capital do império de Hamurabi, sede do famoso Código.', type: 'capital' },
      { name: 'Susa', lat: 32.19, lng: 48.26, description: 'Cidade elamita, posteriormente incorporada ao império.', type: 'capital' },
      { name: 'Larsa', lat: 31.14, lng: 45.85, description: 'Cidade-estado conquistada por Hamurabi.', type: 'evento' },
      { name: 'Eshnunna', lat: 33.20, lng: 44.70, description: 'Centro comercial do rio Diyala.', type: 'evento' },
    ],
    routes: [
      { name: 'Estradas reais de mensageiros', coordinates: [[32.54, 44.42], [32.19, 48.26]] },
      { name: 'Canais de irrigação do Eufrates', coordinates: [[32.54, 44.42], [31.14, 45.85]] },
    ],
  },
  'guerras-medicas': {
    title: 'Grécia Clássica vs Império Persa',
    regionName: 'Mar Egeu e Ásia Menor',
    center: [38.0, 23.5],
    zoom: 5,
    description: 'O confronto épico entre a aliança de cidades-estado gregas e o vasto Império Persa de Dário I e Xerxes I.',
    points: [
      { name: 'Atenas', lat: 37.97, lng: 23.73, description: 'Coração da democracia ateniense e líder da aliança grega.', type: 'capital' },
      { name: 'Esparta', lat: 37.08, lng: 22.42, description: 'Potência militar terrestre da Grécia.', type: 'capital' },
      { name: 'Maratona', lat: 38.12, lng: 23.97, description: 'Local da famosa batalha de 490 a.C.', type: 'batalha' },
      { name: 'Termópilas', lat: 38.80, lng: 22.54, description: 'Desfiladeiro onde 300 espartanos resistiram a Xerxes.', type: 'batalha' },
      { name: 'Salamina', lat: 37.96, lng: 23.50, description: 'Ilha palco da batalha naval decisiva de 480 a.C.', type: 'batalha' },
      { name: 'Persépolis', lat: 29.94, lng: 52.89, description: 'Capital cerimonial do Império Persa Aquemênida.', type: 'capital' },
    ],
    routes: [
      { name: 'Caminho Real Persa (Susa-Sardes)', coordinates: [[32.19, 48.26], [38.50, 28.05]] },
      { name: 'Rotas navais do Mar Egeu', coordinates: [[37.97, 23.73], [37.96, 23.50], [38.12, 23.97]] },
    ],
  },
  'guerras-punicas': {
    title: 'Roma vs Cartago pelo Mediterrâneo',
    regionName: 'Mediterrâneo Ocidental',
    center: [38.0, 12.0],
    zoom: 4,
    description: 'As três guerras Púnicas que destruíram Cartago e transformaram Roma na senhora soberana do Mare Nostrum.',
    points: [
      { name: 'Roma', lat: 41.90, lng: 12.50, description: 'República em expansão no Mediterrâneo.', type: 'capital' },
      { name: 'Cartago', lat: 36.85, lng: 10.32, description: 'Potência comercial fenícia no Norte da África.', type: 'capital' },
      { name: 'Cannas', lat: 41.31, lng: 15.93, description: 'Maior derrota de Roma, vitória de Aníbal em 216 a.C.', type: 'batalha' },
      { name: 'Zama', lat: 35.90, lng: 9.34, description: 'Batalha final onde Cipião derrotou Aníbal.', type: 'batalha' },
      { name: 'Sagunto', lat: 39.68, lng: -0.27, description: 'Cidade aliada de Roma, casus belli da Segunda Guerra Púnica.', type: 'evento' },
    ],
    routes: [
      { name: 'Marcha Transalpina de Aníbal', coordinates: [[36.85, 10.32], [39.68, -0.27], [43.60, 7.00], [45.76, 4.84], [41.31, 15.93]] },
      { name: 'Rotas de suprimento naval romano', coordinates: [[41.90, 12.50], [38.12, 15.55], [36.85, 10.32]] },
    ],
  },
  'grecia-classica': {
    title: 'Hélade Clássica e Cidades-Estado',
    regionName: 'Mar Egeu',
    center: [37.5, 23.0],
    zoom: 5,
    description: 'A bacia do Mar Egeu conectava centenas de cidades-estado independentes (póleis) que compartilhavam o mesmo universo cultural e religioso.',
    points: [
      { name: 'Atenas', lat: 37.97, lng: 23.73, description: 'Berço da democracia e da filosofia ocidental.', type: 'capital' },
      { name: 'Esparta', lat: 37.08, lng: 22.42, description: 'Sociedade militar e austera do Peloponeso.', type: 'capital' },
      { name: 'Tebas', lat: 38.32, lng: 23.32, description: 'Potência hegemônica da Beócia.', type: 'capital' },
      { name: 'Mileto', lat: 37.53, lng: 27.27, description: 'Centro comercial e filosófico da Jônia.', type: 'porto' },
      { name: 'Siracusa', lat: 37.08, lng: 15.29, description: 'Maior colônia grega na Sicília.', type: 'capital' },
    ],
    routes: [
      { name: 'Importação de grãos do Mar Negro', coordinates: [[37.97, 23.73], [41.01, 29.05]] },
      { name: 'Metais preciosos de Láurion', coordinates: [[37.97, 23.73], [37.72, 24.03]] },
    ],
  },
  'alexandria': {
    title: 'Mundo Helenístico',
    regionName: 'Mediterrâneo Oriental',
    center: [31.2, 29.9],
    zoom: 5,
    description: 'O Império Ptolomaico converteu Alexandria no maior porto cultural e científico do mundo antigo.',
    points: [
      { name: 'Alexandria', lat: 31.20, lng: 29.92, description: 'Sede da famosa Biblioteca e do Farol.', type: 'capital' },
      { name: 'Pérgamo', lat: 39.13, lng: 26.56, description: 'Centro cultural e produtor de pergaminho.', type: 'capital' },
      { name: 'Antioquia', lat: 36.20, lng: 36.16, description: 'Cruzada comercial do Levante.', type: 'capital' },
      { name: 'Rodes', lat: 36.43, lng: 28.22, description: 'Ilha comercial, sede do Colosso.', type: 'porto' },
    ],
    routes: [
      { name: 'Rota marítima do Nilo', coordinates: [[31.20, 29.92], [24.09, 32.90]] },
      { name: 'Caravanas de papiro e especiarias', coordinates: [[31.20, 29.92], [36.20, 36.16], [39.13, 26.56]] },
    ],
  },
  'roma-republica': {
    title: 'Expansão do Império Romano',
    regionName: 'Mediterrâneo (Mare Nostrum)',
    center: [38.0, 15.0],
    zoom: 4,
    description: 'Com a anexação total do Mediterrâneo, as estradas de paralelepípedos e as frotas de galés unificaram o comércio e a força militar de três continentes.',
    points: [
      { name: 'Roma', lat: 41.90, lng: 12.50, description: 'Centro político e militar do Império.', type: 'capital' },
      { name: 'Cartago', lat: 36.85, lng: 10.32, description: 'Província romana após a destruição em 146 a.C.', type: 'capital' },
      { name: 'Alexandria', lat: 31.20, lng: 29.92, description: 'Fornecedora de grãos para Roma.', type: 'capital' },
      { name: 'Antioquia', lat: 36.20, lng: 36.16, description: 'Maior cidade do Oriente romano.', type: 'capital' },
    ],
    routes: [
      { name: 'Via Ápia (Roma-Cápua-Tarento-Brundísio)', coordinates: [[41.90, 12.50], [41.08, 14.33], [40.47, 17.23], [40.64, 18.30]] },
      { name: 'Rotas de grãos de Alexandria', coordinates: [[31.20, 29.92], [37.47, 15.07], [41.90, 12.50]] },
    ],
  },
  'queda-roma': {
    title: 'Fragmentação da Europa',
    regionName: 'Europa e Mediterrâneo',
    center: [42.0, 15.0],
    zoom: 4,
    description: 'Após a deposição de Rômulo Augusto, o controle ocidental fragmentou-se em feudos e monarquias germânicas independentes.',
    points: [
      { name: 'Ravena', lat: 44.42, lng: 12.20, description: 'Última capital do Império Romano do Ocidente.', type: 'capital' },
      { name: 'Constantinopla', lat: 41.01, lng: 28.98, description: 'Centro do Império Bizantino sobrevivente.', type: 'capital' },
      { name: 'Roma', lat: 41.90, lng: 12.50, description: 'Sede papal e cidade em declínio urbano.', type: 'capital' },
      { name: 'Cartago', lat: 36.85, lng: 10.32, description: 'Conquistada pelos vândalos em 439 d.C.', type: 'evento' },
    ],
    routes: [
      { name: 'Estradas comerciais terrestres bizantinas', coordinates: [[41.01, 28.98], [44.42, 12.20], [41.90, 12.50]] },
    ],
  },
  'cruzadas': {
    title: 'A Terra Santa e as Cruzadas',
    regionName: 'Mediterrâneo e Levante',
    center: [36.0, 28.0],
    zoom: 4,
    description: 'A mobilização da cristandade europeia rumo ao Levante e os choques contra o mundo islâmico.',
    points: [
      { name: 'Jerusalém', lat: 31.78, lng: 35.22, description: 'Cidade Santa, objetivo principal das Cruzadas.', type: 'monumento' },
      { name: 'Constantinopla', lat: 41.01, lng: 28.98, description: 'Ponto de passagem das Cruzadas.', type: 'capital' },
      { name: 'Antioquia', lat: 36.20, lng: 36.16, description: 'Primeira grande conquista cruzada (1098).', type: 'evento' },
      { name: 'Acre', lat: 32.93, lng: 35.08, description: 'Principal porto cruzado no Levante.', type: 'porto' },
    ],
    routes: [
      { name: 'Rotas marítimas genovesas e venezianas', coordinates: [[44.41, 8.93], [45.44, 12.32], [41.01, 28.98], [32.93, 35.08]] },
      { name: 'Caminho terrestre dos Peregrinos', coordinates: [[41.01, 28.98], [36.20, 36.16], [31.78, 35.22]] },
    ],
  },
  'guerra-cem-anos': {
    title: 'França vs Inglaterra',
    regionName: 'Europa Ocidental',
    center: [47.5, 2.0],
    zoom: 5,
    description: 'O longo conflito pela sucessão da coroa francesa, transformando exércitos e armas medievais.',
    points: [
      { name: 'Paris', lat: 48.86, lng: 2.35, description: 'Coração do reino da França.', type: 'capital' },
      { name: 'Londres', lat: 51.51, lng: -0.13, description: 'Capital do reino da Inglaterra.', type: 'capital' },
      { name: 'Orléans', lat: 47.90, lng: 1.90, description: 'Cidade libertada por Joana d\'Arc em 1429.', type: 'batalha' },
      { name: 'Crécy', lat: 50.26, lng: 1.90, description: 'Batalha de 1346, vitória inglesa.', type: 'batalha' },
      { name: 'Azincourt', lat: 50.46, lng: 2.14, description: 'Batalha de 1415, massacre da cavalaria francesa.', type: 'batalha' },
    ],
    routes: [
      { name: 'Eixo do Canal da Mancha', coordinates: [[51.51, -0.13], [50.26, 1.90], [48.86, 2.35]] },
      { name: 'Caminhos militares de Flandres', coordinates: [[51.51, -0.13], [50.85, 4.35], [50.46, 2.14]] },
    ],
  },
  'guerras-napoleonicas': {
    title: 'Império Napoleônico',
    regionName: 'Europa',
    center: [48.0, 10.0],
    zoom: 4,
    description: 'A expansão militar de Napoleão Bonaparte, o Bloqueio Continental e a fuga da Corte Portuguesa para o Brasil.',
    points: [
      { name: 'Paris', lat: 48.86, lng: 2.35, description: 'Centro do Império Francês.', type: 'capital' },
      { name: 'Austerlitz', lat: 49.13, lng: 16.77, description: 'Batalha dos Três Imperadores (1805).', type: 'batalha' },
      { name: 'Moscou', lat: 55.75, lng: 37.62, description: 'Destino da desastrosa campanha de 1812.', type: 'evento' },
      { name: 'Waterloo', lat: 50.68, lng: 4.41, description: 'Derrota final de Napoleão (1815).', type: 'batalha' },
      { name: 'Lisboa', lat: 38.72, lng: -9.14, description: 'Ponto de partida da Corte para o Brasil.', type: 'porto' },
    ],
    routes: [
      { name: 'Rota da Transmigração da Família Real', coordinates: [[38.72, -9.14], [-1.75, -38.95], [-22.91, -43.17]] },
      { name: 'Marcha para Moscou', coordinates: [[48.86, 2.35], [52.52, 13.40], [55.75, 37.62]] },
    ],
  },
  'guerra-do-paraguai': {
    title: 'Bacia do Rio da Prata',
    regionName: 'América do Sul',
    center: [-22.0, -58.0],
    zoom: 4,
    description: 'O maior conflito militar da América do Sul entre o Paraguai e a Tríplice Aliança.',
    points: [
      { name: 'Assunção', lat: -25.26, lng: -57.58, description: 'Capital do Paraguai, sitiada em 1869.', type: 'capital' },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Base logística da Marinha Imperial.', type: 'capital' },
      { name: 'Humaitá', lat: -27.05, lng: -58.11, description: 'Fortaleza paraguaia, "Quebracho" do rio.', type: 'batalha' },
      { name: 'Tuiuti', lat: -24.77, lng: -57.35, description: 'Maior batalha da América do Sul (1866).', type: 'batalha' },
      { name: 'Cerro Corá', lat: -22.15, lng: -56.05, description: 'Onde Solano López morreu em 1870.', type: 'batalha' },
    ],
    routes: [
      { name: 'Hidrovia dos Rios Paraná e Paraguai', coordinates: [[-22.91, -43.17], [-25.26, -57.58], [-27.05, -58.11], [-24.77, -57.35]] },
    ],
  },
  'guerra-canudos': {
    title: 'Sertão Baiano - Canudos',
    regionName: 'Bahia, Brasil',
    center: [-9.9, -39.1],
    zoom: 7,
    description: 'O levante messiânico dos sertanejos fiéis a Antônio Conselheiro e a brutal campanha militar de destruição.',
    points: [
      { name: 'Canudos (Belo Monte)', lat: -9.90, lng: -39.15, description: 'Arraial de Belo Monte, destruído em 1897.', type: 'batalha' },
      { name: 'Juazeiro', lat: -9.41, lng: -40.50, description: 'Base de suprimentos do Exército.', type: 'porto' },
      { name: 'Salvador', lat: -12.97, lng: -38.48, description: 'Capital da Bahia, comando militar.', type: 'capital' },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Sede do governo republicano.', type: 'capital' },
    ],
    routes: [
      { name: 'Trilhas da caatinga sertaneja', coordinates: [[-12.97, -38.48], [-9.41, -40.50], [-9.90, -39.15]] },
    ],
  },
  'feb-segunda-guerra': {
    title: 'Frente Italiana e a FEB',
    regionName: 'Itália',
    center: [44.5, 10.5],
    zoom: 6,
    description: 'A bravura dos pracinhas brasileiros na tomada das posições alemãs na Linha Gótica em solo italiano.',
    points: [
      { name: 'Monte Castello', lat: 44.27, lng: 10.62, description: 'Posição fortificada tomada pela FEB em fev/1945.', type: 'batalha' },
      { name: 'Castelnuovo', lat: 44.35, lng: 10.40, description: 'Cidade liberada pela FEB em mar/1945.', type: 'batalha' },
      { name: 'Pisa', lat: 43.72, lng: 10.40, description: 'Ponto de apoio logístico aliado.', type: 'porto' },
      { name: 'Fornovo di Taro', lat: 44.68, lng: 10.05, description: 'Rendição final das forças alemãs à FEB.', type: 'evento' },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Porto de embarque das tropas.', type: 'capital' },
    ],
    routes: [
      { name: 'Rota marítima Rio-Nápoles', coordinates: [[-22.91, -43.17], [40.85, 14.25]] },
      { name: 'Avanço da FEB na Linha Gótica', coordinates: [[44.27, 10.62], [44.35, 10.40], [44.68, 10.05]] },
    ],
  },
  'islamismo': {
    title: 'Expansão Islâmica',
    regionName: 'Arábia e Oriente Médio',
    center: [25.0, 40.0],
    zoom: 4,
    description: 'A expansão islâmica a partir da Hégira unificou o comércio do Atlântico à Índia e preservou a ciência clássica.',
    points: [
      { name: 'Meca', lat: 21.39, lng: 39.86, description: 'Cidade sagrada do Islã.', type: 'monumento' },
      { name: 'Medina', lat: 24.47, lng: 39.61, description: 'Destino da Hégira em 622 d.C.', type: 'capital' },
      { name: 'Damasco', lat: 33.51, lng: 36.29, description: 'Sede do Califado Omeia.', type: 'capital' },
      { name: 'Bagdá', lat: 33.31, lng: 44.36, description: 'Centro do Califado Abássida e da Casa da Sabedoria.', type: 'capital' },
      { name: 'Córdoba', lat: 37.89, lng: -4.78, description: 'Capital do Al-Andalus omíada.', type: 'capital' },
    ],
    routes: [
      { name: 'Caravanas do Incenso', coordinates: [[21.39, 39.86], [24.47, 39.61], [33.51, 36.29]] },
      { name: 'Rota marítima do Oceano Índico', coordinates: [[33.51, 36.29], [12.79, 45.04], [22.27, 114.17]] },
    ],
  },
  'constantinopla': {
    title: 'Queda de Constantinopla',
    regionName: 'Bósforo e Anatólia',
    center: [41.0, 29.0],
    zoom: 6,
    description: 'A queda do Bósforo sob Mehmed II encerrou o Império Romano do Oriente e precipitou as navegações atlânticas.',
    points: [
      { name: 'Constantinopla', lat: 41.01, lng: 28.98, description: 'Capital bizantina, sitiada e conquistada em 1453.', type: 'capital' },
      { name: 'Edirne', lat: 41.68, lng: 26.56, description: 'Base otomana durante o cerco.', type: 'capital' },
      { name: 'Mistra', lat: 37.07, lng: 22.37, description: 'Último reduto bizantino no Peloponeso.', type: 'monumento' },
    ],
    routes: [
      { name: 'Rota da Seda (ramo anatólio)', coordinates: [[40.15, 29.02], [41.01, 28.98], [41.68, 26.56]] },
    ],
  },
  'tordesilhas': {
    title: 'Tratado de Tordesilhas',
    regionName: 'Atlântico e Américas',
    center: [0.0, -30.0],
    zoom: 3,
    description: 'O Tratado de Tordesilhas dividiu o planeta em hemisférios ibéricos de controle marítimo.',
    points: [
      { name: 'Lisboa', lat: 38.72, lng: -9.14, description: 'Centro do império marítimo português.', type: 'capital' },
      { name: 'Sevilha', lat: 37.39, lng: -5.99, description: 'Centro do comércio espanhol das Américas.', type: 'capital' },
      { name: 'Salvador', lat: -12.97, lng: -38.48, description: 'Primeira capital do Brasil.', type: 'capital' },
      { name: 'Cusco', lat: -13.53, lng: -71.97, description: 'Capital do Império Inca.', type: 'monumento' },
    ],
    routes: [
      { name: 'Rota das Naus da Índia', coordinates: [[38.72, -9.14], [14.69, -17.44], [-1.75, -38.95], [12.79, 45.04]] },
      { name: 'Eixo comercial Sevilha-Antilhas', coordinates: [[37.39, -5.99], [18.47, -69.89], [19.43, -99.13]] },
    ],
  },
  'revolucao-francesa': {
    title: 'Europa Revolucionária',
    regionName: 'Europa',
    center: [48.0, 5.0],
    zoom: 4,
    description: 'O colapso da Bastilha na França gerou uma onda de choque que redefiniu as fronteiras e estruturas absolutistas da Europa.',
    points: [
      { name: 'Paris', lat: 48.86, lng: 2.35, description: 'Centro da Revolução Francesa.', type: 'capital' },
      { name: 'Bastilha', lat: 48.85, lng: 2.37, description: 'Prisão stormed em 14 de julho de 1789.', type: 'evento' },
      { name: 'Londres', lat: 51.51, lng: -0.13, description: 'Centro de debates iluministas.', type: 'capital' },
      { name: 'Viena', lat: 48.21, lng: 16.37, description: 'Sede do Congresso da Restauração.', type: 'capital' },
    ],
    routes: [
      { name: 'Eixos de correio diplomático e jornais', coordinates: [[48.86, 2.35], [51.51, -0.13], [48.21, 16.37]] },
    ],
  },
  'segunda-guerra-holocausto': {
    title: 'Teatro Global da Segunda Guerra',
    regionName: 'Europa e Pacífico',
    center: [50.0, 15.0],
    zoom: 4,
    description: 'O maior conflito militar da história humana, marcado pela derrota do nazifascismo e a tragédia do Holocausto.',
    points: [
      { name: 'Berlim', lat: 52.52, lng: 13.40, description: 'Capital do Terceiro Reich.', type: 'capital' },
      { name: 'Auschwitz', lat: 50.04, lng: 19.20, description: 'Maior campo de extermínio nazista.', type: 'monumento' },
      { name: 'Stalingrado', lat: 48.71, lng: 44.51, description: 'Batalha decisiva no front oriental.', type: 'batalha' },
      { name: 'Normandia', lat: 49.18, lng: -0.37, description: 'Desembarque do Dia D (6 jun 1944).', type: 'batalha' },
      { name: 'Tóquio', lat: 35.68, lng: 139.69, description: 'Capital do Império do Japão.', type: 'capital' },
    ],
    routes: [
      { name: 'Eixos de suprimentos Aliados', coordinates: [[51.51, -0.13], [49.18, -0.37], [52.52, 13.40]] },
      { name: 'Comboios do Atlântico Norte', coordinates: [[64.15, -21.94], [55.75, 37.62]] },
    ],
  },
  'pouso-lua': {
    title: 'Corrida Espacial e Guerra Fria',
    regionName: 'Global',
    center: [40.0, -30.0],
    zoom: 3,
    description: 'A corrida espacial como expressão da rivalidade bipolar entre EUA e URSS.',
    points: [
      { name: 'Washington D.C.', lat: 38.90, lng: -77.04, description: 'Capital dos Estados Unidos.', type: 'capital' },
      { name: 'Moscou', lat: 55.75, lng: 37.62, description: 'Capital da União Soviética.', type: 'capital' },
      { name: 'Cabo Canaveral', lat: 28.39, lng: -80.61, description: 'Base de lançamento da Apollo 11.', type: 'evento' },
      { name: 'Baikonur', lat: 45.96, lng: 63.31, description: 'Cosmódromo soviético.', type: 'evento' },
    ],
    routes: [],
  },
  'guerra-fria-conflitos': {
    title: 'Conflitos da Guerra Fria',
    regionName: 'Global',
    center: [30.0, 10.0],
    zoom: 2,
    description: 'As guerras por procuração e os pontos de tensão entre as superpotências durante a Guerra Fria.',
    points: [
      { name: 'Washington D.C.', lat: 38.90, lng: -77.04, description: 'Capital dos EUA.', type: 'capital' },
      { name: 'Moscou', lat: 55.75, lng: 37.62, description: 'Capital da URSS.', type: 'capital' },
      { name: 'Havana', lat: 23.11, lng: -82.37, description: 'Centro da Crise dos Mísseis (1962).', type: 'evento' },
      { name: 'Seul', lat: 37.57, lng: 126.98, description: 'Frente da Guerra da Coreia.', type: 'capital' },
      { name: 'Hanói', lat: 21.03, lng: 105.85, description: 'Frente da Guerra do Vietnã.', type: 'capital' },
      { name: 'Berlim', lat: 52.52, lng: 13.40, description: 'Cidade dividida pelo Muro (1961-1989).', type: 'monumento' },
    ],
    routes: [
      { name: 'Linhas de suprimento da OTAN', coordinates: [[38.90, -77.04], [50.85, 4.35], [52.52, 13.40]] },
    ],
  },
  'guerra-civil-espanhola': {
    title: 'Espanha Dividida',
    regionName: 'Espanha',
    center: [40.0, -3.5],
    zoom: 6,
    description: 'O confronto trágico entre Republicanos e as forças franquistas apoiadas pelas potências fascistas.',
    points: [
      { name: 'Madri', lat: 40.42, lng: -3.70, description: 'Capital sitiada pelos franquistas.', type: 'capital' },
      { name: 'Barcelona', lat: 41.39, lng: 2.17, description: 'Reduto republicano e anarquista.', type: 'capital' },
      { name: 'Guernica', lat: 43.31, lng: -2.68, description: 'Cidade bombardeada pela Legião Condor (1937).', type: 'batalha' },
      { name: 'Sevilha', lat: 37.39, lng: -5.99, description: 'Base inicial do levante militar.', type: 'capital' },
    ],
    routes: [],
  },
  'brasil-colonial': {
    title: 'América Portuguesa',
    regionName: 'Costa brasileira',
    center: [-13.0, -39.0],
    zoom: 5,
    description: 'A costa brasileira tornou-se o centro produtor de açúcar da Coroa portuguesa com trabalho escravizado.',
    points: [
      { name: 'Salvador', lat: -12.97, lng: -38.48, description: 'Capital do Brasil colonial.', type: 'capital' },
      { name: 'Olinda', lat: -8.01, lng: -34.86, description: 'Centro açucareiro de Pernambuco.', type: 'capital' },
      { name: 'Porto Seguro', lat: -16.45, lng: -39.07, description: 'Local do primeiro desembarque português.', type: 'porto' },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Porto estratégico do Atlântico Sul.', type: 'capital' },
    ],
    routes: [
      { name: 'Rota Triangular Transatlântica', coordinates: [[38.72, -9.14], [14.69, -17.44], [-12.97, -38.48], [38.72, -9.14]] },
    ],
  },
  'reforma-protestante': {
    title: 'Europa da Reforma',
    regionName: 'Europa Central',
    center: [51.0, 10.0],
    zoom: 5,
    description: 'As 95 Teses de Lutero quebraram a hegemonia católica e deram origem a novas denominações cristãs.',
    points: [
      { name: 'Wittenberg', lat: 51.87, lng: 12.65, description: 'Onde Lutero afixou as 95 Teses em 1517.', type: 'monumento' },
      { name: 'Genebra', lat: 46.20, lng: 6.14, description: 'Centro da Reforma calvinista.', type: 'capital' },
      { name: 'Zurique', lat: 47.37, lng: 8.54, description: 'Centro da Reforma zuingliana.', type: 'capital' },
      { name: 'Roma', lat: 41.90, lng: 12.50, description: 'Sede do papado católico.', type: 'capital' },
    ],
    routes: [],
  },
  'revolucao-industrial': {
    title: 'Revolução Industrial Britânica',
    regionName: 'Grã-Bretanha',
    center: [53.0, -2.0],
    zoom: 6,
    description: 'A mecanização a vapor e o tear mecânico transformaram as relações de trabalho e o capitalismo global.',
    points: [
      { name: 'Manchester', lat: 53.48, lng: -2.24, description: 'Capital mundial do algodão industrial.', type: 'capital' },
      { name: 'Birmingham', lat: 52.49, lng: -1.89, description: 'Centro metalúrgico e de máquinas a vapor.', type: 'capital' },
      { name: 'Londres', lat: 51.51, lng: -0.13, description: 'Maior porto comercial do mundo.', type: 'capital' },
      { name: 'Liverpool', lat: 53.41, lng: -2.99, description: 'Porto de exportação industrial.', type: 'porto' },
    ],
    routes: [
      { name: 'Primeiras ferrovias de locomotivas', coordinates: [[53.48, -2.24], [53.41, -2.99], [51.51, -0.13]] },
    ],
  },
  'brasil-imperio': {
    title: 'Império do Brasil',
    regionName: 'Brasil',
    center: [-15.0, -50.0],
    zoom: 4,
    description: 'O processo de Independência e o Reinado de D. Pedro II consolidaram a unidade territorial brasileira.',
    points: [
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Corte e capital imperial.', type: 'capital' },
      { name: 'São Paulo', lat: -23.55, lng: -46.63, description: 'Crescente centro cafeeiro.', type: 'capital' },
      { name: 'Recife', lat: -8.05, lng: -34.90, description: 'Centro comercial do Nordeste.', type: 'capital' },
      { name: 'Salvador', lat: -12.97, lng: -38.48, description: 'Antiga capital, centro açucareiro.', type: 'capital' },
    ],
    routes: [
      { name: 'Ferrovias do Café (Vale do Paraíba)', coordinates: [[-22.91, -43.17], [-22.25, -45.07], [-23.55, -46.63]] },
    ],
  },
  'era-vargas': {
    title: 'Brasil na Era Vargas',
    regionName: 'Brasil',
    center: [-20.0, -45.0],
    zoom: 4,
    description: 'A Revolução de 1930 e o Estado Novo criaram a legislação trabalhista (CLT) e a indústria de base no Brasil.',
    points: [
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Centro político do governo Vargas.', type: 'capital' },
      { name: 'São Paulo', lat: -23.55, lng: -46.63, description: 'Cenário da Revolução Constitucionalista de 1932.', type: 'batalha' },
      { name: 'Volta Redonda', lat: -22.52, lng: -44.10, description: 'Sede da CSN, primeira siderúrgica estatal.', type: 'monumento' },
      { name: 'Porto Alegre', lat: -30.03, lng: -51.23, description: 'Origem dos tenentes revolucionários.', type: 'capital' },
    ],
    routes: [],
  },
  'ditadura-militar-brasil': {
    title: 'Brasil sob Regime Militar',
    regionName: 'Brasil',
    center: [-15.0, -50.0],
    zoom: 4,
    description: 'Vinte e um anos de regime de exceção militar seguidos pela campanha das Diretas Já e a Constituição de 1988.',
    points: [
      { name: 'Brasília', lat: -15.79, lng: -47.88, description: 'Capital federal, sede do regime.', type: 'capital' },
      { name: 'São Paulo', lat: -23.55, lng: -46.63, description: 'Centro da resistência estudantil e operária.', type: 'capital' },
      { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, description: 'Palco de protestos e censura.', type: 'capital' },
      { name: 'Araguaia', lat: -8.50, lng: -48.50, description: 'Zona de guerrilha e repressão militar.', type: 'batalha' },
    ],
    routes: [
      { name: 'Rodovia Transamazônica', coordinates: [[-3.79, -52.48], [-8.50, -48.50], [-15.79, -47.88]] },
    ],
  },
  'rei-artur': {
    title: 'Bretanha Pós-Romana',
    regionName: 'Britânia',
    center: [51.0, -4.0],
    zoom: 6,
    description: 'A resistência dos britões romano-célticos contra os invasores anglo-saxões moldou as lendas heroicas da Távola Redonda.',
    points: [
      { name: 'Tintagel', lat: 50.67, lng: -4.76, description: 'Castelo lendário de nascimento de Artur.', type: 'monumento' },
      { name: 'Badon', lat: 51.50, lng: -2.50, description: 'Local da mítica Batalha do Monte Badon.', type: 'batalha' },
      { name: 'Glastonbury', lat: 51.15, lng: -2.72, description: 'Abadia associada às lendas arturianas.', type: 'monumento' },
    ],
    routes: [],
  },
  'primeira-guerra-russa': {
    title: 'Grande Guerra e Revolução Russa',
    regionName: 'Europa e Rússia',
    center: [52.0, 30.0],
    zoom: 4,
    description: 'As trincheiras da Grande Guerra e a Queda do Czarismo implantaram o primeiro Estado socialista do mundo.',
    points: [
      { name: 'Petrogrado', lat: 59.94, lng: 30.34, description: 'Cenário da Revolução de Outubro de 1917.', type: 'capital' },
      { name: 'Berlim', lat: 52.52, lng: 13.40, description: 'Capital do Império Alemão.', type: 'capital' },
      { name: 'Paris', lat: 48.86, lng: 2.35, description: 'Centro da Entente.', type: 'capital' },
      { name: 'Moscou', lat: 55.75, lng: 37.62, description: 'Nova capital soviética após 1918.', type: 'capital' },
    ],
    routes: [
      { name: 'Ferrovia Transiberiana', coordinates: [[55.75, 37.62], [56.01, 92.85]] },
    ],
  },
  'rota-da-seda-imperio-mongol': {
    title: 'Rota da Seda e Império Mongol',
    regionName: 'Ásia Central e Oriental',
    center: [40.0, 70.0],
    zoom: 3,
    description: 'A teia de rotas caravaneiras conectando a Ásia Oriental ao Mediterrâneo, unificada sob a Pax Mongolica de Gengis Khan e Kublai Khan.',
    points: [
      { name: 'Karakorum', lat: 47.19, lng: 102.82, description: 'Capital do Império Mongol de Gengis Khan.', type: 'capital' },
      { name: 'Samarcanda', lat: 39.65, lng: 66.97, description: 'Cruzada comercial da Rota da Seda na Ásia Central.', type: 'capital' },
      { name: 'Bagdá', lat: 33.31, lng: 44.36, description: 'Centro do Califado Abássida, saqueado pelos mongóis em 1258.', type: 'capital' },
      { name: 'Pequim', lat: 39.90, lng: 116.40, description: 'Capital da dinastia Yuan sob Kublai Khan.', type: 'capital' },
      { name: 'Cafa', lat: 45.03, lng: 35.38, description: 'Porto genovês no Mar Negro, epicentro da Peste Negra.', type: 'porto' },
    ],
    routes: [
      { name: 'Rota da Seda do Norte', coordinates: [[39.90, 116.40], [47.19, 102.82], [39.65, 66.97], [33.31, 44.36]] },
      { name: 'Rota da Seda Marítima', coordinates: [[39.90, 116.40], [22.27, 114.17], [12.79, 45.04]] },
    ],
  },
  'restauracao-meiji-japao': {
    title: 'Restauração Meiji no Japão',
    regionName: 'Japão',
    center: [35.5, 137.5],
    zoom: 5,
    description: 'A transição do isolamento feudal do Xogunato Tokugawa (Bakumatsu) para um império moderno industrializado.',
    points: [
      { name: 'Tóquio (Edo)', lat: 35.68, lng: 139.69, description: 'Sede do Xogunato Tokugawa, depois capital imperial.', type: 'capital' },
      { name: 'Quioto', lat: 35.01, lng: 135.77, description: 'Sede da Corte Imperial, onde o poder foi restaurado ao imperador.', type: 'capital' },
      { name: 'Yokohama', lat: 35.44, lng: 139.64, description: 'Porto aberto ao comércio exterior após 1859.', type: 'porto' },
      { name: 'Satsuma', lat: 31.56, lng: 130.56, description: 'Domínio do sul, líder da restauração imperial.', type: 'evento' },
      { name: 'Choshu', lat: 34.18, lng: 131.47, description: 'Domínio do sul, aliado de Satsuma contra o Xogunato.', type: 'evento' },
    ],
    routes: [
      { name: 'Linha Férrea Tóquio-Yokohama', coordinates: [[35.68, 139.69], [35.44, 139.64]] },
    ],
  },
  'independencia-eua-1776': {
    title: 'Independência dos Estados Unidos',
    regionName: 'Treze Colônias, América do Norte',
    center: [40.0, -75.0],
    zoom: 5,
    description: 'O teatro de operações da Guerra de Independência Americana e os focos de debate Iluminista das Treze Colônias.',
    points: [
      { name: 'Filadélfia', lat: 39.95, lng: -75.17, description: 'Onde a Declaração de Independência foi assinada em 1776.', type: 'capital' },
      { name: 'Boston', lat: 42.36, lng: -71.06, description: 'Centro da resistência colonial, Festa do Chá de Boston.', type: 'evento' },
      { name: 'Nova York', lat: 40.71, lng: -74.01, description: 'Ocupada pelos britânicos durante a guerra.', type: 'capital' },
      { name: 'Yorktown', lat: 37.23, lng: -76.51, description: 'Cerco final que levou à rendição britânica em 1781.', type: 'batalha' },
      { name: 'Lexington', lat: 42.45, lng: -71.23, description: 'Local dos primeiros tiros da guerra em 1775.', type: 'batalha' },
    ],
    routes: [
      { name: 'Linha Marítima de Suprimentos Franceses', coordinates: [[48.86, 2.35], [37.23, -76.51]] },
    ],
  },
};

export function getGeoMapDataForTopic(topicKey: string, fallbackTitle: string): TopicGeoData {
  const data = GEO_MAP_REGISTRY[topicKey];
  if (data) return data;

  return {
    title: fallbackTitle,
    regionName: 'Região em catalogação',
    center: [20, 0],
    zoom: 2,
    description: 'Dados geográficos precisos para este tópico estão em processo de catalogação pela equipe CHRONOS.',
    points: [],
    routes: [],
  };
}
