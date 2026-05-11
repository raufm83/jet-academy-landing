import { Role } from "@/types/enums";
import { Button, Card, Input, Select, SelectItem } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Controller } from "react-hook-form";
import {
  MdLock,
  MdMail,
  MdPerson,
  MdSupervisedUserCircle,
  MdContentCopy,
  MdVisibility,
  MdVisibilityOff,
  MdCamera,
  MdWork,
} from "react-icons/md";
import { useState, useRef } from "react";

interface UsersFormProps {
  mode: "create" | "edit";
  onSubmit: (data: any) => Promise<void>;
  register: any;
  control: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  router: any;
  showPasswordField?: boolean;
  isAuthor?: boolean;
  watch?: any;
  setValue?: any;
}

export default function UsersForm({
  mode,
  onSubmit,
  register,
  control,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  showPasswordField = true,
  isAuthor = false,
  watch,
  setValue,
}: UsersFormProps) {
  const roleOptions = [
    { key: Role.USER, value: Role.USER, label: "İstifadəçi" },
    { key: Role.STAFF, value: Role.STAFF, label: "İşçi" },
    { key: Role.AUTHOR, value: Role.AUTHOR, label: "Author" },
    {
      key: Role.CONTENTMANAGER,
      value: Role.CONTENTMANAGER,
      label: "Kontent-Menecer",
    },
    {
      key: Role.CRMOPERATOR,
      value: Role.CRMOPERATOR,
      label: "CRM Operator",
    },
    {
      key: Role.HRMANAGER,
      value: Role.HRMANAGER,
      label: "HR Manager",
    },
    {
      key: Role.COORDINATOR,
      value: Role.COORDINATOR,
      label: "Koordinator",
    },
    { key: Role.ADMIN, value: Role.ADMIN, label: "Admin" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const passwordValue: string =
    (typeof watch === "function" ? watch("password") : "") || "";

  const generateRandomPassword = (length = 12): string => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      result += chars[idx];
    }
    return result;
  };

  const handleGeneratePassword = () => {
    if (!setValue) return;
    const pwd = generateRandomPassword();
    setValue("password", pwd, { shouldValidate: true });
  };

  const handleCopyPassword = async () => {
    if (!passwordValue) return;
    try {
      await navigator.clipboard.writeText(passwordValue);
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 min-h-screen w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full max-w-xl p-6 bg-white shadow-lg mx-auto">
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <MdSupervisedUserCircle size={48} className="text-jsyellow" />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {mode === "create"
                ? "Yeni İstifadəçi Yarat"
                : "İstifadəçi Məlumatlarını Yenilə"}
            </motion.h1>
            {mode === "create" && (
              <motion.p
                className="text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                İstifadəçi məlumatlarını daxil edin
              </motion.p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isAuthor ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Ad (AZ)"
                    variant="bordered"
                    startContent={<MdPerson className="text-gray-400" />}
                    isDisabled={isSubmitting}
                    {...register("name", {
                      required: "Ad tələb olunur",
                      minLength: {
                        value: 2,
                        message: "Ad ən azı 2 simvol olmalıdır",
                      },
                    })}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                      ],
                    }}
                  />
                  <Input
                    type="text"
                    label="Ad (EN)"
                    variant="bordered"
                    startContent={<MdPerson className="text-gray-400" />}
                    isDisabled={isSubmitting}
                    {...register("nameEn")}
                    placeholder="E.g.: Name"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                      ],
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="Soyad (AZ)"
                    variant="bordered"
                    isDisabled={isSubmitting}
                    {...register("surname", {
                      required: "Soyad tələb olunur",
                      minLength: {
                        value: 2,
                        message: "Soyad ən azı 2 simvol olmalıdır",
                      },
                    })}
                    isInvalid={!!errors.surname}
                    errorMessage={errors.surname?.message}
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                      ],
                    }}
                  />
                  <Input
                    type="text"
                    label="Soyad (EN)"
                    variant="bordered"
                    isDisabled={isSubmitting}
                    {...register("surnameEn")}
                    placeholder="E.g.: Surname"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                      ],
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  label="Ad"
                  variant="bordered"
                  startContent={<MdPerson className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  {...register("name", {
                    required: "Ad tələb olunur",
                    minLength: {
                      value: 2,
                      message: "Ad ən azı 2 simvol olmalıdır",
                    },
                  })}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: [
                      "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                    ],
                  }}
                />
              </div>
            )}

            {isAuthor && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MdWork className="text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      İxtisas (bloq səhifəsində göstərilir) - hər iki dildə
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="İxtisas (AZ)"
                      variant="bordered"
                      placeholder="Məs: Bloq müəllifi, Jurnalist"
                      isDisabled={isSubmitting}
                      {...register("position", {
                        required: "İxtisas tələb olunur",
                        minLength: {
                          value: 2,
                          message: "İxtisas ən azı 2 simvol olmalıdır",
                        },
                      })}
                      isInvalid={!!errors.position}
                      errorMessage={errors.position?.message}
                      classNames={{
                        input: "bg-transparent",
                        inputWrapper: [
                          "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                        ],
                      }}
                    />
                    <Input
                      type="text"
                      label="İxtisas (EN)"
                      variant="bordered"
                      placeholder="E.g.: Blog Author, Journalist"
                      isDisabled={isSubmitting}
                      {...register("positionEn")}
                      classNames={{
                        input: "bg-transparent",
                        inputWrapper: [
                          "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                        ],
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MdCamera className="text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">
                      Profil şəkli
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-jsyellow/30 bg-gray-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarPreview}
                          alt="Önizləmə"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && setValue) {
                            setValue("avatar", file);
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setAvatarPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setValue("avatar", undefined);
                            setAvatarPreview(null);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="bordered"
                        className="border-2 border-jsyellow text-jsyellow hover:bg-jsyellow/10"
                        startContent={<MdCamera />}
                        onPress={() => avatarInputRef.current?.click()}
                        isDisabled={isSubmitting}
                      >
                        {avatarPreview ? "Şəkli dəyiş" : "Şəkil yüklə"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

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

            {showPasswordField && (
              <div className="space-y-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordValue}
                  label={
                    mode === "create" ? "Şifrə" : "Yeni Şifrə (İstəyə bağlı)"
                  }
                  variant="bordered"
                  startContent={<MdLock className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  {...register("password", {
                    required: mode === "create" ? "Şifrə tələb olunur" : false,
                    minLength: {
                      value: 6,
                      message: "Şifrə ən azı 6 simvol olmalıdır",
                    },
                  })}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  endContent={
                    <div className="flex items-center gap-1 mr-1">
                      {setValue && (
                        <Button
                          size="sm"
                          className="bg-jsyellow text-white"
                          type="button"
                          onClick={handleGeneratePassword}
                        >
                          Random Şifrə
                        </Button>
                      )}
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
                        aria-label={
                          showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"
                        }
                      >
                        {showPassword ? (
                          <MdVisibilityOff className="text-gray-600" />
                        ) : (
                          <MdVisibility className="text-gray-600" />
                        )}
                      </Button>
                    </div>
                  }
                  description={
                    mode === "create"
                      ? "Min 8 simvol, 1 böyük hərf, 1 kiçik hərf, 1 rəqəm, 1 xüsusi simvol"
                      : undefined
                  }
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: [
                      "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                    ],
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Rol"
                    selectedKeys={[field.value]}
                    onChange={(e) => field.onChange(e.target.value)}
                    variant="bordered"
                    classNames={{
                      trigger:
                        "bg-white border-2 hover:border-jsyellow focus:border-jsyellow",
                    }}
                  >
                    {roleOptions.map((role) => (
                      <SelectItem key={role.key} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
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
                {mode === "create"
                  ? isSubmitting
                    ? "Yaradılır..."
                    : "Yarat"
                  : isSubmitting
                  ? "Yenilənir..."
                  : "Yenilə"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
