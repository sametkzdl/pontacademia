"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Search,
  Filter,
  ArrowRight
} from "lucide-react";

export default function TeacherStudentsPage() {
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/teacher/students");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAssignedStudents(data.students || []);
          }
        }
      } catch (err) {
        console.error("Fetch teacher students error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filtered = assignedStudents.filter((match) => {
    const sName = match.student?.name?.toLowerCase() || "";
    const sEmail = match.student?.email?.toLowerCase() || "";
    const sSubject = match.subject?.toLowerCase() || "";
    const matchesSearch = sName.includes(searchQuery.toLowerCase()) || sEmail.includes(searchQuery.toLowerCase()) || sSubject.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (typeFilter === "ALL") return true;
    return match.type === typeFilter;
  });

  return (
    <div>
      {/* Header Info */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px", backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #DDE6F0", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={22} color="#C8952A" /> Bana Atanan Öğrenciler
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
            Yönetici tarafından size atanmış eğitim koçluğu ve branş bazlı özel ders öğrencileri
          </p>
        </div>

        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F2645" }}>
          Toplam: <span style={{ color: "#C8952A" }}>{assignedStudents.length}</span> Öğrenci
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
          <Filter size={14} color="#64748B" />
          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Tür:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
          >
            <option value="ALL">Tümü ({assignedStudents.length})</option>
            <option value="KOCLUK">🎓 Eğitim Koçluğu ({assignedStudents.filter(s => s.type === "KOCLUK").length})</option>
            <option value="OZEL_DERS">📚 Özel Ders ({assignedStudents.filter(s => s.type === "OZEL_DERS").length})</option>
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "260px", flex: 1, maxWidth: "400px" }}>
          <input 
            type="text"
            placeholder="Öğrenci veya ders ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "8px 14px 8px 36px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#0F2645", fontSize: "13px", outline: "none" }}
          />
          <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
        </div>
      </div>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#94A3B8" }}>
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "50px 20px", textAlign: "center", border: "1px solid #DDE6F0" }}>
          <Users size={40} color="#CBD5E1" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F2645", margin: "0 0 6px 0" }}>Henüz atanmış öğrenciniz bulunmuyor</h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Yönetici tarafından size koçluk veya özel ders öğrencisi atandığında burada listelenecektir.</p>
        </div>
      ) : (
        <div className="match-cards-grid">
          {filtered.map((match) => (
            <div 
              key={match.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #DDE6F0",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                {/* Type Badge & Date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    backgroundColor: match.type === "KOCLUK" ? "#F3E8FF" : "#ECFDF5",
                    color: match.type === "KOCLUK" ? "#7E22CE" : "#047857",
                    border: match.type === "KOCLUK" ? "1px solid #E9D5FF" : "1px solid #A7F3D0",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    {match.type === "KOCLUK" ? "🎓 Eğitim Koçluğu" : "📚 Özel Ders"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    {new Date(match.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                {/* Student Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  {match.student?.studentProfile?.photoUrl ? (
                    <img src={match.student.studentProfile.photoUrl} alt={match.student.name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" }}>
                      {match.student?.name?.charAt(0) || "Ö"}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: "0 0 2px 0" }}>
                      {match.student?.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      {match.student?.studentProfile?.grade || "Sınıf Belirtilmedi"}
                    </div>
                  </div>
                </div>

                {/* Subject & Details */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "2px" }}>Atanan Ders / Branş:</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1D4ED8" }}>
                    {match.subject || (match.type === "KOCLUK" ? "Eğitim Koçluğu" : "Genel Özel Ders")}
                  </div>
                  {match.student?.studentProfile?.target && (
                    <div style={{ fontSize: "12px", color: "#334155", marginTop: "6px" }}>
                      🎯 <strong>Hedef:</strong> {match.student.studentProfile.target}
                    </div>
                  )}
                  {match.notes && (
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px", fontStyle: "italic" }}>
                      📝 <strong>Yönetici Notu:</strong> {match.notes}
                    </div>
                  )}
                </div>

                {/* Location & Address Info */}
                {(match.student?.studentProfile?.currentDistrict || match.student?.studentProfile?.currentAddress || match.student?.studentProfile?.city) && (
                  <div style={{ backgroundColor: "#F0FDF4", padding: "12px", borderRadius: "8px", border: "1px solid #BBF7D0", marginBottom: "14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} color="#16A34A" /> Öğrenci Konumu & Adresi
                    </div>
                    
                    <div style={{ fontSize: "12px", color: "#1E293B", fontWeight: "600", marginBottom: "4px" }}>
                      📍 <strong>Bölge / İlçe:</strong> {match.student.studentProfile?.currentDistrict || "Belirtilmedi"} {match.student.studentProfile?.city ? `(${match.student.studentProfile.city})` : ""}
                    </div>

                    {match.student?.studentProfile?.currentAddress && (
                      <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", lineHeight: "1.4" }}>
                        🏠 <strong>Açık Adres:</strong> {match.student.studentProfile.currentAddress}
                      </div>
                    )}

                    {/* Google Maps Link */}
                    {(match.student?.studentProfile?.currentAddress || match.student?.studentProfile?.currentDistrict) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          (match.student.studentProfile?.currentAddress || match.student.studentProfile?.currentDistrict || "") + " " + (match.student.studentProfile?.city || "İstanbul")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#15803D",
                          textDecoration: "none",
                          backgroundColor: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #86EFAC"
                        }}
                      >
                        <MapPin size={12} /> Haritada Konumu / Yol Tarifini Aç
                      </a>
                    )}
                  </div>
                )}

                {/* Contact items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#475569" }}>
                  {match.student?.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={14} color="#94A3B8" />
                      <a href={`mailto:${match.student.email}`} style={{ color: "#1D4ED8", textDecoration: "none" }}>{match.student.email}</a>
                    </div>
                  )}
                  {match.student?.studentProfile?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={14} color="#94A3B8" />
                      <a href={`tel:${match.student.studentProfile.phone}`} style={{ color: "#0F2645", textDecoration: "none", fontWeight: "600" }}>{match.student.studentProfile.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: "16px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                {match.student?.studentProfile?.phone && (
                  <a
                    href={`https://wa.me/${match.student.studentProfile.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      backgroundColor: "#25D366",
                      color: "#FFFFFF",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "700",
                      textDecoration: "none"
                    }}
                  >
                    WhatsApp&apos;tan İletişime Geç
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
