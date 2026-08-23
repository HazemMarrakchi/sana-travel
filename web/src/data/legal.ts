export type LegalType = 'mentions' | 'cgv' | 'privacy'

interface Block {
  h: string
  p: string
}

const CONTENT: Record<LegalType, { fr: Block[]; en: Block[]; ar: Block[] }> = {
  mentions: {
    fr: [
      { h: 'Éditeur du site', p: 'SANA Travel Agency — agence de voyages spécialisée dans les voyages sur mesure. Siège social : Tunis, Tunisie. Contact : contact@sana.tn.' },
      { h: 'Directeur de publication', p: 'Hazem Marrakchi, gérant de SANA Travel Agency.' },
      { h: 'Hébergement', p: 'Le site est hébergé sur une infrastructure cloud sécurisée (GitHub Pages / Render). Les données sont traitées conformément à la législation en vigueur.' },
      { h: 'Propriété intellectuelle', p: 'L’ensemble des contenus (textes, visuels, identité SANA) est protégé par le droit d’auteur. Toute reproduction sans autorisation est interdite.' },
      { h: 'Responsabilité', p: 'SANA Travel s’efforce d’assurer l’exactitude des informations diffusées. L’agence ne saurait être tenue responsable d’erreurs ou d’interruptions de service.' },
      { h: 'Données personnelles', p: 'Les données collectées via les formulaires font l’objet d’un traitement destiné à la gestion des réservations et à la relation client. Consultez notre politique de confidentialité.' },
    ],
    en: [
      { h: 'Publisher', p: 'SANA Travel Agency — a travel agency specialised in tailor-made trips. Registered office: Tunis, Tunisia. Contact: contact@sana.tn.' },
      { h: 'Publication director', p: 'Hazem Marrakchi, manager of SANA Travel Agency.' },
      { h: 'Hosting', p: 'The website is hosted on a secure cloud infrastructure (GitHub Pages / Render). Data is processed in accordance with applicable law.' },
      { h: 'Intellectual property', p: 'All content (texts, visuals, SANA brand) is protected by copyright. Any reproduction without permission is prohibited.' },
      { h: 'Liability', p: 'SANA Travel strives to ensure the accuracy of published information. The agency cannot be held liable for errors or service interruptions.' },
      { h: 'Personal data', p: 'Data collected through forms is processed for booking management and customer relations. See our privacy policy.' },
    ],
    ar: [
      { h: 'ناشر الموقع', p: 'SANA Travel Agency — وكالة سفر متخصصة في الرحلات المخصصة. المقر: تونس. للتواصل: contact@sana.tn.' },
      { h: 'مدير النشر', p: 'حازم المراكشي، مدير SANA Travel Agency.' },
      { h: 'الاستضافة', p: 'يُستضاف الموقع على بنية سحابية آمنة (GitHub Pages / Render). تُعالَج البيانات وفق القوانين المعمول بها.' },
      { h: 'الملكية الفكرية', p: 'جميع المحتويات (نصوص وصور وهوية SANA) محمية بحقوق النشر. يمنع نسخها دون إذن.' },
      { h: 'المسؤولية', p: 'تسعى SANA Travel لدقة المعلومات المنشورة، لكنها لا تتحمل المسؤولية عن أي أخطاء أو انقطاع في الخدمة.' },
      { h: 'البيانات الشخصية', p: 'تُعالَج البيانات المجمعة عبر النماذج لإدارة الحجوزات والعلاقة مع العملاء. راجع سياسة الخصوصية.' },
    ],
  },
  cgv: {
    fr: [
      { h: 'Objet', p: 'Les présentes conditions régissent les réservations de voyages et séjours proposés par SANA Travel Agency.' },
      { h: 'Devis et réservation', p: 'Toute demande donne lieu à un devis personnalisé. La réservation est confirmée après accord écrit et, le cas échéant, encaissement de l’acompte.' },
      { h: 'Prix', p: 'Les prix sont indiqués en euros et incluent les prestations décrites au devis. Ils peuvent évoluer selon disponibilités et tarifs fournisseurs.' },
      { h: 'Annulation', p: 'Les conditions d’annulation dépendent du statut du dossier (brouillon, devis envoyé, confirmé). Les frais éventuels vous sont communiqués avant confirmation.' },
      { h: 'Modification du voyage', p: 'Toute modification demandée après confirmation peut entraîner des frais supplémentaires selon les conditions des prestataires.' },
      { h: 'Litiges', p: 'En cas de litige, une solution amiable est recherchée en priorité. À défaut, les tribunaux compétents de Tunis seront seuls compétents.' },
    ],
    en: [
      { h: 'Scope', p: 'These terms govern travel and stay bookings offered by SANA Travel Agency.' },
      { h: 'Quote and booking', p: 'Every request results in a personalised quote. Booking is confirmed after written agreement and, where applicable, receipt of the deposit.' },
      { h: 'Pricing', p: 'Prices are shown in euros and include the services described in the quote. They may change with availability and supplier fares.' },
      { h: 'Cancellation', p: 'Cancellation terms depend on the file status (draft, quote sent, confirmed). Any applicable fees are communicated before confirmation.' },
      { h: 'Trip changes', p: 'Changes requested after confirmation may incur extra fees per supplier conditions.' },
      { h: 'Disputes', p: 'In case of dispute, an amicable solution is sought first. Failing that, the competent courts of Tunis shall have jurisdiction.' },
    ],
    ar: [
      { h: 'الغرض', p: 'تنظّم هذه الشروط حجوزات الرحلات والإقامات التي تقترحها SANA Travel Agency.' },
      { h: 'عرض السعر والحجز', p: 'كل طلب يُرفق بعرض سعر مخصص. يُؤكَّد الحجز بعد موافقة كتابية وتحصيل العربون عند الاقتضاء.' },
      { h: 'الأسعار', p: 'الأسعار باليورو وتشمل الخدمات المذكورة في العرض. قد تتغير حسب التوفر وأسعار المزوّدين.' },
      { h: 'الإلغاء', p: 'تعتمد شروط الإلغاء على حالة الملف (مسودة، عرض مرسل، مؤكد). تُذكر أي رسوم قبل التأكيد.' },
      { h: 'تعديل الرحلة', p: 'قد يترتّب على أي تعديل بعد التأكيد رسوم إضافية حسب شروط المزوّد.' },
      { h: 'النزاعات', p: 'يُسعى أولاً لحل ودي للنزاعات. عند التعذّر، تكون محاكم تونس المختصة وحدها.' },
    ],
  },
  privacy: {
    fr: [
      { h: 'Collecte des données', p: 'Nous collectons les informations que vous saisissz (nom, email, téléphone, préférences de voyage) afin de traiter vos demandes.' },
      { h: 'Utilisation', p: 'Vos données servent à la gestion des réservations, à la relation client et, avec votre accord, à notre newsletter.' },
      { h: 'Conservation', p: 'Les données sont conservées le temps nécessaire à la relation commerciale puis archivées selon les durées légales.' },
      { h: 'Vos droits', p: 'Conformément à la législation, vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Écrivez-nous à contact@sana.tn.' },
      { h: 'Cookies', p: 'Le site peut déposer des cookies de mesure d’audience. Vous pouvez les refuser via les paramètres de votre navigateur.' },
      { h: 'Tiers', p: 'Certaines données peuvent être partagées avec nos prestataires (compagnies, hôtels) strictement pour l’exécution de votre voyage.' },
    ],
    en: [
      { h: 'Data collection', p: 'We collect the information you provide (name, email, phone, travel preferences) to process your requests.' },
      { h: 'Use', p: 'Your data is used for booking management, customer relations and, with your consent, our newsletter.' },
      { h: 'Retention', p: 'Data is kept as long as necessary for the commercial relationship then archived per legal periods.' },
      { h: 'Your rights', p: 'Under applicable law you have the right to access, rectify and delete your data. Contact us at contact@sana.tn.' },
      { h: 'Cookies', p: 'The site may set audience-measurement cookies. You can refuse them in your browser settings.' },
      { h: 'Third parties', p: 'Some data may be shared with our providers (airlines, hotels) strictly to fulfil your trip.' },
    ],
    ar: [
      { h: 'جمع البيانات', p: 'نجمع المعلومات التي تُدخلها (الاسم، البريد، الهاتف، تفضيلات السفر) لمعالجة طلباتك.' },
      { h: 'الاستخدام', p: 'تُستخدم بياناتك لإدارة الحجوزات والعلاقة مع العملاء ولنشرتنا البريدية بموافقتك.' },
      { h: 'الاحتفاظ', p: 'تُحفظ البيانات طالما اقتضت العلاقة التجارية ثم تُؤرشف وفق المدد القانونية.' },
      { h: 'حقوقك', p: 'للمعني حق الوصول والتصحيح والحذف لبياناته وفق القانون. راسلنا على contact@sana.tn.' },
      { h: 'ملفات الارتباط', p: 'قد يضع الموقع ملفات قياس جمهور. يمكنك رفضها من إعدادات المتصفح.' },
      { h: 'أطراف ثالثة', p: 'قد تُشارَك بعض البيانات مع مزوّدينا (شركات طيران، فنادق) حصراً لتنفيذ رحلتك.' },
    ],
  },
}

export const LEGAL_META: Record<LegalType, { title: { fr: string; en: string; ar: string } }> = {
  mentions: { title: { fr: 'Mentions légales', en: 'Legal notice', ar: 'إشعار قانوني' } },
  cgv: { title: { fr: 'Conditions générales de vente', en: 'Terms of sale', ar: 'شروط البيع' } },
  privacy: { title: { fr: 'Politique de confidentialité', en: 'Privacy policy', ar: 'سياسة الخصوصية' } },
}

export function legalContent(type: LegalType, lang: 'fr' | 'en' | 'ar'): Block[] {
  return CONTENT[type][lang]
}
