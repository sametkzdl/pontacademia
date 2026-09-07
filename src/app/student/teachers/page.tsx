"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  Phone, 
  Mail, 
  Search,
  Filter,
  ArrowRight,
  Star
} from "lucide-react";

export default function StudentTeachersPage() {
  const [assignedTeachers, setAssignedTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/student/teachers");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAssignedTeachers(data.teachers || []);
          }
        }
      } catch (err) {
        console.error("Fetch student teachers error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filtered = assignedTeachers.filter((match) => {
    const tName = match.teacher?.name?.toLowerCase() || "";
    const tEmail = match.teacher?.email?.toLowerCase() || "";
    const tSchool = match.teacher?.teacherProfile?.school?.toLowerCase() || "";
    const tSubject = match.subject?.toLowerCase() || "";
    const matchesSearch = tName.includes(searchQuery.toLowerCase()) || tEmail.includes(searchQuery.toLowerCase()) || tSchool.includes(searchQuery.toLowerCase()) || tSubject.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (typeFilter === "ALL") return true;
    return match.type === typeFilter;
  });

  return (
    <div>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #DDE6F0", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <GraduationCap size={22} color="#C8952A" /> Bana Atanan Eğitmenler & Koçum
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
            Pont Akademi bünyesinde sizinle birebir ilgilenen eğitim koçunuz ve branş özel ders hocalarınız
          </p>
        </div>

        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F2645" }}>
          Toplam: <span style={{ color: "#C8952A" }}>{assignedTeachers.length}</span> Eğitmen
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
            <option value="ALL">Tümü ({assignedTeachers.length})</option>
            <option value="KOCLUK">🎓 Eğitim Koçluğu ({assignedTeachers.filter(t => t.type === "KOCLUK").length})</option>
            <option value="OZEL_DERS">📚 Özel Ders ({assignedTeachers.filter(t => t.type === "OZEL_DERS").length})</option>
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <input 
            type="text"
            placeholder="Eğitmen, branş veya üniversite ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "8px 14px 8px 36px", borderRadius: "8px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#0F2645", fontSize: "13px", outline: "none" }}
          />
          <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
        </div>
      </div>

      {/* Teacher Cards Grid */}
      {isLoading ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#94A3B8" }}>
          Yükleniyor...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "50px 20px", textAlign: "center", border: "1px solid #DDE6F0" }}>
          <GraduationCap size={40} color="#CBD5E1" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F2645", margin: "0 0 6px 0" }}>Henüz atanmış eğitmeniniz bulunmuyor</h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Başvurunuz onaylandıktan sonra koçunuz veya özel ders öğretmeniniz sistem yöneticisi tarafından buraya tanımlanacaktır.</p>
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
                    {match.type === "KOCLUK" ? "🎓 Eğitim Koçum" : "📚 Özel Ders Öğretmenim"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    {new Date(match.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                {/* Teacher Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  {match.teacher?.teacherProfile?.photoUrl ? (
                    <img src={match.teacher.teacherProfile.photoUrl} alt={match.teacher.name} style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #C8952A" }} />
                  ) : (
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "20px", border: "2px solid #C8952A" }}>
                      {match.teacher?.name?.charAt(0) || "H"}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: "0 0 2px 0" }}>
                      {match.teacher?.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                      {match.teacher?.teacherProfile?.school || "Pont Akademi Eğitmeni"}
                    </div>
                  </div>
                </div>

                {/* Subject & Rank */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "2px" }}>Atanan Ders / Alan:</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1D4ED8" }}>
                    {match.subject || (match.type === "KOCLUK" ? "Eğitim Koçluğu" : "Genel Özel Ders")}
                  </div>
                  {match.teacher?.teacherProfile?.yksRank && (
                    <div style={{ fontSize: "12px", color: "#92400E", marginTop: "6px", backgroundColor: "#FEF3C7", padding: "3px 8px", borderRadius: "4px", display: "inline-block", fontWeight: "700" }}>
                      🏆 YKS {match.teacher.teacherProfile.scoreType || "SAY"} {match.teacher.teacherProfile.yksRank}. Derece
                    </div>
                  )}
                  {match.notes && (
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px", fontStyle: "italic" }}>
                      📝 <strong>Yönetici Notu:</strong> {match.notes}
                    </div>
                  )}
                </div>

                {/* Location & Districts Info */}
                {(match.teacher?.teacherProfile?.currentDistrict || match.teacher?.teacherProfile?.districts) && (
                  <div style={{ backgroundColor: "#EFF6FF", padding: "12px", borderRadius: "8px", border: "1px solid #BFDBFE", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#1E40AF", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={14} color="#2563EB" /> Eğitmen Konumu & Bölgeleri
                      </span>
                      {match.teacher?.teacherProfile?.onlineAvailable && (
                        <span style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "#DBEAFE", color: "#1D4ED8", padding: "2px 6px", borderRadius: "4px" }}>
                          🌐 Online Uygun
                        </span>
                      )}
                    </div>
                    
                    {match.teacher?.teacherProfile?.currentDistrict && (
                      <div style={{ fontSize: "12px", color: "#1E293B", fontWeight: "600", marginBottom: "4px" }}>
                        📍 <strong>İkamet / İlçe:</strong> {match.teacher.teacherProfile.currentDistrict}
                      </div>
                    )}

                    {match.teacher?.teacherProfile?.districts && (
                      <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px" }}>
                        🗺️ <strong>Ders Verebildiği İlçeler:</strong> {match.teacher.teacherProfile.districts}
                      </div>
                    )}

                    {/* Google Maps Link */}
                    {match.teacher?.teacherProfile?.currentDistrict && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((match.teacher.teacherProfile.currentDistrict || "") + " İstanbul")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#2563EB",
                          textDecoration: "none",
                          backgroundColor: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #93C5FD"
                        }}
                      >
                        <MapPin size={12} /> Haritada Konumu Göster
                      </a>
                    )}
                  </div>
                )}

                {/* Contact items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#475569" }}>
                  {match.teacher?.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={14} color="#94A3B8" />
                      <a href={`mailto:${match.teacher.email}`} style={{ color: "#1D4ED8", textDecoration: "none" }}>{match.teacher.email}</a>
                    </div>
                  )}
                  {match.teacher?.teacherProfile?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={14} color="#94A3B8" />
                      <a href={`tel:${match.teacher.teacherProfile.phone}`} style={{ color: "#0F2645", textDecoration: "none", fontWeight: "600" }}>{match.teacher.teacherProfile.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: "16px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                {match.teacher?.teacherProfile?.phone && (
                  <a
                    href={`https://wa.me/${match.teacher.teacherProfile.phone.replace(/[^0-9]/g, "")}`}
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
                    Hocamla WhatsApp&apos;tan İletişime Geç
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
