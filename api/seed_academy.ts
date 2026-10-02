import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&directConnection=true'
    }
  }
});

async function main() {
  const advantages = [
    {
      order: 1,
      title: { az: 'Müasir və Daim Yenilənən Tədris Proqramı', ru: 'Современная и постоянно обновляемая учебная программа' },
      description: {
        az: 'Proqramlarımız əmək bazarının tələblərinə uyğun olaraq mütəmadi yenilənir və ən son texnologiyaları əhatə edir.',
        ru: 'Наши программы регулярно обновляются в соответствии с требованиями рынка труда и охватывают новейшие технологии.',
      },
    },
    {
      order: 2,
      title: { az: 'Real Layihələr və Gündəlik Tapşırıqlar', ru: 'Реальные проекты и ежедневные задания' },
      description: {
        az: 'Hər bir kursumuz praktiki tapşırıqlar və real iş mühitində tələb olunan və ya işlənən layihələrlə zənginləşdirilmişdir.',
        ru: 'Каждый наш курс обогащен практическими заданиями и проектами, которые требуются в реальной рабочей среде.',
      },
    },
    {
      order: 3,
      title: { az: 'Yüksək Təcrübəli və Professional Təlimçilər', ru: 'Высококвалифицированные профессиональные тренеры' },
      description: {
        az: 'Sektor təcrübəsinə malik mütəxəssislər biliklərini paylaşaraq tələbələrin karyera inkişafına dəstək olurlar.',
        ru: 'Специалисты с опытом работы в отрасли делятся своими знаниями, поддерживая карьерный рост студентов.',
      },
    },
    {
      order: 4,
      title: { az: 'Rahat Ofis Mühiti və Müasir Avadanlıqlarla Təminat', ru: 'Комфортная офисная среда и современное оборудование' },
      description: {
        az: 'Tədris prosesinin maksimal dərəcədə rahat və effektiv olması üçün mərkəzimiz hər cür texniki vasitə və şəraitlə təmin olunub.',
        ru: 'Для того чтобы процесс обучения был максимально комфортным и эффективным, наш центр обеспечен всеми техническими средствами и условиями.',
      },
    },
    {
      order: 5,
      title: { az: 'Beynəlxalq Sertifikat (Diploma) əldə etmək imkanı', ru: 'Возможность получения международного сертификата (Диплом)' },
      description: {
        az: 'Təlimlərimizi uğurla başa vuran məzunlarımıza qlobal səviyyədə tanınan beynəlxalq sertifikatlar təqdim edirik.',
        ru: 'Нашим выпускникам, успешно завершившим обучение, мы предоставляем сертификаты, признанные на глобальном уровне.',
      },
    },
    {
      order: 6,
      title: { az: 'Vakansiyalar ilə təmin olunma', ru: 'Обеспечение вакансиями' },
      description: {
        az: 'Özünü tədris dövründə doğruldan tələbələrə vakansiyalar təklif edir, təcrübə və karyeralarına birbaşa dəstək oluruq.',
        ru: 'Мы предлагаем вакансии студентам, проявившим себя во время обучения, оказывая прямую поддержку их опыту и карьере.',
      },
    },
  ];

  for (const adv of advantages) {
    await prisma.advantage.create({
      data: {
        title: { set: { az: adv.title.az, en: '' } },
        description: { set: { az: adv.description.az, en: '' } },
        order: adv.order,
      } as any,
    });
  }
  console.log('Seeded academy advantages');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
