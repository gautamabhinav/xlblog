import React, { useEffect, useRef, useState } from "react";
import { FiEye, FiTrash2, FiUpload, FiClock, FiDownload, FiPlay } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import AiInsights from "./AiInsights";
// import HistoryPanel from "./HistoryPannel";

// import Highcharts from "highcharts";
// import Highcharts3D from "highcharts/highcharts-3d";
// import Exporting from "highcharts/modules/exporting";
// import ExportData from "highcharts/modules/export-data";

// // Initialize modules immediately
// Highcharts3D(Highcharts);
// Exporting(Highcharts);
// ExportData(Highcharts);


import Highcharts from "highcharts";
import * as HC3D from "highcharts/highcharts-3d";
import * as Exporting from "highcharts/modules/exporting";
import * as ExportData from "highcharts/modules/export-data";

// Initialize safely
const hc3dInit = HC3D.default || HC3D;
const exportingInit = Exporting.default || Exporting;
const exportDataInit = ExportData.default || ExportData;

if (typeof hc3dInit === "function") hc3dInit(Highcharts);
if (typeof exportingInit === "function") exportingInit(Highcharts);
if (typeof exportDataInit === "function") exportDataInit(Highcharts);

// import Highcharts from "highcharts/es-modules/masters/highcharts.src.js";
// import Highcharts3D from "highcharts/es-modules/masters/highcharts-3d.src.js";
// import Exporting from "highcharts/es-modules/masters/modules/exporting.src.js";
// import ExportData from "highcharts/es-modules/masters/modules/export-data.src.js";

// Highcharts3D(Highcharts);
// Exporting(Highcharts);
// ExportData(Highcharts);




import {
  uploadExcelFile,
  getExcelFiles,
  deleteExcelFile,
  getExcelFileById,
  clearCurrentFile,
} from "../../Redux/excelSlice";
import { saveAs } from "file-saver";

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// NOTE: do NOT import highcharts-3d at top-level — we load it dynamically below

// Import at top-level (or dynamically like highcharts-3d)
// import Highcharts from "highcharts";
// import Accessibility from "highcharts/modules/accessibility";




export default function ExcelPage() {
  const dispatch = useDispatch();
  const { files, status, error } = useSelector((state) => state.excel);
  const parsedData = useSelector((state) => state.excel.parsedData);
  // const { files = [], currentFile = null, status = "idle" } = useSelector((s) => s.excel || {});


  // const file = e.target.files ?.[0];
  // if(!file) return;

  // setTimeout(async() => {
  //   await dispatch(uploadExcel(file))

  // }, 0)

  // toggle history panel
  // const toggleHistory = () => {
  //   setShowHistory((prev) => !prev);
  // };

  useEffect(() => {
    dispatch(getExcelFiles());
  }, [dispatch]);

  // const handleview = (id) => {
  //   dispatch(getExcelFileById());
  // }

  const historyRef = useRef(null);
  const chartRef = useRef(null);

  // UI state
   const [showHistory, setShowHistory] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]); // [{name, rows}]
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [rows, setRows] = useState([]); // currently active rows (sampled)
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [rowRange, setRowRange] = useState({ start: 0, end: 200 });
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [hc3dReady, setHc3dReady] = useState(false); // dynamic module ready flag
  const [hc3dFailed, setHc3dFailed] = useState(false); // failed to load
  const MAX_SAMPLE = 200; // sample for preview & charts

  // load persisted history on mount
  useEffect(() => {
    dispatch(getExcelFiles());
  }, [dispatch]);

   // toggle history section
  const toggleHistory = () => {
    if (!showHistory) {
      dispatch(getExcelFiles());
    }
    setShowHistory((prev) => !prev);
  };

  // Robust dynamic load/initialize for highcharts-3d
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    (async () => {
      try {
        const hc3dModule = await import("highcharts/highcharts-3d");

        // Determine the initializer function robustly
        let initFn = null;

        if (typeof hc3dModule === "function") {
          initFn = hc3dModule;
        } else if (hc3dModule && typeof hc3dModule.default === "function") {
          initFn = hc3dModule.default;
        } else if (hc3dModule) {
          // fallback: find first function in the module object
          for (const key of Object.keys(hc3dModule)) {
            if (typeof hc3dModule[key] === "function") {
              initFn = hc3dModule[key];
              break;
            }
          }
        }

        if (!initFn) {
          console.error("Cannot find initializer in highcharts-3d module:", hc3dModule);
          if (!cancelled) setHc3dFailed(true);
          return;
        }

        // Initialize Highcharts 3D
        initFn(Highcharts);

        if (!cancelled) {
          setHc3dReady(true);
          console.info("Highcharts 3D initialized successfully");
        }
      } catch (err) {
        console.error("Error loading Highcharts 3D:", err);
        if (!cancelled) setHc3dFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);



  // helper to normalize backend file object into sheets list:
  function normalizeFileIntoSheets(fileObj) {
    if (!fileObj) return [];
    const f = fileObj.file || fileObj;
    if (Array.isArray(f.sheets) && f.sheets.length > 0) {
      return f.sheets.map((s) => ({ name: s.name || "Sheet", rows: Array.isArray(s.rows) ? s.rows.slice(0, MAX_SAMPLE) : [] }));
    }
    if (Array.isArray(f.data)) {
      return [{ name: f.filename || "Sheet1", rows: f.data.slice(0, MAX_SAMPLE) }];
    }
    return [];
  }

  // Called after we fetch a file (preview or analyze)
  function hydrateFromFetchedFile(fileObj) {
    const sheets = normalizeFileIntoSheets(fileObj);
    setAvailableSheets(sheets);
    setSelectedSheetIndex(0);
    const firstRows = (sheets[0] && sheets[0].rows) || [];
    setRows(firstRows);
    const keys = firstRows[0] ? Object.keys(stripFields(firstRows[0])) : [];
    setColumns(keys);
    setSelectedColumns(keys.slice()); // default all
    setXAxis(keys[0] || "");
    setYAxis(keys[1] || keys[0] || "");
  }

  function stripFields(r) {
    return r && r.fields ? r.fields : r;
  }


  const handleUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Run the heavy upload logic asynchronously so the click handler exits fast
    setTimeout(async () => {
      try {
        const action = await dispatch(uploadExcelFile(file));
        const created = action?.payload?.file || action?.payload || action;

        if (created && (created._id || created.id)) {
          const id = created._id || created.id;
          await dispatch(getExcelFileById(id));
          hydrateFromFetchedFile(created);
          setSelectedFileId(id);
          setAnalyzeOpen(true);
          historyRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
          await dispatch(getExcelFiles());
        }
      } catch (err) {
        console.error("Upload failed", err);
        await dispatch(getExcelFiles());
      } finally {
        e.target.value = null;
      }
    }, 0); // 👈 runs on next tick, freeing the click handler immediately
  };

  const refreshFiles = async () => {
    await dispatch(getExcelFiles());
  };

  const handlePreviewFile = async (id) => {
    setAnalyzeOpen(false);
    setSelectedFileId(id);
    const action = await dispatch(getExcelFileById(id));
    const fileObj = action?.payload?.file || action?.payload;
    if (fileObj) hydrateFromFetchedFile(fileObj);
    else if (currentFile) hydrateFromFetchedFile(currentFile);
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyzeFile = async (id) => {
    setSelectedFileId(id);
    const action = await dispatch(getExcelFileById(id));
    const fileObj = action?.payload?.file || action?.payload;
    if (fileObj) hydrateFromFetchedFile(fileObj);
    else if (currentFile) hydrateFromFetchedFile(currentFile);
    setAnalyzeOpen(true);
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this uploaded file?")) return;
    await dispatch(deleteExcelFile(id));
    await refreshFiles();
    if (selectedFileId === id) {
      setSelectedFileId(null);
      setAvailableSheets([]);
      setRows([]);
      setColumns([]);
      setAnalyzeOpen(false);
      dispatch(clearCurrentFile());
    }
  };

  // When user picks another sheet index
  useEffect(() => {
    if (!availableSheets || availableSheets.length === 0) return;
    const s = availableSheets[selectedSheetIndex] || availableSheets[0];
    const sampled = (s.rows || []).slice(rowRange.start, Math.min(rowRange.end, (s.rows || []).length));
    setRows(sampled);
    const keys = sampled[0] ? Object.keys(stripFields(sampled[0])) : [];
    setColumns(keys);
    if (!keys.includes(xAxis)) setXAxis(keys[0] || "");
    if (!keys.includes(yAxis)) setYAxis(keys[1] || keys[0] || "");
    setSelectedColumns(keys.slice());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableSheets, selectedSheetIndex, rowRange.start, rowRange.end]);

  const toggleColumn = (col) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  };

  const getFilteredRows = () => {
    if (!rows || !rows.length) return [];
    const normalized = rows.map(stripFields);
    if (!selectedColumns || selectedColumns.length === 0) return normalized;
    return normalized.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => selectedColumns.includes(k))));
  };

  // Build Chart.js chartData
  const buildChartData = () => {
    const filtered = getFilteredRows();
    if (!filtered.length || !xAxis || !yAxis) return null;

    const labels = filtered.map((r) => String(r[xAxis] ?? ""));
    const yVals = filtered.map((r) => {
      const v = r[yAxis];
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    });

    const palette = [
      "rgba(54, 162, 235, 0.75)",
      "rgba(255, 99, 132, 0.75)",
      "rgba(255, 206, 86, 0.75)",
      "rgba(75, 192, 192, 0.75)",
      "rgba(153, 102, 255, 0.75)",
      "rgba(255, 159, 64, 0.75)",
    ];
    const backgroundColor = labels.map((_, i) => palette[i % palette.length]);

    if (chartType === "pie") {
      const map = new Map();
      labels.forEach((lbl, i) => map.set(lbl, (map.get(lbl) || 0) + yVals[i]));
      return {
        labels: Array.from(map.keys()),
        datasets: [{ data: Array.from(map.values()), backgroundColor: Array.from(map.keys()).map((_, i) => palette[i % palette.length]) }],
      };
    }

    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data: yVals,
          backgroundColor,
          borderColor: "rgba(0,0,0,0.06)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = buildChartData();

  // Build Highcharts 3D options dynamically (inside the component)
  const build3DColumnOptions = () => {
    const filtered = getFilteredRows();
    if (!filtered.length || !xAxis || !yAxis) return null;

    return {
      chart: {
        type: "column",
        options3d: {
          enabled: true,
          alpha: 15,
          beta: 15,
          depth: 50,
          viewDistance: 25,
        },
      },
      title: { text: "3D Column Chart" },
      xAxis: { categories: filtered.map((r) => String(r[xAxis] ?? "")) },
      yAxis: { title: { text: yAxis } },
      plotOptions: { column: { depth: 25 } },
      series: [
        {
          name: yAxis,
          data: filtered.map((r) => Number(r[yAxis]) || 0),
        },
      ],
    };
  };

  

  const downloadChart = () => {
    try {
      if (!chartRef.current) return alert("No chart to download.");

      if (chartType === "3d-column") {
        const hcChart = chartRef.current.chart;
        if (hcChart) {
          if (hc3dReady) {
            if (hcChart.exportChart) {
              hcChart.exportChart({
                type: "image/png",
                filename: selectedFileId || "chart",
              });
            } else {
              alert("Highcharts exporting module not loaded yet.");
            }
          } else if (hc3dFailed) {
            // fallback to Chart.js
            const base64 = chartRef.current.toBase64Image?.();
            if (!base64) return alert("Fallback chart not ready.");
            const a = document.createElement("a");
            a.href = base64;
            a.download = `${selectedFileId || "chart"}-fallback.png`;
            a.click();
          } else {
            alert("3D module is still loading…");
          }
        } else {
          alert("Highcharts chart instance not ready.");
        }
      } else {
        // Chart.js charts
        const base64 = chartRef.current.toBase64Image?.();
        if (!base64) return alert("Chart.js instance not ready for export.");
        const a = document.createElement("a");
        a.href = base64;
        a.download = `${selectedFileId || "chart"}.png`;
        a.click();
      }
    } catch (err) {
      console.error("downloadChart error", err);
      alert("Failed to export chart image.");
    }
  };


  // const downloadChart = () => {
  //   try {
  //     if (!chartRef.current) return alert("No chart to download.");

  //     if (chartType === "3d-column") {
  //       const hcChart = chartRef.current.chart;
  //       if (!hcChart) return alert("3D chart instance not ready.");
  //       if (!hcChart.exportChart) return alert("Highcharts exporting module not loaded yet.");

  //       hcChart.exportChart({
  //         type: "image/png",
  //         filename: selectedFileId || "chart",
  //       });
  //     } else {
  //       // Chart.js fallback
  //       const base64 = chartRef.current.toBase64Image?.();
  //       if (!base64) return alert("Chart.js instance not ready for export.");
  //       const a = document.createElement("a");
  //       a.href = base64;
  //       a.download = `${selectedFileId || "chart"}.png`;
  //       a.click();
  //     }
  //   } catch (err) {
  //     console.error("downloadChart error", err);
  //     alert("Failed to export chart image.");
  //   }
  // };




  // Download raw JSON saved on the server (file object)
  const downloadFileJson = (f) => {
    const blob = new Blob([JSON.stringify(f, null, 2)], { type: "application/json" });
    saveAs(blob, `${f.filename || "excel"}.json`);
  };

  // Table renderer (sticky head, zebra rows)
  const renderPreviewTable = (dataRows) => {
    if (!dataRows || !dataRows.length) return <div className="text-sm text-gray-500">No data to preview.</div>;
    const first = dataRows[0];
    const headers = Object.keys(first);

    return (
      <div className="overflow-x-auto max-h-[420px] border rounded bg-white">
        <table className="min-w-full text-sm table-auto border-collapse">
          <thead className="sticky top-0 bg-gray-900 text-white">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 border text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                {headers.map((h) => (
                  <td key={h} className="px-3 py-2 border text-gray-700">{String(r[h] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const SheetTabs = () => {
    if (!availableSheets || availableSheets.length <= 1) return null;
    return (
      <div className="flex gap-2 flex-wrap mb-3">
        {availableSheets.map((s, idx) => (
          <button
            key={s.name + idx}
            onClick={() => setSelectedSheetIndex(idx)}
            className={`px-3 py-1 rounded ${idx === selectedSheetIndex ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}
          >
            {s.name} ({(s.rows || []).length})
          </button>
        ))}
      </div>
    );
  };

  return (
    <Layout>
       {/* <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📂 Excel Upload History</h1>

      {status.fetchAll === "loading" && <p>Loading history...</p>}
      {status.fetchAll === "failed" && <p className="text-red-500">{error.fetchAll}</p>}

      {files.length === 0 && status.fetchAll === "succeeded" ? (
        <p>No Excel files uploaded yet.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray">
            <tr>
              <th className="p-2 border">File Name</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Uploaded At</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id} className="hover:bg-gray">
                <td className="p-2 border">{file.filename}</td>
                <td className="p-2 border">{(file.size / 1024).toFixed(2)} KB</td>
                <td className="p-2 border">
                  {new Date(file.uploadedAt).toLocaleString()}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleview(file._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div> */}

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Excel Upload → History → Analyze</h1>
              <p className="text-sm text-gray-600 mt-1">Upload .xls/.xlsx/.csv files, preview sheets, choose columns and build charts.</p>
            </div>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                <FiUpload /> Upload
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} className="hidden" />
              </label>

              {/* <button onClick={refreshFiles} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                <FiClock /> Refresh
              </button> */}

              <button onClick={toggleHistory} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                <FiClock /> History
              </button>
            </div>
          </div>

          {/* history list
          <section ref={historyRef} className="grid md:grid-cols-2 gap-4">
            {Array.isArray(files) && files.length > 0 ? (
              files.map((f) => (
                <div key={f._id} className="p-4 bg-white rounded shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{f.filename}</p>
                    <p className="text-xs text-gray-500">
                      {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "N/A"}
                      {f.size ? ` • ${(f.size / 1024).toFixed(2)} KB` : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handlePreviewFile(f._id)} title="Preview" className="p-2 bg-blue-100 rounded text-blue-600">
                      <FiEye />
                    </button>

                    <button onClick={() => handleAnalyzeFile(f._id)} title="Analyze" className="p-2 bg-indigo-100 rounded text-indigo-700 flex items-center">
                      <FiPlay />
                    </button>

                    <button onClick={() => downloadFileJson(f)} title="Download JSON" className="p-2 bg-yellow-100 rounded text-yellow-700">
                      <FiDownload />
                    </button>

                    <button onClick={() => handleDelete(f._id)} title="Delete" className="p-2 bg-red-100 rounded text-red-600">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 bg-white rounded text-center text-gray-500">No uploads yet.</div>
            )}
          </section> */}

          {/* History Panel */}
        {showHistory && (
          <section ref={historyRef} className="grid md:grid-cols-2 gap-4 mb-6">
            {files.length ? files.map((f) => (
              <div key={f._id} className="p-4 bg-white rounded shadow-sm flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{f.filename}</p>
                  <p className="text-xs text-gray-500">
                    {f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "N/A"}{f.size ? ` • ${(f.size / 1024).toFixed(2)} KB` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePreviewFile(f._id)} title="Preview" className="p-2 bg-blue-100 rounded text-blue-600"><FiEye /></button>
                  <button onClick={() => handleAnalyzeFile(f._id)} title="Analyze" className="p-2 bg-indigo-100 rounded text-indigo-700"><FiPlay /></button>
                  <button onClick={() => downloadFileJson(f)} title="Download JSON" className="p-2 bg-yellow-100 rounded text-yellow-700"><FiDownload /></button>
                  <button onClick={() => handleDelete(f._id)} title="Delete" className="p-2 bg-red-100 rounded text-red-600"><FiTrash2 /></button>
                </div>
              </div>
            )) : <div className="col-span-full p-6 bg-white rounded text-center text-gray-500">No uploads yet.</div>}
          </section>
        )}

          {/* preview + builder */}
          <section className="bg-white rounded p-4 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 ">
              <h2 className="text-lg text-black font-medium">{analyzeOpen ? "Chart Builder" : selectedFileId ? "Preview" : "Select a file"}</h2>

              <div className="flex items-center gap-3 text-grey-500">
                {selectedFileId && (
                  <>
                    <label className="text-sm flex items-center gap-2 ">
                      Sheet:
                      <select value={selectedSheetIndex} onChange={(e) => setSelectedSheetIndex(Number(e.target.value))} className="ml-2 border px-2 py-1 rounded">
                        {availableSheets.map((s, idx) => <option key={s.name + idx} value={idx}>{s.name}</option>)}
                      </select>
                    </label>

                    <label className="text-sm flex items-center gap-2 text-black-500">
                      X:
                      <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="ml-2 border px-2 py-1 rounded">
                        <option value="">--</option>
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>

                    <label className="text-sm flex items-center gap-2 text-black-500">
                      Y:
                      <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="ml-2 border px-2 py-1 rounded">
                        <option value="">--</option>
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>

                    <label className="text-sm flex items-center gap-2 text-black-500">
                      Type:
                      <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="ml-2 border px-2 py-1 rounded">
                        <option value="bar">Bar</option>
                        <option value="line">Line</option>
                        <option value="pie">Pie</option>
                        <option value="scatter">Scatter</option>
                        <option value="3d-column">3D column</option>
                      </select>
                    </label>

                    <button onClick={() => setAnalyzeOpen(true)} className="px-3 py-1 bg-indigo-600 text-white rounded">Open Builder</button>
                    <button onClick={downloadChart} className="px-3 py-1 bg-gray-800 text-white rounded">Download Chart</button>
                  </>
                )}
              </div>
            </div>

            {/* sheet tabs */}
            <SheetTabs />

            {analyzeOpen ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3 font-medium text-cyan-500">Columns - pick which ones to include</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {columns.map((c) => (
                      <label key={c} className={`px-2 py-1 rounded border ${selectedColumns.includes(c) ? "bg-indigo-100 text-indigo-700" : "bg-white"}`}>
                        <input type="checkbox" className="mr-2" checked={selectedColumns.includes(c)} onChange={() => toggleColumn(c)} />
                        {c}
                      </label>
                    ))}
                  </div>

                  <div className="mb-3 font-medium text-cyan-500">Row Range (sample)</div>
                  <div className="flex items-center gap-3 mb-4">
                    <input type="number" min="0" value={rowRange.start} onChange={(e) => setRowRange({ ...rowRange, start: Math.max(0, Number(e.target.value)) })} className="w-20 px-2 py-1 border rounded" />
                    <span>to</span>
                    <input type="number" min="1" value={rowRange.end} onChange={(e) => setRowRange({ ...rowRange, end: Math.max(1, Number(e.target.value)) })} className="w-20 px-2 py-1 border rounded" />
                    <button onClick={() => { setRowRange({ start: 0, end: MAX_SAMPLE }); }} className="px-2 py-1 bg-gray-200 rounded">Reset</button>
                  </div>



                  <div className="mb-3 font-medium text-cyan-500">Chart</div>
                  <div className="border rounded p-3 min-h-[320px] flex items-center justify-center">
                    {chartData ? (
                      (() => {
                        switch (chartType) {
                          case "bar":
                            return <Bar ref={chartRef} data={chartData} options={{ responsive: true }} />;

                          case "line":
                            return <Line ref={chartRef} data={chartData} options={{ responsive: true }} />;

                          case "pie":
                            return <Pie ref={chartRef} data={chartData} options={{ responsive: true }} />;

                          case "scatter":
                            return (
                              <Scatter
                                ref={chartRef}
                                data={{
                                  datasets: [
                                    {
                                      label: yAxis,
                                      data: getFilteredRows().map((r) => ({
                                        x: Number(r[xAxis]) || 0,
                                        y: Number(r[yAxis]) || 0,
                                      })),
                                      backgroundColor: "rgba(54,162,235,0.75)",
                                    },
                                  ],
                                }}
                                options={{ responsive: true }}
                              />
                            );

                          case "3d-column":
                            if (hc3dReady) {
                              return (
                                <HighchartsReact
                                  key="hc-3d-ready"
                                  highcharts={Highcharts}
                                  options={{
                                    ...build3DColumnOptions(),
                                    accessibility: { enabled: false }, // remove accessibility warning
                                  }}
                                  ref={chartRef}
                                />
                              );
                            } else if (hc3dFailed) {
                              return (
                                <div className="text-sm text-red-600">
                                  Failed to load Highcharts 3D. Showing fallback 2D bar chart.
                                  <div className="mt-2">
                                    <Bar ref={chartRef} data={chartData} options={{ responsive: true }} />
                                  </div>
                                </div>
                              );
                            } else {
                              return <div className="text-gray-500">Loading 3D module…</div>;
                            }

                          default:
                            return (
                              <div className="text-gray-500">
                                Select X and Y columns to render a chart.
                              </div>
                            );
                        }
                      })()
                    ) : (
                      <div className="text-gray-500">Select X and Y columns to render a chart.</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 font-medium">Preview Table (sample)</div>
                  {renderPreviewTable(getFilteredRows())}
                </div>
              </div>
            ) : (
              <div>
                {selectedFileId ? (
                  <div>
                    <div className="mb-3 font-medium">Preview Table</div>
                    {renderPreviewTable(rows.map(stripFields))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Pick Preview or Analyze for any history item.</div>
                )}
              </div>
            )}
          </section>
        </div>
        <div>
         {/* <AiInsights parsedData={parsedData} /> */}
         <AiInsights parsedData={rows} />

        </div>
      </div>
    </Layout>
  );
}

