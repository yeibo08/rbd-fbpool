import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.js";
import { useAuthStore } from "../store/auth.js";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  displayName: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/\d/, "Debe incluir un número")
    .regex(/[!#$?]/, "Debe incluir uno de: ! # $ ?"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      setUser(user);
      navigate(user.forcePasswordChange ? "/cambiar-contrasena" : "/grupos");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Crear cuenta
        </h1>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              {...register("displayName")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre"
              autoComplete="name"
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
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
            {mutation.isPending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/iniciar-sesion" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
