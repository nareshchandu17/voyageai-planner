import jsPDF from "jspdf";

interface BeforeTripData {
  destinationOverview?: {
    country: string;
    language: string;
    timezone: string;
    currency: string;
    bestMonths: string[];
    topAttractions: string[];
    cultureTips: string[];
  };
  weatherForecast?: {
    overview: string;
    avgTemp: string;
    rainChance: string;
    bestTimeToExplore: string;
    dailyForecast?: Array<{ date: string; condition: string; tempHigh: string; tempLow: string; advisory?: string }>;
  };
  budgetEstimation?: {
    flights: { estimate: number; notes: string };
    hotels: { estimate: number; notes: string };
    food: { estimate: number; notes: string };
    transport: { estimate: number; notes: string };
    activities: { estimate: number; notes: string };
    total: number;
  };
  packingChecklist?: {
    clothing: string[];
    documents: string[];
    electronics: string[];
    essentials: string[];
  };
  visaAndDocuments?: {
    visaRequired: boolean;
    visaType: string;
    passportValidity: string;
    entryRules: string[];
    additionalDocs: string[];
  };
  itineraryPreview?: Array<{ day: number; highlights: string[] }>;
}

interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  weather?: { condition: string; temp: string };
  activities: Array<{ time: string; title: string; location: string; duration: string; cost: number }>;
  meals?: {
    breakfast?: { name: string; cuisine: string; priceRange: string };
    lunch?: { name: string; cuisine: string; priceRange: string };
    dinner?: { name: string; cuisine: string; priceRange: string };
  };
  travelTip?: string;
}

interface ExportData {
  title: string;
  summary: string;
  totalBudgetEstimate?: number;
  currency?: string;
  beforeTrip?: BeforeTripData;
  days: ItineraryDay[];
  warnings?: string[];
}

const COLORS = {
  primary: [14, 116, 144] as [number, number, number],     // teal
  accent: [234, 88, 12] as [number, number, number],       // orange
  dark: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
};

export function exportBeforeTripPDF(data: ExportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = W - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > H - 20) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionTitle = (icon: string, title: string) => {
    checkPage(16);
    y += 6;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${icon}  ${title}`, margin + 4, y + 7);
    y += 14;
    doc.setTextColor(...COLORS.dark);
  };

  const label = (text: string, x: number, yy: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(text, x, yy);
  };

  const value = (text: string, x: number, yy: number) => {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(text, x, yy);
  };

  // ========== HEADER ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, W, 45, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.title || "Travel Preparation Guide", margin, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.summary || "", contentW);
  doc.text(summaryLines.slice(0, 2), margin, 28);
  if (data.totalBudgetEstimate) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Estimated Budget: $${data.totalBudgetEstimate.toLocaleString()} ${data.currency || "USD"}`, margin, 40);
  }
  y = 52;

  // ========== WARNINGS ==========
  if (data.warnings?.length) {
    data.warnings.forEach((w) => {
      checkPage(12);
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
      doc.setTextColor(...COLORS.danger);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`⚠  ${w}`, margin + 3, y + 5.5);
      y += 10;
    });
    doc.setTextColor(...COLORS.dark);
  }

  const bt = data.beforeTrip;

  // ========== DESTINATION OVERVIEW ==========
  if (bt?.destinationOverview) {
    const ov = bt.destinationOverview;
    sectionTitle("🌍", "Destination Overview");

    // Info grid
    const colW = contentW / 4;
    [
      ["Country", ov.country],
      ["Language", ov.language],
      ["Timezone", ov.timezone],
      ["Currency", ov.currency],
    ].forEach(([l, v], i) => {
      const x = margin + i * colW;
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(x, y, colW - 2, 14, 1, 1, "F");
      label(l, x + 3, y + 5);
      value(v, x + 3, y + 11);
    });
    y += 18;

    // Top Attractions
    if (ov.topAttractions?.length) {
      checkPage(10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text("Top Attractions:", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      ov.topAttractions.forEach((a) => {
        checkPage(6);
        doc.text(`  •  ${a}`, margin + 2, y);
        y += 5;
      });
      y += 2;
    }

    // Culture Tips
    if (ov.cultureTips?.length) {
      checkPage(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Cultural Tips:", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      ov.cultureTips.forEach((t) => {
        checkPage(8);
        const lines = doc.splitTextToSize(`•  ${t}`, contentW - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5;
      });
      y += 2;
    }

    if (ov.bestMonths?.length) {
      checkPage(8);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(`Best months to visit: ${ov.bestMonths.join(", ")}`, margin, y);
      y += 6;
    }
  }

  // ========== WEATHER FORECAST ==========
  if (bt?.weatherForecast) {
    const wf = bt.weatherForecast;
    sectionTitle("🌤", "Weather Forecast");
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    const overviewLines = doc.splitTextToSize(wf.overview, contentW);
    doc.text(overviewLines, margin, y);
    y += overviewLines.length * 4.5 + 3;

    const wColW = contentW / 3;
    [
      ["Avg Temperature", wf.avgTemp],
      ["Rain Chance", wf.rainChance],
      ["Best Time to Explore", wf.bestTimeToExplore],
    ].forEach(([l, v], i) => {
      const x = margin + i * wColW;
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(x, y, wColW - 2, 14, 1, 1, "F");
      label(l, x + 3, y + 5);
      value(v, x + 3, y + 11);
    });
    y += 18;

    if (wf.dailyForecast?.length) {
      checkPage(16);
      const fColW = Math.min(contentW / wf.dailyForecast.length, 22);
      wf.dailyForecast.forEach((f, i) => {
        const x = margin + i * fColW;
        doc.setFillColor(...COLORS.light);
        doc.roundedRect(x, y, fColW - 1, 16, 1, 1, "F");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.muted);
        doc.text(new Date(f.date).toLocaleDateString("en", { weekday: "short" }), x + 2, y + 5);
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.dark);
        doc.setFont("helvetica", "bold");
        doc.text(f.tempHigh, x + 2, y + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(f.condition, x + 2, y + 14);
      });
      y += 20;
    }
  }

  // ========== BUDGET ESTIMATION ==========
  if (bt?.budgetEstimation) {
    const be = bt.budgetEstimation;
    sectionTitle("💰", "Budget Estimation");

    (["flights", "hotels", "food", "transport", "activities"] as const).forEach((key) => {
      const item = be[key];
      if (!item) return;
      checkPage(12);
      const pct = Math.round((item.estimate / (be.total || 1)) * 100);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}`, margin, y + 4);
      doc.text(`$${item.estimate.toLocaleString()}`, W - margin, y + 4, { align: "right" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.text(item.notes, margin, y + 9);

      // Progress bar
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(margin, y + 11, contentW, 3, 1, 1, "F");
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y + 11, contentW * (pct / 100), 3, 1, 1, "F");
      y += 18;
    });

    checkPage(10);
    doc.setDrawColor(...COLORS.light);
    doc.line(margin, y, W - margin, y);
    y += 3;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("Total Estimated:", margin, y + 5);
    doc.text(`$${be.total.toLocaleString()}`, W - margin, y + 5, { align: "right" });
    y += 12;
    doc.setTextColor(...COLORS.dark);
  }

  // ========== PACKING CHECKLIST ==========
  if (bt?.packingChecklist) {
    sectionTitle("🧳", "Packing Checklist");
    const pc = bt.packingChecklist;
    const catLabels: Record<string, string> = { clothing: "👕 Clothing", documents: "📄 Documents", electronics: "📱 Electronics", essentials: "❤️ Essentials" };

    const cats = (["clothing", "documents", "electronics", "essentials"] as const).filter((c) => pc[c]?.length);
    const colW = contentW / 2;

    cats.forEach((cat, ci) => {
      const col = ci % 2;
      if (col === 0) checkPage(6 + (pc[cat]?.length || 0) * 5);
      const x = margin + col * colW;
      const startY = col === 0 ? y : y;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(catLabels[cat], x, startY);
      let itemY = startY + 5;

      pc[cat]?.forEach((item) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.muted);
        doc.text(`☐  ${item}`, x + 2, itemY);
        itemY += 4.5;
      });

      if (col === 1 || ci === cats.length - 1) {
        y = Math.max(y + 5 + (pc[cats[ci - (col === 1 ? 1 : 0)]]?.length || 0) * 4.5, itemY) + 4;
      }
    });
  }

  // ========== VISA & DOCUMENTS ==========
  if (bt?.visaAndDocuments) {
    const vd = bt.visaAndDocuments;
    sectionTitle("📋", "Visa & Documents");

    const vColW = contentW / 3;
    [
      ["Visa Required", vd.visaRequired ? "Yes" : "No"],
      ["Visa Type", vd.visaType],
      ["Passport Validity", vd.passportValidity],
    ].forEach(([l, v], i) => {
      const x = margin + i * vColW;
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(x, y, vColW - 2, 14, 1, 1, "F");
      label(l, x + 3, y + 5);
      value(String(v), x + 3, y + 11);
    });
    y += 18;

    if (vd.entryRules?.length) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Entry Rules:", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      vd.entryRules.forEach((rule) => {
        checkPage(8);
        const lines = doc.splitTextToSize(`⚠  ${rule}`, contentW - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5;
      });
    }
    y += 4;
  }

  // ========== ITINERARY PREVIEW ==========
  if (bt?.itineraryPreview?.length) {
    sectionTitle("📅", "Itinerary Preview");

    bt.itineraryPreview.forEach((day) => {
      checkPage(10);
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y, 16, 8, 1, 1, "F");
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}`, margin + 2, y + 5.5);

      doc.setTextColor(...COLORS.dark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const highlights = day.highlights.join("  •  ");
      const hLines = doc.splitTextToSize(highlights, contentW - 22);
      doc.text(hLines, margin + 20, y + 5.5);
      y += Math.max(10, hLines.length * 4.5 + 4);
    });
  }

  // ========== DAY-BY-DAY ITINERARY ==========
  if (data.days?.length) {
    sectionTitle("🗓", "Detailed Day-by-Day Itinerary");

    data.days.forEach((day) => {
      checkPage(20);
      // Day header
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y, contentW, 9, 1, 1, "F");
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}: ${day.theme}`, margin + 4, y + 6);
      if (day.weather) {
        doc.setFontSize(8);
        doc.text(`${day.weather.condition} ${day.weather.temp}`, W - margin - 4, y + 6, { align: "right" });
      }
      y += 12;

      // Activities
      day.activities?.forEach((act) => {
        checkPage(14);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.dark);
        doc.text(act.time, margin, y);
        doc.text(act.title, margin + 16, y);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.muted);
        doc.text(`📍 ${act.location}  •  ⏱ ${act.duration}${act.cost > 0 ? `  •  💲$${act.cost}` : ""}`, margin + 16, y + 4.5);
        y += 10;
      });

      // Meals
      if (day.meals) {
        checkPage(12);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.accent);
        doc.text("Dining:", margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.dark);
        (["breakfast", "lunch", "dinner"] as const).forEach((meal) => {
          const m = day.meals?.[meal];
          if (!m) return;
          doc.text(`${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${m.name} (${m.cuisine}, ${m.priceRange})`, margin + 4, y);
          y += 4.5;
        });
        y += 2;
      }

      if (day.travelTip) {
        checkPage(8);
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.primary);
        doc.setFont("helvetica", "italic");
        const tipLines = doc.splitTextToSize(`💡 ${day.travelTip}`, contentW - 4);
        doc.text(tipLines, margin + 2, y);
        y += tipLines.length * 4 + 4;
      }

      y += 4;
    });
  }

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Generated by VoyageAI  •  Page ${i} of ${totalPages}`, W / 2, H - 8, { align: "center" });
  }

  const filename = `${(data.title || "trip-guide").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;
  doc.save(filename);
}
