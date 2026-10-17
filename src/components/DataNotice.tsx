import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
export default function DataNotice() {
  const [error, setError] = useState(""),
    { pathname } = useLocation();
  useEffect(() => {
    setError("");
  }, [pathname]);
  useEffect(() => {
    function handler(e: Event) {
      setError((e as CustomEvent<string>).detail);
    }
    window.addEventListener("data-error", handler);
    return () => window.removeEventListener("data-error", handler);
  }, []);
  return error ? (
    <div role="alert" className="container-page mt-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}{" "}
        <button
          className="ml-3 underline"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  ) : null;
}
