import { jsPDF } from 'jspdf'

export interface DevisData {
  reference: string
  offerTitle: string
  city: string
  country: string
  hotelName: string
  nights: number
  travelers: number
  startDate: string
  unitPriceEur: number
  totalEur: number
  contactName: string
  contactEmail: string
}

const EUR_TND = 3.4
const GOLD: [number, number, number] = [226, 176, 74]
const INK: [number, number, number] = [10, 22, 40]
const MIST: [number, number, number] = [92, 107, 128]

/**
 * Document officiel : généré toujours en français
 * (usage commercial standard en Tunisie ; l'UI reste trilingue).
 */
export function downloadDevis(d: DevisData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 56

  // header band
  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 110, 'F')
  doc.setTextColor(...GOLD)
  doc.setFont('times', 'bold')
  doc.setFontSize(30)
  doc.text('SANA Travel', M, 62)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Agence de voyage · Tunis — Paris — Dubaï', M, 84)
  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`DEVIS ${d.reference}`, W - M, 62, { align: 'right' })

  let y = 160
  const label = (k: string, v: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MIST)
    doc.text(k.toUpperCase(), M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...INK)
    doc.text(v, M, y + 16)
  }
  const col2 = W / 2 - 20
  const labelRight = (k: string, v: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MIST)
    doc.text(k.toUpperCase(), col2 + 20, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...INK)
    doc.text(v, col2 + 20, y + 16)
  }

  label('Client', d.contactName)
  labelRight('Référence', d.reference)
  y += 52
  label('Email', d.contactEmail)
  labelRight('Départ souhaité', d.startDate)

  y += 46
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.2)
  doc.line(M, y, W - M, y)

  y += 34
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...INK)
  doc.text(d.offerTitle, M, y)
  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MIST)
  doc.text(`${d.city}, ${d.country} · ${d.hotelName} · ${d.nights} nuits`, M, y)

  // price table
  y += 40
  doc.setFillColor(247, 244, 238)
  doc.roundedRect(M, y, W - M * 2, 108, 6, 6, 'F')
  y += 26
  const rowLabel = (t: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(t, M + 20, y)
  }
  const rowValue = (t: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 13 : 10)
    doc.setTextColor(...INK)
    doc.text(t, W - M - 20, y, { align: 'right' })
  }
  /** séparateur de milliers ASCII — l'espace unicode de toLocaleString casse Helvetica en jsPDF */
  const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const toDT = (eur: number) => Math.round((eur * EUR_TND) / 10) * 10
  rowLabel(`Prix par personne (${d.nights} nuits, vols inclus)`)
  rowValue(`${fmt(toDT(d.unitPriceEur))} DT`)
  y += 24
  rowLabel(`Voyageurs x ${d.travelers}`)
  rowValue(`${d.travelers}`)
  y += 30
  rowLabel('TOTAL DU DEVIS')
  rowValue(`${fmt(toDT(d.totalEur))} DT`, true)

  // conditions
  y += 70
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MIST)
  const lines = [
    "Ce devis est valable 14 jours et inclut les transferts, l'hébergement sélectionné et l'assistance SANA 24h/24.",
    'Acompte de 30% à la confirmation, solde 21 jours avant le départ. Annulation flexible selon conditions générales.',
    'SANA Travel Agency — Tunis · Paris · Dubaï — contact@sanatravel.tn',
  ]
  lines.forEach((l) => {
    doc.text(l, M, y)
    y += 14
  })

  // footer band
  doc.setFillColor(...GOLD)
  doc.rect(0, 800, W, 42, 'F')

  doc.save(`devis-sana-${d.reference}.pdf`)
}
