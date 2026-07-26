"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiUpload, ApiRequestError } from "../../../lib/apiClient";
import { isPushSupported, getExistingPushSubscription, subscribeToPush, unsubscribeFromPush } from "../../../lib/push";
import { TopNav } from "../../../components/ui/TopNav";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { ArrowRightIcon, CameraIcon } from "../../../components/ui/icons";
import type { Profile } from "../../../types";

type NotifState = "loading" | "unsupported" | "blocked" | "off" | "on";

export default function PerfilPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifState, setNotifState] = useState<NotifState>("loading");
  const [notifError, setNotifError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    void (async () => {
      if (!isPushSupported()) {
        setNotifState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setNotifState("blocked");
        return;
      }
      const subscription = await getExistingPushSubscription();
      setNotifState(subscription ? "on" : "off");
    })();
  }, []);

  async function handleToggleNotifications() {
    setNotifError(null);
    try {
      if (notifState === "on") {
        await unsubscribeFromPush();
        setNotifState("off");
      } else {
        await subscribeToPush();
        setNotifState("on");
      }
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Não foi possível atualizar as notificações");
    }
  }

  const notifLabel: Record<NotifState, string> = {
    loading: "Notificações",
    unsupported: "Notificações indisponíveis neste navegador",
    blocked: "Notificações bloqueadas — ative nas configurações do navegador",
    off: "Ativar notificações",
    on: "Desativar notificações",
  };

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.set("avatar", file);
      await apiUpload<Profile>("/auth/me/avatar", form, { method: "PATCH" });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Falha ao atualizar a foto de perfil");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <TopNav title="Perfil" backHref="/" />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0 24px" }}>
          <label style={{ position: "relative", width: 96, height: 96, cursor: uploading ? "default" : "pointer" }}>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              style={{ display: "none" }}
              onChange={(e) => {
                void handleFileChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Avatar initials={profile?.initials ?? "?"} src={previewUrl ?? profile?.avatarUrl} size={96} />
            <div className="avatar-edit-badge">
              <CameraIcon size={14} />
            </div>
          </label>
          {uploading && <span className="text-muted" style={{ fontSize: 12 }}>Enviando foto...</span>}
          {error && <span style={{ fontSize: 12, color: "var(--color-accent)" }}>{error}</span>}
          <h3 style={{ margin: "8px 0 0" }}>{profile?.name ?? "Você"}</h3>
          <div className="text-muted" style={{ fontSize: 13 }}>{profile?.email}</div>
        </div>
        <div className="hr" style={{ margin: "0 0 16px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button variant="secondary" block disabled>Editar perfil</Button>
          <Button
            variant="secondary"
            block
            disabled={notifState === "loading" || notifState === "unsupported" || notifState === "blocked"}
            onClick={() => void handleToggleNotifications()}
          >
            {notifLabel[notifState]}
          </Button>
          {notifError && <span style={{ fontSize: 12, color: "var(--color-accent)" }}>{notifError}</span>}
          <Button variant="secondary" block disabled>Ajuda e suporte</Button>
          <Button variant="secondary" block onClick={() => void signOut()} style={{ color: "var(--color-accent-700)" }}>
            <ArrowRightIcon size={16} />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
