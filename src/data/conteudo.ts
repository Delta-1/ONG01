import type { Empreendimento, Noticia, Legislacao } from './types'

/** DADOS FICTÍCIOS — vitrine, notícias e legislação para demonstração. */

export const EMPREENDIMENTOS: Empreendimento[] = [
  {
    id: 'coop-castanha-xapuri',
    nome: 'Cooperativa da Castanha de Xapuri',
    municipioCodigo: '1200708',
    categoria: 'Castanha-do-Brasil',
    historia:
      'Nascida nos seringais de Xapuri, a cooperativa reúne famílias extrativistas que colhem e beneficiam a castanha-do-Brasil de forma sustentável, mantendo a floresta em pé.',
    produtos: ['Castanha in natura', 'Óleo de castanha', 'Farinha de castanha'],
    contato: { telefone: '(68) 99999-0001', email: 'contato@castanhaxapuri.org', instagram: '@castanhaxapuri' },
    destaque: true,
    aprovado: true,
    cor: '#256b3d',
  },
  {
    id: 'sabores-do-jurua',
    nome: 'Sabores do Juruá',
    municipioCodigo: '1200203',
    categoria: 'Polpas e Frutas',
    historia:
      'Em Cruzeiro do Sul, mulheres empreendedoras transformam açaí, cupuaçu e buriti em polpas congeladas que abastecem o Vale do Juruá.',
    produtos: ['Polpa de açaí', 'Polpa de cupuaçu', 'Polpa de buriti'],
    contato: { telefone: '(68) 99999-0002', email: 'ola@saboresdojurua.com', instagram: '@saboresdojurua' },
    destaque: true,
    aprovado: true,
    cor: '#8a5836',
  },
  {
    id: 'latex-nativa',
    nome: 'Látex Nativa',
    municipioCodigo: '1200104',
    categoria: 'Borracha / Látex',
    historia:
      'Comunidade seringueira de Brasiléia que produz folhas de borracha defumada líquida (FDL) e artefatos de látex ecológico.',
    produtos: ['Folha de borracha', 'Ecobags de látex', 'Solados sustentáveis'],
    contato: { telefone: '(68) 99999-0003', email: 'contato@latexnativa.com' },
    aprovado: true,
    cor: '#1d5532',
  },
  {
    id: 'mel-da-mata',
    nome: 'Mel da Mata Viva',
    municipioCodigo: '1200500',
    categoria: 'Mel e Abelhas Nativas',
    historia:
      'Meliponicultores de Sena Madureira dedicados à criação de abelhas sem ferrão e à produção de mel silvestre certificado.',
    produtos: ['Mel de jandaíra', 'Própolis', 'Kits de meliponário'],
    contato: { telefone: '(68) 99999-0004', email: 'mel@matavivaacre.com', instagram: '@meldamatavivaacre' },
    aprovado: true,
    cor: '#eea01f',
  },
  {
    id: 'pirarucu-manejado',
    nome: 'Pirarucu de Manejo do Purus',
    municipioCodigo: '1200435',
    categoria: 'Pesca Manejada',
    historia:
      'Associação de pescadores de Santa Rosa do Purus que faz o manejo comunitário do pirarucu, unindo renda e conservação dos lagos.',
    produtos: ['Pirarucu fresco', 'Filé congelado', 'Couro de pirarucu'],
    contato: { telefone: '(68) 99999-0005', email: 'manejo@pirarucupurus.org' },
    aprovado: true,
    cor: '#197c8b',
  },
  {
    id: 'oleos-da-floresta',
    nome: 'Óleos da Floresta',
    municipioCodigo: '1200401',
    categoria: 'Óleos e Cosméticos',
    historia:
      'Em Rio Branco, uma bioindústria comunitária extrai copaíba, andiroba e murumuru para cosméticos naturais com rastreabilidade total.',
    produtos: ['Óleo de copaíba', 'Óleo de andiroba', 'Manteiga de murumuru'],
    contato: { telefone: '(68) 99999-0006', email: 'contato@oleosdafloresta.com', instagram: '@oleosdafloresta' },
    destaque: true,
    aprovado: true,
    cor: '#35874e',
  },
  {
    id: 'artesanato-huni-kuin',
    nome: 'Arte Huni Kuin',
    municipioCodigo: '1200609',
    categoria: 'Artesanato Indígena',
    historia:
      'Coletivo de artesãos do povo Huni Kuin, em Tarauacá, que produz tecelagem, biojoias e grafismos tradicionais kene.',
    produtos: ['Tecelagem kene', 'Biojoias', 'Cerâmica'],
    contato: { telefone: '(68) 99999-0007', email: 'arte@hunikuin.org', instagram: '@artehunikuin' },
    aprovado: true,
    cor: '#a86f43',
  },
  {
    id: 'farinha-de-cruzeiro',
    nome: 'Casa da Farinha de Rodrigues Alves',
    municipioCodigo: '1200427',
    categoria: 'Farinha e Derivados',
    historia:
      'Agricultores familiares produzem a tradicional farinha de mandioca do Juruá, patrimônio cultural do Acre.',
    produtos: ['Farinha branca', 'Goma de tapioca', 'Tucupi'],
    contato: { telefone: '(68) 99999-0008', email: 'casadafarinha@rodriguesalves.com' },
    aprovado: true,
    cor: '#c58d5f',
  },
]

export const NOTICIAS: Noticia[] = [
  {
    id: 'n1',
    titulo: 'Observatório mapeia primeiros 15 empreendimentos da sociobiodiversidade',
    resumo:
      'Levantamento inicial cobre cadeias da castanha, borracha e açaí no Vale do Acre e Vale do Juruá.',
    data: '2026-07-20',
    categoria: 'Institucional',
  },
  {
    id: 'n2',
    titulo: 'Nova lei estadual incentiva a bioeconomia no Acre',
    resumo:
      'Marco regulatório amplia crédito e assistência técnica para negócios da floresta.',
    data: '2026-07-05',
    categoria: 'Legislação',
  },
  {
    id: 'n3',
    titulo: 'Manejo do pirarucu bate recorde de produção no Purus',
    resumo:
      'Associações comunitárias registram aumento de 18% na despesca sustentável deste ano.',
    data: '2026-06-18',
    categoria: 'Cadeias Produtivas',
  },
  {
    id: 'n4',
    titulo: 'Mulheres da floresta lideram cooperativas de polpa no Juruá',
    resumo:
      'Protagonismo feminino movimenta a economia local e valoriza os frutos amazônicos.',
    data: '2026-06-02',
    categoria: 'Comunidades',
  },
]

export const LEGISLACAO: Legislacao[] = [
  {
    id: 'l1',
    titulo: 'Política Nacional da Sociobiodiversidade',
    descricao: 'Diretrizes para o uso sustentável dos produtos da biodiversidade brasileira.',
    esfera: 'Federal',
    ano: 2009,
  },
  {
    id: 'l2',
    titulo: 'Lei Chico Mendes de Serviços Ambientais (SISA)',
    descricao: 'Sistema de Incentivo a Serviços Ambientais do Estado do Acre.',
    esfera: 'Estadual',
    ano: 2010,
  },
  {
    id: 'l3',
    titulo: 'Política Estadual de Bioeconomia',
    descricao: 'Fomento a cadeias produtivas de base florestal e valor agregado local.',
    esfera: 'Estadual',
    ano: 2024,
  },
  {
    id: 'l4',
    titulo: 'Lei de Gestão de Florestas Públicas',
    descricao: 'Regras para concessão e manejo florestal sustentável.',
    esfera: 'Federal',
    ano: 2006,
  },
]
