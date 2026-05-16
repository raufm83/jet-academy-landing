"use client";

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { MdArrowBack } from "react-icons/md";

export interface BlogCategoryFormInputs {
  name: { az: string; en: string };
  sortOrder?: number;
}

interface BlogCategoryFormProps {
  mode: "create" | "edit";
  onSubmit: (data: BlogCategoryFormInputs) => void | Promise<void>;
  register: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  router: any;
}

export default function BlogCategoryForm({
  mode,
  onSubmit,
  register,
  errors,
  isSubmitting,
  handleSubmit,
  router,
}: BlogCategoryFormProps) {
  return (
    <div className="p-6 min-h-screen w-full">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex gap-4">
          <Button
            variant="flat"
            isIconOnly
            onPress={() => router.back()}
            aria-label="Geri"
          >
            <MdArrowBack size={22} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {mode === "create"
                ? "Yeni bloq kateqoriyası"
                : "Bloq kateqoriyasını redaktə et"}
            </h1>
            <p className="text-small text-gray-600">
              Adlar AZ və EN dildə görünür; sıra blok siyahısındakı ardıcıllıqdır.
            </p>
          </div>
        </div>

        <Card shadow="none" className="border border-divider rounded-xl bg-white">
          <CardBody className="p-8 gap-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Ad (AZ)"
                variant="bordered"
                {...register("name.az", { required: true })}
                errorMessage={(errors?.name?.az as any)?.message}
                isInvalid={!!errors?.name?.az}
              />
              <Input
                label="Name (EN)"
                variant="bordered"
                {...register("name.en", { required: true })}
                errorMessage={(errors?.name?.en as any)?.message}
                isInvalid={!!errors?.name?.en}
              />
              <Input
                type="number"
                label="Sıra nömrəsi"
                variant="bordered"
                description="Kiçik dəyərlər öndə çıxır. Boş buraxılırsa avtomatik sıra təyin olunur."
                {...register("sortOrder", {
                  valueAsNumber: true,
                  setValueAs: (v: unknown) =>
                    v === "" || v === undefined || Number.isNaN(Number(v))
                      ? undefined
                      : Number(v),
                })}
              />

              <div className="flex gap-4 justify-end">
                <Button variant="flat" onPress={() => router.back()} type="button">
                  Ləğv et
                </Button>
                <Button
                  className="bg-jsyellow text-white"
                  type="submit"
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {mode === "create" ? "Yarat" : "Yadda saxla"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
