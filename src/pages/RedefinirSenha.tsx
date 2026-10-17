import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "../components/FormUI";
export default function RedefinirSenha() {
  const { user, loading } = useAuth(),
    navigate = useNavigate();
  const [senha, setSenha] = useState(""),
    [confirmar, setConfirmar] = useState(""),
    [erro, setErro] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha !== confirmar) {
      setErro("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await db().auth.updateUser({ password: senha });
      if (error) throw error;
      navigate("/painel?senha=alterada", { replace: true });
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="container-page py-14">Validando acesso…</p>;
  if (!user)
    return (
      <div className="container-page py-14">
        <Message error>
          Este link expirou ou não foi validado.{" "}
          <Link className="underline" to="/recuperar-senha">
            Solicitar outro link
          </Link>
        </Message>
      </div>
    );
  return (
    <div className="container-page py-14">
      <form className="card mx-auto max-w-lg space-y-5 p-7" onSubmit={submit}>
        <h1 className="font-display text-3xl">Defina sua senha</h1>
        <Field
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Field
          label="Repita a nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        {erro && <Message error>{erro}</Message>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
