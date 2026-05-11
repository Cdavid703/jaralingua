(function () {
  function uniqueNames(values) {
    const seen = new Set();
    const names = [];

    values.forEach(function (value) {
      const name = String(value || "").replace(/\s+/g, " ").trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      names.push(name);
    });

    return names;
  }

  function extractNamesFromRows(rows) {
    const headerWords = new Set([
      "name",
      "names",
      "student",
      "students",
      "first name",
      "last name",
      "nombre",
      "nombres",
      "apellido",
      "apellidos",
      "estudiante",
      "estudiantes",
      "lista",
      "list"
    ]);
    const names = [];

    rows.forEach(function (row) {
      const cleanCells = row
        .map(function (cell) {
          return cell === undefined || cell === null ? "" : String(cell).trim();
        })
        .filter(function (value) {
          const lower = value.toLowerCase();
          return value && !/^\d+$/.test(value) && !headerWords.has(lower) && value.indexOf("@") === -1;
        });

      if (cleanCells.length === 1) {
        names.push(cleanCells[0]);
      } else if (cleanCells.length > 1) {
        names.push(cleanCells.slice(0, 3).join(" "));
      }
    });

    return uniqueNames(names);
  }

  function csvRows(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map(function (line) {
        return line.split(/\t|,|;/).map(function (cell) {
          return cell.replace(/^"|"$/g, "").trim();
        });
      })
      .filter(function (row) {
        return row.some(Boolean);
      });
  }

  function readUInt16(view, offset) {
    return view.getUint16(offset, true);
  }

  function readUInt32(view, offset) {
    return view.getUint32(offset, true);
  }

  function textDecoder(bytes) {
    return new TextDecoder("utf-8").decode(bytes);
  }

  async function inflateRaw(bytes) {
    if (!window.DecompressionStream) {
      throw new Error("xlsx_unsupported");
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function unzipEntries(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let endOffset = -1;

    for (let index = bytes.length - 22; index >= 0; index -= 1) {
      if (readUInt32(view, index) === 0x06054b50) {
        endOffset = index;
        break;
      }
    }

    if (endOffset < 0) throw new Error("invalid_xlsx");

    const entryCount = readUInt16(view, endOffset + 10);
    let centralOffset = readUInt32(view, endOffset + 16);
    const entries = {};

    for (let i = 0; i < entryCount; i += 1) {
      if (readUInt32(view, centralOffset) !== 0x02014b50) break;

      const method = readUInt16(view, centralOffset + 10);
      const compressedSize = readUInt32(view, centralOffset + 20);
      const nameLength = readUInt16(view, centralOffset + 28);
      const extraLength = readUInt16(view, centralOffset + 30);
      const commentLength = readUInt16(view, centralOffset + 32);
      const localOffset = readUInt32(view, centralOffset + 42);
      const name = textDecoder(bytes.slice(centralOffset + 46, centralOffset + 46 + nameLength));

      const localNameLength = readUInt16(view, localOffset + 26);
      const localExtraLength = readUInt16(view, localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);

      if (method === 0) {
        entries[name] = compressed;
      } else if (method === 8) {
        entries[name] = await inflateRaw(compressed);
      }

      centralOffset += 46 + nameLength + extraLength + commentLength;
    }

    return entries;
  }

  function xmlDoc(text) {
    return new DOMParser().parseFromString(text, "application/xml");
  }

  function sharedStrings(entries) {
    const bytes = entries["xl/sharedStrings.xml"];
    if (!bytes) return [];

    return Array.from(xmlDoc(textDecoder(bytes)).getElementsByTagName("si")).map(function (item) {
      return Array.from(item.getElementsByTagName("t")).map(function (node) {
        return node.textContent || "";
      }).join("");
    });
  }

  async function xlsxRows(buffer) {
    const entries = await unzipEntries(buffer);
    const sheetName = Object.keys(entries).find(function (name) {
      return /^xl\/worksheets\/sheet\d+\.xml$/.test(name);
    });
    if (!sheetName) throw new Error("invalid_xlsx");

    const strings = sharedStrings(entries);
    const sheet = xmlDoc(textDecoder(entries[sheetName]));

    return Array.from(sheet.getElementsByTagName("row")).map(function (row) {
      return Array.from(row.getElementsByTagName("c")).map(function (cell) {
        const type = cell.getAttribute("t");
        const valueNode = cell.getElementsByTagName("v")[0];
        const inlineNode = cell.getElementsByTagName("t")[0];
        const value = valueNode ? valueNode.textContent : "";
        if (type === "s") return strings[Number(value)] || "";
        if (type === "inlineStr") return inlineNode ? inlineNode.textContent || "" : "";
        return value || "";
      });
    });
  }

  async function importFile(file) {
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    if (extension === "csv" || extension === "txt" || extension === "tsv") {
      return extractNamesFromRows(csvRows(await file.text()));
    }
    if (extension === "xlsx") {
      return extractNamesFromRows(await xlsxRows(await file.arrayBuffer()));
    }
    throw new Error("unsupported_file");
  }

  function setup(options) {
    const fileInput = document.getElementById(options.fileInputId);
    const textArea = document.getElementById(options.textAreaId);
    const status = options.statusId ? document.getElementById(options.statusId) : null;
    if (!fileInput || !textArea) return;

    fileInput.addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      try {
        if (status) status.textContent = "Reading file...";
        const names = await importFile(file);
        if (!names.length) {
          throw new Error("no_names");
        }
        textArea.value = names.join("\n");
        if (status) status.textContent = names.length + " names imported.";
        if (typeof options.onNamesLoaded === "function") {
          options.onNamesLoaded(names);
        }
      } catch (error) {
        if (status) {
          status.textContent = "No names were imported. Use .xlsx or .csv with names in the first columns.";
        }
        alert("No names were imported. Use .xlsx or .csv with names in the first columns.");
      } finally {
        event.target.value = "";
      }
    });
  }

  window.JaraLinguaRosterImport = {
    setup: setup,
    importFile: importFile,
    extractNamesFromRows: extractNamesFromRows
  };
})();
