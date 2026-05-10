import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth.js";
import { useAuthStore } from "../../store/auth.js";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppNavProps {
  breadcrumbs?: Breadcrumb[];
  right?: React.JSX.Element;
  groupId?: string;
}

function DisplayNameEditor({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [value, setValue] = useState(user?.displayName ?? "");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (name: string) => authApi.updateProfile(name),
    onSuccess: (updated) => {
      setUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && value.trim() !== user?.displayName) {
          mutation.mutate(value.trim());
        } else {
          onClose();
        }
      }}
      className="flex items-center gap-2 mt-1"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        maxLength={50}
        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!value.trim() || mutation.isPending}
        className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2 py-1 rounded-lg"
      >
        {mutation.isPending ? "…" : "OK"}
      </button>
      <button type="button" onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
        ✕
      </button>
      {mutation.error && (
        <span className="text-red-500 text-xs">{(mutation.error as Error).message}</span>
      )}
    </form>
  );
}

export default function AppNav({ breadcrumbs, right, groupId }: AppNavProps) {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      navigate("/iniciar-sesion");
    },
  });

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Left: breadcrumbs or app title */}
        <div className="flex items-center gap-2 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2 min-w-0">
                {i > 0 && <span className="text-gray-300">/</span>}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-gray-500 hover:text-gray-700 text-sm truncate"
                  >
                    {i === 0 ? `← ${crumb.label}` : crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900 text-sm truncate">{crumb.label}</span>
                )}
              </span>
            ))
          ) : (
            <span className="font-bold text-gray-900">Quiniela Mundial 2026</span>
          )}
        </div>

        {/* Right: optional action + hamburger */}
        <div className="flex items-center gap-3">
          {right}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => { setDrawerOpen(false); setEditingName(false); }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col transition-transform duration-200 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Menú</span>
          <button
            onClick={() => { setDrawerOpen(false); setEditingName(false); }}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* User section */}
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tu cuenta</p>
          {editingName ? (
            <DisplayNameEditor onClose={() => setEditingName(false)} />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{user?.displayName}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
              >
                ✏ Editar
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link
            to="/grupos"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Mis grupos
          </Link>
          <Link
            to={groupId ? `/grupos/${groupId}/tabla-de-grupos` : "/tabla-de-grupos"}
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Tabla de grupos
          </Link>
          {groupId && (
            <Link
              to={`/grupos/${groupId}/bracket`}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Bracket
            </Link>
          )}
          <Link
            to="/faq"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Ayuda / FAQ
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => logout.mutate()}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
