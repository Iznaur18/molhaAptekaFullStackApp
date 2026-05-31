import mongoose from 'mongoose';

import { PRODUCT_REPORT_TEXT_MAX_CHARS } from '../constants/productReportConstants.js';
import {
    USER_STORY_REPORT_STATUS_PENDING,
    USER_STORY_REPORT_STATUSES,
} from '../constants/userStoryConstants.js';

const UserStoryReportSchema = new mongoose.Schema(
    {
        storyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserStory',
            required: true,
        },
        reporterUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reportText: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_REPORT_TEXT_MAX_CHARS,
        },
        status: {
            type: String,
            enum: USER_STORY_REPORT_STATUSES,
            default: USER_STORY_REPORT_STATUS_PENDING,
        },
        staffNote: {
            type: String,
            default: '',
            trim: true,
            maxlength: 2000,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

UserStoryReportSchema.index({ status: 1, createdAt: 1 });
UserStoryReportSchema.index({ storyId: 1, status: 1 });
UserStoryReportSchema.index(
    { storyId: 1, reporterUserId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: USER_STORY_REPORT_STATUS_PENDING },
    },
);

export default mongoose.model('UserStoryReport', UserStoryReportSchema);
