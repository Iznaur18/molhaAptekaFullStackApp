/**
 * Встроенные «Характеристики по умолчанию» для дерева из
 * `productCategoryCatalogSeed.js` (09.10.2026).
 *
 * Ключ — слаг узла дерева: группы или конечной подкатегории. Лист берёт список
 * ближайшего к нему узла на своём пути (сам лист → родитель → …), поэтому
 * список задаётся один раз на группу, а отличающиеся листья перекрывают его
 * своей строкой.
 *
 * Названия — простые слова без единиц измерения («Объём», а не «Объём, мл»):
 * единицу продавец пишет в значении. Одно свойство везде называется одинаково.
 *
 * Раскладывается по листьям миграцией `20261009-category-default-characteristics`
 * через `applyProductCategoryDefaultCharacteristics`; дальше список каждой
 * подкатегории правится в админке, этот файл на неё уже не влияет.
 */

const BAGS = ["Бренд", "Материал", "Цвет", "Размер", "Тип застёжки"];
const WALLETS = ["Бренд", "Материал", "Цвет", "Размер"];
const WEARABLES = ["Бренд", "Материал", "Цвет", "Размер", "Сезон"];
const BIJOU = ["Материал", "Цвет", "Размер", "Вставка"];
const BELTS = ["Бренд", "Материал", "Цвет", "Длина", "Ширина"];
const SMALL_ITEMS = ["Материал", "Цвет", "Размер"];

const BODY_WASH = ["Бренд", "Объём", "Аромат", "Для кого"];

const TABLES = ["Размеры", "Материал", "Цвет", "Форма", "Раскладной"];
const CHAIRS = ["Материал", "Цвет", "Высота", "Максимальная нагрузка"];
const CABINETS = [
  "Размеры",
  "Материал",
  "Цвет",
  "Количество дверей или ящиков",
  "Состояние",
];

const APARTMENTS = [
  "Количество комнат",
  "Общая площадь",
  "Этаж",
  "Этажей в доме",
  "Ремонт",
  "Мебель",
];
const HOUSES = [
  "Площадь дома",
  "Площадь участка",
  "Этажей",
  "Материал стен",
  "Коммуникации",
];

const CLOTHING = [
  "Бренд",
  "Размер",
  "Цвет",
  "Материал",
  "Сезон",
  "Страна производства",
];
const SHOES = ["Бренд", "Размер", "Цвет", "Материал верха", "Сезон"];
const UNDERWEAR = ["Бренд", "Размер", "Цвет", "Материал", "Количество в упаковке"];
const KIDS_SHOES = ["Бренд", "Размер", "Возраст", "Цвет", "Материал", "Сезон"];

const SOIL_AND_FERTILIZERS = ["Назначение", "Вес или объём", "Состав"];
const RIDE_GEAR = ["Бренд", "Размер", "Максимальная нагрузка", "Возраст"];
const BALL_GAMES = ["Бренд", "Вид спорта", "Размер", "Материал"];
const TOURIST_GEAR = ["Бренд", "Материал", "Объём или размер", "Вес"];
const GIFT_SETS = ["Состав набора", "Аромат", "Объём или вес"];

/** @type {Record<string, string[]>} */
export const PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED = {
  // Аксессуары
  "accessories-women-bags": BAGS,
  "accessories-men-bags": BAGS,
  "accessories-kids-bags": BAGS,
  "accessories-women-wallets": WALLETS,
  "accessories-men-wallets": WALLETS,
  "accessories-women-wearables": WEARABLES,
  "accessories-men-wearables": WEARABLES,
  "accessories-kids-wearables": WEARABLES,
  "accessories-women-jewelry": BIJOU,
  "accessories-kids-jewelry": BIJOU,
  "accessories-women-belts": BELTS,
  "accessories-men-haberdashery": ["Бренд", "Материал", "Цвет"],
  "accessories-men-haberdashery-belts": BELTS,
  "accessories-men-haberdashery-suspenders": BELTS,
  "accessories-watches-classic": [
    "Бренд",
    "Механизм",
    "Материал корпуса",
    "Материал ремешка",
    "Цвет",
  ],
  "accessories-watches-smart": [
    "Бренд",
    "Модель",
    "Цвет",
    "Совместимость",
    "Время работы",
  ],
  "accessories-watches-straps": ["Материал", "Цвет", "Ширина", "Совместимость"],
  "accessories-eyewear": ["Бренд", "Форма оправы", "Материал оправы", "Цвет линз"],
  "accessories-eyewear-cases": ["Материал", "Цвет"],
  "accessories-travel": SMALL_ITEMS,
  "accessories-travel-luggage": [
    "Бренд",
    "Материал",
    "Цвет",
    "Размер",
    "Объём",
    "Количество колёс",
  ],
  "accessories-travel-umbrellas": ["Бренд", "Тип", "Цвет", "Диаметр купола"],

  // Аптека
  "pharmacy-meds": [
    "Действующее вещество",
    "Форма выпуска",
    "Дозировка",
    "Количество в упаковке",
    "Производитель",
    "Отпуск по рецепту",
  ],
  "pharmacy-vits": [
    "Состав",
    "Форма выпуска",
    "Количество в упаковке",
    "Для кого",
    "Производитель",
  ],
  "pharmacy-devices-tech": ["Бренд", "Модель", "Тип", "Питание", "Гарантия"],
  "pharmacy-devices-tech-glucometers": [
    "Бренд",
    "Модель",
    "Тип",
    "Совместимость",
    "Количество в упаковке",
    "Гарантия",
  ],
  "pharmacy-devices-firstaid": [
    "Тип",
    "Размер",
    "Количество в упаковке",
    "Производитель",
  ],
  "pharmacy-devices-orthopedics": ["Тип", "Размер", "Материал", "Производитель"],
  "pharmacy-care-cosmetics": ["Бренд", "Назначение", "Тип кожи или волос", "Объём"],
  "pharmacy-care-hygiene": ["Бренд", "Тип", "Количество в упаковке"],

  // Бытовая техника
  "appliances-large-cooling": [
    "Бренд",
    "Модель",
    "Объём",
    "Размеры",
    "Класс энергопотребления",
    "Цвет",
    "Гарантия",
  ],
  "appliances-large-laundry": [
    "Бренд",
    "Модель",
    "Загрузка",
    "Размеры",
    "Тип загрузки",
    "Гарантия",
  ],
  "appliances-large-cooking": [
    "Бренд",
    "Модель",
    "Тип",
    "Размеры",
    "Количество конфорок",
    "Цвет",
    "Гарантия",
  ],
  "appliances-large-cooking-hoods": [
    "Бренд",
    "Модель",
    "Ширина",
    "Производительность",
    "Цвет",
    "Гарантия",
  ],
  "appliances-large-dishwashers": [
    "Бренд",
    "Модель",
    "Вместимость",
    "Размеры",
    "Тип установки",
    "Гарантия",
  ],
  "appliances-kitchen": ["Бренд", "Модель", "Мощность", "Объём", "Цвет", "Гарантия"],
  "appliances-home-cleaning": [
    "Бренд",
    "Модель",
    "Тип уборки",
    "Мощность",
    "Время работы",
    "Гарантия",
  ],
  "appliances-home-garment": [
    "Бренд",
    "Модель",
    "Мощность",
    "Объём резервуара",
    "Гарантия",
  ],
  "appliances-home-sewing": [
    "Бренд",
    "Модель",
    "Тип",
    "Количество операций",
    "Гарантия",
  ],
  "appliances-climate-cooling": [
    "Бренд",
    "Модель",
    "Площадь помещения",
    "Мощность",
    "Гарантия",
  ],
  "appliances-climate-heating": [
    "Бренд",
    "Модель",
    "Мощность",
    "Объём",
    "Площадь помещения",
    "Гарантия",
  ],
  "appliances-climate-air": [
    "Бренд",
    "Модель",
    "Площадь помещения",
    "Объём резервуара",
    "Гарантия",
  ],
  "appliances-beauty": [
    "Бренд",
    "Модель",
    "Питание",
    "Мощность",
    "Комплектация",
    "Гарантия",
  ],

  // Бытовая химия
  "household-hygiene-laundry": [
    "Бренд",
    "Объём или вес",
    "Количество стирок",
    "Для каких тканей",
  ],
  "household-hygiene-cleaning": ["Бренд", "Назначение", "Объём", "Форма выпуска"],
  "household-hygiene-cleaning-air-bugs": ["Бренд", "Тип", "Объём", "Аромат"],
  "household-hygiene-household-paper": [
    "Бренд",
    "Количество в упаковке",
    "Количество слоёв",
  ],
  "household-hygiene-household-supplies": [
    "Материал",
    "Размер",
    "Количество в упаковке",
  ],
  "household-hygiene-household-supplies-trash-bags": [
    "Объём",
    "Количество в упаковке",
    "Прочность",
  ],
  "household-hygiene-personal-body": BODY_WASH,
  "household-hygiene-personal-hair": BODY_WASH,
  "household-hygiene-personal-oral": ["Бренд", "Тип", "Объём", "Для кого"],
  "household-hygiene-personal-shaving": ["Бренд", "Тип", "Количество в упаковке"],
  "household-hygiene-personal-women": ["Бренд", "Тип", "Количество в упаковке"],
  "household-hygiene-personal-baby": [
    "Бренд",
    "Размер",
    "Вес ребёнка",
    "Количество в упаковке",
  ],

  // Дом
  "home-textiles-bedroom": ["Материал", "Наполнитель", "Размер", "Цвет"],
  "home-textiles-bedroom-sets": ["Материал", "Размер", "Цвет", "Комплектация"],
  "home-textiles-utility": ["Материал", "Размер", "Цвет", "Количество в упаковке"],
  "home-textiles-windows": ["Материал", "Ширина", "Высота", "Цвет", "Тип крепления"],
  "home-textiles-carpets": ["Материал", "Размер", "Форма", "Цвет"],
  "home-tableware-cooking": [
    "Бренд",
    "Материал",
    "Диаметр",
    "Объём",
    "Подходит для плит",
  ],
  "home-tableware-cooking-knives": [
    "Бренд",
    "Материал",
    "Размер",
    "Количество предметов",
  ],
  "home-tableware-serving": [
    "Материал",
    "Объём",
    "Диаметр",
    "Цвет",
    "Количество предметов",
  ],
  "home-tableware-storage": ["Материал", "Объём", "Количество предметов"],
  "home-decor-lighting": ["Тип", "Материал", "Цвет", "Цоколь", "Мощность", "Размеры"],
  "home-decor-ambience": SMALL_ITEMS,
  "home-decor-ambience-scents": ["Аромат", "Объём или вес", "Время горения"],
  "home-storage": ["Материал", "Размер", "Цвет", "Количество в упаковке"],

  // Игры и консоли
  "gaming-consoles": ["Бренд", "Модель", "Память", "Цвет", "Состояние", "Комплектация"],
  "gaming-games": ["Платформа", "Жанр", "Язык", "Носитель", "Возрастное ограничение"],
  "gaming-accessories-controllers": [
    "Бренд",
    "Модель",
    "Совместимость",
    "Подключение",
    "Цвет",
  ],
  "gaming-accessories-gear": ["Совместимость", "Материал", "Цвет"],
  "gaming-accessories-vr": ["Бренд", "Модель", "Совместимость", "Комплектация"],
  "gaming-pc-peripherals": ["Бренд", "Модель", "Подключение", "Цвет"],
  "gaming-pc-media": ["Бренд", "Модель", "Подключение", "Совместимость"],
  "gaming-digital": ["Платформа", "Регион", "Номинал или срок"],
  "gaming-merch-figures": ["Бренд", "Персонаж", "Материал", "Высота"],
  "gaming-merch-board-games": ["Количество игроков", "Возраст", "Время партии", "Язык"],

  // Канцтовары
  "stationery-writing": ["Бренд", "Цвет", "Толщина линии", "Количество в упаковке"],
  "stationery-writing-correction": ["Бренд", "Тип", "Количество в упаковке"],
  "stationery-paper-notebooks": ["Формат", "Количество листов", "Линовка", "Обложка"],
  "stationery-paper-office": ["Формат", "Количество листов", "Плотность", "Цвет"],
  "stationery-paper-office-envelopes": ["Формат", "Количество в упаковке", "Цвет"],
  "stationery-desktop-folders": ["Формат", "Материал", "Цвет", "Вместимость"],
  "stationery-desktop-tools": ["Бренд", "Тип", "Размер", "Количество в упаковке"],
  "stationery-desktop-tools-calculators": ["Бренд", "Модель", "Разрядность", "Питание"],
  "stationery-school": ["Материал", "Размер", "Цвет", "Количество в упаковке"],
  "stationery-hobby": [
    "Бренд",
    "Количество цветов",
    "Возраст",
    "Количество в упаковке",
  ],

  // Кофе
  "coffee-types": ["Бренд", "Вес", "Сорт", "Обжарка", "Страна происхождения"],
  "coffee-types-instant": ["Бренд", "Вес", "Тип", "Упаковка"],
  "coffee-types-capsules": [
    "Бренд",
    "Совместимость",
    "Количество в упаковке",
    "Крепость",
  ],
  "coffee-additives": ["Бренд", "Вкус", "Объём или вес"],
  "coffee-additives-dairy": ["Бренд", "Вид", "Жирность", "Объём"],
  "coffee-additives-sweeteners": ["Бренд", "Вид", "Вес"],
  "coffee-gear-brewing": ["Бренд", "Материал", "Объём", "Подходит для плит"],
  "coffee-gear-brewing-grinders": ["Бренд", "Модель", "Тип", "Мощность"],
  "coffee-gear-serving": ["Материал", "Объём", "Цвет"],
  "coffee-gifts": ["Бренд", "Вес", "Состав набора", "Срок годности"],

  // Красота
  "beauty-face": ["Бренд", "Тип кожи", "Назначение", "Объём", "Страна производства"],
  "beauty-face-care-spf": ["Бренд", "Степень защиты (SPF)", "Объём", "Тип кожи"],
  "beauty-hair": ["Бренд", "Тип волос", "Назначение", "Объём"],
  "beauty-hair-coloring": ["Бренд", "Оттенок", "Тип", "Объём"],
  "beauty-body": ["Бренд", "Назначение", "Объём", "Аромат"],
  "beauty-body-hands-nails": ["Бренд", "Оттенок", "Тип", "Объём"],
  "beauty-makeup": ["Бренд", "Оттенок", "Тип", "Объём или вес"],
  "beauty-makeup-tools": ["Бренд", "Назначение", "Материал", "Количество в наборе"],
  "beauty-perfume": ["Бренд", "Объём", "Тип (духи, туалетная вода)", "Ноты аромата"],
  "beauty-mens-care": ["Бренд", "Назначение", "Объём"],

  // Мебель
  "furniture-living-soft": [
    "Размеры",
    "Материал обивки",
    "Цвет",
    "Механизм раскладывания",
    "Состояние",
  ],
  "furniture-living-sleeping": ["Размер", "Высота", "Жёсткость", "Наполнитель"],
  "furniture-living-sleeping-beds": [
    "Размер спального места",
    "Материал",
    "Цвет",
    "Подъёмный механизм",
    "Состояние",
  ],
  "furniture-living-storage": CABINETS,
  "furniture-kitchen-dining": TABLES,
  "furniture-kitchen-dining-chairs": CHAIRS,
  "furniture-kitchen-units": ["Длина", "Материал фасада", "Цвет", "Комплектация"],
  "furniture-hallway": ["Размеры", "Материал", "Цвет"],
  "furniture-office-tables": TABLES,
  "furniture-office-chairs": CHAIRS,
  "furniture-office-gaming": ["Размеры", "Материал", "Цвет", "Максимальная нагрузка"],
  "furniture-office-cabinets": CABINETS,
  "furniture-kids": ["Размеры", "Материал", "Цвет", "Возраст"],

  // Недвижимость
  "real-estate-residential-sale-apartments": APARTMENTS,
  "real-estate-residential-sale-houses": HOUSES,
  "real-estate-residential-rent-long-apartments": APARTMENTS,
  "real-estate-residential-rent-long-houses": HOUSES,
  "real-estate-residential-rent-short": [
    "Количество гостей",
    "Количество комнат",
    "Площадь",
    "Удобства",
  ],
  "real-estate-commercial": [
    "Площадь",
    "Этаж",
    "Назначение",
    "Отдельный вход",
    "Парковка",
  ],
  "real-estate-land": [
    "Площадь участка",
    "Назначение земли",
    "Коммуникации",
    "Подъезд",
  ],
  "real-estate-parking": ["Площадь", "Тип", "Материал", "Охрана"],

  // Одежда и обувь
  "clothes-women-clothing": CLOTHING,
  "clothes-women-clothing-underwear": UNDERWEAR,
  "clothes-women-shoes": SHOES,
  "clothes-men-clothing": CLOTHING,
  "clothes-men-clothing-underwear": UNDERWEAR,
  "clothes-men-shoes": SHOES,
  "clothes-kids": ["Бренд", "Размер", "Рост", "Возраст", "Цвет", "Материал", "Сезон"],
  "clothes-kids-boys-shoes": KIDS_SHOES,
  "clothes-kids-girls-shoes": KIDS_SHOES,
  "clothes-kids-babies-shoes": KIDS_SHOES,
  "clothes-sport": CLOTHING,
  "clothes-sport-shoes": SHOES,

  // Услуги и работа
  "jobs-services-vacancies": [
    "Должность",
    "График работы",
    "Опыт работы",
    "Занятость",
    "Оплата",
  ],
  "jobs-services-resumes": ["Должность", "Опыт работы", "Образование", "График работы"],
  "jobs-services-home": ["Вид работ", "Опыт", "Выезд", "Гарантия", "Единица оплаты"],
  "jobs-services-pro-personal": ["Вид услуги", "Опыт", "Формат", "Длительность"],
  "jobs-services-pro-business": ["Вид услуги", "Опыт", "Срок выполнения", "Формат"],
  "jobs-services-auto-logistics-cargo": [
    "Вид услуги",
    "Грузоподъёмность",
    "Район работы",
    "Единица оплаты",
  ],
  "jobs-services-auto-logistics-repair": [
    "Вид услуги",
    "Опыт",
    "Гарантия",
    "Район работы",
  ],

  // Ремонт и стройка
  "diy-tools-power-construction": [
    "Бренд",
    "Модель",
    "Мощность",
    "Питание",
    "Комплектация",
    "Гарантия",
  ],
  "diy-tools-power-consumables": [
    "Бренд",
    "Диаметр",
    "Длина",
    "Материал",
    "Количество в упаковке",
  ],
  "diy-tools-power-heavy": ["Бренд", "Модель", "Мощность", "Питание", "Гарантия"],
  "diy-tools-hand-tools": [
    "Бренд",
    "Тип",
    "Размер",
    "Материал",
    "Количество предметов",
  ],
  "diy-tools-hand-measuring": ["Бренд", "Длина или дальность", "Точность"],
  "diy-tools-hand-safety": [
    "Размер",
    "Материал",
    "Класс защиты",
    "Количество в упаковке",
  ],
  "diy-tools-hand-boxes": ["Материал", "Размеры", "Количество отделений"],
  "diy-tools-electric-installation": ["Марка", "Сечение", "Количество жил", "Длина"],
  "diy-tools-electric-hardware": [
    "Бренд",
    "Тип",
    "Номинальный ток",
    "Цвет",
    "Количество гнёзд",
  ],
  "diy-tools-electric-bulbs": ["Бренд", "Цоколь", "Мощность", "Цвет света", "Длина"],
  "diy-tools-plumbing-fixtures": ["Бренд", "Тип", "Материал", "Цвет", "Гарантия"],
  "diy-tools-plumbing-pipes": ["Материал", "Диаметр", "Длина", "Объём"],
  "diy-tools-plumbing-sanitary": [
    "Бренд",
    "Материал",
    "Размеры",
    "Цвет",
    "Тип установки",
  ],
  "diy-tools-materials-fasteners": ["Тип", "Диаметр", "Длина", "Количество в упаковке"],
  "diy-tools-materials-chemistry": [
    "Бренд",
    "Назначение",
    "Объём или вес",
    "Цвет",
    "Расход",
  ],
  "diy-tools-materials-finishing": [
    "Бренд",
    "Материал",
    "Размер",
    "Цвет",
    "Площадь в упаковке",
  ],

  // Сад и дача
  "garden-machinery": [
    "Бренд",
    "Модель",
    "Тип двигателя",
    "Мощность",
    "Ширина обработки",
    "Гарантия",
  ],
  "garden-tools-hand": ["Бренд", "Материал", "Длина", "Вес"],
  "garden-tools-watering": ["Бренд", "Диаметр", "Длина", "Материал"],
  "garden-tools-watering-pumps": ["Бренд", "Модель", "Мощность", "Производительность"],
  "garden-leisure-bbq": ["Материал", "Размер", "Вес", "Количество в упаковке"],
  "garden-leisure-bbq-grills": [
    "Материал",
    "Размеры",
    "Толщина металла",
    "Вид топлива",
  ],
  "garden-leisure-relax": ["Материал", "Размеры", "Цвет", "Максимальная нагрузка"],
  "garden-leisure-relax-pools": ["Тип", "Размеры", "Объём", "Комплектация"],
  "garden-plants-seeds": [
    "Сорт",
    "Количество в упаковке",
    "Срок посадки",
    "Срок созревания",
  ],
  "garden-plants-seeds-soil": SOIL_AND_FERTILIZERS,
  "garden-plants-protection-nutrients": SOIL_AND_FERTILIZERS,
  "garden-plants-protection-pesticides": [
    "Назначение",
    "Объём",
    "Действующее вещество",
  ],
  "garden-plants-greenhouses": ["Размеры", "Материал каркаса", "Покрытие"],
  "garden-decor": ["Материал", "Размеры", "Цвет"],

  // Спорт
  "sports-leisure-fitness-home": ["Бренд", "Материал", "Размер", "Нагрузка", "Цвет"],
  "sports-leisure-fitness-heavy-weights": [
    "Вес",
    "Материал",
    "Разборные",
    "Количество в наборе",
  ],
  "sports-leisure-fitness-heavy-cardio": [
    "Бренд",
    "Модель",
    "Максимальный вес пользователя",
    "Размеры",
    "Гарантия",
  ],
  "sports-leisure-fitness-heavy-bars": [
    "Материал",
    "Максимальная нагрузка",
    "Тип крепления",
  ],
  "sports-leisure-camping-gear-shelter": [
    "Бренд",
    "Количество мест",
    "Сезон",
    "Вес",
    "Размеры",
  ],
  "sports-leisure-camping-gear-mats": TOURIST_GEAR,
  "sports-leisure-camping-gear-backpacks": TOURIST_GEAR,
  "sports-leisure-camping-gear-tools": [
    "Бренд",
    "Питание",
    "Яркость",
    "Количество функций",
  ],
  "sports-leisure-camping-kitchen": ["Бренд", "Материал", "Объём", "Вес"],
  "sports-leisure-camping-fishing": ["Бренд", "Тип", "Длина", "Тест или нагрузка"],
  "sports-leisure-seasonal-summer-bicycles": [
    "Бренд",
    "Тип",
    "Диаметр колёс",
    "Размер рамы",
    "Количество скоростей",
    "Состояние",
  ],
  "sports-leisure-seasonal-summer-wheels": RIDE_GEAR,
  "sports-leisure-seasonal-summer-skates": RIDE_GEAR,
  "sports-leisure-seasonal-summer-bike-gear": ["Бренд", "Тип", "Совместимость", "Цвет"],
  "sports-leisure-seasonal-summer-water": [
    "Бренд",
    "Длина",
    "Грузоподъёмность",
    "Комплектация",
  ],
  "sports-leisure-seasonal-winter": [
    "Бренд",
    "Размер",
    "Рост или длина",
    "Уровень подготовки",
  ],
  "sports-leisure-activities-balls": BALL_GAMES,
  "sports-leisure-activities-rackets": BALL_GAMES,
  "sports-leisure-activities-combat": ["Бренд", "Размер", "Вес", "Материал"],
  "sports-leisure-activities-swimming": ["Бренд", "Размер", "Цвет", "Для кого"],
  "sports-leisure-nutrition": ["Бренд", "Вкус", "Вес", "Количество порций"],
  "sports-leisure-nutrition-bottles": ["Материал", "Объём", "Цвет"],

  // Авто
  "autos-vehicles-cars": [
    "Марка",
    "Модель",
    "Год выпуска",
    "Пробег",
    "Двигатель",
    "Коробка передач",
    "Привод",
    "Цвет",
    "Состояние",
  ],
  "autos-vehicles-moto": [
    "Марка",
    "Модель",
    "Год выпуска",
    "Пробег",
    "Объём двигателя",
    "Состояние",
  ],
  "autos-vehicles-electric": [
    "Бренд",
    "Модель",
    "Запас хода",
    "Максимальная скорость",
    "Максимальная нагрузка",
    "Состояние",
  ],
  "autos-vehicles-trucks": [
    "Марка",
    "Модель",
    "Год выпуска",
    "Пробег или моточасы",
    "Грузоподъёмность",
    "Состояние",
  ],
  "autos-wheels-tires": [
    "Бренд",
    "Сезон",
    "Ширина",
    "Профиль",
    "Диаметр",
    "Шипы",
    "Состояние",
  ],
  "autos-wheels-rims": ["Бренд", "Тип", "Диаметр", "Сверловка", "Вылет", "Состояние"],
  "autos-parts": [
    "Бренд",
    "Артикул",
    "Марка автомобиля",
    "Модель автомобиля",
    "Оригинал или аналог",
  ],
  "autos-parts-electronics-batteries": [
    "Бренд",
    "Ёмкость",
    "Пусковой ток",
    "Полярность",
    "Размеры",
  ],
  "autos-care-fluids": ["Бренд", "Вязкость", "Тип", "Объём", "Допуски"],
  "autos-care-cosmetics": ["Бренд", "Назначение", "Объём"],
  "autos-accessories": ["Бренд", "Совместимость", "Материал", "Цвет"],
  "autos-accessories-interior-dashcams": [
    "Бренд",
    "Модель",
    "Разрешение записи",
    "Количество камер",
  ],
  "autos-accessories-interior-child-seats": [
    "Бренд",
    "Группа",
    "Вес ребёнка",
    "Крепление",
    "Цвет",
  ],
  "autos-tools-emergency": ["Тип", "Комплектация", "Срок годности"],
  "autos-tools-hardware": [
    "Бренд",
    "Тип",
    "Грузоподъёмность или размер",
    "Количество предметов",
  ],

  // Цветы и подарки
  "flowers-gifts-bouquets": [
    "Состав",
    "Количество цветов",
    "Высота",
    "Цвет",
    "Упаковка",
  ],
  "flowers-gifts-bouquets-potted": ["Вид растения", "Высота", "Диаметр горшка", "Уход"],
  "flowers-gifts-edible": ["Состав", "Вес", "Срок годности", "Условия хранения"],
  "flowers-gifts-party-balloons": [
    "Количество шаров",
    "Цвет",
    "Размер",
    "Время полёта",
  ],
  "flowers-gifts-party-supplies": ["Тип", "Размер", "Количество в упаковке"],
  "flowers-gifts-items-toys": ["Высота", "Материал", "Цвет"],
  "flowers-gifts-items-beauty": GIFT_SETS,
  "flowers-gifts-items-scents": GIFT_SETS,
  "flowers-gifts-items-certificates": ["Номинал", "Срок действия", "Формат"],
  "flowers-gifts-items-souvenirs": ["Материал", "Размер"],

  // Ювелирные изделия
  "jewelry-earrings": ["Металл", "Проба", "Вставка", "Вес", "Тип замка"],
  "jewelry-rings": ["Металл", "Проба", "Размер", "Вставка", "Вес"],
  "jewelry-pendants": ["Металл", "Проба", "Вставка", "Вес", "Размер"],
  "jewelry-chains": ["Металл", "Проба", "Длина", "Плетение", "Вес"],
  "jewelry-precious": [
    "Металл",
    "Проба",
    "Камень",
    "Вес камня (караты)",
    "Вес изделия",
  ],
  "jewelry-accessories": ["Металл", "Проба", "Вставка", "Вес"],
  "jewelry-accessories-watches": ["Бренд", "Металл", "Проба", "Механизм", "Вставка"],
  "jewelry-sets": ["Металл", "Проба", "Вставка", "Состав комплекта", "Вес"],
};
