/**
 * Static tips and cultural notes per trip day.
 * Kept outside IndexedDB for the same reason as heroImages — seed-flag logic
 * prevents existing users from seeing updated content after a re-seed.
 */

export const DAILY_TIPS: Record<string, string[]> = {
  '2026-07-05': [
    'Toma un taxi o Grab directamente desde el aeropuerto al hotel — los taxis de la calle en Noi Bai tienen fama de cobrar de más a turistas. La app Grab muestra el precio fijo antes de salir y es la opción más segura y barata.',
    'El dong vietnamita (VND) puede confundir al principio porque los billetes tienen muchos ceros: 500.000 VND son unos 20 €. Lleva siempre efectivo; muchos mercados y puestos callejeros no aceptan tarjeta.',
    'Cruzar la calle en el casco antiguo es un arte: avanza despacio y de forma continua, sin correr ni parar. Los conductores te rodearán — solo detente si hay una moto muy cerca. Nunca esperes un hueco vacío porque no llegará.',
  ],
  '2026-07-06': [
    'El trayecto en coche privado desde Hanói dura entre 3,5 y 4 horas por carretera de montaña. Lleva algo de comer y agua; las paradas en ruta son escasas. Si tienes tendencia al mareo, toma algo preventivo antes de salir.',
    'Confirma con el homestay la hora exacta de recogida — muchos organizan el transporte incluido. Si vas por libre, Grab funciona hasta cierto punto de la ruta y luego necesitarás un conductor local concertado.',
  ],
  '2026-07-07': [
    'Para el trekking lleva calzado con buen agarre (el barro en la selva puede ser traicionero), protector solar, repelente de insectos y agua suficiente para todo el día. Las sanguijuelas son comunes en temporada húmeda — un bote pequeño de sal sirve para quitarlas sin dolor.',
    'La cascada Hieu está a unos 40 minutos andando desde las aldeas. Puedes bañarte — el agua baja fría y limpia desde las montañas. Intenta regresar antes de las 14:00 para evitar el calor más intenso de la tarde.',
  ],
  '2026-07-08': [
    'El viaje desde Pu Luong a Tam Coc dura unas 3 horas. Ninh Binh es la base más cómoda — Tam Coc es el pueblo turístico principal, con acceso directo al embarcadero.',
    'Si llegas antes de las 15:00, puedes hacer un primer paseo en barca esa misma tarde. Los botes son remados con los pies por el remero — un espectáculo en sí mismo que merece la atención más allá del paisaje kárstico.',
  ],
  '2026-07-09': [
    'Llega a Trang An antes de las 7:30 — los primeros botes salen al amanecer y la luz en las cuevas es espectacular. A partir de las 9:00 el embarcadero se llena de tours organizados y la experiencia cambia completamente.',
    'La subida a Hang Mua tiene exactamente 500 escalones tallados en roca. Lleva agua y tómate tu tiempo — los últimos tramos son empinados pero las vistas sobre los arrozales y el río son de las mejores de todo el viaje.',
    'Trang An ofrece tres rutas de barca de diferente duración (1,5 h / 2 h / 3 h). La más larga pasa por más cuevas y es la más recomendada si tienes tiempo; la diferencia de precio es mínima.',
  ],
  '2026-07-10': [
    'Hay varios ferries entre el continente y Cat Ba. El más directo es el speedboat desde el puerto de Hai Phong (unos 45 minutos); la ruta por Halong puede durar más. Confirma el horario con tu alojamiento el día anterior.',
    'Cat Ba Town tiene un paseo marítimo agradable, pero el verdadero atractivo está en las playas del sur (Cat Co 1, 2 y 3) y en las excursiones a Lan Ha Bay. Reserva la excursión en barco desde el hotel — suele ser más barato que contratarla en el muelle.',
  ],
  '2026-07-11': [
    'Lan Ha Bay tiene más de 300 islas y recibe mucho menos turismo que Ha Long. Las excursiones en kayak son la forma más íntima de explorarla — muchos operadores incluyen acceso a lagunitas escondidas entre los karsts a las que solo se puede llegar en kayak.',
    'Si el operador ofrece snorkel, aprovéchalo en la zona sur de la bahía donde el agua está más clara. El plancton bioluminiscente es visible en noches sin luna — pregunta en tu alojamiento si organizan salidas nocturnas.',
  ],
  '2026-07-12': [
    'El regreso desde Cat Ba en ferry más coche dura aproximadamente 3,5 horas. Si el tren nocturno a Hue sale a las 22:00, llegas con tiempo sobrado para dejar el equipaje y dar un último paseo por el Old Quarter.',
    'Dedica la tarde libre a los mercados callejeros del casco antiguo o a tomar un café de loto en el lago Tay Ho — uno de los rincones más tranquilos de Hanói, lejos del bullicio del centro histórico.',
  ],
  '2026-07-13': [
    'El mausoleo abre de martes a jueves y sábado-domingo de 7:30 a 10:30. La cola puede ser considerable — llega antes de las 8:00. La entrada es gratuita pero es obligatoria la vestimenta conservadora: hombros y rodillas cubiertos, sin sombreros dentro del recinto.',
    'El tren nocturno a Hue sale de la estación de Hanói (Ga Hà Nội) a las 22:00. Reserva un camarote VIP de 4 literas con aire acondicionado — la diferencia de precio frente al asiento duro es mínima y el descanso que permite hace que merezca mucho la pena.',
  ],
  '2026-07-14': [
    'La Ciudad Imperial cierra a las 17:30. Si llegas de madrugada en tren, descansa un par de horas y entra a las 8:00 — la luz de la mañana sobre los tejados de cerámica dorada es excepcional y el calor todavía es soportable.',
    'El bun bo Hue (fideos con ternera) es el plato local por excelencia y es notablemente más picante que el pho del norte. Pruébalo en los puestos callejeros cerca del mercado Dong Ba — los más auténticos y económicos están en la propia acera, no en los restaurantes orientados al turismo.',
  ],
  '2026-07-15': [
    'Las tumbas imperiales más destacadas son la de Khai Dinh (la más espectacular visualmente, con influencia europea) y la de Tu Duc (la más grande, con jardines y lago). Visítalas entre las 8:00 y las 11:00 antes de que el calor apriete.',
    'El bus a Hoi An sale a las 15:00 y tarda unas 3 horas cruzando el paso de Hai Van. Algunos autobuses hacen parada en lo alto del paso — si puedes, baja y disfruta de las vistas: costa a un lado, montaña al otro, uno de los paisajes más impresionantes de Vietnam.',
  ],
  '2026-07-16': [
    'Entra al casco antiguo antes de las 8:00 — a esa hora los turistas de crucero aún no han llegado y puedes fotografiar el puente japonés sin nadie delante. La luz de la mañana sobre el canal es la más bonita del día.',
    'El ticket del casco antiguo (120.000 VND) da acceso a 5 puntos de interés elegidos de una lista de 14. No lo compres hasta tener claro qué quieres visitar — el puente japonés, las antiguas casas de mercaderes chinos y los templos son los más valorados.',
    'La playa de An Bang está a 4 km del centro en bicicleta (los alojamientos las alquilan por 2-3 USD al día). Evita Cua Dai, donde la erosión ha reducido mucho la arena en los últimos años.',
  ],
  '2026-07-17': [
    'El taxi de Hoi An al aeropuerto de Da Nang tarda unos 45 minutos. Reserva con tu alojamiento la noche anterior o usa Grab — es más fiable que los taxis de calle. Da Nang tiene aeropuerto internacional moderno y el embarque es tranquilo.',
    'Las Marble Mountains están de camino entre Hoi An y Da Nang — si tienes tiempo por la mañana, pide al taxi que pare. La entrada es barata, la subida corta y las vistas de la costa son excepcionales.',
  ],
  '2026-07-18': [
    'El amanecer en Angkor Wat está masificado. Una alternativa espectacular y tranquila es el amanecer reflejado en el estanque de Srah Srang — llegarás antes del alba, habrá poca gente y el reflejo del templo en el agua es una imagen única.',
    'El pase de Angkor de 3 días cuesta 62 USD por persona. Actívalo el día de llegada para no perder tiempo — el primer día empieza a contar desde la activación. Lleva efectivo en dólares.',
    'Los tuk-tuks para todo el día cuestan entre 15 y 20 USD. Acuerda la ruta por adelantado — hay un circuito pequeño (Angkor Wat, Bayon, Ta Prohm) y uno grande. El primer día es mejor empezar por el circuito pequeño.',
  ],
  '2026-07-19': [
    'Banteay Srei está a 25 km del centro de Siem Reap. Sal a las 7:00 para llegar al abrir y tener el templo prácticamente para ti — a partir de las 10:00 empiezan a llegar los tours organizados.',
    'Kbal Spean es una caminata de 1,5 km por la selva hasta un río cuyo lecho está tallado con cientos de figuras de dioses. Es un lugar poco visitado y muy especial — lleva agua y calzado cómodo para el camino.',
    'Confirma el bus nocturno a Phnom Penh con antelación. El trayecto dura entre 5 y 6 horas. Los operadores Giant Ibis o Mekong Express son los más fiables y parten habitualmente al atardecer.',
  ],
}

export const DAILY_CULTURAL_NOTES: Record<string, string[]> = {
  '2026-07-05': [
    'El lago Hoan Kiem debe su nombre a una leyenda del siglo XV. El rey Le Loi recibió una espada mágica de una tortuga dorada con la que expulsó a los invasores chinos. Años después, una tortuga emergió del lago y le reclamó la espada — de ahí el nombre "lago de la Espada Devuelta". Hoy la tortuga sigue siendo el símbolo sagrado del lago y del espíritu de resistencia vietnamita.',
    'Hanói ha sido capital de Vietnam casi sin interrupciones desde el año 1010. El rey Ly Thai To trasladó la corte desde Hoa Lu al ver un dragón dorado ascender desde el río, y llamó al lugar Thang Long — "dragón que asciende". Ese dragón sigue siendo el símbolo de la ciudad, y puedes verlo en las columnas de la Ciudadela Imperial declarada Patrimonio de la Humanidad por la UNESCO.',
  ],
  '2026-07-06': [
    'Pu Luong alberga a las comunidades Thai y Muong, que llevan más de 2.000 años moldeando el paisaje que verás. Construyeron sus arrozales en terrazas usando un sistema de irrigación por gravedad que no necesita bombas ni electricidad — solo agua de montaña, bambú y un conocimiento transmitido de generación en generación. Es uno de los ejemplos más longevos de ingeniería agrícola sostenible en el mundo.',
  ],
  '2026-07-07': [
    'En las aldeas Thai de Pu Luong las casas están construidas sobre pilotes de madera, elevadas del suelo. No es solo estética: la técnica protege del frío nocturno, de los animales salvajes y de las inundaciones en temporada de lluvias. Debajo de la casa se guardan los aperos de labranza y en algunos casos los animales domésticos, creando una convivencia entre el espacio humano y el agrícola que apenas ha cambiado en siglos.',
  ],
  '2026-07-08': [
    'Ninh Binh fue la primera capital unificada de Vietnam. Antes de que Hanói tomara protagonismo, el rey Dinh Tien Hoang estableció su corte en la cercana Hoa Lu en el año 968. Las formaciones kársticas que rodean la zona eran una defensa natural perfecta contra los invasores — tanto, que los propios emperadores llamaban a este lugar "la bahía de Halong terrestre". Hoa Lu puede visitarse en medio día desde Tam Coc.',
  ],
  '2026-07-09': [
    'Trang An lleva el sello de Patrimonio Mundial de la UNESCO por partida doble: es el único sitio del mundo declarado simultáneamente por su valor natural (el paisaje kárstico con cuevas y ríos subterráneos) y cultural (vestigios arqueológicos de 30.000 años de presencia humana). En las cuevas se han encontrado herramientas de piedra, restos de fauna extinguida y estructuras que revelan una ocupación ininterrumpida desde el Paleolítico hasta la actualidad.',
  ],
  '2026-07-10': [
    'Cat Ba es el hogar del langur de Cat Ba, uno de los primates más amenazados del planeta. En los años 2000 solo quedaban unos 40 individuos. Gracias a programas internacionales de conservación la población ha crecido, pero sigue siendo críticamente amenazada con menos de 100 ejemplares. Viven en los acantilados de la parte norte de la isla — si tienes binoculares, el amanecer es el mejor momento para intentar verlos.',
  ],
  '2026-07-11': [
    'Los pescadores vietnamitas llevan siglos viviendo en casas flotantes en las bahías de esta costa. Las aldeas flotantes como Viet Hai fueron durante generaciones comunidades completamente autosuficientes: cultivaban en barcazas, criaban peces en jaulas bajo el agua y rara vez pisaban tierra firme. Hoy la mayoría ha sido reubicada en tierra por decisión gubernamental, pero algunas familias mantienen viva la tradición y siguen pescando desde sus viviendas sobre el agua.',
  ],
  '2026-07-12': [
    'El café con huevo (egg coffee) fue inventado en Hanói durante la guerra de Indochina, cuando la leche escaseaba. Un barista del histórico Café Giang sustituyó la leche por yemas de huevo batidas a mano con azúcar y café soluble — el resultado fue tan adictivo que setenta años después el café Giang sigue siendo uno de los más visitados de la ciudad. Busca el callejón discreto donde está escondido: la búsqueda ya forma parte de la experiencia.',
  ],
  '2026-07-13': [
    'Ho Chi Minh pidió expresamente en su testamento ser incinerado y que sus cenizas se esparcieran por tres regiones de Vietnam. El gobierno ignoró esa última voluntad y construyó el mausoleo siguiendo el modelo del de Lenin en Moscú, con ayuda de técnicos soviéticos. Desde 1975, el cuerpo embalsamado recibe millones de visitantes al año. Cada año, durante aproximadamente dos meses, el cuerpo viaja a Rusia para mantenimiento de conservación.',
  ],
  '2026-07-14': [
    'La Ciudad Imperial de Hue fue diseñada siguiendo los principios de la geomancia vietnamita. Su orientación, la posición de cada puerta y la disposición de los pabellones dentro del recinto fueron calculadas por astrólogos de la corte para optimizar el flujo de energía vital. La Puerta del Mediodía, por la que entraba el Emperador, solo se abría tres veces al año: en el Año Nuevo lunar, para declarar la guerra y para proclamar la paz.',
    'La cocina de Hue es considerada la más refinada de Vietnam — fue cocina imperial durante siglos y la etiqueta de la corte exigía servir hasta 50 platos distintos en cada comida real. Con el tiempo, esos elaborados platos imperiales se transformaron en las especialidades callejeras que hoy se venden en los mercados: la banh khoai, la nem lui y el com hen son herederos directos de la mesa del Emperador.',
  ],
  '2026-07-15': [
    'El rey Tu Duc tardó 16 años en construir su propio mausoleo y llegó a vivir en él antes de morir. Usaba el recinto como retiro poético: escribía versos, pescaba en el lago artificial y recibía a sus 104 esposas. Cuando murió, para proteger el tesoro que supuestamente enterró en el interior y evitar que su ubicación exacta fuera revelada, los 200 trabajadores que conocían el secreto fueron decapitados inmediatamente después del entierro.',
  ],
  '2026-07-16': [
    'Hoi An fue durante los siglos XVI y XVII uno de los puertos comerciales más importantes de Asia. Mercaderes chinos, japoneses, holandeses y portugueses vivían en sus propios barrios con sus propias normas. El puente japonés fue construido en 1593 precisamente para conectar el barrio nipón con el chino — y también, según la leyenda, para "clavar" el lomo del monstruo namazu, cuyo corazón estaba en India y cuya cola causaba terremotos en Japón.',
    'Casi todas las linternas que iluminan Hoi An por la noche son fabricadas a mano en la ciudad, en más de 40 talleres artesanales activos. La tradición nació con los mercaderes chinos que colgaban faroles rojos en sus almacenes para identificar su mercancía. Cada 14 del mes lunar, Hoi An apaga todas las luces eléctricas y celebra la noche de la luna llena iluminada únicamente con linternas de seda.',
  ],
  '2026-07-17': [
    'Las Marble Mountains de Da Nang llevan el nombre de los cinco elementos de la cosmología vietnamita: Agua, Madera, Fuego, Tierra y Metal — una montaña para cada uno. La más visitada, Thuy Son (Agua), esconde en su interior cuevas naturales que fueron transformadas en santuarios budistas durante la ocupación del Imperio Cham, hace más de diez siglos. Algunos de esos altares esculpidos en la roca llevan en pie sin interrupción desde entonces.',
  ],
  '2026-07-18': [
    'Angkor Wat fue construido en menos de 40 años en el siglo XII. El rey Suryavarman II movilizó a decenas de miles de trabajadores y artesanos para levantar el templo más grande del mundo en ese tiempo — una hazaña comparable a construir varias catedrales góticas simultáneamente. Los casi 600 metros de bajorrelieves que recorren sus galerías narran escenas del Mahabharata y el Ramayana con un nivel de detalle que los arqueólogos aún estudian.',
    'Angkor llegó a ser la ciudad más grande del mundo preindustrial. En el siglo XII albergaba entre 750.000 y 1 millón de personas — más que la Londres medieval o el París de la misma época. Su sistema de gestión del agua, con canales, embalses y reservorios artificiales de ingeniería extraordinaria, es estudiado hoy por urbanistas e ingenieros como referencia para el diseño de ciudades sostenibles.',
  ],
  '2026-07-19': [
    'Banteay Srei fue construido en el siglo X por un sabio brahmán llamado Yajnavaraha, preceptor del rey. Sus esculturas son tan delicadas — con figuras femeninas de una belleza inusual para el arte jemer — que la leyenda popular lo llamó "la ciudadela de las mujeres", asegurando que solo manos de mujer podían haber tallado semejante detalle. Lo descubrieron los franceses en 1914, pero los campesinos de la zona lo conocían desde siempre.',
    'El Imperio Jemer no cayó por una invasión militar sino probablemente por un colapso medioambiental. Las últimas investigaciones con tecnología LiDAR revelan que el sofisticado sistema hidráulico de Angkor, del que dependía toda la agricultura de la región, sufrió una serie de sequías e inundaciones catastróficas en los siglos XIV y XV que lo dañaron de forma irreversible. La capital fue abandonada alrededor de 1431 y la selva recuperó en pocos siglos lo que el hombre había tardado siglos en construir.',
  ],
}
