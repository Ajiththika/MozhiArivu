import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../Models/userModel.js';

// Load environment variables from .env.local, .env, etc. based on Next.js conventions
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI is missing in environment variables.");
    process.exit(1);
}

const runSeed = async () => {
    try {
        console.log("⏳ Connecting to the database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Successfully connected to MongoDB.");

        const saltRounds = 10;
        const commonPassword = "Password123!"; // You can change this if needed
        console.log("⏳ Hashing the default password safely. Please hold on...");

        // Hash password only once to save computing time
        const hashedPassword = await bcrypt.hash(commonPassword, saltRounds);

        const seedUsers = [
            {
                email: "superadmin@example.com",
                role: "SUPER_ADMIN", // From your Mongoose Schema enum
                status: "ACTIVE",
                emailVerified: true,
                passwordHash: hashedPassword,
                authProviders: ['email']
            },
            {
                email: "admin1@example.com",
                role: "ADMIN",
                status: "ACTIVE",
                emailVerified: true,
                passwordHash: hashedPassword,
                authProviders: ['email']
            },
            {
                email: "admin2@example.com",
                role: "ADMIN",
                status: "ACTIVE",
                emailVerified: true,
                passwordHash: hashedPassword,
                authProviders: ['email']
            }
        ];

        // Add 10 normal students
        for (let i = 1; i <= 10; i++) {
            seedUsers.push({
                email: `student${i}@example.com`,
                role: "USER_STUDENT",
                status: "ACTIVE",
                emailVerified: true,
                passwordHash: hashedPassword,
                authProviders: ['email']
            });
        }

        console.log(`\n🚀 Starting seeding of ${seedUsers.length} users...`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const userData of seedUsers) {
            // Find existing user by email to prevent duplication on multiple runs
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                // Safe replace/update holding the same MongoDB _id
                await User.updateOne(
                    { _id: existingUser._id },
                    { $set: userData },
                    { runValidators: true }
                );
                updatedCount++;
                console.log(`🔄 Updated existing user: ${userData.email} (Role: ${userData.role})`);
            } else {
                // Create new user if not found
                await User.create(userData);
                createdCount++;
                console.log(`✅ Created new user: ${userData.email} (Role: ${userData.role})`);
            }
        }

        console.log(`\n🎉 Seeding finished successfully!`);
        console.log(`📈 Summary: ${createdCount} created, ${updatedCount} updated.`);
        console.log(`🔑 All seeded users have the login password: ${commonPassword}`);
        console.log(`⚠️  Wait! NEVER use generic/dummy passwords in production environment!`);

    } catch (error) {
        console.error("\n❌ Seeding failed. See the error log below:");
        console.error(error);
        process.exit(1);
    } finally {
        // Cleanly close the database connection
        console.log("\n⏳ Disconnecting from database...");
        await mongoose.disconnect();
        console.log("👋 Disconnected.");
        process.exit(0);
    }
};

runSeed();
