import { reassignProductsToCategoryLeaves } from "../../services/product/reassignProductsToCategoryLeaves.js";

const HOLDERS = "autos-accessories-interior-holders";
const WIPES = "autos-care-cosmetics-wipes";
const CLEANERS = "autos-care-cosmetics-shampoos";
const FRESHENERS = "autos-care-cosmetics-fresheners";
const POLISHES = "autos-care-cosmetics-polishes";
const BODY = "autos-parts-body";
const ORGANIZERS = "autos-accessories-interior-organizers";

/**
 * Товары, оставшиеся без подкатегории после `20261006-catalog-category-tree`
 * (26 штук, все одного продавца), раскладываем по новому дереву «Автомобили».
 * Раскладку согласовал владелец 06.10.2026.
 *
 * Последние четыре — «ближайшая подходящая»: точной подкатегории под них в
 * дереве нет. Два игровых аксессуара для телефона из «Аксессуаров» сюда не
 * входят и остаются без подкатегории: им место в «Электронике».
 */
const ASSIGNMENTS = {
  // Держатели для телефона
  "6a9d63c3c6ceeb9b135cd93b": HOLDERS, // Автодержатель H-30
  "6a9d63c3c6ceeb9b135cd941": HOLDERS, // Автодержатель HOCO CA79
  "6a9d63c3c6ceeb9b135cd953": HOLDERS, // Автодержатель HOCO CA56 Plus
  "6a9d63c3c6ceeb9b135cd959": HOLDERS, // Автодержатель HOCO H7
  "6a9d63c3c6ceeb9b135cd95f": HOLDERS, // Автодержатель Hoco CA65 магнитный
  "6a9d63c3c6ceeb9b135cd965": HOLDERS, // Автодержатель HOCO CA81 Ligue
  "6aa150a914836a4a4acfa97c": HOLDERS, // Автодержатель H-52
  "6aa150a914836a4a4acfa983": HOLDERS, // Автодержатель HOCO CA55
  "6aa150a914836a4a4acfa98a": HOLDERS, // Автодержатель HOCO H70
  // Губки и салфетки
  "6a9d63c3c6ceeb9b135cd983": WIPES, // Губка для мытья автомобиля Rilly 80
  "6a9d63c3c6ceeb9b135cd989": WIPES, // Авто тряпка Лио 12шт
  "6aa401da904324f470aa074b": WIPES, // Тряпки машинные двухсторонние
  "6aa150bc14836a4a4acfb1fe": WIPES, // Губка автомобильная «Снежинка»
  // Автошампуни и очистители
  "6a9d63c3c6ceeb9b135cd935": CLEANERS, // Очиститель двигателя Engine Cleaner
  "6a9d63c3c6ceeb9b135cd977": CLEANERS, // Набор по уходу за автомобилем Grass
  "6aa1513514836a4a4acfe5ed": CLEANERS, // Чистящее средство для автодисков
  // Ароматизаторы
  "6a9d63c3c6ceeb9b135cd96b": FRESHENERS, // Парфюм для салона Senso, Dr.Marcus
  "6a9d63c3c6ceeb9b135cd97d": FRESHENERS, // Ароматизатор (флакон)
  // Полироли и воски
  "6a9d63c3c6ceeb9b135cd971": POLISHES, // Полироль пластика Бриллиант
  "6aa1513314836a4a4acfe52e": POLISHES, // Чернитель автоколес «Раббер»
  // Ближайшая подходящая подкатегория
  "6a9d63c3c6ceeb9b135cd947": BODY, // Зеркало внутреннее Expert partner К405
  "6aa150da14836a4a4acfc0cc": BODY, // Краска и лак MASERATI LEVANTE
  "6aa150b714836a4a4acfaf86": WIPES, // Водосгон OKTAN 27 см
  "6a9d63c3c6ceeb9b135cd94d": ORGANIZERS, // Автовизитка HOCO PH41
};

/**
 * Товар, которому продавец уже сам выбрал подкатегорию, не трогаем — поэтому
 * миграция идемпотентна. Без `--apply` только считает.
 */
export const up = async ({ isApply } = {}) =>
  reassignProductsToCategoryLeaves({
    assignments: ASSIGNMENTS,
    dryRun: isApply !== true,
  });
