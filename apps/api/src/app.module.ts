import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { ClassesModule } from "./modules/classes/classes.module";
import { AssignmentsModule } from "./modules/assignments/assignments.module";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { GradesModule } from "./modules/grades/grades.module";
import { RubricsModule } from "./modules/rubrics/rubrics.module";
import { EventsModule } from "./modules/events/events.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { ContentModule } from "./modules/content/content.module";
import { FilesModule } from "./modules/files/files.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClassesModule,
    AssignmentsModule,
    SubmissionsModule,
    GradesModule,
    RubricsModule,
    EventsModule,
    HealthModule,
    MetricsModule,
    ContentModule,
    FilesModule
  ]
})
export class AppModule {}
