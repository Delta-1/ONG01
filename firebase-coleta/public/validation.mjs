export const MUNICIPIOS = [["1200013","Acrelândia"],["1200054","Assis Brasil"],["1200104","Brasiléia"],["1200138","Bujari"],["1200179","Capixaba"],["1200203","Cruzeiro do Sul"],["1200252","Epitaciolândia"],["1200302","Feijó"],["1200328","Jordão"],["1200336","Mâncio Lima"],["1200344","Manoel Urbano"],["1200351","Marechal Thaumaturgo"],["1200385","Plácido de Castro"],["1200807","Porto Acre"],["1200393","Porto Walter"],["1200401","Rio Branco"],["1200427","Rodrigues Alves"],["1200435","Santa Rosa do Purus"],["1200500","Sena Madureira"],["1200450","Senador Guiomard"],["1200609","Tarauacá"],["1200708","Xapuri"]];
const JURUA = new Set(["1200203","1200336","1200427","1200393","1200351","1200609","1200302","1200328"]);
export function regiaoDoMunicipio(codigo) {
  if (!MUNICIPIOS.some(([id]) => id === codigo)) throw new Error("Selecione um município do Acre.");
  return JURUA.has(codigo) ? "Vale do Juruá" : "Vale do Acre";
}
export function validarCnpj(valor) {
  const cnpj = String(valor).replace(/[./\-\s]/g, "").toUpperCase();
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(cnpj) || /^([0-9])\1{13}$/.test(cnpj)) return false;
  const digits = [...cnpj].map(c => c.charCodeAt(0) - 48);
  const check = weights => {
    const n = digits.slice(0, weights.length).reduce((total, value, index) => total + value * weights[index], 0) % 11;
    return n < 2 ? 0 : 11 - n;
  };
  return digits[12] === check([5,4,3,2,9,8,7,6,5,4,3,2]) && digits[13] === check([6,5,4,3,2,9,8,7,6,5,4,3,2]);
}
function text(value, label, min, max) {
  if (typeof value !== "string") throw new Error("Revise o campo " + label + ".");
  const result = value.trim();
  if (result.length < min || result.length > max) throw new Error(label + " deve ter de " + min + " a " + max + " caracteres.");
  return result;
}
function option(value, choices, label) {
  if (!choices.includes(value)) throw new Error("Selecione " + label + ".");
  return value;
}
function optionalNumber(value, label, integer, max) {
  if (value === "" || value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(raw)) throw new Error("Revise " + label + ".");
  const result = Number(raw);
  if (!Number.isFinite(result) || result < 0 || result > max || (integer && !Number.isInteger(result))) throw new Error("Revise " + label + ".");
  return result;
}
export function prepararCadastro(input, year = new Date().getFullYear()) {
  const participacao = option(input.participacao, ["vitrine","dashboard","ambos"], "a participação");
  const vitrine = participacao !== "dashboard";
  const possui_cnpj = option(input.possui_cnpj, ["sim","nao","nao_sei"], "se possui CNPJ");
  const telefone = text(input.telefone, "Telefone", 8, 30);
  if (telefone.replace(/\D/g, "").length < 8) throw new Error("Informe um telefone válido.");
  const email = text(input.email ?? "", "E-mail de contato", 0, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Revise o e-mail de contato.");
  const site = text(input.site ?? "", "Site", 0, 500);
  if (site) {
    let url;
    try { url = new URL(site); } catch { throw new Error("Informe o site completo, começando com https://."); }
    if (!["http:","https:"].includes(url.protocol)) throw new Error("O site deve começar com http:// ou https://.");
  }
  let cnpj = "", situacao_cnpj = "";
  if (possui_cnpj === "sim") {
    cnpj = text(input.cnpj, "CNPJ", 14, 18).replace(/[./\-\s]/g, "").toUpperCase();
    if (!validarCnpj(cnpj)) throw new Error("Confira o número e os dígitos verificadores do CNPJ.");
    situacao_cnpj = option(input.situacao_cnpj, ["ativo","inativo","nao_sei"], "a situação declarada do CNPJ");
  }
  const trabalhadores = optionalNumber(input.trabalhadores, "pessoas que trabalham", true, 10000000);
  const familias = optionalNumber(input.familias, "famílias envolvidas", true, 10000000);
  const producao_anual_ton = optionalNumber(input.producao_anual_ton, "produção anual", false, 1000000000);
  const anyMetric = [trabalhadores, familias, producao_anual_ton].some(v => v !== null);
  const ano_referencia = optionalNumber(input.ano_referencia, "ano de referência", true, year);
  if ((anyMetric && ano_referencia === null) || (ano_referencia !== null && ano_referencia < 2000)) throw new Error("Informe um ano de referência entre 2000 e " + year + ".");
  if (input.consentimento !== true) throw new Error("Confirme a autorização para registrar os dados.");
  return {
    nome: text(input.nome, "Nome da organização", 3, 160),
    tipo: option(input.tipo, ["Cooperativa","Associação","Empresa","Empreendedor individual","Coletivo comunitário","Instituição de apoio","Outro"], "o tipo de organização"),
    funcionamento: option(input.funcionamento, ["em_atividade","inativo","em_formacao","nao_sei"], "o funcionamento"),
    municipio_codigo: input.municipio_codigo, regiao: regiaoDoMunicipio(input.municipio_codigo),
    participacao, possui_cnpj, cnpj, situacao_cnpj,
    responsavel: text(input.responsavel, "Nome do responsável", 2, 160),
    telefone, email, site,
    historia: text(input.historia, "Apresentação do trabalho", 30, 4000),
    produtos: text(input.produtos ?? "", "Produtos ou serviços", vitrine ? 3 : 0, 1500),
    colaboracao: text(input.colaboracao ?? "", "Colaboração", !vitrine ? 10 : 0, 2000),
    trabalhadores, familias, producao_anual_ton, ano_referencia, consentimento: true
  };
}
