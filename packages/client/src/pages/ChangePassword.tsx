import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.js";
import { useAuthStore } from "../store/auth.js";

const schema = z.object({
  currentPassword: z.string().min(1, "Requerido"),
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/\d/, "Debe incluir un número")
    .regex(/[!#$?]/, "Debe incluir uno de: ! # $ ?"),
});

type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      const user = await authApi.me();
      setUser(user);
      navigate("/grupos");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Cambiar contraseña
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Por seguridad debes establecer una nueva contraseña
        </p>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña temporal
            </label>
            <input
              {...register("currentPassword")}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              {...register("newPassword")}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Debe incluir mayúscula, número y uno de: ! # $ ?
            </p>
          </div>

          {mutation.error && (
            <p className="text-red-500 text-sm text-center">
              {mutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {mutation.isPending ? "Guardando…" : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
