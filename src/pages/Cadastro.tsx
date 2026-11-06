import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "../components/FormUI";
import { DicaCadastro, EtapasCadastro } from "../components/GuiaCadastro";
import { PageArtwork } from "../components/BrandArt";
export default function Cadastro() {
  const { user, loading: authLoading } = useAuth();
  const [nome, setNome] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [email, setEmail] = useState(""),
    [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false),
    [erro, setErro] = useState(""),
    [aviso, setAviso] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const escolha = params.get("participacao");
  const destino = "/painel" + (escolha && ["vitrine", "dashboard", "ambos"].includes(escolha) ? "?participacao=" + escolha : "");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    setAviso("");
    try {
      const { data, error } = await db().functions.invoke("cadastro-acesso", { body: { nome: nome.trim(), email: email.trim(), password: senha } });
      if (error) {
        let message = "Não foi possível criar seu acesso. Tente novamente.";
        if ("context" in error) { try { message = (await (error.context as Response).json()).error || message; } catch { /* resposta não JSON */ } }
        throw new Error(message);
      }
      if (data?.error || !data?.session) throw new Error(data?.error || "Não foi possível iniciar a sessão.");
      const signed = await db().auth.setSession(data.session);
      if (signed.error) throw signed.error;
      navigate(destino);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  if (authLoading) return <p className="container-page py-14">Carregando…</p>;
  if (user) return <Navigate to={destino} replace />;
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg">
        <PageArtwork motif="fruto" />
        <span className="eyebrow">Empreendedores do Acre</span>
        <h1 className="mt-3 font-display text-3xl text-forest-900">
          Comece por aqui
        </h1>
        <p className="mt-3 text-forest-600">
          Primeiro, crie seu acesso. Depois você apresenta sua organização e escolhe como participar do Observatório.
        </p>
        <EtapasCadastro atual={0} nomes={["Criar acesso", "Preencher dados", "Análise da ONG"]} />
        <DicaCadastro titulo="É só o primeiro passo">Agora precisamos apenas do seu nome, e-mail e uma senha. Você entra direto no painel, sem confirmar o e-mail. Os dados da organização são preenchidos depois.</DicaCadastro>
        <form onSubmit={submit} className="card mt-6 space-y-5 p-6">
          <Field label="Como você se chama?" autoComplete="name" required minLength={2} maxLength={160} value={nome} onChange={(e) => setNome(e.target.value)} />
          <Field
            label="Seu e-mail de acesso"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Crie uma senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            hint="Use pelo menos 10 caracteres."
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} />Mostrar senha</label>
          {erro && <Message error>{erro}</Message>}
          {aviso && <Message>{aviso}</Message>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Criando acesso…" : "Criar acesso e continuar"}
          </button>
          <p className="text-sm">
            Já tem conta?{" "}
            <Link className="font-semibold underline" to="/entrar">
              Entrar
            </Link>
          </p>
          <Link className="block text-sm underline" to="/recuperar-senha">
            Redefinir senha
          </Link>
        </form>
      </div>
    </div>
  );
}
