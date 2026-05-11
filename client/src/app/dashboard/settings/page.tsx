"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Input, Button } from "@nextui-org/react";
import {
  MdLock,
  MdPerson,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { useSession } from "next-auth/react";
import api from "@/utils/api/axios";
import { toast } from "sonner";
import { Role } from "@/types/enums";

interface AuthorSocialLinks {
  authorName?: { az?: string; en?: string };
  authorSurname?: { az?: string; en?: string };
  authorPosition?: { az?: string; en?: string };
}

interface MeResponse {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  profile?: {
    profession?: string | null;
    socialLinks?: AuthorSocialLinks | null;
    avatarUrl?: string | null;
  };
}

function splitName(fullName: string | null): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first, lastName: rest.join(" ") };
}

function generateRandomPassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [surnameEn, setSurnameEn] = useState("");
  const [positionEn, setPositionEn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const isAuthor = (session?.user as any)?.role === Role.AUTHOR;

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await api.get<MeResponse>("/auth/me");
        const sl = data.profile?.socialLinks;
        if (data.role === Role.AUTHOR && sl) {
          setFirstName(sl.authorName?.az ?? splitName(data.name).firstName);
          setLastName(sl.authorSurname?.az ?? splitName(data.name).lastName);
          setPosition(data.profile?.profession ?? "");
          setNameEn(sl.authorName?.en ?? "");
          setSurnameEn(sl.authorSurname?.en ?? "");
          setPositionEn(sl.authorPosition?.en ?? "");
        } else {
          const { firstName: f, lastName: l } = splitName(data.name);
          setFirstName(f);
          setLastName(l);
        }
        setEmail(data.email ?? "");

        const avatar = data.profile?.avatarUrl;
        if (avatar) {
          if (avatar.startsWith("http")) {
            setAvatarPreview(avatar);
          } else {
            // Same as team/gallery: API returns "profile/filename.webp", CDN at /uploads/
            const cdn = (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
            const path = avatar.includes("/") ? avatar : `profile/${avatar}`;
            setAvatarPreview(cdn ? `${cdn}/${path}` : `/${path}`);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Profil məlumatları yüklənə bilmədi");
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      if (avatarFile) {
        const formData = new FormData();
        if (fullName) formData.append("name", firstName.trim());
        if (isAuthor) {
          formData.append("surname", lastName.trim());
          formData.append("position", position.trim());
          formData.append("nameEn", nameEn.trim());
          formData.append("surnameEn", surnameEn.trim());
          formData.append("positionEn", positionEn.trim());
        }
        if (password) formData.append("password", password);
        formData.append("avatar", avatarFile);

        await api.patch("/auth/me", formData);
      } else {
        const payload: {
          name?: string;
          surname?: string;
          position?: string;
          nameEn?: string;
          surnameEn?: string;
          positionEn?: string;
          password?: string;
        } = {};
        if (fullName) payload.name = firstName.trim();
        if (isAuthor) {
          payload.surname = lastName.trim();
          payload.position = position.trim();
          payload.nameEn = nameEn.trim();
          payload.surnameEn = surnameEn.trim();
          payload.positionEn = positionEn.trim();
        }
        if (password) payload.password = password;

        await api.patch("/auth/me", payload);
      }
      toast.success("Məlumatlar uğurla yeniləndi");
      setPassword("");
      setAvatarFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Məlumatları yeniləmək mümkün olmadı");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!password) {
      toast.error("Kopyalamaq üçün şifrə yoxdur");
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Şifrə kopyalandı");
    } catch {
      toast.error("Şifrəni kopyalamaq alınmadı");
    }
  };

  const handleGeneratePassword = () => {
    const pwd = generateRandomPassword();
    setPassword(pwd);
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-6 min-h-screen w-full flex items-center justify-center">
        <p>Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-xl p-6 bg-white shadow-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Hesab Parametrləri
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt=""
                  className="w-full h-full object-cover object-center"
                  onError={() => setAvatarPreview(null)}
                />
              ) : (
                <MdPerson className="text-gray-400" size={40} />
              )}
            </div>
            <div>
              <Button
                size="sm"
                type="button"
                className="bg-jsyellow text-white"
                onClick={() => avatarInputRef.current?.click()}
              >
                Şəkli dəyiş
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    const url = URL.createObjectURL(file);
                    setAvatarPreview(url);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Input
              type="text"
              label="Ad"
              variant="bordered"
              startContent={<MdPerson className="text-gray-400" />}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              type="text"
              label="Soyad"
              variant="bordered"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {isAuthor && (
            <>
              <Input
                type="text"
                label="Vəzifə (AZ)"
                variant="bordered"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <div className="text-sm font-medium text-gray-600 pt-2">
                İngilis dilində (blog səhifəsində göstəriləcək)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Ad (EN)"
                  variant="bordered"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
                <Input
                  type="text"
                  label="Soyad (EN)"
                  variant="bordered"
                  value={surnameEn}
                  onChange={(e) => setSurnameEn(e.target.value)}
                />
              </div>
              <Input
                type="text"
                label="Position (EN)"
                variant="bordered"
                value={positionEn}
                onChange={(e) => setPositionEn(e.target.value)}
              />
            </>
          )}

          <Input
            type="email"
            label="E-poçt"
            variant="bordered"
            value={email}
            isDisabled
          />

          <Input
            type={showPassword ? "text" : "password"}
            label="Yeni şifrə (istəyə bağlı)"
            variant="bordered"
            startContent={<MdLock className="text-gray-400" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endContent={
              <div className="flex items-center gap-1 mr-1">
                <Button
                  size="sm"
                  className="bg-jsyellow text-white"
                  type="button"
                  onClick={handleGeneratePassword}
                >
                  Generate
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  type="button"
                  onClick={handleCopyPassword}
                  aria-label="Şifrəni kopyala"
                >
                  <MdContentCopy className="text-gray-600" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                >
                  {showPassword ? (
                    <MdVisibilityOff className="text-gray-600" />
                  ) : (
                    <MdVisibility className="text-gray-600" />
                  )}
                </Button>
              </div>
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              className="bg-jsyellow text-white"
              isLoading={saving}
              disabled={saving}
            >
              Yadda saxla
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

