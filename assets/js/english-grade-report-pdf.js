(function () {
  const LOGO_SRC = "../../assets/img/itm-logo-oficial.jpg";
  const BRAND_TEXT = "ITM Plurilingüe Presupuesto Participativo";

  function escapePdfText(value) {
    return String(value == null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E\n]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function pdfTextWidth(value, fontSize) {
    return String(value == null ? "" : value).length * fontSize * 0.48;
  }

  function wrapPdfCell(value, fontSize, maxWidth, maxLines) {
    const words = String(value == null ? "" : value).split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach(function (word) {
      const candidate = current ? current + " " + word : word;
      if (pdfTextWidth(candidate, fontSize) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    if (!lines.length) lines.push("");
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, Math.max(1, lines[maxLines - 1].length - 3)) + "...";
    }
    return lines;
  }

  function arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = "";
    for (let i = 0; i < bytes.length; i += 1) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  function loadImageAsJpegHex(source, maxWidth) {
    return new Promise(function (resolve) {
      if (typeof Image === "undefined") {
        resolve(null);
        return;
      }
      const image = new Image();
      image.onload = function () {
        try {
          const scale = Math.min(1, maxWidth / image.naturalWidth);
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob(function (blob) {
            if (!blob) {
              resolve(null);
              return;
            }
            const reader = new FileReader();
            reader.onload = function () {
              resolve({ width: width, height: height, hex: arrayBufferToHex(reader.result) });
            };
            reader.onerror = function () { resolve(null); };
            reader.readAsArrayBuffer(blob);
          }, "image/jpeg", 0.92);
        } catch (error) {
          resolve(null);
        }
      };
      image.onerror = function () { resolve(null); };
      try {
        image.src = new URL(source, document.baseURI).href;
      } catch (error) {
        image.src = source;
      }
    });
  }

  function gradeSummary(student, evaluations) {
    let completedWeight = 0;
    let earned = 0;
    const grades = student.grades || {};
    evaluations.forEach(function (evaluation) {
      const grade = grades[evaluation.id];
      if (typeof grade !== "number") return;
      completedWeight += evaluation.weight;
      earned += grade * evaluation.weight;
    });
    return {
      completedWeight: completedWeight,
      average: completedWeight ? earned / completedWeight : null,
      weightedTotal: earned / 100
    };
  }

  function levelLabel(level) {
    const text = String(level || "Level").trim();
    const match = text.match(/(?:nivel|level|course)\s*(\d+)/i);
    if (match) return "Level " + match[1];
    return text || "Level";
  }

  function levelSlug(level) {
    return levelLabel(level).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "level";
  }

  function levels(payload) {
    const seen = {};
    return payload.students.reduce(function (items, student) {
      const level = student.level || "Level";
      if (!seen[level]) {
        seen[level] = true;
        items.push(level);
      }
      return items;
    }, []).sort(function (a, b) {
      return levelLabel(a).localeCompare(levelLabel(b), "en", { numeric: true });
    });
  }

  function gradeValue(student, evaluation) {
    const grades = student.grades || {};
    return typeof grades[evaluation.id] === "number" ? grades[evaluation.id].toFixed(1) : "Pending";
  }

  function reportColumns(payload, audience, options) {
    const detailLabel = options && options.directorDetail === "level" ? "Level" : "Contact";
    const base = audience === "directors"
      ? [
          { label: "Student ID", width: 1.05 },
          { label: "Full name", width: 1.65 },
          { label: detailLabel, width: 1.05 },
          { label: "Current average", width: 1.15 },
          { label: "Evaluated weight", width: 1.05 }
        ]
      : [
          { label: "Student ID", width: 1.1 },
          { label: "Current average", width: 1.15 },
          { label: "Evaluated weight", width: 1.05 }
        ];
    return base.concat(payload.evaluations.map(function (evaluation) {
      return { label: evaluation.title + " " + evaluation.weight + "%", width: 1.05 };
    })).concat([{ label: "Weighted total", width: 1 }]);
  }

  function reportRows(payload, audience, options) {
    return payload.students.map(function (student) {
      const summary = gradeSummary(student, payload.evaluations);
      const directorDetail = options && options.directorDetail === "level" ? levelLabel(student.level) : student.contact || "";
      const base = audience === "directors"
        ? [
            student.id || "",
            student.fullName || "",
            directorDetail,
            summary.average == null ? "Pending" : summary.average.toFixed(2),
            summary.completedWeight + "%"
          ]
        : [
            student.id || "",
            summary.average == null ? "Pending" : summary.average.toFixed(2),
            summary.completedWeight + "%"
          ];
      return base.concat(payload.evaluations.map(function (evaluation) {
        return gradeValue(student, evaluation);
      })).concat([summary.completedWeight ? summary.weightedTotal.toFixed(2) : "Pending"]);
    });
  }

  function addImageObject(addObject, image) {
    if (!image || !image.hex) return null;
    const stream = image.hex + ">";
    return addObject("<< /Type /XObject /Subtype /Image /Width " + image.width + " /Height " + image.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream");
  }

  function buildPdf(title, columns, rows, logo) {
    const pageWidth = 842;
    const pageHeight = 595;
    const margin = 24;
    const headerHeight = 68;
    const footerHeight = 22;
    const titleY = pageHeight - margin - headerHeight - 18;
    const tableTop = titleY - 30;
    const tableBottom = margin + footerHeight + 16;
    const rowFont = 6.4;
    const headerFont = 6.2;
    const objects = [];
    const pageIds = [];

    function addObject(body) {
      objects.push(body);
      return objects.length;
    }

    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const logoId = addImageObject(addObject, logo);
    const usableWidth = pageWidth - margin * 2;
    const totalUnits = columns.reduce(function (sum, column) { return sum + column.width; }, 0);
    const widths = columns.map(function (column) { return usableWidth * column.width / totalUnits; });

    let pages = [];
    let currentRows = [];
    let y = tableTop - 24;
    rows.forEach(function (row) {
      const lineCounts = row.map(function (cell, index) {
        return wrapPdfCell(cell, rowFont, widths[index] - 6, index === 1 ? 3 : 2).length;
      });
      const rowHeight = Math.max(18, Math.max.apply(null, lineCounts) * 8 + 8);
      if (y - rowHeight < tableBottom && currentRows.length) {
        pages.push(currentRows);
        currentRows = [];
        y = tableTop - 24;
      }
      currentRows.push({ cells: row, height: rowHeight });
      y -= rowHeight;
    });
    if (currentRows.length) pages.push(currentRows);
    if (!pages.length) pages = [[]];

    pages.forEach(function (pageRows, pageIndex) {
      const streamLines = [];
      const xObjectNames = [];
      streamLines.push("0.00 0.25 0.40 rg " + margin + " " + (pageHeight - margin - headerHeight) + " " + usableWidth + " " + headerHeight + " re f");
      streamLines.push("0.94 0.98 1 rg " + (margin + 1) + " " + (pageHeight - margin - headerHeight + 1) + " " + (usableWidth - 2) + " " + (headerHeight - 2) + " re f");
      if (logoId && logo) {
        const logoHeight = 42;
        const logoWidth = Math.min(116, logoHeight * logo.width / logo.height);
        streamLines.push("q " + logoWidth.toFixed(2) + " 0 0 " + logoHeight + " " + (margin + 14) + " " + (pageHeight - margin - 54) + " cm /Logo Do Q");
        xObjectNames.push("/Logo " + logoId + " 0 R");
      } else {
        streamLines.push("BT /F2 18 Tf 0.00 0.25 0.40 rg " + (margin + 18) + " " + (pageHeight - margin - 43) + " Td (ITM) Tj ET");
      }
      streamLines.push("BT /F2 18 Tf 0.00 0.25 0.40 rg " + (margin + 150) + " " + (pageHeight - margin - 34) + " Td (" + escapePdfText(BRAND_TEXT) + ") Tj ET");
      streamLines.push("BT /F1 9 Tf 0.19 0.25 0.31 rg " + (margin + 150) + " " + (pageHeight - margin - 50) + " Td (Grade report) Tj ET");
      streamLines.push("BT /F2 14 Tf 0.00 0.22 0.36 rg " + margin + " " + titleY + " Td (" + escapePdfText(title) + ") Tj ET");
      streamLines.push("BT /F1 7 Tf 0.36 0.40 0.46 rg " + margin + " " + (titleY - 13) + " Td (" + escapePdfText("Generated " + new Date().toLocaleDateString("en-US")) + ") Tj ET");

      let x = margin;
      const headerCellY = tableTop;
      streamLines.push("0.00 0.25 0.40 rg " + margin + " " + (headerCellY - 20) + " " + usableWidth + " 20 re f");
      columns.forEach(function (column, index) {
        wrapPdfCell(column.label, headerFont, widths[index] - 6, 2).forEach(function (line, lineIndex) {
          streamLines.push("BT /F2 " + headerFont + " Tf 1 1 1 rg " + (x + 3).toFixed(2) + " " + (headerCellY - 8 - lineIndex * 7).toFixed(2) + " Td (" + escapePdfText(line) + ") Tj ET");
        });
        x += widths[index];
      });

      let rowY = tableTop - 20;
      pageRows.forEach(function (row, rowIndex) {
        const fill = rowIndex % 2 === 0 ? "0.97 0.99 1 rg" : "1 1 1 rg";
        streamLines.push(fill + " " + margin + " " + (rowY - row.height).toFixed(2) + " " + usableWidth + " " + row.height.toFixed(2) + " re f");
        x = margin;
        row.cells.forEach(function (cell, cellIndex) {
          const lines = wrapPdfCell(cell, rowFont, widths[cellIndex] - 6, cellIndex === 1 ? 3 : 2);
          lines.forEach(function (line, lineIndex) {
            streamLines.push("BT /F1 " + rowFont + " Tf 0.12 0.16 0.23 rg " + (x + 3).toFixed(2) + " " + (rowY - 10 - lineIndex * 7.5).toFixed(2) + " Td (" + escapePdfText(line) + ") Tj ET");
          });
          streamLines.push("0.86 0.90 0.95 RG 0.35 w " + x.toFixed(2) + " " + (rowY - row.height).toFixed(2) + " m " + x.toFixed(2) + " " + rowY.toFixed(2) + " l S");
          x += widths[cellIndex];
        });
        streamLines.push("0.86 0.90 0.95 RG 0.35 w " + margin + " " + (rowY - row.height).toFixed(2) + " m " + (margin + usableWidth) + " " + (rowY - row.height).toFixed(2) + " l S");
        rowY -= row.height;
      });
      streamLines.push("BT /F1 7 Tf 0.36 0.40 0.46 rg " + margin + " " + (margin + 4) + " Td (" + escapePdfText(BRAND_TEXT) + ") Tj ET");
      streamLines.push("BT /F1 7 Tf 0.36 0.40 0.46 rg " + (pageWidth - margin - 48) + " " + (margin + 4) + " Td (" + escapePdfText("Page " + (pageIndex + 1) + "/" + pages.length) + ") Tj ET");

      const stream = streamLines.join("\n");
      const contentId = addObject("<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream");
      const xObject = xObjectNames.length ? " /XObject << " + xObjectNames.join(" ") + " >>" : "";
      const pageId = addObject("<< /Type /Page /Parent 0 0 R /MediaBox [0 0 " + pageWidth + " " + pageHeight + "] /Resources << /Font << /F1 " + fontId + " 0 R /F2 " + boldFontId + " 0 R >>" + xObject + " >> /Contents " + contentId + " 0 R >>");
      pageIds.push(pageId);
    });

    const pagesId = addObject("<< /Type /Pages /Kids [" + pageIds.map(function (id) { return id + " 0 R"; }).join(" ") + "] /Count " + pageIds.length + " >>");
    pageIds.forEach(function (pageId) {
      objects[pageId - 1] = objects[pageId - 1].replace("/Parent 0 0 R", "/Parent " + pagesId + " 0 R");
    });
    const catalogId = addObject("<< /Type /Catalog /Pages " + pagesId + " 0 R >>");

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach(function (body, index) {
      offsets.push(pdf.length);
      pdf += index + 1 + " 0 obj\n" + body + "\nendobj\n";
    });
    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root " + catalogId + " 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    return pdf;
  }

  function savePdf(pdf, filename) {
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function scopedPayload(payload, level) {
    return Object.assign({}, payload, {
      students: payload.students.filter(function (student) {
        return student.level === level;
      })
    });
  }

  async function download(payload, audience, level, courseTitle, filenamePrefix, options) {
    const filtered = scopedPayload(payload, level);
    const logo = await loadImageAsJpegHex(LOGO_SRC, 640);
    const audienceLabel = audience === "directors" ? "Directors" : "Students";
    const title = courseTitle + " - " + audienceLabel + " - " + levelLabel(level);
    const pdf = buildPdf(title, reportColumns(filtered, audience, options), reportRows(filtered, audience, options), logo);
    savePdf(pdf, filenamePrefix + "-" + audience + "-" + levelSlug(level) + ".pdf");
  }

  window.JaraEnglishGradeReports = {
    levels: levels,
    levelLabel: levelLabel,
    download: download
  };
})();
