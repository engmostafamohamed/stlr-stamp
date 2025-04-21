"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const roles = [
            'admin',
            'customer',
            'employee',
            'merchant',
            'branch_manager',
        ];
        // Create all roles
        for (const roleName of roles) {
            yield prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: { name: roleName },
            });
        }
        const adminEmail = 'admin@admin.com';
        const adminPassword = yield bcrypt_1.default.hash('admin123', 10);
        // Get the admin role
        const adminRole = yield prisma.role.findUnique({
            where: { name: 'admin' },
        });
        if (!adminRole) {
            throw new Error('Admin role not found');
        }
        // Create admin user if not exists
        yield prisma.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                username: 'admin',
                email: adminEmail,
                phone: '0000000000',
                password: adminPassword,
                roles: {
                    connect: [{ id: adminRole.id }],
                },
            }
        });
        console.log('Admin user seeded.');
    });
}
main()
    .catch((e) => {
    console.error('Seeder failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
