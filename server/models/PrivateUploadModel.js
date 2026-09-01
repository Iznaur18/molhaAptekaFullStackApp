import mongoose from "mongoose";

/**
 * Кто загрузил приватный файл.
 *
 * Имя приватного файла — это по сути пароль к нему: знаешь имя, знаешь URL.
 * Без учёта владельца любой пользователь мог подставить в свою заявку чужую
 * ссылку — и показать модератору чужой документ как свой, а заодно получить
 * к нему постоянный доступ.
 */
const privateUploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** `passport-selfie`, `courier-document` — зачем файл загружали. */
    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PrivateUploadModel = mongoose.model("PrivateUpload", privateUploadSchema);
