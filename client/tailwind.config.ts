import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";

type ThemeGetter = (path: string, defaultValue?: any) => string | number | undefined;
const primaryColor = "#1560bd";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        jsyellow: primaryColor,
        jsblue: primaryColor,
        jsblack: "#1C1C1C",
      },
      boxShadow: {
        jsshadow: "0px 18px 18px rgba(140, 140, 140, 0.09)",
      },
      dropShadow: {
        jsshadow: ["0 18px 18px rgba(140, 140, 140, 0.09)"],
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          md: "2rem",
          lg: "2.5rem",
          xl: "3rem",
          "2xl": "4rem",
          "3xl": "6rem",
          "4xl": "8rem",
        },
        screens: {
          sm: "100%",
          md: "100%",
          lg: "1240px",
          xl: "1440px",
          "2xl": "1720px",  
          "3xl": "2100px",   
          "4xl": "2560px",   
          "5xl": "3200px",  
        },
      },

      maxWidth: {
        "3xl": "1920px",
        "4xl": "2560px",
        "5xl": "3200px",
      },

      typography: (theme: ThemeGetter) => ({
        DEFAULT: {
          css: {
            fontSize: theme("fontSize.base"),
            lineHeight: "1.75",
            "@screen xl": {
              fontSize: theme("fontSize.lg"),
            },
            "@screen 2xl": {
              fontSize: theme("fontSize.xl"),
            },
            "@screen 4xl": {
              fontSize: theme("fontSize.2xl"),
            },
            // Heading-lər em əsaslı olaraq böyük ekranlarda page h1-dən böyük olurdu;
            // rem ilə sabitlənir ki, prose bazası artsa belə heading ölçüsü nəzarətdə qalsın.
            h1: {
              fontSize: "1.65rem",
              lineHeight: "1.2",
              fontWeight: "700",
              marginTop: "1.4em",
              marginBottom: "0.5em",
            },
            h2: {
              fontSize: "1.4rem",
              lineHeight: "1.25",
              fontWeight: "700",
              marginTop: "1.3em",
              marginBottom: "0.4em",
            },
            h3: {
              fontSize: "1.2rem",
              lineHeight: "1.3",
              fontWeight: "600",
              marginTop: "1.1em",
              marginBottom: "0.35em",
            },
            h4: {
              fontSize: "1.05rem",
              lineHeight: "1.4",
              fontWeight: "600",
              marginTop: "1em",
              marginBottom: "0.3em",
            },
            h5: {
              fontSize: "1rem",
              lineHeight: "1.5",
              fontWeight: "600",
              marginTop: "0.9em",
              marginBottom: "0.25em",
            },
            h6: {
              fontSize: "0.9rem",
              lineHeight: "1.5",
              fontWeight: "600",
              marginTop: "0.8em",
              marginBottom: "0.2em",
            },
          },
        },
      }),

      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(1rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      scale: {
        "102": "1.02",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: primaryColor,
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: primaryColor,
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
    typography(),
  ],
};

export default config;
