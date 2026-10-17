import { useState } from "react";
import { Link } from "react-router-dom";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "../components/FormUI";
export default function RecuperarSenha() {
  const [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [erro, setErro] = useState(""),
    [ok, setOk] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    try {
      const { error } = await db().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${location.origin}${import.meta.env.BASE_URL}redefinir-senha`,
      });
      if (error) throw error;
      setOk(true);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container-page py-14">
      <form onSubmit={submit} className="card mx-auto max-w-lg space-y-5 p-7">
        <h1 className="font-display text-3xl">Recuperar acesso</h1>
        <p>Informe o e-mail usado na sua conta.</p>
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {erro && <Message error>{erro}</Message>}
        {ok && (
          <Message>
            Se houver uma conta com esse e-mail, você receberá um link para
            definir outra senha. Confira também o spam.
          </Message>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Enviando…" : "Enviar link de redefinição"}
        </button>
        <Link to="/entrar" className="block underline">
          Voltar para entrar
        </Link>
      </form>
    </div>
  );
}
