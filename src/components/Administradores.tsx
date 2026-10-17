import { useState } from "react";
import { useLoad } from "../hooks/useData";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "./FormUI";
export default function Administradores() {
  const [email, setEmail] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const state = useLoad(async () => {
    const { data, error } = await db().rpc("listar_administradores");
    if (error) throw error;
    return data as { id: string; email: string }[];
  });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error } = await db().rpc("adicionar_administrador", {
        p_email: email,
      });
      if (error) throw error;
      setMessage(
        `Acesso de administrador liberado para ${email.trim()}. A pessoa pode atualizar a página ou entrar novamente.`,
      );
      setEmail("");
      state.refresh();
    } catch (e) {
      setError(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card mt-6 space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">Administradores</h2>
      <p className="text-sm text-forest-600">
        A pessoa cria uma conta normal no site. Depois, informe o mesmo e-mail
        abaixo para liberar o painel administrativo. Esse acesso permite aprovar
        cadastros e gerenciar empresas.
      </p>
      {state.error && <Message error>{state.error}</Message>}
      <ul className="space-y-2 text-sm">
        {state.data?.map((a) => (
          <li className="break-words rounded-lg bg-forest-50 p-3" key={a.id}>
            {a.email}
          </li>
        ))}
      </ul>
      <form className="space-y-4" onSubmit={add}>
        <Field
          label="E-mail da conta já cadastrada"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <Message error>{error}</Message>}
        {message && <Message>{message}</Message>}
        <button disabled={busy} className="btn-primary">
          {busy ? "Liberando…" : "Adicionar administrador"}
        </button>
      </form>
    </section>
  );
}
