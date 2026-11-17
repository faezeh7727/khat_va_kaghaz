"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import Authservice from "@/services/Authservice";

const roleLabels = { READER: "خواننده", AUTHOR: "نویسنده", ADMIN: "مدیر" };

export default function AdminUsersClient() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (status === "rejected") router.replace("/signin");
    else if (user && user.role !== "ADMIN") router.replace("/profile");
  }, [router, status, user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    let active = true;
    Authservice.getUsers()
      .then((result) => { if (active) setUsers(result); })
      .catch((error) => { if (active) toast.error(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  async function changeRole(target, role) {
    setBusyId(target._id);
    try {
      const updated = await Authservice.updateUserRole(target._id, role);
      setUsers((current) => current.map((item) => item._id === target._id ? { ...item, role: updated?.role || role } : item));
      toast.success(`نقش ${target.name} به ${roleLabels[role]} تغییر کرد.`);
    } catch (error) {
      toast.error(error.message || "تغییر نقش انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  if (status === "pending" || !user || user.role !== "ADMIN") {
    return <main className="profile-page" dir="rtl"><p className="profile-loading" role="status">در حال بررسی دسترسی...</p></main>;
  }

  return (
    <main className="profile-page" dir="rtl">
      <header className="admin-users-heading">
        <span className="profile-eyebrow">پنل مدیریت</span>
        <h1>نقش کاربران</h1>
        <p>دسترسی‌ها را بر اساس مسئولیت هر کاربر تنظیم کنید.</p>
      </header>
      <section className="admin-user-list" aria-label="فهرست کاربران">
        {loading ? <p className="profile-loading" role="status">در حال دریافت کاربران...</p> : users.map((item) => (
          <article className="admin-user-row" key={item._id}>
            <div className="admin-user-identity"><strong>{item.name}</strong><span dir="ltr">{item.email}</span></div>
            <label className="admin-role-select-label" htmlFor={`role-${item._id}`}>نقش</label>
            <select
              id={`role-${item._id}`}
              value={item.role || "READER"}
              disabled={busyId === item._id || String(item._id) === String(user._id)}
              onChange={(event) => changeRole(item, event.target.value)}
            >
              {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </article>
        ))}
        {!loading && users.length === 0 && <p className="profile-loading">کاربری برای نمایش وجود ندارد.</p>}
      </section>
    </main>
  );
}
