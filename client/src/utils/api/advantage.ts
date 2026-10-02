const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Advantage {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  order: number;
  isActive: boolean;
}

export async function fetchAdvantages(locale: string = "az"): Promise<{ title: string, description: string, position: "fixed" | "sticky", top: string }[]> {
  try {
    const res = await fetch(`${PUBLIC_API_BASE}/advantage`, {
      next: { revalidate: 60, tags: ["advantage"] }
    });
    
    if (!res.ok) {
      return [];
    }

    const data: Advantage[] = await res.json();
    const activeData = data.filter(a => a.isActive).sort((a, b) => a.order - b.order);
    
    return activeData.map((adv, index) => {
      const topOffset = 25 + (index * 75);
      return {
        title: adv.title[locale] || adv.title["az"] || "",
        description: adv.description[locale] || adv.description["az"] || "",
        position: index === activeData.length - 1 ? "sticky" : "fixed",
        top: topOffset.toString(),
      };
    });
  } catch (error) {
    console.error("Error fetching advantages:", error);
    return [];
  }
}
