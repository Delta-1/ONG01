import { firebaseConfig, coletaHabilitada } from "./firebase-config.js";
import { MUNICIPIOS, regiaoDoMunicipio, prepararCadastro } from "./validation.mjs";
const $ = id => document.getElementById(id);
const form = $("cadastro");
let auth, db, sdkAuth, sdkDb, busy = false, permitted = false, currentUid = null, submissionId = null, authVersion = 0;
for (const [id, nome] of [...MUNICIPIOS].sort((a,b) => a[1].localeCompare(b[1], "pt-BR"))) {
  const option = document.createElement("option"); option.value = id; option.textContent = nome; $("municipio").append(option);
}
$("ano").max = String(new Date().getFullYear());
$("municipio").addEventListener("change", () => { $("regiao").value = $("municipio").value ? regiaoDoMunicipio($("municipio").value) : ""; });
function dependencies() {
  const cnpj = $("possui-cnpj").value === "sim", vitrine = $("participacao").value !== "dashboard";
  $("cnpj-fields").hidden = !cnpj; $("cnpj").required = cnpj; $("situacao-cnpj").required = cnpj;
  $("produtos").required = vitrine; $("colaboracao").required = !vitrine; $("colaboracao").minLength = !vitrine ? 10 : 0;
  $("products-required").hidden = !vitrine; $("collaboration-required").hidden = vitrine;
  const numbers = ["trabalhadores","familias","producao_anual_ton"].map(k => form.elements.namedItem(k).value);
  $("ano").required = numbers.some(x => x !== "");
}
for (const name of ["participacao","possui_cnpj","trabalhadores","familias","producao_anual_ton"]) form.elements.namedItem(name).addEventListener("input", dependencies);
dependencies();
function error(message) { $("error").textContent = message; $("error").hidden = !message; }
function controls() { $("fields").disabled = !permitted || busy; $("signin").disabled = !auth || busy; $("signout").disabled = busy; }
function friendly(e) {
  const code = String(e?.code ?? "");
  if (code.includes("permission-denied")) return "O envio não foi autorizado. Confirme a liberação da sua conta e os campos informados com a coordenação.";
  if (code.includes("popup-blocked")) return "O navegador bloqueou a janela do Google. Permita o pop-up deste site e tente novamente.";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "A entrada com Google foi cancelada. Seus dados não foram enviados.";
  if (code.includes("unauthorized-domain")) return "O endereço do formulário ainda precisa ser autorizado no Firebase.";
  if (code.includes("unavailable") || code.includes("network")) return "Não foi possível confirmar a conexão. Confira sua internet e tente novamente.";
  return "Não foi possível concluir. Confira sua conexão e peça apoio à coordenação se o problema continuar.";
}
$("signin").addEventListener("click", async () => {
  if (!auth || busy) return;
  error(""); busy = true; controls();
  try { const provider = new sdkAuth.GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); await sdkAuth.signInWithPopup(auth, provider); }
  catch (e) { error(friendly(e)); } finally { busy = false; controls(); }
});
$("signout").addEventListener("click", async () => {
  if (busy || !auth) return;
  permitted = false; controls(); error("");
  try { await sdkAuth.signOut(auth); form.reset(); submissionId = null; $("success").hidden = true; form.hidden = false; dependencies(); $("regiao").value = ""; }
  catch (e) { error(friendly(e)); }
});
async function start() {
  const ready = coletaHabilitada === true && firebaseConfig.projectId === "observatorioccm-c7184" &&
    ["apiKey","authDomain","appId"].every(k => typeof firebaseConfig[k] === "string" && firebaseConfig[k].length > 5);
  if (!ready) { $("connection").textContent = "Formulário em preparação. O recebimento será liberado após a conexão e os testes do Firebase."; return; }
  try {
    const sdkApp = await import("https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js");
    sdkAuth = await import("https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js");
    sdkDb = await import("https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js");
    const app = sdkApp.initializeApp(firebaseConfig); auth = sdkAuth.getAuth(app); db = sdkDb.getFirestore(app);
    await sdkAuth.setPersistence(auth, sdkAuth.browserSessionPersistence);
    sdkAuth.onAuthStateChanged(auth, async user => {
      const version = ++authVersion; permitted = false; currentUid = user?.uid ?? null;
      $("signin").hidden = !!user; $("signout").hidden = !user;
      $("account").textContent = user ? (user.displayName ?? "") + " · " + (user.email ?? "") : "";
      $("connection").textContent = user ? "Conferindo sua autorização…" : "Entre com a conta Google liberada pela ONG.";
      controls();
      if (!user) return;
      try {
        const member = await sdkDb.getDocFromServer(sdkDb.doc(db, "equipe_coleta", user.uid));
        if (version !== authVersion || auth.currentUser?.uid !== user.uid) return;
        permitted = member.exists() && member.data().ativo === true && user.emailVerified;
        $("connection").textContent = permitted ? "Acesso liberado. Você já pode preencher o formulário." : "Esta conta ainda não foi liberada para a coleta. Peça à coordenação para autorizar o acesso.";
      } catch (e) { if (version === authVersion) { permitted = false; error(friendly(e)); } }
      controls();
    }, e => { permitted = false; controls(); error(friendly(e)); });
  } catch (e) { $("connection").textContent = "O serviço de coleta está indisponível no momento."; error(friendly(e)); }
}
form.addEventListener("submit", async event => {
  event.preventDefault(); if (busy || !permitted || !auth?.currentUser || !db) return;
  error(""); const input = Object.fromEntries(new FormData(form)); input.consentimento = $("consentimento").checked;
  let data;
  try { data = prepararCadastro(input); } catch (e) { error(e.message); return; }
  const owner = auth.currentUser.uid;
  submissionId ??= owner + "_" + crypto.randomUUID();
  busy = true; controls(); $("submit").textContent = "Aguardando confirmação do envio…";
  try {
    await sdkDb.setDoc(sdkDb.doc(db, "coletas_ong", submissionId), { ...data, owner_uid: owner, origem: "coleta-ong", schema_version: 1, status: "pendente", criado_em: sdkDb.serverTimestamp() });
    form.hidden = true; $("protocol").textContent = "Protocolo: " + submissionId; $("success").hidden = false; $("success").focus();
    form.reset(); dependencies(); $("regiao").value = "";
  } catch (e) { error(friendly(e)); }
  finally { busy = false; controls(); $("submit").textContent = "Enviar cadastro para conferência ↗"; }
});
$("another").addEventListener("click", () => { submissionId = null; $("success").hidden = true; form.hidden = false; error(""); form.elements.namedItem("nome").focus(); });
window.addEventListener("beforeunload", event => { if (busy) { event.preventDefault(); event.returnValue = ""; } });
void start();
