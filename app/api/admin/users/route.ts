import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getUsernameFromUser,
  isDuplicateUsernameError,
  normalizeUsername,
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/username-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 200,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const users = (data.users ?? [])
      .map((user) => ({
        id: user.id,
        username: getUsernameFromUser(user) ?? "",
        role:
          typeof user.app_metadata?.role === "string"
            ? user.app_metadata.role
            : "trainer",
        createdAt: user.created_at,
      }))
      .filter((user) => user.username.length > 0);

    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Benutzer konnten nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = normalizeUsername(body.username ?? "");
    const password = body.password ?? "";

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "Passwort ist erforderlich." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen haben." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: usernameToAuthEmail(username),
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error) {
      if (isDuplicateUsernameError(error.message)) {
        return NextResponse.json(
          { error: "Dieser Nutzername ist bereits vergeben." },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        username,
      },
      password,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Benutzer konnte nicht angelegt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "Benutzer-ID fehlt." },
        { status: 400 },
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { error: "Du kannst deinen eigenen Account nicht löschen." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Benutzer konnte nicht gelöscht werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
