import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, type Member } from "../api/groups.js";
import { useAuthStore } from "../store/auth.js";
import AppNav from "../components/layout/AppNav.js";

function roleLabel(role: string) {
  return role === "owner" ? "Propietario" : role === "manager" ? "Gestor" : "Miembro";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
    >
      {copied ? "¡Copiado!" : "Copiar enlace"}
    </button>
  );
}

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [editingRules, setEditingRules] = useState(false);
  const [draftRules, setDraftRules] = useState({ ptsCorrectResult: 1, ptsCorrectHome: 1, ptsCorrectAway: 1, ptsCorrectTotal: 1 });
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupsApi.get(id!),
    enabled: !!id,
  });

  const { data: rules } = useQuery({
    queryKey: ["group-rules", id],
    queryFn: () => groupsApi.getRules(id!),
    enabled: !!id,
  });

  const resetInvite = useMutation({
    mutationFn: () => groupsApi.resetInvite(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group", id] }),
  });

  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "manager" | "member" }) =>
      groupsApi.updateMemberRole(id!, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group", id] }),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => groupsApi.removeMember(id!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group", id] }),
  });

  const deleteGroup = useMutation({
    mutationFn: () => groupsApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); navigate("/grupos"); },
  });

  const saveRules = useMutation({
    mutationFn: () => groupsApi.updateRules(id!, draftRules),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-rules", id] });
      setEditingRules(false);
    },
  });

  const renameGroup = useMutation({
    mutationFn: (name: string) => groupsApi.rename(id!, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", id] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      setRenamingGroup(false);
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
  if (!group) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Grupo no encontrado</div>;

  const myRole = group.members.find((m: Member) => m.userId === user?.id)?.role;
  const isOwner = myRole === "owner";
  const isManager = myRole === "manager";
  const canManage = isOwner || isManager;
  const inviteUrl = `${window.location.origin}/unirse/${group.inviteToken}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav breadcrumbs={[
        { label: "Grupos", href: "/grupos" },
        { label: group.name },
      ]} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Group name with rename */}
        <div className="flex items-center gap-2">
          {renamingGroup ? (
            <form
              className="flex items-center gap-2 flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                if (newGroupName.trim()) renameGroup.mutate(newGroupName.trim());
              }}
            >
              <input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setRenamingGroup(false)}
                maxLength={60}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newGroupName.trim() || renameGroup.isPending}
                className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg"
              >
                {renameGroup.isPending ? "…" : "Guardar"}
              </button>
              <button type="button" onClick={() => setRenamingGroup(false)} className="text-xs text-gray-400 hover:text-gray-600">
                Cancelar
              </button>
            </form>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900">{group.name}</h2>
              {canManage && (
                <button
                  onClick={() => { setNewGroupName(group.name); setRenamingGroup(true); }}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                >
                  ✏ Renombrar
                </button>
              )}
            </>
          )}
        </div>

        {/* Invite link */}
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Enlace de invitación</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 truncate text-gray-600">
              {inviteUrl}
            </code>
            <CopyButton text={inviteUrl} />
            {canManage && (
              <button
                onClick={() => resetInvite.mutate()}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
                title="Generar nuevo enlace"
              >
                ↺
              </button>
            )}
          </div>
        </section>

        {/* Members */}
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            Miembros ({group.members.length}/20)
          </h3>
          <ul className="divide-y divide-gray-100">
            {group.members.map((m: Member) => (
              <li key={m.userId} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-900">{m.displayName}</span>
                  <span className="ml-2 text-xs text-gray-400">{roleLabel(m.role)}</span>
                </div>
                {isOwner && m.userId !== user?.id && (
                  <div className="flex gap-2">
                    {m.role !== "manager" ? (
                      <button
                        onClick={() => changeRole.mutate({ userId: m.userId, role: "manager" })}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Hacer gestor
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole.mutate({ userId: m.userId, role: "member" })}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Quitar gestor
                      </button>
                    )}
                    <button
                      onClick={() => removeMember.mutate(m.userId)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Scoring rules */}
        {rules && (
          <section className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Reglas de puntuación</h3>
              {canManage && !editingRules && (
                <button
                  onClick={() => { setDraftRules({ ptsCorrectResult: rules.ptsCorrectResult, ptsCorrectHome: rules.ptsCorrectHome, ptsCorrectAway: rules.ptsCorrectAway, ptsCorrectTotal: rules.ptsCorrectTotal }); setEditingRules(true); }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            {editingRules ? (
              <div className="space-y-3">
                {(
                  [
                    { key: "ptsCorrectResult", label: "Resultado del partido (Ganador o empate)" },
                    { key: "ptsCorrectHome",   label: "Goles local exactos" },
                    { key: "ptsCorrectAway",   label: "Goles visitante exactos" },
                    { key: "ptsCorrectTotal",  label: "Total de goles exacto" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={draftRules[key]}
                        onChange={(e) => setDraftRules((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))}
                        className="w-14 text-center border border-gray-300 rounded-lg py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-400 w-5">pts</span>
                    </div>
                  </div>
                ))}

                <p className="text-xs text-gray-400 pt-1">
                  Máximo por partido: {Object.values(draftRules).reduce((a, b) => a + b, 0)} pts
                </p>

                {saveRules.error && (
                  <p className="text-red-500 text-xs">{(saveRules.error as Error).message}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveRules.mutate()}
                    disabled={saveRules.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    {saveRules.isPending ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingRules(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">Resultado del partido (Ganador o empate)</dt>
                  <dd className="text-gray-900 font-medium">{rules.ptsCorrectResult} pts</dd>
                  <dt className="text-gray-500">Goles local exactos</dt>
                  <dd className="text-gray-900 font-medium">{rules.ptsCorrectHome} pts</dd>
                  <dt className="text-gray-500">Goles visitante exactos</dt>
                  <dd className="text-gray-900 font-medium">{rules.ptsCorrectAway} pts</dd>
                  <dt className="text-gray-500">Total de goles exacto</dt>
                  <dd className="text-gray-900 font-medium">{rules.ptsCorrectTotal} pts</dd>
                </dl>
                <p className="text-xs text-gray-400 mt-3">
                  Máximo por partido: {rules.ptsCorrectResult + rules.ptsCorrectHome + rules.ptsCorrectAway + rules.ptsCorrectTotal} pts
                </p>
              </>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/grupos/${id}/partidos`}
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Partidos
          </Link>
          <Link
            to={`/grupos/${id}/tabla`}
            className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Tabla
          </Link>
          {isOwner && (
            <button
              onClick={() => { if (confirm("¿Eliminar este grupo? Esta acción no se puede deshacer.")) deleteGroup.mutate(); }}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2.5 rounded-lg transition-colors"
            >
              Eliminar grupo
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
