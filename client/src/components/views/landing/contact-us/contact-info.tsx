"use client";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { MdPhone, MdMail, MdLocationOn } from "react-icons/md";
import { FaWhatsapp, FaClock } from "react-icons/fa";

interface ContactInfoProps {
  phone: string;
  email: string;
  address: string;
  address2: string;
  whatsapp: string;
  workingHours?: {
    az: {
      weekdays: string;
      sunday: string;
    };
    en: {
      weekdays: string;
      sunday: string;
    };
  };
}

export default function ContactInfo({
  phone,
  email,
  address,
  address2,
  whatsapp,
  workingHours,
}: ContactInfoProps) {

  const locale = useLocale() as "az" | "en";

  const contactItems = [
    {
      icon: <MdPhone className="w-6 h-6 text-jsyellow" />,
      title: null, // No title for phone
      value: phone,
      link: `tel:${phone}`,
    },
    {
      icon: <FaWhatsapp className="w-6 h-6 text-jsyellow" />,
      title: null, // No title for whatsapp
      value: whatsapp,
      link: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
    },
    {
      icon: <MdMail className="w-6 h-6 text-jsyellow" />,
      title: null, // No title for email
      value: email,
      link: `mailto:${email}`,
    },
    {
      icon: <MdLocationOn className="w-6 h-6 text-jsyellow" />,
      title: null, // No title for address
      value: address || address2,
      link: `https://maps.google.com/?q=${encodeURIComponent(
        address || address2 || "JET Academy"
      )}`,
    },
  ];

  // Add working hours if available
  const workingHoursItem = workingHours ? {
    icon: <FaClock className="w-6 h-6 text-jsyellow" />,
    title: null,
    value: (
      <div className="flex flex-col gap-1">
        <span>{workingHours[locale].weekdays}</span>
        <span>{workingHours[locale].sunday}</span>
      </div>
    ),
    link: null,
  } : null;

  return (
    <div className="grid grid-cols-1 gap-6">
      {contactItems.map((item, index) => {
        const Component = item.link ? motion.a : motion.div;
        const linkProps = item.link ? {
          href: item.link,
          target: "_blank",
          rel: "noopener noreferrer",
        } : {};

        return (
          <Component
            key={index}
            {...linkProps}
            className="border border-jsyellow rounded-[32px] px-6 py-4 bg-[#fef7eb] hover:scale-[1.02] transition-transform"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <div>
                {item.title && (
                  <h3 className="font-semibold text-xl text-jsblack mb-1">
                    {item.title}
                  </h3>
                )}
                {typeof item.value === "string" ? (
                  <p className="text-gray-600">{item.value}</p>
                ) : (
                  <div className="text-gray-600">{item.value}</div>
                )}
              </div>
            </div>
          </Component>
        );
      })}
      {workingHoursItem && (
        <motion.div
          className="border border-jsyellow rounded-[32px] px-6 py-4 bg-[#fef7eb]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: contactItems.length * 0.1 }}
        >
          <div className="flex items-center gap-4">
            {workingHoursItem.icon}
            <div>
              {typeof workingHoursItem.value === "string" ? (
                <p className="text-gray-600">{workingHoursItem.value}</p>
              ) : (
                <div className="text-gray-600">{workingHoursItem.value}</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
