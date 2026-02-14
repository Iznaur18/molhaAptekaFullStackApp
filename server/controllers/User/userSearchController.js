import { UserModel } from '../../models/index.js';
import { successRes, errorRes } from '../../utils/index.js';

export const userSearchController = async (req, res) => {
    try {
        // req.query — объект (параметры) с тем, что в URL после ?, например:GET /user?search=ivan&isPremiumUser=true&page=2&limit=20
        // сервер получил запрос GET /user?search=ivan&isPremiumUser=true&page=2&limit=20
        // то что отправил на клиент
        const { search, isPremiumUser, isActiveUser, isBlockedUser, page: pageParam, limit: limitParam } = req.query; // Название параметра — это просто договорённость между клиентом и сервером. Например, page — это название параметра для страницы, limit — это название параметра для лимита.

        // Расчёт пагинации
        const page = Math.max(1, parseInt(pageParam, 10) || 1); // из клиента придет page=2 в URL.
        const limit = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 10)); // parseInt(limitParam, 10) — преобразует строку в число, 10 — основание системы счисления (десятичная система)
        const skip = (page - 1) * limit; // skip — количество пользователей, которые нужно пропустить

        // Сбор условия querySearch (текст + флаги)
        // querySearch — обычный объект. В него по шагам складываются условия для MongoDB: сюда пойдёт и поиск по тексту, и фильтры по флагам.
        const querySearch = {}; // querySearch — объект с тем, что будет использоваться для поиска пользователей

        if (search && typeof search === 'string' && search.trim()) { // если search передан и является строкой и не пустой
            const term = search.trim(); // term — строка, в которой удалены пробелы в начале и конце
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // экранирование спецсимволов regex, чтобы поиск "1+1" не ломал запрос и не создавал риски ReDoS
            querySearch.$or = [ // $or — оператор OR (или) (для поиска по нескольким полям)
                { userName: { $regex: escaped, $options: 'i' } }, // $regex — оператор регулярного выражения, $options: 'i' — игнорирование регистра. Если userName содержит term, то добавляем в querySearch.
                { userPhoneNumber: { $regex: escaped, $options: 'i' } }, // если userPhoneNumber содержит term, то добавляем в querySearch.
                { email: { $regex: escaped, $options: 'i' } }, // если email содержит term, то добавляем в querySearch.
            ];
        }

        if (isPremiumUser === 'true') { // если isPremiumUser передан и равен 'true'
            querySearch.isPremiumUser = true; // добавляем isPremiumUser в querySearch. Выглядит как { isPremiumUser: true }.
        }
        if (isActiveUser === 'true') { // если isActiveUser передан и равен 'true'
            querySearch.isActiveUser = true;
        }
        if (isBlockedUser === 'true') { // если isBlockedUser передан и равен 'true'
            querySearch.isBlockedUser = true;
        }

        // UserModel.find(querySearch) — найти всех пользователей по собранному условию querySearch (и текст, и флаги).
        const users = await UserModel.find(querySearch) // найти пользователей по querySearch. querySearch — объект с тем, что будет использоваться для поиска пользователей
            .select('_id userName userPhoneNumber email isPremiumUser isActiveUser isBlockedUser') // выбрать поля, которые нужно вернуть (_id нужен клиенту для ссылки на профиль)
            .sort({ userName: 1 }) // сортировать по userName по возрастанию
            .skip(skip) // пропустить skip пользователей
            .limit(limit) // ограничить количество пользователей на странице
            .lean(); // вернуть объекты без методов MongoDB

        // UserModel.countDocuments(querySearch) — сколько всего документов подходит под то же самое условие querySearch (без пагинации).
        // Результат в total — нужно клиенту, чтобы рисовать страницы («всего 50, по 10 на странице = 5 страниц»).
        const total = await UserModel.countDocuments(querySearch);

        if (!users || users.length === 0) { // если пользователи не найдены или их нет
            return successRes(res, { users: 'Пользователи не найдены ни по одному из параметров', total: 0, page: 1, limit: 10 });
        }
        
        return successRes(res, { users, total, page, limit });
    
    } catch (error) {
        console.error('userSearchController error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении пользователей');
    }
};

// Кратко по порядку: импорты → чтение параметров из URL
// → расчёт пагинации → сбор условия querySearch (текст + флаги)
// → запрос в БД с пагинацией и сортировкой → подсчёт total
// → успешный ответ или ответ с ошибкой в catch.