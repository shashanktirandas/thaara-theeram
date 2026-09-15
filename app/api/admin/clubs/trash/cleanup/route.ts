import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (studentError || !student) {
      return NextResponse.json(
        { error: "Student account not found" },
        { status: 403 }
      );
    }

    const { data: adminRole, error: adminError } = await supabase
      .from("admin_roles")
      .select("id")
      .eq("student_id", student.id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (adminError || !adminRole) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient.rpc(
      "permanently_delete_expired_clubs"
    );

    if (error) {
      console.error(
        "Permanent club cleanup failed:",
        error
      );

      return NextResponse.json(
        { error: "Failed to permanently delete expired clubs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: Number(data ?? 0),
    });
  } catch (error) {
    console.error(
      "Permanent club cleanup route error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}