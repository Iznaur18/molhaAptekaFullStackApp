import { UserModel } from '../../models/index.js';

const LEGACY_PREMIUM_FALLBACK = new Date('2099-12-31T23:59:59.000Z');

export async function up() {
    const missingField = await UserModel.updateMany(
        { premiumExpiresAt: { $exists: false } },
        { $set: { premiumExpiresAt: null, premiumExpiryReminderSentAt: null } },
    );
    const legacyPremium = await UserModel.updateMany(
        {
            isPremiumUser: true,
            $or: [{ premiumExpiresAt: null }, { premiumExpiresAt: { $exists: false } }],
        },
        { $set: { premiumExpiresAt: LEGACY_PREMIUM_FALLBACK } },
    );

    console.log(
        `premiumExpiresAt: backfilled fields ${missingField.modifiedCount ?? missingField.nModified ?? 0}, legacy premium ${legacyPremium.modifiedCount ?? legacyPremium.nModified ?? 0}`,
    );
}
