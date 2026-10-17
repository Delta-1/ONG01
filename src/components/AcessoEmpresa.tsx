import { useEffect, useState } from "react";
import { db, mensagemErro } from "../lib/queries";
import { Field, Message } from "./FormUI";
export default function AcessoEmpresa({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const [email, setEmail] = useState(""),
    [hasAccount, setHasAccount] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [password, setPassword] = useState(""),
    [open, setOpen] = useState(false);
  async function invoke(action: string) {
    setBusy(true);
    setError("");
    setMessage("");
    setPassword("");
    try {
      const { data, error } = await db().functions.invoke(
        "empreendimento-acesso",
        { body: { action, empresa_id: id, email } },
      );
      if (error) {
        let message = mensagemErro(error);
        if ("context" in error) {
          try {
            const detail = await (error.context as Response).json();
            message = detail.error || message;
          } catch {
            /* Preserve original error. */
          }
        }
        throw new Error(message);
      }
      if (data.error) throw new Error(data.error);
      if (action === "details") {
        setEmail(data.email);
        setHasAccount(data.has_account);
      } else {
        setMessage(data.message);
        if (data.temporary_password) setPassword(data.temporary_password);
        if (data.email) setEmail(data.email);
        setHasAccount(true);
      }
    } catch (e) {
      setError(mensagemErro(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (open) void invoke("details");
  }, [open, id]);
  return (
    <div className="mt-4 border-t border-forest-100 pt-4">
      <button
        className="text-sm font-semibold underline"
        onClick={() => {
          setOpen(!open);
          setPassword("");
        }}
      >
        {open ? "Fechar acesso" : "Gerenciar e-mail e acesso"}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <h4 className="font-semibold">Acesso de {nome}</h4>
          <p className="text-sm text-forest-500">
            E-mail privado de login. O e-mail público de contato é independente.
          </p>
          <Field
            label="E-mail de acesso"
            type="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || !email}
              onClick={() => void invoke("invite")}
              className="btn-primary"
            >
              {hasAccount ? "Enviar link de acesso" : "Convidar por e-mail"}
            </button>
            {hasAccount && (
              <>
                <button
                  disabled={busy || !email}
                  onClick={() => void invoke("email")}
                  className="btn-ghost"
                >
                  Alterar e-mail
                </button>
                <button
                  disabled={busy}
                  onClick={() => void invoke("reset")}
                  className="btn-ghost"
                >
                  Enviar redefinição
                </button>
              </>
            )}
            <button
              disabled={busy || !email}
              onClick={() => void invoke("temporary")}
              className="btn-ghost"
            >
              {hasAccount
                ? "Gerar nova senha provisória"
                : "Criar acesso com senha provisória"}
            </button>
          </div>
          {busy && (
            <p role="status" className="text-sm">
              Processando…
            </p>
          )}
          {error && <Message error>{error}</Message>}
          {message && <Message>{message}</Message>}
          {password && (
            <div className="rounded-xl border border-sun-400 bg-sun-500/10 p-4">
              <strong>Senha provisória: copie agora</strong>
              <input
                aria-label="Senha provisória gerada"
                readOnly
                value={password}
                onFocus={(e) => e.target.select()}
                className="mt-3 w-full bg-transparent font-mono"
              />
              <p className="mt-2 text-sm">
                Ela aparece somente nesta operação. O responsável poderá
                alterá-la no painel.
              </p>
              <button
                className="mt-3 text-sm underline"
                onClick={() => setPassword("")}
              >
                Ocultar senha
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
