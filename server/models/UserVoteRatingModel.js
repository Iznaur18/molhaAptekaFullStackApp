import mongoose from "mongoose";

const UserVoteRatingSchema = new mongoose.Schema({
    userVoter: {
        type: mongoose.Schema.Types.ObjectId, // id пользователя который проголосовал
        ref: 'User',
        required: true,
    },
    userVoteTarget: {
        type: mongoose.Schema.Types.ObjectId, // id пользователя за которого проголосовали
        ref: 'User',
        required: true,
    },
    userVoteValue: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    }
}, {
    timestamps: true, // createdAt, updatedAt — когда голос поставлен/обновлён
});

// Один пользователь — один голос за одного целевого пользователя
UserVoteRatingSchema.index({ userVoter: 1, userVoteTarget: 1 }, { unique: true }); // уникальный индекс для userVoter и userVoteTarget, нужен для того чтобы нельзя было проголосовать за одного и того же пользователя больше одного раза

// Дополнительные индексы для производительности
// Индекс для поиска всех голосов за конкретного пользователя (для получения рейтинга)
UserVoteRatingSchema.index({ userVoteTarget: 1, createdAt: -1 });

// Индекс для поиска всех голосов конкретного пользователя (для истории голосований)
UserVoteRatingSchema.index({ userVoter: 1, createdAt: -1 });

// Индекс для сортировки по значению голоса
UserVoteRatingSchema.index({ userVoteTarget: 1, userVoteValue: -1 });

// Запрет голосовать за самого себя
// UserVoteRatingSchema.pre('save', function (next) {
//     if (this.userVoter && this.userVoteTarget && this.userVoter.equals(this.userVoteTarget)) {
//         next(new Error('Нельзя голосовать за самого себя'));
//     } else {
//         next();
//     }
// });
export const UserVoteRatingModel = mongoose.model('UserVoteRating', UserVoteRatingSchema); 