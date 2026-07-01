import type { CityId } from '../utils/cities'

export interface Dish {
  name: string
  description: string
  exclusive?: boolean
}

export const NATIONAL_DISHES: Dish[] = [
  {
    name: 'Phở',
    description:
      'Sopa de fideos de arroz con carne y verduras. El plato estrella de Vietnam, presente en todo el país.',
  },
  {
    name: 'Gỏi cuốn',
    description:
      'Rollitos frescos (no fritos) de gambas, cerdo, fideos de arroz y hierbas envueltos en papel de arroz.',
  },
  {
    name: 'Bánh mì',
    description:
      'Bocadillo de baguette con carne, paté y verduras encurtidas — herencia de la colonización francesa.',
  },
  {
    name: 'Cơm tấm',
    description: 'Arroz quebrado servido con carne a la parrilla, huevo frito y salsa de pescado.',
  },
  {
    name: 'Nước mắm',
    description: 'Salsa de pescado fermentada que acompaña a casi todos los platos vietnamitas.',
  },
  {
    name: 'Bánh phu thê',
    description:
      'Pastel de tapioca y judía mung envuelto en hoja de plátano, tradicional en bodas; en Hue se sirve en su variante verde.',
  },
]

export const CITY_DISHES: Partial<Record<CityId, Dish[]>> = {
  hanoi: [
    {
      name: 'Phở gà',
      description: 'Variante de phở con pollo en lugar de ternera, típica de Hanói.',
    },
    {
      name: 'Bún chả',
      description:
        'Carne de cerdo a la parrilla servida con fideos, hierbas y un caldo agridulce para mojar.',
    },
    {
      name: 'Bánh cuốn',
      description:
        'Crepe transparente de arroz al vapor relleno de carne picada y hongos, servido con salsa de pescado.',
    },
  ],
  hue: [
    {
      name: 'Nem lụi',
      description: 'Brochetas de carne marinada asadas sobre un palo de hierba limón (lemongrass).',
    },
    {
      name: 'Bánh bèo',
      description:
        'Pequeñas crepes de arroz al vapor cubiertas de gambas secas y cortezas de cerdo crujientes.',
    },
    {
      name: 'Bún bò Huế',
      description: 'Sopa de fideos picante con hierba limón, especialidad de Huế.',
    },
    {
      name: 'Bánh bột lọc',
      description: 'Dumplings translúcidos de tapioca rellenos de cerdo o gambas.',
    },
  ],
  'hoi-an': [
    {
      name: 'Cao lầu',
      description: 'Fideos gruesos con cerdo y arroz tostado crujiente.',
      exclusive: true,
    },
    {
      name: 'Mì Quảng',
      description: 'Sopa de fideos amarillos con cerdo, gambas y cacahuetes.',
    },
    {
      name: 'Bánh bao vạc',
      description: "Dumplings conocidos como 'rosa blanca', rellenos de gambas.",
    },
    {
      name: 'Cơm gà',
      description: 'Arroz cocinado en caldo de pollo, servido con pollo desmenuzado.',
    },
  ],
  'ninh-binh': [
    {
      name: 'Cơm cháy',
      description: 'Arroz tostado crujiente, especialidad local servida con distintas salsas.',
    },
    {
      name: 'Thịt dê',
      description: 'Carne de cabra, plato típico de la región montañosa de Ninh Bình.',
    },
  ],
}
