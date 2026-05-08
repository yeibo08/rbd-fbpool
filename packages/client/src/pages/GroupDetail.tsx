import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi, type Member } from "../api/groups.js";
import { useAuthStore } from "../store/auth.js";

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
  if (!group) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Grupo no encontrado</div>;

  const myRole = group.members.find((m: Member) => m.userId === user?.id)?.role;
  const isOwner = myRole === "owner";
  const isManager = myRole === "manager";
  const canManage = isOwner || isManager;
  const inviteUrl = `${window.location.origin}/unirse/${group.inviteToken}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link to="/grupos" className="text-gray-500 hover:text-gray-700 text-sm">← Grupos</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900 text-sm">{group.name}</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

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
            <h3 className="font-semibold text-gray-800 mb-3">Reglas de puntuación</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-500">Resultado correcto</dt>
              <dd className="text-gray-900 font-medium">{rules.ptsCorrectResult} pts</dd>
              <dt className="text-gray-500">Goles local exactos</dt>
              <dd className="text-gray-900 font-medium">{rules.ptsCorrectHome} pts</dd>
              <dt className="text-gray-500">Goles visitante exactos</dt>
              <dd className="text-gray-900 font-medium">{rules.ptsCorrectAway} pts</dd>
              <dt className="text-gray-500">Total de goles exacto</dt>
              <dd className="text-gray-900 font-medium">{rules.ptsCorrectTotal} pts</dd>
            </dl>
            <p className="text-xs text-gray-400 mt-3">
              Puntos máximos por partido: {rules.ptsCorrectResult + rules.ptsCorrectHome + rules.ptsCorrectAway + rules.ptsCorrectTotal}
            </p>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/grupos/${id}/partidos`}
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Ver partidos
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
