/**
 * Static hero images per trip day. Kept outside the DB because trip imagery
 * is immutable content, not user data — storing it in IndexedDB means users
 * who visited before a seed update never see the new values.
 */
export const DAILY_HERO_IMAGES: Record<string, string> = {
  // Hanoi — Old Quarter & Hoan Kiem
  '2026-07-05':
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  // Pu Luong — rice terraces arrival
  '2026-07-06':
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
  // Pu Luong — Hieu waterfall trekking
  '2026-07-07':
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1200&q=80',
  // Ninh Binh — Tam Coc karst boats
  '2026-07-08':
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
  // Ninh Binh — Trang An & Hang Mua
  '2026-07-09':
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  // Cat Ba — ferry & Lan Ha Bay arrival
  '2026-07-10':
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
  // Lan Ha Bay — kayak & floating village
  '2026-07-11':
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
  // Hanoi — return, Old Quarter night
  '2026-07-12':
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  // Hanoi — Ho Chi Minh Mausoleum & One Pillar Pagoda
  '2026-07-13':
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  // Hue — Imperial City arrival
  '2026-07-14':
    'https://images.unsplash.com/photo-1599708153386-62e6c519a741?auto=format&fit=crop&w=1200&q=80',
  // Hue — royal tombs & Thien Mu pagoda
  '2026-07-15':
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  // Hoi An — ancient town & lanterns
  '2026-07-16':
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  // Hoi An → Da Nang → Siem Reap
  '2026-07-17':
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  // Angkor — Bayon & Ta Prohm (day 1)
  '2026-07-18':
    'https://images.unsplash.com/photo-1600520611035-8a297f05bf7e?auto=format&fit=crop&w=1200&q=80',
  // Angkor — Banteay Srei & Kbal Spean (day 2)
  '2026-07-19':
    'https://images.unsplash.com/photo-1571404596560-83d01e7d2d70?auto=format&fit=crop&w=1200&q=80',
}
