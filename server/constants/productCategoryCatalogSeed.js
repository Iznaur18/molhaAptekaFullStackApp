/**
 * Дерево подкатегорий каталога, зашитое в код (06.10.2026).
 *
 * Корни здесь НЕ создаются: `rootSlug` — слаг уже существующей корневой
 * категории на сайте (у неё плитка, картинка и товары с `productCategory`).
 * Внутри корня узлы идут «родитель раньше детей»; узел без `parentSlug` —
 * прямой ребёнок корня. Лист — узел, на который никто не ссылается как на
 * родителя; порядок в массиве = порядок показа среди соседей.
 *
 * Накатывается миграцией `20261006-catalog-category-tree` через
 * `applyProductCategoryCatalogSeed`.
 *
 * @type {{
 *   rootSlug: string;
 *   nodes: {
 *     slug: string;
 *     labelRu: string;
 *     parentSlug?: string;
 *     searchKeywords?: string[];
 *   }[];
 * }[]}
 */
export const PRODUCT_CATEGORY_CATALOG_SEED = [
  {
    rootSlug: "acses",
    nodes: [
      {
        slug: "accessories-women",
        labelRu: "Женские",
      },
      {
        slug: "accessories-women-bags",
        labelRu: "Сумки и рюкзаки",
        parentSlug: "accessories-women",
      },
      {
        slug: "accessories-women-bags-crossbody",
        labelRu: "Сумки через плечо",
        parentSlug: "accessories-women-bags",
        searchKeywords: ["кросс-боди", "кроссбоди"],
      },
      {
        slug: "accessories-women-bags-totes",
        labelRu: "Шопперы и тоуты",
        parentSlug: "accessories-women-bags",
      },
      {
        slug: "accessories-women-bags-clutches",
        labelRu: "Клатчи и вечерние сумки",
        parentSlug: "accessories-women-bags",
      },
      {
        slug: "accessories-women-bags-backpacks",
        labelRu: "Рюкзаки",
        parentSlug: "accessories-women-bags",
      },
      {
        slug: "accessories-women-wallets",
        labelRu: "Кошельки и картхолдеры",
        parentSlug: "accessories-women",
      },
      {
        slug: "accessories-women-wallets-classic",
        labelRu: "Кошельки и портмоне",
        parentSlug: "accessories-women-wallets",
      },
      {
        slug: "accessories-women-wallets-holders",
        labelRu: "Визитницы и картхолдеры",
        parentSlug: "accessories-women-wallets",
      },
      {
        slug: "accessories-women-wearables",
        labelRu: "Шапки, шарфы и перчатки",
        parentSlug: "accessories-women",
      },
      {
        slug: "accessories-women-wearables-hats",
        labelRu: "Шапки, береты и панамы",
        parentSlug: "accessories-women-wearables",
      },
      {
        slug: "accessories-women-wearables-scarves",
        labelRu: "Шарфы, платки и палантины",
        parentSlug: "accessories-women-wearables",
      },
      {
        slug: "accessories-women-wearables-gloves",
        labelRu: "Перчатки и варежки",
        parentSlug: "accessories-women-wearables",
      },
      {
        slug: "accessories-women-jewelry",
        labelRu: "Бижутерия",
        parentSlug: "accessories-women",
      },
      {
        slug: "accessories-women-jewelry-earrings",
        labelRu: "Серьги",
        parentSlug: "accessories-women-jewelry",
      },
      {
        slug: "accessories-women-jewelry-rings",
        labelRu: "Кольца",
        parentSlug: "accessories-women-jewelry",
      },
      {
        slug: "accessories-women-jewelry-necklaces",
        labelRu: "Колье, цепочки и кулоны",
        parentSlug: "accessories-women-jewelry",
        searchKeywords: ["ожерелье"],
      },
      {
        slug: "accessories-women-jewelry-bracelets",
        labelRu: "Браслеты",
        parentSlug: "accessories-women-jewelry",
      },
      {
        slug: "accessories-women-jewelry-hair",
        labelRu: "Аксессуары для волос",
        parentSlug: "accessories-women-jewelry",
        searchKeywords: ["заколка", "резинка", "ободок"],
      },
      {
        slug: "accessories-women-belts",
        labelRu: "Ремни и пояса",
        parentSlug: "accessories-women",
      },
      {
        slug: "accessories-men",
        labelRu: "Мужские",
      },
      {
        slug: "accessories-men-bags",
        labelRu: "Сумки и рюкзаки",
        parentSlug: "accessories-men",
      },
      {
        slug: "accessories-men-bags-backpacks",
        labelRu: "Рюкзаки",
        parentSlug: "accessories-men-bags",
      },
      {
        slug: "accessories-men-bags-messengers",
        labelRu: "Сумки через плечо",
        parentSlug: "accessories-men-bags",
        searchKeywords: ["мессенджер", "планшет"],
      },
      {
        slug: "accessories-men-bags-briefcases",
        labelRu: "Портфели и сумки для ноутбука",
        parentSlug: "accessories-men-bags",
      },
      {
        slug: "accessories-men-bags-waist",
        labelRu: "Поясные сумки и слинги",
        parentSlug: "accessories-men-bags",
      },
      {
        slug: "accessories-men-wallets",
        labelRu: "Кошельки и зажимы",
        parentSlug: "accessories-men",
      },
      {
        slug: "accessories-men-wallets-classic",
        labelRu: "Кошельки и портмоне",
        parentSlug: "accessories-men-wallets",
      },
      {
        slug: "accessories-men-wallets-clips",
        labelRu: "Картхолдеры и зажимы для денег",
        parentSlug: "accessories-men-wallets",
      },
      {
        slug: "accessories-men-wearables",
        labelRu: "Шапки, шарфы и перчатки",
        parentSlug: "accessories-men",
      },
      {
        slug: "accessories-men-wearables-hats",
        labelRu: "Кепки и шапки",
        parentSlug: "accessories-men-wearables",
        searchKeywords: ["бейсболка"],
      },
      {
        slug: "accessories-men-wearables-scarves",
        labelRu: "Шарфы",
        parentSlug: "accessories-men-wearables",
      },
      {
        slug: "accessories-men-wearables-gloves",
        labelRu: "Перчатки",
        parentSlug: "accessories-men-wearables",
      },
      {
        slug: "accessories-men-haberdashery",
        labelRu: "Ремни и галстуки",
        parentSlug: "accessories-men",
      },
      {
        slug: "accessories-men-haberdashery-belts",
        labelRu: "Ремни",
        parentSlug: "accessories-men-haberdashery",
      },
      {
        slug: "accessories-men-haberdashery-ties",
        labelRu: "Галстуки и бабочки",
        parentSlug: "accessories-men-haberdashery",
      },
      {
        slug: "accessories-men-haberdashery-cufflinks",
        labelRu: "Запонки и зажимы для галстука",
        parentSlug: "accessories-men-haberdashery",
      },
      {
        slug: "accessories-men-haberdashery-suspenders",
        labelRu: "Подтяжки",
        parentSlug: "accessories-men-haberdashery",
      },
      {
        slug: "accessories-kids",
        labelRu: "Детские",
      },
      {
        slug: "accessories-kids-bags",
        labelRu: "Рюкзаки и сумки",
        parentSlug: "accessories-kids",
      },
      {
        slug: "accessories-kids-bags-school",
        labelRu: "Школьные рюкзаки и ранцы",
        parentSlug: "accessories-kids-bags",
      },
      {
        slug: "accessories-kids-bags-casual",
        labelRu: "Сумочки и мешки для обуви",
        parentSlug: "accessories-kids-bags",
        searchKeywords: ["сменка"],
      },
      {
        slug: "accessories-kids-wearables",
        labelRu: "Шапки, шарфы и варежки",
        parentSlug: "accessories-kids",
      },
      {
        slug: "accessories-kids-wearables-hats",
        labelRu: "Шапки, панамы и кепки",
        parentSlug: "accessories-kids-wearables",
      },
      {
        slug: "accessories-kids-wearables-warm",
        labelRu: "Шарфы, снуды и варежки",
        parentSlug: "accessories-kids-wearables",
        searchKeywords: ["рукавицы"],
      },
      {
        slug: "accessories-kids-jewelry",
        labelRu: "Бижутерия и заколки",
        parentSlug: "accessories-kids",
      },
      {
        slug: "accessories-watches",
        labelRu: "Часы",
      },
      {
        slug: "accessories-watches-classic",
        labelRu: "Наручные часы",
        parentSlug: "accessories-watches",
      },
      {
        slug: "accessories-watches-smart",
        labelRu: "Смарт-часы и фитнес-браслеты",
        parentSlug: "accessories-watches",
      },
      {
        slug: "accessories-watches-straps",
        labelRu: "Ремешки для часов",
        parentSlug: "accessories-watches",
      },
      {
        slug: "accessories-eyewear",
        labelRu: "Очки",
      },
      {
        slug: "accessories-eyewear-sun",
        labelRu: "Солнцезащитные очки",
        parentSlug: "accessories-eyewear",
      },
      {
        slug: "accessories-eyewear-pc",
        labelRu: "Очки для компьютера",
        parentSlug: "accessories-eyewear",
      },
      {
        slug: "accessories-eyewear-cases",
        labelRu: "Футляры и цепочки для очков",
        parentSlug: "accessories-eyewear",
      },
      {
        slug: "accessories-travel",
        labelRu: "Багаж и зонты",
      },
      {
        slug: "accessories-travel-luggage",
        labelRu: "Чемоданы и дорожные сумки",
        parentSlug: "accessories-travel",
      },
      {
        slug: "accessories-travel-umbrellas",
        labelRu: "Зонты",
        parentSlug: "accessories-travel",
      },
      {
        slug: "accessories-travel-covers",
        labelRu: "Обложки для документов",
        parentSlug: "accessories-travel",
        searchKeywords: ["паспорт"],
      },
      {
        slug: "accessories-travel-keychains",
        labelRu: "Брелоки и ключницы",
        parentSlug: "accessories-travel",
      },
    ],
  },
  {
    rootSlug: "apteka",
    nodes: [
      {
        slug: "pharmacy-meds",
        labelRu: "Лекарства",
      },
      {
        slug: "pharmacy-meds-cold",
        labelRu: "Простуда и грипп",
        parentSlug: "pharmacy-meds",
      },
      {
        slug: "pharmacy-meds-cold-antiviral",
        labelRu: "Жаропонижающие и противовирусные",
        parentSlug: "pharmacy-meds-cold",
      },
      {
        slug: "pharmacy-meds-cold-nasal",
        labelRu: "Капли и спреи для носа",
        parentSlug: "pharmacy-meds-cold",
      },
      {
        slug: "pharmacy-meds-cold-cough",
        labelRu: "От кашля",
        parentSlug: "pharmacy-meds-cold",
        searchKeywords: ["сироп", "пастилки"],
      },
      {
        slug: "pharmacy-meds-cold-throat",
        labelRu: "От боли в горле",
        parentSlug: "pharmacy-meds-cold",
      },
      {
        slug: "pharmacy-meds-pain",
        labelRu: "Обезболивающие",
        parentSlug: "pharmacy-meds",
      },
      {
        slug: "pharmacy-meds-pain-general",
        labelRu: "От головной и зубной боли",
        parentSlug: "pharmacy-meds-pain",
      },
      {
        slug: "pharmacy-meds-pain-spasm",
        labelRu: "Спазмолитики",
        parentSlug: "pharmacy-meds-pain",
      },
      {
        slug: "pharmacy-meds-pain-joints",
        labelRu: "Мази и гели для суставов",
        parentSlug: "pharmacy-meds-pain",
      },
      {
        slug: "pharmacy-meds-digestion",
        labelRu: "Желудок и пищеварение",
        parentSlug: "pharmacy-meds",
        searchKeywords: ["жкт"],
      },
      {
        slug: "pharmacy-meds-digestion-enzymes",
        labelRu: "Ферменты и средства от изжоги",
        parentSlug: "pharmacy-meds-digestion",
      },
      {
        slug: "pharmacy-meds-digestion-sorbents",
        labelRu: "Сорбенты",
        parentSlug: "pharmacy-meds-digestion",
        searchKeywords: ["детокс"],
      },
      {
        slug: "pharmacy-meds-digestion-probiotics",
        labelRu: "Пробиотики и пребиотики",
        parentSlug: "pharmacy-meds-digestion",
      },
      {
        slug: "pharmacy-meds-heart",
        labelRu: "Сердце и сосуды",
        parentSlug: "pharmacy-meds",
      },
      {
        slug: "pharmacy-meds-heart-pressure",
        labelRu: "От давления",
        parentSlug: "pharmacy-meds-heart",
      },
      {
        slug: "pharmacy-meds-heart-thinners",
        labelRu: "Для разжижения крови",
        parentSlug: "pharmacy-meds-heart",
      },
      {
        slug: "pharmacy-meds-heart-sedatives",
        labelRu: "Успокоительные",
        parentSlug: "pharmacy-meds-heart",
        searchKeywords: ["сердечные капли"],
      },
      {
        slug: "pharmacy-meds-allergy",
        labelRu: "От аллергии",
        parentSlug: "pharmacy-meds",
      },
      {
        slug: "pharmacy-meds-drops",
        labelRu: "Капли для глаз и ушей",
        parentSlug: "pharmacy-meds",
      },
      {
        slug: "pharmacy-vits",
        labelRu: "Витамины и БАДы",
      },
      {
        slug: "pharmacy-vits-complex",
        labelRu: "Мультивитамины",
        parentSlug: "pharmacy-vits",
      },
      {
        slug: "pharmacy-vits-complex-women",
        labelRu: "Витамины для женщин",
        parentSlug: "pharmacy-vits-complex",
      },
      {
        slug: "pharmacy-vits-complex-men",
        labelRu: "Витамины для мужчин",
        parentSlug: "pharmacy-vits-complex",
      },
      {
        slug: "pharmacy-vits-complex-kids",
        labelRu: "Витамины для детей",
        parentSlug: "pharmacy-vits-complex",
      },
      {
        slug: "pharmacy-vits-minerals",
        labelRu: "Витамины и минералы",
        parentSlug: "pharmacy-vits",
      },
      {
        slug: "pharmacy-vits-minerals-d3-omega",
        labelRu: "Витамин D и Омега-3",
        parentSlug: "pharmacy-vits-minerals",
      },
      {
        slug: "pharmacy-vits-minerals-essential",
        labelRu: "Магний, кальций и цинк",
        parentSlug: "pharmacy-vits-minerals",
      },
      {
        slug: "pharmacy-vits-minerals-c-b",
        labelRu: "Витамины C и группы B",
        parentSlug: "pharmacy-vits-minerals",
      },
      {
        slug: "pharmacy-vits-energy",
        labelRu: "Иммунитет и энергия",
        parentSlug: "pharmacy-vits",
      },
      {
        slug: "pharmacy-devices",
        labelRu: "Медтехника и изделия",
      },
      {
        slug: "pharmacy-devices-tech",
        labelRu: "Приборы для дома",
        parentSlug: "pharmacy-devices",
      },
      {
        slug: "pharmacy-devices-tech-monitors",
        labelRu: "Тонометры и пульсоксиметры",
        parentSlug: "pharmacy-devices-tech",
      },
      {
        slug: "pharmacy-devices-tech-thermometers",
        labelRu: "Термометры",
        parentSlug: "pharmacy-devices-tech",
        searchKeywords: ["градусник"],
      },
      {
        slug: "pharmacy-devices-tech-nebulizers",
        labelRu: "Ингаляторы и небулайзеры",
        parentSlug: "pharmacy-devices-tech",
      },
      {
        slug: "pharmacy-devices-tech-glucometers",
        labelRu: "Глюкометры и тест-полоски",
        parentSlug: "pharmacy-devices-tech",
      },
      {
        slug: "pharmacy-devices-firstaid",
        labelRu: "Перевязка и аптечка",
        parentSlug: "pharmacy-devices",
      },
      {
        slug: "pharmacy-devices-firstaid-bandages",
        labelRu: "Пластыри и бинты",
        parentSlug: "pharmacy-devices-firstaid",
      },
      {
        slug: "pharmacy-devices-firstaid-antiseptics",
        labelRu: "Антисептики",
        parentSlug: "pharmacy-devices-firstaid",
        searchKeywords: ["спиртовые салфетки"],
      },
      {
        slug: "pharmacy-devices-firstaid-syringes",
        labelRu: "Шприцы и иглы",
        parentSlug: "pharmacy-devices-firstaid",
      },
      {
        slug: "pharmacy-devices-orthopedics",
        labelRu: "Ортопедия",
        parentSlug: "pharmacy-devices",
        searchKeywords: ["бандаж", "корсет", "стельки", "трость"],
      },
      {
        slug: "pharmacy-care",
        labelRu: "Гигиена и уход",
      },
      {
        slug: "pharmacy-care-cosmetics",
        labelRu: "Аптечная косметика",
        parentSlug: "pharmacy-care",
      },
      {
        slug: "pharmacy-care-cosmetics-face",
        labelRu: "Уход за проблемной кожей",
        parentSlug: "pharmacy-care-cosmetics",
      },
      {
        slug: "pharmacy-care-cosmetics-hair",
        labelRu: "Лечебные шампуни",
        parentSlug: "pharmacy-care-cosmetics",
      },
      {
        slug: "pharmacy-care-hygiene",
        labelRu: "Личная гигиена",
        parentSlug: "pharmacy-care",
      },
      {
        slug: "pharmacy-care-hygiene-condoms",
        labelRu: "Контрацепция и лубриканты",
        parentSlug: "pharmacy-care-hygiene",
        searchKeywords: ["презервативы"],
      },
      {
        slug: "pharmacy-care-hygiene-oral",
        labelRu: "Уход за полостью рта",
        parentSlug: "pharmacy-care-hygiene",
        searchKeywords: ["зубная паста", "щётка"],
      },
      {
        slug: "pharmacy-care-hygiene-women",
        labelRu: "Женская гигиена",
        parentSlug: "pharmacy-care-hygiene",
      },
    ],
  },
  {
    rootSlug: "bitovaya",
    nodes: [
      {
        slug: "appliances-large",
        labelRu: "Крупная техника",
      },
      {
        slug: "appliances-large-cooling",
        labelRu: "Холодильники и морозильники",
        parentSlug: "appliances-large",
      },
      {
        slug: "appliances-large-cooling-refrigerators",
        labelRu: "Холодильники",
        parentSlug: "appliances-large-cooling",
      },
      {
        slug: "appliances-large-cooling-freezers",
        labelRu: "Морозильные камеры и лари",
        parentSlug: "appliances-large-cooling",
      },
      {
        slug: "appliances-large-laundry",
        labelRu: "Стирка и сушка",
        parentSlug: "appliances-large",
      },
      {
        slug: "appliances-large-laundry-washers",
        labelRu: "Стиральные машины",
        parentSlug: "appliances-large-laundry",
      },
      {
        slug: "appliances-large-laundry-dryers",
        labelRu: "Сушильные машины",
        parentSlug: "appliances-large-laundry",
      },
      {
        slug: "appliances-large-cooking",
        labelRu: "Плиты и духовки",
        parentSlug: "appliances-large",
      },
      {
        slug: "appliances-large-cooking-stoves",
        labelRu: "Кухонные плиты",
        parentSlug: "appliances-large-cooking",
      },
      {
        slug: "appliances-large-cooking-ovens",
        labelRu: "Духовые шкафы",
        parentSlug: "appliances-large-cooking",
      },
      {
        slug: "appliances-large-cooking-hobs",
        labelRu: "Варочные панели",
        parentSlug: "appliances-large-cooking",
      },
      {
        slug: "appliances-large-cooking-hoods",
        labelRu: "Вытяжки",
        parentSlug: "appliances-large-cooking",
      },
      {
        slug: "appliances-large-dishwashers",
        labelRu: "Посудомоечные машины",
        parentSlug: "appliances-large",
      },
      {
        slug: "appliances-kitchen",
        labelRu: "Техника для кухни",
      },
      {
        slug: "appliances-kitchen-beverages",
        labelRu: "Чайники и кофемашины",
        parentSlug: "appliances-kitchen",
      },
      {
        slug: "appliances-kitchen-beverages-kettles",
        labelRu: "Чайники и термопоты",
        parentSlug: "appliances-kitchen-beverages",
      },
      {
        slug: "appliances-kitchen-beverages-coffee",
        labelRu: "Кофемашины и кофеварки",
        parentSlug: "appliances-kitchen-beverages",
      },
      {
        slug: "appliances-kitchen-beverages-juicers",
        labelRu: "Соковыжималки",
        parentSlug: "appliances-kitchen-beverages",
      },
      {
        slug: "appliances-kitchen-heating",
        labelRu: "Печи и мультиварки",
        parentSlug: "appliances-kitchen",
      },
      {
        slug: "appliances-kitchen-heating-microwaves",
        labelRu: "Микроволновые печи",
        parentSlug: "appliances-kitchen-heating",
        searchKeywords: ["свч"],
      },
      {
        slug: "appliances-kitchen-heating-multicookers",
        labelRu: "Мультиварки и пароварки",
        parentSlug: "appliances-kitchen-heating",
      },
      {
        slug: "appliances-kitchen-heating-toasters-grills",
        labelRu: "Тостеры и грили",
        parentSlug: "appliances-kitchen-heating",
      },
      {
        slug: "appliances-kitchen-heating-air-fryers",
        labelRu: "Аэрогрили",
        parentSlug: "appliances-kitchen-heating",
      },
      {
        slug: "appliances-kitchen-prep",
        labelRu: "Блендеры и мясорубки",
        parentSlug: "appliances-kitchen",
      },
      {
        slug: "appliances-kitchen-prep-blenders",
        labelRu: "Блендеры и миксеры",
        parentSlug: "appliances-kitchen-prep",
      },
      {
        slug: "appliances-kitchen-prep-grinders",
        labelRu: "Мясорубки",
        parentSlug: "appliances-kitchen-prep",
      },
      {
        slug: "appliances-kitchen-prep-processors",
        labelRu: "Кухонные комбайны",
        parentSlug: "appliances-kitchen-prep",
      },
      {
        slug: "appliances-home",
        labelRu: "Техника для дома",
      },
      {
        slug: "appliances-home-cleaning",
        labelRu: "Пылесосы",
        parentSlug: "appliances-home",
      },
      {
        slug: "appliances-home-cleaning-robots",
        labelRu: "Роботы-пылесосы",
        parentSlug: "appliances-home-cleaning",
      },
      {
        slug: "appliances-home-cleaning-stick-vacuums",
        labelRu: "Вертикальные пылесосы",
        parentSlug: "appliances-home-cleaning",
        searchKeywords: ["беспроводной"],
      },
      {
        slug: "appliances-home-cleaning-vacuums",
        labelRu: "Обычные пылесосы",
        parentSlug: "appliances-home-cleaning",
        searchKeywords: ["с мешком", "с контейнером"],
      },
      {
        slug: "appliances-home-garment",
        labelRu: "Утюги и отпариватели",
        parentSlug: "appliances-home",
      },
      {
        slug: "appliances-home-garment-irons",
        labelRu: "Утюги",
        parentSlug: "appliances-home-garment",
      },
      {
        slug: "appliances-home-garment-steamers",
        labelRu: "Отпариватели и парогенераторы",
        parentSlug: "appliances-home-garment",
      },
      {
        slug: "appliances-home-sewing",
        labelRu: "Швейные машины",
        parentSlug: "appliances-home",
        searchKeywords: ["оверлок"],
      },
      {
        slug: "appliances-climate",
        labelRu: "Климат",
      },
      {
        slug: "appliances-climate-cooling",
        labelRu: "Кондиционеры и вентиляторы",
        parentSlug: "appliances-climate",
      },
      {
        slug: "appliances-climate-cooling-ac",
        labelRu: "Кондиционеры и сплит-системы",
        parentSlug: "appliances-climate-cooling",
      },
      {
        slug: "appliances-climate-cooling-fans",
        labelRu: "Вентиляторы",
        parentSlug: "appliances-climate-cooling",
      },
      {
        slug: "appliances-climate-heating",
        labelRu: "Обогрев и горячая вода",
        parentSlug: "appliances-climate",
      },
      {
        slug: "appliances-climate-heating-heaters",
        labelRu: "Обогреватели и конвекторы",
        parentSlug: "appliances-climate-heating",
      },
      {
        slug: "appliances-climate-heating-boilers",
        labelRu: "Водонагреватели",
        parentSlug: "appliances-climate-heating",
        searchKeywords: ["бойлер"],
      },
      {
        slug: "appliances-climate-air",
        labelRu: "Увлажнители и очистители воздуха",
        parentSlug: "appliances-climate",
      },
      {
        slug: "appliances-beauty",
        labelRu: "Красота и здоровье",
      },
      {
        slug: "appliances-beauty-hair",
        labelRu: "Для волос",
        parentSlug: "appliances-beauty",
      },
      {
        slug: "appliances-beauty-hair-dryers",
        labelRu: "Фены и фен-щётки",
        parentSlug: "appliances-beauty-hair",
      },
      {
        slug: "appliances-beauty-hair-stylers",
        labelRu: "Выпрямители и плойки",
        parentSlug: "appliances-beauty-hair",
      },
      {
        slug: "appliances-beauty-shaving",
        labelRu: "Бритьё и стрижка",
        parentSlug: "appliances-beauty",
      },
      {
        slug: "appliances-beauty-shaving-clippers",
        labelRu: "Машинки для стрижки и триммеры",
        parentSlug: "appliances-beauty-shaving",
      },
      {
        slug: "appliances-beauty-shaving-razors",
        labelRu: "Электробритвы",
        parentSlug: "appliances-beauty-shaving",
      },
      {
        slug: "appliances-beauty-shaving-epilators",
        labelRu: "Эпиляторы",
        parentSlug: "appliances-beauty-shaving",
      },
      {
        slug: "appliances-beauty-oral",
        labelRu: "Уход за зубами",
        parentSlug: "appliances-beauty",
      },
      {
        slug: "appliances-beauty-oral-brushes",
        labelRu: "Электрические зубные щётки",
        parentSlug: "appliances-beauty-oral",
      },
      {
        slug: "appliances-beauty-oral-irrigators",
        labelRu: "Ирригаторы",
        parentSlug: "appliances-beauty-oral",
      },
    ],
  },
  {
    rootSlug: "himiya",
    nodes: [
      {
        slug: "household-hygiene-laundry",
        labelRu: "Стирка",
      },
      {
        slug: "household-hygiene-laundry-wash",
        labelRu: "Средства для стирки",
        parentSlug: "household-hygiene-laundry",
      },
      {
        slug: "household-hygiene-laundry-wash-powders",
        labelRu: "Стиральные порошки",
        parentSlug: "household-hygiene-laundry-wash",
      },
      {
        slug: "household-hygiene-laundry-wash-liquids",
        labelRu: "Гели и капсулы для стирки",
        parentSlug: "household-hygiene-laundry-wash",
      },
      {
        slug: "household-hygiene-laundry-additives",
        labelRu: "Кондиционеры и отбеливатели",
        parentSlug: "household-hygiene-laundry",
      },
      {
        slug: "household-hygiene-laundry-additives-softeners",
        labelRu: "Кондиционеры для белья",
        parentSlug: "household-hygiene-laundry-additives",
        searchKeywords: ["ополаскиватель"],
      },
      {
        slug: "household-hygiene-laundry-additives-stain-removers",
        labelRu: "Пятновыводители и отбеливатели",
        parentSlug: "household-hygiene-laundry-additives",
      },
      {
        slug: "household-hygiene-cleaning",
        labelRu: "Уборка",
      },
      {
        slug: "household-hygiene-cleaning-dishwashing",
        labelRu: "Для посуды",
        parentSlug: "household-hygiene-cleaning",
      },
      {
        slug: "household-hygiene-cleaning-dishwashing-manual",
        labelRu: "Средства для мытья посуды",
        parentSlug: "household-hygiene-cleaning-dishwashing",
      },
      {
        slug: "household-hygiene-cleaning-dishwashing-dishwasher",
        labelRu: "Для посудомоечных машин",
        parentSlug: "household-hygiene-cleaning-dishwashing",
        searchKeywords: ["таблетки", "соль"],
      },
      {
        slug: "household-hygiene-cleaning-surfaces",
        labelRu: "Для поверхностей",
        parentSlug: "household-hygiene-cleaning",
      },
      {
        slug: "household-hygiene-cleaning-surfaces-kitchen",
        labelRu: "Для кухни и плит",
        parentSlug: "household-hygiene-cleaning-surfaces",
      },
      {
        slug: "household-hygiene-cleaning-surfaces-bathroom",
        labelRu: "Для ванной и туалета",
        parentSlug: "household-hygiene-cleaning-surfaces",
        searchKeywords: ["сантехника", "унитаз"],
      },
      {
        slug: "household-hygiene-cleaning-surfaces-floors-windows",
        labelRu: "Для полов и стёкол",
        parentSlug: "household-hygiene-cleaning-surfaces",
      },
      {
        slug: "household-hygiene-cleaning-air-bugs",
        labelRu: "Освежители и защита от насекомых",
        parentSlug: "household-hygiene-cleaning",
      },
      {
        slug: "household-hygiene-cleaning-air-bugs-fresheners",
        labelRu: "Освежители воздуха",
        parentSlug: "household-hygiene-cleaning-air-bugs",
        searchKeywords: ["аромадиффузор"],
      },
      {
        slug: "household-hygiene-cleaning-air-bugs-repellents",
        labelRu: "От насекомых и грызунов",
        parentSlug: "household-hygiene-cleaning-air-bugs",
      },
      {
        slug: "household-hygiene-household",
        labelRu: "Бумага и хозтовары",
      },
      {
        slug: "household-hygiene-household-paper",
        labelRu: "Бумажные изделия",
        parentSlug: "household-hygiene-household",
      },
      {
        slug: "household-hygiene-household-paper-toilet",
        labelRu: "Туалетная бумага",
        parentSlug: "household-hygiene-household-paper",
      },
      {
        slug: "household-hygiene-household-paper-towels-tissues",
        labelRu: "Бумажные полотенца и салфетки",
        parentSlug: "household-hygiene-household-paper",
      },
      {
        slug: "household-hygiene-household-paper-wet-wipes",
        labelRu: "Влажные салфетки",
        parentSlug: "household-hygiene-household-paper",
      },
      {
        slug: "household-hygiene-household-supplies",
        labelRu: "Инвентарь для уборки",
        parentSlug: "household-hygiene-household",
      },
      {
        slug: "household-hygiene-household-supplies-sponges-cloths",
        labelRu: "Губки и тряпки",
        parentSlug: "household-hygiene-household-supplies",
      },
      {
        slug: "household-hygiene-household-supplies-trash-bags",
        labelRu: "Мешки для мусора",
        parentSlug: "household-hygiene-household-supplies",
      },
      {
        slug: "household-hygiene-household-supplies-gloves",
        labelRu: "Хозяйственные перчатки",
        parentSlug: "household-hygiene-household-supplies",
      },
      {
        slug: "household-hygiene-household-supplies-mops",
        labelRu: "Швабры, вёдра и щётки",
        parentSlug: "household-hygiene-household-supplies",
      },
      {
        slug: "household-hygiene-personal",
        labelRu: "Личная гигиена",
      },
      {
        slug: "household-hygiene-personal-body",
        labelRu: "Мыло и гели для душа",
        parentSlug: "household-hygiene-personal",
      },
      {
        slug: "household-hygiene-personal-body-soap",
        labelRu: "Мыло",
        parentSlug: "household-hygiene-personal-body",
      },
      {
        slug: "household-hygiene-personal-body-wash",
        labelRu: "Гели для душа и пена для ванн",
        parentSlug: "household-hygiene-personal-body",
      },
      {
        slug: "household-hygiene-personal-body-deodorants",
        labelRu: "Дезодоранты",
        parentSlug: "household-hygiene-personal-body",
        searchKeywords: ["антиперспирант"],
      },
      {
        slug: "household-hygiene-personal-hair",
        labelRu: "Для волос",
        parentSlug: "household-hygiene-personal",
      },
      {
        slug: "household-hygiene-personal-hair-shampoos",
        labelRu: "Шампуни",
        parentSlug: "household-hygiene-personal-hair",
      },
      {
        slug: "household-hygiene-personal-hair-conditioners",
        labelRu: "Бальзамы и маски для волос",
        parentSlug: "household-hygiene-personal-hair",
        searchKeywords: ["кондиционер"],
      },
      {
        slug: "household-hygiene-personal-oral",
        labelRu: "Для зубов",
        parentSlug: "household-hygiene-personal",
      },
      {
        slug: "household-hygiene-personal-oral-pastes",
        labelRu: "Зубные пасты",
        parentSlug: "household-hygiene-personal-oral",
      },
      {
        slug: "household-hygiene-personal-oral-brushes-floss",
        labelRu: "Зубные щётки и нити",
        parentSlug: "household-hygiene-personal-oral",
      },
      {
        slug: "household-hygiene-personal-oral-rinses",
        labelRu: "Ополаскиватели для рта",
        parentSlug: "household-hygiene-personal-oral",
      },
      {
        slug: "household-hygiene-personal-shaving",
        labelRu: "Бритьё",
        parentSlug: "household-hygiene-personal",
      },
      {
        slug: "household-hygiene-personal-shaving-razors",
        labelRu: "Станки и лезвия",
        parentSlug: "household-hygiene-personal-shaving",
      },
      {
        slug: "household-hygiene-personal-shaving-creams",
        labelRu: "Пены и гели для бритья",
        parentSlug: "household-hygiene-personal-shaving",
        searchKeywords: ["лосьон после бритья"],
      },
      {
        slug: "household-hygiene-personal-women",
        labelRu: "Женская гигиена",
        parentSlug: "household-hygiene-personal",
      },
      {
        slug: "household-hygiene-personal-women-pads-tampons",
        labelRu: "Прокладки и тампоны",
        parentSlug: "household-hygiene-personal-women",
      },
      {
        slug: "household-hygiene-personal-women-intimate",
        labelRu: "Интимная гигиена",
        parentSlug: "household-hygiene-personal-women",
      },
      {
        slug: "household-hygiene-personal-baby",
        labelRu: "Подгузники и детская гигиена",
        parentSlug: "household-hygiene-personal",
        searchKeywords: ["памперсы"],
      },
    ],
  },
  {
    rootSlug: "home",
    nodes: [
      {
        slug: "home-textiles",
        labelRu: "Текстиль",
      },
      {
        slug: "home-textiles-bedroom",
        labelRu: "Для спальни",
        parentSlug: "home-textiles",
      },
      {
        slug: "home-textiles-bedroom-sets",
        labelRu: "Постельное бельё",
        parentSlug: "home-textiles-bedroom",
      },
      {
        slug: "home-textiles-bedroom-pillows-duvets",
        labelRu: "Подушки и одеяла",
        parentSlug: "home-textiles-bedroom",
      },
      {
        slug: "home-textiles-bedroom-blankets",
        labelRu: "Пледы и покрывала",
        parentSlug: "home-textiles-bedroom",
        searchKeywords: ["простыня"],
      },
      {
        slug: "home-textiles-utility",
        labelRu: "Для ванной и кухни",
        parentSlug: "home-textiles",
      },
      {
        slug: "home-textiles-utility-towels",
        labelRu: "Полотенца",
        parentSlug: "home-textiles-utility",
      },
      {
        slug: "home-textiles-utility-kitchen",
        labelRu: "Скатерти и кухонный текстиль",
        parentSlug: "home-textiles-utility",
        searchKeywords: ["прихватка", "салфетка"],
      },
      {
        slug: "home-textiles-utility-mats",
        labelRu: "Коврики для ванной",
        parentSlug: "home-textiles-utility",
      },
      {
        slug: "home-textiles-windows",
        labelRu: "Шторы и жалюзи",
        parentSlug: "home-textiles",
      },
      {
        slug: "home-textiles-windows-curtains",
        labelRu: "Шторы и тюль",
        parentSlug: "home-textiles-windows",
        searchKeywords: ["портьеры"],
      },
      {
        slug: "home-textiles-windows-blinds",
        labelRu: "Жалюзи и рулонные шторы",
        parentSlug: "home-textiles-windows",
      },
      {
        slug: "home-textiles-carpets",
        labelRu: "Ковры",
        parentSlug: "home-textiles",
        searchKeywords: ["палас", "дорожка"],
      },
      {
        slug: "home-tableware",
        labelRu: "Посуда",
      },
      {
        slug: "home-tableware-cooking",
        labelRu: "Для готовки",
        parentSlug: "home-tableware",
      },
      {
        slug: "home-tableware-cooking-pots-pans",
        labelRu: "Кастрюли и сковороды",
        parentSlug: "home-tableware-cooking",
        searchKeywords: ["ковш"],
      },
      {
        slug: "home-tableware-cooking-bakeware",
        labelRu: "Формы для выпечки",
        parentSlug: "home-tableware-cooking",
      },
      {
        slug: "home-tableware-cooking-knives",
        labelRu: "Ножи и разделочные доски",
        parentSlug: "home-tableware-cooking",
      },
      {
        slug: "home-tableware-serving",
        labelRu: "Сервировка",
        parentSlug: "home-tableware",
      },
      {
        slug: "home-tableware-serving-plates",
        labelRu: "Тарелки и салатники",
        parentSlug: "home-tableware-serving",
      },
      {
        slug: "home-tableware-serving-cutlery",
        labelRu: "Столовые приборы",
        parentSlug: "home-tableware-serving",
        searchKeywords: ["ложки", "вилки"],
      },
      {
        slug: "home-tableware-serving-glasses",
        labelRu: "Бокалы и стаканы",
        parentSlug: "home-tableware-serving",
        searchKeywords: ["фужер"],
      },
      {
        slug: "home-tableware-serving-tea-coffee",
        labelRu: "Кружки и чайники",
        parentSlug: "home-tableware-serving",
      },
      {
        slug: "home-tableware-storage",
        labelRu: "Хранение продуктов",
        parentSlug: "home-tableware",
      },
      {
        slug: "home-tableware-storage-containers",
        labelRu: "Контейнеры и ланч-боксы",
        parentSlug: "home-tableware-storage",
      },
      {
        slug: "home-tableware-storage-jars",
        labelRu: "Банки для специй и круп",
        parentSlug: "home-tableware-storage",
      },
      {
        slug: "home-decor",
        labelRu: "Декор и освещение",
      },
      {
        slug: "home-decor-lighting",
        labelRu: "Освещение",
        parentSlug: "home-decor",
      },
      {
        slug: "home-decor-lighting-ceiling",
        labelRu: "Люстры и потолочные светильники",
        parentSlug: "home-decor-lighting",
      },
      {
        slug: "home-decor-lighting-lamps",
        labelRu: "Настольные лампы и ночники",
        parentSlug: "home-decor-lighting",
      },
      {
        slug: "home-decor-lighting-floor-wall",
        labelRu: "Торшеры и бра",
        parentSlug: "home-decor-lighting",
      },
      {
        slug: "home-decor-ambience",
        labelRu: "Декор",
        parentSlug: "home-decor",
      },
      {
        slug: "home-decor-ambience-scents",
        labelRu: "Свечи и ароматы для дома",
        parentSlug: "home-decor-ambience",
        searchKeywords: ["диффузор", "подсвечник"],
      },
      {
        slug: "home-decor-ambience-vases",
        labelRu: "Вазы и искусственные цветы",
        parentSlug: "home-decor-ambience",
        searchKeywords: ["кашпо"],
      },
      {
        slug: "home-decor-ambience-wall-art",
        labelRu: "Картины, постеры и часы",
        parentSlug: "home-decor-ambience",
      },
      {
        slug: "home-decor-ambience-mirrors",
        labelRu: "Зеркала",
        parentSlug: "home-decor-ambience",
      },
      {
        slug: "home-storage",
        labelRu: "Хранение и порядок",
      },
      {
        slug: "home-storage-wardrobe",
        labelRu: "Для одежды",
        parentSlug: "home-storage",
      },
      {
        slug: "home-storage-wardrobe-boxes",
        labelRu: "Коробки и корзины для хранения",
        parentSlug: "home-storage-wardrobe",
        searchKeywords: ["кофр"],
      },
      {
        slug: "home-storage-wardrobe-hangers",
        labelRu: "Вешалки и чехлы для одежды",
        parentSlug: "home-storage-wardrobe",
        searchKeywords: ["плечики"],
      },
      {
        slug: "home-storage-utility",
        labelRu: "Для ванной и прихожей",
        parentSlug: "home-storage",
      },
      {
        slug: "home-storage-utility-laundry-baskets",
        labelRu: "Корзины для белья",
        parentSlug: "home-storage-utility",
      },
      {
        slug: "home-storage-utility-organizers",
        labelRu: "Органайзеры",
        parentSlug: "home-storage-utility",
      },
    ],
  },
  {
    rootSlug: "games",
    nodes: [
      {
        slug: "gaming-consoles",
        labelRu: "Консоли",
        searchKeywords: ["приставка"],
      },
      {
        slug: "gaming-consoles-home",
        labelRu: "Стационарные",
        parentSlug: "gaming-consoles",
      },
      {
        slug: "gaming-consoles-home-playstation",
        labelRu: "PlayStation",
        parentSlug: "gaming-consoles-home",
      },
      {
        slug: "gaming-consoles-home-xbox",
        labelRu: "Xbox",
        parentSlug: "gaming-consoles-home",
      },
      {
        slug: "gaming-consoles-portable",
        labelRu: "Портативные",
        parentSlug: "gaming-consoles",
      },
      {
        slug: "gaming-consoles-portable-nintendo",
        labelRu: "Nintendo Switch",
        parentSlug: "gaming-consoles-portable",
      },
      {
        slug: "gaming-consoles-portable-pc",
        labelRu: "Steam Deck и аналоги",
        parentSlug: "gaming-consoles-portable",
        searchKeywords: ["asus rog ally"],
      },
      {
        slug: "gaming-consoles-portable-retro",
        labelRu: "Ретро-консоли",
        parentSlug: "gaming-consoles-portable",
        searchKeywords: ["тетрис", "денди"],
      },
      {
        slug: "gaming-games",
        labelRu: "Видеоигры",
      },
      {
        slug: "gaming-games-ps",
        labelRu: "Для PlayStation",
        parentSlug: "gaming-games",
      },
      {
        slug: "gaming-games-ps-ps5",
        labelRu: "Игры для PS5",
        parentSlug: "gaming-games-ps",
      },
      {
        slug: "gaming-games-ps-ps4",
        labelRu: "Игры для PS4",
        parentSlug: "gaming-games-ps",
      },
      {
        slug: "gaming-games-xbox",
        labelRu: "Для Xbox",
        parentSlug: "gaming-games",
      },
      {
        slug: "gaming-games-xbox-series",
        labelRu: "Игры для Xbox Series X/S",
        parentSlug: "gaming-games-xbox",
      },
      {
        slug: "gaming-games-xbox-one",
        labelRu: "Игры для Xbox One",
        parentSlug: "gaming-games-xbox",
      },
      {
        slug: "gaming-games-nintendo",
        labelRu: "Игры для Nintendo Switch",
        parentSlug: "gaming-games",
      },
      {
        slug: "gaming-games-pc",
        labelRu: "Игры для ПК",
        parentSlug: "gaming-games",
      },
      {
        slug: "gaming-accessories",
        labelRu: "Геймпады и аксессуары",
      },
      {
        slug: "gaming-accessories-controllers",
        labelRu: "Геймпады и рули",
        parentSlug: "gaming-accessories",
      },
      {
        slug: "gaming-accessories-controllers-console",
        labelRu: "Геймпады для консолей",
        parentSlug: "gaming-accessories-controllers",
        searchKeywords: ["джойстик"],
      },
      {
        slug: "gaming-accessories-controllers-pc-mobile",
        labelRu: "Геймпады для ПК и смартфонов",
        parentSlug: "gaming-accessories-controllers",
      },
      {
        slug: "gaming-accessories-controllers-wheels",
        labelRu: "Игровые рули",
        parentSlug: "gaming-accessories-controllers",
        searchKeywords: ["авиасимулятор"],
      },
      {
        slug: "gaming-accessories-gear",
        labelRu: "Зарядка и чехлы",
        parentSlug: "gaming-accessories",
      },
      {
        slug: "gaming-accessories-gear-charging",
        labelRu: "Зарядные станции и кабели",
        parentSlug: "gaming-accessories-gear",
      },
      {
        slug: "gaming-accessories-gear-cases",
        labelRu: "Чехлы и кейсы",
        parentSlug: "gaming-accessories-gear",
      },
      {
        slug: "gaming-accessories-gear-grips",
        labelRu: "Накладки и наклейки",
        parentSlug: "gaming-accessories-gear",
        searchKeywords: ["скины", "стики"],
      },
      {
        slug: "gaming-accessories-vr",
        labelRu: "VR-шлемы и аксессуары",
        parentSlug: "gaming-accessories",
        searchKeywords: ["виртуальная реальность"],
      },
      {
        slug: "gaming-pc",
        labelRu: "Игровая периферия для ПК",
      },
      {
        slug: "gaming-pc-peripherals",
        labelRu: "Мыши и клавиатуры",
        parentSlug: "gaming-pc",
      },
      {
        slug: "gaming-pc-peripherals-mice",
        labelRu: "Игровые мыши",
        parentSlug: "gaming-pc-peripherals",
      },
      {
        slug: "gaming-pc-peripherals-keyboards",
        labelRu: "Игровые клавиатуры",
        parentSlug: "gaming-pc-peripherals",
      },
      {
        slug: "gaming-pc-peripherals-mats",
        labelRu: "Коврики для мыши",
        parentSlug: "gaming-pc-peripherals",
      },
      {
        slug: "gaming-pc-media",
        labelRu: "Звук и стриминг",
        parentSlug: "gaming-pc",
      },
      {
        slug: "gaming-pc-media-headsets",
        labelRu: "Игровые наушники",
        parentSlug: "gaming-pc-media",
        searchKeywords: ["гарнитура"],
      },
      {
        slug: "gaming-pc-media-streaming",
        labelRu: "Микрофоны и веб-камеры",
        parentSlug: "gaming-pc-media",
      },
      {
        slug: "gaming-digital",
        labelRu: "Подписки и карты оплаты",
      },
      {
        slug: "gaming-digital-gift-cards",
        labelRu: "Карты пополнения",
        parentSlug: "gaming-digital",
        searchKeywords: ["psn", "steam"],
      },
      {
        slug: "gaming-digital-subscriptions",
        labelRu: "Игровые подписки",
        parentSlug: "gaming-digital",
        searchKeywords: ["ps plus", "game pass"],
      },
      {
        slug: "gaming-merch",
        labelRu: "Мерч и настольные игры",
      },
      {
        slug: "gaming-merch-figures",
        labelRu: "Коллекционные фигурки",
        parentSlug: "gaming-merch",
        searchKeywords: ["funko pop"],
      },
      {
        slug: "gaming-merch-board-games",
        labelRu: "Настольные игры",
        parentSlug: "gaming-merch",
      },
    ],
  },
  {
    rootSlug: "cantstovari",
    nodes: [
      {
        slug: "stationery-writing",
        labelRu: "Ручки и карандаши",
      },
      {
        slug: "stationery-writing-pens",
        labelRu: "Ручки",
        parentSlug: "stationery-writing",
      },
      {
        slug: "stationery-writing-pens-classic",
        labelRu: "Шариковые и гелевые ручки",
        parentSlug: "stationery-writing-pens",
      },
      {
        slug: "stationery-writing-pens-fine",
        labelRu: "Капиллярные ручки и роллеры",
        parentSlug: "stationery-writing-pens",
      },
      {
        slug: "stationery-writing-pens-refills",
        labelRu: "Стержни для ручек",
        parentSlug: "stationery-writing-pens",
      },
      {
        slug: "stationery-writing-markers",
        labelRu: "Карандаши и маркеры",
        parentSlug: "stationery-writing",
      },
      {
        slug: "stationery-writing-markers-pencils",
        labelRu: "Простые карандаши",
        parentSlug: "stationery-writing-markers",
        searchKeywords: ["механический"],
      },
      {
        slug: "stationery-writing-markers-highlighters",
        labelRu: "Маркеры и текстовыделители",
        parentSlug: "stationery-writing-markers",
      },
      {
        slug: "stationery-writing-correction",
        labelRu: "Ластики и корректоры",
        parentSlug: "stationery-writing",
      },
      {
        slug: "stationery-writing-correction-erasers",
        labelRu: "Ластики",
        parentSlug: "stationery-writing-correction",
      },
      {
        slug: "stationery-writing-correction-fluids",
        labelRu: "Корректоры",
        parentSlug: "stationery-writing-correction",
        searchKeywords: ["штрих"],
      },
      {
        slug: "stationery-writing-correction-sharpeners",
        labelRu: "Точилки",
        parentSlug: "stationery-writing-correction",
      },
      {
        slug: "stationery-paper",
        labelRu: "Бумага и тетради",
      },
      {
        slug: "stationery-paper-notebooks",
        labelRu: "Тетради и блокноты",
        parentSlug: "stationery-paper",
      },
      {
        slug: "stationery-paper-notebooks-exercise",
        labelRu: "Тетради",
        parentSlug: "stationery-paper-notebooks",
      },
      {
        slug: "stationery-paper-notebooks-diaries",
        labelRu: "Блокноты и ежедневники",
        parentSlug: "stationery-paper-notebooks",
        searchKeywords: ["планинг"],
      },
      {
        slug: "stationery-paper-notebooks-sketchbooks",
        labelRu: "Скетчбуки и альбомы",
        parentSlug: "stationery-paper-notebooks",
      },
      {
        slug: "stationery-paper-office",
        labelRu: "Офисная бумага",
        parentSlug: "stationery-paper",
      },
      {
        slug: "stationery-paper-office-print",
        labelRu: "Бумага для принтера",
        parentSlug: "stationery-paper-office",
        searchKeywords: ["а4", "а3"],
      },
      {
        slug: "stationery-paper-office-sticky",
        labelRu: "Стикеры и блоки для записей",
        parentSlug: "stationery-paper-office",
      },
      {
        slug: "stationery-paper-office-envelopes",
        labelRu: "Конверты",
        parentSlug: "stationery-paper-office",
      },
      {
        slug: "stationery-desktop",
        labelRu: "Офис и рабочий стол",
      },
      {
        slug: "stationery-desktop-folders",
        labelRu: "Папки и лотки",
        parentSlug: "stationery-desktop",
      },
      {
        slug: "stationery-desktop-folders-binders",
        labelRu: "Папки-регистраторы и с файлами",
        parentSlug: "stationery-desktop-folders",
      },
      {
        slug: "stationery-desktop-folders-cases",
        labelRu: "Папки на кнопке и молнии",
        parentSlug: "stationery-desktop-folders",
      },
      {
        slug: "stationery-desktop-folders-trays",
        labelRu: "Лотки для бумаг",
        parentSlug: "stationery-desktop-folders",
      },
      {
        slug: "stationery-desktop-tools",
        labelRu: "Офисные мелочи",
        parentSlug: "stationery-desktop",
      },
      {
        slug: "stationery-desktop-tools-staplers",
        labelRu: "Степлеры и скобы",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-desktop-tools-cutters",
        labelRu: "Ножницы и канцелярские ножи",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-desktop-tools-clips",
        labelRu: "Скрепки, зажимы и кнопки",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-desktop-tools-glue",
        labelRu: "Клей и скотч",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-desktop-tools-organizers",
        labelRu: "Органайзеры для ручек",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-desktop-tools-calculators",
        labelRu: "Калькуляторы",
        parentSlug: "stationery-desktop-tools",
      },
      {
        slug: "stationery-school",
        labelRu: "Для школы",
      },
      {
        slug: "stationery-school-cases",
        labelRu: "Пеналы",
        parentSlug: "stationery-school",
      },
      {
        slug: "stationery-school-covers",
        labelRu: "Обложки для тетрадей и книг",
        parentSlug: "stationery-school",
      },
      {
        slug: "stationery-school-diaries",
        labelRu: "Школьные дневники",
        parentSlug: "stationery-school",
      },
      {
        slug: "stationery-school-geometry",
        labelRu: "Линейки и циркули",
        parentSlug: "stationery-school",
        searchKeywords: ["транспортир"],
      },
      {
        slug: "stationery-hobby",
        labelRu: "Творчество",
      },
      {
        slug: "stationery-hobby-art",
        labelRu: "Рисование и лепка",
        parentSlug: "stationery-hobby",
      },
      {
        slug: "stationery-hobby-art-coloring",
        labelRu: "Цветные карандаши и фломастеры",
        parentSlug: "stationery-hobby-art",
      },
      {
        slug: "stationery-hobby-art-paints",
        labelRu: "Краски и кисти",
        parentSlug: "stationery-hobby-art",
        searchKeywords: ["гуашь", "акварель"],
      },
      {
        slug: "stationery-hobby-art-clay",
        labelRu: "Пластилин и масса для лепки",
        parentSlug: "stationery-hobby-art",
      },
      {
        slug: "stationery-hobby-craft",
        labelRu: "Бумага и поделки",
        parentSlug: "stationery-hobby",
      },
      {
        slug: "stationery-hobby-craft-paper",
        labelRu: "Цветная бумага и картон",
        parentSlug: "stationery-hobby-craft",
      },
      {
        slug: "stationery-hobby-craft-kits",
        labelRu: "Наборы для творчества",
        parentSlug: "stationery-hobby-craft",
        searchKeywords: ["аппликация", "оригами"],
      },
    ],
  },
  {
    rootSlug: "coffee",
    nodes: [
      {
        slug: "coffee-types",
        labelRu: "Виды кофе",
      },
      {
        slug: "coffee-types-beans",
        labelRu: "Кофе в зёрнах",
        parentSlug: "coffee-types",
        searchKeywords: ["зерновой"],
      },
      {
        slug: "coffee-types-ground",
        labelRu: "Молотый кофе",
        parentSlug: "coffee-types",
      },
      {
        slug: "coffee-types-instant",
        labelRu: "Растворимый кофе",
        parentSlug: "coffee-types",
        searchKeywords: ["сублимированный"],
      },
      {
        slug: "coffee-types-capsules",
        labelRu: "Капсулы и чалды",
        parentSlug: "coffee-types",
      },
      {
        slug: "coffee-types-capsules-nespresso",
        labelRu: "Капсулы Nespresso",
        parentSlug: "coffee-types-capsules",
      },
      {
        slug: "coffee-types-capsules-dolce-gusto",
        labelRu: "Капсулы Dolce Gusto",
        parentSlug: "coffee-types-capsules",
      },
      {
        slug: "coffee-types-capsules-tassimo",
        labelRu: "Капсулы Tassimo",
        parentSlug: "coffee-types-capsules",
      },
      {
        slug: "coffee-types-capsules-other",
        labelRu: "Чалды и другие капсулы",
        parentSlug: "coffee-types-capsules",
      },
      {
        slug: "coffee-types-drip",
        labelRu: "Дрип-пакеты",
        parentSlug: "coffee-types",
      },
      {
        slug: "coffee-additives",
        labelRu: "Сиропы и добавки",
      },
      {
        slug: "coffee-additives-syrups",
        labelRu: "Сиропы и топпинги",
        parentSlug: "coffee-additives",
      },
      {
        slug: "coffee-additives-dairy",
        labelRu: "Молоко и сливки",
        parentSlug: "coffee-additives",
      },
      {
        slug: "coffee-additives-dairy-plant",
        labelRu: "Растительное молоко",
        parentSlug: "coffee-additives-dairy",
        searchKeywords: ["овсяное", "миндальное", "кокосовое"],
      },
      {
        slug: "coffee-additives-dairy-classic",
        labelRu: "Обычное молоко и сливки",
        parentSlug: "coffee-additives-dairy",
      },
      {
        slug: "coffee-additives-dairy-powder",
        labelRu: "Сухие сливки",
        parentSlug: "coffee-additives-dairy",
      },
      {
        slug: "coffee-additives-sweeteners",
        labelRu: "Сахар и подсластители",
        parentSlug: "coffee-additives",
      },
      {
        slug: "coffee-additives-spices",
        labelRu: "Специи для кофе",
        parentSlug: "coffee-additives",
        searchKeywords: ["корица", "мускатный орех"],
      },
      {
        slug: "coffee-gear",
        labelRu: "Посуда и аксессуары",
      },
      {
        slug: "coffee-gear-brewing",
        labelRu: "Для заваривания",
        parentSlug: "coffee-gear",
      },
      {
        slug: "coffee-gear-brewing-turks",
        labelRu: "Турки",
        parentSlug: "coffee-gear-brewing",
        searchKeywords: ["джезва"],
      },
      {
        slug: "coffee-gear-brewing-french-press",
        labelRu: "Френч-прессы",
        parentSlug: "coffee-gear-brewing",
      },
      {
        slug: "coffee-gear-brewing-moka",
        labelRu: "Гейзерные кофеварки",
        parentSlug: "coffee-gear-brewing",
      },
      {
        slug: "coffee-gear-brewing-pour-over",
        labelRu: "Воронки и фильтры",
        parentSlug: "coffee-gear-brewing",
        searchKeywords: ["пуровер"],
      },
      {
        slug: "coffee-gear-brewing-grinders",
        labelRu: "Кофемолки",
        parentSlug: "coffee-gear-brewing",
      },
      {
        slug: "coffee-gear-serving",
        labelRu: "Чашки и термокружки",
        parentSlug: "coffee-gear",
      },
      {
        slug: "coffee-gear-serving-cups",
        labelRu: "Кофейные чашки и стаканы",
        parentSlug: "coffee-gear-serving",
      },
      {
        slug: "coffee-gear-serving-travel",
        labelRu: "Термокружки и термосы",
        parentSlug: "coffee-gear-serving",
      },
      {
        slug: "coffee-gifts",
        labelRu: "Подарки и сладости",
      },
      {
        slug: "coffee-gifts-sets",
        labelRu: "Подарочные наборы кофе",
        parentSlug: "coffee-gifts",
      },
      {
        slug: "coffee-gifts-sweets",
        labelRu: "Сладости к кофе",
        parentSlug: "coffee-gifts",
      },
      {
        slug: "coffee-gifts-sweets-chocolate",
        labelRu: "Шоколад и конфеты",
        parentSlug: "coffee-gifts-sweets",
      },
      {
        slug: "coffee-gifts-sweets-cookies",
        labelRu: "Печенье и вафли",
        parentSlug: "coffee-gifts-sweets",
        searchKeywords: ["бискотти"],
      },
    ],
  },
  {
    rootSlug: "beauty",
    nodes: [
      {
        slug: "beauty-face",
        labelRu: "Уход за лицом",
      },
      {
        slug: "beauty-face-cleansing",
        labelRu: "Очищение",
        parentSlug: "beauty-face",
      },
      {
        slug: "beauty-face-cleansing-foams",
        labelRu: "Пенки и гели для умывания",
        parentSlug: "beauty-face-cleansing",
      },
      {
        slug: "beauty-face-cleansing-water-oils",
        labelRu: "Мицеллярная вода и масла",
        parentSlug: "beauty-face-cleansing",
        searchKeywords: ["гидрофильное масло"],
      },
      {
        slug: "beauty-face-cleansing-scrubs",
        labelRu: "Скрабы и пилинги для лица",
        parentSlug: "beauty-face-cleansing",
      },
      {
        slug: "beauty-face-care",
        labelRu: "Кремы и сыворотки",
        parentSlug: "beauty-face",
      },
      {
        slug: "beauty-face-care-creams",
        labelRu: "Кремы для лица",
        parentSlug: "beauty-face-care",
      },
      {
        slug: "beauty-face-care-serums",
        labelRu: "Сыворотки и эмульсии",
        parentSlug: "beauty-face-care",
        searchKeywords: ["флюид"],
      },
      {
        slug: "beauty-face-care-toners",
        labelRu: "Тоники и лосьоны",
        parentSlug: "beauty-face-care",
      },
      {
        slug: "beauty-face-care-spf",
        labelRu: "Солнцезащитные средства",
        parentSlug: "beauty-face-care",
      },
      {
        slug: "beauty-face-treatments",
        labelRu: "Маски и патчи",
        parentSlug: "beauty-face",
      },
      {
        slug: "beauty-face-treatments-sheet-masks",
        labelRu: "Тканевые маски",
        parentSlug: "beauty-face-treatments",
        searchKeywords: ["гидрогелевые"],
      },
      {
        slug: "beauty-face-treatments-eye-patches",
        labelRu: "Патчи для глаз",
        parentSlug: "beauty-face-treatments",
      },
      {
        slug: "beauty-face-treatments-masks",
        labelRu: "Кремовые и глиняные маски",
        parentSlug: "beauty-face-treatments",
      },
      {
        slug: "beauty-hair",
        labelRu: "Уход за волосами",
      },
      {
        slug: "beauty-hair-base",
        labelRu: "Шампуни и бальзамы",
        parentSlug: "beauty-hair",
      },
      {
        slug: "beauty-hair-base-shampoos",
        labelRu: "Шампуни",
        parentSlug: "beauty-hair-base",
      },
      {
        slug: "beauty-hair-base-conditioners",
        labelRu: "Бальзамы и кондиционеры",
        parentSlug: "beauty-hair-base",
      },
      {
        slug: "beauty-hair-treatments",
        labelRu: "Маски, масла и укладка",
        parentSlug: "beauty-hair",
      },
      {
        slug: "beauty-hair-treatments-masks",
        labelRu: "Маски для волос",
        parentSlug: "beauty-hair-treatments",
        searchKeywords: ["филлер"],
      },
      {
        slug: "beauty-hair-treatments-oils-sprays",
        labelRu: "Масла, спреи и сыворотки",
        parentSlug: "beauty-hair-treatments",
      },
      {
        slug: "beauty-hair-treatments-styling",
        labelRu: "Средства для укладки",
        parentSlug: "beauty-hair-treatments",
        searchKeywords: ["лак", "мусс", "гель"],
      },
      {
        slug: "beauty-hair-coloring",
        labelRu: "Краски для волос",
        parentSlug: "beauty-hair",
      },
      {
        slug: "beauty-body",
        labelRu: "Уход за телом",
      },
      {
        slug: "beauty-body-care",
        labelRu: "Тело",
        parentSlug: "beauty-body",
      },
      {
        slug: "beauty-body-care-wash",
        labelRu: "Гели для душа и мыло",
        parentSlug: "beauty-body-care",
      },
      {
        slug: "beauty-body-care-creams",
        labelRu: "Кремы и лосьоны для тела",
        parentSlug: "beauty-body-care",
        searchKeywords: ["баттер"],
      },
      {
        slug: "beauty-body-care-scrubs",
        labelRu: "Скрабы для тела",
        parentSlug: "beauty-body-care",
      },
      {
        slug: "beauty-body-hands",
        labelRu: "Руки и ногти",
        parentSlug: "beauty-body",
      },
      {
        slug: "beauty-body-hands-creams",
        labelRu: "Кремы для рук",
        parentSlug: "beauty-body-hands",
      },
      {
        slug: "beauty-body-hands-nails",
        labelRu: "Лаки и маникюр",
        parentSlug: "beauty-body-hands",
      },
      {
        slug: "beauty-body-feet",
        labelRu: "Уход за ногами",
        parentSlug: "beauty-body",
      },
      {
        slug: "beauty-makeup",
        labelRu: "Макияж",
        searchKeywords: ["декоративная косметика"],
      },
      {
        slug: "beauty-makeup-face",
        labelRu: "Лицо",
        parentSlug: "beauty-makeup",
      },
      {
        slug: "beauty-makeup-face-foundation",
        labelRu: "Тональные средства",
        parentSlug: "beauty-makeup-face",
        searchKeywords: ["кушон", "bb", "cc"],
      },
      {
        slug: "beauty-makeup-face-concealers",
        labelRu: "Консилеры и корректоры",
        parentSlug: "beauty-makeup-face",
      },
      {
        slug: "beauty-makeup-face-powder-blush",
        labelRu: "Пудра, румяна и хайлайтеры",
        parentSlug: "beauty-makeup-face",
      },
      {
        slug: "beauty-makeup-eyes-lips",
        labelRu: "Глаза и губы",
        parentSlug: "beauty-makeup",
      },
      {
        slug: "beauty-makeup-eyes-lips-eyes",
        labelRu: "Тушь, тени и подводки",
        parentSlug: "beauty-makeup-eyes-lips",
      },
      {
        slug: "beauty-makeup-eyes-lips-brows",
        labelRu: "Для бровей",
        parentSlug: "beauty-makeup-eyes-lips",
      },
      {
        slug: "beauty-makeup-eyes-lips-lips",
        labelRu: "Помады и блески",
        parentSlug: "beauty-makeup-eyes-lips",
        searchKeywords: ["карандаш для губ"],
      },
      {
        slug: "beauty-makeup-tools",
        labelRu: "Кисти и спонжи",
        parentSlug: "beauty-makeup",
      },
      {
        slug: "beauty-perfume",
        labelRu: "Парфюмерия",
      },
      {
        slug: "beauty-perfume-women",
        labelRu: "Женская парфюмерия",
        parentSlug: "beauty-perfume",
        searchKeywords: ["духи", "туалетная вода"],
      },
      {
        slug: "beauty-perfume-men",
        labelRu: "Мужская парфюмерия",
        parentSlug: "beauty-perfume",
      },
      {
        slug: "beauty-perfume-unisex-mists",
        labelRu: "Унисекс и мисты",
        parentSlug: "beauty-perfume",
      },
      {
        slug: "beauty-mens-care",
        labelRu: "Для мужчин",
      },
      {
        slug: "beauty-mens-care-shaving",
        labelRu: "Средства для бритья",
        parentSlug: "beauty-mens-care",
      },
      {
        slug: "beauty-mens-care-beard",
        labelRu: "Уход за бородой",
        parentSlug: "beauty-mens-care",
      },
      {
        slug: "beauty-mens-care-wash",
        labelRu: "Мужские шампуни и гели для душа",
        parentSlug: "beauty-mens-care",
      },
    ],
  },
  {
    rootSlug: "furniture",
    nodes: [
      {
        slug: "furniture-living",
        labelRu: "Гостиная и спальня",
      },
      {
        slug: "furniture-living-soft",
        labelRu: "Диваны и кресла",
        parentSlug: "furniture-living",
      },
      {
        slug: "furniture-living-soft-sofas",
        labelRu: "Диваны",
        parentSlug: "furniture-living-soft",
        searchKeywords: ["угловой", "модульный"],
      },
      {
        slug: "furniture-living-soft-armchairs",
        labelRu: "Кресла и кресла-мешки",
        parentSlug: "furniture-living-soft",
      },
      {
        slug: "furniture-living-soft-poufs",
        labelRu: "Пуфы и банкетки",
        parentSlug: "furniture-living-soft",
        searchKeywords: ["оттоманка"],
      },
      {
        slug: "furniture-living-sleeping",
        labelRu: "Кровати и матрасы",
        parentSlug: "furniture-living",
      },
      {
        slug: "furniture-living-sleeping-beds",
        labelRu: "Кровати",
        parentSlug: "furniture-living-sleeping",
      },
      {
        slug: "furniture-living-sleeping-mattresses",
        labelRu: "Матрасы",
        parentSlug: "furniture-living-sleeping",
        searchKeywords: ["ортопедический"],
      },
      {
        slug: "furniture-living-sleeping-bases",
        labelRu: "Основания и топперы",
        parentSlug: "furniture-living-sleeping",
      },
      {
        slug: "furniture-living-storage",
        labelRu: "Шкафы и комоды",
        parentSlug: "furniture-living",
      },
      {
        slug: "furniture-living-storage-wardrobes",
        labelRu: "Шкафы",
        parentSlug: "furniture-living-storage",
        searchKeywords: ["купе", "распашной"],
      },
      {
        slug: "furniture-living-storage-chests",
        labelRu: "Комоды и тумбы",
        parentSlug: "furniture-living-storage",
      },
      {
        slug: "furniture-living-storage-shelving",
        labelRu: "Стеллажи и стенки",
        parentSlug: "furniture-living-storage",
        searchKeywords: ["витрина"],
      },
      {
        slug: "furniture-living-storage-tv-coffee",
        labelRu: "ТВ-тумбы и журнальные столики",
        parentSlug: "furniture-living-storage",
      },
      {
        slug: "furniture-kitchen",
        labelRu: "Кухня и столовая",
      },
      {
        slug: "furniture-kitchen-dining",
        labelRu: "Столы и стулья",
        parentSlug: "furniture-kitchen",
      },
      {
        slug: "furniture-kitchen-dining-tables",
        labelRu: "Обеденные столы",
        parentSlug: "furniture-kitchen-dining",
      },
      {
        slug: "furniture-kitchen-dining-chairs",
        labelRu: "Стулья и табуреты",
        parentSlug: "furniture-kitchen-dining",
        searchKeywords: ["барный стул"],
      },
      {
        slug: "furniture-kitchen-dining-sets",
        labelRu: "Обеденные группы и уголки",
        parentSlug: "furniture-kitchen-dining",
      },
      {
        slug: "furniture-kitchen-units",
        labelRu: "Кухонные гарнитуры",
        parentSlug: "furniture-kitchen",
      },
      {
        slug: "furniture-kitchen-units-ready",
        labelRu: "Готовые гарнитуры",
        parentSlug: "furniture-kitchen-units",
      },
      {
        slug: "furniture-kitchen-units-modular",
        labelRu: "Модули и столешницы",
        parentSlug: "furniture-kitchen-units",
      },
      {
        slug: "furniture-hallway",
        labelRu: "Прихожая",
      },
      {
        slug: "furniture-hallway-hangers",
        labelRu: "Вешалки",
        parentSlug: "furniture-hallway",
      },
      {
        slug: "furniture-hallway-shoe-racks",
        labelRu: "Обувницы",
        parentSlug: "furniture-hallway",
      },
      {
        slug: "furniture-hallway-sets",
        labelRu: "Прихожие и гардеробные",
        parentSlug: "furniture-hallway",
      },
      {
        slug: "furniture-office",
        labelRu: "Офис и кабинет",
      },
      {
        slug: "furniture-office-tables",
        labelRu: "Письменные и компьютерные столы",
        parentSlug: "furniture-office",
      },
      {
        slug: "furniture-office-chairs",
        labelRu: "Офисные и компьютерные кресла",
        parentSlug: "furniture-office",
      },
      {
        slug: "furniture-office-gaming",
        labelRu: "Игровые кресла и столы",
        parentSlug: "furniture-office",
      },
      {
        slug: "furniture-office-cabinets",
        labelRu: "Офисные шкафы и стеллажи",
        parentSlug: "furniture-office",
      },
      {
        slug: "furniture-kids",
        labelRu: "Детская",
      },
      {
        slug: "furniture-kids-beds",
        labelRu: "Детские кровати",
        parentSlug: "furniture-kids",
        searchKeywords: ["кровать-чердак"],
      },
      {
        slug: "furniture-kids-desks",
        labelRu: "Парты и детские столы",
        parentSlug: "furniture-kids",
      },
      {
        slug: "furniture-kids-storage",
        labelRu: "Хранение игрушек и вещей",
        parentSlug: "furniture-kids",
      },
    ],
  },
  {
    rootSlug: "building",
    nodes: [
      {
        slug: "real-estate-residential-sale",
        labelRu: "Продажа жилья",
      },
      {
        slug: "real-estate-residential-sale-apartments",
        labelRu: "Квартиры и комнаты",
        parentSlug: "real-estate-residential-sale",
      },
      {
        slug: "real-estate-residential-sale-apartments-resale",
        labelRu: "Вторичное жильё",
        parentSlug: "real-estate-residential-sale-apartments",
        searchKeywords: ["вторичка"],
      },
      {
        slug: "real-estate-residential-sale-apartments-new",
        labelRu: "Новостройки",
        parentSlug: "real-estate-residential-sale-apartments",
        searchKeywords: ["жк"],
      },
      {
        slug: "real-estate-residential-sale-apartments-rooms",
        labelRu: "Комнаты и доли",
        parentSlug: "real-estate-residential-sale-apartments",
      },
      {
        slug: "real-estate-residential-sale-houses",
        labelRu: "Дома и дачи",
        parentSlug: "real-estate-residential-sale",
      },
      {
        slug: "real-estate-residential-sale-houses-classic",
        labelRu: "Дома, дачи и коттеджи",
        parentSlug: "real-estate-residential-sale-houses",
      },
      {
        slug: "real-estate-residential-sale-houses-townhouses",
        labelRu: "Таунхаусы",
        parentSlug: "real-estate-residential-sale-houses",
        searchKeywords: ["дуплекс"],
      },
      {
        slug: "real-estate-residential-rent",
        labelRu: "Аренда жилья",
      },
      {
        slug: "real-estate-residential-rent-long",
        labelRu: "На длительный срок",
        parentSlug: "real-estate-residential-rent",
      },
      {
        slug: "real-estate-residential-rent-long-apartments",
        labelRu: "Аренда квартир и комнат",
        parentSlug: "real-estate-residential-rent-long",
      },
      {
        slug: "real-estate-residential-rent-long-houses",
        labelRu: "Аренда домов и коттеджей",
        parentSlug: "real-estate-residential-rent-long",
      },
      {
        slug: "real-estate-residential-rent-short",
        labelRu: "Посуточно",
        parentSlug: "real-estate-residential-rent",
      },
      {
        slug: "real-estate-residential-rent-short-apartments",
        labelRu: "Квартиры посуточно",
        parentSlug: "real-estate-residential-rent-short",
      },
      {
        slug: "real-estate-residential-rent-short-houses",
        labelRu: "Дома и базы отдыха посуточно",
        parentSlug: "real-estate-residential-rent-short",
      },
      {
        slug: "real-estate-commercial",
        labelRu: "Коммерческая недвижимость",
      },
      {
        slug: "real-estate-commercial-sale",
        labelRu: "Продажа",
        parentSlug: "real-estate-commercial",
      },
      {
        slug: "real-estate-commercial-sale-offices",
        labelRu: "Продажа офисов",
        parentSlug: "real-estate-commercial-sale",
        searchKeywords: ["бизнес-центр"],
      },
      {
        slug: "real-estate-commercial-sale-retail",
        labelRu: "Продажа торговых помещений",
        parentSlug: "real-estate-commercial-sale",
        searchKeywords: ["магазин"],
      },
      {
        slug: "real-estate-commercial-sale-industrial",
        labelRu: "Продажа складов и производств",
        parentSlug: "real-estate-commercial-sale",
      },
      {
        slug: "real-estate-commercial-rent",
        labelRu: "Аренда",
        parentSlug: "real-estate-commercial",
      },
      {
        slug: "real-estate-commercial-rent-offices",
        labelRu: "Аренда офисов",
        parentSlug: "real-estate-commercial-rent",
      },
      {
        slug: "real-estate-commercial-rent-retail",
        labelRu: "Аренда торговых помещений",
        parentSlug: "real-estate-commercial-rent",
      },
      {
        slug: "real-estate-commercial-rent-industrial",
        labelRu: "Аренда складов и цехов",
        parentSlug: "real-estate-commercial-rent",
      },
      {
        slug: "real-estate-land",
        labelRu: "Земельные участки",
      },
      {
        slug: "real-estate-land-residential",
        labelRu: "Участки под ИЖС",
        parentSlug: "real-estate-land",
      },
      {
        slug: "real-estate-land-garden",
        labelRu: "Дачные и садовые участки",
        parentSlug: "real-estate-land",
        searchKeywords: ["снт", "днп"],
      },
      {
        slug: "real-estate-land-commercial",
        labelRu: "Коммерческие и промышленные участки",
        parentSlug: "real-estate-land",
      },
      {
        slug: "real-estate-parking",
        labelRu: "Гаражи и машиноместа",
      },
      {
        slug: "real-estate-parking-sale",
        labelRu: "Продажа гаражей и машиномест",
        parentSlug: "real-estate-parking",
      },
      {
        slug: "real-estate-parking-rent",
        labelRu: "Аренда гаражей и машиномест",
        parentSlug: "real-estate-parking",
      },
    ],
  },
  {
    rootSlug: "clothes",
    nodes: [
      {
        slug: "clothes-women",
        labelRu: "Женщинам",
      },
      {
        slug: "clothes-women-clothing",
        labelRu: "Одежда",
        parentSlug: "clothes-women",
      },
      {
        slug: "clothes-women-clothing-dresses",
        labelRu: "Платья и сарафаны",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["комбинезон"],
      },
      {
        slug: "clothes-women-clothing-tops",
        labelRu: "Блузки, топы и футболки",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["рубашка"],
      },
      {
        slug: "clothes-women-clothing-bottoms",
        labelRu: "Брюки, джинсы и юбки",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["шорты"],
      },
      {
        slug: "clothes-women-clothing-knitwear",
        labelRu: "Свитеры, худи и кардиганы",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["свитшот"],
      },
      {
        slug: "clothes-women-clothing-suits",
        labelRu: "Костюмы и пиджаки",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["блейзер"],
      },
      {
        slug: "clothes-women-clothing-outerwear",
        labelRu: "Верхняя одежда",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["куртка", "пальто", "пуховик"],
      },
      {
        slug: "clothes-women-clothing-homewear",
        labelRu: "Домашняя одежда",
        parentSlug: "clothes-women-clothing",
        searchKeywords: ["пижама", "халат"],
      },
      {
        slug: "clothes-women-clothing-underwear",
        labelRu: "Бельё, носки и колготки",
        parentSlug: "clothes-women-clothing",
      },
      {
        slug: "clothes-women-clothing-beachwear",
        labelRu: "Купальники и пляжная одежда",
        parentSlug: "clothes-women-clothing",
      },
      {
        slug: "clothes-women-shoes",
        labelRu: "Обувь",
        parentSlug: "clothes-women",
      },
      {
        slug: "clothes-women-shoes-sneakers",
        labelRu: "Кроссовки и кеды",
        parentSlug: "clothes-women-shoes",
      },
      {
        slug: "clothes-women-shoes-classic",
        labelRu: "Туфли и балетки",
        parentSlug: "clothes-women-shoes",
        searchKeywords: ["лоферы"],
      },
      {
        slug: "clothes-women-shoes-boots",
        labelRu: "Ботинки и сапоги",
        parentSlug: "clothes-women-shoes",
        searchKeywords: ["полусапожки"],
      },
      {
        slug: "clothes-women-shoes-sandals",
        labelRu: "Босоножки и шлёпанцы",
        parentSlug: "clothes-women-shoes",
        searchKeywords: ["сандалии"],
      },
      {
        slug: "clothes-women-shoes-slippers",
        labelRu: "Домашняя обувь",
        parentSlug: "clothes-women-shoes",
        searchKeywords: ["тапочки"],
      },
      {
        slug: "clothes-men",
        labelRu: "Мужчинам",
      },
      {
        slug: "clothes-men-clothing",
        labelRu: "Одежда",
        parentSlug: "clothes-men",
      },
      {
        slug: "clothes-men-clothing-tops",
        labelRu: "Футболки, поло и рубашки",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["майка"],
      },
      {
        slug: "clothes-men-clothing-bottoms",
        labelRu: "Брюки, джинсы и шорты",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["чиносы"],
      },
      {
        slug: "clothes-men-clothing-knitwear",
        labelRu: "Свитеры, худи и толстовки",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["свитшот"],
      },
      {
        slug: "clothes-men-clothing-suits",
        labelRu: "Костюмы и пиджаки",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["блейзер"],
      },
      {
        slug: "clothes-men-clothing-outerwear",
        labelRu: "Верхняя одежда",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["куртка", "ветровка", "пуховик"],
      },
      {
        slug: "clothes-men-clothing-homewear",
        labelRu: "Домашняя одежда",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["халат"],
      },
      {
        slug: "clothes-men-clothing-underwear",
        labelRu: "Бельё и носки",
        parentSlug: "clothes-men-clothing",
        searchKeywords: ["термобельё"],
      },
      {
        slug: "clothes-men-clothing-beachwear",
        labelRu: "Плавки и пляжная одежда",
        parentSlug: "clothes-men-clothing",
      },
      {
        slug: "clothes-men-shoes",
        labelRu: "Обувь",
        parentSlug: "clothes-men",
      },
      {
        slug: "clothes-men-shoes-sneakers",
        labelRu: "Кроссовки и кеды",
        parentSlug: "clothes-men-shoes",
      },
      {
        slug: "clothes-men-shoes-classic",
        labelRu: "Туфли и мокасины",
        parentSlug: "clothes-men-shoes",
        searchKeywords: ["лоферы"],
      },
      {
        slug: "clothes-men-shoes-boots",
        labelRu: "Ботинки и сапоги",
        parentSlug: "clothes-men-shoes",
        searchKeywords: ["берцы"],
      },
      {
        slug: "clothes-men-shoes-sandals",
        labelRu: "Сандалии и шлёпанцы",
        parentSlug: "clothes-men-shoes",
        searchKeywords: ["сланцы"],
      },
      {
        slug: "clothes-men-shoes-slippers",
        labelRu: "Домашняя обувь",
        parentSlug: "clothes-men-shoes",
        searchKeywords: ["тапочки"],
      },
      {
        slug: "clothes-kids",
        labelRu: "Детям",
      },
      {
        slug: "clothes-kids-boys",
        labelRu: "Мальчикам",
        parentSlug: "clothes-kids",
      },
      {
        slug: "clothes-kids-boys-clothing",
        labelRu: "Одежда для мальчиков",
        parentSlug: "clothes-kids-boys",
      },
      {
        slug: "clothes-kids-boys-outerwear",
        labelRu: "Верхняя одежда для мальчиков",
        parentSlug: "clothes-kids-boys",
      },
      {
        slug: "clothes-kids-boys-shoes",
        labelRu: "Обувь для мальчиков",
        parentSlug: "clothes-kids-boys",
      },
      {
        slug: "clothes-kids-girls",
        labelRu: "Девочкам",
        parentSlug: "clothes-kids",
      },
      {
        slug: "clothes-kids-girls-clothing",
        labelRu: "Одежда для девочек",
        parentSlug: "clothes-kids-girls",
      },
      {
        slug: "clothes-kids-girls-outerwear",
        labelRu: "Верхняя одежда для девочек",
        parentSlug: "clothes-kids-girls",
      },
      {
        slug: "clothes-kids-girls-shoes",
        labelRu: "Обувь для девочек",
        parentSlug: "clothes-kids-girls",
      },
      {
        slug: "clothes-kids-babies",
        labelRu: "Малышам до 2 лет",
        parentSlug: "clothes-kids",
        searchKeywords: ["новорождённым"],
      },
      {
        slug: "clothes-kids-babies-clothing",
        labelRu: "Боди и комбинезоны",
        parentSlug: "clothes-kids-babies",
        searchKeywords: ["песочник"],
      },
      {
        slug: "clothes-kids-babies-shoes",
        labelRu: "Пинетки и первая обувь",
        parentSlug: "clothes-kids-babies",
      },
      {
        slug: "clothes-kids-school",
        labelRu: "Школьная форма",
        parentSlug: "clothes-kids",
      },
      {
        slug: "clothes-sport",
        labelRu: "Спортивная одежда и обувь",
      },
      {
        slug: "clothes-sport-clothing",
        labelRu: "Спортивные костюмы и брюки",
        parentSlug: "clothes-sport",
        searchKeywords: ["тайтсы"],
      },
      {
        slug: "clothes-sport-shoes",
        labelRu: "Спортивная обувь",
        parentSlug: "clothes-sport",
        searchKeywords: ["бег", "фитнес", "трекинг"],
      },
      {
        slug: "clothes-sport-winter",
        labelRu: "Термобельё и горнолыжная одежда",
        parentSlug: "clothes-sport",
      },
    ],
  },
  {
    rootSlug: "uslugi",
    nodes: [
      {
        slug: "jobs-services-vacancies",
        labelRu: "Вакансии",
        searchKeywords: ["поиск сотрудников"],
      },
      {
        slug: "jobs-services-vacancies-services",
        labelRu: "Торговля и сервис",
        parentSlug: "jobs-services-vacancies",
      },
      {
        slug: "jobs-services-vacancies-services-retail",
        labelRu: "Продавцы и кассиры",
        parentSlug: "jobs-services-vacancies-services",
        searchKeywords: ["мерчандайзер"],
      },
      {
        slug: "jobs-services-vacancies-services-horeca",
        labelRu: "Повара, официанты и бариста",
        parentSlug: "jobs-services-vacancies-services",
      },
      {
        slug: "jobs-services-vacancies-services-delivery",
        labelRu: "Курьеры и водители",
        parentSlug: "jobs-services-vacancies-services",
        searchKeywords: ["логистика"],
      },
      {
        slug: "jobs-services-vacancies-services-beauty",
        labelRu: "Красота и фитнес",
        parentSlug: "jobs-services-vacancies-services",
      },
      {
        slug: "jobs-services-vacancies-industrial",
        labelRu: "Производство и стройка",
        parentSlug: "jobs-services-vacancies",
      },
      {
        slug: "jobs-services-vacancies-industrial-construction",
        labelRu: "Строители и разнорабочие",
        parentSlug: "jobs-services-vacancies-industrial",
      },
      {
        slug: "jobs-services-vacancies-industrial-factory",
        labelRu: "Производство и склад",
        parentSlug: "jobs-services-vacancies-industrial",
        searchKeywords: ["завод"],
      },
      {
        slug: "jobs-services-vacancies-office",
        labelRu: "Офис и IT",
        parentSlug: "jobs-services-vacancies",
      },
      {
        slug: "jobs-services-vacancies-office-admin",
        labelRu: "Администраторы и менеджеры",
        parentSlug: "jobs-services-vacancies-office",
        searchKeywords: ["колл-центр"],
      },
      {
        slug: "jobs-services-vacancies-office-digital",
        labelRu: "IT, маркетинг и дизайн",
        parentSlug: "jobs-services-vacancies-office",
        searchKeywords: ["удалённая работа", "фриланс"],
      },
      {
        slug: "jobs-services-resumes",
        labelRu: "Резюме",
        searchKeywords: ["ищу работу"],
      },
      {
        slug: "jobs-services-resumes-fulltime",
        labelRu: "Полная занятость",
        parentSlug: "jobs-services-resumes",
      },
      {
        slug: "jobs-services-resumes-parttime",
        labelRu: "Подработка",
        parentSlug: "jobs-services-resumes",
        searchKeywords: ["свободный график"],
      },
      {
        slug: "jobs-services-home",
        labelRu: "Ремонт и помощь по дому",
      },
      {
        slug: "jobs-services-home-repair",
        labelRu: "Ремонт и строительство",
        parentSlug: "jobs-services-home",
      },
      {
        slug: "jobs-services-home-repair-construction",
        labelRu: "Ремонт и строительство под ключ",
        parentSlug: "jobs-services-home-repair",
      },
      {
        slug: "jobs-services-home-repair-maintenance",
        labelRu: "Электрики и сантехники",
        parentSlug: "jobs-services-home-repair",
      },
      {
        slug: "jobs-services-home-repair-appliances",
        labelRu: "Ремонт бытовой техники",
        parentSlug: "jobs-services-home-repair",
      },
      {
        slug: "jobs-services-home-help",
        labelRu: "Помощь по дому",
        parentSlug: "jobs-services-home",
      },
      {
        slug: "jobs-services-home-help-cleaning",
        labelRu: "Уборка и клининг",
        parentSlug: "jobs-services-home-help",
        searchKeywords: ["мытьё окон"],
      },
      {
        slug: "jobs-services-home-help-care",
        labelRu: "Няни и сиделки",
        parentSlug: "jobs-services-home-help",
        searchKeywords: ["домработница"],
      },
      {
        slug: "jobs-services-home-help-handyman",
        labelRu: "Мастер на час",
        parentSlug: "jobs-services-home-help",
        searchKeywords: ["муж на час"],
      },
      {
        slug: "jobs-services-pro-personal",
        labelRu: "Обучение и красота",
      },
      {
        slug: "jobs-services-pro-personal-tutors",
        labelRu: "Репетиторы и курсы",
        parentSlug: "jobs-services-pro-personal",
      },
      {
        slug: "jobs-services-pro-personal-beauty",
        labelRu: "Услуги красоты",
        parentSlug: "jobs-services-pro-personal",
        searchKeywords: ["макияж", "маникюр"],
      },
      {
        slug: "jobs-services-pro-business",
        labelRu: "Деловые услуги",
      },
      {
        slug: "jobs-services-pro-business-legal",
        labelRu: "Юристы и бухгалтеры",
        parentSlug: "jobs-services-pro-business",
        searchKeywords: ["риелтор"],
      },
      {
        slug: "jobs-services-pro-business-digital",
        labelRu: "Сайты, дизайн и реклама",
        parentSlug: "jobs-services-pro-business",
        searchKeywords: ["продвижение"],
      },
      {
        slug: "jobs-services-pro-business-media",
        labelRu: "Фото, видео и праздники",
        parentSlug: "jobs-services-pro-business",
        searchKeywords: ["организация мероприятий"],
      },
      {
        slug: "jobs-services-auto-logistics",
        labelRu: "Авто и перевозки",
      },
      {
        slug: "jobs-services-auto-logistics-cargo",
        labelRu: "Грузоперевозки и переезды",
        parentSlug: "jobs-services-auto-logistics",
      },
      {
        slug: "jobs-services-auto-logistics-repair",
        labelRu: "Автосервис и шиномонтаж",
        parentSlug: "jobs-services-auto-logistics",
        searchKeywords: ["сто"],
      },
    ],
  },
  {
    rootSlug: "remont",
    nodes: [
      {
        slug: "diy-tools-power",
        labelRu: "Электроинструмент",
      },
      {
        slug: "diy-tools-power-construction",
        labelRu: "Дрели, пилы и шлифмашины",
        parentSlug: "diy-tools-power",
      },
      {
        slug: "diy-tools-power-construction-drills",
        labelRu: "Дрели и шуруповёрты",
        parentSlug: "diy-tools-power-construction",
        searchKeywords: ["гайковёрт"],
      },
      {
        slug: "diy-tools-power-construction-hammers",
        labelRu: "Перфораторы и отбойные молотки",
        parentSlug: "diy-tools-power-construction",
      },
      {
        slug: "diy-tools-power-construction-grinders",
        labelRu: "Болгарки и шлифмашины",
        parentSlug: "diy-tools-power-construction",
        searchKeywords: ["ушм"],
      },
      {
        slug: "diy-tools-power-construction-saws",
        labelRu: "Лобзики и циркулярные пилы",
        parentSlug: "diy-tools-power-construction",
      },
      {
        slug: "diy-tools-power-consumables",
        labelRu: "Расходники и оснастка",
        parentSlug: "diy-tools-power",
      },
      {
        slug: "diy-tools-power-consumables-drill-bits",
        labelRu: "Свёрла, буры и коронки",
        parentSlug: "diy-tools-power-consumables",
      },
      {
        slug: "diy-tools-power-consumables-discs",
        labelRu: "Диски и шлифовальные круги",
        parentSlug: "diy-tools-power-consumables",
      },
      {
        slug: "diy-tools-power-consumables-bits",
        labelRu: "Биты и насадки",
        parentSlug: "diy-tools-power-consumables",
      },
      {
        slug: "diy-tools-power-heavy",
        labelRu: "Сварка, компрессоры, генераторы",
        parentSlug: "diy-tools-power",
      },
      {
        slug: "diy-tools-power-heavy-welding",
        labelRu: "Сварочные аппараты",
        parentSlug: "diy-tools-power-heavy",
      },
      {
        slug: "diy-tools-power-heavy-compressors",
        labelRu: "Компрессоры и генераторы",
        parentSlug: "diy-tools-power-heavy",
      },
      {
        slug: "diy-tools-hand",
        labelRu: "Ручной инструмент",
      },
      {
        slug: "diy-tools-hand-tools",
        labelRu: "Слесарный и столярный",
        parentSlug: "diy-tools-hand",
      },
      {
        slug: "diy-tools-hand-tools-wrenches",
        labelRu: "Отвёртки и ключи",
        parentSlug: "diy-tools-hand-tools",
        searchKeywords: ["шестигранник"],
      },
      {
        slug: "diy-tools-hand-tools-pliers",
        labelRu: "Плоскогубцы и кусачки",
        parentSlug: "diy-tools-hand-tools",
      },
      {
        slug: "diy-tools-hand-tools-hammers",
        labelRu: "Молотки и топоры",
        parentSlug: "diy-tools-hand-tools",
        searchKeywords: ["кувалда"],
      },
      {
        slug: "diy-tools-hand-tools-knives",
        labelRu: "Пилы, ножовки и ножи",
        parentSlug: "diy-tools-hand-tools",
      },
      {
        slug: "diy-tools-hand-tools-sets",
        labelRu: "Наборы инструментов",
        parentSlug: "diy-tools-hand-tools",
      },
      {
        slug: "diy-tools-hand-measuring",
        labelRu: "Измерительный инструмент",
        parentSlug: "diy-tools-hand",
      },
      {
        slug: "diy-tools-hand-measuring-tapes",
        labelRu: "Рулетки и линейки",
        parentSlug: "diy-tools-hand-measuring",
      },
      {
        slug: "diy-tools-hand-measuring-levels",
        labelRu: "Уровни и дальномеры",
        parentSlug: "diy-tools-hand-measuring",
        searchKeywords: ["лазерный"],
      },
      {
        slug: "diy-tools-hand-safety",
        labelRu: "Спецодежда и защита",
        parentSlug: "diy-tools-hand",
      },
      {
        slug: "diy-tools-hand-safety-gloves-masks",
        labelRu: "Рабочие перчатки и маски",
        parentSlug: "diy-tools-hand-safety",
        searchKeywords: ["респиратор"],
      },
      {
        slug: "diy-tools-hand-safety-glasses",
        labelRu: "Защитные очки и наушники",
        parentSlug: "diy-tools-hand-safety",
      },
      {
        slug: "diy-tools-hand-boxes",
        labelRu: "Ящики для инструментов",
        parentSlug: "diy-tools-hand",
        searchKeywords: ["органайзер"],
      },
      {
        slug: "diy-tools-electric",
        labelRu: "Электрика и свет",
      },
      {
        slug: "diy-tools-electric-installation",
        labelRu: "Кабель и монтаж",
        parentSlug: "diy-tools-electric",
      },
      {
        slug: "diy-tools-electric-installation-cables",
        labelRu: "Кабели и провода",
        parentSlug: "diy-tools-electric-installation",
      },
      {
        slug: "diy-tools-electric-installation-management",
        labelRu: "Кабель-каналы, гофра, изолента",
        parentSlug: "diy-tools-electric-installation",
      },
      {
        slug: "diy-tools-electric-hardware",
        labelRu: "Розетки и автоматика",
        parentSlug: "diy-tools-electric",
      },
      {
        slug: "diy-tools-electric-hardware-sockets",
        labelRu: "Розетки и выключатели",
        parentSlug: "diy-tools-electric-hardware",
        searchKeywords: ["подрозетник"],
      },
      {
        slug: "diy-tools-electric-hardware-breakers",
        labelRu: "Автоматы и УЗО",
        parentSlug: "diy-tools-electric-hardware",
      },
      {
        slug: "diy-tools-electric-hardware-extensions",
        labelRu: "Удлинители и переходники",
        parentSlug: "diy-tools-electric-hardware",
        searchKeywords: ["тройник"],
      },
      {
        slug: "diy-tools-electric-hardware-panels",
        labelRu: "Счётчики и электрощиты",
        parentSlug: "diy-tools-electric-hardware",
      },
      {
        slug: "diy-tools-electric-bulbs",
        labelRu: "Лампочки и светодиодные ленты",
        parentSlug: "diy-tools-electric",
      },
      {
        slug: "diy-tools-plumbing",
        labelRu: "Сантехника",
      },
      {
        slug: "diy-tools-plumbing-fixtures",
        labelRu: "Смесители и душ",
        parentSlug: "diy-tools-plumbing",
      },
      {
        slug: "diy-tools-plumbing-fixtures-faucets",
        labelRu: "Смесители и краны",
        parentSlug: "diy-tools-plumbing-fixtures",
      },
      {
        slug: "diy-tools-plumbing-fixtures-showers",
        labelRu: "Душевые лейки и стойки",
        parentSlug: "diy-tools-plumbing-fixtures",
        searchKeywords: ["шланг"],
      },
      {
        slug: "diy-tools-plumbing-pipes",
        labelRu: "Трубы и монтаж",
        parentSlug: "diy-tools-plumbing",
      },
      {
        slug: "diy-tools-plumbing-pipes-tubes",
        labelRu: "Трубы, фитинги и подводка",
        parentSlug: "diy-tools-plumbing-pipes",
      },
      {
        slug: "diy-tools-plumbing-pipes-siphons",
        labelRu: "Сифоны и манжеты",
        parentSlug: "diy-tools-plumbing-pipes",
      },
      {
        slug: "diy-tools-plumbing-pipes-seals",
        labelRu: "Герметики и уплотнители",
        parentSlug: "diy-tools-plumbing-pipes",
        searchKeywords: ["фум-лента"],
      },
      {
        slug: "diy-tools-plumbing-sanitary",
        labelRu: "Унитазы, раковины и ванны",
        parentSlug: "diy-tools-plumbing",
      },
      {
        slug: "diy-tools-materials",
        labelRu: "Стройматериалы",
      },
      {
        slug: "diy-tools-materials-fasteners",
        labelRu: "Крепёж",
        parentSlug: "diy-tools-materials",
        searchKeywords: ["метизы"],
      },
      {
        slug: "diy-tools-materials-fasteners-screws",
        labelRu: "Саморезы и гвозди",
        parentSlug: "diy-tools-materials-fasteners",
        searchKeywords: ["шуруп"],
      },
      {
        slug: "diy-tools-materials-fasteners-anchors",
        labelRu: "Дюбели и анкеры",
        parentSlug: "diy-tools-materials-fasteners",
      },
      {
        slug: "diy-tools-materials-chemistry",
        labelRu: "Краски, клеи и смеси",
        parentSlug: "diy-tools-materials",
      },
      {
        slug: "diy-tools-materials-chemistry-paints",
        labelRu: "Краски, лаки и грунтовки",
        parentSlug: "diy-tools-materials-chemistry",
      },
      {
        slug: "diy-tools-materials-chemistry-glues",
        labelRu: "Клеи, пена и жидкие гвозди",
        parentSlug: "diy-tools-materials-chemistry",
      },
      {
        slug: "diy-tools-materials-chemistry-mixes",
        labelRu: "Сухие смеси и шпаклёвки",
        parentSlug: "diy-tools-materials-chemistry",
        searchKeywords: ["затирка"],
      },
      {
        slug: "diy-tools-materials-finishing",
        labelRu: "Обои и напольные покрытия",
        parentSlug: "diy-tools-materials",
        searchKeywords: ["ламинат", "линолеум", "плитка"],
      },
    ],
  },
  {
    rootSlug: "sad",
    nodes: [
      {
        slug: "garden-machinery",
        labelRu: "Садовая техника",
      },
      {
        slug: "garden-machinery-care",
        labelRu: "Газон и кустарники",
        parentSlug: "garden-machinery",
      },
      {
        slug: "garden-machinery-care-mowers",
        labelRu: "Газонокосилки и триммеры",
        parentSlug: "garden-machinery-care",
      },
      {
        slug: "garden-machinery-care-trimmers",
        labelRu: "Кусторезы и сучкорезы",
        parentSlug: "garden-machinery-care",
      },
      {
        slug: "garden-machinery-care-blowers",
        labelRu: "Измельчители и воздуходувки",
        parentSlug: "garden-machinery-care",
      },
      {
        slug: "garden-machinery-heavy",
        labelRu: "Пилы и культиваторы",
        parentSlug: "garden-machinery",
      },
      {
        slug: "garden-machinery-heavy-saws",
        labelRu: "Цепные пилы",
        parentSlug: "garden-machinery-heavy",
        searchKeywords: ["бензопила"],
      },
      {
        slug: "garden-machinery-heavy-tillers",
        labelRu: "Мотоблоки и культиваторы",
        parentSlug: "garden-machinery-heavy",
      },
      {
        slug: "garden-tools",
        labelRu: "Инвентарь и полив",
      },
      {
        slug: "garden-tools-hand",
        labelRu: "Ручной инвентарь",
        parentSlug: "garden-tools",
      },
      {
        slug: "garden-tools-hand-tools",
        labelRu: "Лопаты, грабли и вилы",
        parentSlug: "garden-tools-hand",
        searchKeywords: ["мотыга"],
      },
      {
        slug: "garden-tools-hand-pruners",
        labelRu: "Секаторы и садовые ножовки",
        parentSlug: "garden-tools-hand",
      },
      {
        slug: "garden-tools-hand-barrows",
        labelRu: "Садовые тачки",
        parentSlug: "garden-tools-hand",
      },
      {
        slug: "garden-tools-watering",
        labelRu: "Полив",
        parentSlug: "garden-tools",
      },
      {
        slug: "garden-tools-watering-hoses",
        labelRu: "Шланги и катушки",
        parentSlug: "garden-tools-watering",
        searchKeywords: ["коннектор"],
      },
      {
        slug: "garden-tools-watering-sprinklers",
        labelRu: "Распылители и дождеватели",
        parentSlug: "garden-tools-watering",
        searchKeywords: ["таймер полива"],
      },
      {
        slug: "garden-tools-watering-cans",
        labelRu: "Лейки и опрыскиватели",
        parentSlug: "garden-tools-watering",
      },
      {
        slug: "garden-tools-watering-pumps",
        labelRu: "Садовые насосы",
        parentSlug: "garden-tools-watering",
      },
      {
        slug: "garden-leisure",
        labelRu: "Отдых и пикник",
      },
      {
        slug: "garden-leisure-bbq",
        labelRu: "Мангалы и грили",
        parentSlug: "garden-leisure",
      },
      {
        slug: "garden-leisure-bbq-grills",
        labelRu: "Мангалы, грили и коптильни",
        parentSlug: "garden-leisure-bbq",
      },
      {
        slug: "garden-leisure-bbq-accessories",
        labelRu: "Шампуры и решётки",
        parentSlug: "garden-leisure-bbq",
        searchKeywords: ["щипцы"],
      },
      {
        slug: "garden-leisure-bbq-fuel",
        labelRu: "Уголь и розжиг",
        parentSlug: "garden-leisure-bbq",
        searchKeywords: ["дрова"],
      },
      {
        slug: "garden-leisure-relax",
        labelRu: "Отдых на участке",
        parentSlug: "garden-leisure",
      },
      {
        slug: "garden-leisure-relax-hammocks",
        labelRu: "Качели, гамаки и шезлонги",
        parentSlug: "garden-leisure-relax",
      },
      {
        slug: "garden-leisure-relax-tents",
        labelRu: "Шатры и садовые зонты",
        parentSlug: "garden-leisure-relax",
        searchKeywords: ["тент"],
      },
      {
        slug: "garden-leisure-relax-pools",
        labelRu: "Бассейны",
        parentSlug: "garden-leisure-relax",
        searchKeywords: ["химия для бассейна"],
      },
      {
        slug: "garden-leisure-relax-furniture",
        labelRu: "Садовая мебель",
        parentSlug: "garden-leisure-relax",
      },
      {
        slug: "garden-plants",
        labelRu: "Растения и удобрения",
      },
      {
        slug: "garden-plants-seeds",
        labelRu: "Семена и саженцы",
        parentSlug: "garden-plants",
      },
      {
        slug: "garden-plants-seeds-packets",
        labelRu: "Семена",
        parentSlug: "garden-plants-seeds",
      },
      {
        slug: "garden-plants-seeds-seedlings",
        labelRu: "Саженцы и луковицы",
        parentSlug: "garden-plants-seeds",
      },
      {
        slug: "garden-plants-seeds-soil",
        labelRu: "Грунты",
        parentSlug: "garden-plants-seeds",
        searchKeywords: ["почвосмесь", "дренаж"],
      },
      {
        slug: "garden-plants-protection",
        labelRu: "Удобрения и защита",
        parentSlug: "garden-plants",
      },
      {
        slug: "garden-plants-protection-nutrients",
        labelRu: "Удобрения",
        parentSlug: "garden-plants-protection",
        searchKeywords: ["подкормка"],
      },
      {
        slug: "garden-plants-protection-pesticides",
        labelRu: "От вредителей и сорняков",
        parentSlug: "garden-plants-protection",
      },
      {
        slug: "garden-plants-greenhouses",
        labelRu: "Теплицы и парники",
        parentSlug: "garden-plants",
        searchKeywords: ["укрывной материал"],
      },
      {
        slug: "garden-decor",
        labelRu: "Декор и обустройство",
      },
      {
        slug: "garden-decor-pots",
        labelRu: "Горшки и кашпо",
        parentSlug: "garden-decor",
        searchKeywords: ["вазон"],
      },
      {
        slug: "garden-decor-items",
        labelRu: "Садовые фигуры и светильники",
        parentSlug: "garden-decor",
      },
      {
        slug: "garden-decor-structures",
        labelRu: "Заборчики, арки и опоры",
        parentSlug: "garden-decor",
      },
    ],
  },
  {
    rootSlug: "sport",
    nodes: [
      {
        slug: "sports-leisure-fitness",
        labelRu: "Фитнес и тренажёры",
      },
      {
        slug: "sports-leisure-fitness-home",
        labelRu: "Для дома",
        parentSlug: "sports-leisure-fitness",
      },
      {
        slug: "sports-leisure-fitness-home-mats",
        labelRu: "Коврики для йоги и фитнеса",
        parentSlug: "sports-leisure-fitness-home",
      },
      {
        slug: "sports-leisure-fitness-home-bands",
        labelRu: "Эспандеры и фитнес-резинки",
        parentSlug: "sports-leisure-fitness-home",
      },
      {
        slug: "sports-leisure-fitness-home-accessories",
        labelRu: "Фитболы, обручи и скакалки",
        parentSlug: "sports-leisure-fitness-home",
      },
      {
        slug: "sports-leisure-fitness-heavy",
        labelRu: "Тренажёры и веса",
        parentSlug: "sports-leisure-fitness",
      },
      {
        slug: "sports-leisure-fitness-heavy-weights",
        labelRu: "Гантели, гири и штанги",
        parentSlug: "sports-leisure-fitness-heavy",
      },
      {
        slug: "sports-leisure-fitness-heavy-cardio",
        labelRu: "Беговые дорожки и велотренажёры",
        parentSlug: "sports-leisure-fitness-heavy",
      },
      {
        slug: "sports-leisure-fitness-heavy-bars",
        labelRu: "Турники и брусья",
        parentSlug: "sports-leisure-fitness-heavy",
        searchKeywords: ["скамья"],
      },
      {
        slug: "sports-leisure-camping",
        labelRu: "Туризм и кемпинг",
      },
      {
        slug: "sports-leisure-camping-gear",
        labelRu: "Снаряжение",
        parentSlug: "sports-leisure-camping",
      },
      {
        slug: "sports-leisure-camping-gear-shelter",
        labelRu: "Палатки и спальные мешки",
        parentSlug: "sports-leisure-camping-gear",
        searchKeywords: ["тент"],
      },
      {
        slug: "sports-leisure-camping-gear-mats",
        labelRu: "Туристические коврики",
        parentSlug: "sports-leisure-camping-gear",
        searchKeywords: ["сидушка"],
      },
      {
        slug: "sports-leisure-camping-gear-backpacks",
        labelRu: "Туристические рюкзаки",
        parentSlug: "sports-leisure-camping-gear",
        searchKeywords: ["тактический"],
      },
      {
        slug: "sports-leisure-camping-gear-tools",
        labelRu: "Фонари и мультитулы",
        parentSlug: "sports-leisure-camping-gear",
        searchKeywords: ["компас"],
      },
      {
        slug: "sports-leisure-camping-kitchen",
        labelRu: "Походная кухня",
        parentSlug: "sports-leisure-camping",
      },
      {
        slug: "sports-leisure-camping-kitchen-flasks",
        labelRu: "Термосы",
        parentSlug: "sports-leisure-camping-kitchen",
        searchKeywords: ["термокружка"],
      },
      {
        slug: "sports-leisure-camping-kitchen-burners",
        labelRu: "Горелки и газовые баллоны",
        parentSlug: "sports-leisure-camping-kitchen",
      },
      {
        slug: "sports-leisure-camping-kitchen-cookware",
        labelRu: "Походная посуда",
        parentSlug: "sports-leisure-camping-kitchen",
        searchKeywords: ["котелок"],
      },
      {
        slug: "sports-leisure-camping-fishing",
        labelRu: "Рыбалка",
        parentSlug: "sports-leisure-camping",
        searchKeywords: ["удочка", "снасти"],
      },
      {
        slug: "sports-leisure-seasonal-summer",
        labelRu: "Летний спорт",
      },
      {
        slug: "sports-leisure-seasonal-summer-bicycles",
        labelRu: "Велосипеды",
        parentSlug: "sports-leisure-seasonal-summer",
      },
      {
        slug: "sports-leisure-seasonal-summer-wheels",
        labelRu: "Самокаты и скейтборды",
        parentSlug: "sports-leisure-seasonal-summer",
      },
      {
        slug: "sports-leisure-seasonal-summer-skates",
        labelRu: "Ролики и защита",
        parentSlug: "sports-leisure-seasonal-summer",
      },
      {
        slug: "sports-leisure-seasonal-summer-bike-gear",
        labelRu: "Велоаксессуары",
        parentSlug: "sports-leisure-seasonal-summer",
        searchKeywords: ["шлем", "замок", "фонарь", "звонок"],
      },
      {
        slug: "sports-leisure-seasonal-summer-water",
        labelRu: "Сапборды и лодки",
        parentSlug: "sports-leisure-seasonal-summer",
        searchKeywords: ["sup", "жилет"],
      },
      {
        slug: "sports-leisure-seasonal-winter",
        labelRu: "Зимний спорт",
      },
      {
        slug: "sports-leisure-seasonal-winter-ice",
        labelRu: "Коньки и хоккей",
        parentSlug: "sports-leisure-seasonal-winter",
      },
      {
        slug: "sports-leisure-seasonal-winter-ski",
        labelRu: "Лыжи и сноуборды",
        parentSlug: "sports-leisure-seasonal-winter",
      },
      {
        slug: "sports-leisure-seasonal-winter-sleds",
        labelRu: "Санки и тюбинги",
        parentSlug: "sports-leisure-seasonal-winter",
        searchKeywords: ["ледянка"],
      },
      {
        slug: "sports-leisure-activities",
        labelRu: "Игры, единоборства, плавание",
      },
      {
        slug: "sports-leisure-activities-balls",
        labelRu: "Мячи",
        parentSlug: "sports-leisure-activities",
        searchKeywords: ["футбольный", "баскетбольный", "волейбольный"],
      },
      {
        slug: "sports-leisure-activities-rackets",
        labelRu: "Теннис и бадминтон",
        parentSlug: "sports-leisure-activities",
        searchKeywords: ["настольный теннис"],
      },
      {
        slug: "sports-leisure-activities-combat",
        labelRu: "Бокс и единоборства",
        parentSlug: "sports-leisure-activities",
        searchKeywords: ["груша", "перчатки"],
      },
      {
        slug: "sports-leisure-activities-swimming",
        labelRu: "Плавание",
        parentSlug: "sports-leisure-activities",
        searchKeywords: ["очки", "шапочка", "ласты"],
      },
      {
        slug: "sports-leisure-nutrition",
        labelRu: "Спортивное питание",
      },
      {
        slug: "sports-leisure-nutrition-supplements",
        labelRu: "Протеины и аминокислоты",
        parentSlug: "sports-leisure-nutrition",
        searchKeywords: ["гейнер", "bcaa"],
      },
      {
        slug: "sports-leisure-nutrition-snacks",
        labelRu: "Батончики и изотоники",
        parentSlug: "sports-leisure-nutrition",
      },
      {
        slug: "sports-leisure-nutrition-bottles",
        labelRu: "Бутылки и шейкеры",
        parentSlug: "sports-leisure-nutrition",
      },
    ],
  },
  {
    rootSlug: "autos",
    nodes: [
      {
        slug: "autos-vehicles",
        labelRu: "Транспорт",
      },
      {
        slug: "autos-vehicles-cars",
        labelRu: "Автомобили",
        parentSlug: "autos-vehicles",
      },
      {
        slug: "autos-vehicles-moto",
        labelRu: "Мотоциклы и скутеры",
        parentSlug: "autos-vehicles",
      },
      {
        slug: "autos-vehicles-electric",
        labelRu: "Электросамокаты и электровелосипеды",
        parentSlug: "autos-vehicles",
      },
      {
        slug: "autos-vehicles-trucks",
        labelRu: "Грузовики и спецтехника",
        parentSlug: "autos-vehicles",
      },
      {
        slug: "autos-wheels",
        labelRu: "Шины и диски",
      },
      {
        slug: "autos-wheels-tires",
        labelRu: "Шины",
        parentSlug: "autos-wheels",
        searchKeywords: ["резина"],
      },
      {
        slug: "autos-wheels-rims",
        labelRu: "Диски",
        parentSlug: "autos-wheels",
      },
      {
        slug: "autos-parts",
        labelRu: "Запчасти",
      },
      {
        slug: "autos-parts-maintenance",
        labelRu: "Для ТО",
        parentSlug: "autos-parts",
        searchKeywords: ["расходники"],
      },
      {
        slug: "autos-parts-maintenance-filters",
        labelRu: "Фильтры",
        parentSlug: "autos-parts-maintenance",
        searchKeywords: ["воздушный", "масляный", "салонный"],
      },
      {
        slug: "autos-parts-maintenance-spark-plugs",
        labelRu: "Свечи зажигания",
        parentSlug: "autos-parts-maintenance",
      },
      {
        slug: "autos-parts-maintenance-brakes",
        labelRu: "Тормозные колодки и диски",
        parentSlug: "autos-parts-maintenance",
      },
      {
        slug: "autos-parts-maintenance-belts",
        labelRu: "Ремни и ролики",
        parentSlug: "autos-parts-maintenance",
      },
      {
        slug: "autos-parts-electronics",
        labelRu: "Электрика и свет",
        parentSlug: "autos-parts",
      },
      {
        slug: "autos-parts-electronics-bulbs",
        labelRu: "Автолампы",
        parentSlug: "autos-parts-electronics",
      },
      {
        slug: "autos-parts-electronics-fuses",
        labelRu: "Предохранители",
        parentSlug: "autos-parts-electronics",
      },
      {
        slug: "autos-parts-electronics-batteries",
        labelRu: "Аккумуляторы",
        parentSlug: "autos-parts-electronics",
        searchKeywords: ["акб"],
      },
      {
        slug: "autos-parts-engine-suspension",
        labelRu: "Двигатель и подвеска",
        parentSlug: "autos-parts",
      },
      {
        slug: "autos-parts-body",
        labelRu: "Кузов и оптика",
        parentSlug: "autos-parts",
        searchKeywords: ["бампер", "фара"],
      },
      {
        slug: "autos-care",
        labelRu: "Масла и автохимия",
      },
      {
        slug: "autos-care-fluids",
        labelRu: "Масла и жидкости",
        parentSlug: "autos-care",
      },
      {
        slug: "autos-care-fluids-oils",
        labelRu: "Моторные и трансмиссионные масла",
        parentSlug: "autos-care-fluids",
      },
      {
        slug: "autos-care-fluids-antifreeze",
        labelRu: "Антифризы",
        parentSlug: "autos-care-fluids",
        searchKeywords: ["тосол"],
      },
      {
        slug: "autos-care-fluids-screenwash",
        labelRu: "Омыватели стёкол",
        parentSlug: "autos-care-fluids",
        searchKeywords: ["незамерзайка"],
      },
      {
        slug: "autos-care-fluids-additives",
        labelRu: "Тормозная жидкость и присадки",
        parentSlug: "autos-care-fluids",
      },
      {
        slug: "autos-care-cosmetics",
        labelRu: "Автокосметика",
        parentSlug: "autos-care",
      },
      {
        slug: "autos-care-cosmetics-shampoos",
        labelRu: "Автошампуни и очистители",
        parentSlug: "autos-care-cosmetics",
      },
      {
        slug: "autos-care-cosmetics-wipes",
        labelRu: "Губки и салфетки",
        parentSlug: "autos-care-cosmetics",
      },
      {
        slug: "autos-care-cosmetics-fresheners",
        labelRu: "Ароматизаторы",
        parentSlug: "autos-care-cosmetics",
      },
      {
        slug: "autos-care-cosmetics-polishes",
        labelRu: "Полироли и воски",
        parentSlug: "autos-care-cosmetics",
      },
      {
        slug: "autos-accessories",
        labelRu: "Аксессуары",
      },
      {
        slug: "autos-accessories-interior",
        labelRu: "Для салона",
        parentSlug: "autos-accessories",
      },
      {
        slug: "autos-accessories-interior-holders",
        labelRu: "Держатели для телефона",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-interior-chargers",
        labelRu: "Зарядки и кабели",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-interior-mats",
        labelRu: "Автоковрики",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-interior-covers",
        labelRu: "Чехлы и накидки на сиденья",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-interior-organizers",
        labelRu: "Органайзеры",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-interior-dashcams",
        labelRu: "Видеорегистраторы",
        parentSlug: "autos-accessories-interior",
        searchKeywords: ["радар-детектор"],
      },
      {
        slug: "autos-accessories-interior-child-seats",
        labelRu: "Детские автокресла",
        parentSlug: "autos-accessories-interior",
      },
      {
        slug: "autos-accessories-exterior",
        labelRu: "Для кузова",
        parentSlug: "autos-accessories",
      },
      {
        slug: "autos-accessories-exterior-wipers",
        labelRu: "Щётки стеклоочистителя",
        parentSlug: "autos-accessories-exterior",
        searchKeywords: ["дворники"],
      },
      {
        slug: "autos-accessories-exterior-scrapers",
        labelRu: "Скребки и щётки от снега",
        parentSlug: "autos-accessories-exterior",
      },
      {
        slug: "autos-accessories-exterior-car-covers",
        labelRu: "Тенты и чехлы на авто",
        parentSlug: "autos-accessories-exterior",
      },
      {
        slug: "autos-tools",
        labelRu: "Инструменты и аварийный набор",
      },
      {
        slug: "autos-tools-emergency",
        labelRu: "Аварийный набор",
        parentSlug: "autos-tools",
      },
      {
        slug: "autos-tools-emergency-first-aid",
        labelRu: "Автоаптечки",
        parentSlug: "autos-tools-emergency",
      },
      {
        slug: "autos-tools-emergency-extinguishers",
        labelRu: "Огнетушители",
        parentSlug: "autos-tools-emergency",
      },
      {
        slug: "autos-tools-emergency-ropes",
        labelRu: "Буксировочные тросы",
        parentSlug: "autos-tools-emergency",
      },
      {
        slug: "autos-tools-emergency-jumper-cables",
        labelRu: "Провода для прикуривания",
        parentSlug: "autos-tools-emergency",
      },
      {
        slug: "autos-tools-emergency-safety-gear",
        labelRu: "Знаки и жилеты",
        parentSlug: "autos-tools-emergency",
      },
      {
        slug: "autos-tools-hardware",
        labelRu: "Инструменты",
        parentSlug: "autos-tools",
      },
      {
        slug: "autos-tools-hardware-jacks",
        labelRu: "Домкраты",
        parentSlug: "autos-tools-hardware",
      },
      {
        slug: "autos-tools-hardware-wrenches",
        labelRu: "Наборы ключей и головок",
        parentSlug: "autos-tools-hardware",
      },
      {
        slug: "autos-tools-hardware-pumps",
        labelRu: "Компрессоры и насосы",
        parentSlug: "autos-tools-hardware",
      },
      {
        slug: "autos-tools-hardware-hand-tools",
        labelRu: "Ручной инструмент",
        parentSlug: "autos-tools-hardware",
      },
    ],
  },
  {
    rootSlug: "flowers",
    nodes: [
      {
        slug: "flowers-gifts-bouquets",
        labelRu: "Цветы и букеты",
      },
      {
        slug: "flowers-gifts-bouquets-art",
        labelRu: "Букеты и композиции",
        parentSlug: "flowers-gifts-bouquets",
      },
      {
        slug: "flowers-gifts-bouquets-art-custom",
        labelRu: "Авторские букеты",
        parentSlug: "flowers-gifts-bouquets-art",
      },
      {
        slug: "flowers-gifts-bouquets-art-boxes",
        labelRu: "Цветы в коробках и корзинах",
        parentSlug: "flowers-gifts-bouquets-art",
      },
      {
        slug: "flowers-gifts-bouquets-art-wedding",
        labelRu: "Свадебные букеты",
        parentSlug: "flowers-gifts-bouquets-art",
        searchKeywords: ["букет невесты"],
      },
      {
        slug: "flowers-gifts-bouquets-mono",
        labelRu: "Монобукеты",
        parentSlug: "flowers-gifts-bouquets",
      },
      {
        slug: "flowers-gifts-bouquets-mono-roses",
        labelRu: "Розы",
        parentSlug: "flowers-gifts-bouquets-mono",
      },
      {
        slug: "flowers-gifts-bouquets-mono-peonies",
        labelRu: "Пионы",
        parentSlug: "flowers-gifts-bouquets-mono",
      },
      {
        slug: "flowers-gifts-bouquets-mono-seasonal",
        labelRu: "Тюльпаны, хризантемы, герберы",
        parentSlug: "flowers-gifts-bouquets-mono",
      },
      {
        slug: "flowers-gifts-bouquets-mono-dry",
        labelRu: "Гипсофилы и сухоцветы",
        parentSlug: "flowers-gifts-bouquets-mono",
      },
      {
        slug: "flowers-gifts-bouquets-potted",
        labelRu: "Комнатные растения",
        parentSlug: "flowers-gifts-bouquets",
      },
      {
        slug: "flowers-gifts-edible",
        labelRu: "Съедобные букеты и сладости",
      },
      {
        slug: "flowers-gifts-edible-sweet",
        labelRu: "Сладкие подарки",
        parentSlug: "flowers-gifts-edible",
      },
      {
        slug: "flowers-gifts-edible-sweet-strawberry",
        labelRu: "Клубника в шоколаде",
        parentSlug: "flowers-gifts-edible-sweet",
      },
      {
        slug: "flowers-gifts-edible-sweet-chocolate",
        labelRu: "Шоколад и конфеты ручной работы",
        parentSlug: "flowers-gifts-edible-sweet",
      },
      {
        slug: "flowers-gifts-edible-sweet-cakes",
        labelRu: "Торты и капкейки",
        parentSlug: "flowers-gifts-edible-sweet",
        searchKeywords: ["бенто"],
      },
      {
        slug: "flowers-gifts-edible-savory",
        labelRu: "Гастрономические наборы",
        parentSlug: "flowers-gifts-edible",
      },
      {
        slug: "flowers-gifts-edible-savory-mens",
        labelRu: "Мясные и сырные букеты",
        parentSlug: "flowers-gifts-edible-savory",
        searchKeywords: ["мужской букет"],
      },
      {
        slug: "flowers-gifts-edible-savory-baskets",
        labelRu: "Фруктовые и подарочные корзины",
        parentSlug: "flowers-gifts-edible-savory",
      },
      {
        slug: "flowers-gifts-party",
        labelRu: "Шары и декор",
      },
      {
        slug: "flowers-gifts-party-balloons",
        labelRu: "Воздушные шары",
        parentSlug: "flowers-gifts-party",
      },
      {
        slug: "flowers-gifts-party-balloons-helium",
        labelRu: "Гелиевые шары и фонтаны",
        parentSlug: "flowers-gifts-party-balloons",
      },
      {
        slug: "flowers-gifts-party-balloons-shapes",
        labelRu: "Фигуры и цифры из шаров",
        parentSlug: "flowers-gifts-party-balloons",
      },
      {
        slug: "flowers-gifts-party-supplies",
        labelRu: "Для праздника",
        parentSlug: "flowers-gifts-party",
      },
      {
        slug: "flowers-gifts-party-supplies-cards",
        labelRu: "Открытки и конверты",
        parentSlug: "flowers-gifts-party-supplies",
        searchKeywords: ["топпер"],
      },
      {
        slug: "flowers-gifts-party-supplies-items",
        labelRu: "Свечи для торта и гирлянды",
        parentSlug: "flowers-gifts-party-supplies",
        searchKeywords: ["хлопушка"],
      },
      {
        slug: "flowers-gifts-items",
        labelRu: "Подарки и сувениры",
      },
      {
        slug: "flowers-gifts-items-toys",
        labelRu: "Мягкие игрушки",
        parentSlug: "flowers-gifts-items",
        searchKeywords: ["плюшевый мишка"],
      },
      {
        slug: "flowers-gifts-items-beauty",
        labelRu: "Подарочные наборы косметики",
        parentSlug: "flowers-gifts-items",
      },
      {
        slug: "flowers-gifts-items-scents",
        labelRu: "Ароматические свечи и диффузоры",
        parentSlug: "flowers-gifts-items",
      },
      {
        slug: "flowers-gifts-items-certificates",
        labelRu: "Подарочные сертификаты",
        parentSlug: "flowers-gifts-items",
      },
      {
        slug: "flowers-gifts-items-souvenirs",
        labelRu: "Сувениры",
        parentSlug: "flowers-gifts-items",
      },
    ],
  },
  {
    rootSlug: "uvelirka",
    nodes: [
      {
        slug: "jewelry-earrings",
        labelRu: "Серьги",
      },
      {
        slug: "jewelry-earrings-gold",
        labelRu: "Золотые серьги",
        parentSlug: "jewelry-earrings",
      },
      {
        slug: "jewelry-earrings-silver",
        labelRu: "Серебряные серьги",
        parentSlug: "jewelry-earrings",
      },
      {
        slug: "jewelry-earrings-studs",
        labelRu: "Пусеты",
        parentSlug: "jewelry-earrings",
        searchKeywords: ["гвоздики"],
      },
      {
        slug: "jewelry-earrings-hoops",
        labelRu: "Серьги-конго",
        parentSlug: "jewelry-earrings",
        searchKeywords: ["кольца"],
      },
      {
        slug: "jewelry-rings",
        labelRu: "Кольца",
      },
      {
        slug: "jewelry-rings-wedding",
        labelRu: "Обручальные и помолвочные",
        parentSlug: "jewelry-rings",
      },
      {
        slug: "jewelry-rings-gold",
        labelRu: "Золотые кольца",
        parentSlug: "jewelry-rings",
      },
      {
        slug: "jewelry-rings-silver",
        labelRu: "Серебряные кольца",
        parentSlug: "jewelry-rings",
      },
      {
        slug: "jewelry-rings-signet",
        labelRu: "Печатки и перстни",
        parentSlug: "jewelry-rings",
      },
      {
        slug: "jewelry-pendants",
        labelRu: "Подвески и кулоны",
      },
      {
        slug: "jewelry-pendants-decorative",
        labelRu: "Кулоны и подвески",
        parentSlug: "jewelry-pendants",
      },
      {
        slug: "jewelry-pendants-religious",
        labelRu: "Религиозные подвески",
        parentSlug: "jewelry-pendants",
        searchKeywords: ["крестик", "полумесяц"],
      },
      {
        slug: "jewelry-pendants-zodiac",
        labelRu: "Знаки зодиака и буквы",
        parentSlug: "jewelry-pendants",
      },
      {
        slug: "jewelry-chains",
        labelRu: "Цепи и браслеты",
      },
      {
        slug: "jewelry-chains-neck",
        labelRu: "Цепи",
        parentSlug: "jewelry-chains",
        searchKeywords: ["цепочка"],
      },
      {
        slug: "jewelry-chains-bracelets",
        labelRu: "Браслеты",
        parentSlug: "jewelry-chains",
      },
      {
        slug: "jewelry-chains-cords",
        labelRu: "Шнурки",
        parentSlug: "jewelry-chains",
        searchKeywords: ["кожаный", "шёлковый", "каучуковый"],
      },
      {
        slug: "jewelry-precious",
        labelRu: "Украшения с камнями",
      },
      {
        slug: "jewelry-precious-diamonds",
        labelRu: "Украшения с бриллиантами",
        parentSlug: "jewelry-precious",
      },
      {
        slug: "jewelry-precious-gems",
        labelRu: "С драгоценными камнями",
        parentSlug: "jewelry-precious",
        searchKeywords: ["изумруд", "рубин", "сапфир"],
      },
      {
        slug: "jewelry-precious-semi",
        labelRu: "С полудрагоценными камнями",
        parentSlug: "jewelry-precious",
        searchKeywords: ["топаз"],
      },
      {
        slug: "jewelry-precious-fianite",
        labelRu: "Украшения с фианитами",
        parentSlug: "jewelry-precious",
      },
      {
        slug: "jewelry-accessories",
        labelRu: "Броши, часы и другое",
      },
      {
        slug: "jewelry-accessories-brooches",
        labelRu: "Броши и булавки",
        parentSlug: "jewelry-accessories",
      },
      {
        slug: "jewelry-accessories-watches",
        labelRu: "Ювелирные часы",
        parentSlug: "jewelry-accessories",
      },
      {
        slug: "jewelry-accessories-piercing",
        labelRu: "Пирсинг",
        parentSlug: "jewelry-accessories",
      },
      {
        slug: "jewelry-accessories-cufflinks",
        labelRu: "Запонки и зажимы",
        parentSlug: "jewelry-accessories",
      },
      {
        slug: "jewelry-sets",
        labelRu: "Комплекты украшений",
      },
    ],
  },
];
