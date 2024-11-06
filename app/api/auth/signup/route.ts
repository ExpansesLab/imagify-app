import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();
    console.log("Registration attempt for email:", email);

    if (password.length < 6) {
      console.log("Password validation failed: too short");
      return NextResponse.json(
        {
          success: false,
          message: "password length should be more than 6 characters",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    console.log("Password hashed successfully");

    // Проверяем существование пользователя
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      console.log("User already exists with email:", email);
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    try {
      console.log("Attempting to create user in database");
      const user = await prisma.user.create({
        data: { 
          email, 
          name: username, 
          password: hashedPassword,
          credits: 5 // Устанавливаем начальные кредиты
        },
      });
      
      const { password: _, ...userWithoutPassword } = user;
      console.log("User created successfully:", userWithoutPassword);
      
      return NextResponse.json(
        { 
          success: true, 
          user: userWithoutPassword 
        }, 
        { status: 201 }
      );
    } catch (e: any) {
      console.error("Database error during user creation:", e);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create user: " + e.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("General error during registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed: " + error.message,
      },
      { status: 400 }
    );
  }
}
