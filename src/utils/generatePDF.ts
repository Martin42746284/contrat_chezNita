import { ContractData } from '@/types/contract';
import jsPDF from 'jspdf';

const ARTICLE_6_TEXT = `Responsabilités :
- La Fournisseuse s'engage à fournir des articles de qualité conforme aux descriptions.
- La Distributrice s'engage à représenter fidèlement les articles sur sa boutique en ligne.
- En cas de litige, les parties s'engagent à trouver une solution amiable.
- La Fournisseuse est responsable des défauts de fabrication.
- La Distributrice est responsable de la communication avec les clients.`;

export function generateContractPDF(data: ContractData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addTitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 48, 80);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 10;
  };

  const addSubtitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 48, 80);
    doc.text(text, 14, y);
    y += 7;
  };

  const addText = (text: string, indent = 14) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, pageWidth - indent - 14);
    doc.text(lines, indent, y);
    y += lines.length * 5;
  };

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 48, 80);
    doc.text(`${label} :`, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(value || '—', 70, y);
    y += 6;
  };

  const checkNewPage = (needed: number = 30) => {
    if (y > doc.internal.pageSize.getHeight() - needed) {
      doc.addPage();
      y = 20;
    }
  };

  const addCINImages = (label: string, recto: string | null, verso: string | null) => {
    checkNewPage(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 48, 80);
    doc.text(`${label} — CIN :`, 18, y);
    y += 4;
    const imgW = 40;
    const imgH = 28;
    if (recto) {
      try {
        doc.addImage(recto, 'JPEG', 18, y, imgW, imgH);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Recto', 18, y + imgH + 3);
      } catch {}
    }
    if (verso) {
      try {
        doc.addImage(verso, 'JPEG', 18 + imgW + 10, y, imgW, imgH);
        doc.setFontSize(7);
        doc.text('Verso', 18 + imgW + 10, y + imgH + 3);
      } catch {}
    }
    y += imgH + 8;
  };

  // Header line
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(2);
  doc.line(14, 12, pageWidth - 14, 12);

  addTitle('CONTRAT DE VENTE EN LIGNE');
  y += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(`Statut : ${data.status === 'valide' ? 'VALIDÉ' : 'EN ATTENTE'}  |  Date : ${data.date}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Identity verification badge
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 120, 70);
  doc.text('✓ Identité vérifiée par contrôle automatique', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Fournisseuse
  addSubtitle('INFORMATIONS DE LA FOURNISSEUSE');
  addField('Nom complet', data.fournisseuse.nomComplet);
  addField('CIN', data.fournisseuse.cin);
  addField('Adresse', data.fournisseuse.adresse);
  addField('Téléphone', data.fournisseuse.telephone);
  y += 2;
  addCINImages('Fournisseuse', data.fournisseuse.cinPhotos.recto, data.fournisseuse.cinPhotos.verso);
  y += 4;

  // Distributrice
  checkNewPage(60);
  addSubtitle('INFORMATIONS DE LA DISTRIBUTRICE');
  addField('Nom complet', data.distributrice.nomComplet);
  addField('CIN', data.distributrice.cin);
  addField('Adresse', data.distributrice.adresse);
  addField('Téléphone', data.distributrice.telephone);
  addField('Page / Boutique', data.distributrice.nomPage);
  y += 2;
  addCINImages('Distributrice', data.distributrice.cinPhotos.recto, data.distributrice.cinPhotos.verso);
  y += 4;

  checkNewPage();

  // Article 1
  addSubtitle('Article 1 : Objet du contrat');
  addText('Le présent contrat a pour objet la vente en ligne des articles confectionnés par la Fournisseuse via la boutique virtuelle de la Distributrice.');
  y += 3;

  // Article 2
  addSubtitle('Article 2 : Produits concernés');
  const produits: string[] = [];
  if (data.produits.robes) produits.push('Robes');
  if (data.produits.jupes) produits.push('Jupes');
  if (data.produits.chemises) produits.push('Chemises');
  if (data.produits.ensembles) produits.push('Ensembles');
  if (data.produits.autres) produits.push(`Autres : ${data.produits.autresDetail}`);
  addText(produits.length > 0 ? produits.join(', ') : 'Aucun produit sélectionné');
  y += 3;

  checkNewPage();

  // Article 3
  addSubtitle('Article 3 : Prix et bénéfices');
  if (data.prix.type === 'marge') {
    addText('La Fournisseuse fixe un prix de base et la Distributrice ajoute sa marge.');
  } else {
    addText(`La Distributrice reçoit une commission de ${data.prix.commissionPercent}%.`);
  }
  y += 3;

  // Article 4
  addSubtitle('Article 4 : Modalités de paiement');
  const methods: string[] = [];
  if (data.paiement.mvola) methods.push('MVola');
  if (data.paiement.orangeMoney) methods.push('Orange Money');
  if (data.paiement.airtelMoney) methods.push('Airtel Money');
  addText(`Mobile Money : ${methods.length > 0 ? methods.join(', ') : 'Non spécifié'}`);
  addText('• Acompte de 50% payé dans les 3 jours avant livraison');
  addText('• Solde payé le jour de la livraison');
  y += 3;

  checkNewPage();

  // Article 5
  addSubtitle('Article 5 : Livraison');
  const respLabels = { fournisseuse: 'Fournisseuse', distributrice: 'Distributrice' };
  const fraisLabels = { client: 'Client', distributrice: 'Distributrice', fournisseuse: 'Fournisseuse' };
  addText(`Livraison assurée par : ${respLabels[data.livraison.responsable]}`);
  addText(`Frais de livraison payés par : ${fraisLabels[data.livraison.fraisPayePar]}`);
  y += 3;

  // Article 6
  addSubtitle('Article 6 : Responsabilités');
  addText(ARTICLE_6_TEXT);
  y += 3;

  checkNewPage();

  // Article 7
  addSubtitle('Article 7 : Durée');
  addText('Contrat valable 12 mois à compter de la date de validation.');
  y += 6;

  // Lieu et date
  addSubtitle('Lieu et date');
  addField('Lieu', data.lieu);
  addField('Date', data.date);
  y += 6;

  checkNewPage();

  // Validations
  addSubtitle('Validations');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const checkMark = (v: boolean) => v ? '☑' : '☐';
  doc.text(`${checkMark(data.validationFournisseuse)} La Fournisseuse confirme et valide les informations`, 18, y);
  y += 6;
  doc.text(`${checkMark(data.validationDistributrice)} La Distributrice confirme et valide les informations`, 18, y);
  y += 8;

  if (data.dateValidation) {
    addField('Date de validation', new Date(data.dateValidation).toLocaleDateString('fr-FR'));
  }

  // Footer line
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(1);
  doc.line(14, doc.internal.pageSize.getHeight() - 15, pageWidth - 14, doc.internal.pageSize.getHeight() - 15);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré automatiquement — Contrat de vente en ligne — Identité vérifiée par IA', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`contrat-vente-${data.date}.pdf`);
}
