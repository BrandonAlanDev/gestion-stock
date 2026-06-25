"use server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/zod"; // Asegúrate de importar loginSchema
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
  error?: string;
  success?: boolean;
};

export const loginAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  // Extraemos los datos directamente del FormData aquí en el servidor
  const data = Object.fromEntries(formData);
  
  // Validamos con Zod antes de procesar
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  try {
    // redirect: false es importante para manejar errores manualmente aquí
    await signIn("credentials", { 
      email: validated.data.email, 
      password: validated.data.password, 
      redirect: false 
    });
    
    // Si no lanza error, el login fue exitoso. 
    // Nota: Normalmente signIn redirige, pero si usas redirect: false:
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    // Auth.js lanza un error para redirigir, hay que relanzarlo si no es de auth
    throw error;
  }
};

export const registerAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  console.log("🟢 1. Inicio de registerAction"); // <--- LOG

  const data = Object.fromEntries(formData);
  const validated = registerSchema.safeParse(data);

  if (!validated.success) {
    console.log("🔴 2. Falló validación Zod", validated.error.flatten()); // <--- LOG
    return { error: "Datos inválidos. Revisa los campos." };
  }

  const { email, password, name } = validated.data;
  console.log("🟢 3. Datos validados:", email); // <--- LOG

  try {
    // Verificar conexión
    console.log("🟡 4. Buscando usuario en DB..."); 
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("🔴 5. Usuario ya existe");
      return { error: "El usuario ya existe" };
    }

    console.log("🟡 6. Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🟡 7. Creando usuario en Prisma...");
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });

    console.log("🟢 8. ¡Usuario Creado Éxitosamente!");
    return { success: true };

  } catch (error: any) {
    // ESTO ES LO IMPORTANTE: Imprime el error real en la terminal
    console.error("🔴 ERROR FATAL EN REGISTER:", error);
    console.error("Mensaje de error:", error.message);
    
    return { error: "Error interno: " + error.message };
  }
};

export const googleLoginAction = async () => {
  await signIn("google", { redirectTo: "/" });
};