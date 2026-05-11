"use client";
import api from "@/utils/api/axios";
import { SocialLinks } from "@/types/contact";
import { Button, Card, Input } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { MdAccessTime, MdLocationOn, MdMail, MdPhone } from "react-icons/md";
import { toast } from "sonner";

/** API-dan gələn phone/whatsapp Json ola bilər (obyekt/rəqəm); form üçün həmişə string et */
function toPhoneString(value: unknown): string {
  let s = "";
  if (value == null) return "";
  if (typeof value === "string") s = value.trim();
  else if (typeof value === "number") s = String(value);
  else if (typeof value === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    return toPhoneString(v.az ?? v.en ?? v.value ?? "");
  } else return "";
  return formatPhone(s);
}

/** +994501234567 -> +994 50 123 45 67 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  const m = digits.match(/^(\+994|0)(50|51|55|70|77|99|10)(\d{3})(\d{2})(\d{2})$/);
  if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
  return raw;
}

interface ContactFormInputs {
  id?: string;
  email: string;
  address: {
    az: string;
    en: string;
  };
  address2: {
    az: string;
    en: string;
  };
  whatsapp: string;
  phone: string;
  workingHours: {
    az: {
      weekdays: string;
      sunday: string;
    };
    en: {
      weekdays: string;
      sunday: string;
    };
  };
  socialLinks?: SocialLinks;
}

export default function EditContactPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contactId, setContactId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInputs>();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data } = await api.get("/contact");
        const contactData = Array.isArray(data) ? data[0] : data;
        setContactId(contactData.id);
        reset({
          ...contactData,
          phone: toPhoneString(contactData.phone),
          whatsapp: toPhoneString(contactData.whatsapp),
          socialLinks: contactData.socialLinks ?? {},
        });
      } catch (error) {
        console.error("Error fetching contact info:", error);
        toast.error("Əlaqə məlumatları yüklənmədi");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, [reset, router]);

  const onSubmit = async (data: ContactFormInputs) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      socialLinks: rest.socialLinks && Object.keys(rest.socialLinks).length > 0 ? rest.socialLinks : undefined,
    };
    if (!contactId) {
      toast.error("Əlaqə məlumatı tapılmadı. Səhifəni yeniləyin.");
      return;
    }
    try {
      const response = await api.patch("/contact/" + contactId, payload);

      if (response.status === 200) {
        toast.success("Əlaqə məlumatları yeniləndi");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen w-full flex items-center justify-center">
        <p>Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full max-w-2xl p-6 bg-white shadow-lg mx-auto">
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <MdLocationOn size={48} className="text-jsyellow" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Əlaqə Məlumatlarını Yenilə
            </motion.h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                label="E-poçt"
                variant="bordered"
                startContent={<MdMail className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("email", {
                  required: "E-poçt tələb olunur",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Yanlış e-poçt ünvanı",
                  },
                })}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Ünvan 1 (AZ)"
                variant="bordered"
                startContent={<MdLocationOn className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("address.az", { required: "Ünvan tələb olunur" })}
                isInvalid={!!errors.address?.az}
                errorMessage={errors.address?.az?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Address 1 (EN)"
                variant="bordered"
                startContent={<MdLocationOn className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("address.en", { required: "Address required" })}
                isInvalid={!!errors.address?.en}
                errorMessage={errors.address?.en?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Ünvan 2 (AZ)"
                variant="bordered"
                startContent={<MdLocationOn className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("address2.az", { required: "Ünvan tələb olunur" })}
                isInvalid={!!errors.address2?.az}
                errorMessage={errors.address2?.az?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Address 2 (EN)"
                variant="bordered"
                startContent={<MdLocationOn className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("address2.en", { required: "Address required" })}
                isInvalid={!!errors.address2?.en}
                errorMessage={errors.address2?.en?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="tel"
                label="WhatsApp"
                variant="bordered"
                startContent={<FaWhatsapp className="text-gray-400" />}
                isDisabled={isSubmitting}
                placeholder="+994 50 123 45 67"
                {...register("whatsapp", {
                  required: "WhatsApp nömrəsi tələb olunur",
                  pattern: {
                    value: /^(\+994|0)\s?(50|51|55|70|77|99|10)\s?\d{3}\s?\d{2}\s?\d{2}$/,
                    message: "Format: +994 50 123 45 67",
                  },
                })}
                isInvalid={!!errors.whatsapp}
                errorMessage={errors.whatsapp?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="tel"
                label="Telefon"
                variant="bordered"
                startContent={<MdPhone className="text-gray-400" />}
                isDisabled={isSubmitting}
                placeholder="+994 50 123 45 67"
                {...register("phone", {
                  required: "Telefon nömrəsi tələb olunur",
                  pattern: {
                    value: /^(\+994|0)\s?(50|51|55|70|77|99|10)\s?\d{3}\s?\d{2}\s?\d{2}$/,
                    message: "Format: +994 50 123 45 67",
                  },
                })}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="İş saatları - Həftəiçi (AZ)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("workingHours.az.weekdays", {
                  required: "İş saatları tələb olunur",
                })}
                isInvalid={!!errors.workingHours?.az?.weekdays}
                errorMessage={errors.workingHours?.az?.weekdays?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Working Hours - Weekdays (EN)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("workingHours.en.weekdays", {
                  required: "Рабочие часы обязательны",
                })}
                isInvalid={!!errors.workingHours?.en?.weekdays}
                errorMessage={errors.workingHours?.en?.weekdays?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="İş saatları - Bazar (AZ)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("workingHours.az.sunday", {
                  required: "İş saatları tələb olunur",
                })}
                isInvalid={!!errors.workingHours?.az?.sunday}
                errorMessage={errors.workingHours?.az?.sunday?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Working hours - Sunday (EN)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("workingHours.en.sunday", {
                  required: "Рабочие часы обязательны",
                })}
                isInvalid={!!errors.workingHours?.en?.sunday}
                errorMessage={errors.workingHours?.en?.sunday?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                  ],
                }}
              />
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Sosial media linkləri</h3>
              <p className="text-sm text-gray-500 mb-4">Saytın footerində görünəcək. Boş buraxılan linklər göstərilməyəcək.</p>
              <div className="space-y-4">
                {[
                  { key: "facebook" as const, label: "Facebook", icon: FaFacebook },
                  { key: "instagram" as const, label: "Instagram", icon: FaInstagram },
                  { key: "youtube" as const, label: "YouTube", icon: FaYoutube },
                  { key: "tiktok" as const, label: "TikTok", icon: FaTiktok },
                  { key: "linkedin" as const, label: "LinkedIn", icon: FaLinkedinIn },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-2">
                    <Input
                      type="url"
                      label={label}
                      placeholder={`https://${key}.com/...`}
                      variant="bordered"
                      startContent={<Icon className="text-gray-400" />}
                      isDisabled={isSubmitting}
                      {...register(`socialLinks.${key}`)}
                      classNames={{
                        input: "bg-transparent",
                        inputWrapper: [
                          "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                        ],
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => router.back()}
                variant="light"
                className="text-gray-600"
                size="lg"
              >
                Ləğv et
              </Button>
              <Button
                type="submit"
                className="bg-jsyellow text-white hover:bg-jsyellow/90 disabled:opacity-50"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Yenilənir..." : "Yenilə"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
