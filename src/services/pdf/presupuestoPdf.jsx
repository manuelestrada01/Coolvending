import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";
import emailjs from "emailjs-com";
import logoUrl from "../../app/assets/images/logo/logo3.png";

/* ── Datos de la empresa ─────────────────────────────── */
const COMPANY = {
  address: "Castro Barros 250, F4",
  city: "Luján de Cuyo - Mendoza (5507)",
  phone: "+54 9 261 5661521",
  email: "info@coolvending.com.ar",
};

/* ── Estilos del PDF ─────────────────────────────────── */
const MAGENTA = "#d63384";
const DARK = "#1a1a1a";
const GRAY = "#666666";
const BORDER = "#e0e0e0";
const LIGHT = "#f7f7f7";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    backgroundColor: "#ffffff",
    paddingTop: 40,
    paddingBottom: 70,
    paddingHorizontal: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: MAGENTA,
  },
  headerLeft: { flexDirection: "column" },
  logo: { width: 110, height: 38, objectFit: "contain", marginBottom: 8 },
  companyLine: { fontSize: 8.5, color: GRAY, marginBottom: 2 },

  headerRight: { alignItems: "flex-end" },
  docTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    marginBottom: 10,
  },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    textTransform: "uppercase",
    marginRight: 6,
  },
  metaValue: { fontSize: 8.5, color: DARK },

  /* Cliente */
  clientSection: { marginBottom: 24 },
  clientLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  clientName: { fontSize: 16, fontFamily: "Helvetica-Bold" },

  /* Tabla */
  table: { borderWidth: 1, borderColor: BORDER, marginBottom: 18 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: DARK },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowEven: { backgroundColor: LIGHT },
  tableRowOdd: { backgroundColor: "#ffffff" },
  tableRowEmpty: { flexDirection: "row", minHeight: 12 },

  thCell: {
    padding: "7 6",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  tdCell: { padding: "7 6", fontSize: 9, color: DARK },

  colQty: { width: "12%", textAlign: "center" },
  colDesc: { width: "73%" },
  colType: { width: "15%", textAlign: "center" },

  /* Mensaje */
  mensajeSection: { marginBottom: 14 },
  mensajeLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  mensajeText: { fontSize: 9, color: GRAY },

  /* Nota */
  noteBox: {
    backgroundColor: LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: MAGENTA,
    padding: "10 12",
    borderRadius: 3,
    marginBottom: 20,
  },
  noteText: { fontSize: 8.5, color: GRAY, fontFamily: "Helvetica-Oblique" },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    alignItems: "center",
  },
  footerLine: {
    fontSize: 8,
    color: GRAY,
    textAlign: "center",
    marginBottom: 4,
  },
  footerThanks: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
});

/* ── Componente PDF ──────────────────────────────────── */
function PresupuestoPdfDoc({ data }) {
  const { nombre, maquinas = [], insumos = [], mensaje, numero, fecha } = data;
  const allRows = [
    ...maquinas.map((m) => ({ desc: m, tipo: "Máquina" })),
    ...insumos.map((ins) => ({ desc: ins, tipo: "Insumo" })),
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src={logoUrl} style={s.logo} />
            <Text style={s.companyLine}>{COMPANY.address}</Text>
            <Text style={s.companyLine}>{COMPANY.city}</Text>
            <Text style={s.companyLine}>Teléfono: {COMPANY.phone}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>Solicitud de Presupuesto</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>FECHA </Text>
              <Text style={s.metaValue}>{fecha}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>N° de solicitud </Text>
              <Text style={s.metaValue}>{numero}</Text>
            </View>
          </View>
        </View>

        {/* ── Cliente ── */}
        <View style={s.clientSection}>
          <Text style={s.clientLabel}>Presupuesto para:</Text>
          <Text style={s.clientName}>{nombre}</Text>
        </View>

        {/* ── Tabla ── */}
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.thCell, s.colQty]}>CANT.</Text>
            <Text style={[s.thCell, s.colDesc]}>DESCRIPCIÓN</Text>
            <Text style={[s.thCell, s.colType]}>TIPO</Text>
          </View>

          {allRows.map((row, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 0 ? s.tableRowEven : s.tableRowOdd]}
            >
              <Text style={[s.tdCell, s.colQty]}>1</Text>
              <Text style={[s.tdCell, s.colDesc]}>{row.desc}</Text>
              <Text style={[s.tdCell, s.colType]}>{row.tipo}</Text>
            </View>
          ))}

          {/* Fila vacía de cierre */}
          <View style={s.tableRowEmpty} />
        </View>

        {/* ── Observaciones ── */}
        {mensaje ? (
          <View style={s.mensajeSection}>
            <Text style={s.mensajeLabel}>Observaciones:</Text>
            <Text style={s.mensajeText}>{mensaje}</Text>
          </View>
        ) : null}

        {/* ── Nota sin precios ── */}
        <View style={s.noteBox}>
          <Text style={s.noteText}>
            Los precios serán detallados por nuestro equipo a la brevedad.
            Esta solicitud no constituye una factura ni comprobante de pago.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerLine}>
            Si tiene cualquier pregunta, escríbanos a {COMPANY.email}
          </Text>
          <Text style={s.footerThanks}>GRACIAS POR SU CONFIANZA.</Text>
        </View>

      </Page>
    </Document>
  );
}

/* ── Genera PDF, sube a Storage y devuelve URL ───────── */
export async function generarYSubirPdf(data, docId) {
  const blob = await pdf(<PresupuestoPdfDoc data={data} />).toBlob();
  const storageRef = ref(storage, `presupuestos/${docId}.pdf`);
  await uploadBytes(storageRef, blob, { contentType: "application/pdf" });
  return getDownloadURL(storageRef);
}

/* ── Envía email con EmailJS ─────────────────────────── */
export async function enviarEmailPresupuesto(params) {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return;
  return emailjs.send(serviceId, templateId, params, publicKey);
}
