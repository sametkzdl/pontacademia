"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, AlertCircle } from "lucide-react";
import { PasswordInput, Button } from "@/components";

export default function TeacherSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword.length < 6) {
      setPwdError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwdError(data.error || "Şifre değiştirilemedi.");
        setPwdLoading(false);
        return;
      }

      setPwdSuccess("Şifreniz başarıyla güncellendi! Bir sonraki girişinizde yeni şifrenizi kullanabilirsiniz.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPwdError("Bağlantı hatası oluştu.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #DDE6F0", padding: "28px", boxShadow: "0 4px 20px rgba(15, 38, 69, 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <ShieldCheck size={24} color="#C8952A" />
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
            Şifre ve Hesap Güvenliği
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
          Hesap güvenliğiniz için şifrenizi belirleyin veya güncelleyin. Metinler belirgin ve net olarak görünmektedir.
        </p>

        {pwdSuccess && (
          <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={18} /> {pwdSuccess}
          </div>
        )}

        {pwdError && (
          <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} /> {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <PasswordInput
            label="Mevcut Şifre"
            placeholder="Mevcut şifreniz..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <PasswordInput
            label="Yeni Şifre"
            placeholder="En az 6 karakter..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showGenerator
            onGenerate={(pwd) => {
              setNewPassword(pwd);
              setConfirmPassword(pwd);
            }}
            required
          />

          <PasswordInput
            label="Yeni Şifre (Tekrar)"
            placeholder="Yeni şifrenizi doğrulayın..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={pwdLoading}
            style={{ width: "100%", marginTop: "8px" }}
          >
            Şifreyi Güncelle
          </Button>
        </form>
      </div>
    </div>
  );
}
