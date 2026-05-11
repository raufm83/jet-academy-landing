import { Button, Input, Card, Textarea } from "@nextui-org/react";
import { MdPerson, MdDescription } from "react-icons/md";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

export default function TeamMemberForm({
  mode,
  onSubmit,
  register,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  setValue,
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
            <motion.h1
              className="text-2xl font-bold text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {mode === "create"
                ? "Yeni Komanda Üzvü Əlavə Et"
                : "Komanda Üzvünə Düzəliş Et"}
            </motion.h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                label="Ad AZ"
                variant="bordered"
                startContent={<MdPerson className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("name.az", {
                  required: "Ad (AZ) tələb olunur",
                  minLength: {
                    value: 2,
                    message: "Ad (AZ) ən azı 2 simvol olmalıdır",
                  },
                })}
                isInvalid={!!errors.name?.az}
                errorMessage={errors.name?.az?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Ad EN"
                variant="bordered"
                startContent={<MdPerson className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("name.en", {
                  required: false,
                  minLength: {
                    value: 2,
                    message: "Ad (EN) ən azı 2 simvol olmalıdır",
                  },
                })}
                isInvalid={!!errors.name?.en}
                errorMessage={errors.name?.en?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Soyad AZ"
                variant="bordered"
                startContent={<MdPerson className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("surname.az", {
                  required: "Soyad (AZ) tələb olunur",
                  minLength: {
                    value: 2,
                    message: "Soyad (AZ) ən azı 2 simvol olmalıdır",
                  },
                })}
                isInvalid={!!errors.surname?.az}
                errorMessage={errors.surname?.az?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Soyad EN"
                variant="bordered"
                startContent={<MdPerson className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("surname.en", {
                  required: false,
                  minLength: {
                    value: 2,
                    message: "Soyad (EN) ən azı 2 simvol olmalıdır",
                  },
                })}
                isInvalid={!!errors.surname?.en}
                errorMessage={errors.surname?.en?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Şəkil</label>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  {...register("image", {
                    required: mode === "create" ? "Şəkil tələb olunur" : false,
                  })}
                />
                {errors.image && (
                  <p className="text-tiny text-danger">
                    {errors.image.message}
                  </p>
                )}
                {previewUrl && (
                  <div className="relative w-32 h-32 mx-auto mt-2 rounded-full overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Şəkil Alt Mətni (AZ)"
                variant="bordered"
                startContent={<MdDescription className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("imageAlt.az")}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="Image Alt Text (EN)"
                variant="bordered"
                startContent={<MdDescription className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("imageAlt.en")}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Textarea
                label="Bio[AZ]"
                variant="bordered"
                startContent={<MdDescription className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("bio.az", {
                  required: "Bio tələb olunur",
                })}
                isInvalid={!!errors.bio}
                errorMessage={errors.bio?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                label="Bio[EN]"
                variant="bordered"
                startContent={<MdDescription className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("bio.en", {
                  required: "Bio tələb olunur",
                })}
                isInvalid={!!errors.bio}
                errorMessage={errors.bio?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
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
                    ? "Əlavə edilir..."
                    : "Əlavə et"
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
