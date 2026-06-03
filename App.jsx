import { useState, useRef, useEffect } from "react";

const DEFAULT_TASKS = [
  { id: 1, name: "Riego Laureles", icon: "\u{1F33F}", time: "6:00 AM" },
  { id: 2, name: "Riego Palmas", icon: "\u{1F334}", time: "6:00 AM" },
  { id: 3, name: "Limpieza exterior, Planta Norte", icon: "\u{1F9F9}", time: "6:30 AM" },
  { id: 4, name: "Limpieza pasillo de la muerte", icon: "\u26A0\uFE0F", time: "7:00 AM" },
];

function getToday() {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
function getTime() {
  return new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [tasks, setTasks] = useState(
    DEFAULT_TASKS.map((t) => ({ ...t, done: false, photo: null, completedAt: null }))
  );
  const [sent, setSent] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [directorPhone, setDirectorPhone] = useState("5216861234567");
  const [directorName, setDirectorName] = useState("Director");
  const fileRefs = useRef({});

  const completedCount = tasks.filter((t) => t.done).length;
  const allDone = completedCount === tasks.length;
  const progress = (completedCount / tasks.length) * 100;

  const handlePhoto = (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, photo: ev.target.result, done: true, completedAt: getTime() }
            : t
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, photo: null, done: false, completedAt: null } : t
      )
    );
  };

  const sendWhatsApp = () => {
    const header = `\u2705 *REPORTE DIARIO DE OPERACIONES*\n\u{1F3ED} *LEADEC - KENMEX*\n\u{1F4C5} ${getToday()}\n\u23F0 Enviado: ${getTime()}\n${"─".repeat(28)}`;
    const body = tasks
      .map(
        (t) =>
          `${t.done ? "\u2705" : "\u274C"} *${t.name}*\n    ${t.done ? `Completada: ${t.completedAt}` : "Pendiente"}`
      )
      .join("\n\n");
    const footer = `\n${"─".repeat(28)}\n\u{1F4CA} *Resumen: ${completedCount}/${tasks.length} completadas*\n\n_Fotos de evidencia en los siguientes mensajes._\n\n_Reporte generado por Checklist Leadec_`;
    const msg = encodeURIComponent(`${header}\n\n${body}\n${footer}`);
    window.open(`https://wa.me/${directorPhone}?text=${msg}`, "_blank");
    setSent(true);
  };

  const sharePhotos = () => {
    const photosToShare = tasks.filter(t => t.photo);
    if (photosToShare.length === 0) return;
    
    // Try native share if available
    if (navigator.share && navigator.canShare) {
      // Convert base64 photos to files for sharing
      Promise.all(
        photosToShare.map(async (t, i) => {
          const res = await fetch(t.photo);
          const blob = await res.blob();
          return new File([blob], `${t.name.replace(/\s/g, '_')}.jpg`, { type: 'image/jpeg' });
        })
      ).then(files => {
        if (navigator.canShare({ files })) {
          navigator.share({
            title: 'Evidencias Checklist Leadec',
            text: `Fotos de evidencia - ${getToday()}`,
            files
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  };

  const btnBase = {
    border: "none", borderRadius: "12px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s ease",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0d1f3c 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1565C0, #0D47A1)",
        padding: "24px 20px 20px",
        borderRadius: "0 0 24px 24px",
        boxShadow: "0 4px 20px rgba(13,71,161,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "rgba(255,255,255,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "22px",
            }}>{"\u{1F4CB}"}</div>
            <div>
              <h1 style={{
                margin: 0, fontSize: "20px", fontWeight: 700,
                color: "#fff", letterSpacing: "-0.3px",
              }}>Checklist Leadec</h1>
              <p style={{
                margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)",
                textTransform: "capitalize",
              }}>{getToday()}</p>
            </div>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} style={{
            ...btnBase, width: "36px", height: "36px",
            background: "rgba(255,255,255,0.12)", fontSize: "18px", color: "#fff",
          }}>{"\u2699\uFE0F"}</button>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div style={{
            marginTop: "16px", padding: "12px", borderRadius: "12px",
            background: "rgba(0,0,0,0.2)",
          }}>
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              Tel. Director (con código de país):
            </label>
            <input
              value={directorPhone}
              onChange={(e) => setDirectorPhone(e.target.value)}
              placeholder="5216861234567"
              style={{
                width: "100%", padding: "8px 12px", marginTop: "4px",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                fontSize: "14px", boxSizing: "border-box",
              }}
            />
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "8px", display: "block" }}>
              Nombre Director:
            </label>
            <input
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", marginTop: "4px",
                borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)", color: "#fff",
                fontSize: "14px", boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Progress */}
        <div style={{ marginTop: "16px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "6px",
          }}>
            <span>{completedCount} de {tasks.length} actividades</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{
            height: "8px", borderRadius: "4px",
            background: "rgba(255,255,255,0.15)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              width: `${progress}%`,
              background: allDone
                ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                : "linear-gradient(90deg, #FFB300, #FFA000)",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: "16px 16px 180px" }}>
        {tasks.map((task) => (
          <div key={task.id} style={{
            background: task.done
              ? "linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.06))"
              : "rgba(255,255,255,0.05)",
            border: task.done
              ? "1px solid rgba(76,175,80,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "16px", marginBottom: "12px",
            transition: "all 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: task.done
                    ? "linear-gradient(135deg, #4CAF50, #388E3C)"
                    : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px",
                }}>
                  {task.done ? "\u2705" : task.icon}
                </div>
                <div>
                  <p style={{
                    margin: 0, fontSize: "15px", fontWeight: 600,
                    color: task.done ? "#81C784" : "#E3F2FD",
                  }}>{task.name}</p>
                  <p style={{
                    margin: "2px 0 0", fontSize: "12px",
                    color: task.done ? "rgba(129,199,132,0.7)" : "rgba(255,255,255,0.4)",
                  }}>
                    {task.done ? `Completada: ${task.completedAt}` : `Objetivo: ${task.time}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => fileRefs.current[task.id]?.click()}
                style={{
                  ...btnBase, width: "44px", height: "44px", fontSize: "20px",
                  background: task.done
                    ? "rgba(76,175,80,0.2)"
                    : "linear-gradient(135deg, #1565C0, #0D47A1)",
                  boxShadow: task.done ? "none" : "0 2px 8px rgba(13,71,161,0.3)",
                }}
              >{"\u{1F4F7}"}</button>
              <input
                ref={(el) => (fileRefs.current[task.id] = el)}
                type="file" accept="image/*" capture="environment"
                onChange={(e) => handlePhoto(task.id, e)}
                style={{ display: "none" }}
              />
            </div>
            {task.photo && (
              <div style={{ marginTop: "12px", position: "relative" }}>
                <img src={task.photo} alt={task.name} style={{
                  width: "100%", height: "180px", objectFit: "cover",
                  borderRadius: "12px", border: "1px solid rgba(76,175,80,0.3)",
                }} />
                <button onClick={() => removePhoto(task.id)} style={{
                  ...btnBase, position: "absolute", top: "8px", right: "8px",
                  background: "rgba(0,0,0,0.6)", width: "32px", height: "32px",
                  color: "#fff", fontSize: "16px",
                }}>{"\u2715"}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 16px 16px",
        background: "linear-gradient(transparent, #0a1628 30%)",
        paddingTop: "40px",
      }}>
        {/* Share photos button */}
        {completedCount > 0 && (
          <button onClick={sharePhotos} style={{
            ...btnBase, width: "100%", padding: "12px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 600,
            gap: "8px", marginBottom: "8px",
          }}>
            {"\u{1F4E4}"} Compartir {completedCount} foto{completedCount > 1 ? "s" : ""} por WhatsApp
          </button>
        )}
        
        {/* WhatsApp report button */}
        <button
          onClick={sendWhatsApp}
          disabled={completedCount === 0}
          style={{
            ...btnBase, width: "100%", padding: "16px",
            background: completedCount === 0
              ? "rgba(255,255,255,0.1)"
              : allDone
                ? "linear-gradient(135deg, #25D366, #128C7E)"
                : "linear-gradient(135deg, #FFB300, #F57F17)",
            color: completedCount === 0 ? "rgba(255,255,255,0.3)" : "#fff",
            fontSize: "16px", fontWeight: 700,
            cursor: completedCount === 0 ? "not-allowed" : "pointer",
            gap: "10px",
            boxShadow: completedCount > 0 ? "0 4px 15px rgba(0,0,0,0.3)" : "none",
          }}
        >
          <span style={{ fontSize: "22px" }}>
            {sent ? "\u2705" : "\u{1F4F1}"}
          </span>
          {sent
            ? "Reporte enviado \u2014 Toca para reenviar"
            : allDone
              ? "Enviar reporte completo por WhatsApp"
              : completedCount === 0
                ? "Toma fotos para enviar reporte"
                : `Enviar reporte (${completedCount}/${tasks.length}) por WhatsApp`}
        </button>
      </div>
    </div>
  );
}
