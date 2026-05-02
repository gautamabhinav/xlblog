import React, { useEffect, useRef, useState } from "react";
import Layout from "../../Layout/Layout";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  RadialLinearScale,
} from "chart.js";
import { Pie, Bar, Line, Doughnut, Radar } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { getExcelFiles, getExcelFileById } from "../../Redux/excelSlice";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  RadialLinearScale
);

const ChartViewer = ({ embed = false, selectedFileId: propSelectedFileId = "" }) => {
  const dispatch = useDispatch();
  const { files, currentFile } = useSelector((state) => state.excel);

  const [selectedFileId, setSelectedFileId] = useState(propSelectedFileId || "");
  // if parent passes selectedFileId (embed usage), keep local state in sync
  useEffect(() => {
    if (propSelectedFileId) setSelectedFileId(propSelectedFileId);
  }, [propSelectedFileId]);
  const [chartType, setChartType] = useState("bar");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const chartRef = useRef(null);
  const rows = currentFile?.data || currentFile?.parsedData || [];

  useEffect(() => {
    // when used as an embedded panel inside other pages (admin), the parent
    // will already load files/currentFile. Avoid fetching files again in embed mode.
    if (!embed) dispatch(getExcelFiles());
  }, [dispatch, embed]);

  useEffect(() => {
    if (selectedFileId) dispatch(getExcelFileById(selectedFileId));
  }, [dispatch, selectedFileId]);

  useEffect(() => {
    // tolerate different shapes: currentFile.data (older) or currentFile.parsedData
    const rows = currentFile?.data || currentFile?.parsedData || [];
    if (rows?.length) {
      const cols = Object.keys(rows[0]);
      setXCol(cols[0]);
      setYCol(cols.length > 1 ? cols[1] : "");
    } else {
      setXCol("");
      setYCol("");
    }
  }, [currentFile]);

  const getChartData = () => {
    const rows = currentFile?.data || currentFile?.parsedData || [];
    if (!rows?.length || !xCol || !yCol) return {};
    return {
      labels: rows.map((row) => String(row[xCol])),
      datasets: [
        {
          label: yCol,
          data: rows.map((row) => Number(row[yCol])),
          backgroundColor: [
            "#1d6f42",
            "#0077cc",
            "#f4a261",
            "#e63946",
            "#2a9d8f",
            "#ffbe0b",
            "#3a86ff",
            "#8338ec",
            "#fb5607",
            "#ff006e",
          ],
          borderColor: "#222",
          borderWidth: 1,
        },
      ],
    };
  };

  const renderChart = () => {
    if (!xCol || !yCol) {
      return (
        <div className="text-red-600 font-semibold">
          ⚠ Please select columns for X and Y axis.
        </div>
      );
    }

    const chartProps = {
      data: getChartData(),
      options: {
        responsive: true,
        plugins: { legend: { display: chartType !== "bar" } },
      },
      ref: chartRef,
    };

    switch (chartType) {
      case "bar":
        return <Bar {...chartProps} />;
      case "line":
        return <Line {...chartProps} />;
      case "pie":
        return <Pie {...chartProps} />;
      case "doughnut":
        return <Doughnut {...chartProps} />;
      case "radar":
        return <Radar {...chartProps} />;
      default:
        return null;
    }
  };

  const inner = (
    <div className="p-6 space-y-6 ">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          📊 Visualize Excel Data
        </h2>
        {/* File Selector (only when not embedded) */}
        {!embed && (
          <div>
            <label className="font-medium text-gray-800">
              Select File:
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="ml-2 p-2 border rounded text-gray-900"
              >
                <option value="">-- Choose Excel File --</option>
                {files.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.filename}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Column Selector */}
        {rows.length >= 2 && (
          <>
            <div className="flex gap-6">
              <label className="text-gray-800 font-medium">
                X-Axis:
                <select
                  value={xCol}
                  onChange={(e) => setXCol(e.target.value)}
                  className="ml-2 p-2 border rounded text-gray-900"
                >
                  {Object.keys(rows[0]).map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-gray-800 font-medium">
                Y-Axis:
                <select
                  value={yCol}
                  onChange={(e) => setYCol(e.target.value)}
                  className="ml-2 p-2 border rounded text-gray-900"
                >
                  {Object.keys(rows[0]).map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Chart Type */}
            <div>
              <label className="text-gray-800 font-medium">
                Chart Type:
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="ml-2 p-2 border rounded text-gray-900"
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                  <option value="doughnut">Doughnut</option>
                  <option value="radar">Radar</option>
                </select>
              </label>
            </div>

            {/* Chart Display */}
            <div className="mt-4 min-h-[400px] flex flex-col items-center">
              {renderChart()}
              <button
                onClick={() => {
                  if (chartRef.current) {
                    const link = document.createElement("a");
                    link.download = `chart-${chartType}.png`;
                    link.href = chartRef.current.toBase64Image();
                    link.click();
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📥 Download Chart
              </button>
            </div>
          </>
        )}

        {/* Error if not enough columns */}
        {(selectedFileId || embed) && rows.length < 2 && (
          <div className="text-red-600 font-semibold">
            Excel must have at least 2 columns with numeric data for meaningful charts.
          </div>
        )}
      </div>
  );

  // when embedded we return only the inner panel (no Layout wrapper)
  if (embed) return inner;

  return (
    <Layout>{inner}</Layout>
  );
};

export default ChartViewer;


// import React, { useEffect, useRef, useState } from "react";
// import Layout from "../../Layout/Layout";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   RadialLinearScale,
// } from "chart.js";
// import { Pie, Bar, Line, Doughnut, Radar, Scatter } from "react-chartjs-2";
// import { useDispatch, useSelector } from "react-redux";
// import { getExcelFiles, getExcelFileById } from "../../Redux/excelSlice";
// import AiInsights from "../Excel/AiInsights";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   RadialLinearScale
// );

// const ChartViewer = ({ embed = false, selectedFileId: propSelectedFileId = "" }) => {
//   const dispatch = useDispatch();
//   const { files, currentFile } = useSelector((state) => state.excel);

//   const [selectedFileId, setSelectedFileId] = useState(propSelectedFileId || "");
//   const [chartType, setChartType] = useState("bar");
//   const [xCol, setXCol] = useState("");
//   const [yCol, setYCol] = useState("");
//   const chartRef = useRef(null);
//   const rows = currentFile?.data || currentFile?.parsedData || [];

//   // keep propSelectedFileId in sync (for admin dashboard embed)
//   useEffect(() => {
//     if (propSelectedFileId) setSelectedFileId(propSelectedFileId);
//   }, [propSelectedFileId]);

//   // load file list if not embedded
//   useEffect(() => {
//     if (!embed) dispatch(getExcelFiles());
//   }, [dispatch, embed]);

//   // fetch selected file data
//   useEffect(() => {
//     if (selectedFileId) dispatch(getExcelFileById(selectedFileId));
//   }, [dispatch, selectedFileId]);

//   // set default columns
//   useEffect(() => {
//     if (rows?.length) {
//       const cols = Object.keys(rows[0]);
//       setXCol(cols[0]);
//       setYCol(cols.length > 1 ? cols[1] : "");
//     } else {
//       setXCol("");
//       setYCol("");
//     }
//   }, [currentFile]);

//   const getChartData = () => {
//     if (!rows?.length || !xCol || !yCol) return null;
//     const labels = rows.map((r) => String(r[xCol]));
//     const dataValues = rows.map((r) => Number(r[yCol]) || 0);

//     return {
//       labels,
//       datasets: [
//         {
//           label: yCol,
//           data: dataValues,
//           backgroundColor: [
//             "#1d6f42",
//             "#0077cc",
//             "#f4a261",
//             "#e63946",
//             "#2a9d8f",
//             "#ffbe0b",
//             "#3a86ff",
//             "#8338ec",
//             "#fb5607",
//             "#ff006e",
//           ],
//           borderColor: "#222",
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   const downloadChart = () => {
//     if (chartRef.current) {
//       const link = document.createElement("a");
//       link.download = `chart-${chartType}.png`;
//       link.href = chartRef.current.toBase64Image();
//       link.click();
//     }
//   };

//   const renderChart = () => {
//     const chartData = getChartData();
//     if (!chartData) {
//       return (
//         <div className="text-red-600 font-semibold">
//           ⚠ Please select valid X and Y columns.
//         </div>
//       );
//     }

//     const chartProps = {
//       data: chartData,
//       options: {
//         responsive: true,
//         plugins: { legend: { display: chartType !== "bar" } },
//       },
//       ref: chartRef,
//     };

//     switch (chartType) {
//       case "bar":
//         return <Bar {...chartProps} />;
//       case "line":
//         return <Line {...chartProps} />;
//       case "pie":
//         return <Pie {...chartProps} />;
//       case "doughnut":
//         return <Doughnut {...chartProps} />;
//       case "radar":
//         return <Radar {...chartProps} />;
//       case "scatter":
//         return (
//           <Scatter
//             {...chartProps}
//             data={{
//               datasets: [
//                 {
//                   label: yCol,
//                   data: rows.map((r) => ({
//                     x: Number(r[xCol]) || 0,
//                     y: Number(r[yCol]) || 0,
//                   })),
//                   backgroundColor: "#3a86ff",
//                 },
//               ],
//             }}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const inner = (
//     <div className="p-6 space-y-6">
//       {!embed && (
//         <h2 className="text-2xl font-bold text-indigo-700">
//           📊 Excel Chart Viewer
//         </h2>
//       )}

//       {!embed && (
//         <div>
//           <label className="font-medium text-gray-800">
//             Select File:
//             <select
//               value={selectedFileId}
//               onChange={(e) => setSelectedFileId(e.target.value)}
//               className="ml-2 p-2 border rounded text-gray-900"
//             >
//               <option value="">-- Choose Excel File --</option>
//               {files.map((f) => (
//                 <option key={f._id} value={f._id}>
//                   {f.filename}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//       )}

//       {rows.length >= 2 ? (
//         <>
//           <div className="flex flex-wrap gap-4">
//             <label className="font-medium text-gray-800">
//               X-Axis:
//               <select
//                 value={xCol}
//                 onChange={(e) => setXCol(e.target.value)}
//                 className="ml-2 p-2 border rounded text-gray-900"
//               >
//                 {Object.keys(rows[0]).map((col) => (
//                   <option key={col} value={col}>
//                     {col}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label className="font-medium text-gray-800">
//               Y-Axis:
//               <select
//                 value={yCol}
//                 onChange={(e) => setYCol(e.target.value)}
//                 className="ml-2 p-2 border rounded text-gray-900"
//               >
//                 {Object.keys(rows[0]).map((col) => (
//                   <option key={col} value={col}>
//                     {col}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label className="font-medium text-gray-800">
//               Chart Type:
//               <select
//                 value={chartType}
//                 onChange={(e) => setChartType(e.target.value)}
//                 className="ml-2 p-2 border rounded text-gray-900"
//               >
//                 <option value="bar">Bar</option>
//                 <option value="line">Line</option>
//                 <option value="pie">Pie</option>
//                 <option value="doughnut">Doughnut</option>
//                 <option value="radar">Radar</option>
//                 <option value="scatter">Scatter</option>
//               </select>
//             </label>
//           </div>

//           <div className="mt-4 min-h-[400px] flex flex-col items-center">
//             {renderChart()}
//             <button
//               onClick={downloadChart}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               📥 Download Chart
//             </button>
//           </div>

//           {/* AI Insights reuse */}
//           <div className="mt-8">
//             <AiInsights parsedData={rows} />
//           </div>
//         </>
//       ) : (
//         selectedFileId && (
//           <div className="text-red-600 font-semibold">
//             Excel must contain at least 2 columns of numeric data for visualization.
//           </div>
//         )
//       )}
//     </div>
//   );

//   if (embed) return inner;
//   return <Layout>{inner}</Layout>;
// };

// export default ChartViewer;
