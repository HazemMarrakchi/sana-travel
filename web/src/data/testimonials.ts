export interface Testimonial {
  name: string
  rating: number
  trip: { fr: string; en: string; ar: string }
  text: { fr: string; en: string; ar: string }
}

/** Témoignages de démonstration — à remplacer par les vrais avis clients */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Amel B.',
    rating: 5,
    trip: { fr: 'Cappadoce · 4 nuits', en: 'Cappadocia · 4 nights', ar: 'كابادوكيا · 4 ليال' },
    text: {
      fr: 'Vol en montgolfière organisé au millimètre près. Notre agent a même changé l’hôtel quand il a vu une meilleure dispo. Jamais vu ça.',
      en: 'The balloon flight was organised to perfection. Our agent even switched our hotel when a better option opened up. Never seen that before.',
      ar: 'رحلة المنطاد كانت منظمة بدقة. وكيلنا غيّر الفندق عندما وجد خيارًا أفضل. لم أرَ ذلك من قبل.',
    },
  },
  {
    name: 'Mehdi T.',
    rating: 5,
    trip: { fr: 'Maldives · Lune de miel', en: 'Maldives · Honeymoon', ar: 'المالديف · شهر عسل' },
    text: {
      fr: 'Villa sur pilotis avec décoration mariage offerte à l’arrivée. Le suivi avant le départ était irréprochable.',
      en: 'Overwater villa with wedding decoration waiting on arrival. Pre-departure follow-up was flawless.',
      ar: 'فيلا على الماء مع ديكور زفاف عند الوصول. المتابعة قبل السفر كانت لا تشوبها شائبة.',
    },
  },
  {
    name: 'Sarra & Karim',
    rating: 4,
    trip: { fr: 'Istanbul · City break', en: 'Istanbul · City break', ar: 'إستانبول · رحلة قصيرة' },
    text: {
      fr: 'Prix du vol en direct sur le site, sans surprise au paiement. Le petit restaurant caché recommandé par SANA était notre meilleur souvenir.',
      en: 'Flight price shown live on the site, no surprises at checkout. The hidden restaurant SANA recommended was our best memory.',
      ar: 'سعر الطيران مباشر على الموقع بدون مفاجآت. المطعم الذي أوصت به SANA كان أجمل ذكرى.',
    },
  },
  {
    name: 'Yassine M.',
    rating: 5,
    trip: { fr: 'Bali · 9 nuits', en: 'Bali · 9 nights', ar: 'بالي · 9 ليال' },
    text: {
      fr: 'Itinéraire Ubud + plage équilibré, guide francophone excellent. Rapport qualité-prix imbattable.',
      en: 'Balanced Ubud + beach itinerary, excellent French-speaking guide. Unbeatable value for money.',
      ar: 'برنامج متوازن بين أوبود والشاطئ، مرشد ممتاز بالفرنسية. قيمة لا تُضاهى مقابل السعر.',
    },
  },
]
