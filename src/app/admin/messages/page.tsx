"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Eye, 
  Trash2, 
  Mail
} from "lucide-react";
import { Button, Badge, Modal, SearchFilterBar } from "@/components";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");

  // Modal
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: "UNREAD" | "READ" | "REPLIED", notes?: string) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status, notes: notes !== undefined ? notes : m.notes } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev: any) => ({ ...prev, status, notes: notes !== undefined ? notes : prev.notes }));
        }
      } else {
        alert(data.error || "Mesaj güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const handleDeleteMessage = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı kişiden gelen mesajı silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } else {
        alert(data.error || "Mesaj silinemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const filteredMessages = messages
    .filter(m => {
      const name = m.name?.toLowerCase() || "";
      const email = m.email?.toLowerCase() || "";
      const subject = m.subject?.toLowerCase() || "";
      const message = m.message?.toLowerCase() || "";
      const matchesSearch = 
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        subject.includes(searchQuery.toLowerCase()) ||
        message.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      return m.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchFilterBar
        title="Gelen İletişim Mesajları"
        subtitle="Ana sayfa iletişim formundan iletilen veli ve öğrenci danışma mesajları"
        titleIcon={<MessageSquare size={22} color="#C8952A" />}
        searchPlaceholder="İsim, e-posta veya mesaj ara..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterLabel="Durum"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${messages.length})` },
          { value: "UNREAD", label: `🔴 Okunmadı (${messages.filter(m => m.status === "UNREAD").length})` },
          { value: "READ", label: `🔵 Okundu (${messages.filter(m => m.status === "READ").length})` },
          { value: "REPLIED", label: `🟢 Cevaplandı (${messages.filter(m => m.status === "REPLIED").length})` },
        ]}
        sortValue={sortBy}
        onSortChange={(val) => setSortBy(val as any)}
        sortOptions={[
          { value: "newest", label: "En Yeni" },
          { value: "oldest", label: "En Eski" },
          { value: "name_asc", label: "İsim (A → Z)" },
          { value: "name_desc", label: "İsim (Z → A)" },
        ]}
      />

      {/* Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Gönderen</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Konu & Mesaj</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tarih</th>
                <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <MessageSquare size={32} color="#CBD5E1" />
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>Henüz mesaj bulunmuyor.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: msg.status === "UNREAD" ? "rgba(254, 242, 242, 0.3)" : "transparent" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#0F2645" }}>{msg.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {msg.email} {msg.phone ? `• ${msg.phone}` : ""}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", maxWidth: "350px" }}>
                      <div style={{ fontWeight: "700", color: "#0F2645", fontSize: "13px" }}>
                        {msg.subject || "Genel Danışmanlık Talebi"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {msg.message}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge variant={msg.status as any} />
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(msg.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye size={13} />}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === "UNREAD") {
                              handleUpdateStatus(msg.id, "READ");
                            }
                          }}
                        >
                          Oku
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          onClick={() => handleDeleteMessage(msg.id, msg.name)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      <Modal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="İletişim Mesajı Detayı"
        titleIcon={<MessageSquare size={20} color="#C8952A" />}
        footer={
          selectedMessage && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Durum:</span>
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0F2645",
                    backgroundColor: "#F8FAFC",
                    cursor: "pointer"
                  }}
                >
                  <option value="UNREAD">🔴 Okunmadı</option>
                  <option value="READ">🔵 Okundu</option>
                  <option value="REPLIED">🟢 Cevaplandı</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Pont Akademi - ${encodeURIComponent(selectedMessage.subject || "Bilgilendirme")}`}
                  style={{ textDecoration: "none" }}
                  onClick={() => handleUpdateStatus(selectedMessage.id, "REPLIED")}
                >
                  <Button variant="primary" size="sm" icon={<Mail size={14} />}>
                    E-posta ile Yanıtla
                  </Button>
                </a>
                <Button variant="secondary" size="sm" onClick={() => setSelectedMessage(null)}>
                  Kapat
                </Button>
              </div>
            </div>
          )
        }
      >
        {selectedMessage && (
          <div>
            <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Gönderen</span>
                  <strong style={{ color: "#0F2645", fontSize: "15px" }}>{selectedMessage.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Tarih</span>
                  <span style={{ color: "#0F2645", fontSize: "13px", fontWeight: "600" }}>
                    {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>E-Posta</span>
                  <a href={`mailto:${selectedMessage.email}`} style={{ color: "#1D4ED8", fontSize: "13px", fontWeight: "600" }}>
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Telefon</span>
                  <a href={selectedMessage.phone ? `tel:${selectedMessage.phone}` : undefined} style={{ color: "#0F2645", fontSize: "13px", fontWeight: "600" }}>
                    {selectedMessage.phone || "Belirtilmemiş"}
                  </a>
                </div>
              </div>

              {selectedMessage.subject && (
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Konu</span>
                  <strong style={{ color: "#0F2645", fontSize: "14px" }}>{selectedMessage.subject}</strong>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#0F2645", display: "block", marginBottom: "6px" }}>
                Mesaj İçeriği:
              </label>
              <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", padding: "14px", fontSize: "14px", color: "#1E293B", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {selectedMessage.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
