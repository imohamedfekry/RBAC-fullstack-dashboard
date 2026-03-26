import { Module } from '@nestjs/common';
import { GlobalModules } from './Module/global-modules/global-modules.module';
import { DefaultModule } from './Module/default/default.module';

@Module({
  imports: [GlobalModules, DefaultModule],
})
export class AppModule {}
