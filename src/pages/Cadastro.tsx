import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "../components/FormUI";
export default function Cadastro() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState(""),
    [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false),
    [erro, setErro] = useState(""),
    [aviso, setAviso] = useState("");
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    setAviso("");
    try {
      const { data, error } = await db().auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: `${location.origin}${import.meta.env.BASE_URL}painel`,
        },
      });
      if (error) throw error;
      if (data.session) navigate("/painel");
      else
        setAviso(
          "Confira seu e-mail para confirmar a conta. Depois entre e clique em Publicar. Se já tem conta, use Entrar ou Redefinir senha.",
        );
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  if (authLoading) return <p className="container-page py-14">Carregando…</p>;
  if (user) return <Navigate to="/painel" replace />;
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg">
        <span className="eyebrow">Empreendedores do Acre</span>
        <h1 className="mt-3 font-display text-3xl text-forest-900">
          Crie sua conta
        </h1>
        <p className="mt-3 text-forest-600">
          Depois de entrar, clique em <strong>Publicar</strong> para apresentar
          seu negócio à equipe.
        </p>
        <form onSubmit={submit} className="card mt-6 space-y-5 p-6">
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
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            hint="Use pelo menos 10 caracteres."
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <Message error>{erro}</Message>}
          {aviso && <Message>{aviso}</Message>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Criando conta…" : "Criar conta"}
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
