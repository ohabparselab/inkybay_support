import { seedUserModulePermissions } from "./seeders/userModulePermissions.seeder.ts";
import { seedPermissions } from "./seeders/permissions.seeder.ts";
import { seedModules } from "./seeders/modules.seeder.ts";
import { seedClients } from "./seeders/clients.seeder.ts";
import { seedRoles } from "./seeders/roles.seeder.ts";
import { seedUsers } from "./seeders/users.seeder.ts";
import { seedProjects } from "./seeders/projects.seeder.ts";
import { seedPlatforms } from "./seeders/platforms.seeder.ts";

async function runSeeders() {
  console.log("🌱 Seeding database...");

  await seedRoles();
  await seedPermissions();
  await seedModules();
  await seedUsers();
  await seedUserModulePermissions();
  await seedClients();
  await seedProjects();
  await seedPlatforms();

  console.log("🎉 Database seeded successfully!");
}

runSeeders()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
