import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MUNICIPIOS } from "../data/municipios";
import {
  db,
  fetchMinhaEmpresa,
  mapEmpresa,
  mensagemErro,
} from "../lib/queries";
import type { Empreendimento } from "../data/types";
import { useLoad } from "../hooks/useData";
import { Field, TextField, Message, inputClass } from "../components/FormUI";
const categorias = [
  "Castanha-do-Brasil",
  "Polpas e Frutas",
  "Borracha / Látex",
  "Mel e Abelhas Nativas",
  "Pesca Manejada",
  "Óleos e Cosméticos",
  "Artesanato Indígena",
  "Farinha e Derivados",
  "Agricultura familiar",
  "Turismo comunitário",
  "Outros",
];
const initial = {
  nome: "",
  municipio_codigo: "",
  categoria: "",
  historia: "",
  produtos: "",
  telefone: "",
  email: "",
  instagram: "",
  comunidade: "",
  responsavel: "",
  tipo: "Empreendedor individual",
};
export default function Publicar() {
  const auth = useAuth(),
    location = useLocation(),
    [params] = useSearchParams();
  const adminNew = location.pathname === "/admin/novo",
    requested = params.get("empresa");
  const load = useLoad(async () => {
    if (!auth.user) return null;
    if (adminNew) return null;
    if (auth.isAdmin && requested) {
      const { data, error } = await db()
        .from("empreendimentos")
        .select("*")
        .eq("id", requested)
        .eq("is_demo", false)
        .single();
      if (error) throw error;
      return mapEmpresa(data);
    }
    return fetchMinhaEmpresa(auth.user.id);
  }, `${auth.user?.id}:${auth.isAdmin}:${requested}:${adminNew}`);
  const [empresa, setEmpresa] = useState(initial),
    [titulo, setTitulo] = useState(""),
    [texto, setTexto] = useState(""),
    [processo, setProcesso] = useState(""),
    [impacto, setImpacto] = useState(""),
    [produtos, setProdutos] = useState("");
  const [foto, setFoto] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [erro, setErro] = useState(""),
    [done, setDone] = useState(false);
  const existing = load.data as Empreendimento | null;
  useEffect(() => {
    if (existing) {
      setProdutos(existing.produtos.join(", "));
    }
  }, [existing?.id]);
  useEffect(() => {
    if (!foto) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(foto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);
  function change(key: keyof typeof initial, value: string) {
    setEmpresa((s) => ({ ...s, [key]: value }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user || busy) return;
    setErro("");
    setBusy(true);
    let uploaded: string | null = null;
    try {
      if (foto) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(foto.type) ||
          foto.size > 5 * 1024 * 1024
        )
          throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
        const ext =
          foto.type === "image/png"
            ? "png"
            : foto.type === "image/webp"
              ? "webp"
              : "jpg";
        uploaded = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await db()
          .storage.from("publicacoes")
          .upload(uploaded, foto, { contentType: foto.type, upsert: false });
        if (error) throw error;
      }
      const lista = produtos
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 30);
      const { error } = await db().rpc("enviar_publicacao", {
        p_empresa: { ...empresa, produtos: lista, consentimento: consent },
        p_post: {
          titulo,
          conteudo: texto,
          processo,
          impacto,
          produtos: lista,
          imagem_path: uploaded,
        },
        p_empresa_id: existing?.id ?? null,
      });
      if (error) throw error;
      await auth.refreshProfile();
      setDone(true);
    } catch (e) {
      if (uploaded) await db().storage.from("publicacoes").remove([uploaded]);
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  if (auth.loading || load.loading)
    return <p className="container-page py-14">Carregando formulário…</p>;
  if (!auth.user) return <Navigate to="/entrar" replace />;
  if (adminNew && !auth.isAdmin) return <Navigate to="/painel" replace />;
  if (auth.error || load.error)
    return (
      <div className="container-page py-14">
        <Message error>{auth.error || load.error}</Message>
        <button onClick={load.refresh} className="btn-primary mt-4">
          Tentar novamente
        </button>
      </div>
    );
  if (done)
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-xl space-y-5 p-8">
          <span className="chip">Enviado para análise</span>
          <h1 className="font-display text-3xl">Publicação recebida!</h1>
          <p>
            A equipe vai verificar as informações. A empresa receberá um aviso
            no painel quando a publicação for validada. Até lá, ela fica visível
            apenas para a empresa e a administração.
          </p>
          <Link
            className="btn-primary"
            to={auth.isAdmin ? "/admin" : "/painel"}
          >
            {auth.isAdmin
              ? "Abrir administração e gerenciar acesso"
              : "Acompanhar no meu painel"}
          </Link>
        </div>
      </div>
    );
  const mun = MUNICIPIOS.find((m) => m.codigo === empresa.municipio_codigo);
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm underline"
          to={auth.isAdmin ? "/admin" : "/painel"}
        >
          ← Voltar ao painel
        </Link>
        <span className="eyebrow mt-5 block">
          {adminNew
            ? "Cadastro pela administração"
            : auth.isAdmin && existing
              ? "Publicação pela administração"
              : "Sua voz na vitrine"}
        </span>
        <h1 className="mt-2 font-display text-3xl text-forest-900">
          {adminNew
            ? "Criar empreendimento e publicação"
            : auth.isAdmin && existing
              ? `Publicar por ${existing.nome}`
              : "Publicar"}
        </h1>
        <p className="mt-3 text-forest-600">
          Responda com suas palavras. A equipe analisa antes de divulgar. Os
          campos com * são obrigatórios.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-6">
          {existing ? (
            <div className="card p-5">
              <strong>{existing.nome}</strong>
              <p className="text-sm text-forest-500">
                {
                  MUNICIPIOS.find((m) => m.codigo === existing.municipioCodigo)
                    ?.nome
                }{" "}
                · {existing.categoria}
              </p>
            </div>
          ) : (
            <fieldset className="card space-y-5 p-5 sm:p-8">
              <legend className="px-2 font-display text-xl font-semibold">
                1. Conheça o empreendimento
              </legend>
              <Field
                label="Qual é o nome do negócio?"
                required
                minLength={3}
                maxLength={160}
                value={empresa.nome}
                onChange={(e) => change("nome", e.target.value)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nome de quem representa o negócio"
                  required
                  maxLength={160}
                  value={empresa.responsavel}
                  onChange={(e) => change("responsavel", e.target.value)}
                />
                <label className="block text-sm font-semibold">
                  Como vocês se organizam? *
                  <select
                    className={`${inputClass} mt-2`}
                    value={empresa.tipo}
                    onChange={(e) => change("tipo", e.target.value)}
                  >
                    {[
                      "Empreendedor individual",
                      "Associação",
                      "Cooperativa",
                      "Empresa",
                      "Coletivo comunitário",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Município do Acre *
                  <select
                    required
                    className={`${inputClass} mt-2`}
                    value={empresa.municipio_codigo}
                    onChange={(e) => change("municipio_codigo", e.target.value)}
                  >
                    <option value="">Selecione o município</option>
                    {[...MUNICIPIOS]
                      .sort((a, b) => a.nome.localeCompare(b.nome))
                      .map((m) => (
                        <option key={m.codigo} value={m.codigo}>
                          {m.nome}
                        </option>
                      ))}
                  </select>
                </label>
                <Field
                  label="Região"
                  readOnly
                  value={mun?.regiao ?? ""}
                  hint="Preenchida a partir do município."
                />
                <Field
                  label="Comunidade, bairro ou localidade"
                  maxLength={200}
                  value={empresa.comunidade}
                  onChange={(e) => change("comunidade", e.target.value)}
                />
                <label className="block text-sm font-semibold">
                  Categoria ou cadeia produtiva *
                  <select
                    required
                    className={`${inputClass} mt-2`}
                    value={empresa.categoria}
                    onChange={(e) => change("categoria", e.target.value)}
                  >
                    <option value="">Selecione a categoria</option>
                    {categorias.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <TextField
                label="Como o negócio começou e quem faz parte?"
                required
                minLength={30}
                maxLength={4000}
                placeholder="Conte de onde vocês são, como começaram e quem trabalha com vocês."
                value={empresa.historia}
                onChange={(e) => change("historia", e.target.value)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Telefone ou WhatsApp de contato"
                  required
                  minLength={8}
                  maxLength={30}
                  type="tel"
                  value={empresa.telefone}
                  onChange={(e) => change("telefone", e.target.value)}
                />
                <Field
                  label="E-mail público de contato (opcional)"
                  hint="Pode ser diferente do e-mail usado para entrar."
                  type="email"
                  maxLength={254}
                  value={empresa.email}
                  onChange={(e) => change("email", e.target.value)}
                />
                <Field
                  label="Instagram (opcional)"
                  placeholder="@seunegocio"
                  maxLength={100}
                  value={empresa.instagram}
                  onChange={(e) => change("instagram", e.target.value)}
                />
              </div>
            </fieldset>
          )}
          <fieldset className="card space-y-5 p-5 sm:p-8">
            <legend className="px-2 font-display text-xl font-semibold">
              {existing ? "Sua nova publicação" : "2. Sua primeira publicação"}
            </legend>
            <Field
              label="Dê um título para sua publicação"
              required
              minLength={5}
              maxLength={140}
              placeholder="Ex.: Conheça os produtos da nossa comunidade"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <TextField
              label="O que você quer apresentar ao público?"
              required
              minLength={30}
              maxLength={6000}
              hint="Fale do produto, do trabalho ou de uma novidade do negócio."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <Field
              label="Quais produtos ou serviços vocês oferecem?"
              required
              maxLength={1500}
              hint="Separe por vírgulas. Ex.: castanha, óleo de copaíba, artesanato."
              value={produtos}
              onChange={(e) => setProdutos(e.target.value)}
            />
            <TextField
              label="Como vocês produzem ou realizam esse trabalho? (opcional)"
              maxLength={3000}
              value={processo}
              onChange={(e) => setProcesso(e.target.value)}
            />
            <TextField
              label="Como esse trabalho ajuda a comunidade ou a floresta? (opcional)"
              maxLength={3000}
              value={impacto}
              onChange={(e) => setImpacto(e.target.value)}
            />
            <label className="block text-sm font-semibold">
              Uma foto do produto, da equipe ou do trabalho (opcional)
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
              <span className="mt-1 block font-normal text-forest-500">
                JPG, PNG ou WebP, até 5 MB. Use uma imagem que você tem
                autorização para divulgar.
              </span>
            </label>
            {preview && (
              <img
                alt="Prévia da foto selecionada"
                className="max-h-72 w-full rounded-xl object-contain"
                src={preview}
              />
            )}
          </fieldset>
          <label className="flex items-start gap-3 text-sm text-forest-700">
            <input
              className="mt-1 h-5 w-5 shrink-0"
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Confirmo que as informações são verdadeiras e autorizo a divulgação
            dos dados de contato, textos e imagem enviados na vitrine do
            Observatório.
          </label>
          {erro && <Message error>{erro}</Message>}
          <Message>
            A publicação será enviada para análise. Você receberá um aviso no
            painel quando ela for validada.
          </Message>
          <button className="btn-primary w-full py-4" disabled={busy}>
            {busy ? "Enviando publicação…" : "Publicar e enviar para análise"}
          </button>
        </form>
      </div>
    </div>
  );
}
