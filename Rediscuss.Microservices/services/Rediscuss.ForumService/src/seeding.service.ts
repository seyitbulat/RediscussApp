import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './permissions/schemas/permission.schema';
import { Role } from './roles/schemas/role.schema';
import { Topic } from './topics/schemas/topic.schema';

@Injectable()
export class SeedingService implements OnModuleInit {
    constructor(
        @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
        @InjectModel(Topic.name) private readonly topicModel : Model<Topic>
    ) { }

    async onModuleInit() {
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedTopics();
    }

    private async seedPermissions() {
        const permissionInDb = await this.permissionModel.estimatedDocumentCount();

        if (permissionInDb > 0) {
            return;
        }

        const permissions = [
            { ActionName: "discuit:create", Description: "Yeni bir discuit oluşturma" },
            { ActionName: "discuit:follow", Description: "Bir discuit'i takip etme" },
            { ActionName: "discuit:unfollow", Description: "Bir discuit'i takipten çıkma" },
            { ActionName: "discuit:edit:own", Description: "Kendi discuit'ini düzenleme" },
            { ActionName: "discuit:delete:own", Description: "Kendi discuit'ini silme" },
            { ActionName: "discuit:delete:any", Description: "Herhangi bir discuit'i silme (Admin)" },
            { ActionName: "post:create", Description: "Yeni bir gönderi oluşturma" },
            { ActionName: "post:vote", Description: "Gönderilere oy verme" },
            { ActionName: "post:edit:own", Description: "Kendi gönderisini düzenleme" },
            { ActionName: "post:delete:own", Description: "Kendi gönderisini silme" },
            { ActionName: "post:delete:any", Description: "Herhangi bir gönderiyi silme (Admin/Mod)" },
            { ActionName: "comment:create", Description: "Yorum yapma" },
            { ActionName: "comment:edit:own", Description: "Kendi yorumunu düzenleme" },
            { ActionName: "comment:delete:own", Description: "Kendi yorumunu silme" },
            { ActionName: "comment:delete:any", Description: "Herhangi bir yorumu silme (Admin/Mod)" },
            { ActionName: "user:assign-role", Description: "Kullanıcılara rol atama (Admin)" },
            { ActionName: "role:create", Description: "Yeni rol oluşturma (Admin)" },
            { ActionName: "role:edit", Description: "Rollerin izinlerini düzenleme (Admin)" }
        ];

        await this.permissionModel.insertMany(permissions);
    }


    private async seedRoles() {
        const roleInDb = await this.roleModel.estimatedDocumentCount();

        if (roleInDb > 0) {
            return;
        }

        const allPermissions = await this.permissionModel.find().exec();

        const permissions = ["discuit:create", "discuit:follow", "discuit:unfollow",
            "discuit:edit:own", "discuit:delete:own",
            "post:create", "post:vote",
            "post:edit:own", "post:delete:own",
            "comment:create", "comment:edit:own", "comment:delete:own"]

        const userPermissions = await this.permissionModel.find({ ActionName: { $in: permissions } }).exec();

        const roles = [
            {
                _id: '68e520f0c59202573b0ed318',
                RoleName: "Admin",
                Description: "Sistemin tüm izinlerine sahip kullanıcı",
                Scope: "System",
                Permissions: allPermissions,
                CreatedAt: [new Date()],
                CreatedBy: [0],
            },
            {
                _id: '68e520f0c59202573b0ed319',
                RoleName: "User",
                Description: "Temel kullanıcı rolü",
                Scope: "General",
                Permissions: userPermissions,
                CreatedAt: [new Date()],
                CreatedBy: [0]
            }
        ]

        await this.roleModel.insertMany(roles);
    }


    private async seedTopics(){
         const topicsInDb = await this.topicModel.estimatedDocumentCount();

        if (topicsInDb > 0) {
            return;
        }

      const topics = [
        // 🧠 Teknoloji & Bilim
        { name: "Artificial Intelligence", slug: "artificial-intelligence" },
        { name: "Machine Learning", slug: "machine-learning" },
        { name: "Deep Learning", slug: "deep-learning" },
        { name: "Computer Vision", slug: "computer-vision" },
        { name: "Natural Language Processing", slug: "nlp" },
        { name: "Data Science", slug: "data-science" },
        { name: "Cybersecurity", slug: "cybersecurity" },
        { name: "Software Engineering", slug: "software-engineering" },
        { name: "Web Development", slug: "web-development" },
        { name: "Mobile Development", slug: "mobile-development" },
        { name: "Cloud Computing", slug: "cloud-computing" },
        { name: "DevOps", slug: "devops" },

        // 💼 İş & Eğitim
        { name: "Startups", slug: "startups" },
        { name: "Entrepreneurship", slug: "entrepreneurship" },
        { name: "Product Management", slug: "product-management" },
        { name: "Finance", slug: "finance" },
        { name: "Investing", slug: "investing" },
        { name: "Career Advice", slug: "career-advice" },

        // 🎨 Sanat & Yaratıcılık
        { name: "Graphic Design", slug: "graphic-design" },
        { name: "Photography", slug: "photography" },
        { name: "Music Production", slug: "music-production" },
        { name: "Writing", slug: "writing" },

        // ⚽ Spor & Sağlık
        { name: "Football", slug: "football" },
        { name: "Basketball", slug: "basketball" },
        { name: "Fitness", slug: "fitness" },
        { name: "Nutrition", slug: "nutrition" },

        // 🎮 Eğlence
        { name: "Movies", slug: "movies" },
        { name: "Gaming", slug: "gaming" },
        { name: "Anime", slug: "anime" },
        { name: "Books", slug: "books" },

        // 🧩 Programlama Dilleri
        { name: "JavaScript", slug: "javascript" },
        { name: "TypeScript", slug: "typescript" },
        { name: "Python", slug: "python" },
        { name: "C#", slug: "csharp" },
        { name: "Go", slug: "go" },
        { name: "Rust", slug: "rust" }
    ];

        await this.topicModel.insertMany(topics);
    }
}
